"use client";

import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setResetSent(true);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      {/* Back Button */}
      <div className='absolute top-6 left-6'>
        <Link
          href='/login'
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'>
          <ArrowLeft className='w-5 h-5' />
          <span className='text-sm font-medium'>Back to Login</span>
        </Link>
      </div>

      <div className='w-full max-w-md'>
        <div className='bg-white rounded-lg border border-gray-200 p-8 shadow-sm'>
          <div className='text-center mb-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Reset Password
            </h2>
            <p className='text-gray-600 text-sm'>
              Enter your email to receive a password reset link
            </p>
          </div>

          {success ? (
            <div className='text-center space-y-4'>
              <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900'>
                Check Your Email
              </h3>
              <p className='text-gray-600'>
                We have sent a password reset link to <strong>{email}</strong>
              </p>
              <p className='text-sm text-gray-500'>
                The link will expire in 1 hour
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className='mt-4 text-[#0F47A8] hover:text-blue-900 text-sm font-medium'>
                Send to a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-5'>
              {error && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                  {error}
                </div>
              )}

              {resetSent && !success && (
                <div className='bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm'>
                  Reset link already sent. Check your email or wait a few
                  minutes before trying again.
                </div>
              )}

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F47A8] focus:border-[#0F47A8] text-gray-900 placeholder-gray-400'
                    placeholder='Enter your email'
                  />
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full bg-[#0F47A8] hover:bg-blue-900 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F47A8] disabled:opacity-50 disabled:cursor-not-allowed'>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className='text-center text-sm text-gray-600'>
                Remember your password?{" "}
                <Link
                  href='/login'
                  className='font-medium text-[#0F47A8] hover:text-blue-900'>
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
