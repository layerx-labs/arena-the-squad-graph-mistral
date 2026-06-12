"""
Teammates Route - Core requirement: Given a club and season, return all players who were there together
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/teammates", tags=["teammates"])


class TeammateQuery(BaseModel):
    """Query parameters for teammates endpoint."""
    club_id: str
    season: str


class PlayerResponse(BaseModel):
    """Player data for response."""
    id: str
    name: str
    country: Optional[str] = None
    position: Optional[str] = None
    current_club_id: Optional[str] = None


@router.get("/", response_model=List[PlayerResponse])
async def get_teammates(
    club_id: str = Query(..., description="Club ID (Wikidata QID)"),
    season: str = Query(..., description="Season in YYYY-YY format, e.g., 2023-24")
):
    """
    Get all players who were teammates at a given club and season.
    
    This is the core query endpoint. Given a club_id and season, returns all players
    who were at that club during that season according to the dataset.
    
    **Example:**
    - club_id=Q483020 (PSG), season=2023-24 should return Vitinha, Nuno Mendes, Gonçalo Ramos
    - club_id=Q483020, season=2024-25 should include João Neves
    
    **Note:** Uses club_id (Wikidata QID) for joining, never club name, to avoid
    false connections between clubs that share names.
    """
    try:
        gb = get_graph_builder()
        teammates = gb.get_teammates(club_id, season)
        
        # Convert to response format
        response = []
        for player in teammates:
            response.append(PlayerResponse(
                id=player["id"],
                name=player["name"],
                country=player.get("country"),
                position=player.get("position"),
                current_club_id=player.get("current_club_id")
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying teammates: {str(e)}")


@router.get("/count")
async def get_teammates_count(
    club_id: str = Query(..., description="Club ID (Wikidata QID)"),
    season: str = Query(..., description="Season in YYYY-YY format")
):
    """Get the count of teammates for a given club and season."""
    try:
        gb = get_graph_builder()
        teammates = gb.get_teammates(club_id, season)
        return {"club_id": club_id, "season": season, "count": len(teammates)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
