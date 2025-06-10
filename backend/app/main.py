import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Routers
from app.routes.vcelldb_router import router as vcelldb_router
from app.routes.llms_router import router as llms_router

ascii_art = """
╔════════════════════════════════════════════════════════════════════════════════════╗
║  ░█░█░█▀▀░█▀▀░█░░░█░░░░░█▀▀░█░█░█▀█░▀█▀░█▀▄░█▀█░▀█▀░░░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀█░█▀▄  ║
║  ░▀▄▀░█░░░█▀▀░█░░░█░░░░░█░░░█▀█░█▀█░░█░░█▀▄░█░█░░█░░░░█▀▄░█▀█░█░░░█▀▄░█▀▀░█░█░█░█  ║
║  ░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░▀▀▀░▀░▀░▀░▀░░▀░░▀▀░░▀▀▀░░▀░░░░▀▀░░▀░▀░▀▀▀░▀░▀░▀▀▀░▀░▀░▀▀░  ║
╚════════════════════════════════════════════════════════════════════════════════════╝
"""

app = FastAPI()

print(ascii_art)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Including the routers
app.include_router(vcelldb_router, tags=["VCellDB API Wrapper"])
app.include_router(llms_router, tags=["LLM with Tool Calling"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
