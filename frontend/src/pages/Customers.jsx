import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerList from '../components/customers/CustomerList';
import CustomerDetails from '../components/customers/CustomerDetails';
import CustomerCreateModal from '../components/customers/CustomerCreateModal';
import customerService from '@services/customer.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const Customers = () => {
  return (
    <Routes>
      <Route index element={<CustomersListPage />} />
      {/* Add specific route for create BEFORE the :id parameter route */}
      <Route path="create" element={<CustomerCreatePage />} />
      <Route path=":id" element={<CustomerDetailsPage />} />
      <Route path="import" element={<CustomerImportPage />} />
    </Routes>
  );
};

// Customer Create Page Component
const CustomerCreatePage = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    navigate('/customers');
  };
  
  const handleCustomerCreated = (newCustomer) => {
    toast.success('Customer created successfully');
    // Use the correct ID field from the API response
    navigate(`/customers/${newCustomer.id || newCustomer._id}`);
  };
  
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={handleClose}
          className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create Customer</h1>
      </div>
      
      <CustomerCreateModal 
        isOpen={true}
        onClose={handleClose}
        onCustomerCreated={handleCustomerCreated}
      />
    </motion.div>
  );
};

// Customer List Page Component
const CustomersListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getAllCustomers();
        
        // Handle the API response structure
        if (response.status === 'success' && response.data && response.data.customers) {
          const customersArray = response.data.customers;
          setCustomers(customersArray);
          
          // Calculate stats
          const total = customersArray.length;
          const active = customersArray.filter(c => c.isActive).length;
          
          setStats({
            total,
            active,
            inactive: total - active
          });
        } else {
          console.error('Unexpected API response structure:', response);
          toast.error('Failed to load customers: Unexpected data format');
          setCustomers([]);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again.');
        toast.error('Failed to load customers');
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [location.search]);

  const handleCreateCustomer = () => {
    navigate('/customers/create');
  };

  const handleImportCustomers = () => {
    navigate('/customers/import');
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

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

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage your customer database
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateCustomer}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Customer
          </button>
          <button
            onClick={handleImportCustomers}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Import
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Total Customers</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Active Customers</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.active.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-gray-600 text-sm font-medium">Inactive Customers</h2>
              <p className="text-3xl font-bold text-gray-900">{stats.inactive.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <CustomerList customers={customers} />
    </motion.div>
  );
};

// Customer Details Page Component
const CustomerDetailsPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await customerService.getCustomerById(id);
        
        // Handle the API response structure
        if (response.status === 'success' && response.data && response.data.customer) {
          setCustomer(response.data.customer);
        } else {
          console.error('Unexpected API response structure:', response);
          setError('Failed to load customer details: Unexpected data format');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Failed to load customer details. Please try again.');
        toast.error('Failed to load customer details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

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

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <CustomerDetails customer={customer} />
    </motion.div>
  );
};

// Customer Import Page Component
const CustomerImportPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }
    
    try {
      setIsUploading(true);
      // Call the service to import customers
      await customerService.importCustomers(file);
      toast.success('Customers imported successfully');
      navigate('/customers');
    } catch (err) {
      console.error('Error importing customers:', err);
      toast.error('Failed to import customers');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6"
    >
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/customers')}
          className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Import Customers</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleImport}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">File Format</label>
            <p className="text-gray-600 mb-4">
              Upload a CSV file with the following columns:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-x-auto">
              <code className="text-sm text-gray-800">
                name,email,phone,location,totalSpend,orderCount,lastOrderDate,isActive
              </code>
            </div>
            <p className="text-gray-600">
              <span className="font-medium">Note:</span> The file should include a header row.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-900">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    Drag and drop or click to select a file
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !file || isUploading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </span>
              ) : (
                'Import Customers'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Customers;