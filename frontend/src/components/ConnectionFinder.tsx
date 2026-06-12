import React, { useState, useEffect } from 'react';
import { connectionApi, playersApi } from '../api';
import type { Player, ConnectionResponse } from '../types';

const ConnectionFinder: React.FC = () => {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [playerSearch1, setPlayerSearch1] = useState('');
  const [playerSearch2, setPlayerSearch2] = useState('');
  const [selectedPlayer1, setSelectedPlayer1] = useState<string | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all players on mount
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        const data = await playersApi.list({ limit: 10000 });
        setAllPlayers(data);
      } catch (err) {
        console.error('Error loading players:', err);
        setError('Failed to load players. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Filter players based on search
  const filteredPlayers1 = allPlayers.filter(player => 
    player.name.toLowerCase().includes(playerSearch1.toLowerCase())
  );

  const filteredPlayers2 = allPlayers.filter(player => 
    player.name.toLowerCase().includes(playerSearch2.toLowerCase())
  );

  // Find connection between selected players
  const findConnection = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      setError('Please select both players');
      return;
    }

    if (selectedPlayer1 === selectedPlayer2) {
      setError('Please select two different players');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setConnection(null);
      
      const result = await connectionApi.findConnection(selectedPlayer1, selectedPlayer2);
      setConnection(result);
      
    } catch (err) {
      console.error('Error finding connection:', err);
      setError('Failed to find connection. Please try again.');
      setConnection(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Swap players
  const swapPlayers = () => {
    const temp = selectedPlayer1;
    setSelectedPlayer1(selectedPlayer2);
    setSelectedPlayer2(temp);
    const tempSearch = playerSearch1;
    setPlayerSearch1(playerSearch2);
    setPlayerSearch2(tempSearch);
  };

  // Handle random connection
  const findRandomConnection = async () => {
    if (allPlayers.length < 2) return;
    
    // Pick two random players from different countries
    const player1 = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    let player2;
    
    // Try to find a player from a different country
    const otherPlayers = allPlayers.filter(p => p.country !== player1.country);
    if (otherPlayers.length > 0) {
      player2 = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    } else {
      player2 = allPlayers[Math.floor(Math.random() * allPlayers.length)];
    }
    
    setSelectedPlayer1(player1.id);
    setSelectedPlayer2(player2.id);
    setPlayerSearch1(player1.name);
    setPlayerSearch2(player2.name);
  };

  // Get player name by ID
  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.name : playerId;
  };

  // Get player country by ID
  const getPlayerCountry = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.country : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Degrees of Separation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find the shortest path between any two players through shared club history
        </p>
      </div>

      {/* Player Selection */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player 1</label>
            <div className="relative">
              <input
                type="text"
                value={playerSearch1}
                onChange={(e) => setPlayerSearch1(e.target.value)}
                placeholder="Search for a player..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {playerSearch1 && filteredPlayers1.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredPlayers1.slice(0, 10).map(player => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlayer1(player.id);
                        setPlayerSearch1(player.name);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedPlayer1 === player.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        {player.country} • {player.position}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPlayer1 && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {getPlayerName(selectedPlayer1)} ({getPlayerCountry(selectedPlayer1)})
                </span>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player 2</label>
            <div className="relative">
              <input
                type="text"
                value={playerSearch2}
                onChange={(e) => setPlayerSearch2(e.target.value)}
                placeholder="Search for a player..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              {playerSearch2 && filteredPlayers2.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredPlayers2.slice(0, 10).map(player => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlayer2(player.id);
                        setPlayerSearch2(player.name);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedPlayer2 === player.id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        {player.country} • {player.position}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPlayer2 && (
              <div className="mt-2">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {getPlayerName(selectedPlayer2)} ({getPlayerCountry(selectedPlayer2)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={findConnection}
            disabled={isLoading || !selectedPlayer1 || !selectedPlayer2}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Connection...
              </>
            ) : (
              'Find Connection'
            )}
          </button>
          
          <button
            type="button"
            onClick={swapPlayers}
            disabled={!selectedPlayer1 || !selectedPlayer2}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:bg-gray-50"
          >
            Swap Players
          </button>
          
          <button
            type="button"
            onClick={findRandomConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:bg-gray-50"
          >
            Random Connection
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        )}
      </div>

      {/* Connection Results */}
      {connection && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Connection Found
              </h2>
              <span className={`text-sm font-medium ${
                connection.distance === 0 ? 'text-gray-500' : 
                connection.distance === 1 ? 'text-green-600' :
                connection.distance === 2 ? 'text-blue-600' :
                connection.distance === 3 ? 'text-purple-600' :
                'text-red-600'
              }`}>
                {connection.distance === 0 ? 'Same player' : 
                 connection.distance === 1 ? 'Direct teammates' :
                 connection.distance === -1 ? 'No connection' :
                 `${connection.distance} degrees of separation`}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {connection.distance === -1 ? (
              <div className="text-center text-gray-500 py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="mt-4 text-lg">No connection found</p>
                <p className="text-sm text-gray-500 mt-2">
                  These players have never been teammates at the same club in the same season,
                  and there are no other players who connect them through shared club history.
                </p>
              </div>
            ) : (
              <>
                {/* Connection Path Visualization */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Connection Path</h3>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {connection.path.map((playerId, index) => {
                      const player = connection.players.find(p => p.id === playerId);
                      return (
                        <div key={playerId} className="text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-300">
                            <span className="text-xs font-medium text-blue-800 text-center px-2">
                              {player?.name || playerId}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {player?.country || 'Unknown'}
                          </span>
                          {index < connection.path.length - 1 && (
                            <span className="mx-2 text-gray-400">→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Player Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Player 1</h3>
                    <PlayerCard player={connection.players[0]} />
                  </div>
                  {connection.players.length > 1 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Player 2</h3>
                      <PlayerCard player={connection.players[connection.players.length - 1]} />
                    </div>
                  )}
                </div>

                {/* Intermediate Players (if any) */}
                {connection.players.length > 2 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Intermediate Players ({connection.players.length - 2})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connection.players.slice(1, -1).map((player, index) => (
                        <PlayerCard key={player.id} player={player} showIndex={index + 1} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Cross-national highlight */}
                {connection.players.length >= 2 && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">
                      Cross-National Connection
                    </h3>
                    <p className="text-sm text-blue-700">
                      {connection.players[0].country !== connection.players[connection.players.length - 1].country ? (
                        <>
                          This connection spans {connection.distance} degrees between 
                          <strong>{connection.players[0].country}</strong> and 
                          <strong>{connection.players[connection.players.length - 1].country}</strong>.
                        </>
                      ) : (
                        <>
                          Both players represent <strong>{connection.players[0].country}</strong>.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      {!connection && !isLoading && !error && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">How it works</h3>
          <p className="text-sm text-gray-600">
            This tool finds the shortest path between two players through shared club history.
            Two players are connected if they were teammates at the same club in the same season.
            The <strong>degree of separation</strong> is the minimum number of connections needed.
          </p>
          <ul className="mt-4 text-sm text-gray-600 space-y-2">
            <li><strong>0 degrees:</strong> The same player (not applicable)</li>
            <li><strong>1 degree:</strong> The players were direct teammates</li>
            <li><strong>2 degrees:</strong> The players have a common teammate</li>
            <li><strong>3+ degrees:</strong> The players are connected through multiple teammates</li>
            <li><strong>No connection:</strong> No path exists in the dataset</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Player Card component
interface PlayerCardProps {
  player: any;
  showIndex?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, showIndex }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs font-medium">{player.name.substring(0, 2).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-gray-900">{player.name}</h4>
            {showIndex !== undefined && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                #{showIndex + 1}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {player.country} • {player.position}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ID: {player.id}
          </p>
          <div className="mt-2">
            <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
              Current: {player.current_club_id || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionFinder;
