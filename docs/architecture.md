# VCell-AI Architecture

## Design Goals

- Provide an AI-powered conversational interface for discovering, analyzing, and exploring biomodels in the VCell database
- Allow researchers to ask natural-language questions and receive technically precise, citation-backed answers about computational biology models
- Integrate a knowledge base (RAG) so the assistant can draw on VCell documentation and literature, not just the biomodel database
- Keep the system observable end-to-end via Langfuse tracing

## Architectural Decisions

<!-- As the project matures, document decisions and their rationale here.
     Use the format:
       ### ADR-NNN: Title
       **Status:** Accepted | Superseded | Deprecated
       **Context:** Why the decision was needed.
       **Decision:** What was chosen.
       **Consequences:** Trade-offs accepted.
-->

### ADR-001: Placeholder

_No architectural decision records have been captured yet. Add entries here as significant choices are made (e.g., switching LLM providers, changing the chunking strategy, adding streaming)._

## System Overview

```
┌──────────────┐        JSON/REST         ┌──────────────────────┐
│   Frontend   │ ◄──────────────────────► │      Backend         │
│  Next.js 15  │      port 3000 → 8000    │     FastAPI          │
│  TypeScript  │                          │     Python 3.12      │
└──────────────┘                          └───────┬──────────────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌────────────┐
                              │  Azure   │ │  VCell   │ │   Qdrant   │
                              │  OpenAI  │ │  API     │ │  Vector DB │
                              └──────────┘ └──────────┘ └────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │ Langfuse │
                              │ Tracing  │
                              └──────────┘
```

### Frontend (Next.js 15, App Router)

Key pages:

| Route | Purpose |
|---|---|
| `/chat` | General-purpose AI chatbot |
| `/search/[bmid]` | Biomodel search results |
| `/analyze/[id]` | Deep analysis of a single biomodel (diagram, VCML, follow-up Q&A) |
| `/admin/knowledge-base` | Upload/manage documents in the RAG knowledge base |
| `/diagrams`, `/sbml`, `/vcml` | File-format viewers (BNGL is offered as a download from `/sbml` and `/search/[bmid]`, not its own page) |

The main interactive component is `ChatBox` (`components/ChatBox.tsx`). It manages conversation state locally, sends the full conversation history to the backend on each turn, and post-processes the response to turn biomodel IDs into clickable links.

### Backend (FastAPI)

Layered as **routes → controllers → services**:

- **Routes** (`app/routes/`) — HTTP endpoint definitions and request parsing
- **Controllers** (`app/controllers/`) — orchestration and error handling
- **Services** (`app/services/`) — business logic and external API calls

Route groups (only `/kb` and `/qdrant` are mounted under a prefix in `main.py`; the LLM and VCellDB routers are mounted at the root):

| Group | Mount | Representative endpoints |
|---|---|---|
| LLM | (no prefix) | `POST /query`, `POST /analyse/{id}`, `POST /analyse/{id}/vcml`, `POST /analyse/{id}/diagram` |
| VCellDB | (no prefix) | `GET /biomodel`, `GET /biomodel/{id}/simulations`, `GET /biomodel/{id}/biomodel.vcml`, `GET /biomodel/{id}/biomodel.sbml`, `GET /biomodel/{id}/diagram`, `GET /publications` |
| Knowledge base | `/kb` | `POST /kb/upload-pdf`, `POST /kb/upload-text`, `GET /kb/files`, `GET /kb/similar` |
| Qdrant | `/qdrant` | `POST /qdrant/collection`, `POST /qdrant/points`, `POST /qdrant/search` |

Singletons (`app/core/singleton.py`) hold the Azure OpenAI client (wrapped by Langfuse for automatic tracing) and the Qdrant client.

### External Dependencies

- **Azure OpenAI** — LLM completions and text embeddings (model names configured via env vars)
- **VCell API** (`vcell.cam.uchc.edu/api/v0`) — authoritative source for biomodel metadata, VCML/SBML files, diagrams, and publications
- **Qdrant** — vector database for knowledge-base embeddings; runs as a Docker service on port 6333
- **Langfuse** — observability platform; every LLM call and service function is traced via `@observe` decorators and the Langfuse-wrapped OpenAI client

