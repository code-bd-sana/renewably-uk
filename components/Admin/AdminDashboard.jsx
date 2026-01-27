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
  Download,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadPdf } from "@/utils/pdfGenerator";
import { Download as DownloadIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import RequestStatusDropdown from "./RequestActionDropdown";
import CertificateActionsDropdown from "./RequestActionDropdown";

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
      // Try different endpoints or create a new one that returns all data
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

  // const handleViewRequest = async (requestId) => {
  //   try {
  //     // First try to find the request in the existing array
  //     const existingRequest = pendingRequests.find(
  //       (req) => req.id === requestId,
  //     );

  //     // Also check in pendingUsers for user approval requests
  //     const existingUser = pendingUsers.find((user) => user.id === requestId);

  //     console.log("existing request", existingRequest);
  //     // If found, use it directly
  //     if (existingRequest) {
  //       setSelectedRequest(existingRequest);

  //       setAdminNotes("");
  //       setShowRequestModal(true);
  //       return;
  //     }
  //     // If it's a policy request
  //     if (existingRequest) {
  //       setSelectedRequest({
  //         ...existingRequest,
  //         type: "policy_request", // Add type identifier
  //       });
  //       setAdminNotes("");
  //       setShowRequestModal(true);
  //       return;
  //     }

  //     // If it's a user request
  //     if (existingUser) {
  //       setSelectedRequest({
  //         ...existingUser,
  //         type: "user_request", // Add type identifier
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
  //     // If not found locally, try to fetch from API
  //     const response = await fetch(
  //       `/api/admin/contractor/${requestId}/details`,
  //     );

  //     // Check if response is JSON
  //     const contentType = response.headers.get("content-type");
  //     if (!contentType || !contentType.includes("application/json")) {
  //       throw new Error("Server returned non-JSON response");
  //     }

  //     const data = await response.json();

  //     if (data.success) {
  //       setSelectedRequest(data.request);
  //     } else {
  //       // Create a fallback request object
  //       setSelectedRequest({
  //         id: requestId,
  //         requestType: "unknown",
  //         policyNumber: "N/A",
  //         policyHolderName: "Unknown",
  //         reason: "Details not available",
  //         requestedAt: new Date().toISOString(),
  //       });
  //     }

  //     setAdminNotes("");
  //     setShowRequestModal(true);
  //   } catch (error) {
  //     console.error("Error fetching request details:", error);

  //     // Create a basic request object
  //     setSelectedRequest({
  //       id: requestId,
  //       requestType: "error",
  //       policyNumber: "ERROR",
  //       policyHolderName: "Error Loading",
  //       reason: "Failed to load request details: " + error.message,
  //       requestedAt: new Date().toISOString(),
  //     });

  //     setAdminNotes("");
  //     setShowRequestModal(true);
  //   }
  // };

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
          },
          error: {
            duration: 4000,
          },
        }}
      />
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
        <div className='flex items-center gap-x-4'>
          {/* LOGO */}
          <div>
            <Image
              src='/foot-logo.png'
              alt='Renewably UK'
              width={90}
              height={90}
              priority
              className=' object-contain'
            />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-semibold flex items-center gap-2'>
              Welcome Back, Admin 👋
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 px-4 md:px-0'>
        {[
          {
            title: "This Month Policies",
            value: stats.thisMonthCertificates || stats.thisMonthPolicies || 0,
            icon: Calendar,
            color: "#0F47A8",
          },
          {
            title: "This Month Premium Total",
            value: `£${(stats.thisMonthRevenue || 0).toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: PoundSterling,
            color: "#0F47A8",
          },
          {
            title: "Total Policies",
            value: stats.totalCertificates || stats.totalPolicies || 0,
            icon: FileText,
            color: "#0F47A8",
          },
          {
            title: "Premium Total",
            value: `£${(
              stats.totalRevenue ||
              stats.premiumTotal ||
              0
            ).toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            icon: PoundSterling,
            color: "#0F47A8",
          },
          {
            title: "Total Contractors",
            value: stats.totalContractors || 0,
            icon: Users,
            color: "#0F47A8",
          },
          {
            title: "Edit Request Pending",
            value: pendingRequests.length,
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
                      <button
                        onClick={() => handleViewRequest(user.id)}
                        className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                        title='View'>
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleApproveUser(user.id, user.name)}
                        className='p-2 text-green-600 hover:bg-green-50 rounded'
                        title='Approve'>
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectUser(user.id, user.name)}
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
                <thead className='bg-gray-50 border-b border-gray-200 text-center'>
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
                    <th className='px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Actions
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
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleViewRequest(user.id)}
                            className='p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer'
                            title='View Request Details'>
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleApproveUser(user.id, user.name)
                            }
                            className='p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer'
                            title='Approve Request'>
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id, user.name)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer'
                            title='Reject Request'>
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
            <div className='flex justify-center'>
              <Image
                src='/bluedrop.png'
                height='200'
                width='200'
                alt='Renewably UK'
                className=''
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
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
                          "en-GB",
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

              {/* Desktop Pending Table View */}
              <table className='hidden md:table w-full'>
                <thead className='bg-gray-50 border-b border-gray-200 '>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Contractor
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Policy Number
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Policy Holder Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Policy Holder Address
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Request Type
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Requested At
                    </th>
                    <th className='px-6 py-3 text-center mx-auto text-xs font-medium text-gray-600 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className='bg-white divide-y divide-gray-200'>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className='hover:bg-gray-50'>
                      {/* Contractor */}
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

                      {/* Policy Number */}
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {request.policyNumber}
                        </div>
                      </td>

                      {/* Policy Holder Name */}
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {request.policyHolderName}
                        </div>
                      </td>

                      {/* Policy Holder Address */}
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {request.policyHolderAddress}
                        </div>
                      </td>

                      {/* Measure (Product Type) */}

                      {/* Request Type */}
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.requestType === "edit"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {request.requestType === "edit" ? "Edit" : "Cancel"}
                        </span>
                        {request.reason && (
                          <div className='text-xs text-gray-500 mt-1 max-w-xs'>
                            Reason: {request.reason}
                          </div>
                        )}
                      </td>

                      {/* Requested At (DD/MM/YYYY - HH:MM) */}
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {request.formattedRequestedAt ||
                          new Date(request.requestedAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                      </td>

                      {/* Actions */}
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <div className='flex gap-2 items-center justify-center'>
                          <button
                            onClick={() => handleViewRequest(request.id)}
                            className='px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded text-sm cursor-pointer'
                            title='View Details'>
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadSingle(request.id)}
                            className='px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded text-sm cursor-pointer'
                            title='Download Certificate'
                            disabled={downloading}>
                            {downloading ? (
                              <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                              <DownloadIcon />
                            )}
                          </button>
                          {/* <button
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
                          </button> */}
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

          <div className='relative h-64 md:h-80'>
            {/* Y-axis labels - nicer stepped scale */}
            <div className='absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500 pr-2'>
              {yAxisLabels.map((label, i) => (
                <div key={i} className='text-right'>
                  {label.toLocaleString()}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className='ml-16 h-full border-l border-b border-gray-200 pl-4 pb-8'>
              <div className='grid grid-cols-12 md:flex md:flex-row items-end justify-between gap-1 md:gap-3 h-full'>
                {monthlyStats.map((data, index) => {
                  const barHeight =
                    maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className='flex flex-col items-center flex-1'>
                      <button
                        onClick={() => handleMonthClick(data.monthNumber)}
                        className='w-full bg-[#0F47A8] rounded-t transition-all hover:bg-blue-700 group relative cursor-pointer'
                        style={{
                          height: `${barHeight}%`,
                          minHeight: data.value > 0 ? "10px" : "0px",
                        }}
                        title={`${data.month}: ${data.value} policies`}>
                        <div className='absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50'>
                          {data.value} policies
                        </div>
                      </button>
                      <span className='text-[10px] md:text-xs text-gray-600 mt-2 truncate w-full text-center'>
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
                          contractor.name,
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
                              contractor.name,
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
          <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]  overflow-hidden my-auto'>
            {/* Header */}
            <div className='p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10'>
              <Image
                src='/bluedrop.png'
                height={200}
                width={200}
                alt='Renewably UK'
                className='h-auto w-auto my-2'
              />
              <div className='flex items-center justify-between mb-3'>
                <div className='flex-1 min-w-0'>
                  <h1 className='text-lg md:text-2xl font-bold text-gray-900 truncate'>
                    {selectedRequest.type === "user_request"
                      ? `Contractor Application: ${selectedRequest.name}`
                      : `Policy Request: ${selectedRequest.policyNumber}`}
                  </h1>
                  <p className='text-xs md:text-sm text-gray-600 truncate'>
                    {selectedRequest.type === "user_request"
                      ? `Company: ${selectedRequest.companyName}`
                      : `By: ${selectedRequest.contractor?.name}`}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <CertificateActionsDropdown
                    requestId={selectedRequest.id || selectedRequest._id}
                    requestData={selectedRequest}
                    onApprove={() => {
                      if (selectedRequest.type === "user_request") {
                        handleApproveUser(
                          selectedRequest.id,
                          selectedRequest.name,
                        );
                      } else {
                        handleApproveRequest(selectedRequest.id);
                      }
                      setShowRequestModal(false);
                    }}
                    onReject={() => {
                      if (selectedRequest.type === "user_request") {
                        handleRejectUser(
                          selectedRequest.id,
                          selectedRequest.name,
                        );
                      } else {
                        handleRejectRequest(selectedRequest.id);
                      }
                      setShowRequestModal(false);
                    }}
                    onDelete={
                      selectedRequest.type === "user_request"
                        ? null
                        : () => handleDeleteRequest(selectedRequest.id)
                    }
                    onDownload={
                      selectedRequest.type === "user_request"
                        ? null
                        : () => handleDownloadSingle(selectedRequest.id)
                    }
                    showPending
                  />
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
                    selectedRequest.type === "user_request"
                      ? "bg-purple-100 text-purple-800"
                      : selectedRequest.requestType === "edit"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                  }`}>
                  {selectedRequest.type === "user_request"
                    ? "New Contractor"
                    : selectedRequest.requestType === "edit"
                      ? "Edit Request"
                      : "Cancel Request"}
                </span>
                <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
                  Pending Review
                </span>
                <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs'>
                  {new Date(
                    selectedRequest.requestedAt || selectedRequest.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Content - Different content for user vs policy requests */}
            <div className='p-4 md:p-6 overflow-y-auto max-h-[60vh]'>
              {selectedRequest.type === "user_request" ? (
                /* USER REQUEST CONTENT  */
                <>
                  {/* User Details */}
                  <div className='mb-6'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                      Contractor Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-gray-500'>Full Name</p>
                        <p className='font-medium'>{selectedRequest.name}</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Company Name</p>
                        <p className='font-medium'>
                          {selectedRequest.companyName}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Email Address</p>
                        <p className='font-medium'>{selectedRequest.email}</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Phone Number</p>
                        <p className='font-medium'>
                          {selectedRequest.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>
                          Application Date
                        </p>
                        <p className='font-medium'>
                          {new Date(
                            selectedRequest.createdAt,
                          ).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Status</p>
                        <p className='font-medium'>Pending Approval</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents (if any) */}
                  {selectedRequest.documents &&
                    selectedRequest.documents.length > 0 && (
                      <div className='mb-6'>
                        <h4 className='font-medium text-gray-700 mb-3'>
                          Submitted Documents
                        </h4>
                        <div className='space-y-2'>
                          {selectedRequest.documents.map((doc, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 text-sm'>
                              <FileText size={14} className='text-gray-400' />
                              <span>{doc.name}</span>
                              <a
                                href={doc.url}
                                className='text-blue-600 hover:underline ml-2'>
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
                  <div className='mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100'>
                    <h3 className='font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                      <FileText size={16} /> Request Reason:
                    </h3>
                    <p className='text-gray-800 bg-white p-3 rounded border'>
                      {selectedRequest.reason || "No reason provided"}
                    </p>
                  </div>

                  {/* Side by Side Comparison */}
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                    {/* Original Details */}
                    <div className='bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='p-4 border-b border-gray-200 bg-white'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Original Details
                        </h3>
                      </div>
                      <div className='p-4'>
                        <div className='space-y-3'>
                          {/* Contractor Information */}
                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Contractor
                            </p>
                            <p className='text-gray-900 font-medium'>
                              {selectedRequest.contractor?.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {selectedRequest.contractor?.companyName}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {selectedRequest.contractor?.email}
                            </p>
                          </div>

                          {/* Policy Information */}
                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Policy Number
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.policyNumber}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Policy Holder Name
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.policyHolderName}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Policy Holder Address
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.policyHolderAddress}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Measure (Product Type)
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.productType}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Country
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.country}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Postcode
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.postcode}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>Email</p>
                            <p className='text-gray-900'>
                              {selectedRequest.email}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>Phone</p>
                            <p className='text-gray-900'>
                              {selectedRequest.phone}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Contract Value
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.contractValue
                                ?.toString()
                                .includes("£")
                                ? selectedRequest.contractValue
                                : `${selectedRequest.contractValue}`}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Insurance Coverage
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.insuranceCoverage}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Inception Date
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.inceptionDate}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Expiry Date
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.expiryDate}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Retrofit Assessor
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.retrofitAssessor ||
                                "Not Assigned"}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Retrofit Coordinator
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.retrofitCoordinator ||
                                "Not Assigned"}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Funding Partner
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.fundingPartner || "Not Assigned"}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Scheme Provider
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.schemeProvider || "Not Assigned"}
                            </p>
                          </div>

                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Requested At
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.formattedRequestedAt ||
                                new Date(
                                  selectedRequest.requestedAt,
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
                    <div className='bg-gray-50 rounded-lg border border-gray-200'>
                      <div className='p-4 border-b border-gray-200 bg-white'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Requested Changes
                        </h3>
                      </div>
                      <div className='p-4'>
                        <div className='space-y-3'>
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

                            {
                              changeKey: "retrofitAssessor",
                              originalKey: "retrofitAssessor",
                              label: "Retrofit Assessor",
                            },
                            {
                              changeKey: "retrofitCoordinator",
                              originalKey: "retrofitCoordinator",
                              label: "Retrofit Coordinator",
                            },
                            {
                              changeKey: "fundingPartner",
                              originalKey: "fundingPartner",
                              label: "Funding Partner",
                            },
                            {
                              changeKey: "schemeProvider",
                              originalKey: "schemeProvider",
                              label: "Scheme Provider",
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
                                  }>
                                  <p className='text-sm text-gray-600 mb-1'>
                                    {label}
                                  </p>
                                  <div className='flex justify-between items-center'>
                                    <p className='text-gray-900'>
                                      {displayValue || "N/A"}
                                    </p>
                                    {hasChange && (
                                      <span className='text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded'>
                                        CHANGED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}

                          {/* Static fields that don't change often */}
                          <div>
                            <p className='text-sm text-gray-600 mb-1'>
                              Insurance Coverage
                            </p>
                            <p className='text-gray-900'>
                              {selectedRequest.insuranceCoverage ||
                                "Insurance Backed Guarantee"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contractor Information */}
                  <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                      Contractor Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Contractor Name
                        </p>
                        <p className='font-medium'>
                          {selectedRequest.contractor?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Company Name
                        </p>
                        <p className='font-medium'>
                          {selectedRequest.contractor?.companyName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>Email</p>
                        <p className='font-medium'>
                          {selectedRequest.contractor?.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600 mb-1'>
                          Contractor Address
                        </p>
                        <p className='font-medium'>
                          {selectedRequest.changes?.contractorAddress || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Admin Notes (Common for both types) */}
              <div className='mb-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                  Admin Notes
                </h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  rows='3'
                  placeholder='Add your notes here... (These notes will be visible to the contractor)'
                />
                <p className='text-sm text-gray-500 mt-2'>
                  These notes will be sent to the contractor along with your
                  decision.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='p-4 md:p-6 border-t border-gray-200 bg-gray-50'>
              <div className='flex flex-col sm:flex-row justify-between items-center gap-3'>
                {/* <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                  Review and take action
                </p> */}
                <div className='flex gap-2 w-full sm:w-auto'>
                  {/* <button
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
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
