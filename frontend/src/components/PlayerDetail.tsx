import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playersApi, teammatesApi, clubsApi } from '../api';
import type { Player, PlayerDetail as PlayerDetailType } from '../types';

const PlayerDetail: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [playerDetail, setPlayerDetail] = useState<PlayerDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStint, setSelectedStint] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerId) return;

    const loadPlayerDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load player detail
        const detail = await playersApi.getDetail(playerId);
        setPlayerDetail(detail);
        
      } catch (err) {
        console.error('Error loading player detail:', err);
        setError('Failed to load player detail. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerDetail();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-600">Loading player detail...</span>
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
            <button onClick={() => navigate('/players')} className="mt-2 text-blue-600 hover:text-blue-900">
              Back to Players
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!playerDetail) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Player not found</p>
        <button onClick={() => navigate('/players')} className="mt-4 btn-secondary">
          Back to Players
        </button>
      </div>
    );
  }

  const player = playerDetail.player;
  const stints = playerDetail.stints || [];
  const selectedStintData = stints[selectedStint] || null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button onClick={() => navigate('/players')} className="text-sm text-gray-500 hover:text-gray-700">
              Players
            </button>
          </li>
          <li>
            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-sm font-medium text-gray-900">{player.name}</span>
          </li>
        </ol>
      </nav>

      {/* Player Header */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Player Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">
                {player.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
              <span className="badge badge-country">{player.country || 'N/A'}</span>
              <span className="badge badge-club">{player.position || 'N/A'}</span>
            </div>

            {/* Player Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Player ID</p>
                <p className="text-sm font-medium">{player.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Club</p>
                <p className="text-sm font-medium">{player.current_club_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Club Seasons</p>
                <p className="text-sm font-medium">{playerDetail.degree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Connections</p>
                <p className="text-sm font-medium">{playerDetail.total_connections}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button onClick={() => navigate(`/connection?player1_id=${player.id}`)} className="btn-secondary">
              Find Connections
            </button>
          </div>
        </div>
      </div>

      {/* Club History */}
      {stints.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
            <h2 className="text-lg font-medium text-gray-900">Club History</h2>
          </div>
          
          <div className="p-6">
            {/* Stint Navigation */}
            {stints.length > 1 && (
              <div className="mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {stints.map((stint, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedStint(index)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        selectedStint === index 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {stint.season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Stint Details */}
            {selectedStintData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stint Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedStintData.club_name}</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Season</p>
                      <p className="text-sm font-medium">{selectedStintData.season}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Club ID</p>
                      <p className="text-sm font-medium">{selectedStintData.club_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="text-sm font-medium">{selectedStintData.club_country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Teammates for this stint */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Teammates at {selectedStintData.club_name} ({selectedStintData.season})
                  </h3>
                  
                  {playerDetail.stunt_teammates[selectedStint]?.teammates?.length ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {playerDetail.stunt_teammates[selectedStint].teammates.map((teammate: Player) => (
                        <div 
                          key={teammate.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                              {teammate.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{teammate.name}</p>
                              <p className="text-xs text-gray-500">{teammate.country} • {teammate.position}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/players/${teammate.id}`)}
                            className="text-xs text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No teammates found for this stint</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected Players */}
      {playerDetail.connected_players && playerDetail.connected_players.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Connected Players ({playerDetail.connected_players.length})
              </h2>
              <span className="text-sm text-gray-500">
                All players who were teammates with {player.name} at any club
              </span>
            </div>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerDetail.connected_players.slice(0, 20).map((connectedPlayer: Player) => (
                <div 
                  key={connectedPlayer.id}
                  className="p-3 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {connectedPlayer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{connectedPlayer.name}</p>
                      <p className="text-xs text-gray-500">{connectedPlayer.country} • {connectedPlayer.position}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/players/${connectedPlayer.id}`)}
                      className="text-xs text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {playerDetail.connected_players.length > 20 && (
              <p className="text-xs text-gray-500 mt-4 text-center">
                Showing 20 of {playerDetail.connected_players.length} connected players
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cross-National Connections */}
      {playerDetail.connected_players && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">Cross-National Connections</h2>
          <p className="text-sm text-blue-700">
            {player.name} has connections with players from different national teams.
            This highlights the global nature of modern football and how players from rival nations
            may have been teammates at club level.
          </p>
          
          {/* Show some example cross-national connections */}
          {(() => {
            const crossNational = playerDetail.connected_players.filter(
              p => p.country && p.country !== player.country
            );
            
            if (crossNational.length === 0) {
              return (
                <p className="text-sm text-blue-600 mt-2">
                  No cross-national connections found for this player.
                </p>
              );
            }

            // Group by country
            const byCountry: Record<string, Player[]> = {};
            crossNational.forEach(p => {
              if (p.country) {
                if (!byCountry[p.country]) byCountry[p.country] = [];
                byCountry[p.country].push(p);
              }
            });

            return (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(byCountry).slice(0, 10).map(([country, players]) => (
                  <span 
                    key={country}
                    className="badge badge-country"
                  >
                    {country} ({players.length})
                  </span>
                ))}
                {Object.keys(byCountry).length > 10 && (
                  <span className="badge badge-country">+{Object.keys(byCountry).length - 10} more</span>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;
