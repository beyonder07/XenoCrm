import api from './api';

const customerService = {
  async getAllCustomers(page = 1, limit = 20, search = '', isActive = null, sort = '-createdAt') {
    const params = { page, limit, sort };
    if (search) params.search = search;
    if (isActive !== null) params.isActive = isActive;
    
    // Since api.js interceptor returns response.data already, 
    // no need to access .data again
    return await api.get('/customers', { params });
  },

  async getCustomerById(id) {
    if (!id) return Promise.reject(new Error('Customer ID is required'));
    
    // Since api.js interceptor returns response.data already
    return await api.get(`/customers/${id}`);
  },

  async createCustomer(customerData) {
    if (!customerData) return Promise.reject(new Error('Customer data is required'));
    
    // Since api.js interceptor returns response.data already
    return await api.post('/customers', customerData);
  },

  async updateCustomer(id, customerData) {
    if (!id) return Promise.reject(new Error('Customer ID is required'));
    if (!customerData) return Promise.reject(new Error('Customer data is required'));
    
    // Since api.js interceptor returns response.data already
    return await api.put(`/customers/${id}`, customerData);
  },

  async deleteCustomer(id) {
    if (!id) return Promise.reject(new Error('Customer ID is required'));
    
    // Since api.js interceptor returns response.data already
    return await api.delete(`/customers/${id}`);
  },

  async importCustomers(file) {
    if (!file) return Promise.reject(new Error('File is required'));
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Since api.js interceptor returns response.data already
    return await api.post('/customers/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getCustomerOrders(id) {
    if (!id) return Promise.reject(new Error('Customer ID is required'));
    
    // Since api.js interceptor returns response.data already,
    // we need to access .orders directly on the response
    const response = await api.get(`/customers/${id}/orders`);
    return response.orders || [];
  }
};

export default customerService;