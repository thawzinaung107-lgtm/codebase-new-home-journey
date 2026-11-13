ALTER TABLE public.lessons ADD COLUMN description text NOT NULL DEFAULT '' CHECK (length(description) <= 2000);
ALTER TABLE public.lessons ADD COLUMN auto_publish boolean NOT NULL DEFAULT false;
ALTER TABLE public.lessons ADD COLUMN upload_request uuid UNIQUE;
ALTER TABLE public.lesson_bunny_videos ADD COLUMN upload_expires_at timestamptz;
ALTER TABLE public.bunny_security_checks ADD COLUMN method text NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','automated'));
ALTER TABLE public.bunny_security_checks ADD COLUMN signed_allowed boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.bunny_security_checks.method IS 'Only automated server probe results authorize playback; manual attestations are retired.';

-- Manual browser attestations are retired: only the server (service role) records probe results.
REVOKE INSERT, UPDATE ON public.bunny_security_checks FROM authenticated;

-- A lesson can be published only with a mapped, ready video.
CREATE FUNCTION public.lms_lesson_publish_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.status = 'published' AND (NEW.video_status <> 'ready' OR NOT EXISTS (SELECT 1 FROM public.lesson_bunny_videos v WHERE v.lesson_id = NEW.id)) THEN
    RAISE EXCEPTION 'A lesson can be published only after its video is ready';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER lessons_publish_guard BEFORE INSERT OR UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.lms_lesson_publish_guard();

-- Admin-only, idempotent creation of a draft upload lesson (and default module when the course has none).
CREATE FUNCTION public.lms_admin_create_upload_lesson(p_course uuid, p_title text, p_description text, p_position integer, p_request uuid, p_auto_publish boolean)
RETURNS TABLE(lesson_id uuid, created boolean) LANGUAGE plpgsql SET search_path=public AS $$
DECLARE m uuid; l uuid; pos integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  PERFORM 1 FROM public.courses WHERE id = p_course FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Course not found'; END IF;
  SELECT id INTO l FROM public.lessons WHERE upload_request = p_request;
  IF l IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.lessons x JOIN public.modules y ON y.id = x.module_id WHERE x.id = l AND y.course_id = p_course) THEN RAISE EXCEPTION 'Upload request belongs to another course'; END IF;
    RETURN QUERY SELECT l, false; RETURN;
  END IF;
  SELECT id INTO m FROM public.modules WHERE course_id = p_course ORDER BY position, id LIMIT 1;
  IF m IS NULL THEN
    INSERT INTO public.modules(course_id, title, position) VALUES (p_course, 'Course Lessons', 0) RETURNING id INTO m;
  END IF;
  SELECT COALESCE(p_position, (SELECT COALESCE(max(x.position) + 1, 0) FROM public.lessons x JOIN public.modules y ON y.id = x.module_id WHERE y.course_id = p_course)) INTO pos;
  INSERT INTO public.lessons(module_id, title, description, position, status, video_status, upload_request, auto_publish)
  VALUES (m, p_title, COALESCE(p_description, ''), GREATEST(pos, 0), 'draft', 'unconfigured', p_request, COALESCE(p_auto_publish, false)) RETURNING id INTO l;
  RETURN QUERY SELECT l, true;
END $$;
REVOKE ALL ON FUNCTION public.lms_admin_create_upload_lesson(uuid,text,text,integer,uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lms_admin_create_upload_lesson(uuid,text,text,integer,uuid,boolean) TO authenticated;

-- Admin-only lesson removal: refuses lessons with student progress, removes the private mapping first.
CREATE FUNCTION public.lms_admin_delete_lesson(p_lesson uuid) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
  PERFORM 1 FROM public.lessons WHERE id = p_lesson FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Lesson not found'; END IF;
  IF EXISTS (SELECT 1 FROM public.lesson_progress WHERE lesson_id = p_lesson) THEN RAISE EXCEPTION 'Students have progress on this lesson; unpublish it instead'; END IF;
  UPDATE public.lessons SET status = 'draft' WHERE id = p_lesson AND status <> 'draft';
  DELETE FROM public.lesson_bunny_videos WHERE lesson_id = p_lesson;
  DELETE FROM public.lessons WHERE id = p_lesson;
END $$;
REVOKE ALL ON FUNCTION public.lms_admin_delete_lesson(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lms_admin_delete_lesson(uuid) TO authenticated;

-- Playback now requires a fresh automated provider probe for the mapped library.
CREATE OR REPLACE FUNCTION public.lms_bunny_playback_mapping(p_lesson uuid,p_hash text) RETURNS TABLE(encrypted_video text,library_id text) LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE sid text:=auth.jwt()->>'session_id'; BEGIN
IF auth.uid() IS NULL OR sid IS NULL OR NOT EXISTS(SELECT 1 FROM auth.sessions WHERE id::text=sid AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Sign in again'; END IF;
IF EXISTS(SELECT 1 FROM public.registered_devices WHERE user_id=auth.uid() AND session_id=sid AND revoked_at IS NOT NULL) OR NOT EXISTS(SELECT 1 FROM public.registered_devices WHERE user_id=auth.uid() AND session_id=sid AND token_hash=p_hash AND revoked_at IS NULL) THEN RAISE EXCEPTION 'Registered active browser required'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.bunny_security_checks WHERE id=true AND method='automated' AND embed_tokens AND preview_referrer AND unsigned_denied AND direct_media_denied AND signed_allowed AND verified_at>now()-interval '6 hours') THEN RAISE EXCEPTION 'Bunny security configuration unverified'; END IF;
RETURN QUERY SELECT v.encrypted_video,v.library_id FROM public.lesson_bunny_videos v JOIN public.bunny_security_checks s ON s.id=true AND s.library_id=v.library_id JOIN public.lessons l ON l.id=v.lesson_id JOIN public.modules m ON m.id=l.module_id JOIN public.courses c ON c.id=m.course_id JOIN public.enrollments e ON e.course_id=c.id WHERE l.id=p_lesson AND l.status='published' AND l.video_status='ready' AND c.status='published' AND e.user_id=auth.uid() AND e.starts_at<=now() AND e.expires_at>now() AND e.revoked_at IS NULL;
END $$;
REVOKE ALL ON FUNCTION public.lms_bunny_playback_mapping(uuid,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.lms_bunny_playback_mapping(uuid,text) TO authenticated;