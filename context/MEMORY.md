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

## Documents Created
- docs/PRD.md — Full product requirements with acceptance criteria
- docs/UIUX-DESIGN.md — Design system, tokens, component specs, MiaoWu character
- docs/ARCHITECTURE.md — Database schema, API routes, project structure, deployment
- README.md — Project overview and quick start

## Architecture Notes
- Supabase triggers auto-create profile+streak on user signup
- Supabase triggers auto-increment love_score on praise entry
- RLS policies ensure user data isolation
- Image upload: compress client-side → Supabase Storage → signed URL
