# Copilot Instructions: Orchids Restaurant Magic Inventory

## Project Overview
**TacoTrack** is a Next.js restaurant inventory management system with an AI-powered chatbot (Taco Talk) for smart inventory analytics. The app tracks ingredients, recipes, orders, and waste while providing real-time insights and AI-driven recommendations.

- **Stack**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **AI**: Google Gemini API (gemma-3-27b-it model)
- **Database**: Supabase (PostgreSQL) with static fallback data in `src/lib/data.ts`
- **Key Feature**: "Taco Talk" AI chatbot on dashboard for inventory queries and recommendations

## Architecture & Data Flow

### Core Data Model
Three main entity types flow through the system:

1. **Ingredients** (`src/lib/data-db.ts`): Restaurant stock items with daily usage tracking, expiry dates, par levels
2. **Recipes**: Menu items with ingredient lists, prices, daily sales history
3. **Waste Entries**: Spoilage/expired items tracked for cost analysis

### Data Fetching Pattern
- **Production**: API routes in `src/app/api/*/route.ts` fetch from Supabase via `data-db.ts`
- **Fallback**: `src/lib/data.ts` exports empty arrays; components use `useEffect` to fetch real data
- **Example**: Dashboard uses `getRecipes()`, `getIngredients()` async calls instead of direct imports

**Critical**: Don't import static data directly in components expecting dynamic data. Always use the async fetcher functions.

### AI Integration (`src/app/actions.ts`)
The chatbot uses a **server action pattern**:
1. User sends message to `chatWithGemini(userMessage)`
2. System transforms ingredient/recipe data into readable text format
3. Gemini model analyzes data and responds with restaurant-specific insights
4. Uses weighted daily usage averages for trend analysis

**Key Insight**: Inventory data is formatted as plain text before sending to AI—not structured JSON. This makes the AI reason about patterns naturally.

## Project-Specific Patterns

### Component Conventions
- Dashboard page (`src/app/page.tsx`): ~830 lines, heavily commented, uses React state for chat messages and data
- Pages are **client components** (`"use client"`) when they need interactivity or `useEffect` for data fetching
- Shadcn UI components for all UI elements (buttons, cards, dialogs, tables, charts)

### Alert & Urgency System
Inventory health is calculated at the helper-function level:
- `daysOfStock()`: Divides stock by weighted average daily usage (recent days weighted more heavily)
- `urgencyLevel()`: Returns `"critical"` (<1.5 days), `"warning"` (<3 days), or `"good"`
- Alerts are generated server-side in `generateAlerts()` based on thresholds

### Naming Conventions
- Database fields use **snake_case** (Supabase): `par_level`, `yield_percent`, `daily_sales`
- TypeScript interfaces use **camelCase**: `parLevel`, `yieldPercent`, `dailySales`
- API routes transform snake_case → camelCase using helper functions (see `recipes/route.ts`)

**Common Mistake**: Forgetting the transformation step when adding new entities to the API.

## Developer Workflows

### Local Development
```bash
pnpm dev              # Start dev server with Turbopack (http://localhost:3000)
pnpm build            # Production build
pnpm lint             # Run ESLint
```

### Adding a New Ingredient/Recipe
1. Add type definition to `src/lib/data-db.ts`
2. Create API endpoint in `src/app/api/[entity]/route.ts` with Supabase fetch
3. Create fetcher function (e.g., `getIngredients()`) in `data-db.ts`
4. Use in components with `useEffect` pattern from DATABASE_SETUP.md

### Database Schema
Run SQL from `src/lib/database.sql` in Supabase SQL Editor. Schema includes tables for:
- `ingredients`, `recipes`, `orders`, `waste_entries`
- Fields match `export interface` definitions in TypeScript

### Environment Setup
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
GEMINI_API_KEY=your_key
```

## Critical Integration Points

### Gemini API in `actions.ts`
- Model: `"gemma-3-27b-it"` (open-weights Gemma model, free tier eligible)
- System prompt establishes "Taco Talk" persona with restaurant context (Athens, GA)
- Input: Formatted text of current inventory + recipes
- Output: Streaming response with recommendations (wastage alerts, ordering tips, recipe insights)

### Supabase Connection (`src/lib/supabase.ts`)
- Singleton client initialized with URL and anon key
- Used directly in API routes; **never call from client components** (use API endpoints instead)
- Transforms snake_case fields to camelCase after fetch

### Dashboard Chat UI
- Messages stored in React state (`setChatMessages`)
- Markdown rendering with `react-markdown` + `remark-gfm` for formatted AI responses
- Async `chatWithGemini` awaits Gemini response before showing
- Charts use Recharts with custom tooltip styling

## Testing & Debugging Tips

1. **Chat Not Responding**: Check `GEMINI_API_KEY` in `.env.local` and Gemini API quota
2. **Data Not Loading**: Verify Supabase credentials and database tables exist. Check browser Network tab for API response status
3. **UI Not Updating**: Ensure component has `"use client"` and `useEffect` is importing correct fetcher function
4. **Urgency Alerts Wrong**: Debug `avgDailyUsage()` calculation—verify recent usage data isn't all zeros

## Recommended Reading Order for New Contributors
1. [DATABASE_SETUP.md](../DATABASE_SETUP.md) — How data flows from Supabase to UI
2. [src/app/page.tsx](../src/app/page.tsx) — Dashboard structure (well-commented)
3. [src/lib/data-db.ts](../src/lib/data-db.ts) — Type definitions and API fetchers
4. [src/app/actions.ts](../src/app/actions.ts) — AI prompt engineering and Gemini integration
