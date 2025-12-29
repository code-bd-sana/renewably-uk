import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import connectDB from '@/lib/db';
import Insurance from '@/models/Insurance';

export async function POST(request) {
  try {
    // Admin authentication
    const auth = await authenticate(request);
    
    if (!auth.success || auth.userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { insuranceId, action, notes } = await request.json();
    
    if (!insuranceId || !action) {
      return NextResponse.json(
        { success: false, error: 'Insurance ID and action required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const insurance = await Insurance.findById(insuranceId);
    
    if (!insurance) {
      return NextResponse.json(
        { success: false, error: 'Insurance not found' },
        { status: 404 }
      );
    }
    
    if (!['pending_edit', 'pending_cancel'].includes(insurance.status)) {
      return NextResponse.json(
        { success: false, error: 'No pending request found' },
        { status: 400 }
      );
    }
    
    if (action === 'approve') {
      // Apply changes if edit request
      if (insurance.status === 'pending_edit' && insurance.requestData?.changes) {
        Object.keys(insurance.requestData.changes).forEach(key => {
          if (insurance[key] !== undefined) {
            insurance[key] = insurance.requestData.changes[key];
          }
        });
      }
      
      // Update status
      insurance.status = insurance.status === 'pending_edit' ? 'active' : 'cancelled';
      
    } else if (action === 'reject') {
      // Reject - just change status back to active
      insurance.status = 'active';
    }
    
    // Save admin notes
    insurance.requestData.adminNotes = notes || '';
    insurance.requestData.processedAt = new Date();
    insurance.requestData.processedBy = auth.userId;
    
    await insurance.save();
    
    return NextResponse.json({
      success: true,
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'}`,
      status: insurance.status
    });
    
  } catch (error) {
    console.error('Request approval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}