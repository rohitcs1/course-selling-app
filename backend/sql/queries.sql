-- Useful query snippets for reporting/admin.

-- 1) Total revenue from paid orders
select coalesce(sum(amount), 0) as total_revenue
from public.orders
where status = 'paid';

-- 2) Daily sales
select date_trunc('day', paid_at) as day, count(*) as total_orders, sum(amount) as revenue
from public.orders
where status = 'paid'
group by 1
order by 1 desc;

-- 3) Top selling courses
select c.title, count(o.id) as paid_orders, coalesce(sum(o.amount), 0) as revenue
from public.orders o
join public.courses c on c.id = o.course_id
where o.status = 'paid'
group by c.id, c.title
order by paid_orders desc, revenue desc;

-- 4) Enrollment list with email
select
  e.created_at as enrolled_at,
  u.name,
  u.email,
  c.title as course_title,
  c.drive_link
from public.enrollments e
join public.users u on u.id = e.user_id
join public.courses c on c.id = e.course_id
order by e.created_at desc;

-- 5) Failed email logs
select
  el.created_at,
  u.email,
  c.title,
  el.error_text
from public.email_logs el
join public.users u on u.id = el.user_id
join public.courses c on c.id = el.course_id
where el.sent_status = 'failed'
order by el.created_at desc;
