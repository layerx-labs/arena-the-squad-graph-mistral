"""
Graph Route - Full graph data for visualization
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from graph_builder import get_graph_builder

router = APIRouter(prefix="/graph", tags=["graph"])


class GraphStats(BaseModel):
    """Graph statistics."""
    player_count: int
    club_count: int
    edge_count: int
    club_season_groups: int
    cross_national_pairs: int
    avg_degree: float
    max_degree: int
    strongest_club_season: Dict[str, Any]


class GraphData(BaseModel):
    """Complete graph data for visualization."""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    stats: GraphStats


@router.get("/", response_model=GraphData)
async def get_graph():
    """
    Get complete graph data for visualization.
    
    Returns all nodes (players) and edges (connections) in the graph,
    suitable for rendering with D3.js or other visualization libraries.
    
    **Response format:**
    - `nodes`: Array of player objects with id, name, country, position, etc.
    - `edges`: Array of connection objects with source, target, club_id, season, etc.
    - `stats`: Graph statistics
    
    **Note:** This endpoint returns a large amount of data (~1,248 nodes, ~11,000 edges).
    Consider using filtered endpoints for smaller datasets.
    """
    try:
        gb = get_graph_builder()
        graph_data = gb.get_graph_data()
        
        return GraphData(
            nodes=graph_data["nodes"],
            edges=graph_data["edges"],
            stats=GraphStats(**graph_data["stats"])
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/stats")
async def get_graph_stats():
    """Get graph statistics."""
    try:
        gb = get_graph_builder()
        return gb.stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/nodes")
async def get_nodes():
    """Get all nodes (players) in the graph."""
    try:
        gb = get_graph_builder()
        graph_data = gb.get_graph_data()
        return {"nodes": graph_data["nodes"], "count": len(graph_data["nodes"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/edges")
async def get_edges(
    limit: Optional[int] = Query(1000, description="Maximum number of edges to return")
):
    """Get all edges (connections) in the graph."""
    try:
        gb = get_graph_builder()
        graph_data = gb.get_graph_data()
        edges = graph_data["edges"]
        if limit:
            edges = edges[:limit]
        return {"edges": edges, "total_count": len(graph_data["edges"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
