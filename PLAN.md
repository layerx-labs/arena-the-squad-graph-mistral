# The Squad Graph Explorer - Project Plan

## Project Idea
**"Squad Graph Explorer"** - A web application that builds and visualizes a social graph of 2026 World Cup players connected by shared club history. The app loads the provided dataset, constructs the graph using the reference algorithm, and provides multiple query interfaces (REST API, web UI, interactive visualization) to explore connections between players.

**Key Differentiators:**
- **100% accurate graph construction** using the reference algorithm (group by club_id + season)
- **Multiple query interfaces**: Basic teammates query + advanced analytics (degrees of separation, strongest connections)
- **Interactive visualization** using D3.js with filters for country, club, and season
- **Cross-national insights**: Highlight connections between players from rival national teams

## Target User
- Football analysts and journalists covering the 2026 World Cup
- Fans exploring "hidden connections" between players
- Data enthusiasts interested in social graph analysis
- Developers who want to query the graph programmatically

## Core Features

### 1. Graph Construction (Core Requirement)
- Load `players.json` and `gaps.json` from CDN
- Build in-memory graph using reference algorithm:
  ```python
  groups = defaultdict(set)
  for p in players:
      for s in p["stints"]:
          groups[(s["club_id"], s["season"])].add(p["id"])
  edges = {tuple(sorted(pair)) for members in groups.values() for pair in combinations(members, 2)}
  ```
- Pre-compute indexes for fast queries:
  - `club_season_to_players`: Reverse lookup for basic query
  - `player_to_club_seasons`: For degrees of separation
  - `country_pairs`: Track cross-national connections

### 2. Query Interface (Core Requirement)
- **Basic Query**: Given club_id and season, return all players who were teammates
  - Endpoint: `GET /api/teammates?club_id={club_id}&season={season}`
  - Example: `/api/teammates?club_id=Q483020&season=2023-24` → [Vitinha, Nuno Mendes, Gonçalo Ramos]
  - Sanity check: Verify PSG 2023-24 does NOT include João Neves (he joined in 2024-25)

### 3. Advanced Queries (Stretch Goals)
- **Degrees of Separation**: BFS to find shortest path between any two players
  - Endpoint: `GET /api/connection?player1={id}&player2={id}`
  - Returns path and degree count
- **Strongest Connections**: Clubs/seasons with the most players
  - Endpoint: `GET /api/strongest-connections?min_players={n}`
  - Returns sorted list of (club_id, season, player_count, player_ids)
- **Cross-National Connections**: Pairs of players from different countries who were teammates
  - Endpoint: `GET /api/cross-national?country1={cc}&country2={cc}`

### 4. Interactive Visualization (Stretch Goal)
- **Force-directed graph** using D3.js/react-force-graph
- **Filters**:
  - By country (highlight all players from Brazil, etc.)
  - By club (show only connections through specific clubs)
  - By season (temporal filtering)
  - By degree of separation (show only nodes within N hops)
- **Node/Edge styling**:
  - Color nodes by country
  - Size nodes by degree/centrality
  - Color edges by club
  - Tooltips with player/club details
- **Path highlighting**: Show shortest path between two selected players

### 5. Web UI
- **Search interface**: Find players by name, club, or country
- **Query builder**: Form-based interface for all API endpoints
- **Visualization panel**: Interactive graph display
- **Results table**: Tabular display of query results with sorting/filtering
- **Player detail page**: Show full club history and connections for a single player

