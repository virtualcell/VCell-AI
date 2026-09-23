# VCell-AI Frontend

Next.js 15 application for the VCell AI Platform. It provides the search, analysis, chat and administration interfaces, holds the user's authenticated session, and keeps their conversation history.

For the platform as a whole — services, deployment, configuration — see the [root README](../README.md).

---

## Structure

```
frontend/
├── app/                  # App Router pages
│   ├── page.tsx            # Landing page
│   ├── about/              # How the system works, limitations, sources, citation
│   ├── search/             # BioModel search
│   │   └── [bmid]/           # Model detail: metadata, diagram, files, summary,
│   │                         # publications, and the AI analysis tab
│   ├── chat/               # General-purpose AI assistant
│   ├── profile/            # Account, and VCell account linking
│   ├── vcml/               # VCML viewer
│   ├── sbml/               # SBML viewer
│   ├── diagrams/           # Reaction diagram viewer
│   └── admin/
│       ├── knowledge-base/   # Knowledge base management
│       └── litellm/          # User budget administration
├── components/           # Shared components
│   └── ui/                 # ShadCN / Radix primitives
├── hooks/                # Custom hooks, including conversation history
├── lib/                  # Auth client, conversation storage, API helpers
├── styles/               # Global styles
├── middleware.ts         # Route gating
└── public/               # Static assets
```

---

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page and entry points |
| `/about` | Public | AI models in use, data handling, limitations, sources, citation |
| `/search` | Public | BioModel search with filters and sorting |
| `/search/[bmid]` | Public (AI tab gated) | Model detail: metadata, diagram, files, summary, publications, AI analysis |
| `/chat` | Public (queries gated) | Conversational assistant over the BioModel database |
| `/vcml`, `/sbml`, `/diagrams` | Public | File-format viewers |
| `/profile` | Authenticated | Account details and VCell account linking |
| `/admin/knowledge-base` | Administrator | Upload, inspect and remove knowledge-base documents |
| `/admin/litellm` | Administrator | Review and adjust user budgets |

---

## Authentication

Sessions are handled by Auth0. `middleware.ts` gates every route that is not explicitly public and redirects unauthenticated users to the login flow, preserving where they were headed.

The access/gating model is deliberately split:

- **Browsing is open.** Search, model pages and the file viewers work without an account — the public catalogue should be discoverable.
- **AI features require an account.** They cost money to serve and must be attributable, so the chat input and the analysis actions prompt for sign-in at the point of use, with a dialog that explains why, rather than redirecting away from the page.
- **Admin sections are hidden** from users without the role, and the backend enforces the same check independently.

Requests to protected backend endpoints carry the user's access token. After login, the session is synced to the backend, which creates or updates the user record and provisions their gateway key.

---

## Conversation History

Conversations are stored in the browser, namespaced per user, so two people using the same machine never see each other's history. A **Conversation History** section in the sidebar lists past conversations and switches between them.

All AI surfaces write to the same store, so an exchange started on a model page can be resumed from the chat page and vice versa. In-flight requests survive switching conversations, and conversations started from a model are titled with that model's name.

Keeping history client-side is deliberate: chat content is never written to a server-side store.

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | ShadCN UI on Radix primitives |
| Authentication | `@auth0/nextjs-auth0` |
| Content | React Markdown with GFM, KaTeX for mathematics, XML viewer for model files |
| Forms | React Hook Form with Zod validation |
| Motion & icons | Framer Motion, Lucide |

---

## Quick Start

### Prerequisites

- Node.js 18+
- A running backend (see [backend/README.md](../backend/README.md), or `docker compose up` at the repository root)
- An Auth0 application

```bash
cd frontend
npm install                 # or pnpm install
cp .env.example .env        # then fill in
npm run dev
```

The application runs at http://localhost:3000.

### Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL. Absolute for local development; relative (`/api`) where an ingress proxies the backend |
| `AUTH0_SECRET` | Secret used to encrypt the session cookie |
| `APP_BASE_URL` | Public base URL of this application |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `AUTH0_AUDIENCE` | API audience, so the issued token is accepted by the backend |

`NEXT_PUBLIC_API_URL` is read at build time. The Docker image defaults it to the relative `/api` so one image works in any environment behind an ingress; local `docker compose` overrides it with an absolute URL at build time, since there is no proxy in front of it there.

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint
```

Note that linting and type errors are not enforced during the Next.js build, so run `npm run lint` explicitly.

### Docker

```bash
docker build -t vcell-frontend .        # from frontend/
docker compose up frontend              # from the repository root
```
