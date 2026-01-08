"use client";

import { CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {
  const [loadingUser, setLoadingUser] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
          setUserId(data.user._id || data.user.id);
          console.log("User data fetched:", data.user);
          return;
        }
      }

      // Dummy fallback data
      setUserData({
        name: "Lois Padilla",
        companyName: "Montgomery and Bryan Traders",
        email: "huwihocy@denipl.net",
        phone: "714-242-8888",
        address:
          "The Mill Suite, Hardmans Business Centre New Hey Road, Rawtenstall, BB4 6HH",
      });
      setUserId("694e27da03fc3222e88dbfb0");
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Validate confirm password
  const validateConfirmPassword = (confirm) => {
    if (confirm && newPassword && confirm !== newPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: "",
      }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  // Clear all errors
  const clearErrors = () => {
    setPasswordErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePassword = async () => {
    // Clear previous errors
    clearErrors();

    // Validate all fields
    const errors = {};

    if (!oldPassword.trim()) {
      errors.oldPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      Object.values(errors).forEach((error) => {
        if (error) toast.error(error);
      });
      return;
    }

    setChangingPassword(true);

    try {
      // Call change password API
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: userId,
          oldPassword: oldPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success!
        toast.success("Password changed successfully!");

        // Reset form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Show success toast with details
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-green-50 border border-green-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-green-900 ring-opacity-5`}>
            <div className='flex-1 w-0 p-4'>
              <div className='flex items-start'>
                <div className='shrink-0 pt-0.5'>
                  <CheckCircle className='h-10 w-10 text-green-400' />
                </div>
                <div className='ml-3 flex-1'>
                  <p className='text-sm font-medium text-green-900'>
                    Password Updated Successfully!
                  </p>
                  <p className='mt-1 text-sm text-green-700'>
                    Your password has been changed. Please use your new password
                    next time you log in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ));
      } else {
        // Handle API errors
        const errorMessage = data.error || "Failed to change password";

        // Set specific field errors if available
        if (errorMessage.includes("Current password")) {
          setPasswordErrors((prev) => ({
            ...prev,
            oldPassword: errorMessage,
          }));
        } else if (errorMessage.includes("Password")) {
          setPasswordErrors((prev) => ({
            ...prev,
            newPassword: errorMessage,
          }));
        }

        toast.error(`${errorMessage}`);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDiscard = () => {
    if (oldPassword || newPassword || confirmPassword) {
      if (!confirm("Are you sure you want to discard all changes?")) {
        return;
      }
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    clearErrors();
    toast.success("Changes discarded");
  };
console.log("User data", userData)
  return (
    <div className='min-h-screen bg-gray-100'>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header */}
      <div className='bg-[#0F47A8] text-white py-6'>
        <h1 className='text-center text-2xl font-semibold'>
          {userData?.companyName}
        </h1>
        <p className='text-center text-sm mt-1 opacity-90'>
          Phone: {userData?.phoneNumber} · Email: {userData?.email}
        </p>
      </div>

      {/* Main Card */}
      <div className='px-6'>
        <div className='max-w-5xl mx-auto mt-8 bg-white rounded-md shadow '>
          <div className='p-8'>
            {/* Profile Section */}
            <div className='flex items-center gap-6 mb-8'>
              <div className='w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-semibold text-white shadow'>
                {userData?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "LP"}
              </div>
              <div>
                <h2 className='text-lg font-semibold'>
                  {userData?.name || "Contractor Name"}
                </h2>
                <p className='text-sm text-gray-500'>{userData?.companyName}</p>
              </div>
            </div>

            {/* Form Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Input label='Contractor Name' value={userData?.name} />
              <Input label='Company Name' value={userData?.companyName} />
              <Input label='Phone Number' value={userData?.phoneNumber} />
              <Input label='Email Address' value={userData?.email} />
              {/* <Input
                label='Billing Email Address'
                value='info@vistafiling.com'
              />
              <Input label='Address' value={userData?.address} /> */}
            </div>

            {/* Document */}
            <div className='mt-6'>
              <label className='block text-sm font-medium text-gray-600 mb-1'>
                Document
              </label>
              <div className='border rounded px-4 py-2 text-blue-600 text-sm'>
                file_kds4h415f6
              </div>
            </div>

            {/* Change Password Section */}
          </div>
        </div>
      </div>
      <div className='mt-10 px-6 mx-8 bg-white pt-8 border-t border-gray-200'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Lock className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h3 className='text-xl font-semibold text-gray-800'>
              Change Password
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Update your account password
            </p>
          </div>
        </div>

        {/* Password Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Current Password */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Current Password *
            </label>
            <div className='relative'>
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder='Enter current password'
                className={`w-full border rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  passwordErrors.oldPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (passwordErrors.oldPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      oldPassword: "",
                    }));
                  }
                }}
              />
              <button
                type='button'
                onClick={() => setShowOldPassword(!showOldPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordErrors.oldPassword && (
              <p className='text-sm text-red-600 animate-pulse'>
                {passwordErrors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              New Password *
            </label>
            <div className='relative'>
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder='Enter new password (minimum 6 characters)'
                className={`w-full border rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  passwordErrors.newPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      newPassword: "",
                    }));
                  }
                }}
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className='text-sm text-red-600 animate-pulse'>
                 {passwordErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className='space-y-2 md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Confirm New Password *
            </label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder='Confirm new password'
                className={`w-full border rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  passwordErrors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                value={confirmPassword}
                onChange={(e) => {
                  handleConfirmPasswordChange(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }
                }}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className='text-sm text-red-600 animate-pulse'>
                 {passwordErrors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200'>
          <button
            onClick={handleDiscard}
            disabled={changingPassword}
            className='px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'>
            Discard Changes
          </button>
          <button
            onClick={handleChangePassword}
            disabled={
              changingPassword ||
              !oldPassword ||
              !newPassword ||
              !confirmPassword
            }
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
              changingPassword ||
              !oldPassword ||
              !newPassword ||
              !confirmPassword
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
            }`}>
            {changingPassword ? (
              <>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <Lock size={18} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Reusable Input */
function Input({ label, value }) {
  return (
    <div>
      <label className='block text-sm font-medium text-gray-600 mb-1'>
        {label}
      </label>
      <input
        value={value || ""}
        readOnly
        className='w-full border rounded px-3 py-2 bg-gray-50'
      />
    </div>
  );
}
