-- Create a new table for securing player photos without Supabase Storage bucket
-- This table stores encrypted image data directly
CREATE TABLE secure_player_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTE: You should create a Policy to allow public read access if needed
-- For public read access (essential for displaying images to users):
ALTER TABLE secure_player_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON secure_player_photos FOR SELECT 
USING (true);

-- For Authenticated insert/update/delete (or create a specific policy for your admin needs)
CREATE POLICY "Allow insert for authenticated users" 
ON secure_player_photos FOR INSERT 
WITH CHECK (true); -- Ideally, replace 'true' with auth.uid() check if you have auth setup

CREATE POLICY "Allow delete for authenticated users" 
ON secure_player_photos FOR DELETE 
USING (true); -- Ideally, replace 'true' with auth.uid() check
