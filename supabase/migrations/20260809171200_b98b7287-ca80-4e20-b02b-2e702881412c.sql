CREATE POLICY "equipment_photos_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'equipment-photos');
CREATE POLICY "equipment_photos_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'equipment-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "equipment_photos_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'equipment-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "equipment_photos_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'equipment-photos' AND (storage.foldername(name))[1] = auth.uid()::text);