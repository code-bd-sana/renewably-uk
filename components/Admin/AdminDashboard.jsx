// "use client";

// import {
//   Calendar,
//   CheckCircle,
//   DollarSign,
//   Eye,
//   FileText,
//   Loader2,
//   RefreshCw,
//   Users,
//   X,
//   XCircle,
//   Menu,
//   ChevronDown,
//   PoundSterling,
// } from "lucide-react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";
// import { downloadPdf } from "@/utils/pdfGenerator";
// import { Download as DownloadIcon } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Image from "next/image";

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
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
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

//   const downloadContractorCertificates = async (
//     contractorId,
//     contractorName
//   ) => {
//     try {
//       // Show confirmation
//       if (!confirm(`Download all certificates for ${contractorName}?`)) {
//         return;
//       }

//       // Show loading state
//       const loadingDiv = document.createElement("div");
//       loadingDiv.innerHTML = `
//       <div style="
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: rgba(255, 255, 255, 0.9);
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         z-index: 9999;
//         backdrop-filter: blur(5px);
//       ">
//         <div style="
//           background: white;
//           padding: 2rem;
//           border-radius: 12px;
//           box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//           text-align: center;
//           max-width: 400px;
//           margin: 1rem;
//         ">
//           <Loader2 class="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <h3 style="font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem;">
//             Downloading Certificates
//           </h3>
//           <p style="color: #6b7280; margin-bottom: 1.5rem;">
//             Please wait while we prepare ${contractorName}'s certificates...
//           </p>
//           <div style="
//             width: 100%;
//             background: #e5e7eb;
//             height: 6px;
//             border-radius: 3px;
//             overflow: hidden;
//           ">
//             <div id="progressBar" style="
//               width: 0%;
//               height: 100%;
//               background: #0F47A8;
//               transition: width 0.3s;
//             "></div>
//           </div>
//         </div>
//       </div>
//     `;
//       document.body.appendChild(loadingDiv);

//       // Fetch contractor details
//       const contractorRes = await fetch(
//         `/api/admin/contractor/${contractorId}`
//       );

//       if (!contractorRes.ok) {
//         throw new Error(`Failed to fetch contractor: ${contractorRes.status}`);
//       }

//       const contractorData = await contractorRes.json();

//       if (!contractorData.success) {
//         throw new Error(
//           contractorData.error || "Failed to fetch contractor data"
//         );
//       }

//       const contractor = contractorData.contractor;

//       // Fetch certificates for this contractor
//       const certsRes = await fetch(
//         `/api/admin/certificates?contractorId=${contractorId}`
//       );

//       if (!certsRes.ok) {
//         throw new Error(`Failed to fetch certificates: ${certsRes.status}`);
//       }

//       const certsData = await certsRes.json();

//       if (
//         certsData.success &&
//         certsData.certificates &&
//         certsData.certificates.length > 0
//       ) {
//         const certificates = certsData.certificates;
//         const total = certificates.length;

//         // Download each certificate as separate PDF
//         for (let i = 0; i < certificates.length; i++) {
//           const certificate = certificates[i];

//           // Update progress
//           const progress = ((i + 1) / total) * 100;
//           const progressBar = document.getElementById("progressBar");
//           if (progressBar) {
//             progressBar.style.width = `${progress}%`;
//           }

//           // Download PDF
//           await downloadPdf(certificate, contractor);

//           // Add a small delay between downloads
//           if (i < certificates.length - 1) {
//             await new Promise((resolve) => setTimeout(resolve, 500));
//           }
//         }

//         // Remove loading overlay
//         document.body.removeChild(loadingDiv);

//         // Show success message
//         alert(
//           `Successfully downloaded ${certificates.length} certificate(s) for ${contractorName}`
//         );
//       } else {
//         // Remove loading overlay
//         document.body.removeChild(loadingDiv);
//         alert(`No certificates found for ${contractorName}`);
//       }
//     } catch (error) {
//       console.error("Download error:", error);

//       // Remove loading overlay if it exists
//       const loadingOverlay = document.querySelector(
//         'div[style*="position: fixed; top: 0"]'
//       );
//       if (loadingOverlay) {
//         document.body.removeChild(loadingOverlay);
//       }

//       alert(`Error: ${error.message}`);
//     }
//   };

//   // Check if user is admin AND fetch data
//   const checkAdminAndLoadData = useCallback(async () => {
//     try {
//       const adminCheck = await fetch("/api/admin");

//       if (adminCheck.status === 403) {
//         router.push("/login");
//         return;
//       }

//       if (!adminCheck.ok) {
//         throw new Error("Admin check failed");
//       }

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
//           ...statsData.stats,
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
//       const response = await fetch(url);
//       const data = await response.json();

//       if (response.ok && data.success) {
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

//   const handleApproveUser = async (userId, userName) => {
//     toast.custom((t) => (
//       <div className="bg-white p-4 rounded-lg shadow-lg border">
//         <p className="font-medium">Approve {userName}’s Signup Request?</p>
//         <div className="flex gap-2 mt-3">
//           <button
//             onClick={async () => {
//               toast.dismiss(t.id);
//               const loadingToast = toast.loading(`Approving ${userName}...`);

//               try {
//                 const res = await fetch("/api/admin/approve-user", {
//                   method: "POST",
//                   headers: {
//                     "Content-Type": "application/x-www-form-urlencoded",
//                   },
//                   body: new URLSearchParams({ userId }),
//                 });

//                 const data = await res.json();

//                 if (data.success) {
//                   // Immediate update
//                   setPendingUsers((prev) =>
//                     prev.filter((user) => user.id !== userId)
//                   );

//                   // Update stats immediately
//                   setStats((prev) => ({
//                     ...prev,
//                     totalContractors: prev.totalContractors + 1,
//                   }));

//                   toast.success(`Approved ${userName}!`, { id: loadingToast });
//                 } else {
//                   toast.error(data.error || "Failed to approve", {
//                     id: loadingToast,
//                   });
//                 }
//               } catch (error) {
//                 toast.error("Failed to approve", { id: loadingToast });
//               }
//             }}
//             className="px-3 py-1.5 bg-green-600 text-white rounded text-sm"
//           >
//             Yes
//           </button>
//           <button
//             onClick={() => toast.dismiss(t.id)}
//             className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
//           >
//             No
//           </button>
//         </div>
//       </div>
//     ));
//   };

//   const handleRejectUser = async (userId, userName) => {
//     toast.custom((t) => (
//       <div className="bg-white p-4 rounded-lg shadow-lg border">
//         <p className="font-medium">Reject {userName}’s Signup Request?</p>
//         <div className="flex gap-2 mt-3">
//           <button
//             onClick={async () => {
//               toast.dismiss(t.id);
//               const loadingToast = toast.loading(`Rejecting ${userName}...`);

//               try {
//                 const res = await fetch("/api/admin/reject-user", {
//                   method: "POST",
//                   headers: {
//                     "Content-Type": "application/x-www-form-urlencoded",
//                   },
//                   body: new URLSearchParams({ userId }),
//                 });

//                 const data = await res.json();

//                 if (data.success) {
//                   // Immediate update
//                   setPendingUsers((prev) =>
//                     prev.filter((user) => user.id !== userId)
//                   );

//                   toast.success(`Rejected ${userName}!`, { id: loadingToast });
//                 } else {
//                   toast.error("Failed to reject", { id: loadingToast });
//                 }
//               } catch (error) {
//                 toast.error("Failed to reject", { id: loadingToast });
//               }
//             }}
//             className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
//           >
//             Yes
//           </button>
//           <button
//             onClick={() => toast.dismiss(t.id)}
//             className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
//           >
//             No
//           </button>
//         </div>
//       </div>
//     ));
//   };

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
//         // Remove from list immediately
//         setPendingRequests((prev) =>
//           prev.filter((req) => req.id !== requestId)
//         );

