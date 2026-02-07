# Database Setup Guide

## Steps to Get Your Database Running

### 1. Set Up Supabase Project (if you don't have one)
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Get your project's API credentials from the Settings page

### 2. Add Environment Variables
Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Create Database Tables
- Go to your Supabase project dashboard
- Click on "SQL Editor"
- Create a new query
- Copy the SQL from `src/lib/database.sql`
- Run the query to create all tables

### 4. Seed Initial Data (Optional)
You can either:
- Use the Supabase dashboard to manually insert data
- Create a seed script that imports the static data from the old `src/lib/data.ts`

### 5. Update Your Pages to Fetch Data
For pages using data, wrap them as async or fetch in useEffect:

**Example for a page:**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { getRecipes } from '@/lib/data-db';
import type { Recipe } from '@/lib/data-db';

export default function YourPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  
  useEffect(() => {
    getRecipes().then(setRecipes);
  }, []);
  
  // Use recipes...
}
```

## File Structure Created

- `.env.local` - Your Supabase credentials (add these!)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/data-db.ts` - New data fetching functions
- `src/lib/database.sql` - Database schema to run in Supabase
- `src/app/api/recipes/route.ts` - API endpoint for recipes
- `src/app/api/ingredients/route.ts` - API endpoint for ingredients
- `src/app/api/orders/route.ts` - API endpoint for orders
- `src/app/api/waste/route.ts` - API endpoint for waste entries

## Your Old Data
For now, the static data in `src/lib/data.ts` is still there. You can:
- Keep it as a fallback
- Use it to seed your Supabase database
- Delete it once you're confident with the database setup

## Next Steps
1. Add your Supabase credentials to `.env.local`
2. Run the SQL schema in Supabase
3. Update components to use `getRecipes()`, `getIngredients()`, etc. instead of importing directly
4. The wrapped page and other pages will automatically use the database data when you update them
