-- Step 1: Database Initialization and Row-Level Security (RLS) Migrations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Merchants Table
CREATE TABLE public.merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users (Staff / Operators) Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Table (Includes Vector Embeddings for AI Search)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    mrp DECIMAL(12, 2) NOT NULL CHECK (mrp > 0),
    selling_price DECIMAL(12, 2) NOT NULL CHECK (selling_price > 0 AND selling_price <= mrp),
    image_url TEXT,
    embedding VECTOR(1536), -- 1536-dimensional vector for OpenAI text-embedding-ada-002 / text-embedding-3-small
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Storefront Configurations Table (JSONB Theme & Layout)
CREATE TABLE public.storefront_configs (
    merchant_id UUID PRIMARY KEY REFERENCES public.merchants(id) ON DELETE CASCADE,
    config JSONB NOT NULL DEFAULT '{
        "theme": {
            "primary_color": "#0F172A",
            "secondary_color": "#F8FAFC",
            "font_family": "Inter",
            "border_radius": "0.5rem"
        },
        "navigation": [
            { "label": "Home", "link": "/" },
            { "label": "Shop All", "link": "/shop" }
        ],
        "sections": [
            {
                "id": "hero-section-1",
                "type": "hero",
                "title": "Welcome to Our Premium Store",
                "visible": true,
                "settings": {
                    "cta_text": "Shop New Arrivals",
                    "cta_link": "/shop",
                    "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                }
            },
            {
                "id": "grid-section-1",
                "type": "product_grid",
                "title": "Trending Now",
                "visible": true,
                "settings": {
                    "limit": 8,
                    "columns": 4
                }
            }
        ]
    }'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8. Customers Table
CREATE TABLE public.customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.9. Merchant Configurations Table
CREATE TABLE public.merchant_configurations (
    merchant_id UUID PRIMARY KEY REFERENCES public.merchants(id) ON DELETE CASCADE,
    merchant_name TEXT NOT NULL,
    currency_code TEXT NOT NULL CHECK (currency_code IN ('INR', 'USD', 'EUR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE public.orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(customer_id) ON DELETE SET NULL,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    order_total DECIMAL(12, 2) NOT NULL,
    order_status TEXT NOT NULL CHECK (order_status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
    payment_gateway TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Payment Gateways Table (Encrypted Credentials)
CREATE TABLE public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    gateway_type TEXT NOT NULL CHECK (gateway_type IN ('stripe', 'proxy_hook')),
    credentials JSONB NOT NULL, -- e.g., {"api_key": "sk_...", "webhook_secret": "..."}
    active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (merchant_id, gateway_type)
);

-- 7. Analytics Events Table (Clickstream data)
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view_item', 'add_to_cart', 'purchase_complete')),
    session_id TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    value DECIMAL(12, 2), -- Optional numerical value (e.g. order total or item price)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create secondary indexes for multi-tenant query acceleration
CREATE INDEX idx_products_merchant ON public.products(merchant_id);
CREATE INDEX idx_users_merchant ON public.users(merchant_id);
CREATE INDEX idx_orders_merchant ON public.orders(merchant_id);
CREATE INDEX idx_payment_gateways_merchant ON public.payment_gateways(merchant_id);
CREATE INDEX idx_analytics_events_merchant ON public.analytics_events(merchant_id);
CREATE INDEX idx_analytics_events_type_time ON public.analytics_events(event_type, created_at);
CREATE INDEX idx_categories_merchant ON public.categories(merchant_id);
CREATE INDEX idx_customers_merchant ON public.customers(merchant_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);

-- Create index for vector similarity search (IVFFlat or HNSW)
CREATE INDEX idx_products_embedding ON public.products USING hnsw (embedding vector_cosine_ops);


-- ==========================================
-- ROW-LEVEL SECURITY (RLS) CONFIGURATION
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_configurations ENABLE ROW LEVEL SECURITY;

-- Helper Function to resolve current user's merchant ID from JWT claims
CREATE OR REPLACE FUNCTION auth.current_merchant_id() 
RETURNS UUID AS $$
    SELECT NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'merchant_id', '')::uuid;
$$ LANGUAGE sql STABLE;

-- 1. Merchants Policies
-- Allow anyone to view merchant profiles (for storefront visitor resolution)
CREATE POLICY "Allow public select on merchants" 
ON public.merchants FOR SELECT USING (true);

-- Allow merchant owners/admins to update their merchant details
CREATE POLICY "Allow tenant updates on merchant profile" 
ON public.merchants FOR UPDATE 
USING (id = auth.current_merchant_id());

-- 2. Users Policies
-- Restrict access to tenant users
CREATE POLICY "Restrict user select to tenant" 
ON public.users FOR SELECT USING (merchant_id = auth.current_merchant_id());

CREATE POLICY "Restrict user insert to tenant" 
ON public.users FOR INSERT WITH CHECK (merchant_id = auth.current_merchant_id());

CREATE POLICY "Restrict user update to tenant" 
ON public.users FOR UPDATE USING (merchant_id = auth.current_merchant_id());

-- 2.5. Categories Policies
CREATE POLICY "Allow public select on categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow tenant mutations on categories" 
ON public.categories FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());

-- 3. Products Policies
-- Public can select products (visitor catalog search)
CREATE POLICY "Allow public select on products" 
ON public.products FOR SELECT USING (true);

-- Restrict creation/updating/deletion of products to tenant dashboard users
CREATE POLICY "Allow tenant mutations on products" 
ON public.products FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());

-- 4. Storefront Configs Policies
-- Public can read storefront config to load design styles
CREATE POLICY "Allow public select on storefront_configs" 
ON public.storefront_configs FOR SELECT USING (true);

-- Restrict configuration changes to tenant dashboard users
CREATE POLICY "Allow tenant update on storefront_configs" 
ON public.storefront_configs FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());