//         // Update stats immediately
//         setStats((prev) => ({
//           ...prev,
//           editRequests: Math.max(0, prev.editRequests - 1),
//         }));

//         // Close modal if open
//         if (showRequestModal) {
//           setShowRequestModal(false);
//         }

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

//   const handleViewRequest = async (requestId) => {
//     try {
//       // First try to find the request in the existing array
//       const existingRequest = pendingRequests.find(
//         (req) => req.id === requestId
//       );

//       // Also check in pendingUsers for user approval requests
//       const existingUser = pendingUsers.find((user) => user.id === requestId);

//       console.log("existing request", existingRequest);
//       // If found, use it directly
//       if (existingRequest) {
//         setSelectedRequest(existingRequest);

//         setAdminNotes("");
//         setShowRequestModal(true);
//         return;
//       }
//        // If it's a policy request
//     if (existingRequest) {
//       setSelectedRequest({
//         ...existingRequest,
//         type: 'policy_request' // Add type identifier
//       });
//       setAdminNotes("");
//       setShowRequestModal(true);
//       return;
//     }

//     // If it's a user request
//     if (existingUser) {
//       setSelectedRequest({
//         ...existingUser,
//         type: 'user_request', // Add type identifier
//         requestType: "user_approval",
//         policyNumber: `USER-${existingUser.name}`,
//         policyHolderName: existingUser.name,
//         reason: "New contractor registration",
//         requestedAt: existingUser.createdAt,
//       });
//       setAdminNotes("");
//       setShowRequestModal(true);
//       return;
//     }
//       // If not found locally, try to fetch from API
//       const response = await fetch(
//         `/api/admin/contractor/${requestId}/details`
//       );

//       // Check if response is JSON
//       const contentType = response.headers.get("content-type");
//       if (!contentType || !contentType.includes("application/json")) {
//         throw new Error("Server returned non-JSON response");
//       }

//       const data = await response.json();

//       if (data.success) {
//         setSelectedRequest(data.request);
//       } else {
//         // Create a fallback request object
//         setSelectedRequest({
//           id: requestId,
//           requestType: "unknown",
//           policyNumber: "N/A",
//           policyHolderName: "Unknown",
//           reason: "Details not available",
//           requestedAt: new Date().toISOString(),
//         });
//       }

//       setAdminNotes("");
//       setShowRequestModal(true);
//     } catch (error) {
//       console.error("Error fetching request details:", error);

//       // Create a basic request object
//       setSelectedRequest({
//         id: requestId,
//         requestType: "error",
//         policyNumber: "ERROR",
//         policyHolderName: "Error Loading",
//         reason: "Failed to load request details: " + error.message,
//         requestedAt: new Date().toISOString(),
//       });

//       setAdminNotes("");
//       setShowRequestModal(true);
//     }
//   };
//   // const handleViewRequest = async (requestId) => {
//   //   try {
//   //     // First try to find the request in the existing array
//   //     const existingRequest = pendingRequests.find(
//   //       (req) => req.id === requestId
//   //     );

//   //     // Also check in pendingUsers for user approval requests
//   //     const existingUser = pendingUsers.find((user) => user.id === requestId);

//   //     console.log("existing request", existingRequest);
//   //     // If found, use it directly
//   //     if (existingRequest) {
//   //       setSelectedRequest(existingRequest);

//   //       setAdminNotes("");
//   //       setShowRequestModal(true);
//   //       return;
//   //     }
//   //     // If it's a user request
//   //     if (existingUser) {
//   //       setSelectedRequest({
//   //         ...existingUser,
//   //         requestType: "user_approval",
//   //         policyNumber: `USER-${existingUser.name}`,
//   //         policyHolderName: existingUser.name,
//   //         reason: "New contractor registration",
//   //         requestedAt: existingUser.createdAt,
//   //       });

//   //       setAdminNotes("");
//   //       setShowRequestModal(true);
//   //       return;
//   //     }

//   //     // If not found locally, try to fetch from API
//   //     const response = await fetch(
//   //       `/api/admin/contractor/${requestId}/details`
//   //     );

//   //     // Check if response is JSON
//   //     const contentType = response.headers.get("content-type");
//   //     if (!contentType || !contentType.includes("application/json")) {
//   //       throw new Error("Server returned non-JSON response");
//   //     }

//   //     const data = await response.json();

//   //     if (data.success) {
//   //       setSelectedRequest(data.request);
//   //     } else {
//   //       // Create a fallback request object
//   //       setSelectedRequest({
//   //         id: requestId,
//   //         requestType: "unknown",
//   //         policyNumber: "N/A",
//   //         policyHolderName: "Unknown",
//   //         reason: "Details not available",
//   //         requestedAt: new Date().toISOString(),
//   //       });
//   //     }

//   //     setAdminNotes("");
//   //     setShowRequestModal(true);
//   //   } catch (error) {
//   //     console.error("Error fetching request details:", error);

//   //     // Create a basic request object
//   //     setSelectedRequest({
//   //       id: requestId,
//   //       requestType: "error",
//   //       policyNumber: "ERROR",
//   //       policyHolderName: "Error Loading",
//   //       reason: "Failed to load request details: " + error.message,
//   //       requestedAt: new Date().toISOString(),
//   //     });

//   //     setAdminNotes("");
//   //     setShowRequestModal(true);
//   //   }
//   // };

//   const handleRefreshRequests = () => {
//     fetchPendingRequests();
//     checkAdminAndLoadData();
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
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
//           totalPolicies: statsData.totalCertificates || 0,
//           premiumTotal: statsData.totalRevenue || 0,
//           thisMonthPolicies: statsData.thisMonthCertificates || 0,
//           editRequests: 0,
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

//   const handleMonthClick = (monthNumber) => {
//     router.push(`/admin/certificates/month/${monthNumber}`);
//   };

//   const formatCurrency = (amount) => {
//     const safeAmount = amount || 0;
//     return new Intl.NumberFormat("en-GB", {
//       style: "currency",
//       currency: "GBP",
//       minimumFractionDigits: 2,
//     }).format(safeAmount);
//   };

//   const maxValue =
//     monthlyStats.length > 0
//       ? Math.max(...monthlyStats.map((item) => item.value))
//       : 200;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="min-h-screen bg-gray-50 mt-12 md:mt-0 p-2 md:p-6">
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: "#363636",
//             color: "#fff",
//           },
//           success: {
//             duration: 3000,
//           },
//           error: {
//             duration: 4000,
//           },
//         }}
//       />
//       {/* Mobile Header */}
//       <div className="md:hidden bg-[#0F47A8] text-white p-4 sticky top-0 z-10">
//         <div className="flex items-center justify-between">
//           <h1 className="text-xl font-semibold">Admin Dashboard</h1>
//           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
//             <Menu size={24} />
//           </button>
//         </div>
//         {isMenuOpen && (
//           <div className="mt-4 bg-blue-700 rounded-lg p-3">
//             <p className="text-sm opacity-90">Welcome Back, Admin 👋</p>
//           </div>
//         )}
//       </div>

//       {/* Desktop Header */}
//       <div className="hidden md:block bg-[#0F47A8] text-white p-6 md:p-8 rounded-lg mb-4 md:mb-6 mx-4 md:mx-0">
//         <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
//           Welcome Back, Admin 👋
//         </h1>
//       </div>

