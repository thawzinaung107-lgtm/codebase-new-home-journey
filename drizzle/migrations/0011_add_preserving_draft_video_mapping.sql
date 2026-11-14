CREATE OR REPLACE FUNCTION public.lms_admin_map_draft_video(p_lesson uuid, p_library text, p_encrypted text, p_fingerprint text, p_duration integer)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE existing public.lesson_bunny_videos%ROWTYPE;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
 PERFORM 1 FROM public.lessons WHERE id=p_lesson AND status='draft' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Choose an existing draft lesson'; END IF;
 SELECT * INTO existing FROM public.lesson_bunny_videos WHERE lesson_id=p_lesson;
 IF FOUND THEN
   IF existing.library_id=p_library AND existing.video_fingerprint=p_fingerprint THEN RETURN 'already_mapped'; END IF;
   RAISE EXCEPTION 'Existing video mapping is protected';
 END IF;
 IF p_library !~ '^[1-9][0-9]*$' OR p_fingerprint !~ '^[a-f0-9]{64}$' OR length(p_encrypted)<32 OR p_duration<0 THEN RAISE EXCEPTION 'Invalid video mapping'; END IF;
 INSERT INTO public.lesson_bunny_videos(lesson_id,library_id,encrypted_video,video_fingerprint) VALUES(p_lesson,p_library,p_encrypted,p_fingerprint);
 UPDATE public.lessons SET video_status='ready',duration_seconds=CASE WHEN p_duration>0 THEN p_duration ELSE duration_seconds END WHERE id=p_lesson;
 RETURN 'mapped';
END $$;
REVOKE ALL ON FUNCTION public.lms_admin_map_draft_video(uuid,text,text,text,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.lms_admin_map_draft_video(uuid,text,text,text,integer) TO authenticated;
COMMENT ON FUNCTION public.lms_admin_map_draft_video(uuid,text,text,text,integer) IS 'Admin draft-only insert mapping; same assignment is a no-op and existing assignments are never replaced.';