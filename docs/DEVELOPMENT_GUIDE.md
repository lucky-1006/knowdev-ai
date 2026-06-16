# Local Development Guide - knowDev AI

This guide contains instructions to configure, run, and test the **knowDev AI** codebase on a local development workstation.

---

## 1. Project Dependencies

* **Runtime**: Python 3.11+, Node 20+.
* **Docker**: Recommended for running services (PostgreSQL, Qdrant) easily.
* **Git**: Required to clone and track changes.

---

## 2. Configuration Setup

### 2.1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create your virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate # or .\venv\Scripts\Activate.ps1 on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
5. Adjust `.env` keys. If you want to use the local vector database, set:
   `QDRANT_HOST=memory`
   The system will automatically persist vectors on disk under `backend/qdrant_db/`.

### 2.2. Database Initialization & Seeding
Populate your database with mock repositories, user, reviews, and documents to start testing immediately:
```bash
# Set PYTHONPATH to project root
export PYTHONPATH=$PYTHONPATH:.
# Run the seeding script
python app/db/seed.py
```

---

## 3. Launching Services

To launch the backend API and Next.js frontend in development mode:

### 3.1. Start FastAPI Backend
```bash
cd backend
python main.py
```
The FastAPI instance will load Uvicorn and run on `http://127.0.0.1:8000` with hot-reloading active.

### 3.2. Start Next.js Frontend
```bash
cd frontend
npm run dev
```
The Next.js client-side interface will start on `http://localhost:3000`.

---

## 4. Running Test Suites

### 4.1. Run Backend Pytest
Verify API endpoint routes, RAG operations, and SQLAlchemy models:
```bash
cd backend
pytest tests/ -v
```

### 4.2. Run Frontend Jest Components
Verify React rendering, auth hooks, and layout state configurations:
```bash
cd frontend
npm run test
```

### 4.3. Run Playwright E2E Tests
Verify user flows, logins, and workspace interactions:
```bash
cd frontend
npx playwright install --with-deps
npm run test:e2e
```
---

## 5. Development Guidelines & Conventions

* **Typing Checks**: Always use Python type hints (`mypy` compliant) in the backend service. Always run Next.js TypeScript check (`npm run build` or `npx tsc --noEmit`) before proposing pull requests.
* **Mock Bypass**: When developing offline, NextAuth credentials provider can log in as `developer` or `knowdev_dev`. The backend automatically provision credentials for this user under `ENV_MODE = "development"`.
* **FastMCP Tool Tests**: You can test MCP tools from your terminal. Boot the backend server, and connect an MCP debugging tool (e.g. `@modelcontextprotocol/inspector`) to `http://127.0.0.1:8000/mcp/sse`.
