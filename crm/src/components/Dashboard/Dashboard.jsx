import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  // Mock data for demonstration
  const stats = {
    customers: 150,
    activeCampaigns: 5,
    totalOrders: 75,
    revenue: '$15,000'
  };

  const recentActivities = [
    { id: 1, type: 'customer', action: 'New customer added', name: 'John Doe', time: '2 hours ago' },
    { id: 2, type: 'order', action: 'New order placed', name: 'Order #1234', time: '3 hours ago' },
    { id: 3, type: 'campaign', action: 'Campaign launched', name: 'Summer Sale', time: '5 hours ago' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-2">Total Customers</h2>
          <p className="text-3xl font-bold text-primary">{stats.customers}</p>
          <Link to="/home/customers" className="text-sm text-primary hover:text-opacity-80 mt-2 inline-block">
            View all customers →
          </Link>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-2">Active Campaigns</h2>
          <p className="text-3xl font-bold text-primary">{stats.activeCampaigns}</p>
          <Link to="/home/campaigns" className="text-sm text-primary hover:text-opacity-80 mt-2 inline-block">
            View all campaigns →
          </Link>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
          <Link to="/home/orders/new" className="text-sm text-primary hover:text-opacity-80 mt-2 inline-block">
            Create new order →
          </Link>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-primary">{stats.revenue}</p>
          <p className="text-sm text-text mt-2">Last 30 days</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-text font-medium">{activity.action}</p>
                <p className="text-sm text-text opacity-75">{activity.name}</p>
              </div>
              <span className="text-sm text-text opacity-75">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/home/customers/new" className="btn-primary w-full text-center">
              Add New Customer
            </Link>
            <Link to="/home/orders/new" className="btn-secondary w-full text-center">
              Create New Order
            </Link>
            <Link to="/home/campaigns/new" className="btn-secondary w-full text-center">
              Launch New Campaign
            </Link>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text">API Status</span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text">Database</span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text">Last Backup</span>
              <span className="text-text opacity-75">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 