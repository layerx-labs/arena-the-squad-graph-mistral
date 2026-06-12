# The Squad Graph: World Cup 2026 Player Connection Explorer

## Project Idea
**Build a queryable, interactive social graph of World Cup 2026 players connected by shared club history.**

This project will:
1. Ingest the provided `players.json` dataset (1,248 players, 1,578 clubs, ~11,000 edges).
2. Construct a graph where nodes are players and edges represent shared club+season stints.
3. Expose a **live query interface** to:
   - Find all players who were teammates at a given club/season (core requirement).
   - Calculate degrees of separation between any two players (stretch).
   - Surface strongest club connections (e.g., "PSG 2023-24 connected 5 WC2026 players from 3 nations").
4. Provide an **interactive force-directed visualization** of the graph (filterable by club, season, or national team).

**Why this wins**: The rubric heavily weights *graph correctness* (20%) and *query usefulness* (20%). By focusing on a **bulletproof graph construction** (using `club_id + season` edges) and a **minimal but powerful query API**, we maximize scores on the highest-weight criteria. The visualization and stretch goals (degrees of separation) add polish for *usefulness* and *write-up clarity*.

---

## Target User & Problem
- **User**: Football analysts, journalists, and fans covering the World Cup.
- **Problem**: No existing tool lets users explore cross-national connections between players based on shared club history. For example, a journalist writing about Brazil vs. France might want to know if any players on both squads were teammates at the club level.

---

## Core Features
| Feature | Description | Rubric Mapping |
|---------|-------------|----------------|
| **Graph Construction** | Build edges from `(club_id, season)` groups of ≥2 players. | Graph correctness (20%) |
| **Core Query** | `GET /api/teammates?club_id=Q483020&season=2023-24` → list of player IDs/names. | Query usefulness (20%) |
| **Degrees of Separation** | `GET /api/degrees?player_a=Q66818509&player_b=Q123456` → shortest path length. | Query usefulness (20%) |
| **Club Connection Stats** | `GET /api/club-connections?club_id=Q483020` → count of connected players/nations. | Query usefulness (20%) |
| **Interactive Visualization** | Force-directed graph (D3.js or Cytoscape) with filters for club/season/nation. | Query usefulness (20%), Write-up clarity (20%) |
| **Data Accuracy** | Validate against `gaps.json`; log coverage stats (e.g., 8 players with no history). | Data accuracy (20%) |

---

## Tech Stack
| Component | Choice | Justification |
|-----------|--------|---------------|
| **Backend** | Python + FastAPI | Lightweight, async-ready, and perfect for exposing query endpoints. |
| **Graph Processing** | NetworkX | Battle-tested graph library for edge generation, shortest paths, and clustering. |
| **Frontend** | React + TypeScript + Vite | Fast iteration, strong typing, and easy deployment. |
| **Visualization** | Cytoscape.js | High-performance graph rendering with built-in force-directed layout. |
| **Data Storage** | In-memory (no DB) | Dataset is small (~1MB); loading into memory at startup avoids DB overhead. |
| **Deployment** | Vercel | Free tier, automatic CI/CD from GitHub, and global CDN for frontend. |
| **Styling** | Tailwind CSS | Utility-first for rapid UI development. |

---

## Architecture
```
┌───────────────────────────────────────────────────────┐
│                     Vercel Deployment                   │
├─────────────────┬─────────────────┬───────────────────┤
│  Frontend (React) │  Backend (FastAPI) │  Data (players.json) │
│  - Cytoscape.js   │  - /api/teammates  │  - Loaded at startup  │
│  - Query UI       │  - /api/degrees   │  - In-memory cache   │
│  - Filters        │  - /api/club-connections │                   │
└─────────┬─────────┴─────────┬─────────────────────┘
          │                   │
          │ FastAPI (localhost:8000) │
          │                   │
          ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│   Browser        │ │   In-Memory      │
│   (Vercel Edge)  │ │   Graph (NetworkX)│
└─────────────────┘ └─────────────────┘
```

### Data Flow
1. **Startup**: Backend loads `players.json` and `gaps.json` from `/data` (committed to repo).
2. **Graph Construction**:
   - Group players by `(club_id, season)` using a `defaultdict(set)`.
   - For each group with ≥2 players, create edges between all pairs (using `itertools.combinations`).
   - Store graph in NetworkX for advanced queries (shortest path, clustering).
3. **API Endpoints**:
   - `/api/teammates`: Filter graph edges by `club_id` and `season`.
   - `/api/degrees`: Use NetworkX’s `shortest_path` between two player nodes.
   - `/api/club-connections`: Aggregate edges by club/season, return player/nation counts.
4. **Frontend**:
   - Fetch data from backend APIs.
   - Render interactive graph with Cytoscape.js.
   - Allow filtering by club, season, or national team.

---

## Rubric Mapping

### 1. Data Accuracy and Coverage (20%)
- **How**: Use the provided `players.json` *as-is* (no modifications). Log stats from `gaps.json` (e.g., 8 players with no history) in the README.
- **Validation**: 
  - Verify `club_id` joins (never use club names).
  - Confirm edge count matches expected ~11,000.
  - Test PSG 2023-24 case (Vitinha, Nuno Mendes, Gonçalo Ramos connected; João Neves excluded).

