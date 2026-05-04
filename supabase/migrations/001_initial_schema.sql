create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  role_name text not null unique check (role_name in ('owner', 'manager', 'staff')),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  admin_role_id uuid not null references public.admin_roles(id),
  full_name text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  allow_free_options boolean,
  free_toppings_count integer not null default 0 check (free_toppings_count >= 0),
  free_sauces_count integer not null default 0 check (free_sauces_count >= 0),
  free_extras_count integer not null default 0 check (free_extras_count >= 0),
  free_strategy text not null default 'cheapest' check (free_strategy in ('cheapest','priority')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  vat_rate numeric(5,2) not null check (vat_rate in (7.00, 19.00)),
  allow_free_options boolean,
  free_toppings_count integer not null default 0 check (free_toppings_count >= 0),
  free_sauces_count integer not null default 0 check (free_sauces_count >= 0),
  free_extras_count integer not null default 0 check (free_extras_count >= 0),
  free_strategy text not null default 'cheapest' check (free_strategy in ('cheapest','priority')),
  is_new boolean not null default false,
  is_recommended boolean not null default false,
  is_daily_special boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.option_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  group_type text not null check (group_type in ('topping', 'sauce', 'extra')),
  free_quantity integer not null default 0 check (free_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references public.option_groups(id),
  "group" text not null check ("group" in ('toppings', 'sauces', 'extras')),
  name text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  vat_rate numeric(5,2) not null check (vat_rate in (7.00, 19.00)),
  free_eligible boolean not null default true,
  free_priority integer check (free_priority >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (option_group_id, name)
);

create table if not exists public.product_option_rules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  option_group_id uuid not null references public.option_groups(id),
  free_quantity_override integer check (free_quantity_override >= 0),
  max_quantity integer check (max_quantity is null or max_quantity > 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, option_group_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value integer not null check (value >= 0),
  min_order_cents integer not null default 0 check (min_order_cents >= 0),
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text,
  pickup_time timestamptz not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'ready', 'cancelled')),
  coupon_id uuid references public.coupons(id),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  tax_7_cents integer not null default 0 check (tax_7_cents >= 0),
  tax_19_cents integer not null default 0 check (tax_19_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  stripe_payment_id text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  vat_rate numeric(5,2) not null check (vat_rate in (7.00, 19.00)),
  line_subtotal_cents integer not null check (line_subtotal_cents >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id),
  option_id uuid not null references public.options(id),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  is_free boolean not null default false,
  free_reason text not null default 'charged' check (
    free_reason in (
      'free_by_priority',
      'charged_not_free_eligible',
      'charged_priority_limit',
      'charged'
    )
  ),
  line_total_cents integer not null default 0 check (line_total_cents >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id),
  invoice_number text not null unique,
  pdf_url text not null,
  net_cents integer not null check (net_cents >= 0),
  tax_7_cents integer not null default 0 check (tax_7_cents >= 0),
  tax_19_cents integer not null default 0 check (tax_19_cents >= 0),
  gross_cents integer not null check (gross_cents >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  stripe_payment_id text not null unique,
  stripe_checkout_session_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_exports (
  id uuid primary key default gen_random_uuid(),
  export_date date not null,
  csv_url text not null,
  generated_by uuid references public.admins(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (export_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admins(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  content_value jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_text text not null,
  quote_author text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (weekday)
);

create or replace function public.is_admin_with_roles(allowed_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admins a
    join public.admin_roles ar on ar.id = a.admin_role_id
    where a.user_id = auth.uid()
      and a.active = true
      and ar.active = true
      and ar.role_name = any (allowed_roles)
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select public.is_admin_with_roles(array['owner']);
$$;

create or replace function public.is_manager_or_owner()
returns boolean
language sql
stable
as $$
  select public.is_admin_with_roles(array['owner', 'manager']);
$$;

create or replace function public.is_staff_or_higher()
returns boolean
language sql
stable
as $$
  select public.is_admin_with_roles(array['owner', 'manager', 'staff']);
$$;

-- updated_at triggers
DO $$
declare
  r record;
begin
  for r in
    select table_schema, table_name
    from information_schema.columns
    where table_schema = 'public' and column_name = 'updated_at'
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at_%I on %I.%I;',
      r.table_name,
      r.table_schema,
      r.table_name
    );

    execute format(
      'create trigger trg_set_updated_at_%I before update on %I.%I for each row execute function public.set_updated_at();',
      r.table_name,
      r.table_schema,
      r.table_name
    );
  end loop;
end
$$;

alter table public.admin_roles enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.option_groups enable row level security;
alter table public.options enable row level security;
alter table public.product_option_rules enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_options enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.daily_exports enable row level security;
alter table public.audit_logs enable row level security;
alter table public.site_content enable row level security;
alter table public.quotes enable row level security;
alter table public.opening_hours enable row level security;

-- Public read-only policies
create policy "public can read active categories" on public.categories
for select using (active = true);

create policy "public can read active products" on public.products
for select using (active = true);

create policy "public can read active options" on public.options
for select using (active = true);

create policy "public can read active option groups" on public.option_groups
for select using (active = true);

create policy "public can read active opening hours" on public.opening_hours
for select using (active = true);

create policy "public can read active quotes" on public.quotes
for select using (active = true);

-- Owner full access
DO $$
declare
  t text;
  tables text[] := array[
    'admin_roles','admins','categories','products','product_images','option_groups','options','product_option_rules',
    'coupons','orders','order_items','order_item_options','invoices','payments','daily_exports','audit_logs',
    'site_content','quotes','opening_hours'
  ];
begin
  foreach t in array tables
  loop
    execute format('create policy "owner read %s" on public.%I for select using (public.is_owner());', t, t);
    execute format('create policy "owner insert %s" on public.%I for insert with check (public.is_owner());', t, t);
    execute format('create policy "owner update %s" on public.%I for update using (public.is_owner()) with check (public.is_owner());', t, t);
  end loop;
end
$$;

-- Manager permissions
create policy "manager can manage catalog" on public.categories
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage products" on public.products
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage product images" on public.product_images
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage option groups" on public.option_groups
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage options" on public.options
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage product option rules" on public.product_option_rules
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage coupons" on public.coupons
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage site content" on public.site_content
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage quotes" on public.quotes
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
create policy "manager can manage opening hours" on public.opening_hours
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

-- Staff order visibility + status updates only
create policy "staff can read orders" on public.orders
for select using (public.is_staff_or_higher());
create policy "staff can update order status" on public.orders
for update using (public.is_staff_or_higher())
with check (
  public.is_staff_or_higher()
  and customer_name = (select customer_name from public.orders o where o.id = orders.id)
  and customer_phone is not distinct from (select customer_phone from public.orders o where o.id = orders.id)
  and pickup_time = (select pickup_time from public.orders o where o.id = orders.id)
  and notes is not distinct from (select notes from public.orders o where o.id = orders.id)
  and coupon_id is not distinct from (select coupon_id from public.orders o where o.id = orders.id)
  and subtotal_cents = (select subtotal_cents from public.orders o where o.id = orders.id)
  and discount_cents = (select discount_cents from public.orders o where o.id = orders.id)
  and tax_7_cents = (select tax_7_cents from public.orders o where o.id = orders.id)
  and tax_19_cents = (select tax_19_cents from public.orders o where o.id = orders.id)
  and total_cents = (select total_cents from public.orders o where o.id = orders.id)
  and stripe_payment_id is not distinct from (select stripe_payment_id from public.orders o where o.id = orders.id)
);

create policy "staff can read order items" on public.order_items
for select using (public.is_staff_or_higher());
create policy "staff can read order item options" on public.order_item_options
for select using (public.is_staff_or_higher());

-- Explicitly no direct customer inserts into orders: only admin roles/service-role may insert.
create policy "only owner manager can insert orders" on public.orders
for insert with check (public.is_manager_or_owner() or public.is_owner());