//       {/* Stats Grid - Responsive */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 px-4 md:px-0">
//         {[
//           {
//             title: "This Month Policies",
//             value: stats.thisMonthPolicies,
//             icon: Calendar,
//             color: "#0F47A8",
//           },
//           {
//             title: "This Month Premium Total",
//             value: `£${stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}`,
//             icon: PoundSterling,
//             color: "#0F47A8",
//           },
//           {
//             title: "Total Policies",
//             value: stats.totalPolicies,
//             icon: FileText,
//             color: "#0F47A8",
//           },
//           {
//             title: "Premium Total",
//             value: `£${stats.premiumTotal.toLocaleString("en-GB", {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}`,
//             icon: PoundSterling,
//             color: "#0F47A8",
//           },
//           {
//             title: "Total Contractors",
//             value: stats.totalContractors,
//             icon: Users,
//             color: "#0F47A8",
//           },

//           {
//             title: "Edit Request Pending",
//             value: stats.editRequests,
//             icon: FileText,
//             color: "#0F47A8",
//           },
//         ].map((stat, index) => (
//           <div
//             key={index}
//             className="bg-white rounded-lg shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100"
//           >
//             <div className="flex items-center justify-between mb-2 md:mb-3">
//               <div className="text-xs md:text-sm text-gray-600 truncate">
//                 {stat.title}
//               </div>
//               <div className="bg-[#EAF1FD] p-1.5 md:p-2 rounded">
//                 <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-[#0F47A8]" />
//               </div>
//             </div>
//             <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
//               {stat.value}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Pending Sections Container */}
//       <div className="px-4 md:px-0 space-y-4 md:space-y-6">
//         {/* Pending Approvals - Mobile Card View */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-100">
//           <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
//             <h2 className="text-lg md:text-xl font-semibold text-gray-900">
//               New Contractor Request ({pendingUsers.length})
//             </h2>
//           </div>

//           {pendingUsers.length === 0 ? (
//             <div className="p-8 md:p-12 text-center text-gray-500">
//               No pending approvals
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               {/* Mobile Card View */}
//               <div className="md:hidden divide-y divide-gray-200">
//                 {pendingUsers.map((user) => (
//                   <div key={user.id || user._id} className="p-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <h3 className="font-medium text-gray-900">
//                           {user.companyName}
//                         </h3>
//                         <p className="text-sm text-gray-600">{user.name}</p>
//                         <p className="text-xs text-gray-500">{user.email}</p>
//                       </div>
//                       <span className="text-xs text-gray-500">
//                         {new Date(user.createdAt).toLocaleDateString("en-GB")}
//                       </span>
//                     </div>
//                     <div className="flex justify-end gap-2 mt-3">
//                       <button
//                         onClick={() => handleViewRequest(user.id)}
//                         className="p-2 text-gray-600 hover:bg-gray-100 rounded"
//                         title="View"
//                       >
//                         <Eye size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleApproveUser(user.id, user.name)}
//                         className="p-2 text-green-600 hover:bg-green-50 rounded"
//                         title="Approve"
//                       >
//                         <CheckCircle size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleRejectUser(user.id, user.name)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded"
//                         title="Reject"
//                       >
//                         <XCircle size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Desktop Table View */}
//               <table className="hidden md:table w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200 text-center">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Apply Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Company Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Contractor Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Email Address
//                     </th>
//                     <th className="px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {pendingUsers.map((user) => (
//                     <tr key={user.id || user._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {new Date(user.createdAt).toLocaleDateString("en-GB")}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {user.companyName}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {user.name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {user.email}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => handleViewRequest(user.id)}
//                             className="p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
//                             title="View Request Details"
//                           >
//                             {/* <Eye size={16} /> */}
//                             View
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleApproveUser(user.id, user.name)
//                             }
//                             className="p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer"
//                             title="Approve Request"
//                           >
//                             {/* <CheckCircle size={16} /> */}
//                             Approve
//                           </button>
//                           <button
//                             onClick={() => handleRejectUser(user.id, user.name)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
//                             title="Reject Request"
//                           >
//                             {/* <XCircle size={16} /> */}
//                             Reject
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

//         {/* Pending Policy Requests - Mobile Card View */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-100">
//           <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
//             <div>
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900">
//                 Pending Policy Requests ({pendingRequests.length})
//               </h2>
//               <p className="text-xs md:text-sm text-gray-500 mt-1">
//                 Edit and cancellation requests
//               </p>
//             </div>
//             <div className="flex justify-center">
//               <Image
//                 src="/bluedrop.png"
//                 height="190"
//                 width="190"
//                 alt="Renewably UK"
//                 className="h-auto w-auto"
//                 onError={(e) => {
//                   e.target.style.display = "none";
//                   e.target.nextSibling.style.display = "flex";
//                 }}
//               />
//               <button
//                 onClick={handleRefreshRequests}
//                 disabled={requestsLoading}
//                 className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 self-end md:self-auto"
//               >
//                 <RefreshCw
//                   className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
//                 />
//                 <span className="hidden md:inline">Refresh</span>
//               </button>
//             </div>
//           </div>

//           {requestsLoading ? (
//             <div className="p-8 md:p-12 text-center">
//               <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
//               <p className="text-gray-500 mt-2 text-sm md:text-base">
//                 Loading requests...
//               </p>
//             </div>
//           ) : pendingRequests.length === 0 ? (
//             <div className="p-8 md:p-12 text-center text-gray-500">
//               No pending requests
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               {/* Mobile Card View */}
//               <div className="md:hidden divide-y divide-gray-200">
//                 {pendingRequests.map((request) => (
//                   <div key={request.id} className="p-4">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h3 className="font-medium text-gray-900">
//                           {request.policyNumber}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           {request.policyHolderName}
//                         </p>
//                       </div>
//                       <span
//                         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                           request.requestType === "edit"
//                             ? "bg-blue-100 text-blue-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {request.requestType === "edit" ? "Edit" : "Cancel"}
//                       </span>
//                     </div>
//                     <div className="mb-3">
//                       <p className="text-sm text-gray-900">
//                         {request.contractor?.name || "Unknown"}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {request.contractor?.companyName || "No company"}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {request.contractor?.email}
//                       </p>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs text-gray-500">
//                         {new Date(request.requestedAt).toLocaleDateString(
//                           "en-GB"
//                         )}
//                       </span>
//                       <div className="flex gap-1">
//                         <button
//                           onClick={() => handleViewRequest(request.id)}
//                           className="p-2 text-gray-600 hover:bg-gray-100 rounded"
//                           title="View"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleApproveRequest(request.id)}
//                           className="p-2 text-green-600 hover:bg-green-50 rounded"
//                           title="Approve"
//                         >
//                           <CheckCircle className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleRejectRequest(request.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded"
//                           title="Reject"
//                         >
//                           <XCircle className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Desktop Table View */}
//               <table className="hidden md:table w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200 ">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Contractor
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Policy Number
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Policy Holder Name
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Policy Holder Address
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Request Type
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Requested At
//                     </th>
//                     <th className="px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 {/* In your pending requests table */}
// <tbody className="bg-white divide-y divide-gray-200">
//   {pendingRequests.map((request) => (
//     <tr key={request.id} className="hover:bg-gray-50">
//       {/* Contractor */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">
//           {request.contractor?.name || "Unknown"}
//         </div>
//         <div className="text-xs text-gray-500">
//           {request.contractor?.companyName || "No company"}
//         </div>
//         <div className="text-xs text-gray-500">
//           {request.contractor?.email}
//         </div>
//       </td>

//       {/* Policy Number */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm font-medium text-gray-900">
//           {request.policyNumber}
//         </div>
//       </td>

//       {/* Policy Holder Name */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">
//           {request.policyHolderName}
//         </div>
//       </td>

//       {/* Policy Holder Address */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">
//           {request.policyHolderAddress}
//         </div>
//       </td>

//       {/* Measure (Product Type) */}

