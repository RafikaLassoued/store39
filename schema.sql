-- =========================================
-- E-COMMERCE STORE DATABASE SCHEMA
-- Generated from project code analysis
-- =========================================

-- =========================================
-- EXTENSIONS
-- =========================================
create extension if not exists "pgcrypto";

-- =========================================
-- STORE SETTINGS
-- =========================================
create table if not exists public.store_settings (
  key text primary key,
  value text not null default ''
);

-- =========================================
-- COUPONS
-- =========================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount numeric not null,
  type text not null check (type in ('percentage', 'fixed')),
  min_order numeric not null default 0,
  max_uses int not null default 100,
  used_count int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- =========================================
-- CMS PAGES
-- =========================================
create table if not exists public.cms_pages (
  slug text primary key,
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- =========================================
-- ORDERS
-- =========================================
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'in_warehouse', 'in_delivery', 'delivered', 'returned')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_name on public.orders (customer_name);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- =========================================
-- CATEGORIES
-- =========================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  image text,
  created_at timestamptz default now()
);

-- =========================================
-- PRODUCTS
-- =========================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  name_en text,
  slug text unique,

  description text,
  price numeric not null,
  old_price numeric,

  category_id uuid references public.categories(id) on delete set null,

  sizes text[],
  colors jsonb,
  images text[],

  is_new boolean default true,
  rating numeric default 5,
  review_count int default 0,

  in_stock boolean default true,
  featured boolean default false,

  created_at timestamptz default now()
);

create index if not exists idx_products_category on public.products(category_id);

-- =========================================
-- SOCIAL LINKS
-- =========================================
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  facebook text,
  instagram text,
  tiktok text,
  whatsapp text,
  updated_at timestamptz default now()
);

-- =========================================
-- ANALYTICS SETTINGS
-- =========================================
create table if not exists public.analytics_settings (
  id uuid primary key default gen_random_uuid(),

  facebook_pixel_id text,
  is_facebook_enabled boolean default false,

  google_analytics_id text,
  is_google_enabled boolean default false,

  tiktok_pixel_id text,
  is_tiktok_enabled boolean default false,

  created_at timestamptz default now()
);

-- =========================================
-- ANALYTICS EVENTS
-- =========================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),

  event_name text not null,
  user_id text,
  product_id uuid references public.products(id) on delete set null,

  source text,
  metadata jsonb,

  created_at timestamptz default now()
);

create index if not exists idx_events_name on public.analytics_events(event_name);

-- =========================================
-- DELIVERY COMPANIES
-- =========================================
create table if not exists public.delivery_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  api_key text,
  api_url text,
  is_active boolean default true,
  logo text,
  created_at timestamptz default now()
);

-- =========================================
-- DELIVERY PRICING
-- =========================================
create table if not exists public.delivery_pricing (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.delivery_companies(id) on delete cascade,
  wilaya_code int not null,
  home_price numeric not null,
  office_price numeric not null,
  commune_price numeric not null,
  created_at timestamptz default now()
);

create index if not exists idx_delivery_pricing_company on public.delivery_pricing(company_id);

-- =========================================
-- ORDER ITEMS (for detailed orders)
-- =========================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null,
  price numeric not null,
  selected_size text,
  selected_color jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- =========================================
-- ENABLE RLS
-- =========================================
alter table public.store_settings enable row level security;
alter table public.coupons enable row level security;
alter table public.cms_pages enable row level security;
alter table public.orders enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.social_links enable row level security;
alter table public.analytics_settings enable row level security;
alter table public.analytics_events enable row level security;
alter table public.delivery_companies enable row level security;
alter table public.delivery_pricing enable row level security;
alter table public.order_items enable row level security;

-- =========================================
-- PUBLIC POLICIES
-- =========================================

drop policy if exists "public read cms" on public.cms_pages;
create policy "public read cms"
on public.cms_pages for select
using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories"
on public.categories for select
using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products for select
using (true);

drop policy if exists "public read coupons" on public.coupons;
create policy "public read coupons"
on public.coupons for select
using (true);

drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders"
on public.orders for insert
using (true);

drop policy if exists "public read store settings" on public.store_settings;
create policy "public read store settings"
on public.store_settings for select
using (true);

drop policy if exists "public read delivery companies" on public.delivery_companies;
create policy "public read delivery companies"
on public.delivery_companies for select
using (true);

drop policy if exists "public read delivery pricing" on public.delivery_pricing;
create policy "public read delivery pricing"
on public.delivery_pricing for select
using (true);

drop policy if exists "public read order items" on public.order_items;
create policy "public read order items"
on public.order_items for select
using (true);

-- =========================================
-- ADMIN POLICIES
-- =========================================

drop policy if exists "admin store settings" on public.store_settings;
create policy "admin store settings"
on public.store_settings for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin orders" on public.orders;
create policy "admin orders"
on public.orders for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin coupons" on public.coupons;
create policy "admin coupons"
on public.coupons for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin cms" on public.cms_pages;
create policy "admin cms"
on public.cms_pages for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin products" on public.products;
create policy "admin products"
on public.products for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin categories" on public.categories;
create policy "admin categories"
on public.categories for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin social" on public.social_links;
create policy "admin social"
on public.social_links for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin analytics settings" on public.analytics_settings;
create policy "admin analytics settings"
on public.analytics_settings for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin analytics events" on public.analytics_events;
create policy "admin analytics events"
on public.analytics_events for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin delivery companies" on public.delivery_companies;
create policy "admin delivery companies"
on public.delivery_companies for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin delivery pricing" on public.delivery_pricing;
create policy "admin delivery pricing"
on public.delivery_pricing for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "admin order items" on public.order_items;
create policy "admin order items"
on public.order_items for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- =========================================
-- SEED DATA
-- =========================================

insert into public.store_settings(key, value) values
('admin_secret_path', '/admin-secret-x9k2'),
('facebook_pixel_enabled', 'false'),
('google_analytics_enabled', 'false')
on conflict (key) do nothing;

insert into public.cms_pages(slug, title, content) values
('about', 'من نحن', ''),
('contact', 'اتصل بنا', ''),
('return-policy', 'سياسة الإرجاع', ''),
('terms', 'شروط الاستخدام', '')
on conflict (slug) do nothing;