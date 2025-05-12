import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CampaignForm from '../components/campaigns/CampaignForm';
import NLPSegmentBuilder from '../components/ai/NLPSegmentBuilder';
import { toast } from 'react-toastify';

const CampaignCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [useNLPBuilder, setUseNLPBuilder] = useState(false);
  const [generatedRules, setGeneratedRules] = useState(null);
  const [preSelectedSegmentId, setPreSelectedSegmentId] = useState(null);

  useEffect(() => {
    // Check if we have a preselected segment from location state
    if (location.state?.segmentId) {
      setPreSelectedSegmentId(location.state.segmentId);
    }
  }, [location.state]);

  const handleRulesGenerated = (rules) => {
    setGeneratedRules(rules);
    setUseNLPBuilder(false);
    toast.success('Audience rules generated successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Campaign</h1>
        </div>
        <button
          onClick={() => setUseNLPBuilder(!useNLPBuilder)}
          className="px-4 py-2 text-blue-600 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {useNLPBuilder ? 'Switch to Manual Builder' : 'Use Natural Language Builder'}
        </button>
      </div>

      {useNLPBuilder ? (
        <NLPSegmentBuilder onRulesGenerated={handleRulesGenerated} />
      ) : (
        <CampaignForm 
          initialRules={generatedRules}
          preSelectedSegmentId={preSelectedSegmentId}
        />
      )}
    </motion.div>
  );
};

export default CampaignCreate;