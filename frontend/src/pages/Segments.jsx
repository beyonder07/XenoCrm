import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatNumber } from '../utils/formatters';
import segmentService from '../services/segment.service';
import { IoAddCircle, IoTrash } from 'react-icons/io5';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

// ===== CUSTOM HOOK: useSegmentBuilder =====
const useSegmentBuilder = () => {
  // State for segment rules
  const [rules, setRules] = useState({
    conditionType: 'AND',
    conditions: [
      // Add a default condition to start with
      { 
        id: `rule_${Date.now()}`, 
        field: 'totalSpend', 
        operator: 'greaterThan', 
        value: '1000' 
      }
    ]
  });

  // State for segment metadata
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  
  // State for audience preview
  const [audiencePreview, setAudiencePreview] = useState({
    count: 0,
    loading: false
  });

  // Function to preview audience based on current rules
  const previewAudience = useCallback(async (currentRules = rules) => {
    if (!currentRules || !currentRules.conditions || currentRules.conditions.length === 0) {
      setAudiencePreview({ count: 0, loading: false });
      return;
    }
    
    try {
      setAudiencePreview(prev => ({ ...prev, loading: true }));
      
      // Call the API to get the audience preview
      const response = await segmentService.previewSegment(currentRules);
      setAudiencePreview({ count: response.count || 0, loading: false });
    } catch (error) {
      console.error('Error previewing audience:', error);
      setAudiencePreview({ count: 0, loading: false });
      toast.error('Failed to preview audience size');
    }
  }, [rules]);

  // Update preview when rules change
  useEffect(() => {
    if (rules && rules.conditions && rules.conditions.length > 0) {
      // Add a slight delay to avoid too many calls
      const timer = setTimeout(() => {
        previewAudience(rules);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [rules, previewAudience]);

  // Create a segment based on current rules
  const createSegment = async () => {
    try {
      if (!segmentName.trim()) {
        toast.error('Segment name is required');
        return null;
      }
      
      if (!rules || !rules.conditions || rules.conditions.length === 0) {
        toast.error('At least one condition is required');
        return null;
      }
      
      // Call the API to create the segment
      const segmentData = {
        name: segmentName,
        description: segmentDescription,
        rules
      };
      
      const response = await segmentService.createSegment(segmentData);
      return response;
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
      return null;
    }
  };

  return {
    rules,
    setRules,
    segmentName,
    setSegmentName,
    segmentDescription,
    setSegmentDescription,
    audiencePreview,
    previewAudience,
    createSegment
  };
};

// ===== COMPONENT: SegmentBuilder =====
const SegmentBuilder = ({ initialRules, onChange, disabled }) => {
  // Initial rules if none provided
 

  // Initial rules if none provided
const defaultRules = {
    conditionType: 'AND',
    conditions: [
      { 
        id: `rule_${Date.now()}`, 
        field: '', // Start with empty field
        operator: '',
        value: '' 
      }
    ]
  };
  
  // Only set initial rule with values if explicitly provided
  const [rules, setRules] = useState(initialRules || defaultRules);

  // Predefined field options for the rule builder
  const fieldOptions = [
    { label: 'Total Spend', value: 'totalSpend', type: 'number' },
    { label: 'Order Count', value: 'orderCount', type: 'number' },
    { label: 'Last Order Date', value: 'lastOrderDate', type: 'date' },
    { label: 'Customer Name', value: 'name', type: 'text' },
    { label: 'Email', value: 'email', type: 'text' },
    { label: 'Location', value: 'location', type: 'text' },
    { label: 'Active Status', value: 'isActive', type: 'boolean' },
    { label: 'Customer ID', value: 'customerId', type: 'text' },
  ];

  // Define operator options based on field type
  const getOperatorOptions = (fieldType) => {
    switch (fieldType) {
      case 'number':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Greater than', value: 'greaterThan' },
          { label: 'Less than', value: 'lessThan' },
          { label: 'Greater than or equal', value: 'greaterThanOrEqual' },
          { label: 'Less than or equal', value: 'lessThanOrEqual' },
        ];
      case 'date':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Before', value: 'before' },
          { label: 'After', value: 'after' },
          { label: 'In the last', value: 'inLast' },
          { label: 'Not in the last', value: 'notInLast' },
        ];
      case 'text':
        return [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts with', value: 'startsWith' },
          { label: 'Ends with', value: 'endsWith' },
          { label: 'Does not contain', value: 'notContains' },
        ];
      case 'boolean':
        return [
          { label: 'Is', value: 'equals' },
          { label: 'Is not', value: 'notEquals' },
        ];
      default:
        return [{ label: 'Equals', value: 'equals' }];
    }
  };

  // Update parent component when rules change
  useEffect(() => {
    if (onChange && rules) {
      onChange(rules);
    }
  }, [rules, onChange]);

  // Toggle between AND/OR logic
  const toggleConditionType = () => {
    setRules({
      ...rules,
      conditionType: rules.conditionType === 'AND' ? 'OR' : 'AND',
    });
  };

  // Add a new condition
  const handleAddCondition = () => {
    const newCondition = {
      id: `rule_${Date.now()}`,
      field: 'totalSpend',
      operator: 'greaterThan',
      value: ''
    };
    
    setRules({
      ...rules,
      conditions: [...rules.conditions, newCondition]
    });
  };

  // Update a condition at a specific index
  const handleUpdateCondition = (updatedCondition, index) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = updatedCondition;
    
    setRules({
      ...rules,
      conditions: newConditions
    });
  };

  // Remove a condition at a specific index
  const handleRemoveCondition = (index) => {
    setRules({
      ...rules,
      conditions: rules.conditions.filter((_, i) => i !== index)
    });
  };

  // Rule Builder sub-component
  const RuleBuilder = React.memo(({ rule, index, onUpdate, onRemove }) => {
    const valueChangeTimer = useRef(null);
    const inputRef = useRef(null);
  
    // Get selected field details
    const selectedField = fieldOptions.find(f => f.value === rule.field) || { type: 'text' };
  
    // Get operator options based on field type
    const operatorOptions = getOperatorOptions(selectedField.type);
  
    // Handle field change
    const handleFieldChange = (e) => {
      const fieldValue = e.target.value;
      const fieldType = fieldOptions.find(f => f.value === fieldValue)?.type || 'text';
  
      const defaultOperator = fieldValue
        ? getOperatorOptions(fieldType)[0]?.value || 'equals'
        : '';
  
      onUpdate({
        ...rule,
        field: fieldValue,
        operator: defaultOperator,
        value: ''
      }, index);
    };
  
    // Handle operator change
    const handleOperatorChange = (e) => {
      onUpdate({
        ...rule,
        operator: e.target.value
      }, index);
    };
  
    // Handle value change
    const handleValueChange = (e) => {
      const newValue = e.target.value;
  
      if (valueChangeTimer.current) {
        clearTimeout(valueChangeTimer.current);
      }
  
      onUpdate({
        ...rule,
        value: newValue,
      }, index);
  
      valueChangeTimer.current = setTimeout(async () => {
        try {
          await segmentService.previewSegment({
            ...rule,
            value: newValue,
          });
        } catch (error) {
          console.error('Error sending value to backend:', error);
        }
      }, 500);
    };
  
    useEffect(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, [rule.value]);
  
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 mb-3"
      >
        <div className="flex-1 grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-4">
            <select
              value={rule.field || ''}
              onChange={handleFieldChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={disabled}
            >
              <option value="">Select field</option>
              {fieldOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
  
          <div className="col-span-12 sm:col-span-3">
            <select
              value={rule.operator || ''}
              onChange={handleOperatorChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              disabled={disabled || !rule.field}
            >
              <option value="">Select operator</option>
              {operatorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
  
          <div className="col-span-12 sm:col-span-5">
            <input
              ref={inputRef}
              type={selectedField.type === 'number' ? 'number' : 'text'}
              value={rule.value || ''}
              onChange={handleValueChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter value"
              disabled={disabled}
            />
          </div>
        </div>
  
        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
            title="Remove condition"
          >
            <IoTrash size={18} />
          </button>
        )}
      </motion.div>
    );
  }, (prevProps, nextProps) => {
    // Prevent re-render if props haven't changed
    return (
      prevProps.rule === nextProps.rule &&
      prevProps.index === nextProps.index &&
      prevProps.disabled === nextProps.disabled
    );
  });
  

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Audience Rules</h3>
        <p className="text-sm text-gray-600">
          Define your audience by creating rules to filter customers based on their attributes.
        </p>
      </div>

      <div className="mb-4">
        <button
          type="button"
          onClick={toggleConditionType}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            rules.conditionType === 'AND'
              ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
          disabled={disabled}
        >
          Match {rules.conditionType === 'AND' ? 'ALL' : 'ANY'} Conditions
        </button>
        <span className="text-xs text-gray-500 ml-2">
          {rules.conditionType === 'AND'
            ? 'Customer must meet all conditions (AND logic)'
            : 'Customer must meet at least one condition (OR logic)'}
        </span>
      </div>

      <div>
        {rules.conditions.map((condition, index) => (
          <RuleBuilder
            key={condition.id || index}
            rule={condition}
            index={index}
            onUpdate={handleUpdateCondition}
            onRemove={handleRemoveCondition}
          />
        ))}

        {!disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={handleAddCondition}
              className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <IoAddCircle className="mr-1" size={18} />
              <span>Add condition</span>
            </button>
          </motion.div>
        )}
      </div>

      {rules.conditions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
          <strong>Audience Definition:</strong>{' '}
          <span className="text-gray-700">
            Include customers who meet{' '}
            {rules.conditionType === 'AND' ? 'all' : 'any'} of the above conditions.
          </span>
        </div>
      )}
    </div>
  );
};

