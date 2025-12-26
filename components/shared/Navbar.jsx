"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, LogIn, UserPlus, Home, User, Shield } from "lucide-react";

export default function Navbar() {
  const [loading, setLoading] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        user: data.user,
        isLoading: false
      });
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        // Update local state and redirect
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-700" />
              <span className="font-bold text-xl text-blue-700">Renewably UK</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {authState.isLoading ? (
              // Loading state
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            ) : authState.isAuthenticated ? (
              // Authenticated user menu
              <>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {authState.user?.name}
                    </span>
                    {authState.user?.role === 'admin' && (
                      <Shield className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={authState.user?.role === 'admin' ? '/admin' : '/dashboard'}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {authState.user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {loading ? '...' : 'Logout'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Not authenticated
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
                
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}