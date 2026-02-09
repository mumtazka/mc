-- ========================================
-- TJKT 2 Minecraft Server Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player photos table (multiple photos per player)
CREATE TABLE IF NOT EXISTS player_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_photos ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view)
CREATE POLICY "public_read_players" ON players 
  FOR SELECT USING (true);

CREATE POLICY "public_read_photos" ON player_photos 
  FOR SELECT USING (true);

-- Public insert/update/delete (for admin page - you may want to restrict this later)
CREATE POLICY "public_insert_players" ON players 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_players" ON players 
  FOR UPDATE USING (true);

CREATE POLICY "public_delete_players" ON players 
  FOR DELETE USING (true);

CREATE POLICY "public_insert_photos" ON player_photos 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update_photos" ON player_photos 
  FOR UPDATE USING (true);

CREATE POLICY "public_delete_photos" ON player_photos 
  FOR DELETE USING (true);

-- ========================================
-- Storage Bucket Setup (run separately or use Supabase Dashboard)
-- ========================================
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket called "player-photos"
-- 3. Make it public (allow public access)
-- 4. Or run this SQL:

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('player-photos', 'player-photos', true);
