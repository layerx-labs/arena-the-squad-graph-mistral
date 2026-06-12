# Squad Graph Explorer - Frontend

React + TypeScript frontend for the Squad Graph Explorer application.

## Overview

This frontend provides:
- Interactive graph visualization using D3.js and react-force-graph
- Multiple query interfaces for exploring player connections
- Responsive design with Tailwind CSS
- Type-safe code with TypeScript

## Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn

### Installation

```bash
cd frontend
pnpm install
```

### Configuration

Create a `.env` file for custom configuration:

```bash
VITE_API_URL=/api
```

### Running the Development Server

```bash
pnpm dev
```

The development server will start at `http://localhost:3000` with proxy to the backend API.

### Building for Production

```bash
pnpm build
```

This creates a production-ready build in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx         # Main application component
│   │   ├── ConnectionFinder.tsx  # Degrees of separation finder
│   │   ├── PlayerDetail.tsx      # Player detail page
│   │   ├── PlayerSearch.tsx      # Player directory with search
│   │   ├── QueryBuilder.tsx       # Teammates query interface
│   │   ├── StatsDashboard.tsx      # Main dashboard with statistics
│   │   └── Visualization.tsx      # Interactive graph visualization
│   │
│   ├── api/               # API client
│   │   └── index.ts      # Axios-based API client
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts      # All type definitions
│   │
│   ├── hooks/             # Custom React hooks
│   │
│   ├── styles/            # CSS and styling
│   │   └── global.css    # Tailwind CSS imports and custom styles
│   │
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
│
├── public/               # Static assets
│   └── index.html        # HTML template
│
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Features

### Components

1. **StatsDashboard**: Overview with statistics, top connections, and player distribution
2. **Visualization**: Interactive force-directed graph with filtering capabilities
3. **QueryBuilder**: Form-based interface for finding teammates by club and season
4. **ConnectionFinder**: Find degrees of separation between any two players
5. **PlayerSearch**: Browse and search all players in the dataset
6. **PlayerDetail**: Detailed view of a single player's club history and connections

### Visualization Features

- **Force-directed layout**: Nodes repel each other, edges pull connected nodes together
- **Color coding**: Nodes colored by country, edges colored by club
- **Filtering**: Filter by country, club, season, and node degree
- **Interactivity**: Click nodes to see details, hover for tooltips, zoom and pan
- **Custom rendering**: Custom node and edge rendering with canvas

### API Integration

The frontend connects to the backend API through the `api/` module, which provides:
- Type-safe request/response handling
- Error handling and logging
- Centralized API configuration

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | StatsDashboard | Main dashboard with statistics |
| `/explore` | Visualization | Interactive graph visualization |
| `/query` | QueryBuilder | Find teammates by club and season |
| `/connection` | ConnectionFinder | Find degrees of separation |
| `/players` | PlayerSearch | Browse all players |
| `/players/:playerId` | PlayerDetail | View player details |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool and dev server |
| **D3.js** | Graph visualization |
| **react-force-graph-2d** | Simplified D3.js graph rendering |
| **Tailwind CSS** | Styling |
| **axios** | HTTP client |
| **React Router** | Client-side routing |

## Styling

The project uses Tailwind CSS for utility-first styling. Custom styles are added in `src/styles/global.css`.

### Color Scheme

- **Primary**: Blue (#3b82f6) for main actions and highlights
- **Success**: Green (#22c55e) for positive states
- **Warning**: Yellow (#f59e0b) for warnings
- **Error**: Red (#ef4444) for errors
- **Neutral**: Gray (#6b7280) for text and borders

### Country Colors

The visualization uses specific colors for major football nations:
- Brazil: #1e40af (blue)
- France: #0055a4 (blue)
- Portugal: #006600 (green)
- Spain: #c8102e (red)
- England: #032b5f (navy)
- Germany: #000000 (black)
- And more...

## Performance

- **Bundle size**: Optimized with Vite
- **Lazy loading**: Components are code-split for faster loading
- **Graph rendering**: Canvas-based for smooth 60fps performance
- **Data fetching**: Efficient API calls with caching

## Testing

Currently, the frontend doesn't have unit tests, but you can:

1. **Manual testing**: Run the dev server and test all features
2. **Integration testing**: Verify API endpoints work with the backend
3. **Visual testing**: Check that the graph renders correctly

## Deployment

### Vercel

The project is configured for deployment to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Static Hosting

For static hosting, build the frontend and deploy the `dist` directory:

```bash
pnpm build
# Deploy the dist/ directory to any static hosting service
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **API not reachable**: Ensure the backend is running and CORS is configured
2. **Graph not rendering**: Check that the API returns valid data
3. **Styling issues**: Ensure Tailwind CSS is properly configured
4. **Type errors**: Run `tsc --noEmit` to check for TypeScript errors

### Debug Mode

Run the development server with debug logging:

```bash
pnpm dev --debug
```

## License

MIT