//       {/* Request Type */}
//       <td className="px-6 py-4 whitespace-nowrap">
//         <span
//           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//             request.requestType === "edit"
//               ? "bg-blue-100 text-blue-800"
//               : "bg-red-100 text-red-800"
//           }`}
//         >
//           {request.requestType === "edit" ? "Edit" : "Cancel"}
//         </span>
//         {request.reason && (
//           <div className="text-xs text-gray-500 mt-1 max-w-xs">
//             Reason: {request.reason}
//           </div>
//         )}
//       </td>

//       {/* Requested At (DD/MM/YYYY - HH:MM) */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//         {request.formattedRequestedAt ||
//           new Date(request.requestedAt).toLocaleString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//           })
//         }
//       </td>

//       {/* Actions */}
//       <td className="px-6 py-4 whitespace-nowrap text-sm">
//         <div className="flex gap-2 items-center justify-center">
//           <button
//             onClick={() => handleViewRequest(request.id)}
//             className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm"
//             title="View Details"
//           >
//             View
//           </button>
//           <button
//             onClick={() => handleApproveRequest(request.id)}
//             className="px-3 py-1.5 text-green-500 rounded text-sm"
//             title="Approve Request"
//           >
//             Approve
//           </button>
//           <button
//             onClick={() => handleRejectRequest(request.id)}
//             className="px-3 py-1.5 text-red-500 rounded text-sm"
//             title="Reject Request"
//           >
//             Decline
//           </button>
//         </div>
//       </td>
//     </tr>
//   ))}
// </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Charts Section - Responsive */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 px-4 md:px-0">
//         {/* Bar Chart */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
//             <h3 className="text-base md:text-lg font-semibold text-gray-900">
//               Insurance Policies
//             </h3>
//             <span className="text-xs md:text-sm text-gray-500">
//               {new Date().getFullYear()}
//             </span>
//           </div>
//           <div className="relative">
//             <div className="absolute left-0 top-0 flex flex-col justify-between h-48 md:h-64 text-xs text-gray-500 pr-2">
//               <span className="text-[10px] md:text-xs">{maxValue}</span>
//               <span className="text-[10px] md:text-xs">
//                 {Math.round(maxValue * 0.75)}
//               </span>
//               <span className="text-[10px] md:text-xs">
//                 {Math.round(maxValue * 0.5)}
//               </span>
//               <span className="text-[10px] md:text-xs">
//                 {Math.round(maxValue * 0.25)}
//               </span>
//               <span className="text-[10px] md:text-xs">0</span>
//             </div>

//             <div className="ml-6 md:ml-8 h-48 md:h-64 border-l border-b border-gray-200 pl-3 md:pl-4 pb-6 md:pb-8">
//               <div className="grid grid-cols-6 md:flex md:flex-row items-end justify-between gap-1 md:gap-3 h-full">
//                 {monthlyStats.map((data, index) => (
//                   <div
//                     key={index}
//                     className="flex flex-col items-center flex-1"
//                   >
//                     <button
//                       onClick={() => handleMonthClick(data.monthNumber)}
//                       className="w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative"
//                       style={{
//                         height: `${(data.value / maxValue) * 100}%`,
//                         minHeight: "10px",
//                       }}
//                       title={`${data.month}: ${data.value}`}
//                     >
//                       <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
//                         {data.value} certificates
//                       </div>
//                     </button>
//                     <span className="text-[10px] md:text-xs text-gray-600 mt-2 md:mt-3 truncate w-full text-center">
//                       {data.month.slice(0, 3)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Top Contractors Table */}
//         <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
//             <h3 className="text-base md:text-lg font-semibold text-gray-900">
//               Top Contractors
//             </h3>
//             <Link
//               href="/admin/manage-contractors"
//               className="text-sm text-blue-600 hover:text-blue-800 hover:underline self-end sm:self-auto"
//             >
//               View All →
//             </Link>
//           </div>
//           <div className="overflow-x-auto">
//             {/* Mobile Card View */}
//             <div className="md:hidden space-y-3">
//               {topContractors.slice(0, 5).map((contractor, index) => (
//                 <div
//                   key={contractor.userId}
//                   className="bg-gray-50 rounded-lg p-3"
//                 >
//                   <div className="flex justify-between items-start mb-2">
//                     <div className="flex items-center gap-3">
//                       <span className="text-sm font-medium text-gray-500">
//                         #{index + 1}
//                       </span>
//                       <div>
//                         <h4 className="font-medium text-gray-900">
//                           {contractor.name}
//                         </h4>
//                         <p className="text-xs text-gray-600">
//                           {contractor.companyName}
//                         </p>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">
//                       {contractor.certificates} certs
//                     </span>
//                   </div>
//                   <div className="flex justify-end gap-2">
//                     <Link
//                       href={`/admin/manage-contractors/${contractor.userId}`}
//                       className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
//                       title="View"
//                     >
//                       <Eye className="w-4 h-4" />
//                     </Link>
//                     <button
//                       onClick={() =>
//                         downloadContractorCertificates(
//                           contractor.userId,
//                           contractor.name
//                         )
//                       }
//                       className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
//                       title="Download All Certificates"
//                     >
//                       <DownloadIcon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Desktop Table View */}
//             <table className="hidden md:table w-full">
//               <thead className="border-b border-gray-200">
//                 <tr>
//                   <th className="text-left text-xs font-medium text-gray-600 pb-3">
//                     #
//                   </th>
//                   <th className="text-left text-xs font-medium text-gray-600 pb-3">
//                     Contractor Name
//                   </th>
//                   <th className="text-left text-xs font-medium text-gray-600 pb-3">
//                     Company Name
//                   </th>
//                   <th className="text-left text-xs font-medium text-gray-600 pb-3">
//                     Total Certificate
//                   </th>
//                   <th className="text-left text-xs font-medium text-gray-600 pb-3">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {topContractors.map((contractor, index) => (
//                   <tr key={contractor.userId} className="hover:bg-gray-50">
//                     <td className="py-4 text-sm text-gray-500 font-medium">
//                       {index + 1}
//                     </td>
//                     <td className="py-4 text-sm text-gray-900">
//                       {contractor.name}
//                     </td>
//                     <td className="py-4 text-sm text-gray-900">
//                       {contractor.companyName}
//                     </td>
//                     <td className="py-4 text-sm text-gray-900 font-medium">
//                       {contractor.certificates}
//                     </td>
//                     <td className="py-4">
//                       <div className="flex items-center gap-3">
//                         <Link
//                           href={`/admin/manage-contractors/${contractor.userId}`}
//                           className="text-blue-600 hover:text-blue-700 p-1"
//                           title="View Contractor"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </Link>
//                         <button
//                           onClick={() =>
//                             downloadContractorCertificates(
//                               contractor.userId,
//                               contractor.name
//                             )
//                           }
//                           className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
//                           title="Download All Certificates"
//                         >
//                           <DownloadIcon className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Request Modal - Mobile Responsive */}
//       {showRequestModal && selectedRequest && (
//         <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] md:max-h-[95vh]">
//             {/* Header */}
//             <div className="flex justify-between px-10 py-3">
//               <Image
//                 src="/bluedrop.png"
//                 height="190"
//                 width="190"
//                 alt="Renewably UK"
//                 className="h-auto w-auto"
//                 onError={(e) => {
//                   e.target.style.display = "none";
//                   e.target.nextSibling.style.display = "flex";
//                 }}
//               />
//               <button
//                 onClick={() => setShowRequestModal(false)}
//                 className="p-1 md:p-2 hover:bg-gray-100 rounded shrink-0"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
//               <div className="flex items-center justify-between mb-3">
//                 <div className="flex-1 min-w-0">
//                   <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
//                     Request: {selectedRequest.policyNumber} -{" "}
//                     {selectedRequest.policyHolderName}
//                   </h1>
//                   <p className="text-xs md:text-sm text-gray-600 truncate">
//                     By: {selectedRequest.contractor?.name} (
//                     {selectedRequest.contractor?.companyName})
//                   </p>
//                 </div>
//               </div>

