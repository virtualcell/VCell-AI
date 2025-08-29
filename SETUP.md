# VCell AI Platform Setup Guide

This guide will walk you through setting up the VCell AI Platform for development or simply running locally, including environment configuration, Langfuse integration, and local LLM setup.


## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** - For running the full stack
- **Node.js 18+** - For frontend development
- **Python 3.12+** - For backend development
- **Git** - For version control
- **Poetry** - For Python dependency management (install via `pip install poetry`)

## Initial Setup

## 1. Clone the Repository

Clone the repo **with submodules** (important for Langfuse):

```bash
git clone --recurse-submodules https://github.com/virtualcell/VCell-AI.git
cd VCell-AI
```

---

## 2. Setup Langfuse

Langfuse is used for LLM observability, tracing, and analytics.

### 2.1 Run Langfuse

You can use either Langfuse Cloud or self-hosted:

* **Option A – Langfuse Cloud**: [Sign up here](https://cloud.langfuse.com)
* **Option B – Self-hosted Langfuse**:

  ```bash
  cd langfuse
  docker compose up
  ```

### 2.2 Get Langfuse Credentials

1. Go to your Langfuse Cloud project or your self-hosted instance (`http://localhost:3000`).
2. Create a new project.
3. Copy your API keys from Project Settings.

Example `.env` values:

```env
LANGFUSE_SECRET_KEY=sk-lf-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LANGFUSE_PUBLIC_KEY=pk-lf-yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
LANGFUSE_HOST="http://localhost:3000"
```

When these environment variables are set, the backend automatically integrates with Langfuse. It will track:

* LLM API calls and responses
* Token usage and costs
* Response times and quality metrics
* Tool usage patterns

### 2.3 View Langfuse Dashboard

Open your Langfuse dashboard at your hosted URL or `http://localhost:6333`.

You can monitor:

* **Traces**: Individual LLM interactions
* **Scores**: Quality metrics and feedback
* **Costs**: Token usage and API expenses
* **Analytics**: Usage patterns and performance

---

## 3. Environment Configuration

### 3.1 Backend Environment Setup

Create and configure the backend environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration

### 3.2. Frontend Environment Setup

Create and configure the frontend environment file:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with your configuration

---



## 4. Using Local LLMs (Without Azure/OpenAI Keys)

### Ollama (Recommended)

Ollama is the easiest way to run local LLMs on your machine. It exposes an **OpenAI-compatible API** that the backend can connect to.



### 4.1 Install Ollama

**macOS / Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [Ollama Downloads](https://ollama.ai/download)



### 4.2 Pull Required Models

You will need **two models** to run the app properly:

1. A **chat LLM** (for conversations and reasoning)
2. An **embedding model** (for knowledge base search and retrieval)

Examples:

```bash
# Pull a chat model (choose one depending on your system resources)
ollama pull deepseek-r1:8b
# or smaller / lighter
ollama pull deepseek-r1:1.5b

# Pull an embedding model
ollama pull nomic-embed-text
```

### 4.3 Run Ollama Service

Start the Ollama background service:

```bash
ollama serve
```

### 4.4 Test the Model

Open a new terminal and run:

```bash
ollama run deepseek-r1:1.5b "Hello, how are you?"
```

If this works, Ollama is running correctly.

### 4.5 Configure Backend for Local LLM

Edit `backend/.env` to point to your local models:

```env
# Switch provider to local
PROVIDER=local

# Generic OpenAI-compatible settings
AZURE_API_KEY=ollama
AZURE_ENDPOINT=http://localhost:11434/v1

...

# Models: one LLM + one embedding model
AZURE_DEPLOYMENT_NAME=deepseek-r1:1.5b
AZURE_EMBEDDING_DEPLOYMENT_NAME=nomic-embed-text
```

### 4.6 Backend Behavior

* When `PROVIDER=azure`, the backend uses Azure OpenAI (default).
* When `PROVIDER=local`, the backend connects to the **Ollama server** and uses the models you specify in `.env`.

---

## 5. Running the Application

### 5.1 Start Qdrant Vector Database

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 5.2 Start Backend

```bash
cd backend
poetry install --no-root
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5.3 Start Frontend

```bash
cd frontend
npm install
npm run dev
# or
pnpm install
pnpm dev
```

### 5.4 Using Docker Compose (Alternative)

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
curl http://localhost:11434/v1

# Restart Ollama
ollama serve
```

#### 3. Environment Variables Not Loading

```bash
# Verify .env files exist
ls -la backend/.env
ls -la frontend/.env

# Check if variables are loaded
echo $PROVIDER
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

## Next Steps

After successful setup:

1. **Test the API**: Visit http://localhost:8000/docs
2. **Try the Chat**: Navigate to the chat interface in the frontend
3. **Upload Documents**: Test the knowledge base functionality
4. **Monitor with Langfuse**: Check your Langfuse dashboard for traces
5. **Explore Biomodels**: Use the search functionality to find VCell models

Happy coding! 🚀
