import React, { useState, useEffect } from 'react';
import { teammatesApi, clubsApi } from '../api';
import { useNavigate } from 'react-router-dom';
import type { TeammateResponse, Club } from '../types';

const QueryBuilder: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('2023-24');
  const [results, setResults] = useState<TeammateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clubSearch, setClubSearch] = useState('');
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);

  const navigate = useNavigate();

  // Load clubs and seasons on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load clubs
        const clubsData = await clubsApi.list({ limit: 1000 });
        setClubs(clubsData);
        
        // Extract unique seasons from all clubs
        const allSeasons = new Set<string>();
        for (const club of clubsData) {
          try {
            const clubDetail = await clubsApi.getDetail(club.id);
            clubDetail.seasons.forEach((s: any) => allSeasons.add(s.season));
          } catch (err) {
            // Skip clubs that fail to load
          }
        }
        setAvailableSeasons([...allSeasons].sort().reverse());
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load clubs. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter clubs based on search
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(clubSearch.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClub) {
      setError('Please select a club');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const results = await teammatesApi.getTeammates(selectedClub, selectedSeason);
      setResults(results);
      
    } catch (err) {
      console.error('Error querying teammates:', err);
      setError('Failed to query teammates. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick query examples
  const quickQueries = [
    { name: 'PSG 2023-24', clubId: 'Q483020', season: '2023-24' },
    { name: 'Man City 2023-24', clubId: 'Q66142', season: '2023-24' },
    { name: 'Real Madrid 2023-24', clubId: 'Q7204', season: '2023-24' },
    { name: 'Barcelona 2023-24', clubId: 'Q15277', season: '2023-24' },
  ];

  const handleQuickQuery = (clubId: string, season: string) => {
    setSelectedClub(clubId);
    setSelectedSeason(season);
    // Find club name for display
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      setClubSearch(club.name);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Query Builder</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find all players who were teammates at a given club and season
        </p>
      </div>

      {/* Quick Query Buttons */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Queries</h2>
        <div className="flex flex-wrap gap-2">
          {quickQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuery(query.clubId, query.season)}
              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              {query.name}
            </button>
          ))}
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Club Selection */}
          <div>
            <label htmlFor="club" className="form-label">
              Club <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="club"
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                placeholder="Search for a club..."
                className="form-input"
              />
              {clubSearch && filteredClubs.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredClubs.slice(0, 10).map(club => (
                    <button
                      key={club.id}
                      type="button"
                      onClick={() => {
                        setSelectedClub(club.id);
                        setClubSearch(club.name);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedClub === club.id ? 'bg-blue-50' : ''}`}
                    >
                      <span className="font-medium">{club.name}</span>
                      {club.country && (
                        <span className="text-gray-500 text-xs ml-2">{club.country}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedClub && (
              <div className="mt-2">
                <span className=" badge badge-club">
                  {clubs.find(c => c.id === selectedClub)?.name || selectedClub}
                </span>
              </div>
            )}
          </div>

          {/* Season Selection */}
          <div>
            <label htmlFor="season" className="form-label">
              Season <span className="text-red-500">*</span>
            </label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="form-select"
            >
              {availableSeasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex">
          <button
            type="submit"
            disabled={isLoading || !selectedClub}
            className="btn"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Querying...
              </>
            ) : (
              'Query Teammates'
            )}
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
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Query Results
              </h2>
              <span className="text-sm text-gray-500">
                {results.length} players found
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Club
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((player, index) => (
                  <tr key={player.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-country">{player.country || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.position || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.current_club_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/players/${player.id}`)} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info about the query */}
      {results.length === 0 && !isLoading && !error && selectedClub && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No teammates found for the selected club and season. 
                This could mean:
                <ul className="list-disc list-inside mt-1 text-xs">
                  <li>The club had no World Cup players in that season</li>
                  <li>The season data is not available in the dataset</li>
                  <li>Try a different club or season</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification of PSG 2023-24 sanity check */}
      {selectedClub === 'Q483020' && selectedSeason === '2023-24' && results.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Sanity Check:</strong> PSG 2023-24 should include Vitinha, Nuno Mendes, and Gonçalo Ramos,
                but NOT João Neves (who joined in 2024-25). 
                {results.some(p => ['Vitinha', 'Nuno Mendes', 'Gonçalo Ramos'].includes(p.name)) ? '✓' : '✗'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryBuilder;
