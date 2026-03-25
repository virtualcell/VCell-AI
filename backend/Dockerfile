# 1. Use Python base image
FROM python:3.12-slim

# 2. Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 4. Set work directory
WORKDIR /app

# 5. Copy only pyproject + lock first for caching
COPY pyproject.toml uv.lock ./

# 6. Install dependencies without installing the local project package.
RUN uv sync --frozen --no-install-project

# 8. Now copy the full project
COPY . .

# 9. Expose the FastAPI dev port
EXPOSE 8000

# 10. Run uvicorn without re-syncing on each container start.
CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]