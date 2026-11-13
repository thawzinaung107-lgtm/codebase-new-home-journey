CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ select _user_id is not null and _user_id = auth.uid() and exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;