# Changelog - knowDev AI

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-16

This is the flagship production-ready release of **knowDev AI** for public developer distribution.

### Added
* **FastMCP Server**: Integrated Model Context Protocol SSE handler supporting Cursor, Windsurf, and custom IDE extension connections.
* **Semantic RAG Search**: Added SentenceTransformer codebase embedding parser indexing directly into local/remote Qdrant collections.
* **Contextual Chat Console**: Frontend console panel supporting context-aware codebase dialog.
* **GitHub PR Auditing**: Built static review rules and local LLM patch scanners to detect security risks and code smells on PR URLs.
* **System Architecture Generator**: Added endpoints to parse file structures and return editable Mermaid architecture diagrams.
* **Modular Dashboard**: Created dark-theme UI console displaying code health score, test coverage, and documentation percentage charts.

### Changed
* Unified UI styles utilizing Tailwind CSS v4 variables configuration.
* Optimized CPU inference using Hugging Face pipelines for causal text generation.
* Standardized relational mapping schemas using SQLAlchemy.

### Fixed
* Fixed database URL unique constraint bugs causing repository scanning integrity errors.
* Added missing `sentence-transformers` libraries to backend requirements list.
* Standardized login credentials authentication between NextAuth provider configurations and backend test bypass logic.
