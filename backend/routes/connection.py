"""
Connection Route - Stretch goal: Degrees of separation between any two players
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/connection", tags=["connection"])


class ConnectionQuery(BaseModel):
    """Query parameters for connection endpoint."""
    player1_id: str
    player2_id: str


class ConnectionResponse(BaseModel):
    """Response for connection query."""
    player1_id: str
    player2_id: str
    distance: int  # -1 means no connection
    path: List[str]
    players: List[dict]


@router.get("/", response_model=ConnectionResponse)
async def find_connection(
    player1_id: str = Query(..., description="First player ID (Wikidata QID)"),
    player2_id: str = Query(..., description="Second player ID (Wikidata QID)")
):
    """
    Find the shortest path (degrees of separation) between two players.
    
    Uses BFS to find the shortest path through shared club-seasons.
    Two players are connected if they were teammates at the same club in the same season.
    
    **Response:**
    - `distance`: Number of edges in the shortest path (-1 if no path exists)
    - `path`: List of player IDs in the path (including both endpoints)
    - `players`: Full player data for each player in the path
    
    **Example:**
    - If Player A and Player B were teammates at PSG in 2023-24, distance=1
    - If Player A was with Player B at PSG, and Player B was with Player C at Man City,
      then A to C has distance=2 through B
    """
    try:
        gb = get_graph_builder()
        result = gb.find_shortest_path(player1_id, player2_id)
        
        return ConnectionResponse(
            player1_id=player1_id,
            player2_id=player2_id,
            distance=result["distance"],
            path=result["path"],
            players=result["players"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding connection: {str(e)}")
