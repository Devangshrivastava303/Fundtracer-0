"use client";

import React, { useState } from 'react';
import { Plus, X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface Milestone {
  title: string;
  description: string;
  due_date: string;
  order: number;
}

interface MilestoneSetupProps {
  campaignId: string;
  campaignTitle: string;
  isCreator: boolean;
  onSuccess?: () => void;
}

export function MilestoneSetup({ campaignId, campaignTitle, isCreator, onSuccess }: MilestoneSetupProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  const handleAddMilestone = () => {
    if (!formData.title || !formData.description || !formData.due_date) {
      setError('Please fill in all milestone fields');
      return;
    }

    // Validate due date is in future
    if (new Date(formData.due_date) <= new Date()) {
      setError('Milestone due date must be in the future');
      return;
    }

    const newMilestone: Milestone = {
      title: formData.title,
      description: formData.description,
      due_date: formData.due_date,
      order: milestones.length + 1,
    };

    setMilestones([...milestones, newMilestone]);
    setFormData({ title: '', description: '', due_date: '' });
    setIsAddingMilestone(false);
    setError('');
  };

  const handleRemoveMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated.map((m, i) => ({ ...m, order: i + 1 })));
  };

  const handleSubmitMilestones = async () => {
    if (milestones.length === 0) {
      setError('You must create at least one milestone');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      console.log('Creating milestones for campaign:', campaignId);
      console.log('Token available:', !!token);

      // Submit all milestones
      for (const milestone of milestones) {
        try {
          const payload = {
            title: milestone.title,
            description: milestone.description,
            due_date: new Date(milestone.due_date).toISOString(),
            order: milestone.order,
          };
          
          console.log('Submitting milestone:', payload);
          
          const response = await axios.post(
            `http://127.0.0.1:8000/api/campaigns/${campaignId}/milestones/`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log('Milestone created successfully:', response.data);
        } catch (milestoneError: any) {
          console.error('Error creating individual milestone:', milestoneError);
          console.error('Response status:', milestoneError.response?.status);
          console.error('Response data:', milestoneError.response?.data);
          throw milestoneError;
        }
      }

      setSuccess(true);
      setMilestones([]);
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err: any) {
      console.error('Full error object:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          err.response?.data?.non_field_errors?.[0] ||
                          err.message || 
                          'Failed to create milestone';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreator) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Campaign Milestones</h2>
        </div>
        <p className="text-gray-600">
          Set up a timeline of milestones for this campaign. This helps donors track progress as you achieve your goals.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Milestones Created Successfully!</p>
            <p className="text-sm text-green-700 mt-1">Your campaign timeline has been set up. Donors can now track your progress.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length > 0 && (
        <div className="mb-6 space-y-3">
          {milestones.map((milestone, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {new Date(milestone.due_date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveMilestone(index)}
                  className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Milestone Form */}
      {isAddingMilestone ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-4">Add Milestone #{milestones.length + 1}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestone Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Phase 1 - Design Complete"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what will be accomplished in this milestone"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Completion Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is when you plan to complete this milestone
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsAddingMilestone(false);
                  setFormData({ title: '', description: '', due_date: '' });
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingMilestone(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="w-5 h-5" /> Add Milestone
        </button>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Create 2-4 meaningful milestones spread over your campaign timeline. This helps donors see progress and keeps you accountable.
        </p>
      </div>

      {/* Submit Button */}
      {milestones.length > 0 && (
        <button
          onClick={handleSubmitMilestones}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Setting Up Milestones...' : `Create ${milestones.length} Milestone${milestones.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
