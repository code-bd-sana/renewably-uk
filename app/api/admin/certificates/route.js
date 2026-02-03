import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(request) {
  try {
    // Auth check
    const auth = await authenticate(request);

    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 },
      );
    }

    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 },
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get("contractorId");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const search = searchParams.get("search") || "";
    const month = searchParams.get("month");

    console.log("Fetching certificates for contractor:", contractorId);

    // Find contractor to get their email
    let contractor = null;
    let query = {};

    if (contractorId) {
      contractor = await User.findById(contractorId).select(
        "email name companyName companyAddress",
      );

      if (contractor) {
        // Find certificates by user ID (contractor ID)
        query.userId = contractorId;
        console.log("Searching certificates for contractor ID:", contractorId);
      } else {
        console.log("Contractor not found:", contractorId);
        return Response.json({
          success: true,
          certificates: [],
          total: 0,
          page: 1,
          totalPages: 0,
          contractor: null,
        });
      }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: "i" } },
        { policyHolderName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "products.productType": { $regex: search, $options: "i" } },
        { contractorName: { $regex: search, $options: "i" } },
      ];
    }

    // Add month filter if provided
    if (month) {
      const monthNum = parseInt(month);
      const year = new Date().getFullYear();
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    // Fetch certificates
    const certificates = await Insurance.find(query)
      .select(
        `
    _id 
    policyNumber 
    policyHolderName 
    email 
    phone 
    address 
    country 
    postcode 
    products 
    emailGenerated 
    emailGeneratedAt 
    emailSentTo 
    emailAttempts 
    emailError
    contractorName
    contractorAddress
    retrofitAssessor
    retrofitCoordinator
    fundingPartner
    schemeProvider
    abs
    status
    createdAt
    updatedAt
  `,
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Found ${certificates.length} certificates`);

    // Get total count
    const total = await Insurance.countDocuments(query);

    // Format response to match frontend expectations
    // Replace the current formattedCertificates block with this:

    const formattedCertificates = [];

    for (const cert of certificates) {
      const policyNo =
        cert.policyNumber || `POL-${cert._id.toString().slice(-6)}`;

      // If no products → add one fallback row
      if (!cert.products || cert.products.length === 0) {
        formattedCertificates.push({
          id: cert._id.toString(),
          policyNo,
          holderName: cert.policyHolderName,
          productType: "Insurance Backed Guarantee",
          contractValue: "£ 0.00",
          inceptionDate: "N/A",
          expiryDate: "N/A",
          price: "£ 0.00",
          createdAt: cert.createdAt,
          status: cert.status || "active",
          email: cert.email,
          phone: cert.phone,
          address: cert.address,
          country: cert.country,
          postcode: cert.postcode,
          userId: cert.userId,
          contractorName: cert.contractorName,
          rawData: cert,
          emailGenerated: cert.emailGenerated || false,
          emailGeneratedAt: cert.emailGeneratedAt,
          emailSentTo: cert.emailSentTo,
          insuranceId: cert._id.toString(), // ← useful for later detail fetch
        });
        continue;
      }

      // One row per product
      cert.products.forEach((product, index) => {
        const inceptionDate = product.inceptionDate
          ? new Date(product.inceptionDate).toLocaleDateString("en-GB")
          : "N/A";

        const expiryDate = product.expiryDate
          ? new Date(product.expiryDate).toLocaleDateString("en-GB")
          : "N/A";

        const contractValue = product.contractValue
          ? `£ ${product.contractValue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "£ 0.00";

        const price = product.price
          ? `£ ${product.price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "£ 0.00";

        formattedCertificates.push({
          id: `${cert._id}-${index}`, // ← compound ID! Important
          policyNo,
          policyNumber: cert.policyNumber,
          holderName: cert.policyHolderName,
          productType: product.productType || "Insurance Backed Guarantee",
          contractValue,
          inceptionDate,
          expiryDate,
          transactionType: "Certificate Generated",
          price,
          createdAt: cert.createdAt,
          status: cert.status || "active",
          email: cert.email,
          phone: cert.phone,
          address: cert.address,
          country: cert.country,
          postcode: cert.postcode,
          userId: cert.userId,
          contractorName: cert.contractorName,
          rawData: cert,
          insuranceId: cert._id.toString(), // ← reference to parent document
          productIndex: index, // optional, but useful
        });
      });
    }

    // Then return them sorted by createdAt (newest first)
    formattedCertificates.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return Response.json({
      success: true,
      certificates: formattedCertificates,
      total: formattedCertificates.length, // ← now it's count of product-rows, not documents
      page,
      totalPages: Math.ceil(formattedCertificates.length / limit),
      contractor: contractor
        ? {
            id: contractor._id.toString(),
            name: contractor.name,
            companyName: contractor.companyName,
            email: contractor.email,
            address: contractor.companyAddress,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/admin/certificates error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
