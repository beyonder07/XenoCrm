import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '../common/Input';

const CustomerFilters = ({ filters, onFilterChange }) => {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFilterChange({ sortBy, sortOrder });
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      sortBy: 'lastOrderDate',
      sortOrder: 'desc',
      minSpend: '',
      maxSpend: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            placeholder="Search customers by name or email"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="md:w-48">
          <select
            className="w-full p-2 border rounded bg-white"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={handleSortChange}
          >
            <option value="lastOrderDate-desc">Latest Order</option>
            <option value="lastOrderDate-asc">Oldest Order</option>
            <option value="totalSpend-desc">Highest Spend</option>
            <option value="totalSpend-asc">Lowest Spend</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="orderCount-desc">Most Orders</option>
            <option value="orderCount-asc">Fewest Orders</option>
          </select>
        </div>
        <button
          className="text-blue-500 hover:text-blue-700 font-medium"
          onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)}
        >
          {isAdvancedFiltersOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </button>
      </div>

      <motion.div
        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isAdvancedFiltersOpen ? 'auto' : 0,
          opacity: isAdvancedFiltersOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Total Spend (₹)
          </label>
          <Input
            type="number"
            name="minSpend"
            value={filters.minSpend}
            onChange={handleInputChange}
            placeholder="Min Spend"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Total Spend (₹)
          </label>
          <Input
            type="number"
            name="maxSpend"
            value={filters.maxSpend}
            onChange={handleInputChange}
            placeholder="Max Spend"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex items-end">
          <button
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerFilters;