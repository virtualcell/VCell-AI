/**
 * Content for the /about page.
 *
 * Mirrors docs/about-page-draft.md — when that draft is revised, update this file
 * to match. Each section renders through MarkdownRenderer, so the `content` field
 * is plain markdown (tables, links and inline code all work).
 */

export interface AboutSection {
  id: string;
  number: number;
  title: string;
  icon: string;
  content: string;
}

export const ABOUT_INTRO = `VCell-AI is an AI-assisted interface for discovering, exploring, and analysing computational biology models from the [Virtual Cell (VCell)](https://vcell.org) database. It lets you search VCell BioModels in natural language, and ask an AI assistant to summarise a model's structure, reaction diagram, or VCML definition.

VCell-AI was developed as a Google Summer of Code project in collaboration with the VCell team at the [Center for Cell Analysis and Modeling (CCAM)](https://health.uconn.edu/cell-analysis-modeling/), [UConn Health](https://health.uconn.edu/).

This page describes how the system works, what it sends where, its limitations, and how to cite and contact us.`;

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    id: "disclaimer",
    number: 1,
    title: "Disclaimer and Warranty",
    icon: "AlertTriangle",
    content: `**AI-generated responses are not verified scientific results.** VCell-AI uses large language models to summarise and interpret model data. These summaries can be incomplete, misleading, or factually wrong, even when they read as confident and precise. They have not been reviewed by the VCell team, by the authors of the models being described, or by any human before being shown to you.

**You are responsible for independently verifying anything you rely on.** Before using any output from VCell-AI in research, publication, teaching, or clinical or regulatory contexts, confirm it directly against the source model in VCell, its VCML definition, and the associated publications. VCell-AI is a navigation and comprehension aid, not a source of scientific truth.`,
  },
  {
    id: "models",
    number: 2,
    title: "AI Models Used",
    icon: "Cpu",
    content: `VCell-AI does not run its own AI models from scratch. It routes requests through an [LiteLLM](https://github.com/BerriAI/litellm) gateway:

| | Commercial / hosted model | Locally hosted model |
|---|---|---|
| **Shown in the UI as** | \`OpenAI\` | \`Local LLM\` |
| **Model** | OpenAI \`gpt-4o-mini\` | \`phi4-mini\` (Microsoft Phi-4-mini, ~3.8 B parameters) |
| **Where it runs** | OpenAI's servers (external, USA) | On our own cluster at UConn Health |
| **Data leaves our infrastructure?** | **Yes** | **No** |
| **Served by** | OpenAI API | [Ollama](https://ollama.com), CPU inference, in-cluster |

A third component uses a commercial model as well: the knowledge-base search feature converts your question into a numeric embedding using OpenAI's \`text-embedding-3-small\` model. This means the text of a knowledge-base query is also sent to OpenAI.

### Choosing a model

The model selector next to the chat input lets you choose between **OpenAI** and **Local LLM** for every message. OpenAI is the default. The local model is substantially smaller and runs on CPU, so it is slower and noticeably less capable. It is offered as a privacy-preserving alternative and as a fallback.

### When you are switched to the local model automatically

There are two situations in which a request you sent to OpenAI is answered by the local model instead:

1. **Your usage budget is exhausted.** Each account is given a spending allowance for commercial model usage, renewed periodically. When a request would exceed that allowance, it is automatically retried against the local model rather than failing. Your remaining budget is always visible at the bottom of the left sidebar.
2. **The commercial provider is unavailable.** If the OpenAI request fails outright — an outage, a rate limit, an authentication problem — the gateway retries the same request against the local model.

### Are you notified?

**Yes.** Every assistant reply in the chat is labelled underneath with the model that actually produced it — *"Answered by OpenAI"* or *"Answered by Local LLM"*. The label reflects the model that really ran, not the one you selected, so a silent downgrade is always visible on the message itself. The label is stored with your conversation history, so it remains correct when you revisit an old conversation.`,
  },
  {
    id: "limitations",
    number: 3,
    title: "AI Limitations",
    icon: "AlertCircle",
    content: `Large language models generate plausible-sounding text; they do not reason reliably about biology or verify their own claims. In practice, this means responses from VCell-AI may:

- **Hallucinate** — invent parameters, species, reactions, citations, model IDs, or numeric values that do not appear in the underlying model.
- **Be incomplete** — silently omit applications, simulations, or reactions from a long list, particularly for large models. The assistant is instructed not to truncate, but it can still do so.
- **Misinterpret the model** — describe a reaction's direction, a parameter's units, or a compartment's role incorrectly.
- **Be internally inconsistent** — give different answers to the same question asked twice, or contradict an earlier message in the same conversation.
- **Be outdated or out of scope** — the assistant only sees what the tools retrieve for it. It has no knowledge of unpublished work, recent literature, or VCell features outside the data it is given.

Responses from the **Local LLM** are produced by a much smaller model and are more prone to all of the above than the OpenAI responses.

**AI responses are not authoritative scientific conclusions.** Treat every response as a starting point for your own examination of the model, never as a citable result.`,
  },
  {
    id: "privacy",
    number: 4,
    title: "Data and Privacy",
    icon: "ShieldCheck",
    content: `### What is sent to external AI providers

When you ask a question using the **OpenAI** model, the following is transmitted to OpenAI's API:

- Your question and the preceding messages in that conversation.
- The assistant's system instructions.
- Whatever data the assistant retrieved to answer you — this can include biomodel metadata (names, owners, descriptions, applications, simulations), the **full VCML text** of a model, publication records, and matched passages from the VCell documentation knowledge base.
- For diagram analysis, the **model's reaction diagram image**, embedded directly in the request.
- For knowledge-base search, the text of your query (sent for embedding).

### What stays local

When you select the **Local LLM**, your question and the retrieved model data are sent only to a model running inside our own cluster. Nothing in the conversation reaches a commercial AI provider.

Note that this applies to the AI request only — see *Logging* below, which applies to both models.

### Private and unpublished models

When you are signed in, VCell-AI can search and analyse the biomodels **you own or that have been shared with you**, not just public models. It does this by exchanging your login for a VCell API token on your behalf.

**This means that if you analyse a private or unpublished model while the OpenAI model is selected, that model's contents — including its full VCML — are transmitted to OpenAI.**

### Logging and retention

- **Conversation tracing.** Prompts and AI responses are recorded for quality monitoring and debugging through [Langfuse](https://langfuse.com), using Langfuse's **hosted cloud service** (an external third party). This happens for **both** the OpenAI and the Local LLM paths, and access is limited to the VCell-AI development team.

- **Server logs.** The backend writes user prompts and AI responses to its application logs, which are accessible to the VCell-AI development team.

- **Account data.** We store your account identifier, email address, name, and last login time, supplied by our identity provider (Auth0), in a Supabase-hosted database, along with your usage-spend record.

- **Chat history stays in your browser.** Your saved conversations are stored in your browser's local storage and are never uploaded to our servers. Clearing your browser data deletes them permanently, and they are not available on other devices.

### Authentication

Sign-in is handled by [Auth0](https://auth0.com). VCell-AI never sees or stores your password. All AI features require you to be signed in.`,
  },
  {
    id: "sources",
    number: 5,
    title: "Data and Model Sources",
    icon: "Database",
    content: `All biological model content in VCell-AI comes from the **VCell database**, accessed live through the public VCell API at \`https://vcell.cam.uchc.edu/api\`. VCell-AI stores no copy of the models; every search and analysis fetches current data.

From VCell we retrieve:

| Data | Used for |
|---|---|
| BioModel records (name, owner, description, annotations, applications, simulations) | Search results, model summaries |
| VCML — the full model definition | Structural analysis: species, reactions, parameters |
| SBML and BNGL exports | Format viewers and downloads |
| Reaction diagram images | Visual diagram analysis |
| VCell publication records (title, authors, year, DOI, PubMed ID) | Literature queries |

**Documentation knowledge base.** To answer questions about how to use VCell itself, the assistant searches a vector index built from the official VCell tutorials and help documentation published at \`vcell.org/webstart/VCell_Tutorials/\` (the VCell Help pages and the tutorial PDFs, including the 7.7 series). Documents are split into passages and indexed with OpenAI embeddings in a [Qdrant](https://qdrant.tech) vector database hosted on our own infrastructure.`,
  },
  {
    id: "license",
    number: 6,
    title: "Code License",
    icon: "Scale",
    content: `VCell-AI is open source under the **MIT License**.

\`\`\`
MIT License
Copyright (c) 2025 Virtual Cell
\`\`\`

The full licence text is in the repository: [LICENSE](https://github.com/virtualcell/VCell-AI/blob/main/LICENSE)

The MIT License permits use, modification, and redistribution, including commercially, provided the copyright notice and licence are retained. It provides the software without warranty.`,
  },
  {
    id: "third-party",
    number: 7,
    title: "Third-Party Software and Licenses",
    icon: "Package",
    content: `VCell-AI is built on open-source software. We gratefully acknowledge the following projects and their maintainers. All are used under permissive licences that allow commercial and academic use.

### AI, models, and data infrastructure

| Component | Role | Licence |
|---|---|---|
| [LiteLLM](https://github.com/BerriAI/litellm) | LLM gateway — model routing, per-user budgets, fallback | [MIT](https://github.com/BerriAI/litellm/blob/main/LICENSE) |
| [Ollama](https://github.com/ollama/ollama) | Serves the locally hosted model | [MIT](https://github.com/ollama/ollama/blob/main/LICENSE) |
| [Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct) | The locally hosted language model itself (Microsoft, 3.8 B parameters) | [MIT](https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE) |
| [Qdrant](https://github.com/qdrant/qdrant) | Vector database for the documentation knowledge base | [Apache-2.0](https://github.com/qdrant/qdrant/blob/master/LICENSE) |
| [LangChain](https://github.com/langchain-ai/langchain) | Text splitting for knowledge-base indexing | [MIT](https://github.com/langchain-ai/langchain/blob/master/LICENSE) |
| [Langfuse Python SDK](https://github.com/langfuse/langfuse) | Tracing instrumentation | [MIT](https://github.com/langfuse/langfuse/blob/main/LICENSE) |
| [openai-python](https://github.com/openai/openai-python) | Client library for OpenAI-compatible APIs | [Apache-2.0](https://github.com/openai/openai-python/blob/main/LICENSE) |

### Backend

| Component | Role | Licence |
|---|---|---|
| [FastAPI](https://github.com/fastapi/fastapi) | Web framework | [MIT](https://github.com/fastapi/fastapi/blob/master/LICENSE) |
| [Uvicorn](https://github.com/encode/uvicorn) | ASGI server | [BSD-3-Clause](https://github.com/encode/uvicorn/blob/master/LICENSE.md) |
| [Pydantic](https://github.com/pydantic/pydantic) | Data validation and settings | [MIT](https://github.com/pydantic/pydantic/blob/main/LICENSE) |
| [HTTPX](https://github.com/encode/httpx) | HTTP client | [BSD-3-Clause](https://github.com/encode/httpx/blob/master/LICENSE.md) |
| [PyJWT](https://github.com/jpadilla/pyjwt) | Access-token verification | [MIT](https://github.com/jpadilla/pyjwt/blob/master/LICENSE) |
| [pypdf](https://github.com/py-pdf/pypdf) | PDF text extraction | [BSD-3-Clause](https://github.com/py-pdf/pypdf/blob/main/LICENSE) |
| [MarkItDown](https://github.com/microsoft/markitdown) | Document-to-text conversion | [MIT](https://github.com/microsoft/markitdown/blob/main/LICENSE) |
| [supabase-py](https://github.com/supabase/supabase-py) | Database client | [MIT](https://github.com/supabase/supabase-py/blob/main/LICENSE) |

### Frontend

| Component | Role | Licence |
|---|---|---|
| [Next.js](https://github.com/vercel/next.js) | React application framework | [MIT](https://github.com/vercel/next.js/blob/canary/license.md) |
| [React](https://github.com/facebook/react) | UI library | [MIT](https://github.com/facebook/react/blob/main/LICENSE) |
| [TypeScript](https://github.com/microsoft/TypeScript) | Language and type checker | [Apache-2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | Styling | [MIT](https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE) |
| [Radix UI](https://github.com/radix-ui/primitives) | Accessible UI primitives | [MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE) |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Component patterns built on Radix | [MIT](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md) |
| [KaTeX](https://github.com/KaTeX/KaTeX) | Mathematical notation rendering | [MIT](https://github.com/KaTeX/KaTeX/blob/main/LICENSE) |
| [react-markdown](https://github.com/remarkjs/react-markdown), [remark](https://github.com/remarkjs/remark) & [rehype](https://github.com/rehypejs/rehype) | Rendering AI responses as formatted text | [MIT](https://github.com/remarkjs/react-markdown/blob/main/license) |
| [Lucide](https://github.com/lucide-icons/lucide) | Icons | [ISC](https://github.com/lucide-icons/lucide/blob/main/LICENSE) (portions MIT, from Feather) |
| [Framer Motion](https://github.com/motiondivision/motion) | Animation | [MIT](https://github.com/motiondivision/motion/blob/main/LICENSE.md) |
| [Recharts](https://github.com/recharts/recharts) | Charts | [MIT](https://github.com/recharts/recharts/blob/master/LICENSE) |
| [nextjs-auth0](https://github.com/auth0/nextjs-auth0) | Authentication client | [MIT](https://github.com/auth0/nextjs-auth0/blob/main/LICENSE) |
| [React Hook Form](https://github.com/react-hook-form/react-hook-form) & [Zod](https://github.com/colinhacks/zod) | Form handling and validation | [MIT](https://github.com/react-hook-form/react-hook-form/blob/master/LICENSE) |

Exact pinned versions for every dependency are recorded in the repository (\`backend/pyproject.toml\`, \`backend/poetry.lock\`, \`frontend/package.json\`, \`frontend/package-lock.json\`) for the release named in [Version and Release Information](#version).

The commercial and hosted services VCell-AI depends on are not open-source software and are described in [Data and Privacy](#privacy) instead.`,
  },
  {
    id: "citation",
    number: 8,
    title: "How to Cite",
    icon: "Quote",
    content: `If VCell-AI contributed to work you are publishing, please cite **both** VCell-AI and VCell itself, and cite the underlying models separately.

For VCell citation:

Schaff, J., C. C. Fink, B. Slepchenko, J. H. Carson, and L. M. Loew. 1997. A general computational framework for modeling cellular structure and function. Biophysical journal 73:1135-1146. PMID:[9284281](https://pubmed.ncbi.nlm.nih.gov/9284281/) DOI:[10.1016/S0006-3495(97)78146-3](https://doi.org/10.1016/s0006-3495(97)78146-3)

Blinov, M. L., J. C. Schaff, D. Vasilescu, Moraru, II, J. E. Bloom, and L. M. Loew. 2017. Compartmental and Spatial Rule-Based Modeling with Virtual Cell. Biophysical journal 113:1365-1372. PMID:[28978431](https://pubmed.ncbi.nlm.nih.gov/28978431/) DOI:[10.1016/j.bpj.2017.08.022](https://doi.org/10.1016/j.bpj.2017.08.022)`,
  },
  {
    id: "contributors",
    number: 9,
    title: "Contributors",
    icon: "Users",
    content: `| Name | Role |
|---|---|
| Kacem Mathlouthi | [Kacem Mathlouthi](https://github.com/KacemMathlouthi) is a student who started coding for VCell-AI project through [Google Summer of Code 2025](https://summerofcode.withgoogle.com/) under the [National Resource for Network Biology (NRNB)](https://nrnb.org/gsoc.html), working on the project "Chatbot to query VCell modeling resources". |
| Reesha Patel | [Reesha Patel](https://github.com/reeshapatel12) is a student who worked on the VCell-AI project in Fall 2025 enhancing VCell-AI as a part of University research project.|
| Kartik Deshpande | [Kartik Deshpande](https://github.com/androemeda) is a student who completed coding for VCell-AI project through [Google Summer of Code 2026](https://summerofcode.withgoogle.com/) under the [National Resource for Network Biology (NRNB)](https://nrnb.org/gsoc.html), working on the project "Enhancing VCell AI Platform". |
| Michael L. Blinov | [Michael Blinov](https://health.uconn.edu/blinov-lab/) is the Associate Professor at the Center for [Center for Cell Analysis and Modeling (CCAM)](https://health.uconn.edu/cell-analysis-modeling/), [UConn Health](https://health.uconn.edu/). He is an expert modeler and methods developer who initiated and managed the VCell-AI project, serving as a mentor for GSoC students.|
| Jim Schaff | [James C. Schaff](https://facultydirectory.uchc.edu/profile?profileId=Schaff-James) is he main architect and developer of [VCell](http://vcell.org) modeling and simulation software. He serves as a mentor for GSoC students. |
| Ezequiel Valencia | [Ezequiel Valencia](https://github.com/Ezequiel-Valencia) is a network architect at VCell project  helping with the deployment.|

The full contribution history is public at [github.com/virtualcell/VCell-AI/graphs/contributors](https://github.com/virtualcell/VCell-AI/graphs/contributors).`,
  },
  {
    id: "acknowledgments",
    number: 10,
    title: "Acknowledgments and Funding",
    icon: "Award",
    content: `### Google Summer of Code

VCell-AI was developed as a **Google Summer of Code** project in 2025 and 2026. We thank Google and the GSoC programme, and the mentoring organisation the [National Resource for Network Biology (NRNB)](https://nrnb.org/).

### Funding

The Virtual Cell is supported by NIH Grant R24 GM137787 from the National Institute for General Medical Sciences.

### Institutional support

 The VCell-AI is supported by the [Center for Cell Analysis and Modeling (CCAM)](https://health.uconn.edu/cell-analysis-modeling/) and the  [High Performance Computing Facility](https://health.uconn.edu/high-performance-computing/) at the [UConn Health](https://health.uconn.edu/).

### Software

> VCell-AI builds directly on the Virtual Cell modeling and simulation framework and its public API, and on the open-source projects listed in §7. We thank their maintainers.`,
  },
  {
    id: "version",
    number: 11,
    title: "Version and Release Information",
    icon: "Tag",
    content: `VCell-AI is developed in the open. The source code, release history and full commit log are on GitHub:

- [Repository](https://github.com/virtualcell/VCell-AI)
- [Releases and changelog](https://github.com/virtualcell/VCell-AI/releases)
- [Commit history](https://github.com/virtualcell/VCell-AI/commits/main)

AI responses can change between application releases and when an underlying model is updated, so a question asked today may not produce the same answer later. If you report or cite a result, please note the date on which it was generated.`,
  },
  {
    id: "contact",
    number: 12,
    title: "Feedback and Contact",
    icon: "Mail",
    content: `We want to hear about problems.

| What | Where |
|---|---|
| Bugs, feature requests, incorrect AI responses | [GitHub Issues](https://github.com/virtualcell/VCell-AI/issues) |
| General VCell support and specific biomodel's content | [vcell_support@uchc.edu](mailto:vcell_support@uchc.edu) |

**When reporting a bad AI response, please include:** the model shown in the *"Answered by"* label, the biomodel ID, your question, and the response you received. This makes it possible for us to trace and reproduce the problem.`,
  },
];
