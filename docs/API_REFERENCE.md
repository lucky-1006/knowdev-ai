# API Reference Manual - knowDev AI

This manual lists all API resources, request/response payload schemas, and FastMCP tools exposed by the **knowDev AI** backend service.

---

## 1. REST API Specifications

The REST API utilizes standard HTTP methods, JSON request/response formats, and token-based header authentication:
`Authorization: Bearer <JWT_TOKEN>`

### 1.1. Authentication Router (`/api/auth`)

#### `GET /api/auth/me`
Retrieves details of the currently authenticated user session.
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
```json
{
  "id": 1,
  "username": "knowdev_dev",
  "email": "dev@knowdev.ai",
  "clerk_id": "user_clerk_dev_12345",
  "created_at": "2026-06-16T14:11:00"
}
```
* **Response (401 Unauthorized)**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 1.2. Repository Router (`/api/repo`)

#### `POST /api/repo/analyze`
Scans repository metadata and calculates metrics.
* **Payload**:
```json
{
  "repository_url": "https://github.com/coder/fastapi-auth"
}
```
* **Response (200 OK)**:
```json
{
  "id": 1,
  "user_id": 1,
  "name": "fastapi-auth",
  "url": "https://github.com/coder/fastapi-auth",
  "health_score": 92,
  "code_smells": 5,
  "security_issues": 0,
  "doc_coverage": 85.0,
  "test_coverage": 75.5,
  "scan_status": "completed"
}
```

#### `POST /api/repo/index`
Splits codebase documents and uploads RAG embeddings to Qdrant.
* **Payload**:
```json
{
  "repository_url": "https://github.com/coder/fastapi-auth"
}
```
* **Response (200 OK)**:
```json
{
  "repository_url": "https://github.com/coder/fastapi-auth",
  "status": "completed",
  "chunks_indexed": 154,
  "message": "Repository fully indexed in database and Qdrant."
}
```

#### `GET /api/repo/list`
Lists all active repositories for the authenticated user.
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "fastapi-auth",
    "url": "https://github.com/coder/fastapi-auth",
    "health_score": 92,
    "code_smells": 5,
    "security_issues": 0,
    "doc_coverage": 85.0,
    "test_coverage": 75.5,
    "scan_status": "completed"
  }
]
```

---

### 1.3. Chat Router (`/api/chat`)

#### `POST /api/chat`
Submits a user query, queries the vector database for RAG context, and returns the AI reply.
* **Payload**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "How does the auth token verify?"
    }
  ],
  "repository_url": "https://github.com/coder/fastapi-auth"
}
```
* **Response (200 OK)**:
```json
{
  "response": "Based on `app/services/auth.py`, the system verifies tokens by..."
}
```

#### `GET /api/chat/history`
Retrieves chat transcripts.
* **Query Parameters**:
  * `repository_url` (optional string)
* **Response (200 OK)**:
```json
[
  {
    "role": "user",
    "content": "How does the auth token verify?",
    "timestamp": "2026-06-16T14:15:20"
  },
  {
    "role": "assistant",
    "content": "Based on `app/services/auth.py`...",
    "timestamp": "2026-06-16T14:15:25"
  }
]
```

---

### 1.4. PR Review Router (`/api/pr`)

#### `POST /api/pr/review`
Fetches a pull request diff and runs static analysis rules and local AI audits.
* **Payload**:
```json
{
  "pr_url": "https://github.com/coder/fastapi-auth/pull/12"
}
```
* **Response (200 OK)**:
```json
{
  "pr_url": "https://github.com/coder/fastapi-auth/pull/12",
  "pr_title": "Implement JWT Authentication and DB Connection Pool",
  "pr_author": "coderDev",
  "additions": 48,
  "deletions": 12,
  "files_changed": 3,
  "overall_status": "changes_requested",
  "findings": [
    {
      "file": "app/db/session.py",
      "line": 24,
      "category": "security",
      "severity": "high",
      "issue": "SQL Injection vulnerability via raw query string interpolation",
      "code_before": "query = f\"SELECT * FROM users WHERE email = '{email}'\"\nresult = db.execute(query)",
      "code_after": "query = \"SELECT * FROM users WHERE email = :email\"\nresult = db.execute(query, {\"email\": email})"
    }
  ]
}
```

