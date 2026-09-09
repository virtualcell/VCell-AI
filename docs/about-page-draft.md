# About VCell-AI — Page Content Draft

**Status:** Draft for review **Prepared by:** Kartik Deshpande **Date:** ⟨⟨ TODO: date sent ⟩⟩ **Target:** `https://vcell-ai-dev.cam.uchc.edu/about`

---

## Proposed page layout

```
┌──────────────────────────────────────────────────────────────────┐
│  About VCell-AI                                                  │
│  <one-paragraph intro>                                           │
│                                                    ┌───────────┐ │
│  1. Disclaimer & Warranty                          │ Contents  │ │
│  2. AI Models Used                                 │  Disclaim │ │
│  3. AI Limitations                                 │  Models   │ │
│  4. Data & Privacy                                 │  Limits   │ │
│  5. Data & Model Sources                           │  Privacy  │ │
│  6. Code License                                   │  Sources  │ │
│  7. Third-Party Software & Licenses                │  License  │ │
│  8. How to Cite                                    │  ...      │ │
│  9. Contributors                                   └───────────┘ │
│ 10. Acknowledgments & Funding                                    │
│ 11. Version & Release Information                                │
│ 12. Feedback & Contact                                           │
└──────────────────────────────────────────────────────────────────┘
```

Sidebar link placement: **"About VCell-AI"** in the left sidebar, in its own group below the *AI tools* group, above the budget footer.
<!-- frontend/components/app-sidebar.tsx — add a SidebarGroup after the AI tools group -->

---

# PAGE CONTENT STARTS HERE

---

## Intro

