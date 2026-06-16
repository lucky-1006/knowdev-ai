import os
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.config import settings

class RAGService:
    _model = None  # Class-level static cache for lazy loading the model
    _client = None # Class-level static cache for sharing QdrantClient

    def __init__(self):
        # 1. Initialize Qdrant Client (cached, using local disk persistence if in-memory settings)
        if RAGService._client is None:
            if settings.QDRANT_HOST == "memory":
                # Save vectors to backend/qdrant_db folder on disk
                db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "qdrant_db")
                os.makedirs(db_dir, exist_ok=True)
                RAGService._client = QdrantClient(path=db_dir)
            else:
                RAGService._client = QdrantClient(
                    host=settings.QDRANT_HOST,
                    port=settings.QDRANT_PORT,
                    api_key=settings.QDRANT_API_KEY or None
                )
        self.client = RAGService._client
        self.collection_name = "codebase_chunks"
        self.vector_size = 384 # Dimension of sentence-transformers/all-MiniLM-L6-v2

    @classmethod
    def _get_model(cls):
        """
        Lazily loads the SentenceTransformer model to prevent blocking FastAPI boot.
        """
        if cls._model is None:
            # We import here to keep application startup instant
            from sentence_transformers import SentenceTransformer
            print("Loading local SentenceTransformer model (all-MiniLM-L6-v2)...")
            cls._model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            print("Model loaded successfully.")
        return cls._model

    def create_collection(self):
        """
        Creates the Qdrant collection if it does not exist.
        """
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=self.vector_size,
                    distance=qmodels.Distance.COSINE
                )
            )
            print(f"Created collection '{self.collection_name}' in Qdrant.")

    def chunk_document(self, file_path: str, content: str, chunk_size: int = 1000, overlap: int = 150) -> list[dict]:
        """
        Splits code/document content into chunks.
        Adds file context to the top of each chunk.
        """
        if not content:
            return []
            
        chunks = []
        start = 0
        chunk_idx = 0
        
        while start < len(content):
            end = start + chunk_size
            chunk_data = content[start:end]
            
            # Formulate code-aware chunk text including path context
            chunk_text = f"File: {file_path}\nChunk: {chunk_idx + 1}\n---\n{chunk_data}"
            
            chunks.append({
                "chunk_text": chunk_text,
                "file_path": file_path,
                "start_char": start,
                "end_char": end,
                "chunk_index": chunk_idx
            })
            
            start += (chunk_size - overlap)
            chunk_idx += 1
            
        return chunks

    def index_repository_documents(self, repository_id: int, documents: list) -> int:
        """
        Chunks and vectorizes all files for a repository, then indexes them into Qdrant.
        """
        # 1. Ensure collection exists
        self.create_collection()

        # 2. Extract and chunk all files
        all_chunks = []
        for doc in documents:
            chunks = self.chunk_document(doc.file_path, doc.file_content)
            all_chunks.extend(chunks)

        if not all_chunks:
            return 0

        # 3. Generate embeddings for all chunk texts
        model = self._get_model()
        chunk_texts = [c["chunk_text"] for c in all_chunks]
        embeddings = model.encode(chunk_texts, show_progress_bar=False).tolist()

        # 4. Prepare Qdrant Points
        points = []
        for idx, (chunk, vector) in enumerate(zip(all_chunks, embeddings)):
            point_id = hash(f"{repository_id}_{chunk['file_path']}_{chunk['chunk_index']}") & 0xFFFFFFFFFFFFFFFF
            
            payload = {
                "repository_id": repository_id,
                "file_path": chunk["file_path"],
                "chunk_index": chunk["chunk_index"],
                "chunk_text": chunk["chunk_text"],
                "start_char": chunk["start_char"],
                "end_char": chunk["end_char"]
            }
            
            points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload
                )
            )

        # 5. Upsert into Qdrant (batch if large)
        batch_size = 100
        for i in range(0, len(points), batch_size):
            self.client.upsert(
                collection_name=self.collection_name,
                points=points[i:i + batch_size]
            )

        print(f"Indexed {len(points)} chunks into Qdrant for Repository ID: {repository_id}")
        return len(points)

    def search_semantic_matches(self, query: str, repository_id: int = None, limit: int = 3) -> list[dict]:
        """
        Embeds the input query and executes vector search in Qdrant database.
        """
        # Ensure collection exists
        self.create_collection()

        # 1. Generate query vector
        model = self._get_model()
        query_vector = model.encode(query).tolist()

        # 2. Configure repository filter (if specified)
        query_filter = None
        if repository_id is not None:
            query_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="repository_id",
                        match=qmodels.MatchValue(value=repository_id)
                    )
                ]
            )

        # 3. Perform Qdrant Vector search
        results = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            query_filter=query_filter,
            limit=limit
        )

        # 4. Format outputs
        matches = []
        for r in results.points:
            matches.append({
                "score": r.score,
                "file_path": r.payload.get("file_path"),
                "chunk_text": r.payload.get("chunk_text"),
                "chunk_index": r.payload.get("chunk_index")
            })

        return matches
