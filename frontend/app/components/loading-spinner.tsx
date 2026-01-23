"use client";

import React from 'react';
import { Heart, DollarSign, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingSpinner({ fullScreen = false, message = 'Loading...' }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Animated circle background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-10 animate-pulse"></div>
            
            {/* Animated coins */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* Center coin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg flex items-center justify-center animate-bounce bounce-animation">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Orbiting coins */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full shadow-md flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-red-300 to-red-500 rounded-full shadow-md flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
          <p className="text-gray-600">Connecting to help those in need...</p>

          {/* Progress bar animation */}
          <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Non-fullscreen version
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-4">
        {/* Animated circle background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-10 animate-pulse"></div>
        
        {/* Animated coins */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-16 h-16">
            {/* Center coin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '1.5s' }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Orbiting coins */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-green-300 to-green-500 rounded-full shadow-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full shadow-md flex items-center justify-center">
                <Heart className="w-3 h-3 text-white" />
              </div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-red-300 to-red-500 rounded-full shadow-md flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}
