# Deployment Operations Guide - knowDev AI

This guide contains instructions to compile, bundle, and deploy the **knowDev AI** platform to production environments.

---

## 1. Hosting Matrix

| Component | Target Platform | Type | Recommended Size |
|:---|:---|:---|:---|
| **Frontend UI** | Vercel / Netlify | Serverless (Next.js) | Standard tier |
| **Backend API** | Render / AWS ECS / Railway | Containerized (FastAPI) | 2 vCPU, 4GB RAM (for CPU inference) |
| **Relational DB**| Supabase / AWS RDS | Managed PostgreSQL | PostgreSQL 15 |
| **Vector DB** | Qdrant Cloud / Managed Docker| Vector Search Engine | 1GB RAM storage |

---

## 2. Relational & Vector Databases Setup

### 2.1. PostgreSQL Relational Database
1. Provision a PostgreSQL 15 instance via Supabase or AWS RDS.
2. Retrieve the connection URI. Example:
   `postgresql://db_user:db_password@aws-rds-host:5432/knowdev_db`
3. The FastAPI server will automatically generate and migrate schemas on boot. No manual migrations are required.

### 2.2. Qdrant Cloud Vector Database
1. Create a free-tier cluster on [Qdrant Cloud Console](https://cloud.qdrant.io).
2. Generate an API Key.
3. Record the endpoint URL (e.g. `https://xxxx-xxxx.aws.cloud.qdrant.io:6333`).

---

## 3. Backend Deployment (Docker & Render)

The backend runs containerized. You can deploy it using the provided `backend/Dockerfile`.

### 3.1. Build and Test Image locally
```bash
cd backend
docker build -t knowdev-backend:latest .
```

### 3.2. Render Deploy Steps
1. Create a new **Web Service** on Render.
2. Link your GitHub repository.
3. Configure the Root Directory to `backend/`.
4. Select **Docker** as the runtime.
5. In the **Environment Variables** panel, add the following parameters:

| Variable | Value | Description |
|:---|:---|:---|
| `ENV_MODE` | `production` | Enforces authentication and security validation |
| `DATABASE_URL` | `postgresql://user:pass@db-host:5432/db` | Production PostgreSQL URI |
| `QDRANT_HOST` | `xxxx-xxxx.aws.cloud.qdrant.io` | Qdrant endpoint hostname (exclude https:// and port) |
| `QDRANT_PORT` | `6333` | Qdrant SSL port |
| `QDRANT_API_KEY` | `your-qdrant-cloud-api-key` | Qdrant API authorization key |
| `JWT_SECRET` | `generate-a-long-secure-random-key` | JWT token signature key |
| `GITHUB_TOKEN` | `your-github-personal-access-token` | Scopes repository search and commits |
| `LOCAL_INFERENCE` | `false` | Set to `false` if using cloud APIs, or `true` if hosting on GPU |

---

## 4. Frontend Deployment (Vercel)

The Next.js frontend is optimized for serverless deployments on Vercel.

### 4.1. Vercel Dashboard Config
1. Import the project repository into Vercel.
2. Set the root directory of the application to `frontend/`.
3. In the Build command config, Next.js will automatically run `npm run build`.
4. Add the following **Environment Variables**:

| Variable | Value | Description |
|:---|:---|:---|
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Base URL of your frontend |
| `NEXTAUTH_SECRET` | `generate-a-secure-nextauth-passphrase` | Secret key used to encrypt cookie sessions |
| `JWT_SECRET` | `must-match-backend-jwt-secret` | SHA-256 signing secret key |

---

## 5. System Verification Checklist

After deploying the services, run the following verification checks:

1. **Verify API Status**:
   Send a GET request to `https://your-backend-api.render.com/`. It should return:
   ```json
   {
     "status": "online",
     "message": "Welcome to CodePilot AI API. Modular Backend Setup is active."
   }
   ```
2. **Verify CORS**:
   Log in to the frontend dashboard. Inspect network requests in the browser console. Confirm that fetching `/api/repo/list` from the backend does not throw CORS origin headers violations.
3. **Verify MCP Endpoint**:
   Open `https://your-backend-api.render.com/mcp/sse` in a browser. It should establish a Server-Sent Events stream connection.