> VCell-AI is an AI-assisted interface for discovering, exploring, and analysing computational biology models from the [Virtual Cell (VCell)](https://vcell.org) database. It lets you search VCell BioModels in natural language, and ask an AI assistant to summarise a model's structure, reaction diagram, or VCML definition.
>
> VCell-AI was developed as a Google Summer of Code project in collaboration with the VCell team at the Center for [Center for Cell Analysis and Modeling (CCAM)](https://health.uconn.edu/cell-analysis-modeling/), [UConn Health](https://health.uconn.edu/) ⟩.
>
> This page describes how the system works, what it sends where, its limitations, and how to cite and contact us.

---

<a id="disclaimer"></a>
## 1. Disclaimer and Warranty


>
> **AI-generated responses are not verified scientific results.** VCell-AI uses large language models to summarise and interpret model data. These summaries can be incomplete, misleading, or factually wrong, even when they read as confident and precise. They have not been reviewed by the VCell team, by the authors of the models being described, or by any human before being shown to you.
>
> **You are responsible for independently verifying anything you rely on.** Before using any output from VCell-AI in research, publication, teaching, or clinical or regulatory contexts, confirm it directly against the source model in VCell, its VCML definition, and the associated publications. VCell-AI is a navigation and comprehension aid, not a source of scientific truth.
>

---

<a id="models"></a>
## 2. AI Models Used

> VCell-AI does not run its own AI models from scratch. It routes requests through an [LiteLLM](https://github.com/BerriAI/litellm) gateway:

| | Commercial / hosted model | Locally hosted model |
|---|---|---|
| **Shown in the UI as** | `OpenAI` | `Local LLM` |
| **Model** | OpenAI `gpt-4o-mini` | `phi4-mini` (Microsoft Phi-4-mini, ~3.8 B parameters) |
| **Where it runs** | OpenAI's servers (external, USA) | On our own cluster at ⟨⟨ TODO: UConn Health / CAM — confirm how you want the hosting location described ⟩⟩ |
| **Data leaves our infrastructure?** | **Yes** | **No** |
| **Served by** | OpenAI API | [Ollama](https://ollama.com), CPU inference, in-cluster |

<!-- Grounded in: kustomize/config/vcell-ai-rke-dev/litellm.env (OPENAI_MODEL=openai/gpt-4o-mini,
     LOCAL_LLM_MODEL=ollama/phi4-mini), kustomize/base/ollama.yaml (in-cluster StatefulSet,
     CPU-only, phi4-mini pulled on startup), kustomize/base/litellm_config.yaml -->

> A third component uses a commercial model as well: the knowledge-base search feature converts your question into a numeric embedding using OpenAI's `text-embedding-3-small` model. This means the text of a knowledge-base query is also sent to OpenAI.
<!-- backend/.env → AZURE_EMBEDDING_DEPLOYMENT_NAME=text-embedding-3-small; PROVIDER=openai
     with AZURE_ENDPOINT=https://api.openai.com/v1 -->

> ### Choosing a model
>
> The model selector next to the chat input lets you choose between **OpenAI** and **Local LLM** for every message. OpenAI is the default. The local model is substantially smaller and runs on CPU, so it is slower and noticeably less capable. It is offered as a privacy-preserving alternative and as a fallback.

> ### When you are switched to the local model automatically
>
> There are two situations in which a request you sent to OpenAI is answered by the local model instead:
>
> 1. **Your usage budget is exhausted.** Each account is given a spending allowance for commercial model usage (currently **⟨⟨ TODO: confirm the figure to publish — the deployed default is US$10.00 per 30 days per user ⟩⟩**). When a request would exceed that allowance, it is automatically retried against the local model rather than failing. Your remaining budget is always visible at the bottom of the left sidebar.
> 2. **The commercial provider is unavailable.** If the OpenAI request fails outright — an outage, a rate limit, an authentication problem — the gateway retries the same request against the local model.
>
> <!-- (1) backend/app/services/llms_service.py `_create_chat_completion` / `_is_budget_error`;
>      per-user budget provisioned in litellm_service.provision_user from DEFAULT_USER_BUDGET
>      / DEFAULT_BUDGET_DURATION. (2) litellm_config.yaml `fallbacks: openai-model: [local-model]` -->

> ### Are you notified?
>
> **Yes.** Every assistant reply in the chat is labelled underneath with the model that actually produced it — *"Answered by OpenAI"* or *"Answered by Local LLM"*. The label reflects the model that really ran, not the one you selected, so a silent downgrade is always visible on the message itself. The label is stored with your conversation history, so it remains correct when you revisit an old conversation.

---

<a id="limitations"></a>
## 3. AI Limitations

> Large language models generate plausible-sounding text; they do not reason reliably about biology or verify their own claims. In practice, this means responses from VCell-AI may:
>
> - **Hallucinate** — invent parameters, species, reactions, citations, model IDs, or numeric values that do not appear in the underlying model.
> - **Be incomplete** — silently omit applications, simulations, or reactions from a long list, particularly for large models. The assistant is instructed not to truncate, but it can still do so.
> - **Misinterpret the model** — describe a reaction's direction, a parameter's units, or a compartment's role incorrectly.
> - **Be internally inconsistent** — give different answers to the same question asked twice, or contradict an earlier message in the same conversation.
> - **Be outdated or out of scope** — the assistant only sees what the tools retrieve for it. It has no knowledge of unpublished work, recent literature, or VCell features outside the data it is given.
>
> Responses from the **Local LLM** are produced by a much smaller model and are more prone to all of the above than the OpenAI responses.
>
> **AI responses are not authoritative scientific conclusions.** Treat every response as a starting point for your own examination of the model, never as a citable result.

---

<a id="privacy"></a>
## 4. Data and Privacy

> ### What is sent to external AI providers
>
> When you ask a question using the **OpenAI** model, the following is transmitted to OpenAI's API:
>
> - Your question and the preceding messages in that conversation.
> - The assistant's system instructions.
> - Whatever data the assistant retrieved to answer you — this can include biomodel metadata (names, owners, descriptions, applications, simulations), the **full VCML text** of a model, publication records, and matched passages from the VCell documentation knowledge base.
> - For diagram analysis, the **model's reaction diagram image**, embedded directly in the request.
> - For knowledge-base search, the text of your query (sent for embedding).
>
> <!-- backend/app/services/llms_service.py: get_response_with_tools appends tool results
>      into the message list; analyse_vcml sends full VCML; analyse_diagram base64-inlines
>      the diagram PNG as an image_url data URI -->
>


> ### What stays local
>
> When you select the **Local LLM**, your question and the retrieved model data are sent only to a model running inside our own cluster. Nothing in the conversation reaches a commercial AI provider.
>
> Note that this applies to the AI request only — see *Logging* below, which applies to both models.

> ### Private and unpublished models
>
> When you are signed in, VCell-AI can search and analyse the biomodels **you own or that have been shared with you**, not just public models. It does this by exchanging your login for a VCell API token on your behalf.
>
> **This means that if you analyse a private or unpublished model while the OpenAI model is selected, that model's contents — including its full VCML — are transmitted to OpenAI.**
>
> <!-- backend/app/services/vcelldb_service.py `get_legacy_vcell_token` exchanges the Auth0
>      token for a legacy VCell bearer token so private/shared models appear in results;
>      fetch_biomodels / get_diagram_image accept it -->
>


> ### Logging and retention
>
> - **Conversation tracing.** Prompts and AI responses are recorded for quality monitoring and debugging through [Langfuse](https://langfuse.com), using Langfuse's **hosted cloud service** (an external third party). This happens for **both** the OpenAI and the Local LLM paths. ⟨⟨ TODO: retention period for Langfuse traces, who on the team can access them. ⟩⟩
>   <!-- LANGFUSE_HOST=https://cloud.langfuse.com in kustomize/config/vcell-ai-rke-dev/backend.env;
>        @observe decorators in services; litellm success_callback: ["langfuse"] -->
> - **Server logs.** The backend writes user prompts and AI responses to its application logs. ⟨⟨ TODO: log retention period and access control. ⟩⟩
>   <!-- logger.info(f"User prompt: ...") and logger.info(f"LLM Response: ...") in llms_service.py -->
> - **Account data.** We store your account identifier, email address, name, and last login time, supplied by our identity provider (Auth0), in a Supabase-hosted database, along with your usage-spend record.
>   <!-- backend/app/services/users_service.py sync_auth0_user → Supabase `users` table -->
> - **Chat history stays in your browser.** Your saved conversations are stored in your browser's local storage and are never uploaded to our servers. Clearing your browser data deletes them permanently, and they are not available on other devices.
>   <!-- frontend/lib/chat-history.ts — localStorage key `vcell-ai-chat-history:<user sub>` -->

> ### Authentication
>
> Sign-in is handled by [Auth0](https://auth0.com). VCell-AI never sees or stores your password. All AI features require you to be signed in.


---

<a id="sources"></a>
## 5. Data and Model Sources

> All biological model content in VCell-AI comes from the **VCell database**, accessed live through the public VCell API at `https://vcell.cam.uchc.edu/api`. VCell-AI stores no copy of the models; every search and analysis fetches current data.
>
> From VCell we retrieve:
>
> | Data | Used for |
> |---|---|
> | BioModel records (name, owner, description, annotations, applications, simulations) | Search results, model summaries |
> | VCML — the full model definition | Structural analysis: species, reactions, parameters |
> | SBML and BNGL exports | Format viewers and downloads |
> | Reaction diagram images | Visual diagram analysis |
> | VCell publication records (title, authors, year, DOI, PubMed ID) | Literature queries |
>
> <!-- backend/app/services/vcelldb_service.py — VCELL_API_BASE_URL /api/v0, /api/v1 -->
>
> **Documentation knowledge base.** To answer questions about how to use VCell itself, the assistant searches a vector index built from the official VCell tutorials and help documentation published at `vcell.org/webstart/VCell_Tutorials/` (the VCell Help pages and the tutorial PDFs, including the 7.7 series). Documents are split into passages and indexed with OpenAI embeddings in a [Qdrant](https://qdrant.tech) vector database hosted on our own infrastructure.
> <!-- backend/populate_db.ipynb — scraped sources; knowledge_base_service.py — chunking
>      (2000 chars / 300 overlap) + embedding + Qdrant upsert -->


---

<a id="license"></a>
## 6. Code License

> VCell-AI is open source under the **MIT License**.
>
> ```
> MIT License
> Copyright (c) 2025 Virtual Cell
> ```
>
> The full licence text is in the repository: [LICENSE](https://github.com/virtualcell/VCell-AI/blob/main/LICENSE)
>
> The MIT License permits use, modification, and redistribution, including commercially, provided the copyright notice and licence are retained. It provides the software without warranty.

---

<a id="third-party"></a>
## 7. Third-Party Software and Licenses

> VCell-AI is built on open-source software. We gratefully acknowledge the following projects and their maintainers. All are used under permissive licences that allow commercial and academic use.

> ### AI, models, and data infrastructure
>
> | Component | Role | Licence |
> |---|---|---|
> | [LiteLLM](https://github.com/BerriAI/litellm) | LLM gateway — model routing, per-user budgets, fallback | [MIT](https://github.com/BerriAI/litellm/blob/main/LICENSE) |
> | [Ollama](https://github.com/ollama/ollama) | Serves the locally hosted model | [MIT](https://github.com/ollama/ollama/blob/main/LICENSE) |
> | [Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct) | The locally hosted language model itself (Microsoft, 3.8 B parameters) | [MIT](https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE) |
> | [Qdrant](https://github.com/qdrant/qdrant) | Vector database for the documentation knowledge base | [Apache-2.0](https://github.com/qdrant/qdrant/blob/master/LICENSE) |
> | [LangChain](https://github.com/langchain-ai/langchain) | Text splitting for knowledge-base indexing | [MIT](https://github.com/langchain-ai/langchain/blob/master/LICENSE) |
> | [Langfuse Python SDK](https://github.com/langfuse/langfuse) | Tracing instrumentation | [MIT](https://github.com/langfuse/langfuse/blob/main/LICENSE) |
> | [openai-python](https://github.com/openai/openai-python) | Client library for OpenAI-compatible APIs | [Apache-2.0](https://github.com/openai/openai-python/blob/main/LICENSE) |
>
> ### Backend
>
> | Component | Role | Licence |
> |---|---|---|
> | [FastAPI](https://github.com/fastapi/fastapi) | Web framework | [MIT](https://github.com/fastapi/fastapi/blob/master/LICENSE) |
> | [Uvicorn](https://github.com/encode/uvicorn) | ASGI server | [BSD-3-Clause](https://github.com/encode/uvicorn/blob/master/LICENSE.md) |
> | [Pydantic](https://github.com/pydantic/pydantic) | Data validation and settings | [MIT](https://github.com/pydantic/pydantic/blob/main/LICENSE) |
> | [HTTPX](https://github.com/encode/httpx) | HTTP client | [BSD-3-Clause](https://github.com/encode/httpx/blob/master/LICENSE.md) |
> | [PyJWT](https://github.com/jpadilla/pyjwt) | Access-token verification | [MIT](https://github.com/jpadilla/pyjwt/blob/master/LICENSE) |
> | [pypdf](https://github.com/py-pdf/pypdf) | PDF text extraction | [BSD-3-Clause](https://github.com/py-pdf/pypdf/blob/main/LICENSE) |
> | [MarkItDown](https://github.com/microsoft/markitdown) | Document-to-text conversion | [MIT](https://github.com/microsoft/markitdown/blob/main/LICENSE) |
> | [supabase-py](https://github.com/supabase/supabase-py) | Database client | [MIT](https://github.com/supabase/supabase-py/blob/main/LICENSE) |
>
> ### Frontend
>
> | Component | Role | Licence |
> |---|---|---|
> | [Next.js](https://github.com/vercel/next.js) | React application framework | [MIT](https://github.com/vercel/next.js/blob/canary/license.md) |
> | [React](https://github.com/facebook/react) | UI library | [MIT](https://github.com/facebook/react/blob/main/LICENSE) |
> | [TypeScript](https://github.com/microsoft/TypeScript) | Language and type checker | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
> | [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | Styling | [MIT](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE) |
> | [Radix UI](https://github.com/radix-ui/primitives) | Accessible UI primitives | [MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE) |
> | [shadcn/ui](https://github.com/shadcn-ui/ui) | Component patterns built on Radix | [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) |
> | [KaTeX](https://github.com/KaTeX/KaTeX) | Mathematical notation rendering | [MIT](https://github.com/KaTeX/KaTeX/blob/main/LICENSE) |
> | [react-markdown](https://github.com/remarkjs/react-markdown), [remark](https://github.com/remarkjs/remark) & [rehype](https://github.com/rehypejs/rehype) | Rendering AI responses as formatted text | [MIT](https://github.com/remarkjs/react-markdown/blob/main/license) |
> | [Lucide](https://github.com/lucide-icons/lucide) | Icons | [ISC](https://github.com/lucide-icons/lucide/blob/main/LICENSE) (portions MIT, from Feather) |
> | [Framer Motion](https://github.com/motiondivision/motion) | Animation | [MIT](https://github.com/motiondivision/motion/blob/main/LICENSE.md) |
> | [Recharts](https://github.com/recharts/recharts) | Charts | [MIT](https://github.com/recharts/recharts/blob/master/LICENSE) |
> | [nextjs-auth0](https://github.com/auth0/nextjs-auth0) | Authentication client | [MIT](https://github.com/auth0/nextjs-auth0/blob/main/LICENSE) |
> | [React Hook Form](https://github.com/react-hook-form/react-hook-form) & [Zod](https://github.com/colinhacks/zod) | Form handling and validation | [MIT](https://github.com/react-hook-form/react-hook-form/blob/master/LICENSE) |
>
> Exact pinned versions for every dependency are recorded in the repository (`backend/pyproject.toml`, `backend/poetry.lock`, `frontend/package.json`, `frontend/package-lock.json`) for the release named in [Version and Release Information](#version).
>
> The commercial and hosted services VCell-AI depends on are not open-source software and are described in [Data and Privacy](#privacy) instead.

<!-- MAINTENANCE NOTE — not page content.

     Every licence above was verified on 2026-09-04 against the actual installed
     package metadata (frontend/node_modules/<pkg>/package.json and the backend Poetry
     virtualenv's *.dist-info/METADATA) or, for the containerised services and the model
     weights, against the upstream LICENSE file. None were assumed.

     Two carve-outs worth knowing about, neither of which affects us:
       - LiteLLM: MIT (© 2023 Berri AI), except its `enterprise/` directory, which is
         under a separate commercial licence. We run the OSS proxy image and use no
         enterprise features.
       - Langfuse: MIT Expat, except the `ee/`, `web/src/ee/` and `worker/src/ee/`
         directories. We consume the hosted service and bundle only the Python SDK,
         which is MIT.

     To regenerate before a future release:
       cd backend  && poetry run pip-licenses --format=markdown --order=license
       cd frontend && npx license-checker --summary
-->
---

<a id="citation"></a>
## 8. How to Cite

> If VCell-AI contributed to work you are publishing, please cite **both** VCell-AI and VCell itself, and cite the underlying models separately.
>
> ⟨⟨ TODO: Instructions on how to site ⟩⟩

---

<a id="contributors"></a>
## 9. Contributors


> | Name | Role | 
> |---|---|
> | Kacem Mathlouthi | [Kacem Mathlouthi](https://github.com/KacemMathlouthi) is a student who started coding for VCell-AI project through [Google Summer of Code 2025](https://summerofcode.withgoogle.com/) under the [National Resource for Network Biology (NRNB)](https://nrnb.org/gsoc.html), working on the project "Chatbot to query VCell modeling resources". |
> | Reesha Patel | [Reesha Patel](https://github.com/reeshapatel12) is a student who worked on the VCell-AI project in Fall 2025 enhancing VCell-AI as a part of University research project.|
> | Kartik Deshpande | [Kartik Deshpande](https://github.com/androemeda) is a student who completed coding for VCell-AI project through [Google Summer of Code 2026](https://summerofcode.withgoogle.com/) under the [National Resource for Network Biology (NRNB)](https://nrnb.org/gsoc.html), working on the project "Enhancing VCell AI Platform". | 
> | Michael L. Blinov | [Michael Blinov](https://health.uconn.edu/blinov-lab/) is the Associate Professor at the Center for [Center for Cell Analysis and Modeling (CCAM)](https://health.uconn.edu/cell-analysis-modeling/), [UConn Health](https://health.uconn.edu/). He is an expert modeler and methods developer who initiated and managed the VCell-AI project, serving as a mentor for GSoC students.| 
> | Jim Schaff | [James C. Schaff](https://facultydirectory.uchc.edu/profile?profileId=Schaff-James) is he main architect and developer of [VCell](http://vcell.org) modeling and simulation software. He serves as a mentor for GSoC students. | 
> | Ezequiel Valencia | [Ezequiel Valencia](https://github.com/Ezequiel-Valencia) is a network architect at VCell project  helping with the deployment.| 
>
>
> The full contribution history is public at [github.com/virtualcell/VCell-AI/graphs/contributors](https://github.com/virtualcell/VCell-AI/graphs/contributors).

---

<a id="acknowledgments"></a>
## 10. Acknowledgments and Funding

> ### Google Summer of Code
>
> VCell-AI was developed as a **Google Summer of Code** project. We thank Google and the GSoC programme, and the mentoring organisation ⟨⟨ TODO: which umbrella organisation did the project run under — NRNB? Confirm the exact org name and year(s). ⟩⟩
>
> ### Funding
>
> ⟨⟨ TODO: NIH grant numbers and any other funding to acknowledge, with the exact wording the grants require. Not inferred — please supply the canonical acknowledgment text used in VCell publications. ⟩⟩
>
> ### Institutional support
>
> ⟨⟨ TODO: exact institutional acknowledgment — centre name, department, university, and any computing/infrastructure support to credit. ⟩⟩
>
> ### Software
>
> > VCell-AI builds directly on the Virtual Cell modelling and simulation framework and its public API, and on the open-source projects listed in §7. We thank their maintainers.

---

<a id="version"></a>
## 11. Version and Release Information

---

<a id="contact"></a>
## 12. Feedback and Contact

> We want to hear about problems.
>
> | What | Where |
> |---|---|
> | Bugs, feature requests, incorrect AI responses | [GitHub Issues](https://github.com/virtualcell/VCell-AI/issues) |
> | Problems with a specific biomodel's content | ⟨⟨ TODO: VCell support address ⟩⟩ |
> | General VCell support | ⟨⟨ TODO: VCell support address ⟩⟩ |
> | Security vulnerabilities | ⟨⟨ TODO: security contact — should not go through public issues ⟩⟩ |
> | Data / privacy requests (including account deletion) | ⟨⟨ TODO: contact ⟩⟩ |
>
> **When reporting a bad AI response, please include:** the model shown in the *"Answered by"* label, the biomodel ID, your question, and the response you received. This makes it possible for us to trace and reproduce the problem.
>
> ⟨⟨ TODO: decide whether to add an in-app "report this response" control on each assistant message. It would capture the above automatically and would produce far more useful reports than asking users to file issues manually. ⟩⟩

---
---
