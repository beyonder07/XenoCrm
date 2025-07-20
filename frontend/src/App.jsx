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

import useAuth from '@hooks/useAuth';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <AuthProvider>
      <SegmentBuilderProvider>
        <AppRoutes />
      </SegmentBuilderProvider>
    </AuthProvider>
  );
}

export default App;