// ===== COMPONENT: SegmentListPage =====
// ===== COMPONENT: SegmentListPage =====
const SegmentListPage = () => {
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setIsLoading(true);
        // Call the actual API service
        const response = await segmentService.getAllSegments();
        console.log('Fetched segments:', response);
        
        // Handle the response properly based on the actual structure
        let segmentsData = [];
        
        // Check if the response has the expected structure
        if (response && response.data && response.data.segments) {
          // Extract segments array from the response
          segmentsData = response.data.segments;
        } else if (Array.isArray(response)) {
          // If response is already an array of segments
          segmentsData = response;
        }
        
        console.log('Processed segments data:', segmentsData);
        setSegments(segmentsData);
      } catch (err) {
        console.error('Error fetching segments:', err);
        setError('Failed to load segments. Please try again.');
        toast.error('Failed to load segments');
        // Set segments to empty array on error
        setSegments([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSegments();
  }, []);

  const handleCreateSegment = () => {
    navigate('/segments/create');
  };

  const handleSegmentClick = (id) => {
    navigate(`/segments/${id}`);
  };

  // Filter segments based on search
  const filteredSegments = Array.isArray(segments) 
  ? segments.filter(segment => 
      segment.name?.toLowerCase().includes(search.toLowerCase()) ||
      segment.description?.toLowerCase().includes(search.toLowerCase())
    )
  : [];

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
          <h1 className="text-2xl font-bold text-gray-800">Audience Segments</h1>
          <p className="text-gray-500 mt-1">
            Create and manage customer segments for targeted campaigns
          </p>
        </div>
        <button
          onClick={handleCreateSegment}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Segment
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search segments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {filteredSegments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">No segments found</h2>
          <p className="mt-2 text-gray-500">
            {search ? `No segments match "${search}"` : "You haven't created any segments yet"}
          </p>
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          ) : (
            <button
              onClick={handleCreateSegment}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Create your first segment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSegments.map((segment) => (
            <motion.div
              key={segment._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => handleSegmentClick(segment._id)}
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{segment.name}</h2>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      segment.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {segment.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{segment.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Audience Size</p>
                    <p className="font-medium">{formatNumber(segment.audienceSize)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(segment.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Refreshed</p>
                    <p className="font-medium">{formatDate(segment.lastRefreshed)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Conditions</p>
                    <p className="font-medium">{segment.rules?.conditions?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="border-t px-6 py-3 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Logic: {segment.rules?.conditionType || 'N/A'}
                  </div>
                  <div className="text-xs font-medium text-blue-600">View Details →</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ===== COMPONENT: SegmentCreatePage =====
const SegmentCreatePage = () => {
  const navigate = useNavigate();
  const { rules, setRules, audiencePreview, createSegment, setSegmentName, setSegmentDescription } = useSegmentBuilder();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }
    
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
      toast.error('At least one condition is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSegmentName(name);
      setSegmentDescription(description);
      
      // Call the API to create the segment
      const result = await createSegment();
      
      if (result) {
        toast.success('Segment created successfully');
        navigate('/segments');
      }
    } catch (err) {
      console.error('Error creating segment:', err);
      toast.error('Failed to create segment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRulesChange = (updatedRules) => {
    setRules(updatedRules);
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
          onClick={() => navigate('/segments')}
          className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create Segment</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Segment Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter segment name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the audience segment"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <SegmentBuilder initialRules={rules} onChange={handleRulesChange} />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Audience Preview</h3>
                <p className="text-sm text-gray-500">
                  {audiencePreview.loading
                    ? 'Calculating audience size...'
                    : audiencePreview.count > 0
                      ? `Your segment will include ${formatNumber(audiencePreview.count)} customers`
                      : 'No customers match these criteria'}
                </p>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {audiencePreview.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  formatNumber(audiencePreview.count)
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/segments')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || audiencePreview.count === 0}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || !name || audiencePreview.count === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Segment'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// ===== COMPONENT: SegmentDetailsPage =====
// ===== COMPONENT: SegmentDetailsPage =====
const SegmentDetailsPage = () => {
  const { id } = useParams();
  const [segment, setSegment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSegmentDetails = async () => {
      try {
        setIsLoading(true);
        // Call the actual API
        const response = await segmentService.getSegmentById(id);
        console.log('Fetched segment details:', response);
        
        // Extract the segment object from the response
        let segmentData = null;
        
        if (response && response.data && response.data.segment) {
          // Case 1: Response has data.segment property
          segmentData = response.data.segment;
        } else if (response && response.data) {
          // Case 2: Response has data property directly
          segmentData = response.data;
        } else {
          // Case 3: Response is the segment data directly
          segmentData = response;
        }
        
        console.log('Processed segment data:', segmentData);
        setSegment(segmentData);
      } catch (err) {
        console.error('Error fetching segment details:', err);
        setError('Failed to load segment details');
        toast.error('Failed to load segment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegmentDetails();
  }, [id]);

  const handleRefreshAudience = async () => {
    try {
      setIsRefreshing(true);
      // Call the API to refresh segment size
      const response = await segmentService.refreshSegmentSize(id);
      
      // Extract the updated segment data
      let updatedSegment = null;
      if (response && response.data && response.data.segment) {
        updatedSegment = response.data.segment;
      } else if (response && response.data) {
        updatedSegment = response.data;
      } else {
        updatedSegment = response;
      }
      
      if (updatedSegment) {
        setSegment(updatedSegment);
        toast.success('Audience size refreshed');
      }
    } catch (err) {
      console.error('Error refreshing audience size:', err);
      toast.error('Failed to refresh audience size');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/segments/${id}/edit`);
  };

  const handleCreateCampaign = () => {
    navigate('/campaigns/create', { state: { segmentId: id } });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this segment?')) {
      return;
    }
    
    try {
      // Call the API to delete the segment
      await segmentService.deleteSegment(id);
      
      toast.success('Segment deleted successfully');
      navigate('/segments');
    } catch (err) {
      console.error('Error deleting segment:', err);
      toast.error('Failed to delete segment');
    }
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
          onClick={() => navigate('/segments')}
        >
          Back to Segments
        </button>
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="p-8 text-center">
        <p>Segment not found</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/segments')}
        >
          Back to Segments
        </button>
      </div>
    );
  }

  // Ensure rules object exists with defaults
  const rules = segment.rules || { conditionType: 'AND', conditions: [] };
  const conditions = rules.conditions || [];

  // Field name mapping for readability
  const fieldNames = {
    totalSpend: 'Total Spend',
    orderCount: 'Order Count',
    lastOrderDate: 'Last Order Date',
    name: 'Name',
    email: 'Email',
    location: 'Location',
    isActive: 'Active Status'
  };

  // Operator name mapping for readability
  const operatorNames = {
    equals: 'equals',
    notEquals: 'does not equal',
    greaterThan: 'greater than',
    lessThan: 'less than',
    greaterThanOrEqual: 'greater than or equal to',
    lessThanOrEqual: 'less than or equal to',
    contains: 'contains',
    startsWith: 'starts with',
    endsWith: 'ends with',
    inLast: 'in the last',
    notInLast: 'not in the last'
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
          onClick={() => navigate('/segments')}
          className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{segment.name || 'Untitled Segment'}</h1>
        <span
          className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
            segment.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {segment.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Segment Details">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{segment.description || 'No description provided'}</p>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Audience Rules</h3>
                <span className="text-sm text-gray-500">
                  Logic: {rules.conditionType}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {conditions.length > 0 ? (
                  conditions.map((condition, index) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="flex items-center">
                        {index > 0 && (
                          <div className="text-sm font-medium text-gray-500 mr-2">
                            {rules.conditionType}
                          </div>
                        )}
                        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg text-sm flex-grow">
                          <span className="font-medium">{fieldNames[condition.field] || condition.field}</span>
                          {' '}
                          <span className="text-gray-600">{operatorNames[condition.operator] || condition.operator}</span>
                          {' '}
                          <span className="font-medium">
                            {condition.operator === 'inLast' || condition.operator === 'notInLast'
                              ? `${condition.value} days`
                              : condition.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    No conditions defined
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Campaigns Using This Segment</h3>
                <button
                  onClick={handleCreateCampaign}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Create Campaign
                </button>
              </div>
              
              {segment.campaigns && segment.campaigns.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    {segment.campaigns.map((campaign) => (
                      <div key={campaign._id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-500">
                            Sent: {formatDate(campaign.sentAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500">No campaigns using this segment yet</p>
                  <button
                    onClick={handleCreateCampaign}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                  >
                    Create Campaign
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card title="Audience Information">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Audience Size</h3>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">{formatNumber(segment.audienceSize || 0)}</span>
                  <button
                    onClick={handleRefreshAudience}
                    disabled={isRefreshing}
                    className={`ml-2 p-1 rounded-full ${
                      isRefreshing ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'
                    }`}
                    title="Refresh audience size"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last refreshed: {segment.lastRefreshed ? formatDate(segment.lastRefreshed) : 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {segment.createdAt ? formatDate(segment.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="Actions">
            <div className="space-y-3">
              <button
                onClick={handleCreateCampaign}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Create Campaign
              </button>
              
              <button
                onClick={handleEdit}
                className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Segment
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full py-2 px-4 bg-white hover:bg-red-50 text-red-600 rounded-lg border border-red-300 flex items-center justify-center transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Segment
              </button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
// ===== COMPONENT: SegmentEditPage =====
const SegmentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rules, setRules, audiencePreview, previewAudience, setSegmentName, setSegmentDescription } = useSegmentBuilder();
  const [segment, setSegment] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSegmentDetails = async () => {
      try {
        setIsLoading(true);
        // Call the actual API to get the segment details
        const data = await segmentService.getSegmentById(id);
        
        setSegment(data);
        setName(data.name);
        setDescription(data.description);
        setRules(data.rules);
        setSegmentName(data.name);
        setSegmentDescription(data.description);
        
        // Preview audience size for initial rules
        await previewAudience(data.rules);
      } catch (err) {
        console.error('Error fetching segment details:', err);
        setError('Failed to load segment details');
        toast.error('Failed to load segment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegmentDetails();
  }, [id, setRules, previewAudience, setSegmentName, setSegmentDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }
    
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
      toast.error('At least one condition is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSegmentName(name);
      setSegmentDescription(description);
      
      // Call the API to update the segment
      const segmentData = {
        name,
        description,
        rules
      };
      
      await segmentService.updateSegment(id, segmentData);
      
      toast.success('Segment updated successfully');
      navigate(`/segments/${id}`);
    } catch (err) {
      console.error('Error updating segment:', err);
      toast.error('Failed to update segment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRulesChange = (updatedRules) => {
    setRules(updatedRules);
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
          onClick={() => navigate(`/segments/${id}`)}
        >
          Back to Segment
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
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/segments/${id}`)}
          className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Segment</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Segment Name*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter segment name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the audience segment"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <SegmentBuilder initialRules={rules} onChange={handleRulesChange} />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Audience Preview</h3>
                <p className="text-sm text-gray-500">
                  {audiencePreview.loading
                    ? 'Calculating audience size...'
                    : audiencePreview.count > 0
                      ? `Your segment will include ${formatNumber(audiencePreview.count)} customers`
                      : 'No customers match these criteria'}
                </p>
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {audiencePreview.loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  formatNumber(audiencePreview.count)
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/segments/${id}`)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || audiencePreview.count === 0}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || !name || audiencePreview.count === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Segment'
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// ===== MAIN COMPONENT: Segments =====
// Define main component after all other components to avoid the reference error
const Segments = () => {
  return (
    <Routes>
      <Route index element={<SegmentListPage />} />
      <Route path="create" element={<SegmentCreatePage />} />
      <Route path=":id" element={<SegmentDetailsPage />} />
      <Route path=":id/edit" element={<SegmentEditPage />} />
    </Routes>
  );
};

export default Segments;