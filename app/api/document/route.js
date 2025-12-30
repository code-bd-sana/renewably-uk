import connectDB from "@/lib/db";
import Documents from "@/models/DocumentModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();
  const data = await request.json();
  console.log("📥 Received document data:", data);

  try {
    // const data = await request.json();
    // console.log("📥 Received document data:", data);

    const { userId, title, category, description, ducoment } = data;

    const isExist = await Documents.findOne({ user: userId });

    if (isExist) {
      return NextResponse.json(
        {
          message: "Already submit Document",
        },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!userId || !title || !category || !ducoment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: userId, title, category, or ducoment",
        },
        { status: 400 }
      );
    }

    // Create new document
    const newDocument = new Documents({
      user: userId,
      title: title,
      category: category,
      description: description || "",
      ducoment: ducoment, // This should be comma-separated string of file URLs
    });

    const savedDocument = await newDocument.save();

    console.log("✅ Document saved to database:", {
      id: savedDocument._id,
      user: savedDocument.user,
      title: savedDocument.title,
      category: savedDocument.category,
      document: savedDocument.ducoment,
      createdAt: savedDocument.createdAt,
    });

    return NextResponse.json({
      success: true,
      message: "Document saved successfully",
      data: savedDocument,
    });
  } catch (error) {
    console.error("❌ Error saving document:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save document",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  await connectDB();

  try {
    // URL থেকে userId পেতে
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // ইউজারের সকল ডকুমেন্ট ফেচ করো
    const userDocuments = await Documents.find({ user: userId })
      .sort({ createdAt: -1 }) // নতুনগুলো আগে
      .lean();

    console.log(
      `📋 Found ${userDocuments.length} documents for user: ${userId}`
    );

    return NextResponse.json({
      success: true,
      count: userDocuments.length,
      documents: userDocuments,
    });
  } catch (error) {
    console.error("❌ Error fetching documents:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch documents",
      },
      { status: 500 }
    );
  }
}
