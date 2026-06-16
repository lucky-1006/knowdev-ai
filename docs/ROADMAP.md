# Product Development Roadmap - knowDev AI

This document outlines the features and architectural improvements planned for **knowDev AI**.

---

## 🗺️ Vision
Our goal is to build the ultimate self-hosted, offline-capable AI Software Engineering environment that guarantees codebase security and provides IDE-native completions, refactoring, and quality diagnostics.

---

## Phase 1 (Q3 2026) — RAG & Parsing Enhancements
* [ ] **AST-Aware File Ingestion**: Parse codebases using Abstract Syntax Tree (AST) definitions (via `tree-sitter`) to chunk files by classes and functions, rather than character length.
* [ ] **Multi-Language RAG Parsing**: Optimize specific prompt contexts for Python, TypeScript, Rust, Go, C++, and Java.
* [ ] **Increment Indexing**: Track git file modifications dynamically and update only changed file vector points in Qdrant, rather than re-indexing entire repositories.

## Phase 2 (Q4 2026) — Multi-Model Compatibility & Router
* [ ] **Cloud API Connectors**: Add out-of-the-box support for external cloud LLMs (Anthropic Claude 3.5, OpenAI GPT-4o, Google Gemini 1.5 Pro).
* [ ] **Model Orchestrator Router**: Automatically route simple questions to small local models and complex debugging/sprint tasks to larger models.
* [ ] **Local Embeddings GPU Acceleration**: Add configuration flags for CUDA/ROCm execution to speed up local indexing.

## Phase 3 (Q1 2027) — Automated Refactoring & PR Commits
* [ ] **One-Click Code Fix Application**: Allow developers to directly apply proposed PR review code fixes.
* [ ] **Automated GitHub PR Commits**: Enable the system to commit applied fixes and push them directly to GitHub branches.
* [ ] **CLI Agent Runner**: Command-line client to run code audits as a pre-commit hook locally.

## Phase 4 (Q2 2027) — Agentic Issues Solving
* [ ] **Autonomous Issue Agent**: Agentic flow that accepts a GitHub Issue link, researches relevant files in the RAG knowledge base, writes the patch, runs local tests, and proposes a Pull Request.
* [ ] **MCP Multi-Server Hub**: Support orchestrating third-party MCP servers (filesystem, database, search engines) to enable advanced tool execution capabilities.
