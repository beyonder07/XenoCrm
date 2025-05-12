import { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import segmentService from '@services/segment.service';

export const SegmentBuilderContext = createContext(null);

// Initial rule structure
const initialRuleGroup = {
  id: uuidv4(),
  combinator: 'AND',
  rules: [
    {
      id: uuidv4(),
      field: 'spend',
      operator: 'greaterThan',
      value: '',
    },
  ],
};

export const SegmentBuilderProvider = ({ children }) => {
  const [ruleGroups, setRuleGroups] = useState([{ ...initialRuleGroup }]);
  const [groupCombinator, setGroupCombinator] = useState('OR');
  const [audiencePreview, setAudiencePreview] = useState({
    count: 0,
    loading: false,
    error: null,
  });
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');

  // Fields available for segmentation
  const fields = [
    { id: 'spend', label: 'Total Spend', type: 'number' },
    { id: 'visits', label: 'Visit Count', type: 'number' },
    { id: 'lastPurchaseDate', label: 'Last Purchase Date', type: 'date' },
    { id: 'country', label: 'Country', type: 'string' },
    { id: 'city', label: 'City', type: 'string' },
    { id: 'category', label: 'Category Interest', type: 'string' },
    { id: 'device', label: 'Device Type', type: 'string' },
    { id: 'age', label: 'Age', type: 'number' },
  ];

  // Operators for different field types
  const operators = {
    string: [
      { id: 'equals', label: 'Equals' },
      { id: 'notEquals', label: 'Not Equals' },
      { id: 'contains', label: 'Contains' },
      { id: 'startsWith', label: 'Starts With' },
      { id: 'endsWith', label: 'Ends With' },
    ],
    number: [
      { id: 'equals', label: 'Equals' },
      { id: 'notEquals', label: 'Not Equals' },
      { id: 'greaterThan', label: 'Greater Than' },
      { id: 'lessThan', label: 'Less Than' },
      { id: 'between', label: 'Between' },
    ],
    date: [
      { id: 'equals', label: 'Equals' },
      { id: 'notEquals', label: 'Not Equals' },
      { id: 'before', label: 'Before' },
      { id: 'after', label: 'After' },
      { id: 'between', label: 'Between' },
      { id: 'inLast', label: 'In Last' },
    ],
  };

  // Add a new rule to a group
  const addRule = (groupId) => {
    setRuleGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            rules: [
              ...group.rules,
              {
                id: uuidv4(),
                field: 'spend',
                operator: 'greaterThan',
                value: '',
              },
            ],
          };
        }
        return group;
      })
    );
  };

  // Remove a rule from a group
  const removeRule = (groupId, ruleId) => {
    setRuleGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
            return {
                ...group,
                rules: [
                  ...group.rules,
                  {
                    id: uuidv4(),
                    field: 'spend',
                    operator: 'greaterThan',
                    value: '',
                  },
                ],
              };
            }
            return group;
          })
        );
      };
      // Update a rule in a group
  const updateRule = (groupId, ruleId, field, value) => {
    setRuleGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            rules: group.rules.map(rule => {
              if (rule.id === ruleId) {
                return { ...rule, [field]: value };
              }
              return rule;
            }),
          };
        }
        return group;
      })
    );
  };

  // Update a group's combinator
  const updateGroupCombinator = (groupId, combinator) => {
    setRuleGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, combinator };
        }
        return group;
      })
    );
  };

  // Add a new rule group
  const addRuleGroup = () => {
    setRuleGroups(prevGroups => [...prevGroups, { ...initialRuleGroup, id: uuidv4() }]);
  };

  // Remove a rule group
  const removeRuleGroup = (groupId) => {
    setRuleGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
  };

  // Preview audience size based on current rules
  const previewAudience = async () => {
    try {
      setAudiencePreview(prev => ({ ...prev, loading: true, error: null }));
      const response = await segmentService.previewSegment({ 
        ruleGroups, 
        groupCombinator 
      });
      setAudiencePreview(prev => ({ 
        ...prev, 
        count: response.count, 
        loading: false 
      }));
    } catch (error) {
      console.error('Error previewing audience:', error);
      setAudiencePreview(prev => ({ 
        ...prev, 
        error: 'Failed to preview audience size', 
        loading: false 
      }));
      toast.error('Failed to preview audience size');
    }
  };

  // Create a new segment
  const createSegment = async () => {
    try {
      if (!segmentName.trim()) {
        toast.error('Please provide a segment name');
        return null;
      }
      
      const response = await segmentService.createSegment({
        name: segmentName,
        description: segmentDescription,
        ruleGroups,
        groupCombinator
      });
      
      toast.success('Segment created successfully');
      return response;
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
      return null;
    }
  };

  // Convert natural language to rule structure using AI
  const convertNLToRules = async (nlPrompt) => {
    try {
      if (!nlPrompt.trim()) {
        toast.error('Please provide a description');
        return;
      }
      
      const response = await segmentService.convertNLToRules(nlPrompt);
      
      if (response.ruleGroups && response.groupCombinator) {
        setRuleGroups(response.ruleGroups);
        setGroupCombinator(response.groupCombinator);
        toast.success('Rules generated successfully');
        
        // Preview audience after generating rules
        await previewAudience();
      }
    } catch (error) {
      console.error('Error converting NL to rules:', error);
      toast.error('Failed to generate rules from text');
    }
  };

  // Reset the rule builder to initial state
  const resetRuleBuilder = () => {
    setRuleGroups([{ ...initialRuleGroup }]);
    setGroupCombinator('OR');
    setSegmentName('');
    setSegmentDescription('');
    setAudiencePreview({
      count: 0,
      loading: false,
      error: null,
    });
  };

  return (
    <SegmentBuilderContext.Provider value={{
      ruleGroups,
      groupCombinator,
      fields,
      operators,
      audiencePreview,
      segmentName,
      segmentDescription,
      setSegmentName,
      setSegmentDescription,
      setGroupCombinator,
      addRule,
      removeRule,
      updateRule,
      updateGroupCombinator,
      addRuleGroup,
      removeRuleGroup,
      previewAudience,
      createSegment,
      convertNLToRules,
      resetRuleBuilder,
    }}>
      {children}
    </SegmentBuilderContext.Provider>
  );
}
export default SegmentBuilderProvider;