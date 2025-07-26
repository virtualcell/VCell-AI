import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.logger import get_logger
from app.core.config import settings

logger = get_logger(__file__)

# Routers
from app.routes.vcelldb_router import router as vcelldb_router
from app.routes.llms_router import router as llms_router
from app.routes.qdrant_router import router as qdrant_router
from app.routes.knowledge_base_router import router as knowledge_base_router

ascii_art = """
╔════════════════════════════════════════════════════════════════════════════════════╗
║  ░█░█░█▀▀░█▀▀░█░░░█░░░░░█▀▀░█░█░█▀█░▀█▀░█▀▄░█▀█░▀█▀░░░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀█░█▀▄  ║
║  ░▀▄▀░█░░░█▀▀░█░░░█░░░░░█░░░█▀█░█▀█░░█░░█▀▄░█░█░░█░░░░█▀▄░█▀█░█░░░█▀▄░█▀▀░█░█░█░█  ║
║  ░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░▀▀▀░▀░▀░▀░▀░░▀░░▀▀░░▀▀▀░░▀░░░░▀▀░░▀░▀░▀▀▀░▀░▀░▀▀▀░▀░▀░▀▀░  ║
╚════════════════════════════════════════════════════════════════════════════════════╝
"""

app = FastAPI()

logger.info(f"Starting App : \n {ascii_art}")
logger.info("App Ready")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Including the routers
app.include_router(knowledge_base_router, tags=["Knowledge Base"], prefix="/kb")
app.include_router(llms_router, tags=["LLM with Tool Calling"])
app.include_router(vcelldb_router, tags=["VCellDB API Wrapper"])
app.include_router(qdrant_router, tags=["Qdrant Vector DB"], prefix="/qdrant")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
