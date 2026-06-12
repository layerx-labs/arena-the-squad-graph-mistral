"""
Strongest Connections Route - Stretch goal: Find clubs/seasons with the most players
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/strongest-connections", tags=["strongest"])


class StrongestConnection(BaseModel):
    """A club-season with many players."""
    club_id: str
    club_name: str
    club_country: Optional[str] = None
    season: str
    player_count: int
    player_ids: List[str]


@router.get("/", response_model=List[StrongestConnection])
async def get_strongest_connections(
    min_players: int = Query(2, description="Minimum number of players to include"),
    limit: Optional[int] = Query(100, description="Maximum number of results to return")
):
    """
    Get club-seasons with the most players.
    
    Returns all club-seasons where at least `min_players` players were teammates.
    Results are sorted by player count in descending order.
    
    **Example:**
    - PSG 2023-24 with 3 players (Vitinha, Nuno Mendes, Gonçalo Ramos)
    - Manchester City 2023-24 with multiple players
    
    **Use cases:**
    - Find the most popular clubs among World Cup players
    - Identify seasons with high concentration of talent
    - Discover "feeder clubs" that produce many national team players
    """
    try:
        gb = get_graph_builder()
        connections = gb.get_strongest_connections(min_players=min_players)
        
        # Apply limit
        if limit:
            connections = connections[:limit]
        
        # Convert to response format
        response = []
        for conn in connections:
            response.append(StrongestConnection(
                club_id=conn["club_id"],
                club_name=conn["club_name"],
                club_country=conn.get("club_country"),
                season=conn["season"],
                player_count=conn["player_count"],
                player_ids=conn["player_ids"]
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/top")
async def get_top_connections(
    limit: int = Query(10, description="Number of top connections to return")
):
    """Get the top N club-seasons by player count."""
    try:
        gb = get_graph_builder()
        connections = gb.get_strongest_connections(min_players=2)
        top = connections[:limit]
        
        response = []
        for conn in top:
            response.append({
                "rank": len(response) + 1,
                "club_name": conn["club_name"],
                "club_country": conn.get("club_country"),
                "season": conn["season"],
                "player_count": conn["player_count"]
            })
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
