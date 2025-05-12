import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaign.service';
import { toast } from 'react-toastify';

/**
 * Custom hook for campaign management
 * @param {string} campaignId - Optional campaign ID to load
 * @returns {Object} Campaign methods and state
 */
const useCampaigns = (campaignId = null) => {
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Fetch all campaigns
  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.getAllCampaigns();
      setCampaigns(data);
      
      return data;
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
      toast.error('Failed to load campaigns');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single campaign by ID
  const fetchCampaign = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.getCampaignById(id);
      setCurrentCampaign(data);
      
      return data;
    } catch (err) {
      console.error(`Error fetching campaign with ID ${id}:`, err);
      setError('Failed to load campaign details');
      toast.error('Failed to load campaign details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new campaign
  const createCampaign = useCallback(async (campaignData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.createCampaign(campaignData);
      
      // Automatically deliver campaign if not scheduled
      if (!campaignData.scheduledDate || new Date(campaignData.scheduledDate) <= new Date()) {
        await campaignService.deliverCampaign(data._id);
        toast.success('Campaign created and delivery started');
      } else {
        toast.success('Campaign created and scheduled');
      }
      
      return data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError('Failed to create campaign');
      toast.error('Failed to create campaign');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing campaign
  const updateCampaign = useCallback(async (id, campaignData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.updateCampaign(id, campaignData);
      setCurrentCampaign(data);
      
      toast.success('Campaign updated successfully');
      return data;
    } catch (err) {
      console.error(`Error updating campaign with ID ${id}:`, err);
      setError('Failed to update campaign');
      toast.error('Failed to update campaign');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a campaign
  const deleteCampaign = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await campaignService.deleteCampaign(id);
      
      // Update campaigns list after deletion
      setCampaigns(prev => prev.filter(campaign => campaign._id !== id));
      
      toast.success('Campaign deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting campaign with ID ${id}:`, err);
      setError('Failed to delete campaign');
      toast.error('Failed to delete campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch campaign statistics
  const fetchCampaignStats = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.getCampaignStats(id);
      setStats(data);
      
      return data;
    } catch (err) {
      console.error(`Error fetching stats for campaign with ID ${id}:`, err);
      setError('Failed to load campaign statistics');
      toast.error('Failed to load campaign statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deliver a campaign
  const deliverCampaign = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await campaignService.deliverCampaign(id);
      
      toast.success('Campaign delivery started');
      return true;
    } catch (err) {
      console.error(`Error delivering campaign with ID ${id}:`, err);
      setError('Failed to deliver campaign');
      toast.error('Failed to deliver campaign');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Test a campaign
  const testCampaign = useCallback(async (campaignData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await campaignService.testCampaign(campaignData);
      
      toast.success('Campaign test completed successfully');
      return result;
    } catch (err) {
      console.error('Error testing campaign:', err);
      setError('Failed to test campaign');
      toast.error('Failed to test campaign');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch campaign by ID when campaignId prop changes
  useEffect(() => {
    if (campaignId) {
      fetchCampaign(campaignId);
    }
  }, [campaignId, fetchCampaign]);

  return {
    campaigns,
    currentCampaign,
    loading,
    error,
    stats,
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    fetchCampaignStats,
    deliverCampaign,
    testCampaign
  };
};

export default useCampaigns;