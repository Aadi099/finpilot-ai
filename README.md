# FinPilot AI

A personal finance and investment tracker built with Next.js, TypeScript,
Tailwind CSS, Cloudflare Pages, Supabase Auth, and Supabase Postgres.

## What Works Now

- Dashboard with calculated balances
- Bank account setup with opening balance
- Quick Entry for income, expense, and transfer records
- Transactions view from saved entries
- Google login through Supabase Auth
- Database-ready storage with row-level security
- Browser-local fallback when Supabase is not configured

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Cloudflare Pages settings:

```text
Framework preset: None
Build command: npm run build
Build output directory: dist
Production branch: main
```

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Paste and run the SQL from:

```text
supabase/schema.sql
```

4. In Supabase Auth, enable Google provider.
5. Add this redirect URL in Supabase Auth URL configuration:

```text
https://finpilot-ai-552.pages.dev
```

6. In Cloudflare Pages, add these environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Use the values from Supabase Project Settings → API.

After saving environment variables, redeploy Cloudflare Pages.

## Data Privacy

Do not hardcode real bank data into source files. The app stores private finance
records either:

- in browser local storage before sign-in, or
- in Supabase tables against the signed-in user ID after Google login.

The Supabase tables use row-level security so each user can only read and write
their own accounts and transactions.
