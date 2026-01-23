"use client";

import React from 'react';
import { CheckCircle2, Zap, Clock, Target } from 'lucide-react';

interface DonationCompletionProps {
  campaignTitle: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
}

export function DonationCompletion({
  campaignTitle,
  goalAmount,
  raisedAmount,
  donorCount,
}: DonationCompletionProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-8 sticky top-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <CheckCircle2 className="w-20 h-20 text-green-500 relative" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Funding Goal Achieved!</h2>
        <p className="text-gray-600 text-lg">This campaign has successfully reached its target.</p>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-600 mb-1">Goal Amount</p>
            <p className="text-2xl font-bold text-green-600">₹{goalAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-100">
            <p className="text-sm text-gray-600 mb-1">Amount Raised</p>
            <p className="text-2xl font-bold text-green-600">₹{raisedAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <p className="text-sm text-gray-600 mb-1">Total Supporters</p>
          <p className="text-2xl font-bold text-green-600">{donorCount} Donors</p>
        </div>
      </div>

      {/* Completion Status Card */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Waiting for Milestones</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Congratulations! The campaign has reached its funding goal. We are now preparing and verifying the milestones. 
              The campaign creator will work on achieving the project milestones with the funds received. You will receive 
              updates on the progress soon.
            </p>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="space-y-4 mb-8">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          What Happens Next
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-sm font-bold text-green-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Milestone Planning</p>
              <p className="text-sm text-gray-600">Campaign creator plans specific milestones to achieve with the funds</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-sm font-bold text-green-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Fund Distribution</p>
              <p className="text-sm text-gray-600">Funds are transferred to the campaign creator to begin work</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-sm font-bold text-green-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Progress Updates</p>
              <p className="text-sm text-gray-600">You'll receive regular updates on milestone achievements and progress</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <span className="text-sm font-bold text-green-600">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Campaign Completion</p>
              <p className="text-sm text-gray-600">Campaign concludes once all milestones are successfully achieved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">This campaign is now in milestone verification phase.</p>
            <p>No further donations can be accepted at this time. Thank you for your support!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