## Tech Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| Backend | FastAPI (Python 3.11+) | Lightweight, fast, easy to implement graph logic; matches reference code language |
| Frontend | React 18 + TypeScript + Vite | Modern, type-safe, fast development; widely used and well-documented |
| Visualization | D3.js + react-force-graph | Industry standard for graph visualizations; react-force-graph simplifies integration |
| Styling | Tailwind CSS | Rapid, consistent styling without CSS overhead |
| HTTP Client | axios | Simple, promise-based HTTP requests |
| Deployment | Vercel | Free tier sufficient; supports both frontend and backend; easy CI/CD |
| Package Manager | pnpm | Fast, efficient; works well with monorepo if needed |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Vercel Deployment                              │
├─────────────────────────────┬───────────────────────────────────────────┤
│         Frontend (React)     │            Backend (FastAPI)               │
│  ┌─────────────────────────┐  │  ┌─────────────────────────────────────┐ │
│  │ - QueryBuilder.tsx       │  │  │ - main.py (FastAPI app)                │ │
│  │ - Visualization.tsx      │  │  │ - graph_builder.py (graph logic)      │ │
│  │ - PlayerDetail.tsx       │  │  │ - models.py (Pydantic models)         │ │
│  │ - api.ts (axios client)  │  │  │ - routes/ (API endpoints)             │ │
│  └─────────────────────────┘  │  └─────────────────────────────────────┘ │
│  ┌─────────────────────────┐  │  ┌─────────────────────────────────────┐ │
│  │ - D3.js / react-force-   │  │  │ - data_loader.py (load JSON)          │ │
│  │   graph                 │  │  │ - indexes.py (pre-computed indexes)    │ │
│  │ - Tailwind CSS          │  │  │ - utils.py (helpers)                  │ │
│  └─────────────────────────┘  │  └─────────────────────────────────────┘ │
└─────────────────────────────┴───────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                Data Layer                                     │
│  - Load players.json from CDN (with local fallback)                         │
│  - Load gaps.json for coverage transparency                                  │
│  - Build graph in-memory at startup                                         │
│  - Pre-compute all indexes for O(1) or O(log n) queries                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Startup**: Backend loads `players.json` and `gaps.json` from CDN, builds graph and indexes
2. **Query**: Frontend sends request to backend API
3. **Processing**: Backend uses pre-computed indexes to answer queries quickly
4. **Response**: Backend returns JSON response
5. **Rendering**: Frontend displays results in table or visualization

### File Structure

```
project/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── graph_builder.py     # Graph construction logic
│   ├── indexes.py           # Pre-computed query indexes
│   ├── models.py            # Pydantic models for request/response
│   ├── routes/
│   │   ├── teammates.py     # Basic query endpoint
│   │   ├── connection.py    # Degrees of separation
│   │   ├── strongest.py     # Strongest connections
│   │   └── graph.py         # Full graph data
│   ├── data/
│   │   ├── players.json     # Local copy of dataset
│   │   └── gaps.json        # Local copy of gaps
│   ├── tests/
│   │   └── test_graph.py    # Graph construction tests
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryBuilder.tsx
│   │   │   ├── Visualization.tsx
│   │   │   ├── PlayerDetail.tsx
│   │   │   └── ResultsTable.tsx
│   │   ├── hooks/
│   │   │   └── useGraph.ts    # Graph data fetching
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript interfaces
│   │   ├── api/
│   │   │   └── index.ts       # API client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles/
│   │       └── global.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── vercel.json              # Vercel configuration
├── README.md                # Project documentation
└── PLAN.md                  # This file
```

## Rubric Mapping

### 1. Data Accuracy and Coverage (20%)
**Strategy:**
- Use the provided `players.json` and `gaps.json` exactly as-is
- Load from CDN with local fallback (commit copy to repo)
- Validate data against sanity checks from brief:
  - ~1,248 players
  - ~1,578 clubs
  - ~11,000 edges
  - PSG 2023-24: Vitinha, Nuno Mendes, Gonçalo Ramos (no João Neves)
- Never join on club name; always use club_id (Wikidata QID)
- Document coverage gaps from `gaps.json` in README

**Deliverables:**
- Data loading code with validation
- Tests that verify sanity checks
- Clear documentation of data sources and limitations

### 2. Graph Correctness (20%)
**Strategy:**
- Implement the reference algorithm exactly as provided in brief
- Group by `(club_id, season)` tuples
- Create edges between all pairs in each group (combinations of 2)
- Use sets to avoid duplicate edges
- Test with specific examples from brief (PSG 2023-24)

**Deliverables:**
- `graph_builder.py` with reference algorithm implementation
- Unit tests verifying graph construction
- Test case for PSG example

### 3. Query and Visualization Usefulness (20%)
**Strategy:**
- **Basic query**: Exact match for core requirement
- **Advanced queries**: Degrees of separation + strongest connections
- **Visualization**: Interactive graph with multiple filter options
- **UX**: Intuitive interface for non-technical users
- **Performance**: Pre-compute indexes for fast responses (<100ms for all queries)

**Deliverables:**
- REST API with all endpoints documented
- Web UI with form-based query builder
- Interactive visualization with D3.js
- Responsive design for mobile/desktop

### 4. Code Quality (20%)
**Strategy:**
- **Structure**: Clean separation of concerns (routes, models, business logic)
- **Typing**: Type hints in Python, TypeScript in frontend
- **Tests**: Unit tests for graph construction, integration tests for API
- **Documentation**: Docstrings, comments where complex logic exists
- **Style**: Consistent formatting (black for Python, prettier for JS/TS)
- **Error handling**: Graceful degradation, clear error messages

**Deliverables:**
- Well-organized codebase with clear file structure
- Type hints throughout
- Test suite with good coverage
- Consistent code style

### 5. Write-up Clarity (20%)
**Strategy:**
- **README.md**: Comprehensive setup and usage guide
  - Local development instructions
  - API documentation
  - Query examples
  - Architecture overview
  - Data sources and limitations
- **TAIKAI page**: Detailed project write-up
  - Problem statement and solution
  - Technical approach
  - Challenges and solutions
  - Results and validation

**Deliverables:**
- README.md with all sections above
- TAIKAI project page (written in build phase)

## Build Phase Milestones

| # | Milestone | Description | Success Criteria |
|---|-----------|-------------|------------------|
| 1 | Project Setup | Initialize backend (FastAPI) and frontend (React+TS+Vite) | Both projects created, basic structure in place |
| 2 | Data Loading | Load and validate `players.json` and `gaps.json` | Data loads without errors, sanity checks pass |
| 3 | Graph Construction | Implement reference algorithm | Graph has ~11,000 edges, PSG test case passes |
| 4 | Basic Query | Implement `/api/teammates` endpoint | Endpoint returns correct results for known cases |
| 5 | Advanced Queries | Implement degrees of separation and strongest connections | All advanced endpoints work correctly |
| 6 | Frontend UI | Build query builder and results display | Can query and see results in browser |
| 7 | Visualization | Add D3.js/react-force-graph visualization | Interactive graph renders with filters |
| 8 | Testing | Write unit and integration tests | All tests pass, edge cases covered |
| 9 | Documentation | Write README.md | All sections complete, clear and accurate |
| 10 | Deployment | Deploy to Vercel | App accessible at Vercel URL, all features work |
| 11 | TAIKAI Page | Write project page | Complete write-up submitted to TAIKAI |

## Definition of Done

The project is **DONE** when:

1. ✅ All core requirements are implemented:
   - Squads for all nations loaded
   - Per-player, per-season club histories loaded
   - Queryable graph built with correct connections
   - Basic query endpoint works

2. ✅ At least 2 stretch goals achieved:
   - Interactive graph visualization
   - Degrees of separation query

3. ✅ Code quality standards met:
   - Type hints in Python and TypeScript
   - Unit tests for graph construction
   - Clean, well-organized codebase
   - Consistent style

4. ✅ Documentation complete:
   - README.md with setup, usage, architecture
   - API documentation
   - Data sources and limitations documented

5. ✅ Deployment successful:
   - App deployed to Vercel
   - All features accessible and working
   - No console errors

6. ✅ TAIKAI page written:
   - Detailed project write-up
   - All required sections covered

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Dataset changes | Pin to v1.0 commit hash in CDN URL; commit local copy |
| Graph too large for memory | ~11,000 edges is small; pre-compute indexes for efficiency |
| D3.js complexity | Use react-force-graph wrapper to simplify |
| Vercel cold starts | Keep backend simple; pre-compute everything at startup |
| Time constraints | Prioritize core requirements first, then stretch goals |

## Success Metrics

- **Graph Accuracy**: 100% match with reference algorithm
- **Query Performance**: All endpoints respond in <100ms
- **Test Coverage**: >80% for backend, >70% for frontend
- **User Satisfaction**: Intuitive UI that non-developers can use
- **Documentation**: Any developer can clone, run, and understand the project

---

**Next Steps:**
1. Call `complete_phase` with summary
2. Enter BUILD phase
3. Start with Milestone 1: Project Setup
