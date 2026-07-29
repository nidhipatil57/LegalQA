# Contributing Guidelines

Thank you for contributing to LegalQA! This document outlines code standards, folder organization conventions, and development practices.

## Directory Structure Strategy

```
LegalQA/
├── docs/                # Architecture, API, and setup documentation
├── prisma/              # Prisma schema definition
├── public/              # Static assets (fonts, icons, images)
├── scripts/             # Database control and migration helpers
├── src/                 # Main application source
│   ├── app/             # Next.js App Router (pages and API endpoints)
│   ├── components/      # UI components grouped by feature domain
│   │   ├── ui/          # Generic reusable base controls
│   │   ├── dashboard/   # Dashboard widgets
│   │   └── contracts/   # Contract lists and review screens
│   ├── features/        # Core business operations (auth, rag, risks)
│   ├── lib/             # Third-party wrappers (Prisma client singleton, Groq)
│   └── types/           # Domain typescript definitions
└── uploads/             # Git-ignored local files directory
```

## Code Quality Standards

1. **Keep components focused**: Use the `src/components/ui/` directory for modular elements (Buttons, Cards, Badges).
2. **Defensive destructuring**: Always provide safe defaults (e.g. `metrics = { ... }`) when consuming data returned by fetch blocks.
3. **Handle redirects**: Always inspect HTTP response status inside fetch hooks. Redirect to `/login` if a `401 Unauthorized` response is returned.
4. **Local Fallback**: Any cloud API parser pipeline must wrap calls in try/catch blocks to trigger local fallback engines if the service fails.
