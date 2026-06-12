# Squad Graph Explorer - Backend

FastAPI backend for the Squad Graph Explorer application.

## Overview

This backend provides:
- Graph construction from the 2026 World Cup squad dataset
- REST API endpoints for querying player connections
- Support for stretch goal queries (degrees of separation, strongest connections)

## Setup

### Prerequisites

- Python 3.11+
- pip (Python package manager)

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Running the Server

```bash
# Development mode (with hot reload)
uvicorn main:app --reload --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### API Documentation

Once running, access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Core Endpoints

#### GET /api/teammates
Get all players who were teammates at a given club and season.

**Parameters:**
- `club_id` (required): Club ID (Wikidata QID)
- `season` (required): Season in YYYY-YY format (e.g., "2023-24")

**Example:**
```
GET /api/teammates?club_id=Q483020&season=2023-24
```

**Response:** Array of player objects

#### GET /api/teammates/count
Get the count of teammates for a given club and season.

**Parameters:** Same as /teammates

### Stretch Goal Endpoints

#### GET /api/connection
Find the shortest path (degrees of separation) between two players.

**Parameters:**
- `player1_id` (required): First player ID (Wikidata QID)
- `player2_id` (required): Second player ID (Wikidata QID)

**Response:** Connection data including distance, path, and player details

#### GET /api/strongest-connections
Get club-seasons with the most players.

**Parameters:**
- `min_players` (optional, default: 2): Minimum number of players to include
- `limit` (optional): Maximum number of results to return

**Response:** Array of club-season objects sorted by player count

#### GET /api/strongest-connections/top
Get the top N club-seasons by player count.

**Parameters:**
- `limit` (optional, default: 10): Number of top connections to return

### Graph Data Endpoints

#### GET /api/graph
Get complete graph data for visualization.

**Response:** Nodes, edges, and statistics for the entire graph

#### GET /api/graph/stats
Get graph statistics only.

#### GET /api/graph/nodes
Get all nodes (players) in the graph.

#### GET /api/graph/edges
Get all edges (connections) in the graph.

**Parameters:**
- `limit` (optional): Maximum number of edges to return

### Player and Club Information

#### GET /api/players
List players with optional filtering.

**Parameters:**
- `country` (optional): Filter by country
- `name` (optional): Filter by name (partial match)
- `limit` (optional): Maximum number of results

#### GET /api/players/countries
Get list of all countries represented.

#### GET /api/players/{player_id}
Get detailed information for a single player.

#### GET /api/players/{player_id}/connections
Get all players connected to a given player.

#### GET /api/clubs
List clubs with optional filtering.

**Parameters:** Same as /players

#### GET /api/clubs/countries
Get list of all club countries.

#### GET /api/clubs/{club_id}
Get detailed information for a single club.

## Data Loading

The backend automatically loads data from:
1. CDN: `https://cdn.jsdelivr.net/gh/layerx-labs/wc2026-squad-graph-dataset@afb888ebc3b806e395823a18988ee112046b65a8/players.json`
2. Fallback: Local `data/players.json` file

On first run, it will download and save a local copy for offline use.

## Graph Construction

The graph is built using the reference algorithm from the hackathon brief:

1. Group players by `(club_id, season)` tuples
2. Create edges between all pairs in each group
3. Use `club_id` (Wikidata QID) for joining, never club name

This ensures accurate connections without false edges between clubs that share names.

## Sanity Checks

The implementation includes verification of the PSG 2023-24 sanity check:
- Vitinha, Nuno Mendes, and Gonçalo Ramos should be connected
- João Neves should NOT be connected (he joined in 2024-25)

## Testing

Run tests with:
```bash
cd backend
python -m pytest tests/ -v
```

## Environment Variables

- `PORT`: Port to run the server on (default: 8000)
- `USE_CDN`: Whether to use CDN for data loading (default: true)

## License

MIT
