# PomoWrite — IELTS Writing Task 2

A responsive, functional learning app focused on independent writing practice. The frontend is plain HTML/CSS/JS; AI calls go through a Node.js backend so provider keys are never exposed to the browser.

## Included now
- Topic catalogue with category, task type, level and text filters.
- Three stages: learner-first brainstorming, AI-generated scaffold/outline, timed writing, and detailed AI review.
- Word counter, 25/5 Pomodoro timer, academic vocabulary and linking phrases with Russian translations and examples.
- Four estimated IELTS rubric scores, actionable feedback, grammar/vocabulary examples.
- Save/open/rename/delete, JSON export, saved feedback, average band history and practice streak.
- Responsive layout, light/dark toggle and initial OS theme preference.
- AI calls fail explicitly if the backend/API key is unavailable; no fake AI responses are shown.

## Run locally
Requirements: Node.js 18+.

```bash
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
npm start
```

Open http://localhost:3000. The backend serves `index.html` from `public/`, so copy `index.html` into a `public` folder before starting:

```bash
mkdir -p public
cp index.html public/index.html
```

Set `OPENAI_API_KEY` in `.env`; never put it into frontend JavaScript. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Use a model available to your account. `ALLOWED_ORIGIN` should be your exact deployed frontend origin in production.

## Storage and authentication status
This starter currently persists works in browser `localStorage`, not a cloud database. It has no real account sign-up/login yet. For a production multi-device app, add Supabase Auth and Postgres:
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL Editor.
3. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to a future auth-enabled frontend; use Supabase Auth for sign-up/login/logout.
4. Replace localStorage persistence with authenticated CRUD calls; enable RLS policies in the schema. Never ship the Supabase service-role key to the browser.

The included schema provides the secure database foundation, but Supabase sync/auth are not wired into this starter frontend and should not be represented as active until implemented.

## Important
- AI scores are estimates for learning, not official IELTS results or a guarantee of examiner scores.
- Topic prompts are original practice formulations based on common IELTS Task 2 subject areas; they are not represented as verbatim official IELTS questions.
- Before public deployment add authentication, request limits, monitoring, input validation, and a privacy policy. AI requests can incur provider costs.
