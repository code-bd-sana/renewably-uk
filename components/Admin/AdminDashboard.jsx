"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadPdf } from "@/utils/pdfGenerator";
import toast from "react-hot-toast";
import RequestStatusDropdown from "./RequestActionDropdown";
import CertificateActionsDropdown from "./RequestActionDropdown";
import ProductAssignmentSection from "./ProductAssignmentSection";
import HeaderSection from "./AdminDashboard/HeaderSection";
import StatsCards from "./AdminDashboard/StatsCards";
import PendingUsersTable from "./AdminDashboard/PendingUsersTable";
import PendingRequestsTable from "./AdminDashboard/PendingRequestsTable";
import BarChartSection from "./AdminDashboard/BarChartSection";
import TopContractorsTable from "./AdminDashboard/TopContractorsTable";
import RequestModal from "./AdminDashboard/RequestModal";

// Import the new components

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
  const [downloading, setDownloading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
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
    contractorName,
  ) => {
    try {
      if (!confirm(`Download all certificates for ${contractorName}?`)) {
        return;
      }

      toast.loading(`Preparing certificates...`);
      setDownloadingAll(true);

      // 1. Get contractor details
      const contractorRes = await fetch(
        `/api/admin/contractor/${contractorId}`,
      );
      if (!contractorRes.ok) throw new Error("Failed to fetch contractor");

      const contractorData = await contractorRes.json();
      const contractor = contractorData.contractor || {
        name: contractorName,
        companyName: contractorName,
        email: "N/A",
        phone: "N/A",
        address: "N/A",
      };

      // 2. Get all certificates for this contractor WITH COMPLETE DATA
      let certificates = [];

      // Try to get from a complete endpoint
      const certsRes = await fetch(
        `/api/admin/certificates?contractorId=${contractorId}&fullData=true`,
      );

      if (certsRes.ok) {
        const certsData = await certsRes.json();
        if (certsData.success && certsData.certificates) {
          certificates = certsData.certificates;
        }
      }

      // If no certificates, try another approach
      if (certificates.length === 0) {
        // Try to get insurance policies directly
        const insuranceRes = await fetch(
          `/api/admin/insurances?userId=${contractorId}`,
        );
        if (insuranceRes.ok) {
          const insuranceData = await insuranceRes.json();
          if (insuranceData.success && insuranceData.insurances) {
            // Flatten products into certificates
            certificates = insuranceData.insurances.flatMap((insurance) => {
              return insurance.products.map((product, index) => ({
                // Basic identification
                id: `${insurance._id}-${index}`,
                _id: insurance._id,
                insuranceId: insurance._id,

                // Policy details
                policyNo: insurance.policyNumber,
                policyNumber: insurance.policyNumber,
                holderName: insurance.policyHolderName,
                policyHolderName: insurance.policyHolderName,
                policyHolderAddress: insurance.address,

                // Contact details
                email: insurance.email,
                phone: insurance.phone,
                address: insurance.address,
                country: insurance.country,
                postcode: insurance.postcode,
                contractorName: insurance.contractorName,

                // Product details
                productType: product.productType,
                contractValue: `£ ${
                  product.contractValue?.toFixed(2) || "0.00"
                }`,
                inceptionDate: new Date(
                  product.inceptionDate,
                ).toLocaleDateString("en-GB"),
                expiryDate: new Date(product.expiryDate).toLocaleDateString(
                  "en-GB",
                ),
                price: `£ ${product.price?.toFixed(2) || "0.00"}`,

                // Additional fields for PDF
                retrofitAssessor: insurance.retrofitAssessor,
                retrofitCoordinator: insurance.retrofitCoordinator,
                schemeProvider: insurance.schemeProvider,
                fundingPartner: insurance.fundingPartner,
                abs: insurance.abs,
                status: insurance.status,
                createdAt: insurance.createdAt,
                userId: insurance.userId,

                // Raw data structure
                rawData: {
                  insurance: {
                    contractorName: insurance.contractorName,
                    contractorAddress:
                      insurance.contractorAddress || contractor.address || "",
                    policyHolderName: insurance.policyHolderName,
                    email: insurance.email,
                    phone: insurance.phone,
                    address: insurance.address,
                    country: insurance.country,
                    postcode: insurance.postcode,
                    retrofitAssessor: insurance.retrofitAssessor,
                    retrofitCoordinator: insurance.retrofitCoordinator,
                    schemeProvider: insurance.schemeProvider,
                    fundingPartner: insurance.fundingPartner,
                    abs: insurance.abs,
                    document: insurance.document,
                    status: insurance.status,
                  },
                  product: {
                    productType: product.productType,
                    coverOption: "Insurance Backed Guarantee",
                  },
                },
              }));
            });
          }
        }
      }

      if (certificates.length === 0) {
        toast.dismiss();
        setDownloadingAll(false);
        alert(`No certificates found for ${contractorName}`);
        return;
      }

      console.log(`Found ${certificates.length} certificates`, certificates[0]);

      // 3. Download each certificate
      for (let i = 0; i < certificates.length; i++) {
        const certificate = certificates[i];

        toast.loading(`Downloading ${i + 1} of ${certificates.length}...`);

        // If still missing data, fetch individual certificate
        if (!certificate.retrofitAssessor || !certificate.schemeProvider) {
          try {
            const singleCertRes = await fetch(
              `/api/admin/certificates/${
                certificate._id || certificate.insuranceId || certificate.id
              }`,
            );
            if (singleCertRes.ok) {
              const singleCertData = await singleCertRes.json();
              if (singleCertData.success && singleCertData.certificate) {
                // Merge the data
                Object.assign(certificate, singleCertData.certificate);
              }
            }
          } catch (fetchError) {
            console.log("Could not fetch individual certificate:", fetchError);
          }
        }

        // Prepare complete certificate data for PDF
        const certData = {
          // Core fields
          policyNo: certificate.policyNo || certificate.policyNumber,
          policyNumber: certificate.policyNumber || certificate.policyNo,
          holderName: certificate.holderName || certificate.policyHolderName,
          policyHolderName:
            certificate.policyHolderName || certificate.holderName,
          policyHolderAddress:
            certificate.policyHolderAddress || certificate.address,

          // Contact details
          address: certificate.address || "N/A",
          country: certificate.country || "N/A",
          postcode: certificate.postcode || "N/A",
          email: certificate.email || "N/A",
          phone: certificate.phone || "N/A",
          contractorName: certificate.contractorName || contractor.name,

          // Product details
          productType: certificate.productType || "Unknown",
          contractValue: certificate.contractValue || `£ 0.00`,
          inceptionDate: certificate.inceptionDate || "N/A",
          expiryDate: certificate.expiryDate || "N/A",
          price: certificate.price || `£ 0.00`,

          // Additional fields for your PDF template
          retrofitAssessor:
            certificate.retrofitAssessor ||
            certificate.rawData?.insurance?.retrofitAssessor ||
            "Not Assigned",
          retrofitCoordinator:
            certificate.retrofitCoordinator ||
            certificate.rawData?.insurance?.retrofitCoordinator ||
            "Not Assigned",
          schemeProvider:
            certificate.schemeProvider ||
            certificate.rawData?.insurance?.schemeProvider ||
            "Not Assigned",
          fundingPartner:
            certificate.fundingPartner ||
            certificate.rawData?.insurance?.fundingPartner ||
            "Not Assigned",
          abs: certificate.abs || "N/A",

          // Timestamps
          createdAt: certificate.createdAt || new Date().toISOString(),

          // Raw data structure
          rawData: certificate.rawData || {
            insurance: {
              contractorName: certificate.contractorName || contractor.name,
              contractorAddress:
                certificate.contractorAddress || contractor.address || "",
              policyHolderName:
                certificate.holderName || certificate.policyHolderName,
              email: certificate.email,
              phone: certificate.phone,
              address: certificate.address,
              country: certificate.country,
              postcode: certificate.postcode,
              retrofitAssessor: certificate.retrofitAssessor,
              retrofitCoordinator: certificate.retrofitCoordinator,
              schemeProvider: certificate.schemeProvider,
              fundingPartner: certificate.fundingPartner,
              abs: certificate.abs,
            },
            product: {
              productType: certificate.productType,
              coverOption: "Insurance Backed Guarantee",
            },
          },
        };

        console.log(`Downloading certificate ${i + 1}:`, {
          policyNo: certData.policyNo,
          hasRetrofitAssessor: !!certData.retrofitAssessor,
          hasSchemeProvider: !!certData.schemeProvider,
        });

        // Download the PDF
        await downloadPdf(certData, contractor);

        // Small delay between downloads
        if (i < certificates.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      toast.dismiss();
      toast.success(
        `Downloaded ${certificates.length} certificates for ${contractorName}`,
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.dismiss();
      alert(`Error: ${error.message}`);
    } finally {
      setDownloadingAll(false);
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
      <div className='bg-white p-4 rounded-lg shadow-lg border'>
        <p className='font-medium'>Approve {userName}’s Signup Request?</p>
        <div className='flex gap-2 mt-3'>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading(`Approving ${userName}...`);

              try {
                const res = await fetch("/api/admin/approve-user", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    userId,
                    allowedProductIds: selectedProductIds,
                  }),
                });

                const data = await res.json();

                if (data.success) {
                  // Immediate update
                  setPendingUsers((prev) =>
                    prev.filter((user) => user.id !== userId),
                  );

                  // Update stats immediately
                  setStats((prev) => ({
                    ...prev,
                    totalContractors: prev.totalContractors + 1,
                  }));

                  toast.success(`Approved ${userName}!`, { id: loadingToast });
                  setShowRequestModal(false);
                  setSelectedProductIds([]);
                } else {
                  toast.error(data.error || "Failed to approve", {
                    id: loadingToast,
                  });
                }
              } catch (error) {
                toast.error("Failed to approve", { id: loadingToast });
              }
            }}
            className='px-3 py-1.5 bg-green-600 text-white rounded text-sm'>
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className='px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm'>
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleRejectUser = async (userId, userName) => {
    toast.custom((t) => (
      <div className='bg-white p-4 rounded-lg shadow-lg border'>
        <p className='font-medium'>Reject {userName}’s Signup Request?</p>
        <div className='flex gap-2 mt-3'>
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
                    prev.filter((user) => user.id !== userId),
                  );

                  toast.success(`Rejected ${userName}!`, { id: loadingToast });
                } else {
                  toast.error("Failed to reject", { id: loadingToast });
                }
              } catch (error) {
                toast.error("Failed to reject", { id: loadingToast });
              }
            }}
            className='px-3 py-1.5 bg-red-600 text-white rounded text-sm'>
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className='px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm'>
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
          prev.filter((req) => req.id !== requestId),
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
          prev.filter((req) => req.id !== requestId),
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

  const handleDeleteRequest = async (id) => {
    console.log("Permanently deleting certificate with ID:", id);

    // Safety check
    if (!id || id === "undefined" || id === "null") {
      toast.error("Cannot delete: Invalid certificate ID");
      console.error("Delete called with invalid ID:", id);
      return;
    }

    // Find the certificate to get details for confirmation
    const certificateToDelete = pendingRequests.find(
      (r) => r.id === id || r._id === id,
    );

    const certificateName = certificateToDelete
      ? `Policy ${certificateToDelete.policyNumber} - ${certificateToDelete.policyHolderName}`
      : `Certificate ${id}`;

    try {
      console.log("Calling PERMANENT DELETE API for ID:", id);
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Delete API response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete API error response:", errorText);
        let errorMessage = `Server error ${res.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Not JSON, use text as is
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("Delete API success:", data);

      if (data.success) {
        // Remove from pending requests
        setPendingRequests((prev) =>
          prev.filter((r) => {
            const match =
              r.id === id || r._id === id || r.id === data.deletedId;
            console.log(
              `Checking certificate ${r.id} for deletion: ${
                match ? "MATCH - removing" : "keeping"
              }`,
            );
            return !match;
          }),
        );

        // Also remove from selectedRequest if it's the same
        if (
          selectedRequest &&
          (selectedRequest.id === id ||
            selectedRequest._id === id ||
            selectedRequest.id === data.deletedId)
        ) {
          setSelectedRequest(null);
          setShowRequestModal(false);
        }

        toast.success(
          `Certificate ${data.deletedPolicyNumber || id} permanently deleted`,
        );

        // Refresh the data
        fetchPendingRequests();

        // Also update stats
        checkAdminAndLoadData();
      } else {
        toast.error(`${data.error || "Failed to delete certificate"}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDownloadSingle = async (requestId) => {
    try {
      setDownloading(true);

      const response = await fetch(`/api/admin/certificates/${requestId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.certificate) {
        throw new Error("Certificate not found");
      }

      console.log("Certificate data:", data.certificate);
      console.log("Contractor data:", data.contractor);

      // If certificate doesn't have all fields, format it
      const certificateData = {
        ...data.certificate,
        // Make sure these fields exist
        policyNo: data.certificate.policyNo || data.certificate.policyNumber,
        policyNumber:
          data.certificate.policyNumber || data.certificate.policyNo,
        holderName:
          data.certificate.holderName || data.certificate.policyHolderName,
        // Add any missing fields
        productType:
          data.certificate.productType ||
          data.certificate.products?.[0]?.productType ||
          "Unknown",
        contractValue:
          data.certificate.contractValue ||
          `£ ${
            data.certificate.products?.[0]?.contractValue?.toFixed(2) || "0.00"
          }`,
        inceptionDate:
          data.certificate.inceptionDate ||
          new Date(
            data.certificate.products?.[0]?.inceptionDate,
          ).toLocaleDateString("en-GB"),
        expiryDate:
          data.certificate.expiryDate ||
          new Date(
            data.certificate.products?.[0]?.expiryDate,
          ).toLocaleDateString("en-GB"),
        price:
          data.certificate.price ||
          `£ ${data.certificate.products?.[0]?.price?.toFixed(2) || "0.00"}`,
      };

      await downloadPdf(certificateData, data.contractor);

      toast.success("Certificate downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download: " + error.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleViewRequest = async (requestId) => {
    try {
      // Quick user request handling (no need for full fetch)
      const existingUser = pendingUsers.find((user) => user.id === requestId);
      if (existingUser) {
        setSelectedRequest({
          ...existingUser,
          type: "user_request",
          requestType: "user_approval",
          policyNumber: `USER-${existingUser.name}`,
          policyHolderName: existingUser.name,
          reason: "New contractor registration",
          requestedAt: existingUser.createdAt,
        });
        setSelectedProductIds([]);
        setAdminNotes("");
        setShowRequestModal(true);
        return;
      }

      // For all policy requests — ALWAYS use the FULL certificate endpoint
      console.log("Fetching FULL certificate data for:", requestId);
      const response = await fetch(`/api/admin/certificates/${requestId}`);

      if (!response.ok) {
        console.error(
          "Certificate fetch failed:",
          response.status,
          await response.text(),
        );
        setSelectedRequest({
          id: requestId,
          requestType: "unknown",
          policyNumber: "N/A",
          policyHolderName: "Unknown",
          reason: "Details not available",
          requestedAt: new Date().toISOString(),
        });
      } else {
        const data = await response.json();
        if (data.success && data.certificate) {
          console.log("FULL CERTIFICATE DATA LOADED:", data.certificate);

          setSelectedRequest({
            ...data.certificate,
            type: "policy_request",
            requestType: data.certificate.status?.includes("edit")
              ? "edit"
              : data.certificate.status?.includes("cancel")
                ? "cancel"
                : "unknown",
            changes: data.certificate.requestData?.changes || {},
            reason: data.certificate.requestData?.reason || "No reason",
            requestedAt:
              data.certificate.requestData?.requestedAt ||
              data.certificate.createdAt,
            contractor: data.contractor || {
              name: "Unknown",
              companyName: "N/A",
              email: "N/A",
            },
            retrofitAssessor:
              data.certificate.retrofitAssessor || "Not Assigned",
            retrofitCoordinator:
              data.certificate.retrofitCoordinator || "Not Assigned",
            fundingPartner: data.certificate.fundingPartner || "Not Assigned",
            schemeProvider: data.certificate.schemeProvider || "Not Assigned",
            policyHolderName:
              data.certificate.policyHolderName ||
              data.certificate.holderName ||
              "N/A",
            address: data.certificate.address || "N/A",
            postcode: data.certificate.postcode || "N/A",
            email: data.certificate.email || "N/A",
            phone: data.certificate.phone || "N/A",
            // NEW – pull from products[0]
            productType:
              data.certificate.productType ||
              data.certificate.products?.[0]?.productType ||
              "N/A",
            contractValue:
              data.certificate.contractValue ||
              data.certificate.products?.[0]?.contractValue ||
              "N/A",
            inceptionDate:
              data.certificate.inceptionDate ||
              data.certificate.products?.[0]?.inceptionDate ||
              "N/A",
            expiryDate:
              data.certificate.expiryDate ||
              data.certificate.products?.[0]?.expiryDate ||
              "N/A",
          });
        } else {
          setSelectedRequest({
            id: requestId,
            requestType: "unknown",
            policyNumber: "N/A",
            policyHolderName: "Unknown",
            reason: "Details not available",
            requestedAt: new Date().toISOString(),
          });
        }
      }

      setAdminNotes("");
      setShowRequestModal(true);
    } catch (error) {
      console.error("View request error:", error);
      setSelectedRequest({
        id: requestId,
        requestType: "error",
        policyNumber: "ERROR",
        policyHolderName: "Error Loading",
        reason: "Failed to load details",
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
      {/* Header Section */}
      <HeaderSection isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Stats Grid */}
      <StatsCards stats={stats} pendingRequests={pendingRequests} />

      {/* Pending Sections Container */}
      <div className='px-4 md:px-0 space-y-4 md:space-y-6'>
        {/* Pending Users Table */}
        <PendingUsersTable
          pendingUsers={pendingUsers}
          handleViewRequest={handleViewRequest}
          handleApproveUser={handleApproveUser}
          handleRejectUser={handleRejectUser}
        />

        {/* Pending Requests Table */}
        <PendingRequestsTable
          pendingRequests={pendingRequests}
          requestsLoading={requestsLoading}
          handleRefreshRequests={handleRefreshRequests}
          handleViewRequest={handleViewRequest}
          handleApproveRequest={handleApproveRequest}
          handleRejectRequest={handleRejectRequest}
          handleDownloadSingle={handleDownloadSingle}
          downloading={downloading}
        />
      </div>

      {/* Charts Section - Responsive */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6 px-4 md:px-0'>
        {/* Bar Chart */}
        <BarChartSection monthlyStats={monthlyStats} router={router} />

        {/* Top Contractors Table */}
        <TopContractorsTable
          topContractors={topContractors}
          downloadContractorCertificates={downloadContractorCertificates}
        />
      </div>

      {/* Request Modal */}
      <RequestModal
        showRequestModal={showRequestModal}
        selectedRequest={selectedRequest}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        setShowRequestModal={setShowRequestModal}
        selectedProductIds={selectedProductIds}
        setSelectedProductIds={setSelectedProductIds}
        handleApproveUser={handleApproveUser}
        handleRejectUser={handleRejectUser}
        handleApproveRequest={handleApproveRequest}
        handleRejectRequest={handleRejectRequest}
        handleDeleteRequest={handleDeleteRequest}
        handleDownloadSingle={handleDownloadSingle}
      />
    </div>
  );
}
