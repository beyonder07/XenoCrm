import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import CustomerList from './components/CustomerListing/CustomerList';
import CustomerForm from './components/DataIngestion/CustomerForm';
import OrderForm from './components/DataIngestion/OrderForm';
import CampaignList from './components/CampaignListing/CampaignList';
import CampaignForm from './components/DataIngestion/CampaignForm';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">AuraCRM</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/home" 
                  className="nav-link"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/home/customers" 
                  className="nav-link"
                >
                  Customers
                </Link>
                <Link 
                  to="/home/orders/new" 
                  className="nav-link"
                >
                  Orders
                </Link>
                <Link 
                  to="/home/campaigns" 
                  className="nav-link"
                >
                  Campaigns
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home/customers" element={<CustomerList />} />
          <Route path="/home/customers/new" element={<CustomerForm />} />
          <Route path="/home/orders/new" element={<OrderForm />} />
          <Route path="/home/campaigns" element={<CampaignList />} />
          <Route path="/home/campaigns/new" element={<CampaignForm />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
