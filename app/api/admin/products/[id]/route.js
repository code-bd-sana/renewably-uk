import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';



export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    await connectDB();
    
    // Add updatedAt timestamp
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const product = await Product.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}