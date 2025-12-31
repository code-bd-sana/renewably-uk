// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Eye,
//   Download,
//   Users,
//   FileText,
//   DollarSign,
//   Calendar,
// } from "lucide-react";

// export default function AdminDashboard() {
//   const router = useRouter();
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalPolicies: 0,
//     premiumTotal: 0,
//     thisMonthPolicies: 0,
//     totalContractors: 0,
//     editRequests: 0,
//   });

//   // Check if user is admin AND fetch data
//   const checkAdminAndLoadData = useCallback(async () => {
//     try {
//       // FIRST: Check if user is admin using the main admin endpoint
//       const adminCheck = await fetch("/api/admin");

//       if (adminCheck.status === 403) {
//         router.push("/login");
//         return;
//       }

//       if (!adminCheck.ok) {
//         throw new Error("Admin check failed");
//       }

//       // User is admin, now fetch pending users AND stats in parallel
//       const [usersRes, statsRes] = await Promise.all([
//         fetch("/api/admin/contractor?status=pending"),
//         fetch("/api/admin?action=get-stats"),
//       ]);

//       const usersData = await usersRes.json();
//       const statsData = await statsRes.json();

//       if (usersData.success) {
//         setPendingUsers(usersData.users);
//       }

//       if (statsData.success) {
//         setStats(statsData.stats);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       router.push("/login");
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     checkAdminAndLoadData();
//   }, [checkAdminAndLoadData]);

//   const handleApprove = async (userId) => {
//     try {
//       // Use the specific approve endpoint
//       const res = await fetch("/api/admin/approve-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ userId }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Remove approved user from list
//         setPendingUsers(prev => prev.filter(user => user.id !== userId));

//         // Update stats
//         setStats((prev) => ({
//           ...prev,
//           totalContractors: prev.totalContractors + 1,
//           pendingApprovals: prev.pendingApprovals - 1,
//         }));
//       }
//     } catch (error) {
//       console.error("Approve error:", error);
//     }
//   };

//   const handleReject = async (userId) => {
//     try {
//       // Use the specific reject endpoint
//       const res = await fetch("/api/admin/reject-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ userId }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Remove rejected user from list
//         setPendingUsers(prev => prev.filter(user => user.id !== userId));

//         // Update stats
//         setStats((prev) => ({
//           ...prev,
//           pendingApprovals: prev.pendingApprovals - 1,
//         }));
//       }
//     } catch (error) {
//       console.error("Reject error:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-blue-600 text-lg">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 mt-12 md:mt-0">
//       {/* Header */}
//       <div className="bg-linear-to-r from-blue-700 to-blue-600 text-white p-8 rounded-lg mb-6">
//         <h1 className="text-3xl font-semibold flex items-center gap-2">
//           Welcome Back, Admin 👋
//         </h1>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">Total Policies</div>
//             <div className="bg-blue-50 p-2 rounded">
//               <FileText className="w-5 h-5 text-blue-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             {stats.totalPolicies}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">Premium Total</div>
//             <div className="bg-green-50 p-2 rounded">
//               <DollarSign className="w-5 h-5 text-green-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             £
//             {stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">This Month Policies</div>
//             <div className="bg-purple-50 p-2 rounded">
//               <Calendar className="w-5 h-5 text-purple-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             {stats.thisMonthPolicies}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">Total Contractors</div>
//             <div className="bg-orange-50 p-2 rounded">
//               <Users className="w-5 h-5 text-orange-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             {stats.totalContractors}
//           </div>
//         </div>
//       </div>

//       {/* Pending Approvals Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900">
//             New Contractor Request ({pendingUsers.length})
//           </h2>
//         </div>

