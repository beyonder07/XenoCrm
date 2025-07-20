import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CampaignForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'draft'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just navigate back to campaigns list
    navigate('/home/campaigns');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Create Campaign</h1>
        <p className="mt-1 text-sm text-text opacity-75">Set up a new marketing campaign</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-primary mt-1"
              placeholder="Enter campaign name"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-text">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-primary mt-1"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="input-primary mt-1"
            placeholder="Enter campaign description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-text">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input-primary mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-text">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input-primary mt-1"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-text">
            Budget
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-text sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="input-primary pl-7"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/home/campaigns')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Create Campaign
          </button>
        </div>
      </form>
    </div>
  );
}

export default CampaignForm; 