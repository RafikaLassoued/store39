-- =========================================
-- STORAGE BUCKET FOR CATEGORY IMAGES
-- =========================================

-- Create storage bucket for category images
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true);

-- Set up RLS policies for the category-images bucket
-- Allow public read access for category images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'category-images');

-- Allow authenticated users to upload category images
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'category-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update category images
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE USING (
  bucket_id = 'category-images'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete category images
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (
  bucket_id = 'category-images'
  AND auth.role() = 'authenticated'
);