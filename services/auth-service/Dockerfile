FROM python:3.11-slim

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy Poetry files first (enables layer caching)
COPY pyproject.toml poetry.lock* ./

# Install deps system-wide (no venv)
RUN poetry config virtualenvs.create false \
  && poetry install --no-root --no-interaction --no-ansi

# Copy app code
COPY . .

# Run app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
