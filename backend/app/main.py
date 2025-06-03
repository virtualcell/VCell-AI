import uvicorn
from fastapi import FastAPI

from app.routes.vcelldb_router import router as vcelldb_router

ascii_art = """
╔════════════════════════════════════════════════════════════════════════════════════╗
║  ░█░█░█▀▀░█▀▀░█░░░█░░░░░█▀▀░█░█░█▀█░▀█▀░█▀▄░█▀█░▀█▀░░░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀█░█▀▄  ║
║  ░▀▄▀░█░░░█▀▀░█░░░█░░░░░█░░░█▀█░█▀█░░█░░█▀▄░█░█░░█░░░░█▀▄░█▀█░█░░░█▀▄░█▀▀░█░█░█░█  ║
║  ░░▀░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░▀▀▀░▀░▀░▀░▀░░▀░░▀▀░░▀▀▀░░▀░░░░▀▀░░▀░▀░▀▀▀░▀░▀░▀▀▀░▀░▀░▀▀░  ║
╚════════════════════════════════════════════════════════════════════════════════════╝
"""

app = FastAPI()

print(ascii_art)

# Including the routers 
app.include_router(vcelldb_router)

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
