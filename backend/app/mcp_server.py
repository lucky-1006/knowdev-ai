from mcp.server.fastmcp import FastMCP

# Initialize the FastMCP server
mcp_server = FastMCP("CodePilot AI")

@mcp_server.tool()
async def search_codebase(query: str, limit: int = 3) -> str:
    """
    Perform a semantic vector database search on the indexed codebase.
    Returns relevant code chunks matching the query.
    """
    from app.services.rag import RAGService
    rag = RAGService()
    try:
        results = rag.search_chunks(query, limit=limit)
        if not results:
            return "No matching code chunks found for the query."
        
        formatted = []
        for r in results:
            formatted.append(
                f"--- File: {r['file_path']} ---\n"
                f"Snippet:\n{r['content']}\n"
            )
        return "\n".join(formatted)
    except Exception as e:
        return f"Error executing semantic codebase search: {str(e)}"

@mcp_server.tool()
async def get_repositories_metrics() -> str:
    """
    Retrieve health scores, docstring coverage, testing ratios, and code smell statistics 
    for all scanned repositories in the system.
    """
    from app.db.session import SessionLocal
    from app.models.repository import Repository
    
    db = SessionLocal()
    try:
        repos = db.query(Repository).all()
        if not repos:
            return "No repositories have been analyzed or registered yet."
        
        formatted = []
        for r in repos:
            formatted.append(
                f"Repository: {r.name}\n"
                f"URL: {r.url}\n"
                f"Health Score: {r.health_score}/100\n"
                f"Code Smells: {r.code_smells}\n"
                f"Security Vulnerabilities: {r.security_issues}\n"
                f"Documentation Coverage: {r.doc_coverage}%\n"
                f"Test Coverage: {r.test_coverage}%\n"
                f"--------------------------------------\n"
            )
        return "\n".join(formatted)
    except Exception as e:
        return f"Error fetching repositories metrics: {str(e)}"
    finally:
        db.close()

@mcp_server.tool()
async def get_pr_findings(pr_url: str) -> str:
    """
    Retrieve all security risks, code smells, and performance bottlenecks identified 
    for a specific GitHub Pull Request URL.
    """
    from app.db.session import SessionLocal
    from app.models.review import PRReview
    
    db = SessionLocal()
    try:
        reviews = db.query(PRReview).filter(PRReview.pr_url == pr_url).all()
        if not reviews:
            return f"No review findings found for Pull Request URL: {pr_url}"
        
        formatted = [
            f"Pull Request Title: {reviews[0].pr_title or 'PR Review'}",
            f"Author: {reviews[0].pr_author or 'unknown'}",
            f"Additions: +{reviews[0].additions or 0}, Deletions: -{reviews[0].deletions or 0}",
            f"Files Changed: {reviews[0].files_changed or 0}\n",
            "Findings List:"
        ]
        
        for r in reviews:
            formatted.append(
                f"- [{r.category.upper()}] Severity: {r.severity.upper()} in {r.file_path}:{r.line_number}\n"
                f"  Issue: {r.issue_description}\n"
                f"  Proposed Fix:\n  {r.code_after or 'No fix proposed.'}\n"
            )
        return "\n".join(formatted)
    except Exception as e:
        return f"Error retrieving PR findings: {str(e)}"
    finally:
        db.close()

@mcp_server.tool()
async def explain_code_snippet(code: str) -> str:
    """
    Provide a detailed line-by-line explanation for a given block of programming code 
    using the local AI causal text generator.
    """
    from app.services.ai import AIService
    ai = AIService()
    try:
        explanation = ai.explain_code(code)
        return explanation
    except Exception as e:
        return f"Error generating code explanation: {str(e)}"
