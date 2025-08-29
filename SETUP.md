# VCell AI Platform Setup Guide

This guide will walk you through setting up the VCell AI Platform for development, including environment configuration, Langfuse integration, and local LLM setup.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Langfuse Integration](#langfuse-integration)
- [Local LLM Setup](#local-llm-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** - For running the full stack
- **Node.js 18+** - For frontend development
- **Python 3.12+** - For backend development
- **Git** - For version control
- **Poetry** - For Python dependency management (install via `pip install poetry`)

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/virtualcell/VCell-AI.git
cd VCell-AI
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
poetry install --no-root
```

#### Frontend Dependencies
```bash
cd frontend
npm install
# or
pnpm install
```

## Environment Configuration

### 1. Backend Environment Setup

Create and configure the backend environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:

```env
# Application Settings
APP_NAME=VCell AI Platform
DEBUG=true
ENVIRONMENT=development

# Server Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database Configuration
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION_NAME=vcell_knowledge_base

# LLM Configuration
LLM_PROVIDER=openai  # or 'local' for local LLMs
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Local LLM Configuration (when using local LLMs)
LOCAL_LLM_URL=http://localhost:11434  # Ollama default
LOCAL_LLM_MODEL=llama2:13b
LOCAL_LLM_TEMPERATURE=0.7
LOCAL_LLM_MAX_TOKENS=4096

# VCell API Configuration
VCELL_API_BASE_URL=https://vcell.org/rest
VCELL_API_TIMEOUT=30

# Langfuse Configuration
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_HOST=https://cloud.langfuse.com
# or for self-hosted: LANGFUSE_HOST=http://localhost:3000

# Authentication (if using Auth0)
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=your_api_audience

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,txt,md
UPLOAD_DIR=./uploads
```

### 2. Frontend Environment Setup

Create and configure the frontend environment file:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with your configuration:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_VCELL_API_BASE_URL=https://vcell.org/rest

# Authentication
NEXT_PUBLIC_AUTH0_DOMAIN=your_domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_AUDIENCE=your_api_audience

# Langfuse Configuration
NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
NEXT_PUBLIC_LANGFUSE_HOST=https://cloud.langfuse.com

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_ANALYSIS=true
```

## Langfuse Integration

Langfuse is used for LLM observability, tracing, and analytics. Here's how to set it up:

### 1. Get Langfuse Credentials

1. Go to [Langfuse Cloud](https://cloud.langfuse.com) or set up self-hosted Langfuse
2. Create a new project
3. Copy your API keys from the project settings

### 2. Configure Langfuse in Backend

The backend automatically integrates with Langfuse when the environment variables are set. Langfuse will track:

- LLM API calls and responses
- Token usage and costs
- Response times and quality metrics
- Tool usage patterns

### 3. View Langfuse Dashboard

Access your Langfuse dashboard to monitor:
- **Traces**: Individual LLM interactions
- **Scores**: Quality metrics and feedback
- **Costs**: Token usage and API costs
- **Analytics**: Usage patterns and performance

## Local LLM Setup

### Option 1: Ollama (Recommended)

Ollama is the easiest way to run local LLMs on your machine.

#### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [ollama.ai](https://ollama.ai/download)

#### 2. Pull and Run a Model

```bash
# Pull a model (this may take a while depending on your internet)
ollama pull llama2:13b

# Or try a smaller model for faster setup
ollama pull llama2:7b

# Start the Ollama service
ollama serve
```

#### 3. Test the Model

```bash
# In a new terminal
ollama run llama2:13b "Hello, how are you?"
```

#### 4. Configure Backend for Local LLM

Update your `backend/.env`:

```env
LLM_PROVIDER=local
LOCAL_LLM_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama2:13b
LOCAL_LLM_TEMPERATURE=0.7
LOCAL_LLM_MAX_TOKENS=4096
```

### Option 2: LM Studio

LM Studio provides a GUI for running local models.

1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Download a model (e.g., Llama 2, Mistral)
3. Start the local server
4. Update your `.env` with the local server URL

### Option 3: Custom Local Server

If you have a custom LLM server, configure it in your `.env`:

```env
LLM_PROVIDER=local
LOCAL_LLM_URL=http://localhost:your_port
LOCAL_LLM_MODEL=your_model_name
LOCAL_LLM_TEMPERATURE=0.7
LOCAL_LLM_MAX_TOKENS=4096
```

### 4. Modify Code for Local LLM Usage

The backend automatically detects the `LLM_PROVIDER` environment variable. When set to `local`, it will use the local LLM configuration.

#### Backend Code Changes

The LLM service automatically switches between providers. No code changes needed if using the environment variable approach.

#### Frontend Code Changes

No frontend changes are required - the backend handles the LLM provider selection transparently.

## Running the Application

### 1. Start Qdrant Vector Database

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 2. Start Backend

```bash
cd backend
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
# or
pnpm dev
```

### 4. Using Docker Compose (Alternative)

```bash
# From project root
docker compose up --build -d
```

## Access Points

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Qdrant Dashboard**: http://localhost:6333/dashboard
- **Langfuse Dashboard**: Check your Langfuse project URL

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 2. Local LLM Not Responding

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

#### 3. Environment Variables Not Loading

```bash
# Verify .env files exist
ls -la backend/.env
ls -la frontend/.env.local

# Check if variables are loaded
echo $LLM_PROVIDER
```

#### 4. Qdrant Connection Issues

```bash
# Check if Qdrant is running
docker ps | grep qdrant

# Check Qdrant logs
docker logs qdrant

# Restart Qdrant
docker restart qdrant
```

### Performance Tips

1. **Use smaller models** for development (e.g., llama2:7b instead of llama2:13b)
2. **Enable GPU acceleration** if available (Ollama automatically detects CUDA)
3. **Monitor memory usage** - local LLMs can be memory-intensive
4. **Use Docker volumes** for persistent data storage

### Debug Mode

Enable debug logging in your backend `.env`:

```env
DEBUG=true
LOG_LEVEL=DEBUG
```

This will provide detailed logs for troubleshooting LLM interactions and API calls.

## Next Steps

After successful setup:

1. **Test the API**: Visit http://localhost:8000/docs
2. **Try the Chat**: Navigate to the chat interface in the frontend
3. **Upload Documents**: Test the knowledge base functionality
4. **Monitor with Langfuse**: Check your Langfuse dashboard for traces
5. **Explore Biomodels**: Use the search functionality to find VCell models

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Search existing [GitHub issues](https://github.com/virtualcell/VCell-AI/issues)
4. Create a new issue with detailed error information

Happy coding! 🚀
