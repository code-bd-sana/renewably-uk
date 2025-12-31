"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Check,
  ArrowLeft,
  Zap,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  // Check URL for verified parameter
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setShowVerified(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowVerified(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left Side */}
          <div className="hidden lg:block w-full lg:w-1/2 max-w-xl">
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex justify-center">
                <Image
                  src="/FullLogo_Transparent.png"
                  height={250}
                  width={250}
                  alt="Renewably UK"
                  className="h-auto w-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{ display: "none" }} className="items-center gap-3">
                  <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center">
                    <div className="text-white font-bold text-2xl">R</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      RENEWABLY UK
                    </div>
                    <div className="text-sm text-blue-600 tracking-wider">
                      POWERING RENEWABLES
                    </div>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="max-w-325 mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Supporting Your Renewable Energy Business&apos;
                </h1>
                <p className="text-gray-600 text-base">
                  Comprehensive solutions and support for your renewal energy
                  installations
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6">
                {/* Feature 1 */}
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <Zap className="text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Renewable Energy Focus
                    </h3>
                    <p className="text-sm text-gray-600">
                      Specialised coverage for Renewable Energy Insulations
                      across multiple schemes
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Comprehensive Protection
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bluedrop Service Hosted Insurance Backed Guarantee Service
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CircleCheck className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Trusted by Thousands
                    </h3>
                    <p className="text-sm text-gray-600">
                      Join thousands of Renewable Energy Installation Companies
                      protecting their submissions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 max-w-md md:mt-44">
            <div className="space-y-6">
              {/* Email Verified Alert - Only shows when approved */}
              {showVerified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-base mb-1">
                        Account Approved! 🎉
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your account has been approved by admin. You can now
                        sign in to access the Renewably UK Portal.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowVerified(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Login Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Sign In
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Sign in to your account
                  </p>
                </div>

                <div className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                        placeholder="Enter your Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#0F47A8] hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  {/* Sign Up Link */}
                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={"/signup"}
                      className="font-medium text-[#0F47A8] hover:text-blue-500"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
              {/* Terms */}
              <div className="text-center text-xs text-gray-500">
                <p>
                  By signing up, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
