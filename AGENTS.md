<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:css-rules -->
# UI Styling Strategy: VANILLA CSS ONLY (NO TAILWIND)

CRITICAL RULE: This project **DOES NOT USE Tailwind CSS**. 
Do NOT write utility classes like `px-4`, `bg-blue-500`, `flex`, `text-sm`, etc. They will silently fail and render as unstyled HTML.
All UI components must be styled using **pure Vanilla CSS** defined in `src/styles/skeuomorphic.css`.
The project follows a strict Skeuomorphic (拟物化) design system (leather, brass, wood, parchment). Re-use existing CSS classes like `.btn-primary`, `.leather-card`, etc., or write new custom CSS classes in `skeuomorphic.css`.
<!-- END:css-rules -->
