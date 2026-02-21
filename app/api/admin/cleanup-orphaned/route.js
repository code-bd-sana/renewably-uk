import connectDB from "@/lib/db";
import Insurance from "@/models/Insurance";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

// DELETE orphaned insurance records and duplicates
export async function DELETE(request) {
  try {
    const authResult = await authenticate(request, ["admin"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const cleanType = searchParams.get("type") || "all"; // "orphaned", "duplicates", or "all"

    let deletedCount = 0;
    let details = [];

    // Clean orphaned records
    if (cleanType === "orphaned" || cleanType === "all") {
      const allInsurances = await Insurance.find({}).select(
        "userId policyNumber",
      );

      const orphanedIds = [];

      for (const insurance of allInsurances) {
        const userExists = await User.findById(insurance.userId);
        if (!userExists) {
          orphanedIds.push(insurance._id);
          details.push({
            type: "orphaned",
            policyNumber: insurance.policyNumber,
            reason: "User no longer exists",
          });
        }
      }

      if (orphanedIds.length > 0) {
        const result = await Insurance.deleteMany({
          _id: { $in: orphanedIds },
        });
        deletedCount += result.deletedCount;
        console.log(`Deleted ${result.deletedCount} orphaned records`);
      }
    }

    // Clean duplicate policy numbers
    if (cleanType === "duplicates" || cleanType === "all") {
      const duplicates = await Insurance.aggregate([
        {
          $group: {
            _id: "$policyNumber",
            count: { $sum: 1 },
            ids: { $push: "$_id" },
            createdDates: { $push: "$createdAt" },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ]);

      for (const dup of duplicates) {
        const idsWithDates = dup.ids.map((id, idx) => ({
          id,
          createdAt: dup.createdDates[idx],
        }));

        idsWithDates.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        const idsToDelete = idsWithDates.slice(1).map((item) => item.id);

        if (idsToDelete.length > 0) {
          const result = await Insurance.deleteMany({
            _id: { $in: idsToDelete },
          });
          deletedCount += result.deletedCount;
          details.push({
            type: "duplicate",
            policyNumber: dup._id,
            count: result.deletedCount,
          });
          console.log(
            `Deleted ${result.deletedCount} duplicates for ${dup._id}`,
          );
        }
      }
    }

    return Response.json({
      success: true,
      message: `Successfully cleaned database. Deleted ${deletedCount} records.`,
      deletedCount,
      details,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// PUT - Reset sequence counter for a specific user
export async function PUT(request) {
  try {
    const authResult = await authenticate(request, ["admin"]);
    if (!authResult.authenticated) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: authResult.status },
      );
    }

    await connectDB();

    const { userId } = await request.json();

    if (!userId) {
      return Response.json(
        { success: false, error: "userId is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await User.findById(userId).select(
      "name email policyNoPrefix lastCertificateSequence",
    );

    if (!user) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const oldSequence = user.lastCertificateSequence;

    // Reset sequence to 0
    await User.updateOne(
      { _id: userId },
      { $set: { lastCertificateSequence: 0 } },
    );

    return Response.json({
      success: true,
      message: `Sequence counter reset for ${user.name}`,
      contractor: {
        id: userId,
        name: user.name,
        email: user.email,
        prefix: user.policyNoPrefix,
        oldSequence,
        newSequence: 0,
      },
    });
  } catch (error) {
    console.error("Reset sequence error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
