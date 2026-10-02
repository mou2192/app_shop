-- دفتر الزهوب: مخطط قاعدة البيانات للمزامنة بين الأجهزة
-- شغّل هذا الملف كاملًا مرة واحدة في Supabase SQL Editor.
-- مفتاح service_role يتجاوز RLS ويجب أن يبقى على الخادم فقط.

create extension if not exists pgcrypto;

-- تحديث تلقائي لحقل updated_at
create or replace function public.debtbook_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- العملاء
create table if not exists public.debtbook_clients (
  id text primary key,
  workspace_id text not null default 'default',
  name text not null,
  phone text not null default '',
  balance numeric(12,2) not null default 0,
  avatar text not null default '',
  tone text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الأصناف والمنتجات
create table if not exists public.debtbook_products (
  id text primary key,
  workspace_id text not null default 'default',
  name text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category text not null default 'أصناف جديدة',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الفواتير وسندات القبض
-- kind = invoice للفواتير، و receipt لسندات القبض
create table if not exists public.debtbook_invoices (
  id text primary key,
  workspace_id text not null default 'default',
  client_id text not null references public.debtbook_clients(id) on update cascade on delete restrict,
  kind text not null default 'invoice' check (kind in ('invoice', 'receipt')),
  issued_at timestamptz not null default now(),
  status text not null default 'معلقة' check (status in ('مدفوعة', 'معلقة')),
  total numeric(12,2) not null default 0 check (total >= 0),
  due numeric(12,2) not null default 0 check (due >= 0),
  previous_balance numeric(12,2) not null default 0 check (previous_balance >= 0),
  receipt_amount numeric(12,2) check (receipt_amount is null or receipt_amount >= 0),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- أصناف كل فاتورة، حتى تظهر عدة أصناف مع السعر والكمية
create table if not exists public.debtbook_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null default 'default',
  invoice_id text not null references public.debtbook_invoices(id) on update cascade on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0 check (price >= 0),
  qty integer not null default 1 check (qty > 0),
  created_at timestamptz not null default now()
);

-- فهارس تسريع البحث والمزامنة
create index if not exists debtbook_clients_workspace_idx on public.debtbook_clients(workspace_id);
create index if not exists debtbook_products_workspace_idx on public.debtbook_products(workspace_id);
create index if not exists debtbook_invoices_workspace_idx on public.debtbook_invoices(workspace_id);
create index if not exists debtbook_invoices_client_idx on public.debtbook_invoices(client_id);
create index if not exists debtbook_invoice_lines_invoice_idx on public.debtbook_invoice_lines(invoice_id);
create index if not exists debtbook_invoice_lines_workspace_idx on public.debtbook_invoice_lines(workspace_id);

-- مشغلات التحديث
 drop trigger if exists debtbook_clients_updated_at on public.debtbook_clients;
create trigger debtbook_clients_updated_at
before update on public.debtbook_clients
for each row execute function public.debtbook_set_updated_at();

 drop trigger if exists debtbook_products_updated_at on public.debtbook_products;
create trigger debtbook_products_updated_at
before update on public.debtbook_products
for each row execute function public.debtbook_set_updated_at();

 drop trigger if exists debtbook_invoices_updated_at on public.debtbook_invoices;
create trigger debtbook_invoices_updated_at
before update on public.debtbook_invoices
for each row execute function public.debtbook_set_updated_at();

-- الحماية: لا نفتح الجداول للعامة.
-- API الخادم باستخدام service_role يستطيع القراءة والكتابة، بينما anon لا يستطيع.
alter table public.debtbook_clients enable row level security;
alter table public.debtbook_products enable row level security;
alter table public.debtbook_invoices enable row level security;
alter table public.debtbook_invoice_lines enable row level security;

-- لا تضف سياسات عامة هنا. أضف سياسات مرتبطة بـ auth.uid() لاحقًا عند تفعيل تسجيل الدخول.

comment on table public.debtbook_clients is 'عملاء دفتر الزهوب';
comment on table public.debtbook_products is 'أصناف ومنتجات دفتر الزهوب';
comment on table public.debtbook_invoices is 'الفواتير وسندات القبض';
comment on table public.debtbook_invoice_lines is 'تفاصيل الأصناف داخل كل فاتورة';