//               {/* Badges */}
//               <div className="flex flex-wrap gap-2">
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     selectedRequest.requestType === "edit"
//                       ? "bg-blue-100 text-blue-800"
//                       : "bg-red-100 text-red-800"
//                   }`}
//                 >
//                   {selectedRequest.requestType === "edit"
//                     ? "Edit Request"
//                     : "Cancel Request"}
//                 </span>
//                 <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
//                   Pending
//                 </span>
//                 <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
//                   Requested:{" "}
//                   {new Date(selectedRequest.requestedAt).toLocaleDateString()}
//                 </span>
//                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                   Policy: {selectedRequest.policyNumber}
//                 </span>
//               </div>
//             </div>

//             {/* Content */}
//             <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
//               {/* Reason */}
//               <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
//                 <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
//                   <FileText size={16} /> Request Reason:
//                 </h3>
//                 <p className="text-gray-800 bg-white p-3 rounded border">
//                   {selectedRequest.reason || "No reason provided"}
//                 </p>
//               </div>

//               {/* Side by Side Comparison */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                 {/* Original Details */}
//                 <div className="bg-gray-50 rounded-lg border border-gray-200">
//                   <div className="p-4 border-b border-gray-200 bg-white">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Original Details
//                     </h3>
//                   </div>
//                   <div className="p-4">
// <div className="space-y-3">
//   {/* Contractor Information */}
//   <div>
//     <p className="text-sm text-gray-600 mb-1">Contractor</p>
//     <p className="text-gray-900 font-medium">{selectedRequest.contractor?.name}</p>
//     <p className="text-sm text-gray-600">{selectedRequest.contractor?.companyName}</p>
//     <p className="text-sm text-gray-600">{selectedRequest.contractor?.email}</p>
//   </div>

//   {/* Policy Information */}
//   <div>
//     <p className="text-sm text-gray-600 mb-1">Policy Number</p>
//     <p className="text-gray-900">{selectedRequest.policyNumber}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Policy Holder Name</p>
//     <p className="text-gray-900">{selectedRequest.policyHolderName}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Policy Holder Address</p>
//     <p className="text-gray-900">{selectedRequest.policyHolderAddress}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Measure (Product Type)</p>
//     <p className="text-gray-900">{selectedRequest.productType}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Country</p>
//     <p className="text-gray-900">{selectedRequest.country}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Postcode</p>
//     <p className="text-gray-900">{selectedRequest.postcode}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Email</p>
//     <p className="text-gray-900">{selectedRequest.email}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Phone</p>
//     <p className="text-gray-900">{selectedRequest.phone}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Contract Value</p>
//     <p className="text-gray-900">
//       {selectedRequest.contractValue?.toString().includes('€')
//         ? selectedRequest.contractValue
//         : `€ ${selectedRequest.contractValue}`}
//     </p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Insurance Coverage</p>
//     <p className="text-gray-900">{selectedRequest.insuranceCoverage}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Inception Date</p>
//     <p className="text-gray-900">{selectedRequest.inceptionDate}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
//     <p className="text-gray-900">{selectedRequest.expiryDate}</p>
//   </div>

//   <div>
//     <p className="text-sm text-gray-600 mb-1">Requested At</p>
//     <p className="text-gray-900">
//       {selectedRequest.formattedRequestedAt ||
//         new Date(selectedRequest.requestedAt).toLocaleString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         })
//       }
//     </p>
//   </div>
// </div>
//                   </div>
//                 </div>

//                 {/* Edited Details */}
//                 <div className="bg-gray-50 rounded-lg border border-gray-200">
//                   <div className="p-4 border-b border-gray-200 bg-white">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Requested Changes
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="space-y-3">
//   {/* For each field, check if it's in changes */}
//   <div className={selectedRequest.changes?.policyHolderName ? 'bg-yellow-50 p-3 rounded border border-yellow-200' : ''}>
//     <p className="text-sm text-gray-600 mb-1">Policy Holder Name</p>
//     <div className="flex justify-between items-center">
//       <p className="text-gray-900">
//         {selectedRequest.changes?.policyHolderName || selectedRequest.policyHolderName}
//       </p>
//       {selectedRequest.changes?.policyHolderName && (
//         <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
//           CHANGED
//         </span>
//       )}
//     </div>
//   </div>

//   {/* Repeat for all fields that can be changed */}
//   <div className={selectedRequest.changes?.address ? 'bg-yellow-50 p-3 rounded border border-yellow-200' : ''}>
//     <p className="text-sm text-gray-600 mb-1">Address</p>
//     <div className="flex justify-between items-center">
//       <p className="text-gray-900">
//         {selectedRequest.changes?.address || selectedRequest.policyHolderAddress}
//       </p>
//       {selectedRequest.changes?.address && (
//         <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
//           CHANGED
//         </span>
//       )}
//     </div>
//   </div>

//   {/* Country */}
//   <div className={selectedRequest.changes?.country ? 'bg-yellow-50 p-3 rounded border border-yellow-200' : ''}>
//     <p className="text-sm text-gray-600 mb-1">Country</p>
//     <div className="flex justify-between items-center">
//       <p className="text-gray-900">
//         {selectedRequest.changes?.country || selectedRequest.country}
//       </p>
//       {selectedRequest.changes?.country && (
//         <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
//           CHANGED
//         </span>
//       )}
//     </div>

//                         <div
//                           className={`${
//                             selectedRequest.changes?.postcode
//                               ? "bg-blue-50 p-2 rounded"
//                               : ""
//                           }`}
//                         >
//                           <p className="text-sm text-gray-600 mb-1">Postcode</p>
//                           <div className="flex justify-between items-center">
//                             <p className="text-gray-900">
//                               {selectedRequest.changes?.postcode || "WS5 4PE"}
//                             </p>
//                           </div>
//                         </div>

//                         <div
//                           className={`${
//                             selectedRequest.changes?.email
//                               ? "bg-blue-50 p-2 rounded"
//                               : ""
//                           }`}
//                         >
//                           <p className="text-sm text-gray-600 mb-1">
//                             Policyholder Email
//                           </p>
//                           <div className="flex justify-between items-center">
//                             <p className="text-gray-900">
//                               {selectedRequest.changes?.email ||
//                                 "4517 Washington Ave. Manchester, Kentucky 39495"}
//                             </p>
//                           </div>
//                         </div>

//                         <div
//                           className={`${
//                             selectedRequest.changes?.phone
//                               ? "bg-blue-50 p-2 rounded"
//                               : ""
//                           }`}
//                         >
//                           <p className="text-sm text-gray-600 mb-1">
//                             Policyholder Phone
//                           </p>
//                           <div className="flex justify-between items-center">
//                             <p className="text-gray-900">
//                               {selectedRequest.changes?.phone ||
//                                 "(704) 555-0127"}
//                             </p>
//                           </div>
//                         </div>

//                         <div
//                           className={`${
//                             selectedRequest.changes?.productType
//                               ? "bg-blue-50 p-2 rounded"
//                               : ""
//                           }`}
//                         >
//                           <p className="text-sm text-gray-600 mb-1">
//                             Product Type
//                           </p>
//                           <div className="flex justify-between items-center">
//                             <p className="text-gray-900">
//                               {selectedRequest.changes?.productType ||
//                                 "Cavity Wall Insulation - Up to 4 Storeys High"}
//                             </p>
//                           </div>
//                         </div>