---

### 1.5. Developer Code Tools Router (`/api/code`)

#### `POST /api/code/generate`
Generates functional code blocks from instructions.
* **Payload**:
```json
{
  "prompt": "Write a FastAPI rate limiter dependency",
  "context": "File: config.py\nRATE_LIMIT = 100"
}
```
* **Response (200 OK)**:
```json
{
  "generated_code": "from fastapi import Request, HTTPException\n...\n"
}
```

#### `POST /api/code/commit-message`
Generates a git commit message from a diff patch.
* **Payload**:
```json
{
  "diff": "diff --git a/main.py b/main.py\n+def run(): return"
}
```
* **Response (200 OK)**:
```json
{
  "commit_message": "feat: implement main entry point function"
}
```

#### `POST /api/code/sprint-plan`
Generates a structured sprint backlog from development objectives.
* **Payload**:
```json
{
  "repo_name": "fastapi-auth",
  "goals": "Implement OAuth2 and database indexing rules",
  "weeks": 2
}
```
* **Response (200 OK)**:
```json
{
  "repository": "fastapi-auth",
  "sprint_goal": "Implement OAuth2 and database indexing rules",
  "duration_weeks": 2,
  "tasks": [
    {
      "id": 1,
      "title": "Configure NextAuth custom credentials providers",
      "effort": "3d",
      "priority": "High",
      "status": "Todo"
    }
  ],
  "roadmap": [
    {
      "phase": "Week 1",
      "focus": "Backend endpoints setup and service layer prompts validation"
    }
  ],
  "total_effort_estimation": "8 developer-days"
}
```

#### `POST /api/code/scan-dependencies`
Checks packages lists for known insecure dependencies.
* **Payload**:
```json
{
  "requirements_txt": "django==3.2.0\nrequests==2.25.1",
  "package_json": ""
}
```
* **Response (200 OK)**:
```json
{
  "vulnerabilities": [
    {
      "package": "requests",
      "current_version": "2.25.1",
      "severity": "Medium",
      "cve": "CVE-2021-33503",
      "description": "Session fixation vulnerability via keep-alive connection headers leak.",
      "remediation": "Upgrade to requests>=2.26.0"
    }
  ]
}
```

#### `POST /api/code/architecture`
Returns a Mermaid graph representation of the project modules.
* **Payload**:
```json
{
  "repo_name": "fastapi-auth"
}
```
* **Response (200 OK)**:
```json
{
  "diagram": "graph TD\n  UI[\"Next.js UI Frontend\"] --> API[\"FastAPI Main Server\"]\n..."
}
```

---

## 2. Model Context Protocol (FastMCP) Tools

knowDev AI integrates an MCP Server mounted at `/mcp` using the Server-Sent Events (SSE) protocol. The following tools are available to external client integrations:

### `search_codebase`
Performs semantic retrieval against the indexed vector database.
* **Parameters**:
  * `query` (string, required): Text search prompt.
  * `limit` (integer, optional): Maximum chunks to return. Default: 3.
* **Return Format**: Text summary of matching code blocks.

### `get_repositories_metrics`
Returns code quality, vulnerabilities, and coverage metrics across all indexed repos.
* **Parameters**: None.
* **Return Format**: Markdown list summarizing scores.

### `get_pr_findings`
Retrieves code smells and security warnings for a specific PR url.
* **Parameters**:
  * `pr_url` (string, required): GitHub PR URL.
* **Return Format**: Markdown summary of findings.

### `explain_code_snippet`
Generates a step-by-step code explanation using the local causal model.
* **Parameters**:
  * `code` (string, required): Source code to explain.
* **Return Format**: Step-by-step explanation guide.
