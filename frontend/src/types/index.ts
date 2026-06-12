// Player types
export interface Player {
  id: string;
  name: string;
  country: string | null;
  position: string | null;
  current_club_id: string | null;
  stints?: Stint[];
}

export interface Stint {
  club_id: string;
  season: string;
}

// Club types
export interface Club {
  id: string;
  name: string;
  country: string | null;
}

// Graph types
export interface GraphNode {
  id: string;
  name: string;
  country: string | null;
  position: string | null;
  current_club_id: string | null;
  degree: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  club_id: string;
  club_name: string;
  season: string;
  club_country: string | null;
}

export interface GraphStats {
  player_count: number;
  club_count: number;
  edge_count: number;
  club_season_groups: number;
  cross_national_pairs: number;
  avg_degree: number;
  max_degree: number;
  strongest_club_season: any;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
}

// API Response types
export interface TeammateResponse {
  id: string;
  name: string;
  country: string | null;
  position: string | null;
  current_club_id: string | null;
}

export interface ConnectionResponse {
  player1_id: string;
  player2_id: string;
  distance: number;
  path: string[];
  players: Player[];
}

export interface StrongestConnection {
  club_id: string;
  club_name: string;
  club_country: string | null;
  season: string;
  player_count: number;
  player_ids: string[];
}

export interface PlayerDetail {
  player: Player;
  stints: Array<{
    club_id: string;
    club_name: string;
    club_country: string | null;
    season: string;
  }>;
  stunt_teammates: Array<{
    club_id: string;
    season: string;
    teammate_count: number;
    teammates: Player[];
  }>;
  connected_players: Player[];
  degree: number;
  total_connections: number;
}

export interface ClubDetail {
  club: Club;
  seasons: Array<{
    season: string;
    player_count: number;
    player_ids: string[];
  }>;
  total_players: number;
  season_count: number;
}

// Query parameter types
export interface TeammateQuery {
  club_id: string;
  season: string;
}

export interface ConnectionQuery {
  player1_id: string;
  player2_id: string;
}

export interface StrongestQuery {
  min_players?: number;
  limit?: number;
}

// Filter types
export interface PlayerFilter {
  country?: string;
  name?: string;
  limit?: number;
}

export interface ClubFilter {
  country?: string;
  name?: string;
  limit?: number;
}

// Visualization types
export interface NodeObject {
  id: string;
  name: string;
  country: string | null;
  position: string | null;
  degree: number;
  current_club_id: string | null;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
}

export interface EdgeObject {
  source: string;
  target: string;
  club_id: string;
  club_name: string;
  season: string;
  club_country: string | null;
}

export interface VisualizationFilter {
  countries?: string[];
  clubs?: string[];
  seasons?: string[];
  minDegree?: number;
  maxDegree?: number;
}
