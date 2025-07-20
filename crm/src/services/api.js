import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Mock data for development
const mockCustomers = [
  { _id: '1', name: 'John Doe', email: 'john@example.com' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

const mockOrders = [
  { _id: '1', customerId: '1', amount: 150.00, date: new Date() },
  { _id: '2', customerId: '2', amount: 200.00, date: new Date() }
];

const mockCampaigns = [
  {
    _id: '1',
    message: 'Summer Sale!',
    sentAt: new Date(),
    status: 'Completed',
    audience: [{ audienceSize: 1000 }]
  },
  {
    _id: '2',
    message: 'New Product Launch',
    sentAt: new Date(),
    status: 'Scheduled',
    audience: [{ audienceSize: 500 }]
  }
];

// Auth endpoints
export const checkAuthStatus = () => Promise.resolve({ data: { isAuthenticated: true } });

// Customer endpoints
export const createCustomer = (customerData) => {
  const newCustomer = { _id: Date.now().toString(), ...customerData };
  mockCustomers.push(newCustomer);
  return Promise.resolve({ data: newCustomer });
};

export const getCustomers = () => Promise.resolve({ data: mockCustomers });

// Order endpoints
export const createOrder = (orderData) => {
  const newOrder = { _id: Date.now().toString(), ...orderData, date: new Date() };
  mockOrders.push(newOrder);
  return Promise.resolve({ data: newOrder });
};

export const getOrders = () => Promise.resolve({ data: mockOrders });

// Campaign endpoints
export const getCampaigns = () => Promise.resolve({ data: mockCampaigns });
export const checkAudienceSize = (audienceData) => Promise.resolve({ data: { audienceSize: 1000 } });
export const createAudience = (audienceData) => Promise.resolve({ data: { success: true } }); 