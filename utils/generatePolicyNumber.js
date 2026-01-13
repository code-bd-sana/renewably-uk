import connectDB from "@/lib/db";
import User from "@/models/User";

export async function generatePolicyNumber(userId) {
  await connectDB();

  const user = await User.findById(userId).select(
    "policyNoPrefix lastCertificateSequence isPrefixLocked"
  );

  if (!user) {
    throw new Error("Contractor not found");
  }

  // If prefix exists and is not empty → use sequential numbering
  if (user.policyNoPrefix && user.policyNoPrefix.trim() !== "") {
    // Atomically increment the sequence
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { lastCertificateSequence: 1 } },
      {
        new: true,
        select: "lastCertificateSequence policyNoPrefix isPrefixLocked",
      }
    );

    const nextNumber = updatedUser.lastCertificateSequence;
    const formatted = nextNumber.toString().padStart(5, "0");

    const policyNumber = `${updatedUser.policyNoPrefix}${formatted}`;

    // Lock prefix after first use (if not already locked)
    if (!updatedUser.isPrefixLocked && nextNumber === 1) {
      await User.updateOne({ _id: userId }, { $set: { isPrefixLocked: true } });
    }

    return policyNumber;
  }

  // Fallback: legacy random format (you can remove this later if you want to force prefixes)
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${year}${random}`;
}
