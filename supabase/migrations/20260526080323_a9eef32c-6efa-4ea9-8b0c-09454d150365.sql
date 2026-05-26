-- 1. Remove duplicate + permissive storage policies, replace with one restricted policy
DROP POLICY IF EXISTS "Anyone can upload a resume" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload intro videos" ON storage.objects;

-- Allow anon + authenticated to upload to 'resumes' ONLY if the filename matches
-- our server-generated pattern: <uuid>.<video-ext>. This blocks arbitrary paths,
-- subfolders, path traversal, and non-video uploads while still letting the
-- public application form work.
CREATE POLICY "Public can upload intro videos with safe filename"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND position('/' in name) = 0
  AND name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|mov|webm|mkv|m4v|3gp)$'
);

-- 2. Revoke direct EXECUTE on SECURITY DEFINER helpers from client roles.
-- has_role is still callable from RLS policies (runs as definer/owner);
-- grant_admin_for_owner is only invoked by the auth.users trigger.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_owner() FROM PUBLIC, anon, authenticated;