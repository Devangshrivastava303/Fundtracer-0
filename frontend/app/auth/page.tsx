"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LoadingSpinner } from '@/components/loading-spinner';
import {
  User,
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Heart,
  Phone,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { OTPInput, SlotProps } from "input-otp";
import { cn } from "@/lib/utils";

// Helper component for OTP slots
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': props.isActive },
      )}
    >
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
        {props.char ?? props.placeholderChar}
      </div>
      {props.hasFakeCaret && (
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
          <div className="w-px h-8 bg-foreground" />
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [role, setRole] = useState("donor");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState<"PHONE" | "OTP">("PHONE");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { id: "donor", label: "Donor", icon: <User size={24} />, color: "text-blue-600", border: "border-blue-500", ring: "ring-blue-500" },
    { id: "ngo", label: "NGO", icon: <Building2 size={24} />, color: "text-emerald-600", border: "border-emerald-500", ring: "ring-emerald-500" },
  ];

  // Initialize Firebase Recaptcha
  useEffect(() => {
    if (authMethod === "phone" && typeof window !== 'undefined') {
      const container = document.getElementById('recaptcha-container');
      
      if (container && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved
          }
        });
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, [authMethod]);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      
      // Redirect admin users to admin page, others to home
      if (parsed.is_staff || parsed.is_superuser) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [router]);

  // Email/Password Authentication
  const handleSignup = async () => {
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: fullName, 
          email, 
          phone_number: phone, 
          password, 
          password_confirm: passwordConfirm, 
          role 
        }),
      });
      const data = await res.json();
      if (res.ok) { 
        // Save user and tokens to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        
        // Check if user is admin and redirect accordingly
        if (data.user.is_staff || data.user.is_superuser) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else { 
        setError(data.errors ? JSON.stringify(data.errors) : data.error || "Authentication failed");
      }
    } catch (err) { 
      setError("Network error. Please try again later."); 
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Save user and tokens to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        
        // Check if user is admin and redirect accordingly
        if (data.user.is_staff || data.user.is_superuser) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else { 
        setError(data.errors ? JSON.stringify(data.errors) : data.error || "Authentication failed");
      }
    } catch (err) { 
      setError("Network error. Please try again later."); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isLogin) {
      handleLogin().finally(() => setIsLoading(false));
    } else {
      handleSignup().finally(() => setIsLoading(false));
    }
  };

  // Phone Authentication
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneStep("OTP");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      
      // Reset recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {}
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult || otp.length !== 6) return;

    setIsLoading(true);
    setError("");

    try {
      // Verify OTP with Firebase
      await confirmationResult.confirm(otp);
      
      if (!isLogin) {
        // Signup: Create account via backend
        if (password !== passwordConfirm) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/auth/phone-signup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber,
            full_name: fullName,
            email,
            password,
            password_confirm: passwordConfirm,
            role
          }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // Save user and tokens
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          
          // Redirect to landing page
          router.push("/");
        } else {
          setError(data.errors ? JSON.stringify(data.errors) : data.error || "Signup failed");
        }
      } else {
        // Login: Authenticate via backend
        const res = await fetch("http://127.0.0.1:8000/api/auth/phone-login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber
          }),
        });
        const data = await res.json();
        
        if (res.ok) {
          // Save user and tokens
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          
          // Redirect to landing page
          router.push("/");
        } else {
          setError(data.error || "Login failed");
        }
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError("Invalid OTP. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get dynamic color classes based on role
  const getDynamicColors = () => {
    const roleConfig = roles.find(r => r.id === role);
    return roleConfig || roles[0];
  };

  const currentRole = getDynamicColors();

  return (
    <div className="min-h-screen font-sans relative flex flex-col overflow-hidden bg-[#f0f4f8]">
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: float 18s infinite alternate; }
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes caret-blink {
          0%, 70%, 100% { opacity: 1; }
          20%, 50% { opacity: 0; }
        }
        .animate-caret-blink {
          animation: caret-blink 1.2s ease-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Dynamic Background Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-blob transition-colors duration-1000 ${
        role === 'ngo' ? 'bg-emerald-400/20' : 'bg-blue-400/30'
      }`} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/25 rounded-full blur-[120px] animate-blob" />

      <nav className="relative z-30 p-6 md:p-8 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <img src="/Logo.png" alt="FundTracer Logo" className="w-12 h-12 md:w-20 md:h-20 object-contain shadow-blue-500/20 drop-shadow-md" />
          <span className="font-black text-xl md:text-3xl tracking-tighter text-slate-800">FundTracer</span>
        </div>
      </nav>

      <main className="relative z-20 flex flex-1 w-full px-4 md:px-10 pb-4 md:pb-10">
        <div className="w-full flex bg-white/10 backdrop-blur-3xl rounded-[40px] md:rounded-[60px] border border-white/30 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          
          {/* LEFT SECTION (Timeline) - Hidden on mobile/tablet */}
          <div className="hidden lg:flex w-[45%] flex-col justify-center p-16 xl:p-20 border-r border-white/10">
            <div className="max-w-md space-y-12 xl:space-y-16">
              <h2 className="text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1]">
                {isLogin ? "Make Your" : "Join the"} <br/> 
                <span className={currentRole.color}>{isLogin ? "Impact." : "Movement."}</span>
              </h2>
              <p className="text-slate-500 text-lg xl:text-xl font-medium">
                The most transparent way to give and track your contributions.
              </p>

              <div className="relative space-y-10 xl:space-y-12">
                {[
                  { label: "Login", sub: isLogin ? "Secure Portal Access" : "Create your Profile", icon: <User size={24} /> },
                  { label: "Verify", sub: "Feel secure", icon: <Building2 size={24} /> },
                  { label: "Donate", sub: "Directly to the cause", icon: <Heart size={24} /> },
                  { label: "Track", sub: "Verify details with Real-time Tracking", icon: <Eye size={24} /> }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-8 xl:gap-10 relative">
                    <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-3xl flex items-center justify-center z-10 bg-white/40 text-blue-500 backdrop-blur-2xl border border-white/60 shadow-lg">
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-xl xl:text-2xl font-bold text-slate-900">{step.label}</p>
                      <p className="text-slate-400 font-medium text-base xl:text-lg">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (Form) */}
          <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white/5 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white/60 backdrop-blur-2xl rounded-[35px] md:rounded-[50px] p-8 md:p-12 lg:p-16 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.08)] border border-white/80 fade-in">
              
              <div className="mb-8 md:mb-10 text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-3 md:mb-4 tracking-tight">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-slate-500 font-semibold text-base md:text-lg">
                  {isLogin ? "Sign in to continue" : "Join FundTracer and make an impact"}
                </p>
              </div>

              {/* Role Selection */}
              <div className="mb-8 md:mb-10">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 ml-2">Select Role</label>
                <div className="grid grid-cols-2 gap-3 md:gap-6 overflow-x-auto p-1 pb-2 no-scrollbar">
                  {roles.map((r) => (
                    <button 
                      key={r.id} 
                      onClick={() => setRole(r.id)} 
                      className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-[25px] md:rounded-[35px] border-2 transition-all duration-500 min-w-[90px] ${
                        role === r.id 
                          ? `bg-white ${r.color} ring-2 ring-inset ${r.ring} shadow-2xl scale-105` 
                          : "bg-white/40 text-slate-400 border-transparent hover:bg-white/50"
                      }`}
                    >
                      <div className="mb-2 md:mb-4">{r.icon}</div>
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Method Toggle */}
              <div className="mb-6 md:mb-8">
                <label className="block text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 ml-2">Login Method</label>
                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setAuthMethod("email");
                      setPhoneStep("PHONE");
                      setError("");
                    }}
                    className={`group flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-3 rounded-[18px] md:rounded-[20px] border-2 transition-all duration-300 ${
                      authMethod === "email" 
                        ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-500/50 shadow-md shadow-blue-500/10" 
                        : "bg-white/40 border-white/30 hover:bg-white/60 hover:border-blue-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all ${
                      authMethod === "email" 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                    }`}>
                      <Mail size={14} />
                    </div>
                    <span className={`text-xs md:text-sm font-bold transition-colors ${
                      authMethod === "email" ? "text-blue-700" : "text-slate-600"
                    }`}>
                      Email
                    </span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setAuthMethod("phone");
                      setError("");
                    }}
                    className={`group flex-1 flex items-center justify-center gap-2 px-3 py-2.5 md:py-3 rounded-[18px] md:rounded-[20px] border-2 transition-all duration-300 ${
                      authMethod === "phone" 
                        ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-500/50 shadow-md shadow-emerald-500/10" 
                        : "bg-white/40 border-white/30 hover:bg-white/60 hover:border-emerald-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all ${
                      authMethod === "phone" 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                    }`}>
                      <Phone size={14} />
                    </div>
                    <span className={`text-xs md:text-sm font-bold transition-colors ${
                      authMethod === "phone" ? "text-emerald-700" : "text-slate-600"
                    }`}>
                      Phone
                    </span>
                  </button>
                </div>
              </div>

              {/* Email/Password Form */}
              {authMethod === "email" && (
                <>
                  <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                    {!isLogin && (
                      <div className="relative group">
                        <User className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          required 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                        />
                      </div>
                    )}
                    <div className="relative group">
                      <Mail className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    {!isLogin && (
                      <div className="relative group">
                        <Lock className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Confirm Password" 
                          required 
                          value={passwordConfirm} 
                          onChange={(e) => setPasswordConfirm(e.target.value)} 
                          className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="relative group">
                        <Phone className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                          type="tel" 
                          placeholder="Phone Number (Optional)" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                        />
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 flex items-start gap-3">
                        <div className="text-red-500 mt-0.5">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-red-700 font-semibold text-sm">{error}</p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className={`w-full py-3.5 md:py-5 rounded-[20px] md:rounded-[25px] text-white font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-lg md:text-xl mt-2 flex items-center justify-center gap-2 ${
                        role === 'ngo' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                      } disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? "Sign In" : "Register Now")}
                    </button>
                  </form>
                </>
              )}

              {/* Phone Authentication Form */}
              {authMethod === "phone" && (
                <div className="space-y-5 md:space-y-6">
                  {phoneStep === "PHONE" ? (
                    <>
                      {!isLogin && (
                        <>
                          <div className="relative group">
                            <User className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                              type="text" 
                              placeholder="Full Name" 
                              required={!isLogin}
                              value={fullName} 
                              onChange={(e) => setFullName(e.target.value)} 
                              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                            />
                          </div>

                          <div className="relative group">
                            <Mail className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                              type="email" 
                              placeholder="Email Address" 
                              required={!isLogin}
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                            />
                          </div>

                          <div className="relative group">
                            <Lock className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Password" 
                              required={!isLogin}
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>

                          <div className="relative group">
                            <Lock className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Confirm Password" 
                              required={!isLogin}
                              value={passwordConfirm} 
                              onChange={(e) => setPasswordConfirm(e.target.value)} 
                              className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        </>
                      )}
                      
                      <div className="relative group">
                        <Phone className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                          type="tel"
                          placeholder="Phone Number (e.g., 9876543210)"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-3.5 md:py-5 bg-white/50 border border-white/20 rounded-[20px] md:rounded-[25px] focus:bg-white/90 focus:ring-2 ring-blue-500/20 outline-none text-base md:text-lg font-semibold shadow-inner transition-all"
                          disabled={isLoading}
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 flex items-start gap-3">
                          <div className="text-red-500 mt-0.5">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-red-700 font-semibold text-sm">{error}</p>
                        </div>
                      )}
                      
                      {/* Hidden container for reCAPTCHA */}
                      <div id="recaptcha-container"></div>
                      
                      <button 
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 md:py-5 rounded-[20px] md:rounded-[25px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading && <Loader2 className="inline w-5 h-5 animate-spin" />}
                        Send OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4 md:mb-6">
                        <p className="text-slate-600 font-medium text-sm md:text-base">
                          Enter the code sent to <span className="font-bold text-blue-600">{phoneNumber}</span>
                        </p>
                      </div>
                      
                      <div className="flex justify-center mb-4 md:mb-6">
                        <OTPInput
                          maxLength={6}
                          value={otp}
                          onChange={setOtp}
                          containerClassName="group flex items-center has-[:disabled]:opacity-30"
                          render={({ slots }) => (
                            <div className="flex gap-2">
                              {slots.map((slot, idx) => (
                                <Slot key={idx} {...slot} />
                              ))}
                            </div>
                          )}
                        />
                      </div>
                      
                      <button 
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 md:py-5 rounded-[20px] md:rounded-[25px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-lg md:text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="inline w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="inline w-5 h-5" />
                        )}
                        Verify & Login
                      </button>
                      
                      <button 
                        onClick={() => {
                          setPhoneStep("PHONE");
                          setOtp("");
                          setError("");
                        }}
                        disabled={isLoading}
                        className="w-full text-slate-600 hover:text-slate-800 font-semibold py-3 transition-colors disabled:opacity-50 text-sm md:text-base"
                      >
                        <ArrowLeft className="inline w-4 h-4 mr-2" />
                        Change Phone Number
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-red-50 border border-red-200 text-red-600 text-xs md:text-sm rounded-xl md:rounded-2xl text-center font-semibold">
                  {error}
                </div>
              )}

              {/* Toggle Login/Signup */}
              <div className="mt-8 md:mt-10 text-center">
                <p className="text-base md:text-lg font-bold text-slate-400/80">
                  {isLogin ? "New to FundTracer?" : "Already have an account?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
                    {isLogin ? "Create Account" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// TypeScript declarations
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}