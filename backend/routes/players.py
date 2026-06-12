"""
Players Route - Player information and details
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/players", tags=["players"])


class PlayerDetail(BaseModel):
    """Detailed player information."""
    id: str
    name: str
    country: Optional[str] = None
    position: Optional[str] = None
    current_club_id: Optional[str] = None
    stints: List[Dict[str, Any]] = []


class PlayerSearchResult(BaseModel):
    """Player search result."""
    id: str
    name: str
    country: Optional[str] = None
    position: Optional[str] = None
    current_club_id: Optional[str] = None


@router.get("/", response_model=List[PlayerSearchResult])
async def list_players(
    country: Optional[str] = Query(None, description="Filter by country"),
    name: Optional[str] = Query(None, description="Filter by name (case-insensitive partial match)"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """
    List players with optional filtering.
    
    Returns a paginated list of players matching the filter criteria.
    """
    try:
        gb = get_graph_builder()
        all_players = list(gb.player_id_to_player.values())
        
        # Apply filters
        if country:
            all_players = [p for p in all_players if p.get("country", "").lower() == country.lower()]
        
        if name:
            all_players = [p for p in all_players if name.lower() in p.get("name", "").lower()]
        
        # Apply limit
        if limit:
            all_players = all_players[:limit]
        
        # Convert to response format
        response = []
        for player in all_players:
            response.append(PlayerSearchResult(
                id=player["id"],
                name=player["name"],
                country=player.get("country"),
                position=player.get("position"),
                current_club_id=player.get("current_club_id")
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/countries")
async def get_countries():
    """Get list of all countries represented in the dataset."""
    try:
        gb = get_graph_builder()
        countries = set()
        for player in gb.player_id_to_player.values():
            country = player.get("country")
            if country:
                countries.add(country)
        return {"countries": sorted(list(countries)), "count": len(countries)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{player_id}", response_model=Dict[str, Any])
async def get_player_detail(player_id: str):
    """
    Get detailed information for a single player.
    
    Returns the player's profile, club history (stints), teammates for each stint,
    and all connected players.
    """
    try:
        gb = get_graph_builder()
        detail = gb.get_player_detail(player_id)
        
        if "error" in detail:
            raise HTTPException(status_code=404, detail=detail["error"])
        
        return detail
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{player_id}/connections")
async def get_player_connections(player_id: str):
    """Get all players connected to a given player (all teammates across all stints)."""
    try:
        gb = get_graph_builder()
        connections = gb.get_player_connections(player_id)
        
        return {
            "player_id": player_id,
            "connected_count": len(connections),
            "connected_players": connections
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
