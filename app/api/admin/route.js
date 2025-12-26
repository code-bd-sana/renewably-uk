import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticate } from "@/middleware/auth";

export async function GET(request) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    
    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }
    
    // Check if user is admin
    if (auth.userRole !== 'admin') {
      return Response.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get URL parameters
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'get-stats') {
      await connectDB();
      
      // Get counts from database
      const totalContractors = await User.countDocuments({ role: 'contractor' });
      const approvedContractors = await User.countDocuments({ 
        role: 'contractor', 
        isApproved: true 
      });
      const pendingContractors = await User.countDocuments({ 
        role: 'contractor', 
        isApproved: false 
      });
      
      // Calculate counts for current month
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const thisMonthContractors = await User.countDocuments({
        role: 'contractor',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      
      // need to update these with actual policy/IBG counts from your database
      const totalPolicies = 123; // Replace with actual count from your policies/IBGs collection
      const thisMonthPolicies = 36; // Replace with actual count
      const premiumTotal = 12630.00; // Replace with actual sum from your policies
      
      return Response.json({
        success: true,
        stats: {
          totalPolicies,
          premiumTotal,
          thisMonthPolicies,
          totalContractors: approvedContractors,
          pendingApprovals: pendingContractors,
          thisMonthContractors,
          editRequests: 6 // need to track this separately
        }
      });
    }
    
    // If no specific action, just return admin status
    return Response.json({
      success: true,
      isAdmin: true,
      message: 'Admin access granted'
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST handler for backward compatibility 
export async function POST(request) {
  return Response.json(
    { success: false, error: 'Use specific endpoints: /api/admin/approve-user or /api/admin/reject-user' },
    { status: 400 }
  );
}