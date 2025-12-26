import connectDB from "@/lib/db";
import User from "@/models/User";
import { sendRejectEmail } from "@/lib/email";
import { authenticate } from '@/middleware/auth';

export async function POST(request) {
  try {
    // CHECK AUTH
    const auth = await authenticate(request);
    
    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }
    
    // CHECK IF USER IS ADMIN
    if (auth.userRole !== 'admin') {
      return Response.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // NOW THE REJECT LOGIC
    await connectDB();

    // Get form data
    const formData = await request.formData();
    const userId = formData.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID required" }),
        { status: 400 }
      );
    }

    // Find user before deleting to get email details
    const user = await User.findById(userId);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404 }
      );
    }

    // Store user details for email before deletion
    const userEmail = user.email;
    const userName = user.name;
    const userCompany = user.companyName;

    // Delete the user 
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to delete user" }),
        { status: 500 }
      );
    }

    // Send rejection email
    try {
      await sendRejectEmail(userEmail, userName, userCompany);
      console.log(`Rejection email sent to: ${userEmail}`);
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    // Return success response
    return Response.json(
      {
        success: true,
        message: "User rejected and deleted successfully. Rejection email sent.",
        user: {
          email: userEmail,
          companyName: userCompany,
          name: userName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}