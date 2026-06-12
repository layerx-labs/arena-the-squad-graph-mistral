# Squad Graph Explorer - Frontend

React + TypeScript frontend for the Squad Graph Explorer application.

## Overview

This frontend provides:
- Interactive graph visualization with D3.js and react-force-graph
- Multiple query interfaces for exploring player connections
- Responsive design with Tailwind CSS
- Type-safe codebase with TypeScript

## Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd frontend
pnpm install
# or
npm install
```

### Running the Development Server

```bash
pnpm dev
# or
npm run dev
```

The development server will start at `http://localhost:3000` and proxy API requests to `http://localhost:8000`.

### Building for Production

```bash
pnpm build
# or
npm run build
```

This creates a `dist` directory with optimized production builds.

### Preview Production Build

```bash
pnpm preview
# or
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── QueryBuilder.tsx  # Basic teammates query interface
│   │   ├── Visualization.tsx # Interactive graph visualization
│   │   ├── ConnectionFinder.tsx # Degrees of separation tool
│   │   ├── StatsDashboard.tsx # Overview and statistics
│   │   ├── PlayerSearch.tsx  # Player directory
│   │   └── PlayerDetail.tsx  # Individual player details
│   │
│   ├── hooks/               # React hooks
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── api/                 # API clients
│   │   └── index.ts
│   │
│   ├── styles/              # CSS and Tailwind
│   │   └── global.css
│   │
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
│
├── public/                 # Static files
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Features

### Graph Visualization
- Force-directed graph layout using react-force-graph
- Color-coded nodes by country
- Customizable display options (labels, node size, link distance)
- Interactive filtering by country, club, season, and degree
- Node selection and highlighting

### Query Builder
- Form-based interface for the core teammates query
- Club and season selection with search
- Quick query buttons for popular clubs
- Results displayed in a sortable table

### Connection Finder
- Find degrees of separation between any two players
- Visual path display showing the connection chain
- Player search with autocomplete
- Random connection generator for exploration

### Player Directory
- Searchable list of all players
- Filter by country
- Pagination support
- Detailed player profiles

### Statistics Dashboard
- Overview of graph statistics
- Top club-seasons by player count
- Player distribution by country
- Quick access to main features

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=/api
```

- `VITE_API_URL`: Base URL for API requests (default: `/api`)

### Proxy Configuration

The Vite config includes a proxy for API requests:

```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

This allows the frontend to make requests to `/api/*` which are proxied to the backend during development.

## TypeScript Types

The project uses TypeScript for type safety. Main types are defined in `src/types/index.ts`:

- `Player`: Player information
- `Club`: Club information
- `GraphNode`, `GraphEdge`: Graph visualization data
- `ConnectionResponse`: Degrees of separation result
- `VisualizationFilter`: Graph filtering options

## API Client

The `src/api/index.ts` file provides a centralized API client with:

- Axios instance with error handling
- Dedicated modules for each API endpoint group
- Type-safe response handling
- Error interception and logging

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom styles**: Additional styles in `src/styles/global.css`
- **Responsive design**: Mobile-first approach with responsive breakpoints

## Dependencies

- **React 18**: UI library
- **TypeScript**: Type system
- **Vite**: Build tool
- **react-force-graph-2d**: Graph visualization
- **D3.js**: Graph utilities
- **axios**: HTTP client
- **Tailwind CSS**: Styling
- **react-router-dom**: Routing

## License

MIT
