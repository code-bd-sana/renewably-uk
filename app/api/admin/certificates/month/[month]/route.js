// app/api/admin/certificates/month/[month]/route.js
import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import { authenticate } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    // Auth check
    const auth = await authenticate(request);
    if (!auth.success || auth.userRole !== "admin") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const { month } = await params;
    const monthNum = parseInt(month);

    if (monthNum < 1 || monthNum > 12) {
      return Response.json(
        { success: false, error: "Invalid month" },
        { status: 400 },
      );
    }

    // Get current year
    const currentYear = new Date().getFullYear();

    // Calculate date range for the month
    const startDate = new Date(currentYear, monthNum - 1, 1);
    const endDate = new Date(currentYear, monthNum, 1);

    // Build query
    const query = {
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    };

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const search = searchParams.get("search") || "";
    const contractorId = searchParams.get("contractorId");

    // Add search filter
    if (search) {
      query.$or = [
        { policyNumber: { $regex: search, $options: "i" } },
        { policyHolderName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "products.productType": { $regex: search, $options: "i" } },
      ];
    }

    // Add contractor filter if provided
    if (contractorId) {
      query.userId = contractorId;
    }

    // Fetch certificates
    const certificates = await Insurance.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name companyName email")
      .lean();

    // Get total count
    const total = await Insurance.countDocuments(query);

    // Format response
    const formattedCertificates = certificates.map((cert) => {
      const product =
        cert.products && cert.products.length > 0 ? cert.products[0] : {};

      const policyNo =
        cert.policyNumber || `POL-${cert._id.toString().slice(-6)}`;
      const inceptionDate = product.inceptionDate
        ? new Date(product.inceptionDate).toLocaleDateString("en-GB")
        : "N/A";
      const expiryDate = product.expiryDate
        ? new Date(product.expiryDate).toLocaleDateString("en-GB")
        : "N/A";
      const contractValue = product.contractValue
        ? `£${product.contractValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "£0.00";
      const price = product.price
        ? `£${product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "£0.00";

      return {
        id: cert._id.toString(),
        policyNo: policyNo,
        holderName: cert.policyHolderName,
        productType: product.productType || "Insurance Backed Guarantee",
        contractValue: contractValue,
        inceptionDate: inceptionDate,
        expiryDate: expiryDate,
        transactionType: "Certificate Generated",
        price: price,
        createdAt: cert.createdAt,
        status: cert.status || "active",
        email: cert.email,
        phone: cert.phone,
        address: cert.address,
        country: cert.country,
        postcode: cert.postcode,
        userId: cert.userId?._id?.toString(),
        contractorName: cert.userId?.name || cert.contractorName,
        companyName: cert.userId?.companyName,
        rawData: cert,
      };
    });

    // Month names for display
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return Response.json({
      success: true,
      certificates: formattedCertificates,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      month: {
        number: monthNum,
        name: monthNames[monthNum - 1],
        year: currentYear,
      },
    });
  } catch (error) {
    console.error("Month certificates error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