//         {pendingUsers.length === 0 ? (
//           <div className="p-12 text-center text-gray-500">
//             No pending approvals
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                     Apply Date
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                     Company Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                     Contractor Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                     Email Address
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {pendingUsers.map((user) => (
//                   <tr key={user.id || user._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {new Date(user.createdAt).toLocaleDateString("en-GB")}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {user.companyName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {user.name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                       {user.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleApprove(user.id)}
//                           className="bg-green-50 text-green-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-green-100 transition-colors"
//                         >
//                           ✓ Accept
//                         </button>
//                         <button
//                           onClick={() => handleReject(user.id)}
//                           className="bg-red-50 text-red-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-red-100 transition-colors"
//                         >
//                           ✕ Reject
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Additional Stats */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">Months Premium Total</div>
//             <div className="bg-blue-50 p-2 rounded">
//               <DollarSign className="w-5 h-5 text-blue-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             £
//             {stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <div className="text-gray-600 text-sm">Edit Request Pending</div>
//             <div className="bg-yellow-50 p-2 rounded">
//               <FileText className="w-5 h-5 text-yellow-600" />
//             </div>
//           </div>
//           <div className="text-3xl font-bold text-gray-900">
//             {stats.editRequests}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  FileText,
  RefreshCw,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [stats, setStats] = useState({
    totalPolicies: 0,
    premiumTotal: 0,
    thisMonthPolicies: 0,
    totalContractors: 0,
    editRequests: 0,
  });

  // Check if user is admin AND fetch data
  const checkAdminAndLoadData = useCallback(async () => {
    try {
      // FIRST: Check if user is admin using the main admin endpoint
      const adminCheck = await fetch("/api/admin");

      if (adminCheck.status === 403) {
        router.push("/login");
        return;
      }

      if (!adminCheck.ok) {
        throw new Error("Admin check failed");
      }

      // User is admin, now fetch pending users AND stats in parallel
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/contractor?status=pending"),
        fetch("/api/admin?action=get-stats"),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (usersData.success) {
        setPendingUsers(usersData.users);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Fetch pending requests
  const fetchPendingRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const url = "/api/admin/contractor?type=requests&status=pending";
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Full API response:", data);

      if (response.ok && data.success) {
        console.log("Requests array received:", data.requests);
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAndLoadData();
    fetchPendingRequests();
  }, [checkAdminAndLoadData, fetchPendingRequests]);

  const handleApproveUser = async (userId) => {
    alert("Are You Sure");
    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();
      checkAdminAndLoadData();

      if (data.success) {
        // Remove approved user from list
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalContractors: prev.totalContractors + 1,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleRejectUser = async (userId) => {
    alert("Are You Sure?");
    try {
      const res = await fetch("/api/admin/reject-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();
      checkAdminAndLoadData();

      if (data.success) {
        // Remove rejected user from list
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  };
  const handleApproveRequest = async (requestId) => {
    alert("Are You Sure");
    console.log(requestId, "this is request id");
    try {
      const res = await fetch(`/api/admin/contractor/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          notes: adminNotes || "Request approved by admin",
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove from list
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );
        setStats((prev) => ({
          ...prev,
          editRequests: Math.max(0, prev.editRequests - 1),
        }));
        alert("Request approved successfully!");
      } else {
        alert(data.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Approve request error:", error);
      alert("Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/admin/contractor/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          notes: adminNotes || "Request rejected by admin",
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove from list
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );
        setStats((prev) => ({
          ...prev,
          editRequests: Math.max(0, prev.editRequests - 1),
        }));
        alert("Request rejected successfully!");
      } else {
        alert(data.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Reject request error:", error);
      alert("Failed to reject request");
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setShowRequestModal(true);
  };

  const handleRefreshRequests = () => {
    fetchPendingRequests();
    checkAdminAndLoadData();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-blue-600 text-lg'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 mt-12 md:mt-0'>
      {/* Header */}
      <div className='bg-linear-to-r from-blue-700 to-blue-600 text-white p-8 rounded-lg mb-6'>
        <h1 className='text-3xl font-semibold flex items-center gap-2'>
          Welcome Back, Admin 👋
        </h1>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>Total Policies</div>
            <div className='bg-blue-50 p-2 rounded'>
              <FileText className='w-5 h-5 text-blue-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            {stats.totalPolicies}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>Premium Total</div>
            <div className='bg-green-50 p-2 rounded'>
              <DollarSign className='w-5 h-5 text-green-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            £
            {stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>This Month Policies</div>
            <div className='bg-purple-50 p-2 rounded'>
              <Calendar className='w-5 h-5 text-purple-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            {stats.thisMonthPolicies}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>Total Contractors</div>
            <div className='bg-orange-50 p-2 rounded'>
              <Users className='w-5 h-5 text-orange-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            {stats.totalContractors}
          </div>
        </div>
      </div>

      <div className='grid '>
        {/* Pending Approvals Section */}
        <div className='cols-span-2 bg-white rounded-lg shadow-sm border border-gray-100 mb-6'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>
              New Contractor Request ({pendingUsers.length})
            </h2>
          </div>

          {pendingUsers.length === 0 ? (
            <div className='p-12 text-center text-gray-500'>
              No pending approvals
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Apply Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Company Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Contractor Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Email Address
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {pendingUsers.map((user) => (
                    <tr key={user.id || user._id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {user.companyName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {user.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {user.email}
                      </td>
                      {/* In the pending requests table, update the actions column */}
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleViewRequest(user)}
                            className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                            title='View Request Details'>
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleApproveUser(user.id)}
                            className='p-2 text-green-600 hover:bg-green-50 rounded'
                            title='Approve Request'>
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded'
                            title='Reject Request'>
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Admin View Request Modal */}
        {showRequestModal && selectedRequest && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
              {/* Header */}
              <div className='p-6 border-b border-gray-200'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                      Request Review: {selectedRequest.policyNumber}
                    </h1>
                    <p className='text-sm text-gray-600'>
                      Submitted by: {selectedRequest.contractor?.name} (
                      {selectedRequest.contractor?.companyName})
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className='p-2 hover:bg-gray-100 rounded'>
                    <X size={20} />
                  </button>
                </div>

                {/* Request Info Badges */}
                <div className='flex gap-3 mb-4'>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.requestType === "edit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                    {selectedRequest.requestType === "edit"
                      ? "📝 Edit Request"
                      : "❌ Cancellation Request"}
                  </span>
                  <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm'>
                    ⏳ Pending Review
                  </span>
                  <span className='px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm'>
                    📅{" "}
                    {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className='p-6 overflow-y-auto max-h-[60vh]'>
                {/* Reason Section */}
                <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
                  <h3 className='font-medium text-gray-700 mb-2'>
                    Reason for Request:
                  </h3>
                  <p className='text-gray-800'>
                    {selectedRequest.reason || "No reason provided"}
                  </p>
                </div>

                {/* Current Details */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                    Current Policy Details
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-500'>Policy Holder</p>
                      <p className='font-medium'>
                        {selectedRequest.policyHolderName}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Contractor</p>
                      <p className='font-medium'>
                        {selectedRequest.contractor?.name}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {selectedRequest.contractor?.companyName}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Contractor Email</p>
                      <p className='font-medium'>
                        {selectedRequest.contractor?.email}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Requested On</p>
                      <p className='font-medium'>
                        {new Date(selectedRequest.requestedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes (for edit requests) */}
                {selectedRequest.requestType === "edit" &&
                  selectedRequest.changes && (
                    <div className='mb-6'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                        Requested Changes
                      </h3>
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b'>
                              <th className='text-left py-2 text-sm font-medium text-gray-700'>
                                Field
                              </th>
                              <th className='text-left py-2 text-sm font-medium text-gray-700'>
                                Current Value
                              </th>
                              <th className='text-left py-2 text-sm font-medium text-gray-700'>
                                Requested Change
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedRequest.changes).map(
                              ([field, newValue]) => (
                                <tr key={field} className='border-b'>
                                  <td className='py-2 text-sm capitalize'>
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </td>
                                  <td className='py-2 text-sm text-gray-600'>
                                    {/* You would need to get current values from database */}
                                    Current value
                                  </td>
                                  <td className='py-2 text-sm font-medium text-blue-600'>
                                    {newValue}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Admin Notes */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                    Admin Notes
                  </h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg'
                    rows='3'
                    placeholder='Add notes for the contractor (optional)...'
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    These notes will be visible to the contractor after
                    decision.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='p-6 border-t border-gray-200 bg-gray-50'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-sm text-gray-600'>
                      Review and take action on this request
                    </p>
                  </div>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to reject this request?"
                          )
                        ) {
                          handleRejectRequest(selectedRequest.id);
                          setShowRequestModal(false);
                        }
                      }}
                      className='px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100'>
                      Reject Request
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to approve this request?"
                          )
                        ) {
                          handleApproveRequest(selectedRequest.id);
                          setShowRequestModal(false);
                        }
                      }}
                      className='px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700'>
                      Approve Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Pending Policy Requests Section */}
        <div className='cols-span-1 bg-white rounded-lg shadow-sm border border-gray-100 mb-6'>
          <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                Pending Policy Requests ({pendingRequests.length})
              </h2>
              <p className='text-sm text-gray-500 mt-1'>
                Edit and cancellation requests from contractors
              </p>
            </div>
            <button
              onClick={handleRefreshRequests}
              disabled={requestsLoading}
              className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50'>
              <RefreshCw
                className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {requestsLoading ? (
            <div className='p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <p className='text-gray-500 mt-2'>Loading requests...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className='p-12 text-center text-gray-500'>
              No pending requests
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Policy Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Contractor
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Request Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Requested At
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {request.policyNumber}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {request.policyHolderName}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {request.contractor?.name || "Unknown"}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {request.contractor?.companyName || "No company"}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {request.contractor?.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.requestType === "edit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {request.requestType === "edit"
                            ? "Edit Request"
                            : "Cancel Request"}
                        </span>
                        {request.reason && (
                          <div
                            className='text-xs text-gray-500 mt-1 max-w-xs truncate'
                            title={request.reason}>
                            Reason: {request.reason}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(request.requestedAt).toLocaleDateString(
                          "en-GB"
                        )}
                        <div className='text-xs'>
                          {new Date(request.requestedAt).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleViewRequest(request)}
                            className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                            title='View Details'>
                            <Eye className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className='p-2 text-green-600 hover:bg-green-50 rounded'
                            title='Approve Request'>
                            <CheckCircle className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded'
                            title='Reject Request'>
                            <XCircle className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>Months Premium Total</div>
            <div className='bg-blue-50 p-2 rounded'>
              <DollarSign className='w-5 h-5 text-blue-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            £
            {stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
          <div className='flex items-center justify-between mb-3'>
            <div className='text-gray-600 text-sm'>Edit Request Pending</div>
            <div className='bg-yellow-50 p-2 rounded'>
              <FileText className='w-5 h-5 text-yellow-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-gray-900'>
            {pendingRequests?.length}
          </div>
        </div>
      </div>
    </div>
  );
}
