# VCell Backend
A FastAPI-based backend service for the VCell AI platform. This service provides RESTful APIs for biomodel retrieval, AI-powered analysis, knowledge base management, and vector database operations.

## Architecture
The backend follows a clean architecture pattern with the following structure:
```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/                   # Core configurations and utilities
│   │   ├── config.py          # Application settings
│   │   └── logger.py          # Logging configuration
│   ├── routes/                # API route definitions
│   │   ├── vcelldb_router.py  # VCellDB API wrapper routes
│   │   ├── llms_router.py     # LLM and AI analysis routes
│   │   ├── knowledge_base_router.py  # Knowledge base management
│   │   └── qdrant_router.py   # Vector database operations
│   ├── controllers/           # Business logic layer
│   ├── services/              # External service integrations
│   ├── schemas/               # Pydantic data models
│   └── utils/                 # Utility functions
├── tests/                     # Test suite
├── pyproject.toml            # Poetry configuration
└── Dockerfile                # Container configuration
```

## Features

### Core Functionality
- **VCellDB Integration**: Wrapper for VCell biomodel database API
- **AI-Powered Analysis**: LLM integration with tool calling capabilities
- **Knowledge Base**: Vector-based document storage and retrieval
- **File Processing**: Support for PDF, text, and markdown files
- **RESTful APIs**: Comprehensive API endpoints with automatic documentation

### API Endpoints

#### VCellDB Routes (`/vcelldb`)
- `GET /biomodel` - Retrieve biomodels with filtering and sorting
- `GET /biomodel/{id}/simulations` - Get simulations for a biomodel
- `GET /biomodel/{id}/biomodel.vcml` - Retrieve VCML file content
- `GET /biomodel/{id}/biomodel.sbml` - Retrieve SBML file content
- `GET /biomodel/{id}/diagram` - Get diagram URL
- `GET /biomodel/{id}/diagram/image` - Get diagram image
- `GET /biomodel/{id}/applications/files` - Get application files

#### LLM Routes (`/llm`)
- `POST /query` - General LLM query with tool calling
- `POST /analyse/{biomodel_id}` - Analyze specific biomodel
- `POST /analyse/{biomodel_id}/vcml` - Analyze VCML content
- `POST /analyse/{biomodel_id}/diagram` - Analyze diagram

#### Knowledge Base Routes (`/kb`)
- `POST /create-collection` - Create knowledge base collection
- `GET /files` - List all files in knowledge base
- `POST /upload-pdf` - Upload PDF file
- `POST /upload-text` - Upload text file
- `DELETE /files/{file_name}` - Delete file
- `GET /similar` - Find similar documents
- `GET /files/{file_name}/chunks` - Get file chunks

#### Qdrant Routes (`/qdrant`)
- Direct vector database operations for advanced use cases

## Tech Stack
- **Framework**: FastAPI 0.115+
- **Language**: Python 3.12+
- **Dependency Management**: Poetry
- **Database**: Qdrant Vector Database
- **AI/ML**: OpenAI API, LangChain
- **File Processing**: PyPDF, Markitdown
- **Testing**: Pytest with async support
- **Documentation**: Auto-generated OpenAPI/Swagger docs


## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Poetry
- Docker (for Qdrant)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   poetry install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

### Using Docker

1. **Build the container**
   ```bash
   docker build -t vcell-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up backend
   ```

## 📚 API Documentation
Once the server is running, you can access:
- **Interactive API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json


## Logging
The application uses structured logging with different levels:
- **DEBUG**: Detailed debugging information
- **INFO**: General application information
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical errors
Logs are configured in `app/core/logger.py` and can be customized via environment variables.
