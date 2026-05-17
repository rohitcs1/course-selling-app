-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  heading text not null,
  description text not null,
  price integer not null check (price > 0),
  thumbnail_url text,
  duration text,
  level text,
  drive_link text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete restrict,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  amount integer not null check (amount > 0),
  status text not null check (status in ('created', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  drive_link text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table if exists public.enrollments
  add column if not exists drive_link text;

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  email_type text not null,
  sent_status text not null check (sent_status in ('sent', 'failed')),
  provider_message_id text,
  error_text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_course_id on public.orders(course_id);
create index if not exists idx_orders_razorpay_order_id on public.orders(razorpay_order_id);
create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_email_logs_user_id on public.email_logs(user_id);
create index if not exists idx_admin_users_username on public.admin_users(username);

insert into public.admin_users (username, password_hash, is_active)
values (
  'rohitcs175@gmail.com',
  encode(digest('Kali@8320191025', 'sha256'), 'hex'),
  true
)
on conflict (username) do update
set password_hash = excluded.password_hash,
    is_active = excluded.is_active;

insert into public.courses (
  id,
  title,
  heading,
  description,
  price,
  thumbnail_url,
  duration,
  level,
  drive_link,
  is_published
)
values
(
  'ig-growth-blueprint',
  'Instagram Growth Blueprint',
  'From 0 to Sales-Ready Audience',
  'Learn practical growth, content hooks, ad creatives, and DM-to-sale methods.',
  2999,
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
  '6 Weeks',
  'Beginner to Intermediate',
  'https://drive.google.com/drive/folders/your-course-folder-id',
  true
)
on conflict (id) do nothing;

insert into public.courses (
  id,
  title,
  heading,
  description,
  price,
  thumbnail_url,
  duration,
  level,
  drive_link,
  is_published
)
values
(
  'reels-conversion-mastery',
  'Reels Conversion Mastery',
  'Create Reels That Bring Paid Students',
  'Master short-form scripting, reel editing flow, and conversion-focused CTA strategy.',
  3999,
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  '4 Weeks',
  'All Levels',
  'https://drive.google.com/drive/folders/your-second-course-folder-id',
  true
)
on conflict (id) do nothing;
