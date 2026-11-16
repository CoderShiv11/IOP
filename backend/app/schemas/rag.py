from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ProspectusChunkCreate(BaseModel):
    ipo_id: int
    section_name: str
    chunk_index: int
    content: str


class ProspectusChunkResponse(BaseModel):
    id: int
    ipo_id: int
    section_name: str
    chunk_index: int
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RAGQueryRequest(BaseModel):
    ipo_id: int
    query: str


class CitationSource(BaseModel):
    section: str
    snippet: str
    relevance_score: float


class RAGQueryResponse(BaseModel):
    ipo_id: int
    query: str
    answer: str
    citations: List[CitationSource] = []
    confidence: float
    latency_ms: float

