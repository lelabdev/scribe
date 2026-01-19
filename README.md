# Scribe - OCR Document Processing App

A SvelteKit 5 application for intelligent document processing using hybrid OCR: Mindee (official documents) and Mistral AI (creative content).

## Features

- **Hybrid OCR System**: Automatic routing between Mindee (invoices, official docs) and Mistral AI (recipes, notes)
- **Mobile-First**: Optimized for document scanning with camera capture
- **Validation Interface**: Two-column layout for reviewing and editing extracted data
- **Local Database**: SQLite with Drizzle ORM for fast local development
- **Modern UI**: Built with Skeleton UI and Tailwind CSS
- **Type-Safe**: Full TypeScript with strict mode

## Tech Stack

- **Framework**: SvelteKit 5 with runes
- **UI Library**: Skeleton UI + Tailwind CSS
- **Database**: SQLite with Drizzle ORM
- **OCR Providers**:
  - Mindee API (official documents, invoices)
  - Mistral AI (creative content, recipes, notes)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Cloudflare Workers

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Mindee API Key
- Mistral API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/scribe.lelab.git
cd scribe.lelab

# Install dependencies
bun install

# Create .env file
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```env
MINDEE_API_KEY=your_mindee_api_key
MISTRAL_API_KEY=your_mistral_api_key
DATABASE_URL=.data/db.sqlite  # Optional, defaults to local file
```

### Development

```bash
# Start development server
bun dev

# Generate database migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Type check
bun run check

# Format code
bun run format
```

## Project Structure

```
src/
├── routes/              # SvelteKit pages
│   ├── +page.svelte       # Upload interface with mobile-first design
│   ├── +page.server.ts    # Server actions (upload, OCR, save)
│   ├── validate/         # Validation page
│   │   ├── +page.svelte      # Two-column review interface
│   │   └── +page.server.ts   # Save document action
├── lib/
│   ├── db/
│   │   ├── schema.ts       # Database schema (SQLite)
│   │   └── index.ts       # Drizzle client
│   ├── supabase-storage.ts # Local file storage
│   ├── ocr-utils.ts      # OCR utility functions (normalize, parse, extract)
│   └── ocr-utils.spec.ts # Unit tests for OCR utilities
e2e/                   # E2E tests with Playwright
├── migrations/            # Database migrations
└── ai/                  # AI context and documentation
```

## How It Works

1. **Upload**: User captures or selects a document image
2. **OCR Processing**:
   - Official documents → Mindee API
   - Creative content → Mistral AI
3. **Validation**: Two-column interface to review extracted data
4. **Storage**: Validated data saved to SQLite database

## Contributing

This is an open-source project! Contributions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Built With

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [Skeleton UI](https://skeleton.dev/) - Design system
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Mindee](https://mindee.com/) - OCR API for documents
- [Mistral AI](https://mistral.ai/) - AI for creative content
