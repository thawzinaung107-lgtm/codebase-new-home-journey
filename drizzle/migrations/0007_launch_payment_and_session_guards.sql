ALTER TABLE public.courses ADD COLUMN price_approved boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.courses.price_approved IS 'Explicit owner approval of the current price; temporary prices keep payments closed.';
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (display_name) ON public.profiles TO authenticated;
COMMENT ON COLUMN public.profiles.email IS 'Auth-managed identity; browser updates forbidden.';
CREATE OR REPLACE FUNCTION public.lms_register_device(p_hash text, p_session text, p_name text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.registered_devices; n integer;
BEGIN
 IF auth.uid() IS NULL OR p_session IS NULL OR p_session IS DISTINCT FROM auth.jwt()->>'session_id' OR p_hash IS NULL OR p_hash !~ '^[a-f0-9]{64}$' OR p_name IS NULL OR length(trim(p_name))<1 OR length(p_name)>100 THEN RAISE EXCEPTION 'Invalid device registration or sign-in session'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 IF EXISTS(SELECT 1 FROM public.registered_devices WHERE user_id=auth.uid() AND session_id=p_session AND revoked_at IS NOT NULL) THEN RAISE EXCEPTION 'This device session was removed. Sign out and sign in again.'; END IF;
 SELECT * INTO d FROM public.registered_devices WHERE user_id=auth.uid() AND token_hash=p_hash AND session_id=p_session FOR UPDATE;
 IF FOUND THEN UPDATE public.registered_devices SET last_seen=now() WHERE id=d.id; RETURN d.id; END IF;
 SELECT count(*) INTO n FROM public.registered_devices WHERE user_id=auth.uid() AND revoked_at IS NULL;
 IF n>=2 THEN RAISE EXCEPTION 'Two devices are already registered. Remove a device before continuing.'; END IF;
 INSERT INTO public.registered_devices(user_id,token_hash,session_id,name) VALUES(auth.uid(),p_hash,p_session,trim(p_name)) RETURNING id INTO d.id; RETURN d.id;
END $$;
CREATE OR REPLACE FUNCTION public.lms_submit_order(p_course uuid,p_receipt text,p_reference text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.courses; result uuid;
BEGIN
 IF auth.uid() IS NULL OR p_reference IS NULL OR length(p_reference)>200 OR p_receipt IS NULL OR p_receipt NOT LIKE auth.uid()::text||'/%' THEN RAISE EXCEPTION 'Invalid payment submission'; END IF;
 SELECT * INTO c FROM public.courses WHERE id=p_course AND status='published' FOR SHARE;
 IF NOT FOUND OR NOT c.price_approved OR c.price_mmk IS NULL OR c.access_days IS NULL OR NOT EXISTS(SELECT 1 FROM public.academy_settings WHERE key='payment_instructions' AND published AND length(trim(value))>0) THEN RAISE EXCEPTION 'Payment details are not available yet'; END IF;
 INSERT INTO public.orders(user_id,course_id,amount_mmk,receipt_path,reference) VALUES(auth.uid(),c.id,c.price_mmk,p_receipt,p_reference) RETURNING id INTO result; RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.lms_issue_code(p_course uuid,p_student uuid,p_hash text,p_expires timestamptz) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
 IF p_student IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=p_student) THEN RAISE EXCEPTION 'Choose an existing assigned student'; END IF;
 IF p_hash IS NULL OR p_hash !~ '^[a-f0-9]{64}$' OR p_expires IS NULL OR p_expires<=clock_timestamp() THEN RAISE EXCEPTION 'Valid code expiry required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.courses WHERE id=p_course AND status='published' AND access_days IS NOT NULL) THEN RAISE EXCEPTION 'Published course access duration required'; END IF;
 INSERT INTO public.redeem_codes(course_id,assigned_to,code_hash,expires_at) VALUES(p_course,p_student,p_hash,p_expires) RETURNING id INTO result;
 INSERT INTO public.audit_events(actor_id,action,entity_id) VALUES(auth.uid(),'code.issued',result::text); RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.lms_redeem(p_hash text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.redeem_codes; days integer; result uuid; recent timestamptz[]; stamp timestamptz;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('redeem:'||auth.uid()::text,0));
 stamp:=clock_timestamp();
 INSERT INTO public.redemption_limits(user_id) VALUES(auth.uid()) ON CONFLICT DO NOTHING;
 SELECT COALESCE(array_agg(t ORDER BY t),'{}'::timestamptz[]) INTO recent FROM public.redemption_limits r CROSS JOIN LATERAL unnest(r.attempts) t WHERE r.user_id=auth.uid() AND t>stamp-interval '15 minutes';
 IF cardinality(recent)>=5 THEN RETURN NULL; END IF;
 UPDATE public.redemption_limits SET attempts=array_append(recent,stamp) WHERE user_id=auth.uid();
 BEGIN
  IF p_hash IS NULL OR p_hash !~ '^[a-f0-9]{64}$' THEN RETURN NULL; END IF;
  SELECT * INTO c FROM public.redeem_codes WHERE code_hash=p_hash FOR UPDATE;
  stamp:=clock_timestamp();
  IF NOT FOUND OR c.expires_at<=stamp OR c.revoked_at IS NOT NULL OR c.redeemed_at IS NOT NULL OR c.assigned_to IS DISTINCT FROM auth.uid() THEN RETURN NULL; END IF;
  SELECT access_days INTO days FROM public.courses WHERE id=c.course_id AND status='published' FOR SHARE;
  IF days IS NULL THEN RETURN NULL; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||c.course_id::text,0));
  IF EXISTS(SELECT 1 FROM public.enrollments WHERE user_id=auth.uid() AND course_id=c.course_id AND revoked_at IS NULL AND expires_at>stamp) THEN RETURN NULL; END IF;
  INSERT INTO public.enrollments(user_id,course_id,source_code,expires_at) VALUES(auth.uid(),c.course_id,c.id,stamp+make_interval(days=>days)) ON CONFLICT(user_id,course_id) DO UPDATE SET source_code=c.id,starts_at=stamp,expires_at=stamp+make_interval(days=>days),revoked_at=NULL RETURNING id INTO result;
  UPDATE public.redeem_codes SET redeemed_by=auth.uid(),redeemed_at=stamp WHERE id=c.id;
  INSERT INTO public.audit_events(actor_id,action,entity_id) VALUES(auth.uid(),'course.redeemed',c.course_id::text); RETURN result;
 EXCEPTION WHEN OTHERS THEN RETURN NULL;
 END;
END $$;
REVOKE ALL ON FUNCTION public.lms_register_device(text,text,text),public.lms_submit_order(uuid,text,text),public.lms_issue_code(uuid,uuid,text,timestamptz),public.lms_redeem(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.lms_register_device(text,text,text),public.lms_submit_order(uuid,text,text),public.lms_issue_code(uuid,uuid,text,timestamptz),public.lms_redeem(text) TO authenticated;
