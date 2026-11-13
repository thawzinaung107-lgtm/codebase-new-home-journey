CREATE TABLE public.redemption_limits (user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE, attempts timestamptz[] NOT NULL DEFAULT '{}');
GRANT ALL ON public.redemption_limits TO service_role;
ALTER TABLE public.redemption_limits ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.redemption_limits IS 'Server-only rolling redemption attempt timestamps, at most five per account; no code values stored.';
CREATE OR REPLACE FUNCTION public.lms_redeem(p_hash text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c public.redeem_codes; days integer; result uuid; recent timestamptz[]; stamp timestamptz:=clock_timestamp();
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('redeem:'||auth.uid()::text,0));
 INSERT INTO public.redemption_limits(user_id) VALUES(auth.uid()) ON CONFLICT DO NOTHING;
 SELECT COALESCE(array_agg(t ORDER BY t),'{}'::timestamptz[]) INTO recent FROM public.redemption_limits r CROSS JOIN LATERAL unnest(r.attempts) t WHERE r.user_id=auth.uid() AND t>stamp-interval '15 minutes';
 IF cardinality(recent)>=5 THEN RETURN NULL; END IF;
 UPDATE public.redemption_limits SET attempts=array_append(recent,stamp) WHERE user_id=auth.uid();
 -- Failed redemption must return, not raise: raising would roll back the attempt counter.
 BEGIN
  IF p_hash IS NULL OR length(p_hash)<>64 THEN RETURN NULL; END IF;
  SELECT * INTO c FROM public.redeem_codes WHERE code_hash=p_hash FOR UPDATE;
  IF NOT FOUND OR c.expires_at<=stamp OR c.revoked_at IS NOT NULL OR c.redeemed_at IS NOT NULL OR (c.assigned_to IS NOT NULL AND c.assigned_to<>auth.uid()) THEN RETURN NULL; END IF;
  SELECT access_days INTO days FROM public.courses WHERE id=c.course_id AND status='published';
  IF days IS NULL THEN RETURN NULL; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||c.course_id::text,0));
  IF EXISTS(SELECT 1 FROM public.enrollments WHERE user_id=auth.uid() AND course_id=c.course_id AND revoked_at IS NULL AND expires_at>stamp) THEN RETURN NULL; END IF;
  INSERT INTO public.enrollments(user_id,course_id,source_code,expires_at) VALUES(auth.uid(),c.course_id,c.id,stamp+make_interval(days=>days)) ON CONFLICT(user_id,course_id) DO UPDATE SET source_code=c.id,starts_at=stamp,expires_at=stamp+make_interval(days=>days),revoked_at=NULL RETURNING id INTO result;
  UPDATE public.redeem_codes SET redeemed_by=auth.uid(),redeemed_at=stamp WHERE id=c.id;
  INSERT INTO public.audit_events(actor_id,action,entity_id) VALUES(auth.uid(),'course.redeemed',c.course_id::text);
  RETURN result;
 EXCEPTION WHEN OTHERS THEN RETURN NULL;
 END;
END $$;
REVOKE ALL ON FUNCTION public.lms_redeem(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.lms_redeem(text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.lms_audit() FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.lms_validate_receipt() FROM PUBLIC,anon,authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;