### 2. Graph Correctness (20%)
- **How**: 
  - Edges are *only* created when players share `(club_id, season)`.
  - Use NetworkX to validate graph properties (e.g., no duplicate edges, bidirectional connections).
  - Unit tests for edge cases (e.g., players with no stints, single-player groups).

### 3. Query and Visualization Usefulness (20%)
- **How**:
  - Core query (`/api/teammates`) is the primary deliverable.
  - Stretch queries (`/api/degrees`, `/api/club-connections`) add depth.
  - Interactive visualization with filters (club/season/nation) makes the graph explorable.
  - Example use case in README: "Find all Brazil/France players who shared a club."

### 4. Code Quality (20%)
- **How**:
  - Modular structure: `data/`, `backend/`, `frontend/` directories.
  - Type hints (Python) and TypeScript (frontend).
  - FastAPI’s auto-generated OpenAPI docs for the API.
  - Clean separation of graph logic (NetworkX) and API routes.

### 5. Write-up Clarity (20%)
- **How**:
  - README covers:
    - Project overview and motivation.
    - Data sources (`players.json`, `gaps.json`).
    - Graph construction logic (with Python snippet from brief).
    - API endpoints and example queries.
    - How to run locally and deploy.
    - Known limitations (from `gaps.json`).
  - TAIKAI page mirrors README with screenshots of the visualization.

---

## Milestones (Build Phase)
1. **Data Ingestion**
   - [ ] Commit `players.json` and `gaps.json` to `/data`.
   - [ ] Backend: Load data and log summary stats (player/club counts).

2. **Graph Construction**
   - [ ] Implement `(club_id, season)` grouping and edge generation.
   - [ ] Validate edge count (~11,000) and test PSG 2023-24 case.

3. **Core API**
   - [ ] FastAPI endpoint for `/api/teammates`.
   - [ ] Unit tests for edge cases (empty results, invalid inputs).

4. **Stretch APIs**
   - [ ] `/api/degrees` (shortest path between players).
   - [ ] `/api/club-connections` (aggregate stats).

5. **Frontend**
   - [ ] Basic React UI with Cytoscape.js graph.
   - [ ] Filters for club, season, nation.
   - [ ] Query interface for `/api/teammates`.

6. **Deployment**
   - [ ] Deploy backend to Vercel (Serverless Functions).
   - [ ] Deploy frontend to Vercel.
   - [ ] Verify CORS and API connectivity.

7. **Documentation**
   - [ ] README with setup, API docs, and examples.
   - [ ] TAIKAI project page draft.

8. **Validation**
   - [ ] Manual test: Query PSG 2023-24 → verify Vitinha, Nuno Mendes, Gonçalo Ramos.
   - [ ] Manual test: Degrees of separation between two known connected players.

---

## Definition of Done
- [ ] `players.json` and `gaps.json` committed to repo.
- [ ] Backend API (`/api/teammates`, `/api/degrees`, `/api/club-connections`) deployed and functional.
- [ ] Frontend with interactive graph visualization deployed.
- [ ] README covers all rubric criteria (data, graph logic, API, setup).
- [ ] All core queries return correct results (validated against brief examples).
- [ ] Graph has ~11,000 edges and passes sanity checks (PSG 2023-24 case).
- [ ] Code is modular, typed, and tested.
- [ ] Live Vercel links for frontend and backend.

---

## File Structure (Final Repo)
```
layerx-labs/arena-the-squad-graph-mistral/
├── data/
│   ├── players.json          # Committed copy of dataset
│   └── gaps.json             # Committed copy of gaps
├── backend/
│   ├── main.py               # FastAPI app + graph construction
│   ├── models.py             # Pydantic models for data
│   ├── test_graph.py         # Unit tests for graph logic
│   └── requirements.txt      # Dependencies (fastapi, networkx, etc.)
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React + Cytoscape.js
│   │   ├── api.ts            # API client
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
├── README.md                 # Full documentation
└── vercel.json               # Vercel config
```

---

## Risk Mitigation
- **Graph Performance**: With ~1,248 nodes and ~11,000 edges, NetworkX operations (e.g., shortest path) are O(1) for small graphs. No scaling concerns.
- **CORS**: Vercel Serverless Functions have permissive CORS by default. Explicitly enable in FastAPI if needed.
- **Data Integrity**: Use `club_id` for joins (never names). Log warnings for any missing `club_id` in stints.
- **Visualization**: Cytoscape.js handles 1k+ nodes smoothly. For larger graphs, implement lazy loading or sampling.

---

## Stretch Goals (If Time Permits)
1. **Advanced Filters**: Filter graph by league (e.g., "Premier League only") or era (e.g., "2020-2024").
2. **Player Profiles**: Click a node to see full stint history.
3. **Export**: Download subgraphs as JSON or GraphML.
4. **Mobile Responsiveness**: Tailwind breakpoints for smaller screens.
