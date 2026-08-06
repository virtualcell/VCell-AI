from typing import TypedDict


class FaqDefinition(TypedDict):
    question: str
    tool: str
    args: dict


# Hardcoded quick-action FAQs from the /chat page. Each entry pins down the
# exact tool call the FAQ needs, so the fast-path endpoint can execute it
# directly instead of spending an LLM call deciding which tool to use.
FAQ_REGISTRY: dict[str, FaqDefinition] = {
    "list-tutorial-models": {
        "question": "List all tutorial models",
        "tool": "fetch_biomodels",
        "args": {"category": "tutorial"},
    },
    "list-calcium-models": {
        "question": "List all Calcium models",
        "tool": "fetch_biomodels",
        "args": {"bmName": "calcium"},
    },
    "list-modelbrick-models": {
        "question": "List all models by ModelBrick",
        "tool": "fetch_biomodels",
        "args": {"owner": "ModelBrick"},
    },
    "tutorial-models-solvers": {
        "question": "What solvers are used in tutorial models",
        "tool": "fetch_biomodels",
        "args": {"category": "tutorial"},
    },
    "tutorial-models-spatial-stochastic": {
        "question": "What Tutorial models use Spatial Stochastic applications?",
        "tool": "fetch_biomodels",
        "args": {"category": "tutorial"},
    },
    "how-to-create-account": {
        "question": "How to create an account on VCell Software?",
        "tool": "search_vcell_knowledge_base",
        "args": {"query": "How to create an account on VCell Software?", "limit": 5},
    },
    "how-to-frap-bindings": {
        "question": "How to model FrapBindings in VCell Software?",
        "tool": "search_vcell_knowledge_base",
        "args": {"query": "How to model FrapBindings in VCell Software?", "limit": 5},
    },
    "how-to-moving-boundaries": {
        "question": "How to model Moving Boundaries in VCell Software?",
        "tool": "search_vcell_knowledge_base",
        "args": {
            "query": "How to model Moving Boundaries in VCell Software?",
            "limit": 5,
        },
    },
}
