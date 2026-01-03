// "use client";

// import {
//   Calendar,
//   CheckCircle,
//   DollarSign,
//   Eye,
//   FileText,
//   Loader2,
//   RefreshCw,
//   TrendingUp,
//   Users,
//   X,
//   XCircle,
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";

// export default function AdminDashboard() {
//   const router = useRouter();
//   const [pendingUsers, setPendingUsers] = useState([]);
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [requestsLoading, setRequestsLoading] = useState(false);

//   const [showRequestModal, setShowRequestModal] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [adminNotes, setAdminNotes] = useState("");
//   const [monthlyStats, setMonthlyStats] = useState([]);
//   const [topContractors, setTopContractors] = useState([]);
//   const [stats, setStats] = useState({
//     totalCertificates: 0,
//     totalContractors: 0,
//     totalRevenue: 0,
//     thisMonthCertificates: 0,
//     totalPolicies: 0,
//     premiumTotal: 0,
//     thisMonthPolicies: 0,
//     editRequests: 0,
//   });

//   // Check if user is admin AND fetch data
//   const checkAdminAndLoadData = useCallback(async () => {
//     try {
//       // Check if user is admin using the main admin endpoint
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
//         setStats((prev) => ({
//           ...prev,
//           ...statsData.stats, // Merge with existing stats
//         }));
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       router.push("/login");
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   // Fetch pending requests
//   const fetchPendingRequests = useCallback(async () => {
//     try {
//       setRequestsLoading(true);
//       const url = "/api/admin/contractor?type=requests&status=pending";
//       console.log("Fetching from URL:", url);

//       const response = await fetch(url);
//       console.log("Response status:", response.status);

//       const data = await response.json();
//       console.log("Full API response:", data);

//       if (response.ok && data.success) {
//         console.log("Requests array received:", data.requests);
//         setPendingRequests(data.requests || []);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setRequestsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     checkAdminAndLoadData();
//     fetchPendingRequests();
//   }, [checkAdminAndLoadData, fetchPendingRequests]);

//   const handleApproveUser = async (userId) => {
//     alert("Are You Sure?");
//     try {
//       const res = await fetch("/api/admin/approve-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ userId }),
//       });

//       const data = await res.json();
//       checkAdminAndLoadData();

//       if (data.success) {
//         // Remove approved user from list
//         setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

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

//   const handleRejectUser = async (userId) => {
//     alert("Are You Sure?");
//     try {
//       const res = await fetch("/api/admin/reject-user", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ userId }),
//       });

//       const data = await res.json();
//       checkAdminAndLoadData();

//       if (data.success) {
//         // Remove rejected user from list
//         setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

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

//   // useEffect(() => {
//   //   checkAdminAndLoadData();
//   // }, [handleRejectUser, handleApproveUser]);
//   const handleApproveRequest = async (requestId) => {
//     try {
//       const res = await fetch(`/api/admin/contractor/${requestId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           action: "approve",
//           notes: adminNotes || "Request approved by admin",
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Remove from list
//         setPendingRequests((prev) =>
//           prev.filter((req) => req.id !== requestId)
//         );
//         setStats((prev) => ({
//           ...prev,
//           editRequests: Math.max(0, prev.editRequests - 1),
//         }));
//         alert("Request approved successfully!");
//       } else {
//         alert(data.error || "Failed to approve request");
//       }
//     } catch (error) {
//       console.error("Approve request error:", error);
//       alert("Failed to approve request");
//     }
//   };
//   const handleRejectRequest = async (requestId) => {
//     try {
//       const res = await fetch(`/api/admin/contractor/${requestId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           action: "reject",
//           notes: adminNotes || "Request rejected by admin",
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Remove from list
//         setPendingRequests((prev) =>
//           prev.filter((req) => req.id !== requestId)
//         );
//         setStats((prev) => ({
//           ...prev,
//           editRequests: Math.max(0, prev.editRequests - 1),
//         }));
//         alert("Request rejected successfully!");
//       } else {
//         alert(data.error || "Failed to reject request");
//       }
//     } catch (error) {
//       console.error("Reject request error:", error);
//       alert("Failed to reject request");
//     }
//   };

//   const handleViewRequest = (request) => {
//     setSelectedRequest(request);
//     setAdminNotes("");
//     setShowRequestModal(true);
//   };

//   const handleRefreshRequests = () => {
//     fetchPendingRequests();
//     checkAdminAndLoadData();
//   };

//   // graph bar
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       // Fetch all data in parallel
//       const [statsRes, monthlyRes, contractorsRes] = await Promise.all([
//         fetch("/api/admin/certificates/stats"),
//         fetch("/api/admin/certificates/monthly-stats"),
//         fetch("/api/admin/certificates/top-contractors"),
//       ]);

//       const [statsData, monthlyData, contractorsData] = await Promise.all([
//         statsRes.json(),
//         monthlyRes.json(),
//         contractorsRes.json(),
//       ]);

//       if (statsData.success) {
//         setStats({
//           totalCertificates: statsData.totalCertificates || 0,
//           totalContractors: statsData.totalContractors || 0,
//           totalRevenue: statsData.totalRevenue || 0,
//           thisMonthCertificates: statsData.thisMonthCertificates || 0,
//           totalPolicies: statsData.totalCertificates || 0, // Map totalCertificates to totalPolicies
//           premiumTotal: statsData.totalRevenue || 0, // Map totalRevenue to premiumTotal
//           thisMonthPolicies: statsData.thisMonthCertificates || 0,
//           editRequests: 0, // You'll need to fetch this separately
//         });
//       }

//       if (monthlyData.success) {
//         setMonthlyStats(monthlyData.data || []);
//       }