//                         <div
//                           className={`${
//                             selectedRequest.changes?.contractValue
//                               ? "bg-blue-50 p-2 rounded"
//                               : ""
//                           }`}
//                         >
//                           <p className="text-sm text-gray-600 mb-1">
//                             Contract Value
//                           </p>
//                           <div className="flex justify-between items-center">
//                             <p className="text-gray-900">
//                               {selectedRequest.changes?.contractValue
//                                 ? `€ ${selectedRequest.changes.contractValue}`
//                                 : "€ 10600.50"}
//                             </p>
//                           </div>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">
//                             Insurance Coverage
//                           </p>
//                           <p className="text-gray-900">
//                             Insurance Backed Guarantee
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">
//                             Inception Date
//                           </p>
//                           <p className="text-gray-900">25/11/2025</p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">
//                             Expiry Date
//                           </p>
//                           <p className="text-gray-900">25/11/2027</p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">
//                             IBG Creation Date Stamp
//                           </p>
//                           <p className="text-gray-900">10/10/2025 7:39:53 PM</p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">
//                             Transaction Type
//                           </p>
//                           <p className="text-gray-900">Certificate Generated</p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-gray-600 mb-1">Price</p>
//                           <p className="text-gray-900">€ 36.50</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Contractor Information */}
//               <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                   Contractor Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">
//                       Contractor Name
//                     </p>
//                     <p className="font-medium">
//                       {selectedRequest.contractor?.name || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Company Name</p>
//                     <p className="font-medium">
//                       {selectedRequest.contractor?.companyName || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">Email</p>
//                     <p className="font-medium">
//                       {selectedRequest.contractor?.email || "N/A"}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600 mb-1">
//                       Contractor Address
//                     </p>
//                     <p className="font-medium">
//                       {selectedRequest.changes?.contractorAddress || "N/A"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Admin Notes */}
//               <div className="mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
//                   Admin Notes
//                 </h3>
//                 <textarea
//                   value={adminNotes}
//                   onChange={(e) => setAdminNotes(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   rows="4"
//                   placeholder="Add your notes here... (These notes will be visible to the contractor)"
//                 />
//                 <p className="text-sm text-gray-500 mt-2">
//                   These notes will be sent to the contractor along with your
//                   decision.
//                 </p>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
//               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <div className="text-center sm:text-left">
//                   <p className="text-sm text-gray-600 mb-1">
//                     Review all details carefully
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     ID: {selectedRequest.id}
//                   </p>
//                 </div>
//                 <div className="flex gap-3 w-full sm:w-auto">
//                   <button
//                     onClick={() => {
//                       if (
//                         confirm("Are you sure you want to reject this request?")
//                       ) {
//                         handleRejectRequest(selectedRequest.id);
//                         setShowRequestModal(false);
//                       }
//                     }}
//                     className="flex-1 sm:flex-none px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 font-medium transition-colors"
//                   >
//                     Reject Request
//                   </button>
//                   <button
//                     onClick={() => {
//                       if (
//                         confirm(
//                           "Are you sure you want to approve this request?"
//                         )
//                       ) {
//                         handleApproveRequest(selectedRequest.id);
//                         setShowRequestModal(false);
//                       }
//                     }}
//                     className="flex-1 sm:flex-none px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium transition-colors"
//                   >
//                     Approve Request
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
// //               {/* Reason */}
// //               <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
// //                 <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
// //                   <FileText size={16} /> Request Reason:
// //                 </h3>
// //                 <p className="text-gray-800 bg-white p-3 rounded border">
// //                   {selectedRequest.reason || "No reason provided"}
// //                 </p>
// //               </div>

// //               {/* Current Details */}
// //               <div className="mb-6">
// //                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
// //                   Current Policy Details
// //                 </h3>
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                   <div>
// //                     <p className="text-sm text-gray-500">Policy Holder Name</p>
// //                     <p className="font-medium">
// //                       {selectedRequest.policyHolderName}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-500">Address</p>
// //                     <p className="font-medium">
// //                       {selectedRequest.policyHolderAddress}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-500">Policy Number</p>
// //                     <p className="font-medium">
// //                       {selectedRequest.policyNumber}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-sm text-gray-500">Created At</p>
// //                     <p className="font-medium">
// //                       {new Date(selectedRequest.createdAt).toLocaleString()}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Changes Requested (Only for edit requests) */}
// //               {selectedRequest.requestType === "edit" &&
// //                 selectedRequest.changes && (
// //                   <div className="mb-6">
// //                     <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
// //                       <RefreshCw size={16} /> Changes Requested
// //                     </h3>
// //                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
// //                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                         {/* Policy Holder Details */}
// //                         <div className="space-y-3">
// //                           <h4 className="font-medium text-gray-700">
// //                             Policy Holder Information
// //                           </h4>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Name</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.policyHolderName ||
// //                                 "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Address</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.address || "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Email</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.email || "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Phone</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.phone || "No change"}
// //                             </p>
// //                           </div>
// //                         </div>

// //                         {/* Policy & Contract Details */}
// //                         <div className="space-y-3">
// //                           <h4 className="font-medium text-gray-700">
// //                             Policy & Contract Details
// //                           </h4>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Country</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.country || "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">Postcode</p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.postcode || "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">
// //                               Product Type
// //                             </p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.productType ||
// //                                 "No change"}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm text-gray-500">
// //                               Contract Value
// //                             </p>
// //                             <p className="font-medium">
// //                               {selectedRequest.changes.contractValue
// //                                 ? `£${selectedRequest.changes.contractValue}`
// //                                 : "No change"}
// //                             </p>
// //                           </div>
// //                         </div>
// //                       </div>

// //                       {/* Contractor Information (if changed) */}
// //                       {selectedRequest.changes.contractorAddress && (
// //                         <div className="mt-4 pt-4 border-t border-yellow-200">
// //                           <h4 className="font-medium text-gray-700 mb-2">
// //                             Contractor Address
// //                           </h4>
// //                           <p className="font-medium">
// //                             {selectedRequest.changes.contractorAddress}
// //                           </p>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 )}

// //               {/* Contractor Information */}
// //               <div className="mb-6">
// //                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
// //                   Contractor Information
// //                 </h3>
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <p className="text-sm text-gray-500">Contractor Name</p>
// //                       <p className="font-medium">
// //                         {selectedRequest.contractor?.name}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Company Name</p>
// //                       <p className="font-medium">
// //                         {selectedRequest.contractor?.companyName}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Email</p>
// //                       <p className="font-medium">
// //                         {selectedRequest.contractor?.email}
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm text-gray-500">Status</p>
// //                       <p className="font-medium">
// //                         {selectedRequest.contractor?.isSuspended
// //                           ? "Suspended"
// //                           : "Active"}
// //                       </p>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Admin Notes */}
// //               <div className="mb-4">
// //                 <h3 className="text-lg font-semibold text-gray-800 mb-3">
// //                   Admin Notes
// //                 </h3>
// //                 <textarea
// //                   value={adminNotes}
// //                   onChange={(e) => setAdminNotes(e.target.value)}
// //                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                   rows="4"
// //                   placeholder="Add your notes here... (These notes will be visible to the contractor)"
// //                 />
// //                 <p className="text-sm text-gray-500 mt-2">
// //                   These notes will be sent to the contractor along with your
// //                   decision.
// //                 </p>
// //               </div>
// // </div>

"use client";

import {
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Users,
  X,
  XCircle,
  Menu,
  PoundSterling,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadPdf } from "@/utils/pdfGenerator";
