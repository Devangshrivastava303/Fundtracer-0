"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Plus, Upload, Check, Clock, AlertCircle, Calendar, Trash2, Edit2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { MilestoneUploadModal } from '@/components/milestone-upload-modal';
import { MilestoneCompleteModal } from '@/components/milestone-complete-modal';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  created_by: {
    id: number;
    email: string;
    first_name: string;
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  due_date: string;
  image?: string;
  is_completed: boolean;
  completed_at?: string;
  is_overdue: boolean;
  days_until_due?: number;
}

const FundraiserDashboard = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedMilestoneForUpload, setSelectedMilestoneForUpload] = useState<Milestone | null>(null);
  const [selectedMilestoneForComplete, setSelectedMilestoneForComplete] = useState<Milestone | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    image: null as File | null,
  });

  // Load fundraiser's campaigns
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        'http://127.0.0.1:8000/api/campaigns/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle different response structures
      let campaignsList = response.data.data || response.data;
      if (!Array.isArray(campaignsList)) {
        campaignsList = [];
      }

      // Filter campaigns created by current user
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;

      const userCampaigns = campaignsList.filter(
        (campaign: Campaign) => campaign.created_by.id === userId
      );

      setCampaigns(userCampaigns);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  const fetchMilestones = async (campaignId: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/campaigns/${campaignId}/milestones/`
      );

      setMilestones(response.data.data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setMilestones([]);
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    fetchMilestones(campaign.id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) return;
    if (!formData.title || !formData.description || !formData.due_date) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreatingMilestone(true);

    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('due_date', new Date(formData.due_date).toISOString());

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/campaigns/${selectedCampaign.id}/milestones/`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Add new milestone to the list
      setMilestones([...milestones, response.data.data]);

      // Reset form
      setFormData({
        title: '',
        description: '',
        due_date: '',
        image: null,
      });

      setShowAddMilestone(false);
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Failed to create milestone');
    } finally {
      setIsCreatingMilestone(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    if (!selectedCampaign) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `http://127.0.0.1:8000/api/campaigns/${selectedCampaign.id}/milestones/${milestoneId}/complete/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update milestone in list
      const updatedMilestones = milestones.map((m) =>
        m.id === milestoneId ? response.data.data : m
      );
      setMilestones(updatedMilestones);
    } catch (error) {
      console.error('Error completing milestone:', error);
      alert('Failed to complete milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!selectedCampaign) return;
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `http://127.0.0.1:8000/api/campaigns/${selectedCampaign.id}/milestones/${milestoneId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMilestones(milestones.filter((m) => m.id !== milestoneId));
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your campaigns..." />;
  }

  if (campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Campaigns Yet</h2>
          <p className="text-gray-600 mb-6">Create a campaign to start managing milestones.</p>
          <button
            onClick={() => router.push('/campaigns/create')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/my-campaigns')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Milestone Manager</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Campaign List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Campaigns</h2>
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedCampaign?.id === campaign.id
                        ? 'bg-blue-100 border-2 border-blue-600 text-blue-900'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'
                    }`}
                  >
                    <p className="font-semibold text-sm">{campaign.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{Number(campaign.raised_amount).toLocaleString('en-IN')} / ₹{Number(campaign.goal_amount).toLocaleString('en-IN')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Milestones Section */}
          <div className="lg:col-span-3">
            {selectedCampaign ? (
              <div className="space-y-6">
                {/* Campaign Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCampaign.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedCampaign.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Goal Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{Number(selectedCampaign.goal_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Raised</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{Number(selectedCampaign.raised_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Milestone Button */}
                <button
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Milestone
                </button>

                {/* Add Milestone Form */}
                {showAddMilestone && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Milestone</h3>
                    <form onSubmit={handleAddMilestone} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Phase 1 Complete"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe what this milestone accomplishes"
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input
                          type="datetime-local"
                          value={formData.due_date}
                          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-input"
                          />
                          <label htmlFor="image-input" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {formData.image ? formData.image.name : 'Click to upload image'}
                            </p>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddMilestone(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingMilestone}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {isCreatingMilestone ? 'Creating...' : 'Create Milestone'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Milestones List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Milestones</h3>
                  {milestones.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No milestones yet. Create one to get started!</p>
                  ) : (
                    milestones.map((milestone, index) => (
                      <div key={milestone.id} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                                {index + 1}
                              </span>
                              <h4 className="text-lg font-bold text-gray-900">{milestone.title}</h4>
                            </div>
                            {milestone.is_completed && (
                              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                <Check className="w-4 h-4 inline mr-1" /> Completed
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!milestone.is_completed && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedMilestoneForUpload(milestone);
                                    setUploadModalOpen(true);
                                  }}
                                  className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition"
                                  title="Upload progress image"
                                >
                                  <Upload className="w-5 h-5" />
                                </button>
                            <button
                              onClick={() => {
                                setSelectedMilestoneForComplete(milestone);
                                setCompleteModalOpen(true);
                              }}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition"
                              title="Mark as completed with image"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4">{milestone.description}</p>

                        {milestone.image && (
                          <div className="mb-4">
                            <img
                              src={milestone.image}
                              alt={milestone.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <span className="text-xs text-gray-500 block">Due Date</span>
                              <span className="text-sm font-semibold text-gray-900">
                                {new Date(milestone.due_date).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          {!milestone.is_completed && (
                            <div
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                                milestone.is_overdue 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {milestone.is_overdue ? (
                                <>
                                  <AlertCircle className="w-5 h-5" /> 
                                  <span>Overdue - Upload Now!</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-5 h-5" />
                                  <span>{milestone.days_until_due} days left</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">Select a campaign to manage its milestones</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Milestone Upload Modal */}
      {selectedCampaign && selectedMilestoneForUpload && (
        <MilestoneUploadModal
          milestoneId={selectedMilestoneForUpload.id}
          campaignId={selectedCampaign.id}
          milestoneName={selectedMilestoneForUpload.title}
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedMilestoneForUpload(null);
          }}
          onSuccess={() => {
            fetchMilestones(selectedCampaign.id);
          }}
        />
      )}

      {/* Milestone Complete Modal */}
      {selectedCampaign && selectedMilestoneForComplete && (
        <MilestoneCompleteModal
          campaignId={selectedCampaign.id}
          milestoneId={selectedMilestoneForComplete.id}
          milestoneTitle={selectedMilestoneForComplete.title}
          isOpen={completeModalOpen}
          onClose={() => {
            setCompleteModalOpen(false);
            setSelectedMilestoneForComplete(null);
          }}
          onSuccess={() => {
            fetchMilestones(selectedCampaign.id);
          }}
        />
      )}
    </div>
  );
};

export default FundraiserDashboard;
