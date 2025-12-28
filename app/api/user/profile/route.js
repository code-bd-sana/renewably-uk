import connectDB from '@/lib/db';
import User from '@/models/User';
import { authenticate } from '@/middleware/auth';

export async function GET(request) {
  try {
    // AUTH CHECK (any authenticated user)
    const auth = await authenticate(request);
    
    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }
    
    // GET USER'S OWN PROFILE ONLY
    await connectDB();
    
    const user = await User.findById(auth.userId)
      .select('-passwordHash') 
      .lean();
    
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // RETURN USER'S DATA
    return Response.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Allow user to update their own profile
export async function PUT(request) {
  try {
    // AUTH CHECK
    const auth = await authenticate(request);
    
    if (!auth.success) {
      return Response.json(
        { success: false, error: auth.error },
        { status: auth.status || 401 }
      );
    }
    
    // GET UPDATE DATA
    const data = await request.json();
    
    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'companyName'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });
    
    // UPDATE USER'S OWN PROFILE ONLY
    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        isApproved: user.isApproved
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}