//       if (contractorsData.success) {
//         setTopContractors(contractorsData.contractors || []);
//       }
//     } catch (error) {
//       console.error("Dashboard data error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // Handle month click
//   const handleMonthClick = (monthNumber) => {
//     router.push(`/admin/certificates/month/${monthNumber}`);
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     // Handle undefined/null/NaN
//     const safeAmount = amount || 0;
//     return new Intl.NumberFormat("en-GB", {
//       style: "currency",
//       currency: "GBP",
//       minimumFractionDigits: 2,
//     }).format(safeAmount);
//   };
//   // Find max value for chart scaling
//   const maxValue =
//     monthlyStats.length > 0
//       ? Math.max(...monthlyStats.map((item) => item.value))
//       : 200; // Default max

//   if (loading) {
//     return (
//       <div className='min-h-screen bg-gray-50 p-8 flex items-center justify-center'>
//         <div className='text-center'>
//           <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-3' />
//           <p className='text-gray-600'>Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='min-h-screen  mt-12 md:mt-0'>
//       {/* Header */}
//       <div className='bg-[#0F47A8] to-blue-600 text-white p-8 rounded-lg mb-6'>
//         <h1 className='text-3xl font-semibold flex items-center gap-2'>
//           Welcome Back, Admin 👋
//         </h1>
//       </div>

//       {/* Stats Grid */}
//       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>Total Policies</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <FileText className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             {stats.totalPolicies}
//           </div>
//         </div>

//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>Premium Total</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <DollarSign className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             £
//             {stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//         </div>

//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>This Month Policies</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <Calendar className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             {stats.thisMonthPolicies}
//           </div>
//         </div>

//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>Total Contractors</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <Users className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             {stats.totalContractors}
//           </div>
//         </div>

//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>Months Premium Total</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <DollarSign className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             £
//             {stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//         </div>

//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex items-center justify-between mb-3'>
//             <div className='text-gray-600 text-sm'>Edit Request Pending</div>
//             <div className='bg-[#EAF1FD] p-2 rounded'>
//               <FileText className='w-5 h-5 text-[#0F47A8]' />
//             </div>
//           </div>
//           <div className='text-3xl font-bold text-gray-900'>
//             {stats.editRequests}
//           </div>
//         </div>
//       </div>

//       <div className='grid mt-16'>
//         {/* Pending Approvals Section */}
//         <div className='cols-span-2 bg-white rounded-lg shadow-sm border border-gray-100 mb-6'>
//           <div className='px-6 py-4 border-b border-gray-200'>
//             <h2 className='text-xl font-semibold text-gray-900'>
//               New Contractor Request ({pendingUsers.length})
//             </h2>
//           </div>

//           {pendingUsers.length === 0 ? (
//             <div className='p-12 text-center text-gray-500'>
//               No pending approvals
//             </div>
//           ) : (
//             <div className='overflow-x-auto'>
//               <table className='w-full'>
//                 <thead className='bg-gray-50 border-b border-gray-200'>
//                   <tr>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Apply Date
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Company Name
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Contractor Name
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Email Address
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className='bg-white divide-y divide-gray-200'>
//                   {pendingUsers.map((user) => (
//                     <tr key={user.id || user._id} className='hover:bg-gray-50'>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
//                         {new Date(user.createdAt).toLocaleDateString("en-GB")}
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
//                         {user.companyName}
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
//                         {user.name}
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
//                         {user.email}
//                       </td>
//                       {/* In the pending requests table, update the actions column */}
//                       <td className='px-6 py-4 whitespace-nowrap text-sm'>
//                         <div className='flex items-center gap-2'>
//                           <button
//                             onClick={() => handleViewRequest(user.id)}
//                             className='p-2 text-gray-600 hover:bg-gray-100 rounded'
//                             title='View Request Details'>
//                             <Eye size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleApproveUser(user.id)}
//                             className='p-2 text-green-600 hover:bg-green-50 rounded'
//                             title='Approve Request'>
//                             <CheckCircle size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleRejectUser(user.id)}
//                             className='p-2 text-red-600 hover:bg-red-50 rounded'
//                             title='Reject Request'>
//                             <XCircle size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//         {/* Admin View Request Modal */}
//         {showRequestModal && selectedRequest && (
//           <div className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50'>
//             <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
//               {/* Header */}
//               <div className='p-6 border-b border-gray-200'>
//                 <div className='flex items-center justify-between mb-4'>
//                   <div>
//                     <h1 className='text-2xl font-bold text-gray-900'>
//                       Request Review: {selectedRequest.policyNumber}
//                     </h1>
//                     <p className='text-sm text-gray-600'>
//                       Submitted by: {selectedRequest.contractor?.name} (
//                       {selectedRequest.contractor?.companyName})
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setShowRequestModal(false)}
//                     className='p-2 hover:bg-gray-100 rounded'>
//                     <X size={20} />
//                   </button>
//                 </div>

//                 {/* Request Info Badges */}
//                 <div className='flex gap-3 mb-4'>
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       selectedRequest.requestType === "edit"
//                         ? "bg-blue-100 text-blue-800"
//                         : "bg-red-100 text-red-800"
//                     }`}>
//                     {selectedRequest.requestType === "edit"
//                       ? "📝 Edit Request"
//                       : "❌ Cancellation Request"}
//                   </span>
//                   <span className='px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm'>
//                     ⏳ Pending Review
//                   </span>
//                   <span className='px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm'>
//                     📅{" "}
//                     {new Date(selectedRequest.requestedAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>

//               {/* Main Content */}
//               <div className='p-6 overflow-y-auto max-h-[60vh]'>
//                 {/* Reason Section */}
//                 <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
//                   <h3 className='font-medium text-gray-700 mb-2'>
//                     Reason for Request:
//                   </h3>
//                   <p className='text-gray-800'>
//                     {selectedRequest.reason || "No reason provided"}
//                   </p>
//                 </div>

