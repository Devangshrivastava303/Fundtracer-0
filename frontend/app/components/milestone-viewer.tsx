"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, Calendar, TrendingUp, Lock } from 'lucide-react';

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

interface MilestoneViewerProps {
  campaignId: string;
  campaignTitle: string;
  refreshTrigger?: number;
  isDonor?: boolean;
}

export function MilestoneViewer({ 
  campaignId, 
  campaignTitle, 
  refreshTrigger = 0,
  isDonor = false 
}: MilestoneViewerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMilestones();
  }, [campaignId, refreshTrigger]);

  const fetchMilestones = async () => {
    try {
      console.log('Fetching milestones for campaign:', campaignId);
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/campaigns/${campaignId}/milestones/`
      );
      
      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setMilestones([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      console.log('Milestones response:', data);
      setMilestones(data.data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No milestones available yet</p>
        <p className="text-gray-500 text-sm mt-2">Check back later for campaign progress updates</p>
      </div>
    );
  }

  const completedCount = milestones.filter((m) => m.is_completed).length;
  const completionPercentage = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaign Milestones</h2>
        <p className="text-gray-600 mb-4">Track the progress of {campaignTitle}</p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedCount} of {milestones.length} milestones completed
          </p>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {/* Timeline Line */}
            {index !== milestones.length - 1 && (
              <div className="absolute left-6 top-20 w-1 h-16 bg-gray-200"></div>
            )}

            {/* Milestone Card */}
            <div className="flex gap-4">
              {/* Timeline Dot */}
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    milestone.is_completed
                      ? 'bg-green-500 shadow-lg'
                      : milestone.is_overdue
                      ? 'bg-red-500 shadow-lg'
                      : 'bg-blue-500 shadow-lg'
                  }`}
                >
                  {milestone.is_completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100 hover:border-blue-200 transition">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{milestone.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    </div>
                    {milestone.is_completed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : milestone.is_overdue ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex-shrink-0">
                        <AlertCircle className="w-4 h-4" /> Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex-shrink-0">
                        <Clock className="w-4 h-4" /> In Progress
                      </span>
                    )}
                  </div>

                  {/* Image - Blur if not a donor */}
                  {milestone.image && (
                    <div className="mb-4 rounded-lg overflow-hidden relative">
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className={`w-full h-64 object-cover hover:scale-105 transition-transform duration-300 ${
                          !isDonor ? 'blur-lg' : ''
                        }`}
                      />
                      {!isDonor && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/90 rounded-lg px-4 py-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-700" />
                            <span className="text-sm font-semibold text-gray-700">Visible to donors only</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dates and Status Info */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(milestone.due_date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {milestone.completed_at && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Completed On</p>
                          <p className="text-sm font-semibold text-green-700">
                            {new Date(milestone.completed_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {!milestone.is_completed && milestone.days_until_due !== undefined && (
                      <div
                        className={`flex items-center gap-2 ${
                          milestone.is_overdue ? 'text-red-600' : 'text-orange-600'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <div>
                          <p className="text-xs text-gray-500">Time Remaining</p>
                          <p className="text-sm font-semibold">
                            {milestone.is_overdue ? 'Overdue' : `${milestone.days_until_due} days left`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {completionPercentage === 100 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">All Milestones Completed!</h4>
              <p className="text-sm text-green-700">
                Thank you for supporting this campaign. All planned milestones have been successfully completed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
