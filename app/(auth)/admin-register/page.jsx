"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!adminKey || !name || !email || !password || !confirmPassword) {
      setError("All required fields must be filled in");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey,
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Admin registration failed");
        return;
      }

      setSuccess("Admin account created. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("Admin registration error:", err);
      setError("Admin registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-2xl bg-white shadow-sm rounded-2xl border border-gray-100 p-8'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Admin Registration
          </h1>
          <p className='text-sm text-gray-600 mt-1'>
            Use your admin key to create an administrator account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Admin Key
              </label>
              <input
                type='password'
                value={adminKey}
                onChange={(event) => setAdminKey(event.target.value)}
                className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='Enter admin key'
                autoComplete='off'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Full Name
              </label>
              <input
                type='text'
                value={name}
                onChange={(event) => setName(event.target.value)}
                className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='Admin name'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='admin@renewably.energy'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='Minimum 8 characters'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Confirm Password
              </label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500'
                placeholder='Re-enter password'
                required
              />
            </div>
          </div>

          {error ? (
            <div className='rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          {success ? (
            <div className='rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700'>
              {success}
            </div>
          ) : null}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60'>
            {loading ? "Creating admin account..." : "Create Admin Account"}
          </button>
        </form>

        <div className='mt-6 flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between'>
          <Link
            href='/'
            className='inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900'>
            Go to Home
          </Link>
          <div>
            Already have an account?{" "}
            <Link href='/login' className='text-blue-700 hover:underline'>
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
