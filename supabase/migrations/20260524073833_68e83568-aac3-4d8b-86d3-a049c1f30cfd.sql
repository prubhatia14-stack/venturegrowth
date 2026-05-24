ALTER TABLE public.applications ADD COLUMN instagram text;

UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['video/mp4','video/quicktime','video/webm','video/x-matroska','video/x-m4v','video/3gpp']
WHERE id = 'resumes';