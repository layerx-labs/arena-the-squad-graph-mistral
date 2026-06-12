import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with base URL
// For Vercel deployment, use relative path
const api: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

// Export the axios instance for direct use
export default api;

// Graph API endpoints
export const graphApi = {
  // Get complete graph data
  getGraph: async () => {
    const response = await api.get('/graph');
    return response.data;
  },

  // Get graph statistics
  getStats: async () => {
    const response = await api.get('/graph/stats');
    return response.data;
  },

  // Get all nodes
  getNodes: async () => {
    const response = await api.get('/graph/nodes');
    return response.data;
  },

  // Get all edges (with optional limit)
  getEdges: async (limit?: number) => {
    const response = await api.get('/graph/edges', { params: { limit } });
    return response.data;
  },
};

// Teammates API endpoints
export const teammatesApi = {
  // Get teammates for a club and season
  getTeammates: async (club_id: string, season: string) => {
    const response = await api.get('/teammates', { params: { club_id, season } });
    return response.data;
  },

  // Get teammates count
  getTeammatesCount: async (club_id: string, season: string) => {
    const response = await api.get('/teammates/count', { params: { club_id, season } });
    return response.data;
  },
};

// Connection API endpoints (degrees of separation)
export const connectionApi = {
  // Find shortest path between two players
  findConnection: async (player1_id: string, player2_id: string) => {
    const response = await api.get('/connection', { params: { player1_id, player2_id } });
    return response.data;
  },
};

// Strongest connections API endpoints
export const strongestApi = {
  // Get strongest connections
  getStrongest: async (min_players: number = 2, limit?: number) => {
    const response = await api.get('/strongest-connections', { 
      params: { min_players, limit } 
    });
    return response.data;
  },

  // Get top connections
  getTop: async (limit: number = 10) => {
    const response = await api.get('/strongest-connections/top', { 
      params: { limit } 
    });
    return response.data;
  },
};

// Players API endpoints
export const playersApi = {
  // List players with filters
  list: async (params: { country?: string; name?: string; limit?: number } = {}) => {
    const response = await api.get('/players', { params });
    return response.data;
  },

  // Get all countries
  getCountries: async () => {
    const response = await api.get('/players/countries');
    return response.data;
  },

  // Get player detail
  getDetail: async (player_id: string) => {
    const response = await api.get(`/players/${player_id}`);
    return response.data;
  },

  // Get player connections
  getConnections: async (player_id: string) => {
    const response = await api.get(`/players/${player_id}/connections`);
    return response.data;
  },
};

// Clubs API endpoints
export const clubsApi = {
  // List clubs with filters
  list: async (params: { country?: string; name?: string; limit?: number } = {}) => {
    const response = await api.get('/clubs', { params });
    return response.data;
  },

  // Get all club countries
  getCountries: async () => {
    const response = await api.get('/clubs/countries');
    return response.data;
  },

  // Get club detail
  getDetail: async (club_id: string) => {
    const response = await api.get(`/clubs/${club_id}`);
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Root endpoint
export const rootApi = {
  info: async () => {
    const response = await api.get('/');
    return response.data;
  },
};
