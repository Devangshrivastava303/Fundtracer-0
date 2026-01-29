"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  Search, BadgeCheck, Shield, Users, Clock, ChevronDown, X, Filter,
  BookOpen, Heart, Baby, Dog, Utensils, Leaf, Building2, UserRound,
  AlertTriangle, Sparkles, TrendingUp, Globe, Zap, CheckCircle2
} from "lucide-react";

// Icon mapping for categories
const categoryIconMap: Record<string, any> = {
  "Education": BookOpen,
  "Medical": Heart,
  "Women & Girls": UserRound,
  "Children": Baby,
  "Animals": Dog,
  "Food & Hunger": Utensils,
  "Environment": Leaf,
  "Community Development": Building2,
  "Elder Care": UserRound,
  "Disaster Relief": AlertTriangle,
};

// Default categories data (will be overridden by API)
const defaultCategories = [
  { id: 1, name: "All Categories", icon: Sparkles },
  { id: 2, name: "Education", icon: BookOpen },
  { id: 3, name: "Medical", icon: Heart },
  { id: 4, name: "Women & Girls", icon: UserRound },
  { id: 5, name: "Children", icon: Baby },
  { id: 6, name: "Animals", icon: Dog },
  { id: 7, name: "Food & Hunger", icon: Utensils },
  { id: 8, name: "Environment", icon: Leaf },
  { id: 9, name: "Community Development", icon: Building2 },
  { id: 10, name: "Elder Care", icon: UserRound },
  { id: 11, name: "Disaster Relief", icon: AlertTriangle },
];

const sortOptions = [
  { id: "trending", name: "Trending" },
  { id: "most-funded", name: "Most Funded" },
  { id: "newly-added", name: "Newly Added" },
];

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string | null;
  goal_amount: number;
  raised_amount: number;
  progress_percentage: number;
  category: { id: number; name: string };
  campaign_type: string;
  is_active: boolean;
  fundtracer_verified: boolean;
  created_by: { id: number; email: string; first_name: string };
  donation_count: number;
  created_at: string;
}

