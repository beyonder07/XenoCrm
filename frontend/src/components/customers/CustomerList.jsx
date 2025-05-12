import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import CustomerFilters from './CustomerFilters';
import { formatDate, formatCurrency } from '../../utils/formatters';

const CustomerList = ({ customers = [] }) => {
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    sortBy: 'lastOrderDate',
    sortOrder: 'desc',
    minSpend: '',
    maxSpend: '',
  });

  const navigate = useNavigate();

  // Apply filters when customers or filters change
  useEffect(() => {
    // Ensure customers is an array before proceeding
    if (!Array.isArray(customers)) {
      console.error('customers is not an array:', customers);
      setFilteredCustomers([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Apply filters - safely clone the array
      let result = [...customers];

      // Apply search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        result = result.filter(
          customer =>
            customer && (
              (customer.name && customer.name.toLowerCase().includes(term)) ||
              (customer.email && customer.email.toLowerCase().includes(term))
            )
        );
      }

      // Apply spend filters
      if (filters.minSpend) {
        result = result.filter(customer => 
          customer && customer.totalSpend >= parseFloat(filters.minSpend)
        );
      }
      if (filters.maxSpend) {
        result = result.filter(customer => 
          customer && customer.totalSpend <= parseFloat(filters.maxSpend)
        );
      }

      // Apply sorting
      result.sort((a, b) => {
        const sortField = filters.sortBy;
        let valueA = a && a[sortField];
        let valueB = b && b[sortField];

        // Convert date strings to Date objects for proper comparison
        if (sortField === 'lastOrderDate') {
          valueA = valueA ? new Date(valueA) : new Date(0);
          valueB = valueB ? new Date(valueB) : new Date(0);
        }

        if (valueA < valueB) return filters.sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredCustomers(result);
    } catch (error) {
      console.error('Error filtering customers:', error);
      setError('Error filtering customers');
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, customers]);

  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
    });
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div>
      <CustomerFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <motion.tbody
              className="bg-white divide-y divide-gray-200"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {!Array.isArray(filteredCustomers) || filteredCustomers.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center" colSpan="6">
                    No customers found
                  </td>
                </tr>
              ) : (
                // Safe mapping that catches potential errors
                filteredCustomers.map((customer, index) => {
                  // Skip invalid customers
                  if (!customer) return null;
                  
                  // Use the correct ID field based on your API response structure
                  const customerId = customer.id || customer._id;
                  
                  return (
                    <motion.tr
                      key={customerId || `customer-${index}`}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => customerId && handleCustomerClick(customerId)}
                      variants={itemVariants}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {customer.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={customer.avatar}
                                alt={customer.name || 'Customer'}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {(customer.name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name || 'Unnamed Customer'}</div>
                            <div className="text-sm text-gray-500">{customer.location || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof customer.totalSpend !== 'undefined' ? formatCurrency(customer.totalSpend) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof customer.orderCount !== 'undefined' ? customer.orderCount : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;