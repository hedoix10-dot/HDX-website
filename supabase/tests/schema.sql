-- Run after the migration on a disposable PostgreSQL database with Supabase
-- roles and a storage.buckets fixture. This rolls back all test data.
begin;
create function pg_temp.check_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'Check failed: %', label; end if; end; $$;

select pg_temp.check_true(not has_table_privilege('anon', 'public.hdx_contacts', 'SELECT'), 'anonymous contacts access denied');
select pg_temp.check_true(not has_table_privilege('authenticated', 'public.hdx_email_outbox', 'SELECT'), 'authenticated queue access denied');
select pg_temp.check_true(not has_function_privilege('anon', 'public.hdx_claim_emails(integer)', 'EXECUTE'), 'anonymous queue RPC denied');
select pg_temp.check_true((select relrowsecurity from pg_class where oid = 'public.hdx_products'::regclass), 'products RLS enabled');
select pg_temp.check_true((select not public from storage.buckets where id = 'hdx-private-files'), 'paid bucket private');

insert into public.hdx_products(title, category) values ('Manual product', 'ebook');
set local role service_role;
select public.hdx_sync_baserow_products('[{"baserow_id":11,"title":"Free ebook","description":"","category":"ebook","section":"education","language":"pl/nl","price":0,"published":true}]'::jsonb);
reset role;
select pg_temp.check_true((select count(*) = 2 from public.hdx_products), 'sync preserves native products');

create temporary table previous_product as select id from public.hdx_products where baserow_id = 11;
select public.hdx_sync_baserow_products('[{"baserow_id":11,"title":"Updated ebook","description":"","category":"ebook","section":"education","language":"pl/nl","price":0,"published":false}]'::jsonb);
select pg_temp.check_true((select p.id = prev.id and not p.published from public.hdx_products p, previous_product prev where p.baserow_id = 11), 'sync preserves ID and withdraws unpublished product');

do $$ begin
  begin
    perform public.hdx_sync_baserow_products('[{"baserow_id":11,"title":"Broken","description":"","category":"ebook","section":"education","language":"pl","price":-1,"published":true}]'::jsonb);
    raise exception 'Invalid snapshot was accepted';
  exception when check_violation then null; end;
end; $$;
select pg_temp.check_true((select title = 'Updated ebook' from public.hdx_products where baserow_id = 11), 'bad snapshot rolls back');
select public.hdx_sync_baserow_products('[]'::jsonb);
select pg_temp.check_true((select count(*) = 1 and bool_and(source = 'manual') from public.hdx_products), 'deleted Baserow products disappear, native products preserved');

insert into public.hdx_contacts(submission_id,name,email,message,language,consent,consent_version,source,confirmation_subject,confirmation_body)
values ('e9dc73f7-ff35-4b05-bef6-00e5abc90e4a','Test','test@example.com','Test','pl',true,'2026-10-12','website_contact','Receipt','Received');
insert into public.hdx_contacts(submission_id,name,email,message,language,consent,consent_version,source,confirmation_subject,confirmation_body)
values ('e9dc73f7-ff35-4b05-bef6-00e5abc90e4a','Test','test@example.com','Test','pl',true,'2026-10-12','website_contact','Receipt','Received') on conflict (submission_id) do nothing;
select pg_temp.check_true((select count(*) = 1 from public.hdx_email_outbox), 'duplicate submission queues only one receipt');

create temporary table claimed as select * from public.hdx_claim_emails(10);
select pg_temp.check_true((select count(*) = 1 from claimed), 'first worker claims receipt');
select pg_temp.check_true((select count(*) = 0 from public.hdx_claim_emails(10)), 'another worker cannot claim leased receipt');
select pg_temp.check_true(not public.hdx_finish_email((select id from claimed),gen_random_uuid(),true), 'wrong lease cannot mark receipt sent');
select public.hdx_finish_email(id,lock_token,true) from claimed;
select pg_temp.check_true((select bool_and(confirmation_sent and confirmation_sent_at is not null) from public.hdx_contacts), 'successful receipt updates contact');

insert into public.hdx_contacts(submission_id,name,email,message,language,consent,consent_version,source,confirmation_subject,confirmation_body)
values ('e9dc73f7-ff35-4b05-bef6-00e5abc90e4b','Test','other@example.com','Test','pl',true,'2026-10-12','website_contact','Receipt','Received');
update public.hdx_contacts set consent = false where email = 'other@example.com';
select pg_temp.check_true((select count(*) = 0 from public.hdx_claim_emails(10)), 'withdrawn consent prevents queued email');
rollback;
