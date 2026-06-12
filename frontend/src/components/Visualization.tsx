import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import { graphApi, playersApi } from '../api';

interface VisualizationProps {
  initialFilters?: any;
}

interface NodeData {
  id: string;
  name: string;
  country?: string;
  position?: string;
  current_club_id?: string;
  degree?: number;
  x?: number;
  y?: number;
}

interface EdgeData {
  source: string;
  target: string;
  club_id?: string;
  club_name?: string;
  season?: string;
  club_country?: string;
}

interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
  stats: any;
}

const Visualization: React.FC<VisualizationProps> = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [minDegree, setMinDegree] = useState<number>(0);
  const [maxDegree, setMaxDegree] = useState<number>(100);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableClubs, setAvailableClubs] = useState<string[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(false);

  const graphRef = useRef<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load graph data
        const data = await graphApi.getGraph();
        setGraphData(data);

        // Extract unique values for filters - use type assertions to handle undefined
        const countrySet = new Set<string>();
        data.nodes.forEach((n: NodeData) => {
          if (n.country) countrySet.add(n.country);
        });
        const countries: string[] = Array.from(countrySet).sort();

        const clubSet = new Set<string>();
        data.edges.forEach((e: EdgeData) => {
          if (e.club_name) clubSet.add(e.club_name);
        });
        const clubs: string[] = Array.from(clubSet).sort();

        const seasonSet = new Set<string>();
        data.edges.forEach((e: EdgeData) => {
          if (e.season) seasonSet.add(e.season);
        });
        const seasons: string[] = Array.from(seasonSet).sort();

        setAvailableCountries(countries);
        setAvailableClubs(clubs);
        setAvailableSeasons(seasons);

      } catch (err) {
        setError('Failed to load graph data. Please check if the backend is running.');
        console.error('Error loading graph:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter nodes and edges based on current filters
  const filteredData = useMemo(() => {
    if (!graphData) return { nodes: [] as NodeData[], edges: [] as EdgeData[] };

    let nodes: NodeData[] = [...graphData.nodes];
    let edges: EdgeData[] = [...graphData.edges];

    // Filter by country
    if (selectedCountries.length > 0) {
      const selectedSet = new Set(selectedCountries);
      nodes = nodes.filter(n => n.country && selectedSet.has(n.country));
      edges = edges.filter((e: EdgeData) => {
        const sourceNode = graphData.nodes.find((n: NodeData) => n.id === e.source);
        const targetNode = graphData.nodes.find((n: NodeData) => n.id === e.target);
        return (sourceNode?.country && selectedSet.has(sourceNode.country)) ||
               (targetNode?.country && selectedSet.has(targetNode.country));
      });
    }

    // Filter by club
    if (selectedClubs.length > 0) {
      const selectedSet = new Set(selectedClubs);
      edges = edges.filter((e: EdgeData) => e.club_name && selectedSet.has(e.club_name));
      // Keep nodes that appear in remaining edges
      const edgeNodeIds = new Set<string>();
      edges.forEach((e: EdgeData) => {
        edgeNodeIds.add(e.source);
        edgeNodeIds.add(e.target);
      });
      nodes = nodes.filter(n => edgeNodeIds.has(n.id));
    }

    // Filter by season
    if (selectedSeasons.length > 0) {
      const selectedSet = new Set(selectedSeasons);
      edges = edges.filter((e: EdgeData) => e.season && selectedSet.has(e.season));
      // Keep nodes that appear in remaining edges
      const edgeNodeIds = new Set<string>();
      edges.forEach((e: EdgeData) => {
        edgeNodeIds.add(e.source);
        edgeNodeIds.add(e.target);
      });
      nodes = nodes.filter(n => edgeNodeIds.has(n.id));
    }

    // Filter by degree
    nodes = nodes.filter((n: NodeData) => (n.degree || 0) >= minDegree && (n.degree || 0) <= maxDegree);

    // Remove edges that reference filtered-out nodes
    const validNodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter((e: EdgeData) => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    return { nodes, edges };
  }, [graphData, selectedCountries, selectedClubs, selectedSeasons, minDegree, maxDegree]);

  // Create node canvas object for custom rendering
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = showLabels ? node.name || '' : '';
    const fontSize = 12 / globalScale;
    const renderNodeSize = 8 * globalScale;

    // Draw circle
    ctx.beginPath();
    ctx.arc(node.x || 0, node.y || 0, renderNodeSize / 2, 0, 2 * Math.PI, false);
    
    // Color by country
    const colors: Record<string, string> = {
      'Brazil': '#1e40af', 'France': '#0055a4', 'Portugal': '#006600',
      'Spain': '#c8102e', 'England': '#032b5f', 'Germany': '#000000',
      'Argentina': '#397cc3', 'Netherlands': '#f74900', 'Belgium': '#fdbb29',
      'Italy': '#009246', 'Croatia': '#1d2748', 'Uruguay': '#132071',
      'Switzerland': '#d52b1e', 'Denmark': '#c60c30', 'Poland': '#dc143c',
      'USA': '#012169', 'Mexico': '#006847', 'Canada': '#d52b1e',
      'Japan': '#002b7f', 'South Korea': '#0047a0', 'Australia': '#00843d',
      'Morocco': '#c1272d', 'Senegal': '#008231', 'Nigeria': '#008751',
    };
    
    const countryColor = node.country ? colors[node.country] || '#6b7280' : '#6b7280';
    
    // Highlight selected/hovered nodes
    if (node.id === selectedNode) {
      ctx.fillStyle = '#fbbf24'; // Yellow for selected
    } else if (node.id === hoveredNode) {
      ctx.fillStyle = '#f59e0b'; // Orange for hovered
    } else {
      ctx.fillStyle = countryColor;
    }
    ctx.fill();

    // Draw border for highlighted nodes
    if (node.id === selectedNode || node.id === hoveredNode) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Draw label
    if (label && globalScale > 0.5) {
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(label, (node.x || 0) + (renderNodeSize / 2 + 5), (node.y || 0) - (renderNodeSize / 2 + 5));
    }
  };

  // Create link canvas object for custom rendering
  const linkCanvasObject = (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = { x: link.source?.x || 0, y: link.source?.y || 0 };
    const end = { x: link.target?.x || 0, y: link.target?.y || 0 };

    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    // Color by club (simplified)
    const clubColors: Record<string, string> = {
      'Paris Saint-Germain FC': '#e5000f',
      'Manchester City FC': '#6cabdd',
      'Real Madrid CF': '#ffffff',
      'FC Barcelona': '#a50044',
      'Bayern Munich': '#fc0000',
    };
    
    ctx.strokeStyle = clubColors[link.club_name || ''] || '#9ca3af';
    ctx.lineWidth = 0.5 / globalScale;
    ctx.stroke();
  };

  // Handle node click
  const handleNodeClick = (node: any) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
  };

  // Handle node hover
  const handleNodeHover = (node: any | null) => {
    setHoveredNode(node?.id || null);
  };

  // Center graph on selected node
  useEffect(() => {
    if (selectedNode && graphRef.current) {
      const node = filteredData.nodes.find((n: any) => n.id === selectedNode);
      if (node) {
        graphRef.current.centerAt(node.x || 0, node.y || 0, 1000);
      }
    }
  }, [selectedNode, filteredData.nodes]);

  // Reset camera
  const resetCamera = () => {
    if (graphRef.current) {
      graphRef.current.resetCamera();
    }
  };

  // Zoom to fit
  const zoomToFit = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(1000);
    }
  };

  // Toggle all countries
  const toggleAllCountries = () => {
    if (selectedCountries.length === availableCountries.length) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries([...availableCountries]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCountries([]);
    setSelectedClubs([]);
    setSelectedSeasons([]);
    setMinDegree(0);
    setMaxDegree(100);
    setSelectedNode(null);
    setHoveredNode(null);
  };

  // Handle select changes with proper typing
  const handleClubsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setSelectedClubs(selected);
  };

  const handleSeasonsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected: string[] = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setSelectedSeasons(selected);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading graph data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return <div>No graph data available</div>;
  }

  // Prepare graph data for ForceGraph2D
  const forceGraphData = {
    nodes: filteredData.nodes.map((n: any) => ({
      id: n.id,
      name: n.name,
      country: n.country,
      position: n.position,
      degree: n.degree,
      current_club_id: n.current_club_id
    })),
    links: filteredData.edges.map((e: any) => ({
      source: e.source,
      target: e.target,
      club_id: e.club_id,
      club_name: e.club_name,
      season: e.season,
      club_country: e.club_country
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interactive Graph Visualization</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredData.nodes.length} nodes • {filteredData.edges.length} edges • 
            {graphData.stats.player_count} total players • {graphData.stats.edge_count} total connections
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={resetCamera} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
            Reset View
          </button>
          <button onClick={zoomToFit} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
            Zoom to Fit
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <button 
                onClick={toggleAllCountries}
                className="w-full text-left px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                {selectedCountries.length === availableCountries.length ? 'Deselect All' : 'Select All'}
              </button>
              {availableCountries.map(country => (
                <label key={country} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCountries([...selectedCountries, country]);
                      } else {
                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                      }
                    }}
                    className="h-3 w-3"
                  />
                  <span className="text-xs">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Club Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
            <select
              multiple
              value={selectedClubs}
              onChange={handleClubsChange}
              className="w-full h-32 border border-gray-300 rounded px-2 py-1 text-xs"
            >
              {availableClubs.slice(0, 50).map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
            <select
              multiple
              value={selectedSeasons}
              onChange={handleSeasonsChange}
              className="w-full h-32 border border-gray-300 rounded px-2 py-1 text-xs"
            >
              {availableSeasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>

          {/* Degree Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Node Degree</label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Degree</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={minDegree}
                  onChange={(e) => setMinDegree(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{minDegree}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Degree</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={maxDegree}
                  onChange={(e) => setMaxDegree(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{maxDegree}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Show Labels</span>
          </label>
          <button onClick={clearAllFilters} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm">
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="graph-container bg-white rounded-lg shadow border" style={{ height: '600px' }}>
        {filteredData.nodes.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            graphData={forceGraphData}
            nodeId="id"
            nodeLabel={showLabels ? 'name' : undefined}
            nodeCanvasObject={nodeCanvasObject as any}
            linkCanvasObject={linkCanvasObject as any}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onNodeDragEnd={(node: any) => {
              node.fx = node.x;
              node.fy = node.y;
            }}
            linkDirectionalArrowLength={0}
            linkDirectionalArrowRelPos={1}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No nodes match the current filters. Try adjusting your filter criteria.
          </div>
        )}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Selected Player</h3>
          <PlayerCard playerId={selectedNode} />
        </div>
      )}

      {/* Tooltip */}
      {hoveredNode && !selectedNode && (
        <div className="tooltip" style={{ position: 'absolute', background: 'rgba(0, 0, 0, 0.8)', color: 'white', padding: '8px 12px', borderRadius: '4px', pointerEvents: 'none', fontSize: '12px', zIndex: 1000, maxWidth: '300px' }}>
          {(() => {
            const node = graphData.nodes.find((n: NodeData) => n.id === hoveredNode);
            return node ? (
              <div>
                <strong>{node.name}</strong><br />
                {node.country} • {node.position}<br />
                Degree: {node.degree}
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

// Player Card component for displaying player info
const PlayerCard: React.FC<{ playerId: string }> = ({ playerId }) => {
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        setIsLoading(true);
        const data = await playersApi.getDetail(playerId);
        setPlayer(data.player);
      } catch (err) {
        console.error('Error loading player:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]);

  if (isLoading) return <div>Loading player info...</div>;
  if (!player) return <div>Player not found</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-bold text-lg">{player.name}</h4>
        <p className="text-sm text-gray-600">{player.country} • {player.position}</p>
      </div>
      <div>
        <p className="text-sm">
          <span className="font-medium">Current Club:</span> {player.current_club_id}
        </p>
      </div>
    </div>
  );
};

export default Visualization;