import { Download as DownloadIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

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
        flex-direction:column: justify-content: center;
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

  const handleApproveUser = async (userId, userName) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium">Approve {userName}’s Signup Request?</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading(`Approving ${userName}...`);

              try {
                const res = await fetch("/api/admin/approve-user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({ userId }),
                });

                const data = await res.json();

                if (data.success) {
                  // Immediate update
                  setPendingUsers((prev) =>
                    prev.filter((user) => user.id !== userId)
                  );

                  // Update stats immediately
                  setStats((prev) => ({
                    ...prev,
                    totalContractors: prev.totalContractors + 1,
                  }));

                  toast.success(`Approved ${userName}!`, { id: loadingToast });
                } else {
                  toast.error(data.error || "Failed to approve", {
                    id: loadingToast,
                  });
                }
              } catch (error) {
                toast.error("Failed to approve", { id: loadingToast });
              }
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleRejectUser = async (userId, userName) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-medium">Reject {userName}’s Signup Request?</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading(`Rejecting ${userName}...`);

              try {
                const res = await fetch("/api/admin/reject-user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({ userId }),
                });

                const data = await res.json();

                if (data.success) {
                  // Immediate update
                  setPendingUsers((prev) =>
                    prev.filter((user) => user.id !== userId)
                  );

                  toast.success(`Rejected ${userName}!`, { id: loadingToast });
                } else {
                  toast.error("Failed to reject", { id: loadingToast });
                }
              } catch (error) {
                toast.error("Failed to reject", { id: loadingToast });
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

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

      console.log("existing request", existingRequest);
      // If found, use it directly
      if (existingRequest) {
        setSelectedRequest(existingRequest);

        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }
      // If it's a policy request
      if (existingRequest) {
        setSelectedRequest({
          ...existingRequest,
          type: "policy_request", // Add type identifier
        });
        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }

      // If it's a user request
      if (existingUser) {
        setSelectedRequest({
          ...existingUser,
          type: "user_request", // Add type identifier
          requestType: "user_approval",
          policyNumber: `USER-${existingUser.name}`,
          policyHolderName: existingUser.name,
          reason: "New contractor registration",
          requestedAt: existingUser.createdAt,
        });
        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }
      // If not found locally, try to fetch from API
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
  // Improved scaling & nice Y-axis labels
  const niceMax = Math.ceil(maxValue / 1000) * 1000 || 1000; // round up to next 1000, min 1000
  const step = niceMax <= 5000 ? 1000 : niceMax <= 20000 ? 5000 : 10000;
  const yAxisLabels = [];
  for (let i = niceMax; i >= 0; i -= step) {
    yAxisLabels.push(i);
  }
  if (yAxisLabels[yAxisLabels.length - 1] !== 0) yAxisLabels.push(0);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 mt-12 md:mt-0 p-2 md:p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0F47A8] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            <Menu size={24} />
          </button>
        </div>
        {isMenuOpen && (
          <div className="mt-4 bg-blue-700 rounded-lg p-3">
            <p className="text-sm opacity-90">Welcome Back, Admin 👋</p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-[#0F47A8] text-white p-6 md:p-8 rounded-lg mb-4 md:mb-6 mx-4 md:mx-0">
        <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
          Welcome Back, Admin 👋
        </h1>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 px-4 md:px-0">
        {[
          {
            title: "This Month Policies",
            value: stats.thisMonthPolicies,
            icon: Calendar,
            color: "#0F47A8",
          },
          {
            title: "This Month Premium Total",
            value: `£${stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: PoundSterling,
            color: "#0F47A8",
          },
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
            icon: PoundSterling,
            color: "#0F47A8",
          },
          {
            title: "Total Contractors",
            value: stats.totalContractors,
            icon: Users,
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
            className="bg-white rounded-lg shadow-sm p-4 md:p-5 lg:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="text-xs md:text-sm text-gray-600 truncate">
                {stat.title}
              </div>
              <div className="bg-[#EAF1FD] p-1.5 md:p-2 rounded">
                <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-[#0F47A8]" />
              </div>
            </div>
            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Sections Container */}
      <div className="px-4 md:px-0 space-y-4 md:space-y-6">
        {/* Pending Approvals - Mobile Card View */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              New Contractor Request ({pendingUsers.length})
            </h2>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-8 md:p-12 text-center text-gray-500">
              No pending approvals
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <div key={user.id || user._id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.companyName}
                        </h3>
                        <p className="text-sm text-gray-600">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => handleViewRequest(user.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleApproveUser(user.id, user.name)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id, user.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 border-b border-gray-200 text-center">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Apply Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contractor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th className="px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id || user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewRequest(user.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                            title="View Request Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleApproveUser(user.id, user.name)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                            title="Approve Request"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Reject Request"
                          >
                            Reject
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Pending Policy Requests ({pendingRequests.length})
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Edit and cancellation requests
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/bluedrop.png"
                height="190"
                width="190"
                alt="Renewably UK"
                className="h-auto w-auto"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <button
                onClick={handleRefreshRequests}
                disabled={requestsLoading}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 self-end md:self-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 ${requestsLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>

          {requestsLoading ? (
            <div className="p-8 md:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Loading requests...
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-8 md:p-12 text-center text-gray-500">
              No pending requests
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {request.policyNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.policyHolderName}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          request.requestType === "edit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.requestType === "edit" ? "Edit" : "Cancel"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-900">
                        {request.contractor?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.contractor?.companyName || "No company"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.contractor?.email}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString(
                          "en-GB"
                        )}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50 border-b border-gray-200 ">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Policy Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Policy Holder Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Policy Holder Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Request Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                {/* In your pending requests table */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      {/* Contractor */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.contractor?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.contractor?.companyName || "No company"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.contractor?.email}
                        </div>
                      </td>

                      {/* Policy Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.policyNumber}
                        </div>
                      </td>

                      {/* Policy Holder Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.policyHolderName}
                        </div>
                      </td>

                      {/* Policy Holder Address */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.policyHolderAddress}
                        </div>
                      </td>

                      {/* Measure (Product Type) */}

                      {/* Request Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.requestType === "edit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.requestType === "edit" ? "Edit" : "Cancel"}
                        </span>
                        {request.reason && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs">
                            Reason: {request.reason}
                          </div>
                        )}
                      </td>

                      {/* Requested At (DD/MM/YYYY - HH:MM) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.formattedRequestedAt ||
                          new Date(request.requestedAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleViewRequest(request.id)}
                            className="px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded text-sm cursor-pointer"
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="px-3 py-1.5 text-green-500 hover:bg-green-100 rounded text-sm cursor-pointer"
                            title="Approve Request"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded text-sm cursor-pointer"
                            title="Reject Request"
                          >
                            Decline
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 px-4 md:px-0">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Insurance Policies
            </h3>
            <span className="text-xs md:text-sm text-gray-500">
              {new Date().getFullYear()}
            </span>
          </div>

          <div className="relative h-64 md:h-80">
            {/* Y-axis labels - nicer stepped scale */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2">
              {yAxisLabels.map((label, i) => (
                <div key={i} className="text-right">
                  {label.toLocaleString()}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="ml-16 h-full border-l border-b border-gray-200 pl-4 pb-8">
              <div className="grid grid-cols-12 md:flex md:flex-row items-end justify-between gap-1 md:gap-3 h-full">
                {monthlyStats.map((data, index) => {
                  const barHeight =
                    maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <button
                        onClick={() => handleMonthClick(data.monthNumber)}
                        className="w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative"
                        style={{
                          height: `${barHeight}%`,
                          minHeight: data.value > 0 ? "10px" : "0px",
                        }}
                        title={`${data.month}: ${data.value} policies`}
                      >
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                          {data.value} policies
                        </div>
                      </button>
                      <span className="text-[10px] md:text-xs text-gray-600 mt-2 truncate w-full text-center">
                        {data.month.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Contractors Table */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 md:mb-6 gap-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Top Contractors
            </h3>
            <Link
              href="/admin/manage-contractors"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline self-end sm:self-auto"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {topContractors.slice(0, 5).map((contractor, index) => (
                <div
                  key={contractor.userId}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {contractor.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {contractor.companyName}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {contractor.certificates} certs
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/manage-contractors/${contractor.userId}`}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        downloadContractorCertificates(
                          contractor.userId,
                          contractor.name
                        )
                      }
                      className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="Download All Certificates"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">
                    #
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">
                    Contractor Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">
                    Company Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">
                    Total Certificate
                  </th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topContractors.map((contractor, index) => (
                  <tr key={contractor.userId} className="hover:bg-gray-50">
                    <td className="py-4 text-sm text-gray-500 font-medium">
                      {index + 1}
                    </td>
                    <td className="py-4 text-sm text-gray-900">
                      {contractor.name}
                    </td>
                    <td className="py-4 text-sm text-gray-900">
                      {contractor.companyName}
                    </td>
                    <td className="py-4 text-sm text-gray-900 font-medium">
                      {contractor.certificates}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/manage-contractors/${contractor.userId}`}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="View Contractor"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            downloadContractorCertificates(
                              contractor.userId,
                              contractor.name
                            )
                          }
                          className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Download All Certificates"
                        >
                          <DownloadIcon className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]  overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                    {selectedRequest.type === "user_request"
                      ? `Contractor Application: ${selectedRequest.name}`
                      : `Policy Request: ${selectedRequest.policyNumber}`}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {selectedRequest.type === "user_request"
                      ? `Company: ${selectedRequest.companyName}`
                      : `By: ${selectedRequest.contractor?.name}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-1 md:p-2 hover:bg-gray-100 rounded shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.type === "user_request"
                      ? "bg-purple-100 text-purple-800"
                      : selectedRequest.requestType === "edit"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedRequest.type === "user_request"
                    ? "New Contractor"
                    : selectedRequest.requestType === "edit"
                    ? "Edit Request"
                    : "Cancel Request"}
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Pending Review
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                  {new Date(
                    selectedRequest.requestedAt || selectedRequest.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content - Different content for user vs policy requests */}
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              {selectedRequest.type === "user_request" ? (
                /* USER REQUEST CONTENT (Simple like before) */
                <>
                  {/* User Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Contractor Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedRequest.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Company Name</p>
                        <p className="font-medium">
                          {selectedRequest.companyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-medium">{selectedRequest.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">
                          {selectedRequest.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Application Date
                        </p>
                        <p className="font-medium">
                          {new Date(
                            selectedRequest.createdAt
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">Pending Approval</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents (if any) */}
                  {selectedRequest.documents &&
                    selectedRequest.documents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Submitted Documents
                        </h4>
                        <div className="space-y-2">
                          {selectedRequest.documents.map((doc, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FileText size={14} className="text-gray-400" />
                              <span>{doc.name}</span>
                              <a
                                href={doc.url}
                                className="text-blue-600 hover:underline ml-2"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              ) : (
                /* POLICY REQUEST CONTENT - WITH SIDE-BY-SIDE COMPARISON */
                <>
                  {/* Reason */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FileText size={16} /> Request Reason:
                    </h3>
                    <p className="text-gray-800 bg-white p-3 rounded border">
                      {selectedRequest.reason || "No reason provided"}
                    </p>
                  </div>

                  {/* Side by Side Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Original Details */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200 bg-white">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Original Details
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {/* Contractor Information */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Contractor
                            </p>
                            <p className="text-gray-900 font-medium">
                              {selectedRequest.contractor?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedRequest.contractor?.companyName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedRequest.contractor?.email}
                            </p>
                          </div>

                          {/* Policy Information */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Policy Number
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.policyNumber}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Policy Holder Name
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.policyHolderName}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Policy Holder Address
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.policyHolderAddress}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Measure (Product Type)
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.productType}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Country
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.country}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Postcode
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.postcode}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="text-gray-900">
                              {selectedRequest.email}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                            <p className="text-gray-900">
                              {selectedRequest.phone}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Contract Value
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.contractValue
                                ?.toString()
                                .includes("€")
                                ? selectedRequest.contractValue
                                : `${selectedRequest.contractValue}`}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Insurance Coverage
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.insuranceCoverage}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Inception Date
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.inceptionDate}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Expiry Date
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.expiryDate}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Requested At
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.formattedRequestedAt ||
                                new Date(
                                  selectedRequest.requestedAt
                                ).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edited Details */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="p-4 border-b border-gray-200 bg-white">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Requested Changes
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-3">
                          {[
                            {
                              changeKey: "policyHolderName",
                              originalKey: "policyHolderName",
                              label: "Policy Holder Name",
                            },
                            {
                              changeKey: "address",
                              originalKey: "policyHolderAddress",
                              label: "Address",
                            },
                            {
                              changeKey: "country",
                              originalKey: "country",
                              label: "Country",
                            },
                            {
                              changeKey: "postcode",
                              originalKey: "postcode",
                              label: "Postcode",
                            },
                            {
                              changeKey: "email",
                              originalKey: "email",
                              label: "Policyholder Email",
                            },
                            {
                              changeKey: "phone",
                              originalKey: "phone",
                              label: "Policyholder Phone",
                            },
                            {
                              changeKey: "productType",
                              originalKey: "productType",
                              label: "Product Type",
                            },
                            {
                              changeKey: "contractValue",
                              originalKey: "contractValue",
                              label: "Contract Value",
                              format: (val) =>
                                val?.toString().includes("£")
                                  ? val
                                  : `£ ${val}`,
                            },
                            {
                              changeKey: "inceptionDate",
                              originalKey: "inceptionDate",
                              label: "Inception Date",
                            },
                            {
                              changeKey: "expiryDateCalculated",
                              originalKey: "expiryDate",
                              label: "Expiry Date",
                            },
                          ].map(
                            ({
                              changeKey,
                              originalKey,
                              label,
                              format = (v) => v,
                            }) => {
                              const hasChange =
                                selectedRequest.changes?.[changeKey] !==
                                undefined;
                              const displayValue = hasChange
                                ? format(selectedRequest.changes[changeKey])
                                : format(selectedRequest[originalKey] || "N/A");

                              return (
                                <div
                                  key={changeKey}
                                  className={
                                    hasChange
                                      ? "bg-yellow-50 p-3 rounded border border-yellow-200"
                                      : ""
                                  }
                                >
                                  <p className="text-sm text-gray-600 mb-1">
                                    {label}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <p className="text-gray-900">
                                      {displayValue || "N/A"}
                                    </p>
                                    {hasChange && (
                                      <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                        CHANGED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}

                          {/* Static fields that don't change often */}
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Insurance Coverage
                            </p>
                            <p className="text-gray-900">
                              {selectedRequest.insuranceCoverage ||
                                "Insurance Backed Guarantee"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contractor Information */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Contractor Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Contractor Name
                        </p>
                        <p className="font-medium">
                          {selectedRequest.contractor?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Company Name
                        </p>
                        <p className="font-medium">
                          {selectedRequest.contractor?.companyName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium">
                          {selectedRequest.contractor?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Contractor Address
                        </p>
                        <p className="font-medium">
                          {selectedRequest.changes?.contractorAddress || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes (Common for both types) */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add your notes here... (These notes will be visible to the contractor)"
                />
                <p className="text-sm text-gray-500 mt-2">
                  These notes will be sent to the contractor along with your
                  decision.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                  Review and take action
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to reject this request?")
                      ) {
                        if (selectedRequest.type === "user_request") {
                          handleRejectUser(
                            selectedRequest.id,
                            selectedRequest.name
                          );
                        } else {
                          handleRejectRequest(selectedRequest.id);
                        }
                        setShowRequestModal(false);
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to approve this request?"
                        )
                      ) {
                        if (selectedRequest.type === "user_request") {
                          handleApproveUser(
                            selectedRequest.id,
                            selectedRequest.name
                          );
                        } else {
                          handleApproveRequest(selectedRequest.id);
                        }
                        setShowRequestModal(false);
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 text-sm"
                  >
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
