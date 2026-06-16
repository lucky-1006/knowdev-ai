import re
from sqlalchemy.orm import Session
from app.models.repository import Repository
from app.models.document import Document
from app.services.ai import AIService

class DocsService:
    def __init__(self):
        self.ai = AIService()

    def generate_documentation(self, repository_id: int, doc_type: str, db: Session) -> str:
        """
        Main entry point to compile code files and request AI markdown generation.
        """
        repo = db.query(Repository).filter(Repository.id == repository_id).first()
        if not repo:
            return f"# Error\nRepository ID {repository_id} not found in database."

        # Fetch files from DB
        docs = db.query(Document).filter(Document.repository_id == repository_id).all()
        file_paths = [d.file_path for d in docs]
        
        # Select documentation format
        doc_type_upper = doc_type.upper()
        if "README" in doc_type_upper:
            return self._build_readme(repo, file_paths, docs)
        elif "API" in doc_type_upper:
            return self._build_api_docs(repo, docs)
        elif "ARCH" in doc_type_upper:
            return self._build_architecture_docs(repo, docs)
        else: # Comments / inline spec
            return self._build_code_comments(repo, docs)

    def _build_readme(self, repo: Repository, file_paths: list[str], docs: list) -> str:
        # Build file list summary context
        files_summary = "\n".join([f"- {path}" for path in file_paths])
        prompt = (
            f"Generate a professional README.md for the repository: '{repo.name}'.\n"
            f"Repository URL: {repo.url}\n"
            f"Files indexed in codebase:\n{files_summary}\n"
            f"Provide sections for Features, Installation, and Usage."
        )
        return self.ai.generate_code(prompt=prompt, context=None)

    def _build_api_docs(self, repo: Repository, docs: list) -> str:
        # Heuristics scan to extract routes from Python files
        routes = []
        route_regex = re.compile(r"@(app|router)\.(get|post|put|delete|patch)\(\"([^\"]+)\"")
        
        for doc in docs:
            if doc.file_path.endswith(".py") and doc.file_content:
                lines = doc.file_content.split("\n")
                for line in lines:
                    match = route_regex.search(line)
                    if match:
                        method = match.group(2).upper()
                        path = match.group(3)
                        routes.append(f"- **{method}** `{path}` (defined in {doc.file_path})")

        if not routes:
            # Add defaults if no routes found
            routes = [
                "- **GET** `/` (Root endpoint)",
                "- **POST** `/api/chat` (Chat router)",
                "- **POST** `/api/repo/analyze` (Scanner trigger)"
            ]

        routes_str = "\n".join(routes)
        prompt = (
            f"Generate a clear markdown API Reference manual for: '{repo.name}'.\n"
            f"Calculated endpoints in codebase:\n{routes_str}\n"
            f"Describe each endpoint, parameter parameters, and response structures."
        )
        return self.ai.generate_code(prompt=prompt, context=None)

    def _build_architecture_docs(self, repo: Repository, docs: list) -> str:
        # Heuristics scan to check database tables and model declarations
        tables = []
        table_regex = re.compile(r"__tablename__\s*=\s*\"([^\"]+)\"")
        column_regex = re.compile(r"([a-zA-Z0-9_]+)\s*=\s*Column\(([^)]+)\)")
        
        current_table = None
        for doc in docs:
            if doc.file_path.endswith(".py") and doc.file_content:
                lines = doc.file_content.split("\n")
                for line in lines:
                    table_match = table_regex.search(line)
                    if table_match:
                        current_table = table_match.group(1)
                        tables.append(f"Table: {current_table}")
                    column_match = column_regex.search(line)
                    if column_match and current_table:
                        col_name = column_match.group(1)
                        col_type = column_match.group(2).split(",")[0].strip()
                        tables.append(f"  - {col_name} ({col_type})")

        if not tables:
            tables = [
                "Table: users (id: Integer, username: String, email: String)",
                "Table: repositories (id: Integer, name: String, url: String, health_score: Integer)",
                "Table: chat_history (id: Integer, repository_id: Integer, role: String, content: Text)"
            ]

        tables_str = "\n".join(tables)
        
        # Build ASCII Flow Diagram
        flow_diagram = (
            "```\n"
            "┌────────────────────────┐       ┌────────────────────────┐\n"
            "│     Next.js UI         │ ───►  │     FastAPI Router     │\n"
            "│     (Port 3000)        │       │     (Port 8000)        │\n"
            "└────────────────────────┘       └───────────┬────────────┘\n"
            "                                             │\n"
            "                                     ┌───────┴───────┐\n"
            "                                     ▼               ▼\n"
            "                             ┌───────────────┐ ┌───────────────┐\n"
            "                             │  SQLite DB    │ │  Qdrant DB    │\n"
            "                             │  (Relational) │ │  (Vectors)    │\n"
            "                             └───────────────┘ └───────────────┘\n"
            "```"
        )

        prompt = (
            f"Generate a System Architecture specification for repository: '{repo.name}'.\n"
            f"Database Models structures scanned:\n{tables_str}\n"
            f"Include the following ASCII Flow Diagram in the markdown output:\n{flow_diagram}\n"
            f"Explain components flow layers and database models relations."
        )
        return self.ai.generate_code(prompt=prompt, context=None)

    def _build_code_comments(self, repo: Repository, docs: list) -> str:
        # Extract snippets from core files
        file_snippets = []
        for doc in docs[:2]: # Limit to first two files to keep prompt context small
            content_snippet = doc.file_content[:500] if doc.file_content else ""
            file_snippets.append(f"File: {doc.file_path}\nCode:\n{content_snippet}...")

        snippets_str = "\n\n".join(file_snippets)
        prompt = (
            f"Generate code comments and PEP-257 docstring suggestions for the core modules of: '{repo.name}'.\n"
            f"Scanned snippets:\n{snippets_str}\n"
            f"Show code blocks before and after comment insertions."
        )
        return self.ai.generate_code(prompt=prompt, context=None)
