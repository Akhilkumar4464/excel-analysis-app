import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, BarChart3, Shield } from 'lucide-react';

const Navigation = () => {
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ExcelAnalyzer Pro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isSuperAdmin && (
                  <Link
                    to="/superadmin-dashboard"
                    className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    <span>SuperAdmin Dashboard</span>
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-300" />
                  <span className="text-white font-medium">
                    {user?.name || user?.email}
                    {isAdmin && !isSuperAdmin && <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded-full">Admin</span>}
                    {isSuperAdmin && <span className="ml-2 text-xs bg-red-600 px-2 py-1 rounded-full">SuperAdmin</span>}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
