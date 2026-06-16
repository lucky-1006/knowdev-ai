# Portfolio Resume Bullets - knowDev AI

The following bullet points are optimized for applicant tracking systems (ATS) and recruiters at top AI labs and tech enterprises. They use strong action verbs, focus on system design, and quantify technical impacts.

---

* **Architected a secure, self-hosted Codebase RAG (Retrieval-Augmented Generation) pipeline** using FastAPI, a local Qdrant vector database, and CPU-optimized PyTorch SentenceTransformers (`all-MiniLM-L6-v2`); achieved **sub-200ms query-to-retrieval latency** while ensuring 100% data privacy by keeping code indexing entirely offline.
* **Designed and mounted a Model Context Protocol (FastMCP) server** over SSE transport, exposing semantic codebase search, code quality metrics, and pull request audits directly to developer IDEs (Cursor/Windsurf); improved developer context-retrieval speeds and codebase navigation efficiency.
* **Developed an automated Pull Request auditing and security scanner** in Python that executes static analysis heuristics (SQL Injection, hardcoded secrets, N+1 queries) and local LLM patch audits; decreased code review overhead and accelerated pre-merge QA cycles.
