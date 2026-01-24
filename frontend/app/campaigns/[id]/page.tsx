"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Share2, Heart, Users, Calendar, Target, TrendingUp, Mail, Phone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/loading-spinner';
import { DonationModal } from '@/components/donation-modal';
import { DonationCompletion } from '@/components/donation-completion';
import { MilestoneViewer } from '@/components/milestone-viewer';
import { MilestoneSetup } from '@/components/milestone-setup';

// Progress Bar Component
const ProgressBar = ({ percentage }: { percentage: number }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(Math.min(percentage, 100));
  }, [percentage]);

  const getWidthClass = () => {
    if (width <= 0) return 'w-0';
    if (width <= 10) return 'w-1/12';
    if (width <= 20) return 'w-1/6';
    if (width <= 25) return 'w-1/4';
    if (width <= 33) return 'w-1/3';
    if (width <= 50) return 'w-1/2';
    if (width <= 66) return 'w-2/3';
    if (width <= 75) return 'w-3/4';
    if (width <= 90) return 'w-11/12';
    return 'w-full';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
      <div
        className={`bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ${getWidthClass()}`}
      ></div>
    </div>
  );
};

// Define TypeScript interfaces for campaign data
interface Campaign {
  id: string;
  image?: string | null;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
  raised_amount: number;
  goal_amount: number;
  progress_percentage: number;
  fundtracer_verified: boolean;
  documents_verified: boolean;
  documents?: Document[];
  is_active: boolean;
  campaign_type: string;
  created_by: {
    id: number;
    email: string;
    first_name: string;
    full_name?: string;
    phone_number?: string;
  };
  donation_count: number;
  goal_reached: boolean;
  created_at: string;
  is_liked?: boolean;
  likes_count?: number;
}

interface Document {
  id: string;
  document_type: string;
  file: string;
  uploaded_at: string;
  verified: boolean;
  notes?: string;
}

interface NGO {
  name: string;
  is_verified: boolean;
}

interface Donation {
  donor: string;
  amount: number;
}

interface RecentDonation {
  id: string;
  donor: {
    id: number;
    full_name: string;
    email: string;
  };
  amount: string | number;
  message?: string;
  created_at: string;
  is_anonymous: boolean;
}

interface ApiResponse {
  message: string;
  data: Campaign;
}

const CampaignDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  // Check if expandDescription param is in URL
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const shouldExpandDescription = searchParams?.get('expandDescription') === 'true';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [showDescriptionExpanded, setShowDescriptionExpanded] = useState(shouldExpandDescription || false);
  const [isCreator, setIsCreator] = useState(false);
  const [milestonesRefreshTrigger, setMilestonesRefreshTrigger] = useState(0);
  const [isDonor, setIsDonor] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`http://127.0.0.1:8000/api/campaigns/${id}/`)
        .then((response) => {
          // Extract the campaign data from the API response
          const campaignData = response.data.data || response.data;
          
          // Debug: Log the campaign data to see goal_reached status
          console.log('Campaign Data:', {
            id: campaignData.id,
            title: campaignData.title,
            goal_reached: campaignData.goal_reached,
            goal_amount: campaignData.goal_amount,
            raised_amount: campaignData.raised_amount,
            created_by_id: campaignData.created_by.id,
            created_by_name: campaignData.created_by.first_name,
            documents: campaignData.documents,
            documents_verified: campaignData.documents_verified,
            is_liked: campaignData.is_liked,
            likes_count: campaignData.likes_count
          });
          
          setCampaign(campaignData);
          setIsLiked(campaignData.is_liked || false);
          setLikesCount(campaignData.likes_count || 0);
          
          // Check if current user is the creator
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (campaignData.created_by.id === user.id) {
              setIsCreator(true);
              console.log('User is the creator of this campaign');
            }
            
            // Check if current user is a donor by looking at donations list
            if (recentDonations.length > 0) {
              // If user has already donated, set isDonor
              const userHasDonated = recentDonations.some(
                (donation) => donation.donor?.id === user.id
              );
              if (userHasDonated) {
                setIsDonor(true);
                console.log('User is a donor of this campaign');
              }
            }
          }
          
          setLoading(false);
          
          // Fetch donations for this campaign
          fetchCampaignDonations(Array.isArray(id) ? id[0] : id);
        })
        .catch((error) => {
          console.error('Error fetching campaign details:', error);
          setLoading(false);
        });
    }
  }, [id]);

  const fetchCampaignDonations = async (campaignId: string) => {
    setDonationsLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/campaigns/${campaignId}/donations/`
      );
      
      console.log("Campaign donations response:", response.data);
      
      // Handle DRF paginated response
      let donationsList: RecentDonation[] = [];
      if (response.data.results && Array.isArray(response.data.results)) {
        donationsList = response.data.results;
      } else if (Array.isArray(response.data)) {
        donationsList = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        donationsList = response.data.data;
      }
      
      setRecentDonations(donationsList.slice(0, 5)); // Show only 5 recent donations
      
      // Check if current user is a donor
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userHasDonated = donationsList.some(
          (donation) => donation.donor?.id === user.id
        );
        setIsDonor(userHasDonated);
        if (userHasDonated) {
          console.log('User is a donor of this campaign');
        }
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setRecentDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  }

  const toggleLike = async () => {
    // Check if user is authenticated
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (!userStr || !token) {
      alert('Please login to add campaigns to your wishlist');
      router.push('/auth');
      return;
    }

    if (!campaign) return;

    setIsTogglingLike(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/campaigns/${campaign.id}/like/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsLiked(response.data.is_liked);
      setLikesCount(response.data.likes_count);
      
      console.log('Like toggled successfully:', response.data);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update wishlist');
    } finally {
      setIsTogglingLike(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading campaign details..." />;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-red-500 opacity-10 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">!</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = campaign && campaign.goal_amount > 0 
    ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/campaigns')}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Add to favorites">
              <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Share campaign">
              <Share2 className="w-5 h-5 text-gray-600 hover:text-blue-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image Section */}
      <div className="relative h-96 overflow-hidden bg-gray-200">
        {campaign?.image ? (
          <img
            src={campaign.image}
            alt={campaign.title || 'Campaign'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-gray-600 text-lg">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-32 relative z-10 pb-16">
          {/* Left Column - Campaign Info */}
          <div className="lg:col-span-2">
            {/* Campaign Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                      {campaign?.category?.name || 'Campaign'}
                    </span>
                    {campaign?.fundtracer_verified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                        <span>✓</span> Verified
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${
                      campaign?.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span>{campaign?.is_active ? '●' : '●'}</span>
                      {campaign?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {campaign?.title || 'Untitled Campaign'}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-semibold">By</span>
                    <span className="text-blue-600 font-medium">{campaign?.created_by?.full_name || campaign?.created_by?.first_name || 'Unknown'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign?.donation_count || 0}</div>
                  <p className="text-sm text-gray-600 mt-1">Donors</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{progressPercentage}%</div>
                  <p className="text-sm text-gray-600 mt-1">Funded</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{campaign?.campaign_type || 'N/A'}</div>
                  <p className="text-sm text-gray-600 mt-1">Type</p>
                </div>
              </div>

              {/* Debug Info - Goal Reached Status */}
              {isCreator && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium">
                    Goal Reached Status: <span className="font-bold">{campaign?.goal_reached ? '✓ YES - Milestone setup available' : '✗ NO - Need ₹' + (campaign ? (campaign.goal_amount - campaign.raised_amount).toLocaleString() : 0) + ' more'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* About Section */}
            {!isCreator && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  To, Verify NGO Details & Information Yourself Visit:
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  <a href="https://mplads.gov.in/ngo_darpan/GetNgoDetails.aspx" className="text-blue-600 hover:underline">https://mplads.gov.in/ngo_darpan/GetNgoDetails.aspx</a>
                </p>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                About This Campaign
              </h2>
              {showDescriptionExpanded ? (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {campaign?.description || 'No description available'}
                </p>
              ) : (
                <div 
                  className="cursor-pointer group"
                  onMouseEnter={() => setShowDescriptionExpanded(true)}
                  onMouseLeave={() => setShowDescriptionExpanded(false)}
                >
                  <div className="overflow-hidden transition-all duration-500">
                    <p className="text-gray-700 text-lg leading-relaxed group-hover:text-blue-600 transition-colors line-clamp-4">
                      {campaign?.description || 'No description available'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 group-hover:text-blue-600 transition-colors">
                    Hover to read more...
                  </p>
                </div>
              )}
            </div>

            {/* Campaign Documents Section */}
            {campaign?.documents && campaign.documents.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  Campaign Documents
                  {campaign.documents_verified && (
                    <span className="ml-auto inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      <span>✓</span> Verified
                    </span>
                  )}
                </h2>
                <div className="space-y-4">
                  {campaign.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-3xl">📁</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {doc.document_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                          {doc.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">
                              Note: {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.verified && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <span>✓</span> Verified
                          </span>
                        )}
                        <a
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Donors Section */}
            {recentDonations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Recent Donors
                </h2>
                <div className="space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {donation.is_anonymous ? 'Anonymous Donor' : donation.donor.full_name}
                        </p>
                        {donation.message && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{donation.message}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-blue-600">
                          ₹{parseFloat(String(donation.amount)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones Section */}
            {campaign && (
              <MilestoneViewer 
                campaignId={campaign.id} 
                campaignTitle={campaign.title}
                refreshTrigger={milestonesRefreshTrigger}
                isDonor={isDonor}
              />
            )}

            {/* Contact Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contact Creator</h3>
              </div>
              
              <div className="space-y-4">
                {/* Creator Name */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Campaign Creator</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {campaign?.created_by?.full_name || campaign?.created_by?.first_name || 'Unknown'}
                  </p>
                </div>

                {/* Email */}
                <a 
                  href={`mailto:${campaign?.created_by?.email}`}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition group"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-blue-600 truncate hover:text-blue-700">
                      {campaign?.created_by?.email}
                    </p>
                  </div>
                </a>

                {/* Phone */}
                {campaign?.created_by?.phone_number && (
                  <a 
                    href={`tel:${campaign?.created_by?.phone_number}`}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition group"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {campaign?.created_by?.phone_number}
                      </p>
                    </div>
                  </a>
                )}

                {!campaign?.created_by?.phone_number && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm text-gray-500">Not provided</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Button */}
              <button className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition border border-blue-200">
                Send Message
              </button>
            </div>
          </div>

          {/* Right Column - Donation Card or Completion Card */}
          <div className="lg:col-span-1">
            {campaign?.goal_reached ? (
              <>
                {isCreator && (
                  <MilestoneSetup 
                    campaignId={campaign.id}
                    campaignTitle={campaign.title}
                    isCreator={isCreator}
                    onSuccess={() => {
                      // Trigger MilestoneViewer to refresh
                      setMilestonesRefreshTrigger(prev => prev + 1);
                    }}
                  />
                )}
                <DonationCompletion
                  campaignTitle={campaign.title}
                  goalAmount={campaign.goal_amount}
                  raisedAmount={campaign.raised_amount}
                  donorCount={campaign.donation_count}
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
                {/* Funding Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount Raised</p>
                      <p className="text-4xl font-bold text-gray-900">
                        ₹{(campaign?.raised_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <ProgressBar percentage={progressPercentage} />

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      of ₹{(campaign?.goal_amount || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm font-bold text-blue-600">{progressPercentage}%</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-8 py-6 border-t border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Campaign Type</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {campaign?.campaign_type?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Donors</span>
                    <span className="font-semibold text-gray-900">{campaign?.donation_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Remaining</span>
                    <span className="font-semibold text-gray-900">
                      ₹{Math.max(0, (campaign?.goal_amount || 0) - (campaign?.raised_amount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button 
                  onClick={() => {
                    if (isCreator) {
                      alert("You own this campaign — you cannot donate to it.");
                      return;
                    }
                    setIsDonationModalOpen(true);
                  }}
                  className={isCreator ? "w-full bg-gray-200 text-gray-600 font-bold py-4 rounded-xl mb-3 cursor-not-allowed" : "w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 rounded-xl hover:shadow-lg transition transform hover:scale-105 duration-200 mb-3"}
                  disabled={isCreator}
                  title={isCreator ? "You own this campaign — you cannot donate to it." : "Donate to this campaign"}
                >
                  {isCreator ? "Creators cannot donate" : "Donate Now"}
                </button>

                {/* Wishlist and Share Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={toggleLike}
                    disabled={isTogglingLike}
                    className="flex-1 border-2 border-red-300 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart 
                      size={20} 
                      fill={isLiked ? "currentColor" : "none"}
                      className={isLiked ? "text-red-600" : "text-red-400"}
                    />
                    <span className="text-sm">{likesCount}</span>
                  </button>
                  <button className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-2">
                    <Share2 size={20} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Spacing */}
      <div className="h-16"></div>

      {/* Donation Modal */}
      {campaign && (
        <DonationModal
          campaign={campaign}
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
          onSuccess={() => {
            // Optionally refresh campaign data
            setIsDonationModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CampaignDetailPage;