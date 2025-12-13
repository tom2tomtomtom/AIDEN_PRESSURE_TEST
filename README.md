# Phantom Pressure Test

> Synthetic qualitative research tool with Phantom Consumer Memory™

## Overview

Phantom Pressure Test uses AI-powered consumer personas with accumulated category experiences ("phantom memories") to pressure-test marketing concepts before human research.

**Core Innovation:** Phantom Consumer Memory™ - personas carry experiential histories that shape their skepticism, trust levels, and response patterns.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (magic links)
- **LLM:** Claude Sonnet 4 via Anthropic API
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Railway

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tom2tomtomtom/AIDEN_PRESSURE_TEST.git
cd AIDEN_PRESSURE_TEST
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `ANTHROPIC_API_KEY` - Your Anthropic API key

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
phantom-pressure-test/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Auth routes (login, register)
│   ├── (dashboard)/             # Protected dashboard routes
│   └── api/                     # API route handlers
├── lib/                         # Shared utilities
│   ├── supabase/               # Supabase client + helpers
│   ├── anthropic/              # Claude API integration
│   ├── prompts/                # Prompt templates
│   └── utils/                  # General utilities
├── components/                  # React components
│   ├── ui/                     # shadcn/ui components
│   ├── forms/                  # Form components
│   ├── results/                # Results display components
│   └── layout/                 # Layout components
├── types/                       # TypeScript types
│   ├── database.ts             # Supabase generated types
│   ├── api.ts                  # API request/response types
│   └── domain.ts               # Domain model types
└── supabase/
    ├── migrations/             # Database migrations
    └── seed/                   # Seed data scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run db:generate-types` - Generate TypeScript types from Supabase
- `npm run db:push` - Push database migrations
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed database

## Development Guide

See [CLAUDE.md](./CLAUDE.md) for detailed development guidance including:
- Naming conventions
- API response formats
- Error handling patterns
- Supabase client usage
- LLM prompt patterns
- State management
- Testing strategy

## Progress Tracking

See [PROGRESS.md](./PROGRESS.md) for sprint tracking and development progress.

## Documentation

- [Database Blueprint](./01-database.md)
- [Persona Engine Blueprint](./03-persona-engine.md)
- [Test Execution Blueprint](./04-test-execution.md)

## License

Private - All Rights Reserved

## Contact

Project Owner: Tom Hyde
Repository: https://github.com/tom2tomtomtom/AIDEN_PRESSURE_TEST

