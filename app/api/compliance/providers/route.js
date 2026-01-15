import connectDB from "@/lib/db";
import { authenticate } from "@/middleware/auth";
import User from "@/models/User";

export async function GET(request) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);
    if (!auth.success) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // connect db
    await connectDB();

    // which compliance providers we want to fetch
    const complianceProviders = [
      "retrofit_coordinator",
      "funding_partner",
      "scheme_provider",
      "retrofit_assessor",
    ];

    // get approved, non suspended providers from them
    const providers = await User.find({
      isApproved: true,
      isSuspended: false,
      $or: [
        { role: { $in: complianceProviders } },
        { roles: { $in: complianceProviders } },
      ],
    }).select("name companyName email phoneNumber role roles");

    // few data needed for dropdown
    const formattedProviders = providers.map((provider) => ({
      name: provider.name,
      companyName: provider.companyName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      roles: provider.roles || [provider.role],
    }));

    return Response.json(
      { success: true, providers: formattedProviders },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get compliance providers error:", error);
    return Response.json(
      { success: false, error: "Failed to load providers" },
      { status: 500 }
    );
  }
}
