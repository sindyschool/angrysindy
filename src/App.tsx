import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-red-500 text-xl font-light">
                AngrySindy
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 