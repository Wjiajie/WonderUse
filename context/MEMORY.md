# MiaoWuJi Project Context

## Project: 妙物记 (MiaoWuJi)
- **Repo**: c:\Users\jiaji\Documents\github-project\WonderUse
- **Concept**: Skeuomorphic web app for "second consumption" — helping users discover the full value of products they already own
- **Mascot**: 喵呜 (MiaoWu) — American Shorthair cat, silver classic tabby
- **Design**: Explorer's Study / Treasure Chest style, 19th-century naturalist vibes
- **Target**: Chinese users first (中文优先)

## Key Decisions (2026-03-28)
- Name: 妙物记 (not 夸夸)
- Tech: Next.js 16.2.x + React 19.2.x + Framer Motion 12.38.x + Supabase
- AI: NOT in MVP. V2 will use 豆包/DeepSeek/MiniMax (domestic Chinese APIs)
- Categories: electronics, software, clothing, books
- Supabase Org: Wjiajie's Org (azblouvqxqbonnjvphva), region: ap-southeast-1
- CSS: Custom skeuomorphic, no Tailwind, no component library
- Mobile-first responsive design

## Sprint 1 Completion (2026-03-28)
- **Status**: ✅ Skeleton delivered, core loop NOT closed
- **Delivered**: Auth, Shelf (full CRUD), Login (high quality), 6 skeuomorphic components, MiaoWu 4-state sprite
- **Not delivered**: Praise core logic, Achievements data, Product edit/delete, SpeechBubble, Toast system
- **All 6 bugs fixed**: Auth guard, rate limit, wood.jpg 404, tab hitbox, add button, category constraint
- **QA Score**: 94/100 (3rd round)
- **Design Quality**: 8.6/10

## Documents (docs/)
- `PRD.md` — Full product requirements with acceptance criteria
- `UIUX-DESIGN.md` — Design system, tokens, component specs, MiaoWu character
- `UIUX-UNIMPLEMENTED.md` — Detailed specs for F2-F8 features not yet implemented
- `ARCHITECTURE.md` — Database schema, API routes, project structure, deployment
- `SPRINT_01_REVIEW.md` — Sprint 1 complete review with code analysis
- `qa-screenshots/` — 6 QA evidence screenshots

## Architecture Notes
- Supabase triggers auto-create profile+streak on user signup
- Supabase triggers auto-increment love_score on praise entry
- RLS policies ensure user data isolation
- Image upload: compress client-side → Supabase Storage → signed URL
- Auth guard: server-side in (main)/layout.tsx, async cookies()

## Technical Debt
- `queries.ts` has 6 helper methods but NO page uses them (shelf/login call supabase directly)
- Excessive inline styles in shelf/page.tsx (562 lines)
- 4 duplicate miaowu image files in public/miaowu/
- Supabase client instantiated at module top-level in queries.ts (SSR risk)

## Sprint 2 Focus
🎯 Close the "Praise" core loop:
1. /praise full implementation (product select + guided questions + mood + submit)
2. praise_entries → love_score +1 → streak update
3. /achievements real data
4. Toast notification system
5. SpeechBubble component

## ⚠️ Production Checklist
- Re-enable Supabase Email Confirmation before production deploy
