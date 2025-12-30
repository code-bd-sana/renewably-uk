// app/api/admin/certificates/route.js
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
        { status: auth.status || 401 }
      );
    }

    if (auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
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
      contractor = await User.findById(contractorId).select("email name companyName");
      
      if (contractor && contractor.email) {
        // Find certificates by contractor email
        query.email = contractor.email;
        console.log("Searching certificates for email:", contractor.email);
      } else {
        console.log("Contractor not found or no email:", contractorId);
      }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { policyNo: { $regex: search, $options: "i" } },
        { policyNumber: { $regex: search, $options: "i" } },
        { holderName: { $regex: search, $options: "i" } },
        { policyHolderName: { $regex: search, $options: "i" } },
        { productType: { $regex: search, $options: "i" } },
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
        $lt: endDate
      };
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    // Fetch certificates
    const certificates = await Insurance.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Found ${certificates.length} certificates`);

    // Get total count
    const total = await Insurance.countDocuments(query);

    // Format response
    const formattedCertificates = certificates.map((cert) => {
      // Extract policy number from various possible fields
      const policyNo = cert.policyNo || cert.policyNumber || cert.policyId || `POL-${cert._id.toString().slice(-6)}`;
      
      // Extract holder name
      const holderName = cert.holderName || cert.policyHolderName || cert.customerName || "N/A";
      
      // Format dates
      const inceptionDate = cert.inceptionDate 
        ? new Date(cert.inceptionDate).toLocaleDateString("en-GB")
        : (cert.startDate ? new Date(cert.startDate).toLocaleDateString("en-GB") : "N/A");
      
      const expiryDate = cert.expiryDate 
        ? new Date(cert.expiryDate).toLocaleDateString("en-GB")
        : (cert.endDate ? new Date(cert.endDate).toLocaleDateString("en-GB") : "N/A");
      
      // Format price
      let price = "€ 0.00";
      if (cert.price) {
        price = cert.price;
      } else if (cert.premium) {
        price = `€ ${cert.premium}`;
      } else if (cert.amount) {
        price = `€ ${cert.amount}`;
      }

      // Format contract value
      let contractValue = "€ 0.00";
      if (cert.contractValue) {
        contractValue = cert.contractValue;
      } else if (cert.value) {
        contractValue = `€ ${cert.value}`;
      } else if (cert.contractAmount) {
        contractValue = `€ ${cert.contractAmount}`;
      }

      return {
        id: cert._id.toString(),
        policyNo: policyNo,
        holderName: holderName,
        productType: cert.productType || cert.type || "Insurance Backed Guarantee",
        contractValue: contractValue,
        inceptionDate: inceptionDate,
        expiryDate: expiryDate,
        transactionType: cert.transactionType || "Certificate Generated",
        price: price,
        createdAt: cert.createdAt || cert.issuedAt || new Date(),
        status: cert.status || "active",
        email: cert.email || "",
        phone: cert.phone || "",
        address: cert.address || "",
        country: cert.country || "",
        postcode: cert.postcode || "",
        rawData: cert, 
      };
    });

    return Response.json({
      success: true,
      certificates: formattedCertificates,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      contractor: contractor
        ? {
            id: contractor._id.toString(),
            name: contractor.name,
            companyName: contractor.companyName,
            email: contractor.email,
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/admin/certificates error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}