FROM python:3.11-slim

# Set workdir
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy poetry files and install deps
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false \
  && poetry install --no-root --no-interaction --no-ansi

# Copy source code
COPY . .

# Expose port and start FastAPI
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]