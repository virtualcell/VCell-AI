# Development Branch Summary

Summary of the `development` branch contribution relative to `main`. This branch adds BioModels Database (BMDB) integration as a second data source alongside the existing VCell database, along with performance optimizations to the LLM tool-calling pipeline.

**Stats:** 60 commits, 26 files changed, ~1,667 lines added, ~254 lines removed (vs. `origin/main`).

## Features

### 1. BioModels Database (BMDB) Integration

The core feature is a second biomodel data source — the EBI BioModels Database (`biomodels.org`) — available alongside the existing VCell database (VCDB).

**Backend:**
- New route group (`bmdb_router.py`) with endpoints: `GET /search`, `GET /get-xml`, `GET /model-info`
- New controller (`bmdb_controller.py`) and schema (`bmdb_schema.py` with `BMDBRequestParams`)
- Three new service functions in `databases_service.py`:
  - `fetch_bmdb_models()` — searches BioModels via `biomodels.org/search?query=...&format=json`
  - `get_xml_file()` — downloads SBML XML for a BIOMD/MODEL ID with retry logic
  - `get_bmdb_model_info()` — fetches model metadata by ID
- New LLM endpoint `POST /bmdb-search` for BMDB-specific queries with tool calling
- Two new LLM tools: `fetch_bmdb_models` and `get_xml_file` (in a separate `BMDB_TOOLS` list)
- `get_response_with_tools()` now takes a `database` parameter ("vcdb" or "bmdb") to select which tool set the LLM receives

**Frontend:**
- `ChatBox` component extended with database selection checkboxes (VCell DB / BioModels DB)
- Dual-send capability: when both databases are selected, queries go to both `/query` and `/bmdb-search` in parallel
- Separate `handleSendMessage()` (VCDB) and `handleSendMessageBMDB()` (BMDB) functions
- Biomodel ID linking adapted per database: VCDB links go to `/search/{id}`, BMDB links go to `biomodels.org/{id}`
- Quick action buttons change based on selected database(s): `VCellActions`, `bmdbActions`, or combined
- `/search/[bmid]` page detects BMDB IDs (prefix `BIOMD` or `MODEL`) and renders a BMDB-specific detail view with:
  - Model name, author, description (parsed from XML via `DOMParser`)
  - Downloadable files list
  - Diagram image (fetched as PNG from BMDB, converted to base64)
  - AI Analysis tab with BMDB-scoped ChatBox
- `/search` page updated with a new search box and results rendering for BMDB queries
- `/chat` page updated with database-specific quick action sections

### 2. LLM Response Time Optimizations

Several changes target reducing latency in the tool-calling pipeline:

- **Tool subset selection:** Instead of sending all tools to the LLM, `select_tools_for_prompt()` uses regex pattern matching on the user's message to choose a relevant subset (`DB_TOOLS`, `KB_TOOLS`, `PUB_TOOLS`)
- **Direct chat path:** `should_use_tools()` detects simple conversational prompts (e.g., "summarize this") and bypasses tool calling entirely via `_direct_chat_completion()`
- **Concurrent tool execution:** Tool calls are now executed with `asyncio.gather()` instead of sequentially
- **Result summarization:** `summarize_tool_result()` truncates model descriptions to 200 chars and limits to 5 models to reduce token count in the second LLM call
- **Reduced default result count:** `maxRows` lowered from 1000 to 25 (with min=1, max=50)
- **Conversation history trimming:** Frontend sends only system messages + last 5 non-system messages instead of the full history

### 3. UI Enhancements

- **Stop button:** Aborts in-flight requests using `AbortController`
- **Conversation persistence:** Chat history saved to `localStorage`, conversations listed in sidebar, loadable via `?conversation=<id>` query param
- **Sidebar updates:** Real-time conversation list, loaded from `localStorage` on `conversation-updated` events
- **Assistant message width:** Changed from `max-w-[80%]` to `w-full` for better readability
- **Tool timing summary:** Each response includes timing breakdown (tool selection, execution, final LLM call, total) displayed in the chat

### 4. Minor Changes

- Renamed `vcelldb_service.py` to `databases_service.py` to generalize for multiple data sources
- Renamed `supplementalActions` prop to `VCellActions`
- Date filter parameters (`savedLow`, `savedHigh`) commented out throughout
- Admin settings page updated with setup instructions
- `Suspense` wrapper added around chat page for `useSearchParams` compatibility
- System prompt broadened from "VCell BioModel Assistant" to "mathematical modeler in biology", then **split into three files** (`system_prompt.py` shared, `vcdb_system_prompt.py`, `bmdb_system_prompt.py`) so each path can be tuned independently
- System prompt adds explicit formatting templates for VCDB and BMDB biomodel listings, plus a rule that any model element with an `identifiers.org` link must render as an underlined hyperlink (and only those elements should be hyperlinked)
- Frontend logs the number of rows fetched for biomodel list queries
- Added `NEXT_PUBLIC_API_URL_BMDB` environment variable for direct BMDB API calls from frontend

## Code Style Observations

- Significant amount of debug logging (`print("DEBUG20: ...")`, `console.log("PPPPPP: ...")`) remains in the code — intended for development, should be cleaned up before merge
- Commented-out code blocks throughout (`// old implementation`, `# "savedLow"`, etc.) rather than being removed
- `handleSendMessageBMDB()` is largely a copy of `handleSendMessage()` with BMDB-specific changes — these share ~80% of their logic
- Inconsistent indentation in some Python files (mix of 3-space and 4-space in `tools_utils.py` and `llms_service.py`)
- Some unused imports added (`from multiprocessing import process`, `import requests` in `llms_router.py`)

## Validation

- No new tests were added for the BMDB integration
- The existing test file (`test_vcelldb_service.py`) had its import updated from `vcelldb_service` to `databases_service`
- CI workflow (`ci.yml`) runs existing backend tests on push/PR to main
- The branch has not been validated against the CI pipeline for BMDB-specific functionality

## Architecture Impact

```
                                    ┌──────────────────────┐
                                    │   ChatBox            │
                                    │  ┌────────────────┐  │
                                    │  │ useVCDB toggle  │  │
                                    │  │ useBMDB toggle  │  │
                                    │  └───┬────────┬───┘  │
                                    └──────┼────────┼──────┘
                                           │        │
                              POST /query  │        │  POST /bmdb-search
                                           ▼        ▼
                                    ┌──────────────────────┐
                                    │   llms_router.py     │
                                    │  database="vcdb"     │
                                    │  database="bmdb"     │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  llms_service.py     │
                                    │  get_response_with_  │
                                    │  tools(history, db)  │
                                    │                      │
                                    │  if db == "vcdb":    │
                                    │    select_tools_for_ │
                                    │    prompt() →        │
                                    │    DB/KB/PUB subsets  │
                                    │                      │
                                    │  if db == "bmdb":    │
                                    │    BMDB_TOOLS        │
                                    └──────────┬───────────┘
                                               │
                              ┌─────────────┬──┴──────────────┐
                              ▼             ▼                 ▼
                        ┌──────────┐ ┌──────────┐    ┌──────────────┐
                        │ VCell    │ │ BioModels│    │   Qdrant     │
                        │ API     │ │ API      │    │   (RAG)      │
                        └──────────┘ └──────────┘    └──────────────┘
```

The branch introduces a database-selection dimension that flows through the entire stack: UI toggle → separate API endpoint → tool set selection → database-specific service calls. The two database paths are largely parallel rather than abstracted behind a common interface.
