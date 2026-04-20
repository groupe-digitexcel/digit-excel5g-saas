# 🚀 DIGIT-EXCEL5G AI STUDIO v3.0

**Africa's Premier AI Creative Studio** — Built for Cameroon 🇨🇲

> Modern SaaS stack: Next.js 14 App Router · Supabase · Vercel · TypeScript

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 App Router + TypeScript |
| **Styling** | Tailwind CSS + Syne + DM Sans |
| **Auth** | Supabase Auth (email/password + magic link) |
| **Database** | Supabase PostgreSQL + Row Level Security |
| **Storage** | Supabase Storage (ai-outputs bucket) |
| **Backend** | Next.js API Routes (Edge-ready) |
| **Deploy** | Vercel (frontend + API) |
| **AI Images** | Replicate (SDXL, Real-ESRGAN, GFPGAN) |
| **AI Text** | OpenRouter → Gemini Flash 1.5 |
| **Payments** | MTN MoMo + Orange Money (manual verify) |

---

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/digit-excel5g-saas.git
cd digit-excel5g-saas
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in .env.local with your Supabase + AI credentials

# 3. Set up database (paste supabase/migrations/001_initial_schema.sql in Supabase SQL Editor)

# 4. Run development server
npm run dev
```

Open http://localhost:3000

---

## 🔑 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

REPLICATE_API_KEY=r8_your_key
OPENROUTER_API_KEY=sk-or-your_key
GEMINI_API_KEY=your_gemini_key

MTN_MOMO_NUMBER=+237600000000
ORANGE_MONEY_NUMBER=+237690000000
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🚀 Deploy to Vercel ($0)

1. Push to GitHub
2. Import at vercel.com → Framework: Next.js
3. Add environment variables
4. Deploy ✅

See `DEPLOYMENT.md` for full step-by-step guide.

---

## 🛡️ Admin Setup

After registering, run in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📁 Project Structure

```
app/
  page.tsx               → Landing page
  auth/login/            → Login
  auth/register/         → Register
  auth/callback/         → Supabase OAuth callback
  dashboard/             → Protected dashboard
    page.tsx             → Overview
    image-generator/     → AI image generation
    photo-treatment/     → Photo enhancement
    flyer-generator/     → Flyer content AI
    song-generator/      → Song/jingle AI
    billing/             → MTN MoMo / Orange Money
    history/             → Past creations
  admin/                 → Admin panel
  api/
    ai/image/            → Replicate SDXL
    ai/photo/            → Replicate photo tools
    ai/flyer/            → Gemini flyer content
    ai/song/             → Gemini song lyrics
    payments/submit/     → Payment submission
    payments/verify/     → Admin payment approval
    admin/stats/         → Admin statistics

components/
  dashboard/
    Sidebar.tsx          → Collapsible dashboard nav
    AdminPayments.tsx    → Interactive payment table

lib/
  supabase/
    client.ts            → Browser Supabase client
    server.ts            → Server + Admin clients

supabase/migrations/
  001_initial_schema.sql → Full DB schema + RLS + triggers
```

---

© 2026 Digit-Excel5G AI Studio · Yaoundé, Cameroun 🇨🇲
