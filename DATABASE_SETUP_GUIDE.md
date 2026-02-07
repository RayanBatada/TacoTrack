# Database Setup Guide

Your app is trying to fetch data from Supabase, but the tables haven't been created yet. Follow these steps:

## Step 1: Go to Supabase Dashboard
Visit: https://app.supabase.com/

## Step 2: Navigate to SQL Editor
In the left sidebar, click **SQL Editor**

## Step 3: Create Tables
1. Click **New Query**
2. Copy the contents of `src/lib/database.sql`
3. Paste it into the SQL editor
4. Click **Run** (or Ctrl+Enter)
5. Wait for success message

## Step 4: Seed the Data
1. Click **New Query** again
2. Copy the contents of `src/lib/seed-data.sql`
3. Paste it into the SQL editor
4. Click **Run**
5. Wait for success message

## Step 5: Verify in App
1. Go back to your app at http://localhost:3000
2. Refresh the page
3. Data should now appear!

## Files to Use

- **Schema**: `src/lib/database.sql` - Creates tables with proper columns
- **Sample Data**: `src/lib/seed-data.sql` - Adds 22 ingredients, 23 recipes, and waste entries

## If You Already Have Tables
Skip to Step 4 to just add the seed data.

## Troubleshooting

If data still doesn't show:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Click on `/api/ingredients` or similar API calls
5. Check the Response - should show JSON data
6. If error, check Supabase dashboard for any issues

If you see errors in the Response:
- Verify your `.env.local` has correct credentials
- Run `pnpm dev` again to restart the server
- Check Supabase project is active (not paused)