function CampaignCardSkeleton({ index }: { index: number }) {
  return (
    <div 
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse delay-100" />
          <div className="h-4 bg-gray-100 rounded w-4/5 animate-pulse skeleton-text-3" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse skeleton-progress-1" />
          <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse skeleton-progress-2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse skeleton-button-1" />
          <div className="h-6 bg-gray-100 rounded w-20 animate-pulse skeleton-button-2" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1 animate-pulse skeleton-action-1" />
          <div className="h-10 bg-gray-100 rounded-lg flex-1 animate-pulse skeleton-action-2" />
        </div>
      </div>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  currentUserId: number | null;
}

function CampaignCardInteractive({ campaign: c, index: idx, currentUserId }: CampaignCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div
      key={c.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-500 animate-fade-in-up relative ${
        isHovering ? 'shadow-2xl scale-110 z-50 -translate-y-4' : ''
      }`}
      style={{ animationDelay: `${idx * 50}ms` }}
    >
      {/* Image Container - Slides up and disappears on hover */}
      {c.image ? (
        <div className={`relative overflow-hidden bg-gray-100 transition-all duration-500 ${isHovering ? 'h-0 -translate-y-full' : 'h-48'}`}>
          <img
            src={c.image}
            alt={c.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovering ? 'scale-125' : 'scale-100'}`}
          />
          {c.fundtracer_verified && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>
      ) : (
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-all duration-500 ${isHovering ? 'h-0 -translate-y-full' : 'h-48'}`}>
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📸</div>
            <p className="text-gray-500 text-sm font-medium">No image available</p>
          </div>
          {c.fundtracer_verified && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </div>
          )}
        </div>
      )}

      {/* Content Container */}
      <div className={`transition-all duration-500 ${isHovering ? 'bg-gradient-to-br from-blue-50 to-white' : ''} ${isHovering ? 'p-4' : 'p-6'}`}>
        <div className={`inline-block bg-blue-50 text-blue-700 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${isHovering ? 'py-0.5' : 'py-1'}`}>
          {c.category.name}
        </div>

        <h3 className={`font-bold text-gray-900 transition-all duration-300 line-clamp-2 mt-2 ${isHovering ? 'text-lg text-blue-600' : 'text-lg'}`}>
          {c.title}
        </h3>

        {/* Description - Slides down simultaneously with image going up */}
        <div className={`mt-3 space-y-2 overflow-hidden transition-all duration-500 ${
          isHovering 
            ? 'max-h-56 opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-full'
        }`}>
          <p className="text-xs text-gray-700 leading-relaxed">
            {c.description}
          </p>
          <button
            onClick={() => window.location.href = `/campaigns/${c.id}?expandDescription=true`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Read More →
          </button>
        </div>

        <div className={`space-y-2 transition-all duration-500 ${isHovering ? 'pt-2' : 'pt-4'} ${isHovering ? 'translate-y-2' : 'translate-y-0'}`}>
          <div className="relative h-2 bg-gray-100 rounded-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(c.progress_percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`font-semibold transition-all duration-300 ${isHovering ? 'text-sm text-blue-600' : 'text-base text-gray-900'}`}>
              {formatCurrency(c.raised_amount)} raised
            </span>
            <span className={`transition-all duration-300 ${isHovering ? 'text-blue-600 font-semibold text-sm' : 'text-gray-600'}`}>
              {c.progress_percentage}%
            </span>
          </div>
        </div>

        {isHovering && (
          <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 animate-fade-in transform transition-transform duration-500 translate-y-1">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{c.donation_count} donors</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Goal: {formatCurrency(c.goal_amount)}</span>
            </div>
          </div>
        )}

        {!isHovering && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-3 transform transition-transform duration-500 translate-y-0">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{c.donation_count} donors</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Goal: {formatCurrency(c.goal_amount)}</span>
            </div>
          </div>
        )}

        {/* Buttons - Smaller when hovering to save space */}
        <div className={`flex gap-2 transition-all transform duration-500 ${isHovering ? 'gap-2 mt-3' : 'gap-2 mt-4'} ${isHovering ? 'translate-y-2' : 'translate-y-0'}`}>
          <button
            onClick={() => window.location.href = `/campaigns/${c.id}`}
            className={`flex-1 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold hover:scale-105 duration-200 ${
              isHovering ? 'py-2 text-xs' : 'py-2.5 text-sm'
            }`}
          >
            View Details
          </button>
          <button
            onClick={() => {
              if (currentUserId !== null && c.created_by && c.created_by.id === currentUserId) {
                alert('You own this campaign — you cannot donate to it.');
                return;
              }
              window.location.href = `/campaigns/${c.id}/donate`;
            }}
            className={`flex-1 rounded-xl transition-all font-semibold hover:scale-105 duration-200 ${
              currentUserId !== null && c.created_by && c.created_by.id === currentUserId
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl'
            } ${isHovering ? 'py-2 text-xs' : 'py-2.5 text-sm'}`}
            disabled={currentUserId !== null && c.created_by && c.created_by.id === currentUserId}
            title={currentUserId !== null && c.created_by && c.created_by.id === currentUserId ? 'You own this campaign — you cannot donate to it.' : 'Donate to this campaign'}
          >
            {currentUserId !== null && c.created_by && c.created_by.id === currentUserId ? 'Creators cannot donate' : 'Donate Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsBrowser() {
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState(defaultCategories);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSort, setSelectedSort] = useState("newly-added");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr as string);
        if (user && user.id) setCurrentUserId(user.id);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/campaigns/categories/");
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          // Add icons to backend categories
          const categoriesWithIcons = data.data.map((cat: any) => ({
            ...cat,
            icon: categoryIconMap[cat.name] || Sparkles,
          }));
          setCategories(categoriesWithIcons);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        // Use default categories if API fails
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchCampaigns = useCallback(async (url?: string | null, reset = false) => {
    try {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);

      const base = "http://127.0.0.1:8000/api/campaigns/";
      let fetchUrl = url || base;

      if (!url) {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== null) {
          params.append("category", selectedCategory.toString());
        }
        if (searchQuery) params.append("search", searchQuery);
        params.append("page", "1");
        fetchUrl = `${base}?${params.toString()}`;
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      
      const data = await res.json();
      const campaignsData = (data && (data.data || (data.results && data.results.data) || data.results)) || [];

      if (reset) {
        setAllCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      } else {
        setAllCampaigns((prev) => [...prev, ...(Array.isArray(campaignsData) ? campaignsData : [])]);
      }

      const next = data && (data.next || (data.results && data.results.next));
      setNextUrl(next || null);
      setHasMore(Boolean(next));
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      setAllCampaigns([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, searchQuery]);

  const sortedCampaigns = useMemo(() => {
    return [...allCampaigns].sort((a, b) => {
        switch (selectedSort) {
          case "most-funded":
            return b.raised_amount - a.raised_amount;
          case "newly-added":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "trending":
          default:
            return b.donation_count - a.donation_count;
        }
    });
  }, [allCampaigns, selectedSort]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !nextUrl) return;
    try {
      setIsLoadingMore(true);
      await fetchCampaigns(nextUrl, false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextUrl, fetchCampaigns]);

  useEffect(() => {
    setAllCampaigns([]);
    setHasMore(true);
    setNextUrl(null);
    fetchCampaigns(undefined, true);
  }, [searchQuery, selectedCategory, fetchCampaigns]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSort("trending");
    setSearchQuery("");
  };

  const getCategoryName = () => {
    if (!selectedCategory) return "All Categories";
    return categories.find((c) => c.id === selectedCategory)?.name || "All Categories";
  };

  const getSortName = () => sortOptions.find((s) => s.id === selectedSort)?.name || "Trending";

  if (!isClient) return null;

  return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative">
        {/* Background Image for entire page - Cinematic hands holding coins */}
        <div 
          className="fixed inset-0 bg-cover-center bg-img-opacity pointer-events-none"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071')",
            zIndex: 0
          }}
        />
        <div className="relative z-10">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .delay-0 { animation-delay: 0s; }
        .delay-50 { animation-delay: 50ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-800 { animation-delay: 800ms; }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-1500 { animation-delay: 1500ms; }
        .delay-1800 { animation-delay: 1800ms; }
        .delay-2000 { animation-delay: 2000ms; }
        .delay-2200 { animation-delay: 2200ms; }
        .delay-2500 { animation-delay: 2500ms; }
        .float-4s { animation: float 4s ease-in-out infinite; }
        .float-4-5s { animation: float 4.5s ease-in-out infinite; }
        .float-4-8s { animation: float 4.8s ease-in-out infinite; }
        .float-5s { animation: float 5s ease-in-out infinite; }
        .float-5-2s { animation: float 5.2s ease-in-out infinite; }
        .float-5-5s { animation: float 5.5s ease-in-out infinite; }
        .float-5-8s { animation: float 5.8s ease-in-out infinite; }
        .float-4-2s { animation: float 4.2s ease-in-out infinite; }
        .group:hover .group-hover-scale {
          transform: scale(1.05);
        }
        .group:hover .group-hover-rotate {
          transform: rotate(12deg);
        }
        .group:hover .group-hover-translate {
          transform: translateY(-4px);
        }
        .skeleton-text-2 { animation-delay: 100ms; }
        .skeleton-text-3 { animation-delay: 200ms; }
        .skeleton-progress-1 { animation-delay: 300ms; }
        .skeleton-progress-2 { animation-delay: 400ms; }
        .skeleton-button-1 { animation-delay: 500ms; }
        .skeleton-button-2 { animation-delay: 600ms; }
        .skeleton-action-1 { animation-delay: 700ms; }
        .skeleton-action-2 { animation-delay: 800ms; }
        .bg-cover-center {
          background-size: cover;
          background-position: center;
        }
        .bg-img-opacity {
          opacity: 0.05;
        }
      `}</style>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-teal-600 via-blue-700 to-indigo-900 border-b border-blue-400/20 overflow-hidden">
        {/* Background Image with Low Opacity - Cinematic hands holding coins */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071')",
          }}
        />
        
        {/* Overlay gradient for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-blue-900/30 to-indigo-900/40" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Particles - scattered across the banner */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-white/30 rounded-full animate-float float-4s delay-0" />
          <div className="absolute top-40 left-1/4 w-2 h-2 bg-blue-200/40 rounded-full animate-float float-5s delay-1000" />
          <div className="absolute top-60 right-1/4 w-3 h-3 bg-teal-200/35 rounded-full animate-float delay-2000" />
          <div className="absolute bottom-40 right-20 w-2 h-2 bg-white/25 rounded-full animate-float float-4-5s delay-500" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300/40 rounded-full animate-float float-5-5s delay-1500" />
          <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-teal-100/30 rounded-full animate-float float-4s delay-2500" />
          <div className="absolute top-32 right-16 w-2 h-2 bg-white/35 rounded-full animate-float float-5-2s delay-800" />
          <div className="absolute bottom-32 left-16 w-2 h-2 bg-blue-100/40 rounded-full animate-float float-4-8s delay-1800" />
          <div className="absolute top-16 left-1/2 w-2 h-2 bg-teal-200/30 rounded-full animate-float float-5-8s delay-300" />
          <div className="absolute bottom-16 right-1/2 w-3 h-3 bg-white/20 rounded-full animate-float float-4-2s delay-2200" />
          
          {/* Pulsing Circular Gradients - subtle and atmospheric */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-teal-400/15 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-blue-500/15 rounded-full blur-3xl animate-pulse-glow delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-teal-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse-glow delay-500" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-500/15 to-indigo-400/10 rounded-full blur-3xl animate-pulse-glow delay-1500" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-teal-400/15 to-blue-500/12 rounded-full blur-3xl animate-pulse-glow delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span>Trusted by 10,000+ donors</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
                Make a Real
                <br />
                <span className="text-white/90">Difference Today</span>
              </h1>
              
              <p className="text-2xl text-white/90 leading-relaxed animate-fade-in-up delay-200">
                Discover transparent, verified campaigns you can trust. Every donation creates lasting impact.
              </p>

              <div className="grid grid-cols-3 gap-8 pt-6 animate-fade-in-up delay-300">
                <div className="space-y-1">
                  <div className="text-4xl font-bold">500+</div>
                  <div className="text-sm text-white/80">Active Campaigns</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold">₹50L+</div>
                  <div className="text-sm text-white/80">Funds Raised</div>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold">10K+</div>
                  <div className="text-sm text-white/80">Happy Donors</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 self-center">
              {[
                { icon: Shield, title: "100% Verified", desc: "Every campaign is thoroughly verified by our team", delay: 0 },
                { icon: TrendingUp, title: "Track Impact", desc: "Real-time updates on how your donation helps", delay: 100 },
                { icon: Zap, title: "Instant Support", desc: "Your contribution reaches beneficiaries quickly", delay: 200 },
                { icon: Globe, title: "Global Reach", desc: "Support causes across India and beyond", delay: 300 }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-4 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${item.delay}ms` }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover-rotate">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-xl">{item.title}</h3>
                  <p className="text-white/80 text-base">{item.desc}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/90 text-xs font-medium">
                    Learn more →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-white/60 backdrop-blur-xl sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 transition-all duration-300 group-focus-within:text-blue-600 group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Search campaigns by title or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 h-16 text-base rounded-2xl border-2 border-blue-500/20 bg-white shadow-lg focus:shadow-2xl focus:border-blue-500/40 transition-all duration-300 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-all z-10 hover:scale-110 duration-200"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-sm font-semibold text-gray-900 mb-4 px-2 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  Categories
                </h2>
                <nav className="space-y-1.5">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105"
                            : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-gray-900 hover:scale-102"
                        }`}
                      >
                        <Icon className={`h-4 w-4 transition-transform duration-300 ${isSelected ? 'animate-pulse' : ''}`} />
                        <span>{category.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-7 text-white shadow-xl overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-300">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">Start a Fundraiser</h3>
                  <p className="text-sm opacity-90 leading-relaxed">
                    Create your own campaign and make a difference in someone's life today
                  </p>
                  <button className="w-full bg-white text-blue-700 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold hover:scale-105 duration-300">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="fixed bottom-8 right-8 z-40 lg:hidden">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="rounded-full shadow-2xl h-16 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:scale-110 transition-transform duration-200 flex items-center gap-2 font-semibold"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="hover:scale-110 transition-transform" title="Close filters">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Categories</h3>
                    <div className="space-y-1.5">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setShowMobileFilters(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                              selectedCategory === category.id
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-3">Sort By</h3>
                    <div className="space-y-1.5">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedSort(option.id);
                            setShowMobileFilters(false);
                          }}
                          className={`w-full px-4 py-3 rounded-xl text-sm text-left transition-all ${
                            selectedSort === option.id
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={resetFilters}
                    className="w-full border-2 border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm relative z-40 overflow-visible">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Showing campaigns in</span>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowSortDropdown(false);
                    }}
                    className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                  >
                    {getCategoryName()}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                    {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto animate-fade-in">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 transition-colors ${
                            selectedCategory === category.id && "bg-blue-50 text-blue-600 font-medium"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span>sorted by</span>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSortDropdown(!showSortDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className="flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                  >
                    {getSortName()}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedSort(option.id);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100 transition-colors ${
                            selectedSort === option.id && "bg-blue-50 text-blue-600 font-medium"
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>

            {!isLoading && (
              <div className="mb-6 text-sm font-medium text-gray-600 bg-white/40 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
                Showing {sortedCampaigns.length} campaigns
              </div>
            )}

            {/* Campaigns Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CampaignCardSkeleton key={i} index={i} />
                ))}
              </div>
            ) : sortedCampaigns.length === 0 ? (
              <div className="text-center py-20 space-y-6 animate-fade-in">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search query</p>
                </div>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium hover:scale-105 duration-200"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedCampaigns.map((c, idx) => (
                  <CampaignCardInteractive key={c.id} campaign={c} index={idx} currentUserId={currentUserId} />
                ))}
              </div>
            )}

            <div ref={loaderRef} className="h-4" />

            {isLoadingMore && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-gray-600 shadow-lg">
                  <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Loading more campaigns...
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
    </div>
  );
}