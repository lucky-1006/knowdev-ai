# Release Metadata & Launch Guide v1.0.0 - knowDev AI

This document contains descriptions, suggested tags, and version release notes for the public GitHub launch of **knowDev AI**.

---

## 📦 Suggested Repository Details

* **Suggested Name**: `knowdev-ai`
* **Short Description**: `A self-hosted, offline-capable AI Software Engineering Assistant and RAG pipeline running PyTorch and Qdrant locally to analyze code bases, audit PRs, and connect to IDEs via Model Context Protocol (MCP).`
* **GitHub About Page Description**:
  `🔒 Secure, self-hosted developer assistant. Local RAG codebase search (Qdrant & SentenceTransformers), offline code generation & explanations (PyTorch Qwen Causal LM), pre-merge PR security auditing, and Model Context Protocol (FastMCP) support.`

---

## 🏷️ GitHub Topic Tags
Include these tags in the repository settings to maximize recruiter search exposure:
* `ai-agent`
* `rag-pipeline`
* `model-context-protocol`
* `mcp-server`
* `pytorch`
* `fastapi`
* `nextjs`
* `qdrant`
* `vector-database`
* `self-hosted`
* `code-generator`
* `pull-request-reviewer`
* `developer-tools`
* `llm-orchestrator`

---

## 📄 Release Notes v1.0.0

### 🚀 Public Release v1.0.0 — Production Ready

We are excited to announce the first production release of **knowDev AI**! This release provides developers and engineering teams with a local, private workspace to catalog repository metrics, query code structures via vector embeddings, and automate pull request review cycles.

### 🌟 Key Highlights

* **Local Inference Architecture**: Run embeddings (`all-MiniLM-L6-v2`) and language models (`Qwen-Coder`) locally on your CPU/GPU without sending code blocks to external APIs.
* **Model Context Protocol (FastMCP)**: Connect external IDEs like Cursor and Windsurf to knowDev AI tools using Server-Sent Events (SSE).
* **Codebase RAG Pipeline**: Index repository files in Qdrant vector database in minutes, enabling semantic retrieval inside chatbot prompts.
* **Automated Code Auditing**: Verify git patch changes against rule-based scanners to catch SQL Injection, exposed API secrets, and loop queries before they merge.
* **Architecture Diagram Engine**: Automatically parse tables and routes to output Mermaid flowcharts.
