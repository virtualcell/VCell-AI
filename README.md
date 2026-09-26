<h1 align="center">VCell AI Platform</h1>

<p align="center">
An AI-assisted interface for discovering, exploring, and analysing computational biology models from the <a href="https://vcell.org">Virtual Cell (VCell)</a> database.
</p>

VCell-AI lets researchers search VCell BioModels in natural language, ask an assistant to explain a model's structure, reaction diagram or VCML definition, and draw on a curated knowledge base of VCell documentation and literature. Authenticated users who link a VCell account can work with their own private models alongside the public catalogue.

**Live deployment:** [vcell-ai-dev.cam.uchc.edu](https://vcell-ai-dev.cam.uchc.edu)

---

## Features

- **Natural-language BioModel search** — query the VCell catalogue conversationally, with filtering, sorting, and persistent search state.
- **AI model analysis** — explanations of a model's species, reactions, parameters, applications and simulations, grounded in its VCML and reaction diagram.
- **Private model access** — authenticated users who have linked a VCell account see their own private models in search, analysis and chat.
- **Precomputed model summaries** — biologist-facing summaries generated from each model's VCML and its associated literature, served instantly and consistently.
- **Publication data** — papers associated with a BioModel, with abstracts, shown alongside the model. A dedicated **Published Models** page lists the published record of the database, and search results can be filtered to models a publication references.
- **Knowledge base (RAG)** — administrator-curated documents, chunked and embedded into a vector store, searched by the assistant as a tool.
- **File viewers** — VCML, SBML and BNGL, plus an interactive network visualization for rule-based models.
- **Choice of LLM** — a hosted commercial model or a locally hosted model, selectable per message, with automatic fallback to the local model when a budget is exhausted or the hosted provider fails. Every reply is labelled with the model that actually answered it.
- **Per-user cost control** — each account is provisioned with its own gateway key and budget, shown in the UI as a token allowance, with an admin page for adjusting budgets.
- **Conversation history** — conversations are kept per user in the browser and resumable across pages and sessions.

---

## Architecture

The platform runs as four services in `docker compose` — frontend, backend, the LiteLLM gateway and Qdrant — plus a fifth in the Kubernetes deployment, an in-cluster Ollama serving the local model. They sit in front of a set of external systems.

```
                                   ┌──────────────┐
                                   │   Browser    │
                                   └──────┬───────┘
                                          │ HTTPS
                        ┌─────────────────┴──────────────────┐
                        │            Ingress                 │
                        │   /  → frontend    /api → backend  │
                        └───┬────────────────────────┬───────┘
                            │                        │
                  ┌─────────▼────────┐     ┌─────────▼──────────┐
                  │  frontend :3000  │ JWT │  backend :8000     │
                  │  Next.js 15      │────►│  FastAPI · Py 3.12 │
                  │  Auth0 session   │     │  token verify +    │
                  │  route gating    │◄────│  role checks       │
                  └──────────────────┘     └─────────┬──────────┘
                                                     │
            ┌────────────────┬───────────────────────┼─────────────────┐
            ▼                ▼                       ▼                 ▼
  ┌──────────────────┐ ┌──────────┐  ┌────────────────────┐ ┌──────────────────┐
  │  litellm :4000   │ │ qdrant   │  │ VCell API v0 / v1  │ │    Supabase      │
  │  per-user keys   │ │  :6333   │  │ biomodels, VCML,   │ │ users, roles,    │
  │  budgets +       │ │ knowledge│  │ SBML, BNGL,        │ │ virtual keys,    │
  │  model fallback  │ │ base     │  │ diagrams,          │ │ summaries,       │
  │                  │ │ vectors  │  │ publications,      │ │ publications     │
  │                  │ │          │  │ account mapping    │ │                  │
  └───┬──────────┬───┘ └──────────┘  └────────────────────┘ └──────────────────┘
      │          │
      ▼          ▼
┌───────────┐ ┌──────────────────┐
│  OpenAI / │ │  ollama          │
│  Azure    │ │  local model     │
│  OpenAI   │ │  (in-cluster,    │
│  (hosted) │ │   k8s only)      │
└───────────┘ └──────────────────┘

  Auth0     → issues the session the frontend holds and the token the backend verifies
  Langfuse  ← receives traces from the backend services and from the LiteLLM gateway
  PubMed    → abstracts, ingested into Supabase rather than fetched per request
```

**Principles behind this shape:**

- The backend never calls a model provider directly. Every completion goes through the **LiteLLM gateway**, which is what makes per-user attribution, budgets and provider fallback possible.
- The **VCell API remains the source of truth** for model data. Nothing about a BioModel is duplicated except derived summaries and the publication mirror.
- **Qdrant** holds only knowledge-base vectors; **Supabase** holds user records and precomputed data.
- Identity is verified independently on both sides: the frontend holds the session, and the backend validates the access token on every protected request.

| Service | Port | Role |
|---|---|---|
| `frontend` | 3000 | Next.js 15 App Router UI |
| `backend` | 8000 | FastAPI application and API surface |
| `litellm` | 4000 | LLM gateway: virtual keys, budgets, model routing and fallback |
| `qdrant` | 6333 | Vector store for the knowledge base |
| `ollama` | 11434 | Locally hosted model (Kubernetes deployment; run separately for local dev) |

---

## Repository Layout

```
VCell-AI/
├── frontend/            # Next.js 15 application  (see frontend/README.md)
├── backend/             # FastAPI application     (see backend/README.md)
├── kustomize/           # Kubernetes manifests: base + per-environment overlays
├── docs/                # Architecture notes and design documents
├── langfuse/            # Langfuse submodule (self-hosted observability)
├── scripts/             # Repository tooling
├── docker-compose.yml   # Local multi-service stack
├── litellm_config.yaml  # LiteLLM model aliases, fallbacks and gateway settings
└── SETUP.md             # Detailed setup guide, incl. Langfuse and local LLMs
```

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and Python 3.12+ with Poetry (for local, non-containerised development)
- An Auth0 tenant, a Supabase project, and at least one LLM provider (hosted or local)

### Run the full stack

```bash
# Clone with submodules (required for the Langfuse submodule)
git clone --recurse-submodules https://github.com/virtualcell/VCell-AI.git
cd VCell-AI

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp litellm.env.example litellm.env

docker compose up --build -d
```

| Endpoint | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API documentation (Swagger) | http://localhost:8000/docs |
| LiteLLM gateway | http://localhost:4000 |
| Qdrant dashboard | http://localhost:6333/dashboard |

### Run services individually

```bash
# Backend
cd backend && poetry install --no-root
poetry run uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install
npm run dev
```

See **[SETUP.md](SETUP.md)** for the full guide, including Langfuse setup and running entirely on local models.

---

## Configuration

Each service is configured through its own environment file. Every file has a committed `.example` companion listing the required keys.

| File | Covers |
|---|---|
| `backend/.env` | LLM provider, Qdrant, Langfuse, Auth0, Supabase, LiteLLM gateway URL and default budgets |
| `frontend/.env` | Backend API URL and the Auth0 client configuration |
| `litellm.env` | Model aliases and credentials for the gateway, its master key, the Langfuse callback, and the database it persists keys and spend to |

The LiteLLM gateway requires a Postgres connection (`DATABASE_URL`) for virtual keys and budgets to survive a restart.

---

## Authentication and Roles

Authentication is handled by **Auth0**. The frontend holds the session and gates non-public routes; the backend independently verifies the access token on every protected request. Verified users are recorded in Supabase, and that record carries their role, gateway key and budget.

- **Public** — the landing page, the About page, BioModel search and browsing, the Published Models page, and the file viewers.
- **Authenticated** — all AI features (chat, analysis, knowledge-base search), the profile page, and access to private BioModels.
- **Administrator** — knowledge-base management and budget administration.

Users can link an existing VCell account, or create one, from the profile page. Linking is what makes a researcher's private BioModels visible in search, analysis and chat; unlinked users see the public catalogue.

---

## Deployment

Kubernetes manifests live in `kustomize/`, organised as a shared `base` with per-environment `overlays` and `config`. The ingress routes `/api` to the backend and everything else to the frontend, and the frontend image is built once with a relative API base URL so a single image works across environments.

```bash
kubectl apply -k kustomize/overlays/<environment>
```

---

## Documentation

| Document | Contents |
|---|---|
| [SETUP.md](SETUP.md) | Full setup guide: environment, Langfuse, local LLMs, troubleshooting |
| [backend/README.md](backend/README.md) | Backend architecture, API surface, testing, batch jobs |
| [frontend/README.md](frontend/README.md) | Frontend structure, routes, auth handling, build |
| [docs/architecture.md](docs/architecture.md) | Design goals, request flows, LLM tool-calling pipeline |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Branching, commit conventions and review process |

---

## License

Released under the MIT License. See [LICENSE](LICENSE).
