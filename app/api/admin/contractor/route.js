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
        { status: auth.status || 401 }
      );
    }

    // ADMIN CHECK
    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
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
    // if (type === "requests") {
    //   console.log("=== ADMIN API DEBUG ===");
    //   console.log("Query parameters:", { type, status, page, limit });

    //   let requestQuery = {
    //     status: "pending",
    //   };

    //   if (status === "edit") {
    //     requestQuery["requestData.type"] = "edit";
    //   } else if (status === "cancel") {
    //     requestQuery["requestData.type"] = "cancel";
    //   }


    //   // Get total count
    //   const total = await Insurance.countDocuments(requestQuery);
    //   console.log("Total documents matching query:", total);

    //   // Get the actual documents
    //   const rawRequests = await Insurance.find(requestQuery)
    //     .populate("userId", "name email companyName")
    //     .sort({ createdAt: -1 })
    //     .skip((page - 1) * limit)
    //     .limit(limit);

    //   console.log("Raw requests found:", rawRequests);

    //   if (rawRequests.length > 0) {
    //     console.log("First request details:");
    //     console.log("ID:", rawRequests[0]._id);
    //     console.log("Status:", rawRequests[0].status);
    //     console.log("Policy Number:", rawRequests[0].policyNumber);
    //     console.log("Request Data:", rawRequests[0].requestData);
    //     console.log("User ID populated?", !!rawRequests[0].userId);
    //   }

    //   console.log("=== END DEBUG ===");

    //   const requests = rawRequests.map((insurance) => ({
    //     id: insurance._id,
    //     policyNumber: insurance.policyNumber,
    //     policyHolderName: insurance.policyHolderName,
    //     policyHolderAddress: insurance.address,
    //     contractor: insurance.userId
    //       ? {
    //           id: insurance.userId._id,
    //           name: insurance.userId.name,
    //           email: insurance.userId.email,
    //           companyName: insurance.userId.companyName,
    //           phoneNumber: insurance.userId.phoneNumber,
    //           isSuspended: insurance.userId.isSuspended || false, 
    //         }
    //       : null,
    //     requestType: insurance.requestData?.type || "edit",
    //     status: insurance.status,
    //     requestedAt: insurance.requestData?.requestedAt || insurance.createdAt,
    //     changes: insurance.requestData?.changes || {},
    //     reason: insurance.requestData?.reason || "",
    //     createdAt: insurance.createdAt,
    //   }));

    //   console.log("Formatted requests being returned:", requests.length);

    //   return Response.json({
    //     success: true,
    //     requests,
    //     pagination: {
    //       page,
    //       limit,
    //       total,
    //       pages: Math.ceil(total / limit),
    //     },
    //   });
    // }
    // ========== END SECTION ==========

