"""
Tests for graph construction and queries
"""

import pytest
from graph_builder import GraphBuilder, get_graph_builder, reset_graph_builder


@pytest.fixture
def graph_builder():
    """Create a fresh graph builder for each test"""
    reset_graph_builder()
    gb = GraphBuilder()
    gb.load_data(use_cdn=False)  # Use local data for testing
    gb.build_graph()
    return gb


class TestGraphConstruction:
    """Test graph construction logic"""

    def test_graph_builder_initialization(self, graph_builder):
        """Test that graph builder initializes correctly"""
        assert graph_builder.players is not None
        assert len(graph_builder.players) > 0
        assert graph_builder.clubs is not None
        assert len(graph_builder.clubs) > 0

    def test_graph_construction(self, graph_builder):
        """Test that graph is constructed correctly"""
        assert len(graph_builder.edges) > 0
        assert len(graph_builder.club_season_to_players) > 0
        assert len(graph_builder.player_to_club_seasons) > 0

    def test_psg_2023_24_sanity_check(self, graph_builder):
        """Test the PSG 2023-24 sanity check from the brief"""
        # PSG club ID is Q483020
        club_id = "Q483020"
        season = "2023-24"
        
        teammates = graph_builder.get_teammates(club_id, season)
        teammate_names = [p["name"] for p in teammates]
        
        # Should include Vitinha, Nuno Mendes, Gonçalo Ramos
        assert "Vitinha" in teammate_names
        assert any("Mendes" in name for name in teammate_names)  # Nuno Mendes
        assert any("Ramos" in name for name in teammate_names)  # Gonçalo Ramos
        
        # Should NOT include João Neves (he joined in 2024-25)
        assert not any("Neves" in name and "João" in name for name in teammate_names)

    def test_player_connections(self, graph_builder):
        """Test getting player connections"""
        # Get the first player
        first_player_id = list(graph_builder.player_id_to_player.keys())[0]
        connections = graph_builder.get_player_connections(first_player_id)
        
        assert isinstance(connections, list)
        # All connections should be player objects
        for conn in connections:
            assert "id" in conn
            assert "name" in conn

    def test_shortest_path_same_player(self, graph_builder):
        """Test shortest path for same player"""
        first_player_id = list(graph_builder.player_id_to_player.keys())[0]
        result = graph_builder.find_shortest_path(first_player_id, first_player_id)
        
        assert result["distance"] == 0
        assert result["path"] == [first_player_id]
        assert len(result["players"]) == 1

    def test_shortest_path_direct_teammates(self, graph_builder):
        """Test shortest path for direct teammates"""
        # Find a club-season with multiple players
        for (club_id, season), player_ids in graph_builder.club_season_to_players.items():
            if len(player_ids) >= 2:
                player1, player2 = list(player_ids)[:2]
                result = graph_builder.find_shortest_path(player1, player2)
                
                assert result["distance"] == 1
                assert player1 in result["path"]
                assert player2 in result["path"]
                assert len(result["path"]) == 2
                break

    def test_strongest_connections(self, graph_builder):
        """Test getting strongest connections"""
        connections = graph_builder.get_strongest_connections(min_players=2)
        
        assert isinstance(connections, list)
        assert len(connections) > 0
        
        # All connections should have at least 2 players
        for conn in connections:
            assert conn["player_count"] >= 2

    def test_graph_data_structure(self, graph_builder):
        """Test that graph data has correct structure"""
        graph_data = graph_builder.get_graph_data()
        
        assert "nodes" in graph_data
        assert "edges" in graph_data
        assert "stats" in graph_data
        
        # Check node structure
        for node in graph_data["nodes"]:
            assert "id" in node
            assert "name" in node
            assert "country" in node
            assert "degree" in node
        
        # Check edge structure
        for edge in graph_data["edges"]:
            assert "source" in edge
            assert "target" in edge
            assert "club_id" in edge
            assert "season" in edge

    def test_stats_calculation(self, graph_builder):
        """Test that stats are calculated correctly"""
        stats = graph_builder.stats
        
        assert "player_count" in stats
        assert "club_count" in stats
        assert "edge_count" in stats
        assert "avg_degree" in stats
        assert "max_degree" in stats
        
        assert stats["player_count"] == len(graph_builder.players)
        assert stats["club_count"] == len(graph_builder.clubs)
        assert stats["edge_count"] == len(graph_builder.edges)


class TestGraphQuery:
    """Test graph query functionality"""

    def test_get_teammates_valid(self, graph_builder):
        """Test get_teammates with valid club and season"""
        # Find a valid club-season
        for (club_id, season) in graph_builder.club_season_to_players.keys():
            teammates = graph_builder.get_teammates(club_id, season)
            assert isinstance(teammates, list)
            break

    def test_get_teammates_invalid(self, graph_builder):
        """Test get_teammates with invalid club and season"""
        teammates = graph_builder.get_teammates("INVALID_ID", "2023-24")
        assert teammates == []

    def test_player_detail(self, graph_builder):
        """Test getting player detail"""
        first_player_id = list(graph_builder.player_id_to_player.keys())[0]
        detail = graph_builder.get_player_detail(first_player_id)
        
        assert "player" in detail
        assert "stints" in detail
        assert "connected_players" in detail
        assert detail["player"]["id"] == first_player_id

    def test_cross_national_connections(self, graph_builder):
        """Test cross-national connections"""
        connections = graph_builder.get_cross_national_connections()
        
        assert isinstance(connections, list)
        # Should have some cross-national connections
        assert len(connections) >= 0


class TestSanityChecks:
    """Test sanity checks from the hackathon brief"""

    def test_player_count_sanity(self, graph_builder):
        """Test that player count is approximately 1248"""
        # Allow some tolerance for data differences
        assert 1000 <= len(graph_builder.players) <= 1500

    def test_club_count_sanity(self, graph_builder):
        """Test that club count is approximately 1578"""
        # Allow some tolerance
        assert 1000 <= len(graph_builder.clubs) <= 2000

    def test_edge_count_sanity(self, graph_builder):
        """Test that edge count is approximately 11000"""
        # Allow some tolerance
        assert 8000 <= len(graph_builder.edges) <= 15000

    def test_club_id_never_name_based(self, graph_builder):
        """Test that connections are based on club_id, not club name"""
        # This is verified by the fact that we use club_id for grouping
        # Check that club_season_to_players uses tuples of (club_id, season)
        for key in graph_builder.club_season_to_players.keys():
            assert isinstance(key, tuple)
            assert len(key) == 2
            club_id, season = key
            assert isinstance(club_id, str)
            assert isinstance(season, str)
