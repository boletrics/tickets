# Boletrics Tickets

The **Tickets** application is the customer-facing ticketing portal for Boletrics, built with [Next.js](https://nextjs.org/) and deployed on [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/).

## Overview

This application serves as the public marketplace where customers can discover events, purchase tickets, and manage their orders:

- **Event Discovery** - Browse and search for events
- **Event Details** - View event information, dates, venues, and ticket options
- **Ticket Purchase** - Select ticket types and complete purchases
- **Order Confirmation** - Purchase success flow with order details
- **My Tickets** - View upcoming and past tickets with QR codes
- **Ticket Management** - Download tickets, email tickets, view QR codes
- **Multi-language Support** - English and Spanish (es-MX) localization

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand + Nanostores
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: SWR
- **Charts**: Recharts
- **Authentication**: Better Auth integration (with guest checkout support)
- **Testing**: Vitest + React Testing Library
- **Visual Testing**: Storybook
- **Deployment**: Cloudflare Workers via OpenNext

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## Available Scripts

| Command             | Description                                    |
| :------------------ | :--------------------------------------------- |
| `pnpm dev`          | Start development server on port 3001          |
| `pnpm build`        | Build for production                           |
| `pnpm preview`      | Preview production build locally               |
| `pnpm deploy`       | Build and deploy to Cloudflare Workers         |
| `pnpm lint`         | Run ESLint                                     |
| `pnpm format`       | Format code with Prettier                      |
| `pnpm format:check` | Check code formatting                          |
| `pnpm typecheck`    | Run TypeScript type checking                   |
| `pnpm test`         | Run tests with coverage                        |
| `pnpm test:watch`   | Run tests in watch mode                        |
| `pnpm storybook`    | Start Storybook on port 6006                   |
| `pnpm ci:check`     | Run all CI checks (format, lint, types, tests) |

## Project Structure

```
tickets/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home page (event discovery)
│   │   ├── events/[id]/        # Event details page
│   │   ├── search/             # Event search
│   │   ├── my-tickets/         # User's tickets
│   │   ├── success/            # Order confirmation
│   │   └── auth/               # Auth callback handling
│   ├── components/
│   │   ├── header.tsx          # Site header
│   │   ├── event-card.tsx      # Event display card
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks (locale, theme, toast)
│   ├── lib/
│   │   ├── api/                # API clients and hooks
│   │   ├── auth/               # Auth configuration
│   │   └── auth-store.ts       # Auth state management
│   ├── stories/                # Storybook stories
│   └── test/                   # Test utilities
├── public/                     # Static assets (event images, icons)
└── wrangler.jsonc              # Cloudflare Workers configuration
```

## Related Services

- **auth-svc** - Authentication backend service
- **tickets-svc** - Ticketing backend service (event data, orders, tickets)
- **auth** - Authentication frontend (login, signup, account)
- **partner** - Organization dashboard (for event organizers)
- **admin** - Platform administration dashboard
