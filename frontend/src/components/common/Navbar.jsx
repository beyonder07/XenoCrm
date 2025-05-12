import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '@hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const profileMenuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/login') return 'Login';
    if (path === '/customers') return 'Customers';
    if (path === '/segments') return 'Audience Segments';
    if (path.includes('/campaigns/create')) return 'Create Campaign';
    if (path.includes('/campaigns')) return 'Campaign History';
    
    return 'AuraCRM';
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and page title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                {/* <span className="ml-2 text-xl font-semibold text-gray-900">        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AuraCRM</span> */}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <h1 className="text-lg font-medium text-gray-800">&nbsp;&nbsp;{getPageTitle()}</h1>
            </div>
          </div>

          {/* Desktop menu */}
          {user && (
            <div className="hidden lg:flex lg:items-center lg:ml-6">
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-expanded={showProfileMenu}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>
                </div>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={profileMenuVariants}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-gray-500 truncate">{user.email}</div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Mobile profile menu */}
          {user && isMobile && (
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleProfileMenu}
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                aria-expanded={showProfileMenu}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={profileMenuVariants}
                    className="origin-top-right absolute right-4 top-16 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  >
                    <div className="py-1">
                      <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-gray-500 truncate">{user.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;