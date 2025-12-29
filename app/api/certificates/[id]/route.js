// app/api/insurance/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Insurance from '@/models/Insurance';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Connect to database
    await connectDB();
    
    // Find the insurance
    const insurance = await Insurance.findById(id);
    
    if (!insurance) {
      return NextResponse.json(
        { success: false, error: 'Insurance not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this insurance
    if (insurance.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Return insurance data
    return NextResponse.json({
      success: true,
      insurance: {
        id: insurance._id,
        policyNumber: insurance.policyNumber,
        contractorName: insurance.contractorName,
        contractorAddress: insurance.contractorAddress,
        policyHolderName: insurance.policyHolderName,
        email: insurance.email,
        phone: insurance.phone,
        address: insurance.address,
        country: insurance.country,
        postcode: insurance.postcode,
        products: insurance.products,
        status: insurance.status,
        requestData: insurance.requestData,
        createdAt: insurance.createdAt,
        updatedAt: insurance.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Insurance fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch insurance' },
      { status: 500 }
    );
  }
}