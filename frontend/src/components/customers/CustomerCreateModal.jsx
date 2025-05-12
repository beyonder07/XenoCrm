import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import customerService from '../../services/customer.service';

const CustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }) => {
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomer({
      ...customer,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!customer.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customer.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (customer.phone && !/^\+?[0-9]{10,15}$/.test(customer.phone.replace(/[^0-9+]/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await customerService.createCustomer(customer);
      
      toast.success('Customer created successfully');
      onCustomerCreated(response.data.customer);
      onClose();
      
      // Reset form
      setCustomer({
        name: '',
        email: '',
        phone: '',
        location: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      
      if (error.response?.data?.message) {
        if (error.response.status === 409) {
          setErrors({ email: error.response.data.message });
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error('Failed to create customer. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal animations
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Add New Customer</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter customer name"
                value={customer.name}
                onChange={handleChange}
                error={errors.name}
                className="w-full"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter customer email"
                value={customer.email}
                onChange={handleChange}
                error={errors.email}
                className="w-full"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="Enter phone number"
                value={customer.phone}
                onChange={handleChange}
                error={errors.phone}
                className="w-full"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                Location
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Enter customer location"
                value={customer.location}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={customer.isActive}
                  onChange={handleChange}
                  className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-gray-700">Active customer</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating...</span>
                  </span>
                ) : (
                  'Create Customer'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerCreateModal;