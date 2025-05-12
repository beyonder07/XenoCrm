import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context Providers
import { AuthProvider } from '@context/AuthContext';
import { SegmentBuilderProvider } from '@context/SegmentBuilderContext';

// Common Components
import Navbar from '@components/common/Navbar';
import Sidebar from '@components/common/Sidebar';
import MobileNav from '@components/common/MobileNav';
import LoadingSpinner from '@components/common/LoadingSpinner';
import AuthGuard from '@components/auth/AuthGuard';

// Pages - Eager loaded
import Login from '@pages/Login';
import Register from '@pages/Register';
import NotFound from '@pages/NotFound';

// Pages - Lazy loaded
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Customers = lazy(() => import('@pages/Customers'));
const Segments = lazy(() => import('@pages/Segments'));
const CampaignCreate = lazy(() => import('@pages/CampaignCreate'));
const CampaignHistory = lazy(() => import('@pages/CampaignHistory'));

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Check if we're on an auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <AuthProvider>
      <SegmentBuilderProvider>
        <div className="min-h-screen bg-gray-50">
          {!isAuthPage && <Navbar />}
          
          <div className="flex flex-col lg:flex-row">
            {!isAuthPage && (
              <>
                {/* Desktop Sidebar */}
                <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
                  <Sidebar />
                </div>
                
                {/* Mobile Navigation */}
                <div className="lg:hidden">
                  <MobileNav />
                </div>
              </>
            )}
            
            <main className={`flex-1 ${!isAuthPage ? 'lg:pl-64 pt-16 pb-16 lg:pb-0' : ''} min-h-screen`}>
              <AnimatePresence mode="wait">
                <Suspense fallback={
                  <div className="flex h-screen items-center justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <Routes location={location} key={location.pathname}>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route element={<AuthGuard />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/customers/*" element={<Customers />} />
                      <Route path="/segments/*" element={<Segments />} />
                      <Route path="/campaigns/*" element={<CampaignHistory />} />
                      
                      {/* Nested Routes */}
                      <Route path="/campaigns/create" element={<CampaignCreate />} />
                      <Route path="/campaigns/history" element={<CampaignHistory />} />
                    </Route>
                    
                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </SegmentBuilderProvider>
    </AuthProvider>
  );
}

export default App;