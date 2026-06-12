import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import QueryBuilder from './components/QueryBuilder';
import Visualization from './components/Visualization';
import PlayerDetail from './components/PlayerDetail';
import PlayerSearch from './components/PlayerSearch';
import StatsDashboard from './components/StatsDashboard';
import ConnectionFinder from './components/ConnectionFinder';
import { healthApi } from './api';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<string>('checking...');

  useEffect(() => {
    // Check API health on mount
    const checkHealth = async () => {
      try {
        const health = await healthApi.check();
        if (health.status === 'healthy') {
          setApiStatus('healthy');
        } else {
          setApiStatus('unhealthy');
        }
      } catch (error) {
        setApiStatus('unreachable');
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SG</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Squad Graph Explorer</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${apiStatus === 'healthy' ? 'bg-green-500' : apiStatus === 'checking...' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">API: {apiStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary navigation */}
          <div className="border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8 py-3">
                <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                  Dashboard
                </Link>
                <Link to="/explore" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                  Explore Graph
                </Link>
                <Link to="/query" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                  Query Builder
                </Link>
                <Link to="/connection" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                  Find Connections
                </Link>
                <Link to="/players" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                  Players
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : apiStatus !== 'healthy' ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    API is not responding. Some features may not work. The backend might still be starting up.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <Routes>
            <Route path="/" element={<StatsDashboard />} />
            <Route path="/explore" element={<Visualization />} />
            <Route path="/query" element={<QueryBuilder />} />
            <Route path="/connection" element={<ConnectionFinder />} />
            <Route path="/players" element={<PlayerSearch />} />
            <Route path="/players/:playerId" element={<PlayerDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 border-t mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>Squad Graph Explorer - 2026 World Cup Player Connections</p>
              <p className="mt-1">
                Built with FastAPI, React, and D3.js | 
                Data from <a href="https://github.com/layerx-labs/wc2026-squad-graph-dataset" className="text-blue-600 hover:underline">wc2026-squad-graph-dataset</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
