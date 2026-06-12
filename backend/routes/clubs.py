"""
Clubs Route - Club information and filtering
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/clubs", tags=["clubs"])


class ClubInfo(BaseModel):
    """Club information."""
    id: str
    name: str
    country: Optional[str] = None


class ClubDetail(BaseModel):
    """Detailed club information with player counts."""
    id: str
    name: str
    country: Optional[str] = None
    player_count: int
    seasons: List[str]


@router.get("/", response_model=List[ClubInfo])
async def list_clubs(
    country: Optional[str] = Query(None, description="Filter by country"),
    name: Optional[str] = Query(None, description="Filter by name (case-insensitive partial match)"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """
    List clubs with optional filtering.
    """
    try:
        gb = get_graph_builder()
        all_clubs = list(gb.club_id_to_club.values())
        
        # Apply filters
        if country:
            all_clubs = [c for c in all_clubs if c.get("country", "").lower() == country.lower()]
        
        if name:
            all_clubs = [c for c in all_clubs if name.lower() in c.get("name", "").lower()]
        
        # Apply limit
        if limit:
            all_clubs = all_clubs[:limit]
        
        # Convert to response format
        response = []
        for club in all_clubs:
            response.append(ClubInfo(
                id=club["id"],
                name=club["name"],
                country=club.get("country")
            ))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/countries")
async def get_club_countries():
    """Get list of all club countries."""
    try:
        gb = get_graph_builder()
        countries = set()
        for club in gb.club_id_to_club.values():
            country = club.get("country")
            if country:
                countries.add(country)
        return {"countries": sorted(list(countries)), "count": len(countries)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/{club_id}", response_model=Dict[str, Any])
async def get_club_detail(club_id: str):
    """
    Get detailed information for a single club.
    
    Returns club info, all seasons it appears in, and player counts per season.
    """
    try:
        gb = get_graph_builder()
        
        if club_id not in gb.club_id_to_club:
            raise HTTPException(status_code=404, detail="Club not found")
        
        club = gb.club_id_to_club[club_id]
        
        # Find all seasons this club appears in
        seasons = set()
        for (cid, season), players in gb.club_season_to_players.items():
            if cid == club_id:
                seasons.add(season)
        
        # Get player count per season
        season_data = []
        for season in sorted(seasons):
            players = gb.club_season_to_players.get((club_id, season), set())
            season_data.append({
                "season": season,
                "player_count": len(players),
                "player_ids": list(players)
            })
        
        return {
            "club": club,
            "seasons": season_data,
            "total_players": sum(s["player_count"] for s in season_data),
            "season_count": len(seasons)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
