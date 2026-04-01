"use client"

import { useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientBrowser();

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await new Promise(resolve => setTimeout(resolve, 100));

      const { error: insertError } = await supabase
        .from('customers')
        .insert({
          id: data.user.id,
          email,
          full_name: `${firstName} ${lastName}`.trim(),
          marketing_opt_in: isChecked,
        });

      if (insertError) {
        setError("Failed to create customer account: " + insertError.message);
        setLoading(false);
        return;
      }

      router.push("/login");
    }

    setLoading(false);
  }

  return (
    <section className="pt-10 pb-20">
      <h1 className="text-4xl font-black uppercase tracking-tight text-center mb-8">Sign Up</h1>
      <form className="space-y-3" onSubmit={signUp}>
        <div className="w-full max-w-sm mx-auto space-y-6 border-4 border-black p-8 bg-[#F7E8D6]">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            placeholder="First Name"
            type="text"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            placeholder="Last Name"
            type="text"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="w-full border-2 border-black rounded p-2 bg-white"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            type="password"
            required
          />
          <button
            className="group w-full bg-black text-white py-2 rounded hover:bg-stone-800 disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            <span className="relative">
              {loading ? "Signing Up..." : "Sign Up"}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-current transition-all duration-150 group-hover:w-full" />
            </span>
          </button>
          <label className="mt-2 text-sm font-semibold text-black/70 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
              I want to receive updates and promotions via email.
          </label>
          <p className="mt-2 text-sm font-semibold text-black/70">
            Save your cart and manage your orders by creating an account.
          </p>
        </div>
      </form>
    </section>);
}