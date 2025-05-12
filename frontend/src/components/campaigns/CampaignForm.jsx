import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import campaignService from '../../services/campaign.service';
import segmentService from '../../services/segment.service';
import SegmentBuilder from '../segments/SegmentBuilder';
import AudiencePreview from '../segments/AudiencePreview';
import AIMessageSuggestions from '../ai/AIMessageSuggestions';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const CampaignForm = ({ initialRules, preSelectedSegmentId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [audienceSize, setAudienceSize] = useState(0);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [segmentRules, setSegmentRules] = useState(initialRules || null);
  const [selectedSegmentId, setSelectedSegmentId] = useState(preSelectedSegmentId || '');
  const [preSelectedCustomerId, setPreSelectedCustomerId] = useState(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAIMessageSuggestions, setShowAIMessageSuggestions] = useState(false);
  const [customSegmentName, setCustomSegmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formikRef = useRef(null);

  // Define validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Campaign name is required'),
    message: Yup.string().required('Message is required').max(500, 'Message must be 500 characters or less'),
  });

  // Initial form values
  const initialValues = {
    name: '',
    message: '',
    segmentId: '',
    scheduledDate: '',
    saveSegment: false,
  };

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setIsLoading(true);
        const response = await segmentService.getAllSegments();
        console.log('Fetched segments:', response);

        // Extract the segments array from the response
        let segmentsData = [];
        
        if (response?.status === 'success' && Array.isArray(response.data?.segments)) {
          segmentsData = response.data.segments;
        } else if (Array.isArray(response)) {
          segmentsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          segmentsData = response.data;
        } else {
          console.warn('Unexpected response format from getAllSegments:', response);
        }
        
        setSegments(segmentsData);
        console.log('Processed segments data:', segmentsData);

        // If we have a preSelectedSegmentId, fetch its details
        if (preSelectedSegmentId) {
          try {
            const segmentDetails = await segmentService.getSegmentById(preSelectedSegmentId);
            console.log('Fetched pre-selected segment details:', segmentDetails);
            
            // Extract the segment data from the response
            let segmentData = null;
            if (segmentDetails?.data?.segment) {
              segmentData = segmentDetails.data.segment;
            } else if (segmentDetails?.data) {
              segmentData = segmentDetails.data;
            } else {
              segmentData = segmentDetails;
            }
            
            // Use previewSegment to get audience size
            const audienceData = await segmentService.previewSegment({
              segmentId: preSelectedSegmentId,
            });
            
            // Extract the audience count from the response
            let count = 0;
            if (audienceData?.data?.audienceSize) {
              count = audienceData.data.audienceSize;
            } else if (audienceData?.count) {
              count = audienceData.count;
            } else if (segmentData?.audienceSize) {
              count = segmentData.audienceSize;
            }
            
            setAudienceSize(count || 0);
          } catch (err) {
            console.error('Error fetching pre-selected segment details:', err);
            toast.error('Failed to load segment details');
          }
        }

        // Check if we have a preselected customer from location state
        if (location.state?.preSelectedCustomerId) {
          setPreSelectedCustomerId(location.state.preSelectedCustomerId);
          // Create a custom segment rule for this single customer
          setSegmentRules({
            conditionType: 'AND',
            conditions: [
              {
                field: 'customerId',
                operator: 'equals',
                value: location.state.preSelectedCustomerId,
              },
            ],
          });
          setCustomSegmentName('Single Customer Campaign');
          setShowSegmentBuilder(true);

          // Calculate audience size (should be 1)
          try {
            const audienceData = await segmentService.previewSegment({
              rules: {
                conditionType: 'AND',
                conditions: [
                  {
                    field: 'customerId',
                    operator: 'equals',
                    value: location.state.preSelectedCustomerId,
                  },
                ],
              },
            });
            setAudienceSize(audienceData.count || 1); // Fallback to 1 if count is not provided
          } catch (error) {
            console.error('Error previewing segment:', error);
            // For a single customer campaign, default to 1 if preview fails
            setAudienceSize(1);
          }
        }
      } catch (err) {
        console.error('Error fetching segments:', err);
        toast.error('Failed to load segments. Please try again later.');
        setSegments([]); // Set segments to an empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegments();
  }, [location.state, preSelectedSegmentId]);

  const handleSegmentChange = async (segmentId) => {
    if (segmentId === 'custom') {
      setShowSegmentBuilder(true);
      setSelectedSegmentId('');
      setSegmentRules({
        conditionType: 'AND',
        conditions: [],
      });
      setAudienceSize(0);
    } else {
      setShowSegmentBuilder(false);
      setSelectedSegmentId(segmentId);

      try {
        const segmentDetails = await segmentService.getSegmentById(segmentId);
        console.log('Fetched segment details:', segmentDetails);
        
        // Extract the segment data from the response
        let segmentData = null;
        if (segmentDetails?.data?.segment) {
          segmentData = segmentDetails.data.segment;
        } else if (segmentDetails?.data) {
          segmentData = segmentDetails.data;
        } else {
          segmentData = segmentDetails;
        }
        
        // Use previewSegment instead of previewAudience
        const audienceData = await segmentService.previewSegment({
          segmentId,
        });
        
        // Extract the audience count from the response
        let count = 0;
        if (audienceData?.data?.audienceSize) {
          count = audienceData.data.audienceSize;
        } else if (audienceData?.count) {
          count = audienceData.count;
        } else if (segmentData?.audienceSize) {
          count = segmentData.audienceSize;
        }
        
        setAudienceSize(count || 0);
      } catch (err) {
        console.error('Error fetching segment details:', err);
        toast.error('Failed to load segment details');
      }
    }
  };

  const handleRulesChange = async (rules) => {
    setSegmentRules(rules);
    
    if (rules.conditions.length > 0) {
      try {
        // Use previewSegment instead of previewAudience
        const audienceData = await segmentService.previewSegment({
          rules,
        });
        
        // Extract the audience count from the response
        let count = 0;
        if (audienceData?.data?.audienceSize) {
          count = audienceData.data.audienceSize;
        } else if (audienceData?.count) {
          count = audienceData.count;
        }
        
        setAudienceSize(count || 0);
      } catch (err) {
        console.error('Error previewing audience:', err);
        toast.error('Failed to calculate audience size');
      }
    } else {
      setAudienceSize(0);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    if (isSubmitting) return;

    const finalMessage = values.message;

    // Validation
    if (!selectedSegmentId && (!segmentRules || segmentRules.conditions.length === 0)) {
      toast.error('Please select a segment or create a custom one');
      return;
    }

    if (audienceSize === 0) {
      toast.error('Your audience is empty. Please adjust your segment rules.');
      return;
    }

    setIsSubmitting(true);

    try {
      let segmentId = selectedSegmentId;

      // If using custom segment and user wants to save it
      if (showSegmentBuilder && values.saveSegment && customSegmentName) {
        const newSegment = await segmentService.createSegment({
          name: customSegmentName,
          rules: segmentRules,
        });
        
        // Extract the segment ID from the response
        if (newSegment?._id) {
          segmentId = newSegment._id;
        } else if (newSegment?.data?.segment?._id) {
          segmentId = newSegment.data.segment._id;
        } else if (newSegment?.data?._id) {
          segmentId = newSegment.data._id;
        } else if (newSegment?.id) {
          segmentId = newSegment.id;
        }
        
        toast.success('Segment saved successfully');
      }

      // Create campaign
      const campaignData = {
        name: values.name,
        message: finalMessage,
        segmentId: segmentId || null,
        customRules: !segmentId ? segmentRules : null,
        scheduledDate: values.scheduledDate || new Date(),
        audienceSize,
      };

      const campaign = await campaignService.createCampaign(campaignData);
      
      // Extract the campaign ID from the response
      let campaignId = null;
      if (campaign?._id) {
        campaignId = campaign._id;
      } else if (campaign?.data?.campaign?._id) {
        campaignId = campaign.data.campaign._id;
      } else if (campaign?.data?._id) {
        campaignId = campaign.data._id;
      } else if (campaign?.id) {
        campaignId = campaign.id;
      }
      
      // Trigger campaign delivery if we have a valid campaign ID
      if (campaignId) {
        await campaignService.deliverCampaign(campaignId);
        toast.success('Campaign created and delivery started');
        navigate('/campaigns/history');
      } else {
        console.error('Failed to extract campaign ID from response:', campaign);
        toast.error('Campaign created but delivery failed to start.');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast.error('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add debug logging for AI suggestions state
  useEffect(() => {
    console.log('AI Suggestions State:', {
      showAIMessageSuggestions,
      segmentRules,
      selectedSegmentId,
      audienceSize
    });
  }, [showAIMessageSuggestions, segmentRules, selectedSegmentId, audienceSize]);

  // Add debug logging for form values
  useEffect(() => {
    if (formikRef.current) {
      console.log('Form values:', formikRef.current.values);
    }
  }, [formikRef.current?.values]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <button
          className="flex items-center text-blue-500 hover:text-blue-700"
          onClick={() => navigate(-1)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Create Campaign</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Formik
          initialValues={{
            ...initialValues,
            segmentId: preSelectedSegmentId || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          innerRef={formikRef}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue, isValid, dirty }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  className={`w-full p-2 border rounded ${
                    errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter campaign name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-red-500"
                />
              </div>

              <div>
                <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Audience
                </label>
                <Field
                  as="select"
                  id="segmentId"
                  name="segmentId"
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                  onChange={(e) => {
                    setFieldValue('segmentId', e.target.value);
                    handleSegmentChange(e.target.value);
                  }}
                  value={preSelectedCustomerId ? 'custom' : values.segmentId}
                  disabled={preSelectedCustomerId !== null}
                >
                  <option value="">Select a segment</option>
                  {segments.map((segment) => (
                    <option key={segment._id} value={segment._id}>
                      {segment.name} ({segment.audienceSize || '?'} customers)
                    </option>
                  ))}
                  <option value="custom">Create custom segment</option>
                </Field>
              </div>

              {showSegmentBuilder && (
                <div className="border-t border-b py-4 my-4">
                  <div className="mb-4">
                    <label htmlFor="customSegmentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Segment Name
                    </label>
                    <input
                      id="customSegmentName"
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Enter segment name (required if saving)"
                      value={customSegmentName}
                      onChange={(e) => setCustomSegmentName(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center mb-4">
                    <Field
                      type="checkbox"
                      id="saveSegment"
                      name="saveSegment"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveSegment" className="ml-2 block text-sm text-gray-900">
                      Save this segment for future campaigns
                    </label>
                  </div>

                  <SegmentBuilder
                    initialRules={segmentRules}
                    onChange={handleRulesChange}
                    disabled={preSelectedCustomerId !== null}
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <AudiencePreview audienceSize={audienceSize} isCustom={showSegmentBuilder} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('AI Suggestions button clicked');
                      if (!selectedSegmentId && (!segmentRules || segmentRules.conditions.length === 0)) {
                        toast.error('Please select or create a segment first');
                        return;
                      }
                      if (audienceSize === 0) {
                        toast.error('Your audience is empty. Please adjust your segment rules.');
                        return;
                      }
                      setIsLoadingSuggestions(true);
                      setShowAIMessageSuggestions(true);
                    }}
                    disabled={isLoadingSuggestions || (!selectedSegmentId && (!segmentRules || segmentRules.conditions.length === 0))}
                    className={`text-sm px-3 py-1 rounded-md flex items-center ${
                      isLoadingSuggestions || (!selectedSegmentId && (!segmentRules || segmentRules.conditions.length === 0))
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <span className="flex items-center">
                      {isLoadingSuggestions ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Suggestions...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Get AI Message Ideas
                        </>
                      )}
                    </span>
                  </button>
                </div>
                <Field
                  as="textarea"
                  id="message"
                  name="message"
                  rows={4}
                  className={`w-full p-2 border rounded ${
                    errors.message && touched.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Hi {{name}}, write your message here..."
                  value={values.message}
                  onChange={(e) => {
                    console.log('Message field onChange:', e.target.value);
                    setFieldValue('message', e.target.value);
                  }}
                />
                <ErrorMessage
                  name="message"
                  component="div"
                  className="mt-1 text-sm text-red-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can use {'{'}'{'{'}name{'}'}'{'}'} to personalize your message with the customer's name.
                </p>
              </div>

              <div>
                <label
                  htmlFor="scheduledDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Schedule (optional)
                </label>
                <Field
                  id="scheduledDate"
                  name="scheduledDate"
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to send immediately after creation.
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => navigate('/campaigns')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !(isValid && dirty) || audienceSize === 0}
                  className={`px-4 py-2 rounded text-white transition ${
                    isSubmitting || !(isValid && dirty) || audienceSize === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {showAIMessageSuggestions && (
        <AIMessageSuggestions
          segmentRules={segmentRules}
          segmentId={selectedSegmentId}
          onSelect={() => {
            setIsLoadingSuggestions(false);
            setShowAIMessageSuggestions(false);
          }}
          onCancel={() => {
            console.log('AI Suggestions cancelled in CampaignForm');
            setIsLoadingSuggestions(false);
            setShowAIMessageSuggestions(false);
          }}
          onError={(error) => {
            console.error('Error in AI Suggestions:', error);
            setIsLoadingSuggestions(false);
            setShowAIMessageSuggestions(false);
            toast.error('Failed to generate suggestions. Please try again.');
          }}
        />
      )}
    </motion.div>
  );
};

export default CampaignForm;