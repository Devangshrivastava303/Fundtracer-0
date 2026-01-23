"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Info,
  Heart,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Campaign {
  id: string;
  title: string;
  image?: string | null;
  goal_amount: number;
  raised_amount: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  phone_number?: string;
}

const PRESET_AMOUNTS = [300, 1000, 3000];
const PLATFORM_FEE = 0;

export default function DonatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Campaign state
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);

  // Donation form state
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [tip, setTip] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);

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

  // Check if user is logged in
  useEffect(() => {
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
    setAuthLoading(false);
  }, []);

  // Fetch campaign details
  useEffect(() => {
    if (id) {
      axios
        .get(`http://127.0.0.1:8000/api/campaigns/${id}/`)
        .then((response) => {
          const campaignData = response.data.data || response.data;
          setCampaign(campaignData);
          setCampaignLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching campaign:", error);
          setCampaignLoading(false);
        });
    }
  }, [id]);

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
      const donationData = {
        campaign: id,
        amount: finalAmount,
        donor_name: isAnonymous ? "Anonymous" : fullName || user?.first_name,
        donor_email: email,
        donor_phone: phone,
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
        // Redirect to success page or back to campaign
        router.push(`/campaigns/${id}?donation_success=true`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Donation failed. Please try again."
      );
    }
  };

  if (authLoading || campaignLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center flex-1">
            <p className="text-sm text-muted-foreground">Currency</p>
            <p className="font-semibold">INR (₹)</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Campaign Context */}
        {campaign && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Support {campaign.title}
            </h1>
            <p className="text-muted-foreground">
              Choose how much you'd like to contribute
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Amount Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Choose an amount</h2>
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
              Enter Amount
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

        {/* Fee Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
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
                  className="w-full px-4 py-2 bg-muted rounded-lg text-sm font-medium text-foreground hover:bg-muted/80 transition-colors flex items-center justify-between"
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

        {/* User Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Details</h2>

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
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-foreground font-medium mt-1">
                  {user?.phone_number || "Not provided"}
                </p>
              </div>
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
                <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
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

        {/* CTA Button */}
        <div className="mb-8">
          <Button
            onClick={isLoggedIn ? handleDonate : handleSignupAndDonate}
            disabled={isLoading || finalAmount <= 0}
            className="w-full h-14 text-lg font-semibold"
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            {isLoggedIn ? "Proceed to Payment" : "Create Account & Donate"} - ₹
            {finalAmount}
          </Button>
        </div>

        {/* Footer */}
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
      </div>
    </div>
  );
}
