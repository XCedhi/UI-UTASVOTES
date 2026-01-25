# Project Structure

## Directory Organization

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── not-found.tsx             # 404 page
│   ├── login/                    # Login page with components
│   ├── student-dashboard/        # Student role dashboard
│   ├── electoral-commission-panel/  # EC role dashboard
│   ├── admin-dashboard/          # Admin role dashboard
│   ├── admin-system-control/     # Admin system management
│   │   ├── election/             # Election management
│   │   ├── ops/                  # Operations (alerts, maintenance, status)
│   │   └── users/                # User management
│   ├── voting-interface/         # Voting UI
│   ├── election-results/         # Results display
│   ├── candidate-registration/   # Candidate application flow
│   ├── campaign-feed/            # Campaign content feed
│   └── [other-pages]/            # Additional pages
├── components/
│   ├── common/                   # Shared components (Header, NotificationCenter, etc.)
│   └── ui/                       # Base UI components (AppIcon, AppImage)
├── contexts/
│   └── AuthContext.tsx           # Authentication context provider
├── lib/                          # Utility functions and configurations
└── styles/
    ├── index.css                 # Global styles
    └── tailwind.css              # Tailwind imports

public/
├── assets/images/                # Static images
└── favicon.ico

supabase/
└── schema.sql                    # Database schema
```

## Architectural Patterns

### Page Structure

Each feature page follows this pattern:
- `page.tsx` - Server component with metadata export
- `components/` folder - Feature-specific components
- `*Interactive.tsx` - Client component wrapper (uses 'use client')

Example:
```
login/
├── page.tsx                      # Server component
└── components/
    ├── LoginInteractive.tsx      # Main client wrapper
    ├── LoginForm.tsx             # Form component
    ├── ElectionAnnouncements.tsx # Sub-component
    └── SystemStatus.tsx          # Sub-component
```

### Component Conventions

- **Server Components**: Default for pages, use for static content and metadata
- **Client Components**: Mark with `'use client'` directive, use for interactivity
- **Interactive wrappers**: Named `*Interactive.tsx`, contain client-side logic
- **Metadata**: Export from page.tsx for SEO

### Import Aliases

- `@/` - Maps to `src/` directory
- Example: `import Icon from '@/components/ui/AppIcon'`

### Styling Approach

- Tailwind utility classes for all styling
- CSS variables for theme colors (defined in globals)
- Custom design tokens in `tailwind.config.js`
- No CSS modules or styled-components

### State Management

- **AuthContext**: Global authentication state via React Context
- **Supabase client**: Centralized in `src/lib/supabase.ts`
- Local state with React hooks for component-level state
- No Redux or external state management libraries

### Database Tables

Core tables (all with RLS enabled):
- `account_requests` - User registration requests
- `elections` - Election records
- `candidates` - Candidate applications
- `feed_items` - Campaign content
- `comments` - Feed item comments
- `notifications` - System notifications

### Icon Usage

Use the `AppIcon` component with Heroicons:
```tsx
import Icon from '@/components/ui/AppIcon';

<Icon name="CheckCircleIcon" variant="outline" size={24} />
```

### Type Safety

- All components use TypeScript
- Interface definitions for props
- Supabase types imported from `@supabase/supabase-js`
- Strict null checks enabled
