
CREATE POLICY "Anyone can upload intro videos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'resumes');