// ========== Handle requests type ==========
if (type === "requests") {
  console.log("=== ADMIN API DEBUG ===");
  console.log("Query parameters:", { type, status, page, limit });

  let requestQuery = {
    status: "pending",
  };

  if (status === "edit") {
    requestQuery["requestData.type"] = "edit";
  } else if (status === "cancel") {
    requestQuery["requestData.type"] = "cancel";
  }

  // Get total count
  const total = await Insurance.countDocuments(requestQuery);
  console.log("Total documents matching query:", total);

  // Get the actual documents with all insurance data
  const rawRequests = await Insurance.find(requestQuery)
    .populate("userId", "name email companyName phoneNumber isSuspended")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  console.log("Raw requests found:", rawRequests.length);

  const requests = rawRequests.map((insurance) => {
    // Extract data from nested structure
    const rawInsurance = insurance.rawData?.insurance || {};
    const rawProduct = insurance.rawData?.product || {};
    
    // Get policy number from multiple possible sources
    const policyNumber = insurance.policyNumber || 
                        rawInsurance.policyNumber || 
                        rawInsurance.policyNo || 
                        "N/A";
    
    // Get product type (Measure)
    const productType = rawProduct.productType || 
                       rawInsurance.productType || 
                       insurance.productType || 
                       "N/A";
    
    // Get contract value with proper formatting
    const contractValue = rawProduct.contractValue || 
                         rawInsurance.contractValue || 
                         insurance.contractValue || 
                         "N/A";
    
    // Get price
    const price = rawProduct.price || 
                 rawInsurance.price || 
                 insurance.price || 
                 "N/A";
    
    // Get phone number
    const phone = rawInsurance.phone || 
                 insurance.phone || 
                 insurance.phoneNumber || 
                 "N/A";
    
    // Get email
    const email = rawInsurance.email || 
                 insurance.email || 
                 "N/A";
    
    // Get country
    const country = rawInsurance.country || 
                   insurance.country || 
                   "United Kingdom";
    
    // Get postcode
    const postcode = rawInsurance.postcode || 
                    insurance.postcode || 
                    "N/A";
    
    // Get dates
    const inceptionDate = rawProduct.inceptionDate ? 
                         new Date(rawProduct.inceptionDate).toLocaleDateString('en-GB') : 
                         (rawInsurance.inceptionDate || "N/A");
    
    const expiryDate = rawProduct.expiryDate ? 
                      new Date(rawProduct.expiryDate).toLocaleDateString('en-GB') : 
                      (rawInsurance.expiryDate || "N/A");
    
    // Format requestedAt date
    const requestedAt = insurance.requestData?.requestedAt || insurance.createdAt;
    const formattedRequestedAt = new Date(requestedAt).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      id: insurance._id.toString(),
      policyNumber: policyNumber,
      policyHolderName: rawInsurance.policyHolderName || insurance.policyHolderName || "N/A",
      policyHolderAddress: rawInsurance.address || insurance.address || insurance.policyHolderAddress || "N/A",
      address: rawInsurance.address || insurance.address || "N/A",
      
      // All the fields you need
      country: country,
      postcode: postcode,
      email: email,
      phone: phone,
      productType: productType, // This is "Measure"
      contractValue: contractValue,
      price: price,
      totalAmount: rawProduct.totalProjectCost || insurance.totalAmount || "N/A",
      insuranceCoverage: rawProduct.coverOption || "Insurance Backed Guarantee",
      inceptionDate: inceptionDate,
      expiryDate: expiryDate,
      transactionType: insurance.transactionType || "Certificate Generated",
      submissionFiles: insurance.submissionFiles || [],
      abs: rawInsurance.abs || "External Provider",
      fundingPartner: rawInsurance.fundingPartner || "External Provider",
      holderName: rawInsurance.holderName || "N/A",
      contractorAddress: rawInsurance.contractorAddress || "N/A",
      contractorName: rawInsurance.contractorName || "N/A",
      
      contractor: insurance.userId ? {
        id: insurance.userId._id.toString(),
        name: insurance.userId.name,
        email: insurance.userId.email,
        companyName: insurance.userId.companyName,
        phoneNumber: insurance.userId.phoneNumber,
        isSuspended: insurance.userId.isSuspended || false,
      } : null,
      
      requestType: insurance.requestData?.type || "edit",
      status: insurance.status,
      requestedAt: requestedAt,
      formattedRequestedAt: formattedRequestedAt, // DD/MM/YYYY - HH:MM
      changes: insurance.requestData?.changes || {},
      reason: insurance.requestData?.reason || "",
      createdAt: insurance.createdAt,
      updatedAt: insurance.updatedAt,
    };
  });

  console.log("Formatted requests sample:", requests[0]);

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
// ========== END SECTION ==========
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
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return Response.json({
      success: true,
      users: contractors.map((contractor) => ({
        id: contractor._id,
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone || "",
        companyName: contractor.companyName || "",
        phoneNumber: contractor.phoneNumber || "",
        companyAddress: contractor.companyAddress || "",
        position: contractor.position || "",
        role: contractor.role,
        isApproved: contractor.isApproved,
        isSuspended: contractor.isSuspended || false, 
        suspensionReason: contractor.suspensionReason || "", 
        suspendedAt: contractor.suspendedAt || null,
        createdAt: contractor.createdAt,
        updatedAt: contractor.updatedAt,
        certificateCount: contractor.certificateCount,
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
      { status: 500 }
    );
  }
}
