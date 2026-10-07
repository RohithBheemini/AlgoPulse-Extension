# 🚀 AlgoPulse — Phase 2 Architecture & Future Scope Blueprint
*(Updated for End-to-End Architectural, Auth & Data Model Consistency)*

> **Status:** Planned & Queued (Awaiting completion of LeetCode live testing).  
> **Important:** No existing code has been touched or modified. This document serves as the implementation-ready specification for when testing concludes.

---

## 📋 Table of Contents
1. [Core Objectives & Consistency Pillars](#1-core-objectives--consistency-pillars)
2. [Data Model & Type Consistency (Across Extension, API, and DB)](#2-data-model--type-consistency)
3. [Multi-Account Auth & Persistent Session Engine](#3-multi-account-auth--persistent-session-engine)
4. [Atomic PostgreSQL Schema & Database Trigger](#4-atomic-postgresql-schema--database-trigger)
5. [Approach Comparison Engine (Pedagogical "Why" Rationales)](#5-approach-comparison-engine)
6. [Motion UI Design System (Framer Motion Tokens)](#6-motion-ui-design-system)
7. [Local Demo ↔ Cloud Production Parity](#7-local-demo--cloud-production-parity)
8. [Step-by-Step Implementation Sequence](#8-step-by-step-implementation-sequence)

---

## 1. Core Objectives & Consistency Pillars

To ensure that the next phase is completely seamless with zero edge cases or regressions, Phase 2 is built around **four consistency pillars**:

1. **Schema & Contract Consistency:** The property names, types, and constraints are 100% identical across the Chrome Extension TypeScript types, Gemini JSON output schema, Next.js API payloads, and Supabase PostgreSQL columns.
2. **Session Persistence Consistency:** Users stay logged in across browser restarts and tab refreshes for $n$ sessions until explicit logout, utilizing rolling refresh cookies via `@supabase/ssr`.
3. **Atomic User Profile Generation:** Account registration (Email or OAuth) atomically generates a profile record and personal extension token via a PostgreSQL Database Trigger—eliminating orphaned users or race conditions.
4. **Motion Design Consistency:** A shared motion token system (durations, spring curves, staggered entrance variants) powers all interactive transitions across the dashboard and extension drawer.

---

## 2. Data Model & Type Consistency

Every field below has a 1-to-1 matching representation in TypeScript and SQL:

### Unified Data Contract

```typescript
// Shared across Extension, Backend API, and Web App
export interface ApproachRationale {
  /** Max 2 sentences: specific algorithmic bottleneck or inefficiency in user code */
  why_suboptimal: string;
  /** Max 2 sentences: specific algorithmic advantage of the optimal solution */
  why_ideal: string;
}

export interface RubricBreakdown {
  optimality: number;       // 0 - 35 pts
  time_complexity: number;  // 0 - 25 pts
  space_complexity: number; // 0 - 20 pts
  cleanliness: number;      // 0 - 20 pts
}

export interface ComplexityBenchmark {
  user_time: string;        // e.g. "O(N^2)"
  user_space: string;       // e.g. "O(1)"
  optimal_time: string;     // e.g. "O(N)"
  optimal_space: string;    // e.g. "O(N)"
}

export interface SubmissionPayload extends ApproachRationale {
  problem_title: string;
  problem_slug: string;
  platform: 'leetcode' | 'hackerrank' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  user_code: string;
  
  overall_score: number;    // 0 - 100
  scoring_breakdown: RubricBreakdown;
  complexity: ComplexityBenchmark;
  
  summary_feedback: string;
  improvements: string[];
  optimal_code: string;
}
```

---

## 3. Multi-Account Auth & Persistent Session Engine

### A. How Persistent Logins Work ($n$ Sessions Without Re-login)
- **Cookie Storage via `@supabase/ssr`:**
  Unlike plain localStorage, cookies are read on both server (SSR) and client, preventing flash-of-unauthenticated-state (FOUS).
  ```typescript
  // src/lib/supabase/client.ts
  import { createBrowserClient } from '@supabase/ssr';

  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 30, // 30 Days rolling persistence
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        }
      }
    );
  }
  ```
- **Silent Background Refresh:**
  When the user returns to the site (session 2, session 5, session 100...), Supabase automatically exchanges the refresh token in the background for a fresh JWT.
- **Explicit Logout Only:**
  The user remains authenticated across all sessions until they click **"Sign Out"**, which executes `supabase.auth.signOut()` and purges the cookies.

### B. Route Protection via Middleware (`middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect private routes
  const protectedRoutes = ['/submissions', '/settings'];
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return response;
}
```

---

## 4. Atomic PostgreSQL Schema & Database Trigger

To guarantee 100% data integrity, user profiles and personal tokens are created via a **PostgreSQL Trigger** as soon as a user registers in `auth.users`:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  extension_token text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Submissions Table with Consistent Columns
create table if not exists public.submissions (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  problem_title text not null,
  problem_slug text not null,
  platform text default 'leetcode',
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard', 'Unknown')),
  language text not null,
  user_code text not null,
  
  -- 4-Pillar Score
  overall_score integer not null check (overall_score between 0 and 100),
  optimality_score integer,
  time_score integer,
  space_score integer,
  cleanliness_score integer,
  
  -- Big-O Notations
  user_time_complexity text,
  user_space_complexity text,
  optimal_time_complexity text,
  optimal_space_complexity text,
  
  -- Qualitative Approach Comparison
  why_suboptimal text,           -- Concise bottleneck in user approach
  why_ideal text,                -- Concise advantage of optimal approach
  
  summary_feedback text,
  improvements jsonb default '[]'::jsonb,
  optimal_code text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row-Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

-- Profiles Policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Submissions Policies (Data Isolation)
create policy "Users can view own submissions" 
  on public.submissions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own submissions via token" 
  on public.submissions for insert 
  with check (true);

-- Indexes for Fast Query Performance
create index if not exists idx_submissions_user_date on public.submissions(user_id, created_at desc);
create index if not exists idx_profiles_token on public.profiles(extension_token);

-- 3. Automatic Profile & Token Generator Function (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  generated_token text;
begin
  -- Generate unique token: ap_sec_<random 32 hex chars>
  generated_token := 'ap_sec_' || encode(gen_random_bytes(16), 'hex');

  insert into public.profiles (id, email, display_name, extension_token)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    generated_token
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 5. Approach Comparison Engine (Pedagogical "Why" Rationales)

### A. Updated Gemini Prompt Specification
The Gemini 2.5 Flash generation config enforces strict brevity (max 2 sentences each) so that users and evaluators get concise, punchy takeaways:

```json
{
  "why_suboptimal": "String (Max 2 sentences): The specific algorithmic bottleneck or inefficiency in the student's code.",
  "why_ideal": "String (Max 2 sentences): Why the optimal approach is ideal and how it eliminates that bottleneck."
}
```

### B. UI Presentation Consistency
Both the **In-Page LeetCode Drawer** and the **Dashboard Detail Page** render matching color-coded feedback callouts:
- **Amber/Rose Card (Your Approach):**
  - Icon: `AlertTriangle`
  - Title: *"Bottleneck in Your Approach"*
  - Content: `why_suboptimal`
- **Emerald/Teal Card (Optimal Benchmark):**
  - Icon: `CheckCircle2`
  - Title: *"Why Optimal Approach Excels"*
  - Content: `why_ideal`

---

## 6. Motion UI Design System (Framer Motion Tokens)

We establish a shared motion token library (`src/lib/motion.ts`) so all animations feel cohesive, refined, and 60fps-smooth:

```typescript
// src/lib/motion.ts
export const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

export const easeTransition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1], // Apple-style ease-out-expo
};

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: easeTransition },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -3,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};
```

### Applied Motion Touches:
1. **Interactive Count-Up on Stats:** Numbers count up from 0 to actual value using Framer Motion `animate(0, targetValue, { duration: 1.2 })`.
2. **Glowing Border Transition:** Cards show a subtle animated gradient glow border when hovered.
3. **Smooth Filter Reordering:** Submissions list utilizes Framer Motion `<motion.div layout>` so cards glide into new positions when filtered by Easy/Medium/Hard.
4. **Active Tab Indicator:** Navigation and code tabs use `layoutId="activeIndicator"` for a floating pill that slides smoothly between tabs.

---

## 7. Local Demo ↔ Cloud Production Parity

To prevent any breaking changes during local development or viva presentations:
- **If Supabase credentials are not in `.env.local`:**  
  The dashboard automatically falls back to `data/submissions.json` and a local mock profile.
- **If Supabase credentials are provided:**  
  The dashboard connects to PostgreSQL, activates real user auth, and executes RLS queries with **zero changes to client-facing code**.

---

## 8. Step-by-Step Implementation Sequence

When you finish testing on LeetCode and say **"Proceed with Phase 2"**, we will execute in this exact order:

```
[1. Dependencies] Install framer-motion and @supabase/ssr in dashboard/
      ↓
[2. Supabase Auth] Configure Auth Provider, persistent cookies & login/signup pages
      ↓
[3. Schema Update] Add why_suboptimal and why_ideal to data storage & DB
      ↓
[4. AI Prompt] Update Gemini prompt to generate concise approach comparisons
      ↓
[5. Motion UI] Integrate motion tokens into Homepage, Stats, and Submissions List
      ↓
[6. Extension Sync] Update extension payload & review drawer with "Why" callouts
      ↓
[7. End-to-End Build] Test multi-account login, extension sync, and visual polish
```

---

### 📌 Current Status
- Current extension build in `extension/dist` remains **untouched and ready for testing**.
- You can continue testing on LeetCode without any conflict.
- Whenever you are satisfied with testing, let me know to start Phase 2!
