# VCell-AI Backend

FastAPI service behind the VCell AI Platform. It wraps the VCell BioModel database, runs the AI assistant and its tool calling, manages the knowledge base, handles authentication and user records, and serves precomputed model summaries and publication data.

For the platform as a whole — services, deployment, configuration — see the [root README](../README.md).

---

## Architecture

The application is layered, and requests move in one direction through it:

```
routes/  →  controllers/  →  services/
```

| Layer | Responsibility |
|---|---|
| `routes/` | Endpoint definitions, request/response models, and the auth dependencies that guard them |
| `controllers/` | Orchestration and HTTP error mapping |
| `services/` | Business logic and calls to external systems (VCell API, LiteLLM, Qdrant, Supabase, PubMed) |

Everything is `async`. Shared clients are created once as singletons rather than per request. Service functions are traced with Langfuse, so LLM calls, tool executions and their inputs/outputs are observable end to end.

```
backend/
├── app/
│   ├── main.py            # Application entry point and router registration
│   ├── core/              # Settings, logging, auth dependencies, shared clients
│   ├── routes/            # API endpoint definitions
│   ├── controllers/       # Orchestration and error handling
│   ├── services/          # Business logic and external integrations
│   ├── schemas/           # Pydantic request/response models
│   └── utils/             # System prompt, tool definitions, FAQ registry
├── scripts/               # Batch jobs (e.g. summary generation)
├── sql/                   # Supabase schema, as a record of what was applied
├── tests/                 # Pytest suite
├── populate_db.ipynb      # Knowledge-base seeding notebook
└── pyproject.toml
```

---

## Authentication and Authorization

Auth is enforced by FastAPI dependencies, applied per route or per router:

| Dependency | Behaviour |
|---|---|
| `verify_auth0_token` | Requires a valid Auth0 access token; rejects missing, invalid or expired tokens |
| `get_optional_auth0_token` | Accepts requests with or without a token, but still rejects an invalid one — used where logged-out callers get public results and authenticated callers get more |
| `require_admin` | Requires a verified token **and** the `admin` role on the user's Supabase record |

Signing keys are fetched from Auth0 and cached, so a cold start does not depend on network access at import time.

The caller's token is also what unlocks private data: where a route supports it, the verified token is forwarded to the VCell API so a researcher's own private BioModels are included in the response. Callers without a linked VCell account fall back to the public catalogue.

---

## API Surface

Interactive documentation is generated at `/docs` when the server is running. Only the knowledge-base, Qdrant and LiteLLM routers are mounted under a prefix; the rest are served at the root.

### BioModel data — no prefix

Public, with private models included when a token is supplied.

| Endpoint | Purpose |
|---|---|
| `GET /biomodel` | Search and filter the BioModel catalogue |
| `GET /biomodel/{id}/simulations` | Simulations defined on a model |
| `GET /biomodel/{id}/biomodel.vcml` | VCML model definition |
| `GET /biomodel/{id}/biomodel.sbml` | SBML export |
| `GET /biomodel/{id}/biomodel.bngl` | BNGL export (rule-based models) |
| `GET /biomodel/{id}/diagram` | Reaction diagram URL |
| `GET /biomodel/{id}/diagram/image` | Reaction diagram image |
| `GET /biomodel/{id}/applications/files` | Application files |
| `GET /biomodel/{id}/publications` | Publications associated with a model |
| `GET /biomodel/{id}/summary` | Precomputed model summary |
| `GET /biomodels/with-publications` | Keys of every model a publication references, so the search page can filter without a request per result |
| `GET /publications` | Publication catalogue |
| `GET /publications/listing` | Every publication with the models it references and their owners |

### AI assistant — no prefix, authenticated

| Endpoint | Purpose |
|---|---|
| `POST /query` | Conversational query with tool calling |
| `POST /query/faq/{faq_id}` | Quick-action question that executes a known tool directly, skipping tool selection |
| `POST /analyse/{id}` | Analysis of a BioModel |
| `POST /analyse/{id}/vcml` | Analysis of a model's VCML |
| `POST /analyse/{id}/diagram` | Analysis of a model's reaction diagram |

