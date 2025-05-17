from typing import Dict, Any
from pydantic import BaseModel

class LogQuery(BaseModel):
    query: Dict[str, Any]

class LogEntry(BaseModel):
    remote_addr: str
    remote_user: str
    time_local: str
    request: str
    status: int
    body_bytes_sent: int
    http_referer: str
    http_user_agent: str
    datetime: str
    method: str
    path: str
    protocol: str