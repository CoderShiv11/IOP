from fastapi import APIRouter
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import rag_service

router = APIRouter()


@router.post("/query", response_model=RAGQueryResponse)
async def query_prospectus_rag(payload: RAGQueryRequest):
    """
    RAG endpoint: query Draft Red Herring Prospectus (DRHP) or Red Herring Prospectus (RHP)
    with vector retrieval and source citation.
    """
    return rag_service.query_prospectus(ipo_id=payload.ipo_id, query=payload.query)

