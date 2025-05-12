import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import  useAuth  from '@hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const profileMenuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const mobileMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1 }
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
    
    return 'Xeno CRM';
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and page title */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                {/* <img className="h-8 w-auto" src="/logo.svg" alt="Xeno CRM" /> */}
                <span className="ml-2 text-xl font-semibold text-gray-900">Xeno</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <h1 className="text-lg font-medium text-gray-800">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          {user && (
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
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
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
            className="sm:hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              <h1 className="block px-3 py-2 text-base font-medium text-gray-800">{getPageTitle()}</h1>
            </div>
            {user && (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.displayName}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;