//                 {/* Current Details */}
//                 <div className='mb-6'>
//                   <h3 className='text-lg font-semibold text-gray-800 mb-3'>
//                     Current Policy Details
//                   </h3>
//                   <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                     <div>
//                       <p className='text-sm text-gray-500'>Policy Holder</p>
//                       <p className='font-medium'>
//                         {selectedRequest.policyHolderName}
//                       </p>
//                     </div>
//                     <div>
//                       <p className='text-sm text-gray-500'>Contractor</p>
//                       <p className='font-medium'>
//                         {selectedRequest.contractor?.name}
//                       </p>
//                       <p className='text-sm text-gray-600'>
//                         {selectedRequest.contractor?.companyName}
//                       </p>
//                     </div>
//                     <div>
//                       <p className='text-sm text-gray-500'>Contractor Email</p>
//                       <p className='font-medium'>
//                         {selectedRequest.contractor?.email}
//                       </p>
//                     </div>
//                     <div>
//                       <p className='text-sm text-gray-500'>Requested On</p>
//                       <p className='font-medium'>
//                         {new Date(selectedRequest.requestedAt).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Changes (for edit requests) */}
//                 {selectedRequest.requestType === "edit" &&
//                   selectedRequest.changes && (
//                     <div className='mb-6'>
//                       <h3 className='text-lg font-semibold text-gray-800 mb-3'>
//                         Requested Changes
//                       </h3>
//                       <div className='bg-gray-50 p-4 rounded-lg'>
//                         <table className='w-full'>
//                           <thead>
//                             <tr className='border-b'>
//                               <th className='text-left py-2 text-sm font-medium text-gray-700'>
//                                 Field
//                               </th>
//                               <th className='text-left py-2 text-sm font-medium text-gray-700'>
//                                 Current Value
//                               </th>
//                               <th className='text-left py-2 text-sm font-medium text-gray-700'>
//                                 Requested Change
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {Object.entries(selectedRequest.changes).map(
//                               ([field, newValue]) => (
//                                 <tr key={field} className='border-b'>
//                                   <td className='py-2 text-sm capitalize'>
//                                     {field.replace(/([A-Z])/g, " $1")}
//                                   </td>
//                                   <td className='py-2 text-sm text-gray-600'>
//                                     {/* You would need to get current values from database */}
//                                     Current value
//                                   </td>
//                                   <td className='py-2 text-sm font-medium text-blue-600'>
//                                     {newValue}
//                                   </td>
//                                 </tr>
//                               )
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}

//                 {/* Admin Notes */}
//                 <div className='mb-6'>
//                   <h3 className='text-lg font-semibold text-gray-800 mb-3'>
//                     Admin Notes
//                   </h3>
//                   <textarea
//                     value={adminNotes}
//                     onChange={(e) => setAdminNotes(e.target.value)}
//                     className='w-full px-3 py-2 border border-gray-300 rounded-lg'
//                     rows='3'
//                     placeholder='Add notes for the contractor (optional)...'
//                   />
//                   <p className='text-sm text-gray-500 mt-1'>
//                     These notes will be visible to the contractor after
//                     decision.
//                   </p>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className='p-6 border-t border-gray-200 bg-gray-50'>
//                 <div className='flex justify-between items-center'>
//                   <div>
//                     <p className='text-sm text-gray-600'>
//                       Review and take action on this request
//                     </p>
//                   </div>
//                   {/* <div className='flex gap-3'>
//                     <button
//                       onClick={() => {
//                         if (
//                           confirm(
//                             "Are you sure you want to reject this request?"
//                           )
//                         ) {
//                           handleRejectRequest(selectedRequest.id);
//                           setShowRequestModal(false);
//                         }
//                       }}
//                       className='px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100'>
//                       Reject Request
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (
//                           confirm(
//                             "Are you sure you want to approve this request?"
//                           )
//                         ) {
//                           handleApproveRequest(selectedRequest.id);
//                           setShowRequestModal(false);
//                         }
//                       }}
//                       className='px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700'>
//                       Approve Request
//                     </button>
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//         {/* Pending Policy Requests Section */}
//         <div className='cols-span-1 bg-white rounded-lg shadow-sm border border-gray-100 mb-6'>
//           <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
//             <div>
//               <h2 className='text-xl font-semibold text-gray-900'>
//                 Pending Policy Requests ({pendingRequests.length})
//               </h2>
//               <p className='text-sm text-gray-500 mt-1'>
//                 Edit and cancellation requests from contractors
//               </p>
//             </div>
//             <button
//               onClick={handleRefreshRequests}
//               disabled={requestsLoading}
//               className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50'>
//               <RefreshCw
//                 className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
//               />
//               Refresh
//             </button>
//           </div>

//           {requestsLoading ? (
//             <div className='p-12 text-center'>
//               <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
//               <p className='text-gray-500 mt-2'>Loading requests...</p>
//             </div>
//           ) : pendingRequests.length === 0 ? (
//             <div className='p-12 text-center text-gray-500'>
//               No pending requests
//             </div>
//           ) : (
//             <div className='overflow-x-auto'>
//               <table className='w-full'>
//                 <thead className='bg-gray-50 border-b border-gray-200'>
//                   <tr>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Policy Number
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Contractor
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Request Type
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Requested At
//                     </th>
//                     <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className='bg-white divide-y divide-gray-200'>
//                   {pendingRequests.map((request) => (
//                     <tr key={request.id} className='hover:bg-gray-50'>
//                       <td className='px-6 py-4 whitespace-nowrap'>
//                         <div className='text-sm font-medium text-gray-900'>
//                           {request.policyNumber}
//                         </div>
//                         <div className='text-xs text-gray-500'>
//                           {request.policyHolderName}
//                         </div>
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap'>
//                         <div className='text-sm text-gray-900'>
//                           {request.contractor?.name || "Unknown"}
//                         </div>
//                         <div className='text-xs text-gray-500'>
//                           {request.contractor?.companyName || "No company"}
//                         </div>
//                         <div className='text-xs text-gray-500'>
//                           {request.contractor?.email}
//                         </div>
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap'>
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             request.requestType === "edit"
//                               ? "bg-blue-100 text-blue-800"
//                               : "bg-red-100 text-red-800"
//                           }`}>
//                           {request.requestType === "edit"
//                             ? "Edit Request"
//                             : "Cancel Request"}
//                         </span>
//                         {request.reason && (
//                           <div
//                             className='text-xs text-gray-500 mt-1 max-w-xs truncate'
//                             title={request.reason}>
//                             Reason: {request.reason}
//                           </div>
//                         )}
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
//                         {new Date(request.requestedAt).toLocaleDateString(
//                           "en-GB"
//                         )}
//                         <div className='text-xs'>
//                           {new Date(request.requestedAt).toLocaleTimeString(
//                             "en-GB",
//                             {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             }
//                           )}
//                         </div>
//                       </td>
//                       <td className='px-6 py-4 whitespace-nowrap text-sm'>
//                         <div className='flex gap-2'>
//                           <button
//                             onClick={() => handleViewRequest(request.id)}
//                             className='p-2 text-gray-600 hover:bg-gray-100 rounded'
//                             title='View Details'>
//                             <Eye className='w-4 h-4' />
//                           </button>
//                           <button
//                             onClick={() => handleApproveRequest(request.id)}
//                             className='p-2 text-green-600 hover:bg-green-50 rounded'
//                             title='Approve Request'>
//                             <CheckCircle className='w-4 h-4' />
//                           </button>
//                           <button
//                             onClick={() => handleRejectRequest(request.id)}
//                             className='p-2 text-red-600 hover:bg-red-50 rounded'
//                             title='Reject Request'>
//                             <XCircle className='w-4 h-4' />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6'>
//         {/* Bar Chart - Insurance Backed Guarantee Policies */}
//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex justify-between items-center mb-6'>
//             <h3 className='text-lg font-semibold text-gray-900'>
//               Insurance Backed Guarantee Policies
//             </h3>
//             <span className='text-sm text-gray-500'>
//               {new Date().getFullYear()}
//             </span>
//           </div>
//           <div className='relative'>
//             {/* Y-axis labels */}
//             <div className='absolute left-0 top-0 flex flex-col justify-between h-64 text-xs text-gray-500 pr-2'>
//               <span>{maxValue}</span>
//               <span>{Math.round(maxValue * 0.75)}</span>
//               <span>{Math.round(maxValue * 0.5)}</span>
//               <span>{Math.round(maxValue * 0.25)}</span>
//               <span>0</span>
//             </div>

//             {/* Chart bars */}
//             <div className='ml-4 md:ml-8 h-64 border-l border-b border-gray-200 pl-4 pb-8'>
//               <div className='grid grid-cols-2 sm:grid-cols-3 md:flex items-end justify-between gap-3 h-full'>
//                 {monthlyStats.map((data, index) => (
//                   <div
//                     key={index}
//                     className='flex flex-col items-center flex-1'>
//                     <button
//                       onClick={() => handleMonthClick(data.monthNumber)}
//                       className='w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative'
//                       style={{
//                         height: `${(data.value / maxValue) * 100}%`,
//                         minHeight: "10px",
//                       }}
//                       title={`${data.month}: ${data.value} certificates`}>
//                       <div className='absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
//                         {data.value} certificates
//                       </div>
//                     </button>

//                     <span className='text-xs text-gray-600 mt-3 whitespace-nowrap'>
//                       {data.month}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Top Contractors Table */}
//         <div className='bg-white rounded-lg shadow-sm p-6 border border-gray-100'>
//           <div className='flex justify-between items-center mb-6'>
//             <h3 className='text-lg font-semibold text-gray-900'>
//               Top Contractors
//             </h3>
//             <Link
//               href='/admin/manage-contractors'
//               className='text-sm text-blue-600 hover:text-blue-800 hover:underline'>
//               View All →
//             </Link>
//           </div>
//           <div className='overflow-x-auto'>
//             <table className='w-full'>
//               <thead className='border-b border-gray-200'>
//                 <tr>
//                   <th className='text-left text-xs font-medium text-gray-600 pb-3'>
//                     #
//                   </th>
//                   <th className='text-left text-xs font-medium text-gray-600 pb-3'>
//                     Contractor Name
//                   </th>
//                   <th className='text-left text-xs font-medium text-gray-600 pb-3'>
//                     Company Name
//                   </th>
//                   <th className='text-left text-xs font-medium text-gray-600 pb-3'>
//                     Total Certificate
//                   </th>
//                   <th className='text-left text-xs font-medium text-gray-600 pb-3'>
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className='divide-y divide-gray-100'>
//                 {topContractors.map((contractor, index) => (
//                   <tr key={contractor.userId} className='hover:bg-gray-50'>
//                     <td className='py-4 text-sm text-gray-500 font-medium'>
//                       {index + 1}
//                     </td>
//                     <td className='py-4 text-sm text-gray-900'>
//                       {contractor.name}
//                     </td>
//                     <td className='py-4 text-sm text-gray-900'>
//                       {contractor.companyName}
//                     </td>
//                     <td className='py-4 text-sm text-gray-900 font-medium'>
//                       {contractor.certificates}
//                     </td>
//                     <td className='py-4'>
//                       <div className='flex items-center gap-3'>
//                         <Link
//                           href={`/admin/manage-contractors/${contractor.userId}`}
//                           className='text-blue-600 hover:text-blue-700 p-1'
//                           title='View Contractor'>
//                           <Eye className='w-4 h-4' />
//                         </Link>
//                         <Link
//                           href={`/admin/certificates?contractorId=${contractor.userId}`}
//                           className='text-gray-600 hover:text-gray-700 p-1'
//                           title='View Certificates'>
//                           <FileText className='w-4 h-4' />
//                         </Link>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       {/* Additional Stats */}
//     </div>
//   );
// }

"use client";

import { downloadPdf } from "@/utils/pdfGenerator";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Download as DownloadIcon,
  Eye,
  FileText,
  Loader2,
  Menu,
  RefreshCw,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
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
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [topContractors, setTopContractors] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalContractors: 0,
    totalRevenue: 0,
    thisMonthCertificates: 0,
    totalPolicies: 0,
    premiumTotal: 0,
    thisMonthPolicies: 0,
    editRequests: 0,
  });

  const downloadContractorCertificates = async (
    contractorId,
    contractorName
  ) => {
    try {
      // Show confirmation
      if (!confirm(`Download all certificates for ${contractorName}?`)) {
        return;
      }

      // Show loading state
      const loadingDiv = document.createElement("div");
      loadingDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          margin: 1rem;
        ">
          <Loader2 class="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem;">
            Downloading Certificates
          </h3>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">
            Please wait while we prepare ${contractorName}'s certificates...
          </p>
          <div style="
            width: 100%;
            background: #e5e7eb;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
          ">
            <div id="progressBar" style="
              width: 0%;
              height: 100%;
              background: #0F47A8;
              transition: width 0.3s;
            "></div>
          </div>
        </div>
      </div>
    `;
      document.body.appendChild(loadingDiv);

      // Fetch contractor details
      const contractorRes = await fetch(
        `/api/admin/contractor/${contractorId}`
      );

      if (!contractorRes.ok) {
        throw new Error(`Failed to fetch contractor: ${contractorRes.status}`);
      }

      const contractorData = await contractorRes.json();

      if (!contractorData.success) {
        throw new Error(
          contractorData.error || "Failed to fetch contractor data"
        );
      }

      const contractor = contractorData.contractor;

      // Fetch certificates for this contractor
      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractorId}`
      );

      if (!certsRes.ok) {
        throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
      }

      const certsData = await certsRes.json();

      if (
        certsData.success &&
        certsData.certificates &&
        certsData.certificates.length > 0
      ) {
        const certificates = certsData.certificates;
        const total = certificates.length;

        // Download each certificate as separate PDF
        for (let i = 0; i < certificates.length; i++) {
          const certificate = certificates[i];

          // Update progress
          const progress = ((i + 1) / total) * 100;
          const progressBar = document.getElementById("progressBar");
          if (progressBar) {
            progressBar.style.width = `${progress}%`;
          }

          // Download PDF
          await downloadPdf(certificate, contractor);

          // Add a small delay between downloads
          if (i < certificates.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Remove loading overlay
        document.body.removeChild(loadingDiv);

        // Show success message
        alert(
          `Successfully downloaded ${certificates.length} certificate(s) for ${contractorName}`
        );
      } else {
        // Remove loading overlay
        document.body.removeChild(loadingDiv);
        alert(`No certificates found for ${contractorName}`);
      }
    } catch (error) {
      console.error("Download error:", error);

      // Remove loading overlay if it exists
      const loadingOverlay = document.querySelector(
        'div[style*="position: fixed; top: 0"]'
      );
      if (loadingOverlay) {
        document.body.removeChild(loadingOverlay);
      }

      alert(`Error: ${error.message}`);
    }
  };
  // Check if user is admin AND fetch data
  const checkAdminAndLoadData = useCallback(async () => {
    try {
      const adminCheck = await fetch("/api/admin");

      if (adminCheck.status === 403) {
        router.push("/login");
        return;
      }

      if (!adminCheck.ok) {
        throw new Error("Admin check failed");
      }

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
        setStats((prev) => ({
          ...prev,
          ...statsData.stats,
        }));
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
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
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
    if (!confirm("Are You Sure?")) return;

    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        // Immediately update state
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Update stats immediately
        setStats((prev) => ({
          ...prev,
          totalContractors: prev.totalContractors + 1,
          // If you have pendingApprovals in stats
          pendingApprovals: prev.pendingApprovals
            ? prev.pendingApprovals - 1
            : prev.pendingApprovals,
        }));

        // Show success message
        alert("User approved successfully!");
      } else {
        alert(data.error || "Failed to approve user");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Failed to approve user");
    }
  };
  const handleRejectUser = async (userId) => {
    if (!confirm("Are You Sure?")) return;

    try {
      const res = await fetch("/api/admin/reject-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        // Immediately update state
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId));

        // Update stats if needed
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals
            ? prev.pendingApprovals - 1
            : prev.pendingApprovals,
        }));

        alert("User rejected successfully!");
      } else {
        alert(data.error || "Failed to reject user");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("Failed to reject user");
    }
  };

  // useEffect(() => {
  //   checkAdminAndLoadData();
  // }, [handleRejectUser, handleApproveUser]);
  const handleApproveRequest = async (requestId) => {
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
        // Remove from list immediately
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== requestId)
        );

        // Update stats immediately
        setStats((prev) => ({
          ...prev,
          editRequests: Math.max(0, prev.editRequests - 1),
        }));

        // Close modal if open
        if (showRequestModal) {
          setShowRequestModal(false);
        }

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
  const handleViewRequest = async (requestId) => {
    try {
      // First try to find the request in the existing array
      const existingRequest = pendingRequests.find(
        (req) => req.id === requestId
      );

      // Also check in pendingUsers for user approval requests
      const existingUser = pendingUsers.find((user) => user.id === requestId);

      // If found, use it directly
      if (existingRequest) {
        setSelectedRequest(existingRequest);
        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }

      // If it's a user request
      if (existingUser) {
        setSelectedRequest({
          ...existingUser,
          requestType: "user_approval",
          policyNumber: `USER-${existingUser.id}`,
          policyHolderName: existingUser.name,
          reason: "New contractor registration",
          requestedAt: existingUser.createdAt,
        });
        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }

      // If not found locally, try to fetch from API
      console.log("Fetching request details for ID:", requestId);
      const response = await fetch(
        `/api/admin/contractor/${requestId}/details`
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();

      if (data.success) {
        setSelectedRequest(data.request);
      } else {
        // Create a fallback request object
        setSelectedRequest({
          id: requestId,
          requestType: "unknown",
          policyNumber: "N/A",
          policyHolderName: "Unknown",
          reason: "Details not available",
          requestedAt: new Date().toISOString(),
        });
      }

      setAdminNotes("");
      setShowRequestModal(true);
    } catch (error) {
      console.error("Error fetching request details:", error);

      // Create a basic request object
      setSelectedRequest({
        id: requestId,
        requestType: "error",
        policyNumber: "ERROR",
        policyHolderName: "Error Loading",
        reason: "Failed to load request details: " + error.message,
        requestedAt: new Date().toISOString(),
      });

      setAdminNotes("");
      setShowRequestModal(true);
    }
  };
  const handleRefreshRequests = () => {
    fetchPendingRequests();
    checkAdminAndLoadData();
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes, contractorsRes] = await Promise.all([
        fetch("/api/admin/certificates/stats"),
        fetch("/api/admin/certificates/monthly-stats"),
        fetch("/api/admin/certificates/top-contractors"),
      ]);

      const [statsData, monthlyData, contractorsData] = await Promise.all([
        statsRes.json(),
        monthlyRes.json(),
        contractorsRes.json(),
      ]);

      if (statsData.success) {
        setStats({
          totalCertificates: statsData.totalCertificates || 0,
          totalContractors: statsData.totalContractors || 0,
          totalRevenue: statsData.totalRevenue || 0,
          thisMonthCertificates: statsData.thisMonthCertificates || 0,
          totalPolicies: statsData.totalCertificates || 0,
          premiumTotal: statsData.totalRevenue || 0,
          thisMonthPolicies: statsData.thisMonthCertificates || 0,
          editRequests: 0,
        });
      }

      if (monthlyData.success) {
        setMonthlyStats(monthlyData.data || []);
      }

      if (contractorsData.success) {
        setTopContractors(contractorsData.contractors || []);
      }
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMonthClick = (monthNumber) => {
    router.push(`/admin/certificates/month/${monthNumber}`);
  };

  const formatCurrency = (amount) => {
    const safeAmount = amount || 0;
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(safeAmount);
  };

  const maxValue =
    monthlyStats.length > 0
      ? Math.max(...monthlyStats.map((item) => item.value))
      : 200;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-3' />
          <p className='text-gray-600'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 mt-12 md:mt-0 p-2 md:p-6'>
      {/* Mobile Header */}
      <div className='md:hidden bg-[#0F47A8] text-white p-4 sticky top-0 z-10'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Admin Dashboard</h1>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-2'>
            <Menu size={24} />
          </button>
        </div>
        {isMenuOpen && (
          <div className='mt-4 bg-blue-700 rounded-lg p-3'>
            <p className='text-sm opacity-90'>Welcome Back, Admin 👋</p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className='hidden md:block bg-[#0F47A8] text-white p-6 md:p-8 rounded-lg mb-4 md:mb-6 mx-4 md:mx-0'>
        <h1 className='text-2xl md:text-3xl font-semibold flex items-center gap-2'>
          Welcome Back, Admin 👋
        </h1>
      </div>

      {/* Stats Grid - Responsive */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 px-4 md:px-0'>
        {[
          {
            title: "Total Policies",
            value: stats.totalPolicies,
            icon: FileText,
            color: "#0F47A8",
          },
          {
            title: "Premium Total",
            value: `£${stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: DollarSign,
            color: "#0F47A8",
          },
          {
            title: "This Month Policies",
            value: stats.thisMonthPolicies,
            icon: Calendar,
            color: "#0F47A8",
          },
          {
            title: "Total Contractors",
            value: stats.totalContractors,
            icon: Users,
            color: "#0F47A8",
          },
          {
            title: "Months Premium Total",
            value: `£${stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: DollarSign,
            color: "#0F47A8",
          },
          {
            title: "Edit Request Pending",
            value: stats.editRequests,
            icon: FileText,
            color: "#0F47A8",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className='bg-white rounded-lg shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100'>
            <div className='flex items-center justify-between mb-2 md:mb-3'>
              <div className='text-xs md:text-sm text-gray-600 truncate'>
                {stat.title}
              </div>
              <div className='bg-[#EAF1FD] p-1.5 md:p-2 rounded'>
                <stat.icon className='w-4 h-4 md:w-5 md:h-5 text-[#0F47A8]' />
              </div>
            </div>
            <div className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate'>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Sections Container */}
      <div className='px-4 md:px-0 space-y-4 md:space-y-6'>
        {/* Pending Approvals - Mobile Card View */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
          <div className='px-4 md:px-6 py-3 md:py-4 border-b border-gray-200'>
            <h2 className='text-lg md:text-xl font-semibold text-gray-900'>
              New Contractor Request ({pendingUsers.length})
            </h2>
          </div>

          {pendingUsers.length === 0 ? (
            <div className='p-8 md:p-12 text-center text-gray-500'>
              No pending approvals
            </div>
          ) : (
            <div className='overflow-x-auto'>
              {/* Mobile Card View */}
              <div className='md:hidden divide-y divide-gray-200'>
                {pendingUsers.map((user) => (
                  <div key={user.id || user._id} className='p-4'>
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {user.companyName}
                        </h3>
                        <p className='text-sm text-gray-600'>{user.name}</p>
                        <p className='text-xs text-gray-500'>{user.email}</p>
                      </div>
                      <span className='text-xs text-gray-500'>
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className='flex justify-end gap-2 mt-3'>
                      {/* <button
                        onClick={() => handleViewRequest(user.id)}
                        className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                        title='View'>
                        <Eye size={16} />
                      </button> */}
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className='p-2 text-green-600 hover:bg-green-50 rounded'
                        title='Approve'>
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded'
                        title='Reject'>
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className='hidden md:table w-full'>
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
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <div className='flex items-center gap-2'>
                          {/* <button
                            onClick={() => handleViewRequest(user.id)}
                            className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                            title='View Request Details'>
                            <Eye size={16} />
                          </button> */}
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

        {/* Pending Policy Requests - Mobile Card View */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-100'>
          <div className='px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3'>
            <div>
              <h2 className='text-lg md:text-xl font-semibold text-gray-900'>
                Pending Policy Requests ({pendingRequests.length})
              </h2>
              <p className='text-xs md:text-sm text-gray-500 mt-1'>
                Edit and cancellation requests
              </p>
            </div>
            <button
              onClick={handleRefreshRequests}
              disabled={requestsLoading}
              className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 self-end md:self-auto'>
              <RefreshCw
                className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
              />
              <span className='hidden md:inline'>Refresh</span>
            </button>
          </div>

          {requestsLoading ? (
            <div className='p-8 md:p-12 text-center'>
              <div className='inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600'></div>
              <p className='text-gray-500 mt-2 text-sm md:text-base'>
                Loading requests...
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className='p-8 md:p-12 text-center text-gray-500'>
              No pending requests
            </div>
          ) : (
            <div className='overflow-x-auto'>
              {/* Mobile Card View */}
              <div className='md:hidden divide-y divide-gray-200'>
                {pendingRequests.map((request) => (
                  <div key={request.id} className='p-4'>
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <h3 className='font-medium text-gray-900'>
                          {request.policyNumber}
                        </h3>
                        <p className='text-sm text-gray-600'>
                          {request.policyHolderName}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.requestType === "edit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {request.requestType === "edit" ? "Edit" : "Cancel"}
                      </span>
                    </div>
                    <div className='mb-3'>
                      <p className='text-sm text-gray-900'>
                        {request.contractor?.name || "Unknown"}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {request.contractor?.companyName || "No company"}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {request.contractor?.email}
                      </p>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        {new Date(request.requestedAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                      <div className='flex gap-1'>
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                          title='View'>
                          <Eye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className='p-2 text-green-600 hover:bg-green-50 rounded'
                          title='Approve'>
                          <CheckCircle className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className='p-2 text-red-600 hover:bg-red-50 rounded'
                          title='Reject'>
                          <XCircle className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className='hidden md:table w-full'>
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
                            onClick={() => handleViewRequest(request.id)}
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

      {/* Charts Section - Responsive */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 px-4 md:px-0'>
        {/* Bar Chart */}
        <div className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2'>
            <h3 className='text-base md:text-lg font-semibold text-gray-900'>
              Insurance Policies
            </h3>
            <span className='text-xs md:text-sm text-gray-500'>
              {new Date().getFullYear()}
            </span>
          </div>
          <div className='relative'>
            <div className='absolute left-0 top-0 flex flex-col justify-between h-48 md:h-64 text-xs text-gray-500 pr-2'>
              <span className='text-[10px] md:text-xs'>{maxValue}</span>
              <span className='text-[10px] md:text-xs'>
                {Math.round(maxValue * 0.75)}
              </span>
              <span className='text-[10px] md:text-xs'>
                {Math.round(maxValue * 0.5)}
              </span>
              <span className='text-[10px] md:text-xs'>
                {Math.round(maxValue * 0.25)}
              </span>
              <span className='text-[10px] md:text-xs'>0</span>
            </div>

            <div className='ml-6 md:ml-8 h-48 md:h-64 border-l border-b border-gray-200 pl-3 md:pl-4 pb-6 md:pb-8'>
              <div className='grid grid-cols-6 md:flex md:flex-row items-end justify-between gap-1 md:gap-3 h-full'>
                {monthlyStats.map((data, index) => (
                  <div
                    key={index}
                    className='flex flex-col items-center flex-1'>
                    <button
                      onClick={() => handleMonthClick(data.monthNumber)}
                      className='w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative'
                      style={{
                        height: `${(data.value / maxValue) * 100}%`,
                        minHeight: "10px",
                      }}
                      title={`${data.month}: ${data.value}`}>
                      <div className='absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50'>
                        {data.value} certificates
                      </div>
                    </button>
                    <span className='text-[10px] md:text-xs text-gray-600 mt-2 md:mt-3 truncate w-full text-center'>
                      {data.month.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Contractors Table */}
        <div className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2'>
            <h3 className='text-base md:text-lg font-semibold text-gray-900'>
              Top Contractors
            </h3>
            <Link
              href='/admin/manage-contractors'
              className='text-sm text-blue-600 hover:text-blue-800 hover:underline self-end sm:self-auto'>
              View All →
            </Link>
          </div>
          <div className='overflow-x-auto'>
            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {topContractors.slice(0, 5).map((contractor, index) => (
                <div
                  key={contractor.userId}
                  className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex justify-between items-start mb-2'>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-medium text-gray-500'>
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          {contractor.name}
                        </h4>
                        <p className='text-xs text-gray-600'>
                          {contractor.companyName}
                        </p>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-gray-900'>
                      {contractor.certificates} certs
                    </span>
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Link
                      href={`/admin/manage-contractors/${contractor.userId}`}
                      className='p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded'
                      title='View'>
                      <Eye className='w-4 h-4' />
                    </Link>
                    <button
                      onClick={() =>
                        downloadContractorCertificates(
                          contractor.userId,
                          contractor.name
                        )
                      }
                      className='p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded'
                      title='Download All Certificates'>
                      <DownloadIcon className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className='hidden md:table w-full'>
              <thead className='border-b border-gray-200'>
                <tr>
                  <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                    #
                  </th>
                  <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                    Contractor Name
                  </th>
                  <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                    Company Name
                  </th>
                  <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                    Total Certificate
                  </th>
                  <th className='text-left text-xs font-medium text-gray-600 pb-3'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {topContractors.map((contractor, index) => (
                  <tr key={contractor.userId} className='hover:bg-gray-50'>
                    <td className='py-4 text-sm text-gray-500 font-medium'>
                      {index + 1}
                    </td>
                    <td className='py-4 text-sm text-gray-900'>
                      {contractor.name}
                    </td>
                    <td className='py-4 text-sm text-gray-900'>
                      {contractor.companyName}
                    </td>
                    <td className='py-4 text-sm text-gray-900 font-medium'>
                      {contractor.certificates}
                    </td>
                    <td className='py-4'>
                      <div className='flex items-center gap-3'>
                        <Link
                          href={`/admin/manage-contractors/${contractor.userId}`}
                          className='text-blue-600 hover:text-blue-700 p-1'
                          title='View Contractor'>
                          <Eye className='w-4 h-4' />
                        </Link>
                        <button
                          onClick={() =>
                            downloadContractorCertificates(
                              contractor.userId,
                              contractor.name
                            )
                          }
                          className='p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded'
                          title='Download All Certificates'>
                          <DownloadIcon className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Modal - Mobile Responsive */}
      {showRequestModal && selectedRequest && (
        <div className='fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-2 md:p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] md:max-h-[80vh] overflow-hidden my-auto'>
            {/* Header */}
            <div className='p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex-1 min-w-0'>
                  <h1 className='text-lg md:text-2xl font-bold text-gray-900 truncate'>
                    Request: {selectedRequest.policyNumber}
                  </h1>
                  <p className='text-xs md:text-sm text-gray-600 truncate'>
                    By: {selectedRequest.contractor?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className='p-1 md:p-2 hover:bg-gray-100 rounded shrink-0'>
                  <X size={20} />
                </button>
              </div>

              {/* Badges */}
              <div className='flex flex-wrap gap-2'>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.requestType === "edit"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                  {selectedRequest.requestType === "edit" ? "Edit" : "Cancel"}
                </span>
                <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
                  Pending
                </span>
                <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs'>
                  {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className='p-4 md:p-6 overflow-y-auto max-h-[60vh]'>
              {/* Reason */}
              <div className='mb-4 p-3 md:p-4 bg-blue-50 rounded-lg'>
                <h3 className='font-medium text-gray-700 mb-1 text-sm md:text-base'>
                  Reason:
                </h3>
                <p className='text-gray-800 text-sm md:text-base'>
                  {selectedRequest.reason || "No reason provided"}
                </p>
              </div>

              {/* Current Details */}
              <div className='mb-4'>
                <h3 className='text-base md:text-lg font-semibold text-gray-800 mb-2'>
                  Current Policy
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500'>
                      Policy Holder
                    </p>
                    <p className='font-medium text-sm md:text-base'>
                      {selectedRequest.policyHolderName}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500'>
                      Contractor
                    </p>
                    <p className='font-medium text-sm md:text-base'>
                      {selectedRequest.contractor?.name}
                    </p>
                    <p className='text-xs text-gray-600'>
                      {selectedRequest.contractor?.companyName}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500'>
                      Contractor Email
                    </p>
                    <p className='font-medium text-sm md:text-base'>
                      {selectedRequest.contractor?.email}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs md:text-sm text-gray-500'>
                      Requested On
                    </p>
                    <p className='font-medium text-sm md:text-base'>
                      {new Date(selectedRequest.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className='mb-4'>
                <h3 className='text-base md:text-lg font-semibold text-gray-800 mb-2'>
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm md:text-base'
                  rows='2'
                  placeholder='Add notes (optional)...'
                />
                <p className='text-xs text-gray-500 mt-1'>
                  Visible to contractor after decision.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='p-4 md:p-6 border-t border-gray-200 bg-gray-50'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-3'>
                <p className='text-xs md:text-sm text-gray-600 text-center sm:text-left'>
                  Review and take action
                </p>
                <div className='flex gap-2 w-full sm:w-auto'>
                  <button
                    onClick={() => {
                      if (confirm("Reject this request?")) {
                        handleRejectRequest(selectedRequest.id);
                        setShowRequestModal(false);
                      }
                    }}
                    className='flex-1 sm:flex-none px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-sm'>
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Approve this request?")) {
                        handleApproveRequest(selectedRequest.id);
                        setShowRequestModal(false);
                      }
                    }}
                    className='flex-1 sm:flex-none px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 text-sm'>
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
