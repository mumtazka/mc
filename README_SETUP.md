# TJKT 2 Server Website Setup Guide

## 1. Supabase Setup

### Create Project & Tables
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `database-schema.sql` from your project root and paste it into the SQL Editor.
4. Run the query to create the tables and security policies.

### Storage Setup
1. Go to **Storage** in the sidebar.
2. Create a new bucket named `player-photos`.
3. Toggle "Public bucket" to ON.
4. Save the bucket.

### Environment Variables
1. Go to **Project Settings** > **API**.
2. Copy the `Project URL` and `anon public` key.
3. Open `.env` in your project root.
4. Fill in the values:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 2. Running the Admin Page

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:5173/munas` to access the admin panel.
3. To change a player's picture:
   - Add a player first.
   - Click the **+** button in the Photos section of the player card.
   - Upload an image.
   - The first uploaded image will be displayed on the main page.
   - You can upload multiple images for the carousel.

## 3. Main Page Features

- **Smooth Scroll**: The video animation now scrolls smoother (scrub 5).
- **Overlay**: A dark overlay makes text readable over the video.
- **Sections**: Hero, History, and Player Profiles are now visible.
- **Player Profiles**: 
  - Layout alternates (Left/Right).
  - Shows player photos from Supabase.
  - Carousel dots appear if multiple photos exist.

## Troubleshooting

- If images don't load, check your Supabase Storage bucket name (`player-photos`) and ensure it is Public.
- If data doesn't load, check your `.env` file credentials.
