"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Info,
  Check,
  Loader2,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  phone_number?: string;
}

interface DonationModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [300, 1000, 3000];
const PLATFORM_FEE = 0;

export function DonationModal({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}: DonationModalProps) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Donation form state
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [tip, setTip] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // User details (for non-logged-in users)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTipDropdown, setShowTipDropdown] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!isOpen) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        setEmail(parsedUser.email);
        setFullName(parsedUser.first_name || "");
        setPhone(parsedUser.phone_number || "");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, [isOpen]);

  // Calculate final amount
  const finalAmount = isCustomAmount
    ? (parseInt(customAmount) || 0) + tip
    : selectedAmount + tip;

  // Handle tip selection
  const handleTipSelect = (percentage: number) => {
    setTipPercentage(percentage);
    const baseAmount = isCustomAmount ? parseInt(customAmount) || 0 : selectedAmount;
    const tipAmount = Math.round((baseAmount * percentage) / 100);
    setTip(tipAmount);
    setShowTipDropdown(false);
  };

  // Handle signup and donate (for non-logged-in users)
  const handleSignupAndDonate = async () => {
    if (!fullName || !email || !phone) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isAnonymous && (password !== passwordConfirm || password.length < 6)) {
      setError("Passwords must match and be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First signup
      const signupRes = await axios.post(
        "http://127.0.0.1:8000/api/auth/signup/",
        {
          full_name: fullName,
          email,
          phone_number: phone,
          password: isAnonymous ? "AnonymousDonor@123" : password,
          password_confirm: isAnonymous ? "AnonymousDonor@123" : passwordConfirm,
          role: "donor",
        }
      );

      if (signupRes.status === 201 || signupRes.status === 200) {
        // Save user data
        localStorage.setItem("user", JSON.stringify(signupRes.data.user));
        localStorage.setItem("access_token", signupRes.data.access_token);
        localStorage.setItem("refresh_token", signupRes.data.refresh_token);

        // Then process donation
        await processDonation(signupRes.data.user.id);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.errors?.detail ||
          err.response?.data?.error ||
          "Signup failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle donation (for logged-in users)
  const handleDonate = async () => {
    if (finalAmount <= 0) {
      setError("Please select a valid amount");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await processDonation(user?.id);
    } catch (err) {
      console.error("Donation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Process donation API call
  const processDonation = async (userId?: number) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // Prepare donation data according to backend API
      const donationData = {
        campaign: campaign.id,
        amount: finalAmount,
        payment_method: paymentMethod,
        message: "", // Optional message
        is_anonymous: isAnonymous,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/donations/",
        donationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        // Success
        setError("");
        setIsSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Donation failed. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Support {campaign.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how much you'd like to contribute
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success Message */}
          {isSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Success!</p>
                <p className="text-sm text-green-700">
                  Your donation of ₹{finalAmount} has been created successfully.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isSuccess && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Amount Selection */}
          {!isSuccess && (
            <>
            <div>
            <h3 className="text-lg font-semibold mb-4">Choose an amount</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setIsCustomAmount(false);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "p-4 rounded-xl font-semibold text-lg transition-all duration-200",
                    isCustomAmount || selectedAmount !== amount
                      ? "bg-muted text-foreground border-2 border-transparent hover:border-border"
                      : "bg-primary text-primary-foreground border-2 border-primary"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    {selectedAmount === amount && !isCustomAmount && (
                      <Check className="h-5 w-5" />
                    )}
                    ₹{amount}
                  </div>
                </button>
              ))}
            </div>

            {/* Other Amount */}
            <div>
              <button
                onClick={() => setIsCustomAmount(true)}
                className={cn(
                  "w-full p-4 rounded-xl font-semibold transition-all duration-200 border-2",
                  isCustomAmount
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-foreground border-transparent hover:border-border"
                )}
              >
                Other Amount
              </button>

              {isCustomAmount && (
                <div className="mt-4">
                  <Input
                    type="number"
                    placeholder="Enter amount (₹)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full text-lg p-4 h-auto"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
          </>
          )}

          {/* Fee Info Card */}
          {!isSuccess && (
          <div className="bg-muted rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {PLATFORM_FEE}% Platform Fee
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  100% of your contribution goes directly to the campaign
                </p>

                {/* Tip Selection */}
                <div className="relative">
                  <button
                    onClick={() => setShowTipDropdown(!showTipDropdown)}
                    className="w-full px-4 py-2 bg-card rounded-lg text-sm font-medium text-foreground hover:bg-card/80 transition-colors flex items-center justify-between border border-border"
                  >
                    <span>
                      {tipPercentage > 0
                        ? `Add ${tipPercentage}% tip (₹${tip})`
                        : "Add optional tip"}
                    </span>
                    <span className="text-xs">▼</span>
                  </button>

                  {showTipDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 py-1">
                      {[0, 5, 10, 15].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => handleTipSelect(percentage)}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm transition-colors",
                            tipPercentage === percentage
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted"
                          )}
                        >
                          {percentage === 0
                            ? "No tip"
                            : `${percentage}% (₹${Math.round(
                                ((isCustomAmount ? parseInt(customAmount) || 0 : selectedAmount) *
                                  percentage) /
                                  100
                              )})`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Payment Method */}
          {!isSuccess && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {["card", "upi", "netbanking"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "p-3 rounded-lg font-medium text-sm transition-all duration-200 border-2 capitalize",
                    paymentMethod === method
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-foreground border-transparent hover:border-border"
                  )}
                >
                  {method === "upi" ? "UPI" : method === "netbanking" ? "Net Banking" : "Card"}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* User Details */}
          {!isSuccess && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Details</h3>

            {isLoggedIn ? (
              // Logged-in user - read-only display
              <div className="space-y-4 bg-muted rounded-lg p-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-foreground font-medium mt-1">
                    {user?.first_name || "User"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-foreground font-medium mt-1">{user?.email}</p>
                </div>
                {user?.phone_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {user?.phone_number}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Non-logged-in user - signup form
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-4 py-3 bg-muted rounded-lg border border-border">
                      <span className="text-sm font-medium">🇮🇳 +91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium cursor-pointer"
                  >
                    I want to donate anonymously
                  </label>
                </div>

                {/* Password Fields (if not anonymous) */}
                {!isAnonymous && (
                  <>
                    {/* Password */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Password *
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Confirm Password *
                      </label>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          )}

          {/* Footer */}
          {!isSuccess && (
            <div className="text-center text-xs text-muted-foreground">
              <p>
                By proceeding, you agree to our{" "}
                <button className="text-primary hover:underline">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button className="text-primary hover:underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
          {!isSuccess && (
          <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={isLoggedIn ? handleDonate : handleSignupAndDonate}
            disabled={isLoading || finalAmount <= 0}
            className="flex-1"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            {isLoggedIn ? "Proceed" : "Create & Donate"} - ₹{finalAmount}
          </Button>
          </>
          )}
          {isSuccess && (
          <Button
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
          )}
        </div>
      </div>
    </div>
  );
}
