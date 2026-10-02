-- شغّل هذا الملف بعد 001_debtbook_schema.sql.
-- يسمح فقط للمستخدمين المسجلين في Supabase Auth بالوصول إلى بيانات دفتر الزهوب.
-- لا يفتح البيانات للزائر anon.

create policy "authenticated clients read"
on public.debtbook_clients for select to authenticated using (true);
create policy "authenticated clients insert"
on public.debtbook_clients for insert to authenticated with check (true);
create policy "authenticated clients update"
on public.debtbook_clients for update to authenticated using (true) with check (true);
create policy "authenticated clients delete"
on public.debtbook_clients for delete to authenticated using (true);

create policy "authenticated products read"
on public.debtbook_products for select to authenticated using (true);
create policy "authenticated products insert"
on public.debtbook_products for insert to authenticated with check (true);
create policy "authenticated products update"
on public.debtbook_products for update to authenticated using (true) with check (true);
create policy "authenticated products delete"
on public.debtbook_products for delete to authenticated using (true);

create policy "authenticated invoices read"
on public.debtbook_invoices for select to authenticated using (true);
create policy "authenticated invoices insert"
on public.debtbook_invoices for insert to authenticated with check (true);
create policy "authenticated invoices update"
on public.debtbook_invoices for update to authenticated using (true) with check (true);
create policy "authenticated invoices delete"
on public.debtbook_invoices for delete to authenticated using (true);

create policy "authenticated invoice lines read"
on public.debtbook_invoice_lines for select to authenticated using (true);
create policy "authenticated invoice lines insert"
on public.debtbook_invoice_lines for insert to authenticated with check (true);
create policy "authenticated invoice lines update"
on public.debtbook_invoice_lines for update to authenticated using (true) with check (true);
create policy "authenticated invoice lines delete"
on public.debtbook_invoice_lines for delete to authenticated using (true);
