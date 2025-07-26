# 1. Use Python base image
FROM python:3.12-slim

# 2. Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Install Poetry
RUN pip install poetry

# 4. Set work directory
WORKDIR /app

# 5. Copy only pyproject + lock first for caching
COPY pyproject.toml poetry.lock* .env README.md ./

# 6. Install dependencies (without virtualenvs, no-root to skip package install)
RUN poetry config virtualenvs.create false \
 && poetry install --no-interaction --no-ansi --no-root

# 7. Now copy the full project including .env
COPY . .

# 8. Expose the FastAPI dev port
EXPOSE 8000

# 9. Run uvicorn in dev mode with reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]