### Users and identity — no prefix, authenticated

| Endpoint | Purpose |
|---|---|
| `POST /users/me` | Verify the token and upsert the user record |
| `GET /users/me/role` | The caller's role |
| `GET /users/me/budget` | The caller's spend and remaining budget |
| `GET /users/vcell/mapped` | The VCell identity linked to the caller, if any |
| `POST /users/vcell/map` | Link an existing VCell account |
| `POST /users/vcell/new` | Create a VCell identity for the caller |
| `POST /users/vcell/recover` | Recover an existing VCell account |
| `DELETE /users/vcell/mapped` | Unlink the VCell account |

VCell credentials submitted for linking are forwarded to the VCell API and never stored.

### Knowledge base — `/kb`, admin only

Create and inspect collections, upload PDF and text documents, list and delete files, retrieve a file's chunks, and run similarity search. Uploaded documents are chunked, embedded and stored with their source, so retrieved passages can be traced back to the document they came from.

### Vector store — `/qdrant`, and gateway administration — `/litellm`

Direct vector operations for advanced use, and admin endpoints for reviewing managed gateway users and updating budgets in bulk.

---

## AI Assistant

The assistant answers by calling tools rather than from memory. Tool definitions and the dispatcher live in `app/utils/`, alongside the system prompt that governs the assistant's persona and when each tool should be used.

Available tools cover: searching the BioModel catalogue, fetching simulation details, retrieving a model's VCML, fetching publications, and searching the knowledge base.

All completions are sent through the **LiteLLM gateway** using the caller's own virtual key, which is what enforces per-user budgets. When a request would exceed a user's budget, or the hosted provider fails, it is retried against the locally hosted model instead of failing, and the response reports which model actually answered.

---

## Precomputed Data

Two datasets are generated ahead of time and stored in Supabase rather than produced per request:

- **Publications** — the VCell publication feed, cleaned at ingest and enriched with abstracts from PubMed.
- **Model summaries** — biologist-facing explanations generated from each model's structure and its associated literature.

Summaries are stored with a hash of their inputs and of the instruction file that produced them, so a re-run regenerates only what has changed and is cheap to resume after a failure. The instruction file is version-controlled at the repository root, so how models are described can be revised without a code change.

```bash
cd backend
poetry run python scripts/generate_summaries.py --limit 10      # trial run
poetry run python scripts/generate_summaries.py --only <bm_key> --force
poetry run python scripts/generate_summaries.py                 # whole catalogue
```

The Supabase tables these rely on are recorded in `sql/`. There is no migration tooling; the files are the record of what was applied.

---

## Quick Start

### Prerequisites

- Python 3.12+ and Poetry
- A running Qdrant instance, and a LiteLLM gateway (both are provided by `docker compose` at the repository root)
- Auth0 and Supabase credentials

```bash
cd backend
poetry install --no-root
cp .env.example .env        # then fill in
poetry run uvicorn app.main:app --reload --port 8000
```

Run from `backend/` — settings are resolved relative to the working directory.

| Endpoint | URL |
|---|---|
| API | http://localhost:8000 |
| Interactive docs | http://localhost:8000/docs |
| OpenAPI schema | http://localhost:8000/openapi.json |

### Configuration

`.env.example` lists every key. Broadly: the LLM provider and its credentials, Qdrant, Langfuse, Auth0, Supabase, and the LiteLLM gateway URL, master key and default user budget.

---

## Testing

```bash
cd backend
poetry run pytest tests/                        # everything
poetry run pytest tests/test_llms_service.py    # one file
```

Tests run from `backend/`; imports resolve via the pytest configuration in `pyproject.toml`, so no path manipulation is needed in test files. Continuous integration runs the same suite on every push and pull request to `main`.

---

## Observability

Langfuse traces LLM calls, tool executions, token usage and latency. Both the backend and the LiteLLM gateway report to it, so a single request can be followed from the endpoint through tool execution to the completion that answered it. Configure it through the Langfuse keys in `.env`; see [SETUP.md](../SETUP.md).

Application logging is configured in `app/core/logger.py`.