## Request / Response Flows

### Chat query with tool calling

This is the primary interaction pattern. The LLM decides which tools to call based on the user's question, executes them, then synthesizes a final answer.

```
User types message in ChatBox
        │
        ▼
Frontend builds conversation_history array
(all prior messages including system context)
        │
        ▼
POST /query  { conversation_history: [...] }
        │
        ▼
llms_router → llms_controller → llms_service.get_response_with_tools()
        │
        ▼
 ┌──────────────────────────────────────────────┐
 │  LLM Call #1: "Retrieve Tools"               │
 │  (system_prompt + history + tool definitions) │
 │  tool_choice = "auto"                        │
 └──────────────────┬───────────────────────────┘
                    │
         LLM returns tool_calls[]
                    │
                    ▼
 ┌──────────────────────────────────────────────┐
 │  Tool Execution Loop                         │
 │  For each tool_call:                         │
 │    execute_tool(name, args)                  │
 │      ├─ fetch_biomodels    → VCell API       │
 │      ├─ fetch_simulation_details → VCell API │
 │      ├─ get_vcml_file      → VCell API       │
 │      ├─ fetch_publications → VCell API       │
 │      └─ search_vcell_knowledge_base          │
 │              → embed query → Qdrant search   │
 │                                              │
 │  Append each result as a tool message        │
 └──────────────────┬───────────────────────────┘
                    │
                    ▼
 ┌──────────────────────────────────────────────┐
 │  LLM Call #2: "Process Tool Results"         │
 │  (full message history including tool output)│
 └──────────────────┬───────────────────────────┘
                    │
                    ▼
Return { response: "...", bmkeys: ["id1", "id2", ...] }
        │
        ▼
Frontend formats biomodel IDs as links → renders with MarkdownRenderer
```

**Notes:**
- There is no streaming; the frontend shows a loading spinner until the full response arrives.
- Biomodel keys (`bmkeys`) are extracted from tool results so the frontend can hyperlink them.
- VCML content is sanitized (ImageData tags stripped) before being sent to the LLM.
- VCML fetch has retry logic with exponential backoff (up to 3 attempts).

### Biomodel analysis page

When a user navigates to `/analyze/[id]`, three requests fire in parallel:

```
GET  /biomodel?bmId={id}            → biomodel metadata
POST /analyse/{id}/diagram          → LLM vision analysis of the diagram image
POST /analyse/{id}?user_prompt=...  → LLM analysis of the biomodel + VCML
```

The results seed the ChatBox with an initial analysis. The user can then ask follow-up questions or use quick actions (e.g., "Describe parameters", "Describe species") which route through the same tool-calling flow above, with a prompt prefix scoping the question to the specific biomodel.

### Knowledge-base ingestion (RAG)

```
POST /kb/upload-pdf  (multipart file upload)
        │
        ▼
Extract text with MarkItDown (PDF → Markdown)
        │
        ▼
Chunk with RecursiveCharacterTextSplitter
  (chunk_size=1250, overlap=250)
        │
        ▼
For each chunk:
  embed_text(chunk) → Azure OpenAI embeddings (1536-dim)
  upsert to Qdrant with payload { file_name, chunk, chunk_index, total_chunks }
```

When the LLM calls `search_vcell_knowledge_base` during a chat:

```
embed_text(query) → cosine similarity search in Qdrant → top-k chunks returned as tool result
```

## LLM Tools

Five tools are available to the LLM (defined in `app/utils/tools_utils.py`, all with `strict=True` JSON schemas):

| Tool | Purpose |
|---|---|
| `fetch_biomodels` | Search/filter VCell biomodel database by name, owner, category, date range |
| `fetch_simulation_details` | Get simulation data for a specific biomodel |
| `get_vcml_file` | Retrieve and sanitize the VCML model definition |
| `fetch_publications` | Get VCell-related publications |
| `search_vcell_knowledge_base` | RAG search over uploaded documents in Qdrant |

The system prompt (`app/utils/system_prompt.py`) instructs the LLM on when and how to use each tool — for example, always calling `get_vcml_file` when asked to describe parameters, species, or reactions.
