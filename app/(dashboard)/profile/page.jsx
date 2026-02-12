"use client";

import {
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  FileText,
  Download,
  X,
  ShieldCheck,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Page() {
  const [loadingUser, setLoadingUser] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  // roles
  const [roles, setRoles] = useState([]);
  const [requestedRoles, setRequestedRoles] = useState([]);

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Document states
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

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

          setRoles(data.user.roles || []);
          setRequestedRoles(data.user.requestedRoles || []);
          console.log("User data fetched:", data.user);

          // Fetch documents after getting userId
          if (data.user._id || data.user.id) {
            fetchUserDocuments(data.user._id || data.user.id);
          }
          return;
        }
      }

      // Dummy fallback data
      const dummyUser = {
        name: "Lois Padilla",
        companyName: "Montgomery and Bryan Traders",
        email: "huwihocy@denipl.net",
        phoneNumber: "714-242-8888",
        address:
          "The Mill Suite, Hardmans Business Centre New Hey Road, Rawtenstall, BB4 6HH",
      };
      setUserData(dummyUser);
      setUserId("694e27da03fc3222e88dbfb0");

      // Also fetch documents for dummy user
      fetchUserDocuments("694e27da03fc3222e88dbfb0");
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch user documents
  const fetchUserDocuments = async (userId) => {
    if (!userId) return;

    try {
      setLoadingDocuments(true);
      const response = await fetch(`/api/document?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.documents || []);
          console.log("Documents fetched:", data.documents);
        } else {
          console.error("Failed to fetch documents:", data.error);
        }
      } else {
        console.error("Failed to fetch documents:", response.status);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocuments(false);
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
        // toast.success("Password changed successfully!");

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

  // Handle document view
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  // Handle document download
  const handleDownloadDocument = (document) => {
    if (document.ducoment) {
      try {
        // Create full URL for the document
        const documentUrl = `${window.location.origin}${document.ducoment}`;

        // Create a temporary link element
        const link = document.createElement("a");
        link.href = documentUrl;
        link.download = document.title || `document-${document._id}.pdf`;
        link.target = "_blank";

        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Downloading ${document.title || "document"}...`);
      } catch (error) {
        console.error("Error downloading document:", error);
        toast.error("Failed to download document. Please try again.");
      }
    } else {
      toast.error("Document URL not found");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className='min-h-screen bg-gray-100 '>
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

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <FileText className='w-6 h-6 text-blue-700' />
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {selectedDocument.title}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {selectedDocument.category} •{" "}
                    {formatDate(selectedDocument.createdAt)}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg'
                  title='Download Document'>
                  <Download className='w-5 h-5' />
                </button>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg'>
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className='p-6 overflow-y-auto max-h-[70vh]'>
              {/* Document Details */}
              <div className='space-y-4 mb-6'>
                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-1'>
                    Title
                  </h4>
                  <p className='text-gray-900'>{selectedDocument.title}</p>
                </div>

                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-1'>
                    Category
                  </h4>
                  <span className='inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded'>
                    {selectedDocument.category}
                  </span>
                </div>

                {selectedDocument.description && (
                  <div>
                    <h4 className='text-sm font-medium text-gray-700 mb-1'>
                      Description
                    </h4>
                    <p className='text-gray-900'>
                      {selectedDocument.description}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-1'>
                    Uploaded On
                  </h4>
                  <p className='text-gray-900'>
                    {formatDate(selectedDocument.createdAt)}
                  </p>
                </div>
              </div>

              {/* Document Preview/Download */}
              <div className='border-t border-gray-200 pt-6'>
                <h4 className='text-sm font-medium text-gray-700 mb-3'>
                  Document
                </h4>
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <FileText className='w-8 h-8 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-900'>
                          {selectedDocument.ducoment?.split("/").pop() ||
                            "document"}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Click to view or download
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <a
                        href={`${window.location.origin}${selectedDocument.ducoment}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                        View Document
                      </a>
                      <button
                        onClick={() => handleDownloadDocument(selectedDocument)}
                        className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium'>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='p-4 border-t border-gray-200 bg-gray-50'>
              <div className='flex justify-end'>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium'>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className='max-w-5xl mx-auto mt-8 bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='p-8'>
            {/* Profile Header */}
            <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-8 border-b border-gray-200'>
              <div className='w-24 h-24 rounded-full bg-linear-to-br from-blue-800 to-blue-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-blue-100 shrink-0'>
                {userData?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </div>
              <div className='text-center sm:text-left md:mt-3 lg:mt-3 '>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {userData?.name || "Contractor Name"}
                </h2>
                <p className='text-lg text-gray-600 mt-1'>
                  {userData?.companyName || "Company Name"}
                </p>
              </div>
            </div>

            {/* Improved Profile Info Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Contractor Name */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <User size={16} className='text-blue-600' />
                  Contractor Name
                </label>
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900'>
                  {userData?.name || "Not provided"}
                </div>
              </div>

              {/* Company Name */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <Building size={16} className='text-blue-600' />
                  Company Name
                </label>
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900'>
                  {userData?.companyName || "Not provided"}
                </div>
              </div>

              {/* Phone Number */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <Phone size={16} className='text-blue-600' />
                  Phone Number
                </label>
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900'>
                  {userData?.phoneNumber || "Not provided"}
                </div>
              </div>

              {/* Email Address */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <Mail size={16} className='text-blue-600' />
                  Email Address
                </label>
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900'>
                  {userData?.email || "Not provided"}
                </div>
              </div>

              {/* Company Address */}
              <div className='space-y-2 md:col-span-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <MapPin size={16} className='text-blue-600' />
                  Company Address
                </label>
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900'>
                  {userData?.companyAddress || "Not provided"}
                </div>
              </div>

              {/* Assigned Roles */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <ShieldCheck size={16} className='text-blue-600' />
                  Assigned Roles
                </label>
                <div className='min-h-[46px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap gap-2 items-center'>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <span
                        key={role}
                        className='inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full'>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className='text-gray-500 italic text-sm'>
                      None assigned yet
                    </span>
                  )}
                </div>
              </div>

              {/* Requested Roles */}
              <div className='space-y-2'>
                <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                  <ShieldCheck size={16} className='text-gray-500' />
                  Requested Roles
                </label>
                <div className='min-h-[46px] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-wrap gap-2 items-center'>
                  {requestedRoles.length > 0 ? (
                    requestedRoles.map((role) => (
                      <span
                        key={role}
                        className='inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full'>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className='text-gray-500 italic text-sm'>
                      None selected during signup
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Document Section */}
            <div className='mt-8'>
              <div className='flex justify-between items-center mb-4'>
                <div>
                  <label className='block text-lg font-semibold text-gray-800 mb-1'>
                    Documents
                  </label>
                  <p className='text-sm text-gray-500'>
                    Uploaded documents and files
                  </p>
                </div>
                {loadingDocuments && (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600'></div>
                )}
              </div>

              {loadingDocuments ? (
                <div className='text-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3'></div>
                  <p className='text-sm text-gray-500'>Loading documents...</p>
                </div>
              ) : documents.length > 0 ? (
                <div className='space-y-3'>
                  {documents.map((doc) => (
                    <div
                      key={doc._id || doc.id}
                      className='flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 rounded'>
                          <FileText className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            {doc.title}
                          </h4>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-xs text-gray-500'>
                              {doc.category}
                            </span>
                            <span className='text-xs text-gray-400'>•</span>
                            <span className='text-xs text-gray-500'>
                              {formatDate(doc.createdAt)}
                            </span>
                            {doc.description && (
                              <>
                                <span className='text-xs text-gray-400'>•</span>
                                <span className='text-xs text-gray-500 truncate max-w-xs'>
                                  {doc.description}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors'
                          title='View Details'>
                          <Eye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className='p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
                          title='Download'>
                          <Download className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 border-2 border-dashed border-gray-300 rounded-lg'>
                  <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500'>No documents uploaded yet</p>
                  <p className='text-sm text-gray-400 mt-1'>
                    Documents will appear here once uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
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
        <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 pb-4'>
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
