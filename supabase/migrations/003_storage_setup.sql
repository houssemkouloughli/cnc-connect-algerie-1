-- CNC Connect Algérie - Storage Setup
-- Run this in Supabase SQL Editor OR via Dashboard > Storage

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Bucket for CAD files (STEP, STL, IGES)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cad-files', 'cad-files', false)
ON CONFLICT DO NOTHING;

-- Bucket for thumbnails/previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - CAD FILES
-- =====================================================

-- Users can upload their own files
DROP POLICY IF EXISTS "Users can upload own CAD files" ON storage.objects;
CREATE POLICY "Users can upload own CAD files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own files
DROP POLICY IF EXISTS "Users can view own CAD files" ON storage.objects;
CREATE POLICY "Users can view own CAD files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Partners can view CAD files for quotes they bid on
DROP POLICY IF EXISTS "Partners can view CAD files for their bids" ON storage.objects;
CREATE POLICY "Partners can view CAD files for their bids"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cad-files' AND
    EXISTS (
      SELECT 1 FROM bids b
      JOIN quotes q ON b.quote_id = q.id
      JOIN partners p ON b.partner_id = p.id
      WHERE p.profile_id = auth.uid()
      AND q.file_url LIKE '%' || name || '%'
    )
  );

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own CAD files" ON storage.objects;
CREATE POLICY "Users can delete own CAD files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'cad-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- STORAGE POLICIES - THUMBNAILS
-- =====================================================

-- Anyone can view thumbnails (public bucket)
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'thumbnails');

-- Users can upload thumbnails
DROP POLICY IF EXISTS "Users can upload thumbnails" ON storage.objects;
CREATE POLICY "Users can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
