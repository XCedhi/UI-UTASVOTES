# Technology Stack

## Core Framework

- **Next.js 15** with App Router
- **React 19** for UI components
- **TypeScript 5** for type safety

## Styling & UI

- **Tailwind CSS 3.4.6** - Utility-first CSS framework
- **Custom design system** with CSS variables for theming
- **Glassmorphism** design patterns
- **@heroicons/react** for icons (outline and solid variants)
- **Recharts** for data visualization

## Backend & Database

- **Supabase** (PostgreSQL) for database and authentication
- **@supabase/supabase-js** client library
- Row Level Security (RLS) policies enabled on all tables

## Development Tools

- **ESLint** with Next.js config and Prettier integration
- **TypeScript** strict mode
- **PostCSS** with Autoprefixer
- **@dhiwise/component-tagger** for component tracking

## Key Dependencies

```json
{
  "next": "^15.5.9",
  "react": "19.0.3",
  "react-dom": "19.0.3",
  "@supabase/supabase-js": "^2.91.1",
  "@heroicons/react": "^2.2.0",
  "recharts": "^2.15.2"
}
```

## Common Commands

```bash
# Development server (runs on port 4028)
npm run dev

# Production build
npm run build

# Start production server
npm run serve

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format

# Type checking
npm run type-check
```

## Configuration Notes

- Development server runs on **port 4028** (not default 3000)
- TypeScript and ESLint errors are ignored during builds (`ignoreBuildErrors: true`)
- Source maps enabled in production
- Root path (`/`) redirects to `/login`
- Remote images allowed from: unsplash.com, pexels.com, pixabay.com, img.rocket.new

## Build System

Next.js 15 with custom webpack configuration for component tagging. Uses Vercel-optimized build pipeline with Netlify plugin support.
