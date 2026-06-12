"""
Graph Builder - Constructs the social graph from player data

Implements the reference algorithm from the hackathon brief:
- Group players by (club_id, season) tuples
- Create edges between all pairs in each group
- Use club_id (Wikidata QID) for joining, never club name
"""

import json
import logging
from collections import defaultdict
from itertools import combinations
from typing import Dict, Set, Tuple, List, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class GraphBuilder:
    """Builds and manages the player connection graph."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.players: List[Dict[str, Any]] = []
        self.clubs: List[Dict[str, Any]] = []
        self.gaps: Dict[str, Any] = {}
        
        # Main graph structures
        # club_season -> set of player_ids
        self.club_season_to_players: Dict[Tuple[str, str], Set[str]] = defaultdict(set)
        
        # player_id -> set of (club_id, season) tuples
        self.player_to_club_seasons: Dict[str, Set[Tuple[str, str]]] = defaultdict(set)
        
        # All edges as tuples of (player_id_1, player_id_2) with player_id_1 < player_id_2
        self.edges: Set[Tuple[str, str]] = set()
        
        # Indexes for fast queries
        self.player_id_to_player: Dict[str, Dict[str, Any]] = {}
        self.club_id_to_club: Dict[str, Dict[str, Any]] = {}
        
        # Cross-national connections tracking
        self.cross_national_pairs: Dict[Tuple[str, str], List[Tuple[str, str, str]]] = defaultdict(list)
        
        # Statistics
        self.stats: Dict[str, Any] = {}
    
    def load_data(self, use_cdn: bool = True) -> None:
        """Load data from CDN or local files."""
        logger.info("Loading player data...")
        
        # Try CDN first, fall back to local
        cdn_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/players.json"
        gaps_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/gaps.json"
        
        try:
            import requests
            players_response = requests.get(cdn_url, timeout=30)
            players_response.raise_for_status()
            self.players = players_response.json()["players"]
            self.clubs = players_response.json()["clubs"]
            self.gaps = requests.get(gaps_url, timeout=30).json()
            logger.info("Successfully loaded data from CDN")
        except Exception as e:
            logger.warning(f"CDN load failed: {e}, trying local files")
            self._load_from_local()
        
        # Save local copy for offline use
        self._save_local_copy()
        
        logger.info(f"Loaded {len(self.players)} players, {len(self.clubs)} clubs")
    
    def _load_from_local(self) -> None:
        """Load data from local files."""
        players_path = self.data_dir / "players.json"
        gaps_path = self.data_dir / "gaps.json"
        
        if not players_path.exists():
            raise FileNotFoundError(f"Local players.json not found at {players_path}")
        
        with open(players_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            self.players = data["players"]
            self.clubs = data["clubs"]
        
        if gaps_path.exists():
            with open(gaps_path, 'r', encoding='utf-8') as f:
                self.gaps = json.load(f)
        
        logger.info("Successfully loaded data from local files")
    
    def _save_local_copy(self) -> None:
        """Save a local copy of the data for offline use."""
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        players_path = self.data_dir / "players.json"
        gaps_path = self.data_dir / "gaps.json"
        
        # Only save if we don't already have local copies
        if not players_path.exists():
            try:
                import requests
                players_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/players.json"
                gaps_url = "https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/gaps.json"
                
                players_data = requests.get(players_url, timeout=30).json()
                gaps_data = requests.get(gaps_url, timeout=30).json()
                
                with open(players_path, 'w', encoding='utf-8') as f:
                    json.dump(players_data, f, indent=2, ensure_ascii=False)
                
                with open(gaps_path, 'w', encoding='utf-8') as f:
                    json.dump(gaps_data, f, indent=2, ensure_ascii=False)
                
                logger.info("Saved local copy of data")
            except Exception as e:
                logger.warning(f"Could not save local copy: {e}")
    
    def build_graph(self) -> None:
        """Build the graph using the reference algorithm."""
        logger.info("Building graph...")
        
        # Reset graph structures
        self.club_season_to_players = defaultdict(set)
        self.player_to_club_seasons = defaultdict(set)
        self.edges = set()
        self.player_id_to_player = {}
        self.club_id_to_club = {}
        self.cross_national_pairs = defaultdict(list)
        
        # Build indexes
        for club in self.clubs:
            self.club_id_to_club[club["id"]] = club
        
        for player in self.players:
            player_id = player["id"]
            self.player_id_to_player[player_id] = player
            
            for stint in player.get("stints", []):
                club_id = stint["club_id"]
                season = stint["season"]
                
                # Add to club_season grouping
                self.club_season_to_players[(club_id, season)].add(player_id)
                
                # Add to player's club seasons
                self.player_to_club_seasons[player_id].add((club_id, season))
        
        # Create edges from groupings
        for (club_id, season), player_ids in self.club_season_to_players.items():
            if len(player_ids) >= 2:
                # Create edges between all pairs
                for pair in combinations(player_ids, 2):
                    edge = tuple(sorted(pair))
                    self.edges.add(edge)
                
                # Track cross-national connections
                self._track_cross_national(club_id, season, player_ids)
        
        # Compute statistics
        self._compute_stats()
        
        logger.info(f"Graph built: {len(self.edges)} edges, {len(self.club_season_to_players)} club-seasons")
    
    def _track_cross_national(self, club_id: str, season: str, player_ids: Set[str]) -> None:
        """Track connections between players from different national teams."""
        # Get countries for each player
        countries = {}
        for player_id in player_ids:
            player = self.player_id_to_player.get(player_id)
            if player:
                country = player.get("country", "Unknown")
                countries[player_id] = country
        
        # Find all unique country pairs
        unique_countries = set(countries.values())
        if len(unique_countries) < 2:
            return
        
        # Store cross-national pairs
        for pair in combinations(unique_countries, 2):
            country1, country2 = sorted(pair)
            self.cross_national_pairs[(country1, country2)].append((club_id, season, len(player_ids)))
    
    def _compute_stats(self) -> None:
        """Compute graph statistics."""
        self.stats = {
            "player_count": len(self.players),
            "club_count": len(self.clubs),
            "edge_count": len(self.edges),
            "club_season_groups": len(self.club_season_to_players),
            "cross_national_pairs": len(self.cross_national_pairs),
            "avg_degree": self._compute_avg_degree(),
            "max_degree": self._compute_max_degree(),
            "strongest_club_season": self._find_strongest_club_season()
        }
    
    def _compute_avg_degree(self) -> float:
        """Compute average degree of players in the graph."""
        if not self.player_id_to_player:
            return 0.0
        
        total_degree = 0
        for player_id in self.player_id_to_player:
            degree = len(self.player_to_club_seasons[player_id])
            total_degree += degree
        
        return total_degree / len(self.player_id_to_player)
    
    def _compute_max_degree(self) -> int:
        """Compute maximum degree (most club-seasons a player has)."""
        if not self.player_to_club_seasons:
            return 0
        
        return max(len(seasons) for seasons in self.player_to_club_seasons.values())
    
    def _find_strongest_club_season(self) -> Dict[str, Any]:
        """Find the club-season with the most players."""
        if not self.club_season_to_players:
            return {}
        
        strongest = max(
            self.club_season_to_players.items(),
            key=lambda x: len(x[1])
        )
        
        club_id, season = strongest[0]
        player_ids = strongest[1]
        club_name = self.club_id_to_club.get(club_id, {}).get("name", "Unknown")
        
        return {
            "club_id": club_id,
            "club_name": club_name,
            "season": season,
            "player_count": len(player_ids),
            "player_ids": list(player_ids)
        }
    
    def get_teammates(self, club_id: str, season: str) -> List[Dict[str, Any]]:
        """Get all players who were teammates at a given club and season."""
        key = (club_id, season)
        player_ids = self.club_season_to_players.get(key, set())
        
        return [
            self.player_id_to_player[pid] for pid in player_ids
            if pid in self.player_id_to_player
        ]
    
    def get_player_connections(self, player_id: str) -> List[Dict[str, Any]]:
        """Get all players connected to a given player (teammates across all clubs/seasons)."""
        if player_id not in self.player_id_to_player:
            return []
        
        # Find all club-seasons this player was in
        club_seasons = self.player_to_club_seasons.get(player_id, set())
        
        # Collect all unique teammates
        teammates = set()
        for club_id, season in club_seasons:
            for teammate_id in self.club_season_to_players.get((club_id, season), set()):
                if teammate_id != player_id:
                    teammates.add(teammate_id)
        
        return [
            self.player_id_to_player[tid] for tid in teammates
            if tid in self.player_id_to_player
        ]
    
    def find_shortest_path(self, player1_id: str, player2_id: str) -> Dict[str, Any]:
        """Find shortest path (degrees of separation) between two players using BFS."""
        if player1_id == player2_id:
            return {"path": [player1_id], "distance": 0, "players": [self.player_id_to_player[player1_id]]}
        
        if player1_id not in self.player_id_to_player or player2_id not in self.player_id_to_player:
            return {"path": [], "distance": -1, "players": []}
        
        # BFS from player1
        from collections import deque
        queue = deque()
        queue.append((player1_id, [player1_id]))
        visited = {player1_id}
        
        while queue:
            current, path = queue.popleft()
            
            # Get all teammates of current player
            club_seasons = self.player_to_club_seasons.get(current, set())
            for club_id, season in club_seasons:
                for teammate_id in self.club_season_to_players.get((club_id, season), set()):
                    if teammate_id == player2_id:
                        # Found the target
                        full_path = path + [teammate_id]
                        return {
                            "path": full_path,
                            "distance": len(full_path) - 1,
                            "players": [self.player_id_to_player[pid] for pid in full_path if pid in self.player_id_to_player]
                        }
                    
                    if teammate_id not in visited:
                        visited.add(teammate_id)
                        queue.append((teammate_id, path + [teammate_id]))
        
        # No path found
        return {"path": [], "distance": -1, "players": []}
    
    def get_strongest_connections(self, min_players: int = 2) -> List[Dict[str, Any]]:
        """Get club-seasons with the most players."""
        results = []
        for (club_id, season), player_ids in self.club_season_to_players.items():
            if len(player_ids) >= min_players:
                club_info = self.club_id_to_club.get(club_id, {})
                results.append({
                    "club_id": club_id,
                    "club_name": club_info.get("name", "Unknown"),
                    "club_country": club_info.get("country", "Unknown"),
                    "season": season,
                    "player_count": len(player_ids),
                    "player_ids": list(player_ids),
                    "players": [
                        self.player_id_to_player[pid] for pid in player_ids
                        if pid in self.player_id_to_player
                    ]
                })
        
        # Sort by player count descending
        results.sort(key=lambda x: x["player_count"], reverse=True)
        return results
    
    def get_cross_national_connections(self, country1: str = None, country2: str = None) -> List[Dict[str, Any]]:
        """Get cross-national connections, optionally filtered by countries."""
        if country1 and country2:
            key = tuple(sorted((country1, country2)))
            connections = self.cross_national_pairs.get(key, [])
            return [
                {
                    "club_id": cid,
                    "season": season,
                    "player_count": count,
                    "club_name": self.club_id_to_club.get(cid, {}).get("name", "Unknown")
                }
                for cid, season, count in connections
            ]
        
        # Return all cross-national connections
        all_connections = []
        for (c1, c2), connections in self.cross_national_pairs.items():
            for cid, season, count in connections:
                all_connections.append({
                    "country1": c1,
                    "country2": c2,
                    "club_id": cid,
                    "season": season,
                    "player_count": count,
                    "club_name": self.club_id_to_club.get(cid, {}).get("name", "Unknown")
                })
        
        all_connections.sort(key=lambda x: x["player_count"], reverse=True)
        return all_connections
    
    def get_graph_data(self) -> Dict[str, Any]:
        """Get complete graph data for visualization."""
        nodes = []
        edges = []
        
        # Create nodes
        for player_id, player in self.player_id_to_player.items():
            nodes.append({
                "id": player_id,
                "name": player.get("name", "Unknown"),
                "country": player.get("country", "Unknown"),
                "position": player.get("position", "Unknown"),
                "current_club_id": player.get("current_club_id", ""),
                "degree": len(self.player_to_club_seasons.get(player_id, set()))
            })
        
        # Create edges with metadata
        for player1_id, player2_id in self.edges:
            # Find shared club-seasons
            shared = set()
            for club_id, season in self.player_to_club_seasons.get(player1_id, set()):
                if (club_id, season) in self.player_to_club_seasons.get(player2_id, set()):
                    shared.add((club_id, season))
            
            for club_id, season in shared:
                club_info = self.club_id_to_club.get(club_id, {})
                edges.append({
                    "source": player1_id,
                    "target": player2_id,
                    "club_id": club_id,
                    "club_name": club_info.get("name", "Unknown"),
                    "season": season,
                    "club_country": club_info.get("country", "Unknown")
                })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "stats": self.stats
        }
    
    def get_player_detail(self, player_id: str) -> Dict[str, Any]:
        """Get detailed information for a single player."""
        if player_id not in self.player_id_to_player:
            return {"error": "Player not found"}
        
        player = self.player_id_to_player[player_id]
        
        # Get stints with club details
        stints = []
        for stint in player.get("stints", []):
            club_id = stint["club_id"]
            club_info = self.club_id_to_club.get(club_id, {})
            stints.append({
                "club_id": club_id,
                "club_name": club_info.get("name", "Unknown"),
                "club_country": club_info.get("country", "Unknown"),
                "season": stint["season"]
            })
        
        # Get teammates for each stint
        stunt_teammates = []
        for stint in player.get("stints", []):
            club_id = stint["club_id"]
            season = stint["season"]
            teammates = self.get_teammates(club_id, season)
            stunt_teammates.append({
                "club_id": club_id,
                "season": season,
                "teammate_count": len(teammates),
                "teammates": teammates
            })
        
        # Get connected players (all teammates across all stints)
        connected = self.get_player_connections(player_id)
        
        return {
            "player": player,
            "stints": stints,
            "stunt_teammates": stunt_teammates,
            "connected_players": connected,
            "degree": len(self.player_to_club_seasons.get(player_id, set())),
            "total_connections": len(connected)
        }


# Global graph builder instance
graph_builder = None


def get_graph_builder():
    """Get or create the global graph builder instance."""
    global graph_builder
    if graph_builder is None:
        graph_builder = GraphBuilder()
        graph_builder.load_data()
        graph_builder.build_graph()
    return graph_builder


def reset_graph_builder():
    """Reset the global graph builder (useful for testing)."""
    global graph_builder
    graph_builder = None
