const express = require("express");
const router = express.Router();
const db = require("../../database/db.js");

const TAX_RATE = 0.08; // 8% tax

function calculateOrderTotal(items, discountPercent = 0) {
    const subtotal = items.reduce((sum, item) => {
        return sum + item.price_at_purchase * item.quantity;
    }, 0);

    const discountAmount = subtotal * (discountPercent / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + tax;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
    };
}

router.get("/", async (req, res) => {
    try {
        const { data, error } = await db.supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ error: "Failed to fetch orders" });
    }
});

router.get("/sort/:field", async (req, res) => {
    const validFields = ["created_at", "total_price", "status"];
    const field = req.params.field;

    if (!validFields.includes(field)) {
        return res.status(400).json({ error: "Invalid sort field" });
    }

    try {
        const { data, error } = await db.supabase
            .from("orders")
            .select("*")
            .order(field, { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ error: "Failed to fetch sorted orders" });
    }
});

router.post("/validate-discount", async (req, res) => {
    const { code } = req.body;

    try {
        const { data, error } = await db.supabase
            .from("discount_codes")
            .select("*")
            .eq("code", code)
            .eq("active", true)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: "Invalid or inactive discount code" });
        }

        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return res.status(400).json({ error: "Discount code has expired" });
        }

        return res.json({ valid: true, percentage: data.percentage });
    } catch (e) {
        return res.status(500).json({ error: "Failed to validate discount code" });
    }
});

router.post("/calculate", async (req, res) => {
    const { items, discountCode } = req.body;

    if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Items must be an array" });
    }

    try {
        let discountPercent = 0;

        if (discountCode) {
            const { data, error } = await db.supabase
                .from("discount_codes")
                .select("percentage, expires_at")
                .eq("code", discountCode)
                .eq("active", true)
                .maybeSingle();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (!data) {
                return res.status(404).json({ error: "Invalid or inactive discount code" });
            }

            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return res.status(400).json({ error: "Discount code has expired" });
            }

            discountPercent = data.percentage;
        }

        const totals = calculateOrderTotal(items, discountPercent);
        return res.json(totals);
    } catch (e) {
        return res.status(500).json({ error: "Failed to calculate order total" });
    }
});

router.post("/placeOrder", async (req, res) => {
    const { items, discountCode, status, user_id } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items must be a non-empty array" });
    }

    try {
        let discountPercent = 0;

        if (discountCode) {
            const { data, error } = await db.supabase
                .from("discount_codes")
                .select("percentage, expires_at")
                .eq("code", discountCode)
                .eq("active", true)
                .maybeSingle();

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (!data) {
                return res.status(404).json({ error: "Invalid or inactive discount code" });
            }

            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return res.status(400).json({ error: "Discount code has expired" });
            }

            discountPercent = data.percentage;
        }

        const totals = calculateOrderTotal(items, discountPercent);

        const { data: order, error: orderError } = await db.supabase
            .from("orders")
            .insert([
                {
                    user_id,
                    status: status || "pending",
                    discount_code: discountCode || null,
                    tax: totals.tax,
                    total_price: totals.total,
                },
            ])
            .select()
            .single();

        if (orderError) {
            return res.status(500).json({ error: orderError.message });
        }

        const orderItems = items.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
        }));

        const { error: itemsError } = await db.supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            return res.status(500).json({ error: itemsError.message });
        }

        return res.status(201).json({
            message: "Order created successfully",
            order,
            totals,
        });
    } catch (e) {
        console.error("POST /orders crash:", e);
        return res.status(500).json({
            error: "Failed to create order",
            details: e.message,
        });
    }
});

module.exports = router;