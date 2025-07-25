# 1. Use Python base image
FROM python:3.11-slim

# 2. Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.2

# 3. Install Poetry
RUN pip install "poetry==$POETRY_VERSION"

# 4. Set work directory
WORKDIR /app

# 5. Copy only dependency files first for layer caching
COPY pyproject.toml poetry.lock* ./

# 6. Copy .env file
COPY .env .env

# 7. Install dependencies (without virtualenvs)
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# 8. Copy rest of the app
COPY . .

# 9. Expose the FastAPI dev port
EXPOSE 8000

# 10. Run uvicorn in dev mode with reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]