import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";
import Insurance from "@/models/Insurance";

export async function GET(request) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 },
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    // GET CONTRACTORS
    await connectDB();

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // ========== Handle requests type ==========
    if (type === "requests") {
      console.log("=== ADMIN API - Fetching pending requests ===");
      console.log("Query parameters:", { type, status, page, limit });

      let requestQuery = {
        status: "pending",
      };

      // Optional: filter only edit requests if needed
      if (status === "edit") {
        requestQuery["requestData.type"] = "edit";
      } else if (status === "cancel") {
        requestQuery["requestData.type"] = "cancel";
      }

      // Get total count
      const total = await Insurance.countDocuments(requestQuery);
      console.log("Total pending requests found:", total);

      // Fetch the documents with populated user/contractor
      const rawRequests = await Insurance.find(requestQuery)
        .populate("userId", "name email companyName phoneNumber isSuspended")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      console.log("Raw requests count:", rawRequests.length);

      const requests = rawRequests.map((insurance) => {
        // ── 1. Get the first (and usually only) product ────────────────────────
        const product = insurance.products?.[0] || {};

        // ── 2. Helper function to get value with proper priority ───────────────
        const get = (key, fallback = "N/A") => {
          // Priority 1: from products[0]
          if (
            product[key] !== undefined &&
            product[key] !== null &&
            product[key] !== ""
          ) {
            return product[key];
          }
          // Priority 2: from top-level insurance document
          if (
            insurance[key] !== undefined &&
            insurance[key] !== null &&
            insurance[key] !== ""
          ) {
            return insurance[key];
          }
          return fallback;
        };

        // ── 3. Date formatting helper ──────────────────────────────────────────
        const formatDate = (dateValue) => {
          if (!dateValue) return "N/A";
          try {
            return new Date(dateValue).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
          } catch {
            return "N/A";
          }
        };

        // ── 4. Build clean response object
        return {
          id: insurance._id.toString(),

          // Core policy info
          policyNumber: insurance.policyNumber || "N/A",
          status: insurance.status,

          // Policyholder information
          policyHolderName: get(
            "policyHolderName",
            insurance.policyHolderName || "N/A",
          ),
          policyHolderAddress: get("address", insurance.address || "N/A"),
          address: get("address", insurance.address || "N/A"),
          country: get("country", insurance.country || "United Kingdom"),
          postcode: get("postcode", insurance.postcode || "N/A"),
          email: get("email", insurance.email || "N/A"),
          phone: get("phone", insurance.phone || "N/A"),

          // Product / Measure (THIS is where most real data lives!)
          productType: get("productType", "N/A"),
          insuranceCoverage: get("coverOption", "Insurance Backed Guarantee"),
          contractValue:
            get("contractValue") === "N/A"
              ? "N/A"
              : `£ ${Number(get("contractValue")).toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                })}`,
          totalAmount:
            get("totalProjectCost") === "N/A"
              ? "N/A"
              : `£ ${Number(get("totalProjectCost")).toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                })}`,
          price:
            get("price") === "N/A"
              ? "N/A"
              : `£ ${Number(get("price")).toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                })}`,

          // Important dates
          inceptionDate: formatDate(get("inceptionDate")),
          expiryDate: formatDate(
            get("expiryDate") || product.expiryDateCalculated,
          ),

          // Contractor information
          contractor: insurance.userId
            ? {
                id: insurance.userId._id?.toString(),
                name: insurance.userId.name || "N/A",
                email: insurance.userId.email || "N/A",
                companyName:
                  insurance.userId.companyName ||
                  insurance.contractorName ||
                  "N/A",
                phoneNumber: insurance.userId.phoneNumber || "N/A",
                isSuspended: insurance.userId.isSuspended || false,
              }
            : {
                name: insurance.contractorName || "N/A",
                companyName: insurance.contractorName || "N/A",
              },

          // Request specific fields
          requestType: insurance.requestData?.type || "edit",
          changes: insurance.requestData?.changes || {},
          reason: insurance.requestData?.reason || "",
          requestedAt:
            insurance.requestData?.requestedAt || insurance.createdAt,
          formattedRequestedAt: new Date(
            insurance.requestData?.requestedAt || insurance.createdAt,
          ).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),

          // Additional fallback/display fields
          abs: insurance.abs || product.retrofitAssessor || "External Provider",
          fundingPartner: insurance.fundingPartner || "External Provider",
          transactionType: "Certificate Generated",
          submissionFiles: insurance.submissionFiles || [],

          createdAt: insurance.createdAt,
          updatedAt: insurance.updatedAt,
        };
      });

      console.log("Returning formatted requests count:", requests.length);
      // Optional: log first request for debugging
      if (requests.length > 0) {
        console.log("Sample first request:", {
          policyNumber: requests[0].policyNumber,
          productType: requests[0].productType,
          contractValue: requests[0].contractValue,
          inceptionDate: requests[0].inceptionDate,
          changes: requests[0].changes,
        });
      }

      return Response.json({
        success: true,
        requests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
    // ========== END requests handling ==========

    // Build query - only get contractors
    let query = { role: "contractor" };

    if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    }
    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get contractors with pagination
    const contractors = await User.find(query)
      .select("-passwordHash")
      .select(
        "name companyName email phoneNumber isApproved isSuspended role roles createdAt updatedAt policyNoPrefix lastCertificateSequence isPrefixLocked allowedProducts",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const contractorsWithCounts = await Promise.all(
      contractors.map(async (contractor) => {
        const count = await Insurance.countDocuments({
          userId: contractor._id,
        });
        return {
          ...contractor,
          certificateCount: count,
        };
      }),
    );
    return Response.json({
      success: true,
      users: contractorsWithCounts.map((contractor) => ({
        id: contractor._id,
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone || "",
        companyName: contractor.companyName || "",
        phoneNumber: contractor.phoneNumber || "",
        companyAddress: contractor.companyAddress || "",
        position: contractor.position || "",
        role: contractor.role,
        roles: contractor.roles,
        isApproved: contractor.isApproved,
        isSuspended: contractor.isSuspended || false,
        suspensionReason: contractor.suspensionReason || "",
        suspendedAt: contractor.suspendedAt || null,
        createdAt: contractor.createdAt,
        updatedAt: contractor.updatedAt,
        certificateCount: contractor.certificateCount,

        // for prefix
        policyNoPrefix: contractor.policyNoPrefix || null,
        lastCertificateSequence: contractor.lastCertificateSequence || 0,
        isPrefixLocked: contractor.isPrefixLocked || false,

        allowedProducts: contractor.allowedProducts || [],
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get contractors error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
