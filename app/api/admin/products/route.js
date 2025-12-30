import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ Measures: { $ne: '' } })
      .sort({ Measures: 1 })
      .lean();
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await connectDB();
    
    // Add timestamps
    const productData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const product = new Product(productData);
    await product.save();
    
    return NextResponse.json({ 
      success: true, 
      product 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}