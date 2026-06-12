"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


# Common models
class PlayerBase(BaseModel):
    id: str
    name: str
    country: Optional[str] = None
    position: Optional[str] = None
    current_club_id: Optional[str] = None


class ClubBase(BaseModel):
    id: str
    name: str
    country: Optional[str] = None


# Request models
class TeammateQuery(BaseModel):
    club_id: str
    season: str


class ConnectionQuery(BaseModel):
    player1_id: str
    player2_id: str


# Response models
class PlayerResponse(PlayerBase):
    pass


class TeammateResponse(BaseModel):
    club_id: str
    season: str
    players: List[PlayerResponse]
    count: int


class ConnectionResponse(BaseModel):
    player1_id: str
    player2_id: str
    distance: int
    path: List[str]
    players: List[PlayerResponse]


class StrongestConnection(BaseModel):
    club_id: str
    club_name: str
    club_country: Optional[str] = None
    season: str
    player_count: int
    player_ids: List[str]


class GraphStats(BaseModel):
    player_count: int
    club_count: int
    edge_count: int
    club_season_groups: int
    cross_national_pairs: int
    avg_degree: float
    max_degree: int
    strongest_club_season: Dict[str, Any]


class GraphNode(BaseModel):
    id: str
    name: str
    country: Optional[str] = None
    position: Optional[str] = None
    current_club_id: Optional[str] = None
    degree: int


class GraphEdge(BaseModel):
    source: str
    target: str
    club_id: str
    club_name: str
    season: str
    club_country: Optional[str] = None


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: GraphStats