-- 5. Orders Policies
-- Tenant users can view/update their own merchant orders
CREATE POLICY "Allow tenant access to orders" 
ON public.orders FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());

-- Public can insert orders (checkout creation)
CREATE POLICY "Allow public orders creation" 
ON public.orders FOR INSERT WITH CHECK (true);

-- 6. Payment Gateways Policies
-- Extremely restrictive RLS policies for credentials (never visible to visitors, isolated per tenant)
CREATE POLICY "Restrict gateways to tenant" 
ON public.payment_gateways FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());

-- 7. Analytics Events Policies
-- Tenant dashboard can query reports
CREATE POLICY "Allow tenant access to analytics" 
ON public.analytics_events FOR SELECT 
USING (merchant_id = auth.current_merchant_id());

-- Public client can record visitor metrics
CREATE POLICY "Allow public event creation" 
ON public.analytics_events FOR INSERT WITH CHECK (true);


-- 8. Customers Policies
CREATE POLICY "Allow tenant access to customers" 
ON public.customers FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());


-- 9. Merchant Configurations Policies
CREATE POLICY "Allow public read on merchant_configurations" 
ON public.merchant_configurations FOR SELECT USING (true);

CREATE POLICY "Allow tenant mutations on merchant_configurations" 
ON public.merchant_configurations FOR ALL 
USING (merchant_id = auth.current_merchant_id())
WITH CHECK (merchant_id = auth.current_merchant_id());


-- ==========================================
-- AI VECTOR SIMILARITY QUERY FUNCTION
-- ==========================================
-- Safe vector search function that requires merchant isolation parameter
CREATE OR REPLACE FUNCTION search_tenant_products (
    p_merchant_id UUID,
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price DECIMAL(12, 2),
    image_url TEXT,
    similarity FLOAT
) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        1 - (p.embedding <=> query_embedding) AS similarity
    FROM public.products p
    WHERE p.merchant_id = p_merchant_id -- Mandatory multi-tenant isolation clause prior to distance comparison
      AND 1 - (p.embedding <=> query_embedding) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
