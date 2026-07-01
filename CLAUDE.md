# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VCell-AI is an AI-powered web application for discovering, analyzing, and exploring biomodels from the VCell database. It combines a Next.js 15 frontend with a FastAPI backend, using Qdrant for vector search and OpenAI/Azure for LLM capabilities (with Langfuse for observability).

## Architecture

**Monorepo with two main services:**

- **`frontend/`** — Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/Radix UI components
- **`backend/`** — FastAPI (Python 3.12+), Poetry for dependency management, routes → controllers → services layered architecture

**Backend layers follow:** `routes/` (API endpoints) → `controllers/` (HTTP mapping + `HTTPException` handling) → `services/` (business logic, external API calls). Controllers call services directly. FastAPI `Depends()` is used only for **auth** (see below), not for wiring services. Pydantic request models live in `schemas/`; many responses are plain dicts. Everything is `async`.

**Key backend routers** (registered in `app/main.py`; note only two have URL prefixes):
- `vcelldb_router` — mounted at **root** (e.g. `/biomodel`, `/biomodel/{bmId}/biomodel.vcml`). Proxies the VCell API for biomodels, simulations, VCML/SBML files, diagrams, publications.
- `llms_router` — mounted at **root**. LLM queries with tool calling, biomodel analysis, VCML/diagram analysis. **All routes require a valid Auth0 bearer token** via `Depends(verify_auth0_token)`.
- `knowledge_base_router` — prefix `/kb`. Knowledge base CRUD (PDF/text upload, collection management, similarity search).
- `qdrant_router` — prefix `/qdrant`. Direct vector database operations.
- `users_router` — mounted at **root**. `POST /users/me` verifies the Auth0 token and upserts the user into Supabase (`sync_auth0_user`).

**Auth (Auth0 + Supabase):** Backend verifies Auth0 RS256 JWTs in `core/auth.py` — `verify_auth0_token` (a FastAPI dependency) fetches Auth0's JWKS via `PyJWKClient` (cached lazily) and validates audience/issuer. User rows are synced into Supabase (`services/users_service.py`, `users` table, upsert on `auth0_sub`). The frontend uses `@auth0/nextjs-auth0`: `middleware.ts` gates all non-public routes (only `/` and `/auth/*` are public) and redirects to `/auth/login`; `lib/auth0.ts` configures the client; `components/auth-sync.tsx` calls `POST /users/me` with the access token after login. Frontend `fetch()` calls to protected backend routes must include `Authorization: Bearer <token>` (from `getAccessToken()`).

**Frontend page routes:**
- `/chat` — AI chatbot interface
- `/search/[bmid]` — Biomodel search results
- `/analyze/[id]` — Model analysis tools (VCML, diagram, simulation analysis)
- `/diagrams`, `/sbml`, `/vcml`, `/bngl` — File format viewers
- `/admin/knowledge-base` — KB management dashboard

**Infrastructure:** Docker Compose orchestrates frontend (port 3000), backend (port 8000), and Qdrant (port 6333). Langfuse is available as a git submodule with its own docker-compose.

## Build & Development Commands

### Frontend (`frontend/`)
```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
```

### Backend (`backend/`)
```bash
poetry install --no-root                          # Install dependencies
cd backend && poetry run uvicorn app.main:app --reload   # Dev server at http://localhost:8000
cd backend && poetry run pytest tests/            # Run all tests (run from backend/; tests live in backend/tests/)
cd backend && poetry run pytest tests/test_vcelldb_service.py  # Single test file
cd backend && poetry run pytest tests/test_llms_service.py::TestLLMsService::test_analyse_vcml_success  # Single test
```

### Docker (full stack)
```bash
docker compose up --build -d    # Start all services
docker compose down             # Stop all services
```

## Environment Variables

**Backend** (`backend/.env`) — loaded by Pydantic `BaseSettings` (`backend/app/core/config.py`, `env_file=".env"`), resolved relative to the working directory; run the backend and tests from `backend/` so it's found. Keys: `FRONTEND_URL`, `PROVIDER` (azure/local), Azure OpenAI keys (`AZURE_API_VERSION`, `AZURE_ENDPOINT`, `AZURE_API_KEY`, `AZURE_DEPLOYMENT_NAME`, `AZURE_EMBEDDING_DEPLOYMENT_NAME`), Qdrant config (`QDRANT_URL`, `QDRANT_COLLECTION_NAME`), Langfuse keys (`LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_HOST`), Auth0 (`AUTH0_DOMAIN`, `AUTH0_AUDIENCE`) and Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — the last four are `Optional` in `config.py` but required at runtime for auth/user-sync to work. `config.py` uses `SettingsConfigDict(env_file=".env", extra="ignore")`. See `backend/.env.example`.

**Frontend** (`frontend/.env`): `NEXT_PUBLIC_API_URL` (backend URL), plus the standard `@auth0/nextjs-auth0` v4 server vars (`AUTH0_SECRET`, `APP_BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, and `AUTH0_AUDIENCE` — read in `lib/auth0.ts`). Note: there is currently **no `frontend/.env.example`** committed.

## Key Implementation Details

- The LLM system prompt (`backend/app/utils/system_prompt.py`) defines the VCell BioModel Assistant persona
- LLM tool calling: tool definitions live in `backend/app/utils/tools_utils.py` (`fetch_biomodels_tool`, `fetch_simulation_details_tool`, `search_knowledge_base_tool`), dispatched by `execute_tool`; schemas in `schemas/tool_schema.py`
- OpenAI, Qdrant, and Supabase clients are **module-level singletons** in `backend/app/core/singleton.py` (`get_openai_client`, `get_qdrant_client`, `get_supabase_client`) — grab them via the `get_*` accessors, don't re-instantiate
- Services are wrapped with Langfuse `@observe` for LLM/tracing observability; the OpenAI client is the Langfuse-wrapped Azure client
- Knowledge base uses RAG via Qdrant vector search: LangChain text splitter + Azure OpenAI embeddings; collection is auto-created on FastAPI startup (`app/main.py` `startup_event`). `populate_db.ipynb` seeds it
- Frontend talks to the backend via bare `fetch()` calls in client components (no shared API client, no React Query/SWR); base URL comes from `NEXT_PUBLIC_API_URL`
- Frontend uses KaTeX (`rehype-katex`/`remark-math`) for math rendering; forms use react-hook-form + Zod; UI is ShadCN/Radix
- ESLint, TypeScript errors, and image optimization are all disabled during Next.js builds (`next.config.mjs`)
- CORS is open to all origins in the FastAPI backend

## Contributing

- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Create feature branches from `main`
- Tests live in `backend/tests/` and run from `backend/`. Import resolution relies on `[tool.pytest.ini_options] pythonpath = ["."]` in `backend/pyproject.toml` (rootdir = `backend/`, so `app` is importable) — no `sys.path` hacks in test files
- CI (`.github/workflows/ci.yml`, "Backend CI") runs `poetry run pytest tests/ --maxfail=1 --disable-warnings -q` from `backend/` on push/PR to `main`; env is injected from GitHub Secrets into `backend/.env`. No frontend job. No linter/formatter step runs in CI (`black` is a dev dep but unconfigured)
- Clone with `--recurse-submodules` to get the Langfuse submodule
