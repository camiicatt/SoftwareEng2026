/*
  Sunset Vinyl — Database Schema

  This file documents:
  1. Current Supabase tables already in use by the application
  2. The finalized product/item model
  3. Customer profile storage linked to Supabase Auth

  NOTE:
  - Authentication is managed by Supabase Auth (auth.users)
  - No statements in this file are auto-run
*/

-- =========================================================
-- EXISTING TABLES (Already in Supabase)
-- =========================================================

-- Products table
-- Used by frontend shop + backend /products endpoints
CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT,
  description TEXT,
  price DOUBLE PRECISION,
  quantity BIGINT,
  image_url TEXT,
  category TEXT, -- vinyl | instrument
  genre TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

-- Vinyls table (legacy / reference)
-- Some vinyl data exists here, but products is the primary table
CREATE TABLE vinyls (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

-- Admins table
-- Used for admin access control
CREATE TABLE admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL
);

-- Customers table
-- Stores customer profile data linked to Supabase Auth
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  marketing_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key:
-- customers.id references auth.users.id

-- Orders table
-- Represents a completed checkout
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  total_price DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL,
  discount_code TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
);

-- Order items table
-- Individual products inside an order
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DOUBLE PRECISION NOT NULL
);

-- Discount codes table
CREATE TABLE discount_codes (
  code TEXT PRIMARY KEY,
  percentage INT,
  active BOOLEAN,
  expires_at TIMESTAMPTZ
);

-- =========================================================
-- AUTHENTICATION (Supabase Managed)
-- =========================================================

-- Users/customers are stored in Supabase Auth
-- Table: auth.users
-- Primary key: auth.users.id (UUID)

-- orders.user_id should correspond to the authenticated user
-- customers.id should correspond to auth.users.id