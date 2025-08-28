# 1. Use Python base image
FROM python:3.12-slim

# 2. Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

# 3. Install Poetry
RUN pip install --no-cache-dir poetry

# 4. Set work directory
WORKDIR /app

# 5. Copy only pyproject + lock first for caching
COPY pyproject.toml poetry.lock* ./

# 6. Install dependencies (without virtualenvs, no-root to skip package install)
RUN poetry install --no-interaction --no-ansi --no-root

# 8. Now copy the full project
COPY . .

# 9. Expose the FastAPI dev port
EXPOSE 8000

# 10. Run uvicorn in dev mode with reload
CMD ["sh", "-c", "poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000"]