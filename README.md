# TacoTrack

TacoTrack is live and accessible here: AI-powered inventory management for restaurants. Built at UGAHacks 11 because we were tired of watching good food go to waste.

https://taco-track.vercel.app/

## What is this?

TacoTrack helps restaurants stop throwing away money (and food). It's got three main things:

1. **TacoTalk AI** - A chatbot you can actually talk to about your inventory. Ask it "when should I reorder beef?" and it'll tell you. No spreadsheets required.

2. **Demand Forecasting** - Uses machine learning to predict what you'll sell in the next 7 days. Turns out it's pretty accurate (99% according to our tests).

3. **TacoTrack Wrapped** - Like Spotify Wrapped but for your restaurant. Shows off your top dishes and revenue in a way that's actually shareable on social media.

Plus the usual stuff - inventory tracking, waste predictions, alerts when you're running low on ingredients, etc.

## Why "TacoTrack"?

Our team loves Taco Bell. Like, really loves it. We started thinking about how they manage to never run out of ingredients despite serving millions of tacos. Turns out most restaurants don't have those kinds of systems, and $162 billion worth of food gets wasted every year because of it.

We figured we could fix that. Or at least try.

## Tech Stack

- Next.js 15 (React 19, TypeScript)
- Supabase for the database (PostgreSQL)
- Google Gemini AI for the chatbot
- Tailwind CSS because we're not monsters
- Framer Motion for animations
- Recharts for the graphs

The forecasting algorithm is custom - analyzes sales patterns and projects demand forward. Nothing too fancy but it works.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Supabase account (free tier works)
- A Gemini API key from Google

### Installation

1. Clone the repo:
```bash
git clone https://github.com/RayanBatada/TacoTrack.git
cd TacoTrack
```

2. Install dependencies:
```bash
npm install
# or if you use pnpm
pnpm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```

Then fill in your actual keys in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Get this from your Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Also from Supabase
- `GEMINI_API_KEY` - From Google AI Studio (https://ai.google.dev/)
- `NEXT_PUBLIC_BASE_URL` - Just use `http://localhost:3000` for local dev

4. Set up the database:

Go to your Supabase project and run the SQL scripts in the `/database` folder. You'll need to:
- Create the tables (schema.sql)
- Add some sample data (seed.sql)

5. Run the dev server:
```bash
npm run dev
```

Open http://localhost:3000 and you should see the landing page.

## What We're Working On

- Multi-restaurant support (right now it's built for one location)
- Connecting to POS systems like Toast and Square
- Mobile apps for iOS and Android
- Letting you place orders directly with suppliers

Maybe next time.

## Team

Built by Rayan Batada, Zayanh1, SaudKasumbi, and Sivasaran at UGAHacks 11.

Powered by coffee, Taco Bell, and the kind of sleep deprivation that makes you think a taco-themed inventory app is a good idea at 3 AM.

(It was.)

## Links

- Live Demo: https://taco-track.vercel.app
- Devpost: [Add your Devpost link]
- Presentation: [Add slides link]

---

If you use this and it helps your restaurant waste less food, let us know. That would be pretty cool.
