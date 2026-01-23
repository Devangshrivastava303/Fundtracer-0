"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_amount: "",
    category_id: "",
    campaign_type: "INDIVIDUAL",
    is_active: true,
    image: null as File | null,
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");

    if (!userData || !accessToken) {
      router.push("/auth");
      return;
    }
    setIsLoggedIn(true);

    // Fetch categories
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/campaigns/categories/");
        const data = await res.json();
        if (res.ok) {
          setCategories(data.data || data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    
    // Handle file input separately
    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: fileInput.files ? fileInput.files[0] : null,
      }));
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    // Validate form
    if (!formData.title || !formData.description || !formData.goal_amount || !formData.category_id) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setError("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      // Use FormData for file upload
      const formDataMultipart = new FormData();
      formDataMultipart.append("title", formData.title);
      formDataMultipart.append("description", formData.description);
      formDataMultipart.append("goal_amount", parseFloat(formData.goal_amount).toString());
      formDataMultipart.append("category_id", parseInt(formData.category_id).toString());
      formDataMultipart.append("campaign_type", formData.campaign_type);
      formDataMultipart.append("is_active", formData.is_active.toString());
      
      // Add image if provided
      if (formData.image) {
        formDataMultipart.append("image", formData.image);
      }

      console.log("Sending payload with image");

      const res = await fetch("http://127.0.0.1:8000/api/campaigns/create/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formDataMultipart,
      });

      const data = await res.json();
      console.log("Response:", { status: res.status, data });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          goal_amount: "",
          category_id: "",
          campaign_type: "INDIVIDUAL",
          is_active: true,
          image: null,
        });
        // Redirect to campaigns page after 2 seconds
        setTimeout(() => {
          router.push("/campaigns");
        }, 2000);
      } else {
        const errorMsg = data.errors ? JSON.stringify(data.errors) : data.error || "Failed to create campaign";
        setError(errorMsg);
        console.error("Error response:", errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network error. Please try again later.";
      setError(errorMsg);
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <Header />

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-semibold">Back</span>
            </button>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Start a <span className="text-blue-600">Fundraiser</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Create a campaign to raise funds for your cause. Be transparent and track every contribution.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-8 md:p-12">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Success!</p>
                  <p className="text-sm text-green-700">
                    Your campaign has been created. Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Help John with Medical Treatment"
                  className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-[18px] focus:bg-white focus:ring-2 ring-blue-500/30 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Tell your story. Explain why you're raising funds and how it will be used."
                  rows={5}
                  className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-[18px] focus:bg-white focus:ring-2 ring-blue-500/30 outline-none text-slate-900 placeholder:text-slate-400 transition-all resize-none"
                />
              </div>

              {/* Goal Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Goal Amount (₹) *
                </label>
                <input
                  type="number"
                  name="goal_amount"
                  value={formData.goal_amount}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 50000"
                  min="1"
                  step="0.01"
                  className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-[18px] focus:bg-white focus:ring-2 ring-blue-500/30 outline-none text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Category *
                </label>
                {isLoadingCategories ? (
                  <div className="flex items-center gap-2 px-5 py-3.5 text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    aria-label="Select a category"
                    className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-[18px] focus:bg-white focus:ring-2 ring-blue-500/30 outline-none text-slate-900 transition-all cursor-pointer"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Campaign Image (Optional) */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Campaign Image (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    title="Upload a campaign image"
                    className="w-full px-5 py-3.5 bg-white/60 border border-white/40 rounded-[18px] focus:bg-white focus:ring-2 ring-blue-500/30 outline-none text-slate-900 placeholder:text-slate-400 transition-all cursor-pointer file:cursor-pointer file:border-0 file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:rounded-lg file:font-semibold"
                  />
                  {formData.image && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Image selected: {formData.image.name}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Note: Future AWS S3 integration will handle image storage automatically
                </p>
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Campaign Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "INDIVIDUAL", label: "Individual" },
                    { value: "NGO", label: "NGO" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, campaign_type: type.value })
                      }
                      className={`py-3 rounded-[18px] font-semibold transition-all ${
                        formData.campaign_type === type.value
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-white/60 border border-white/40 text-slate-900 hover:bg-white/80"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg border-2 border-blue-500 text-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  Activate campaign immediately
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-[25px] shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Campaign...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50/80 border border-blue-200 rounded-[25px] p-6 md:p-8">
            <h3 className="font-bold text-slate-900 mb-3">Tips for Success:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Use a clear, compelling title that explains your cause
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Write a detailed description with context and impact
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Set a realistic goal amount that you actually need
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                Choose the most relevant category for better visibility
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
