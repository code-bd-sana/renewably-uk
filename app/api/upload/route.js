// api/upload/route.js

import multer from "multer";
import { NextResponse } from "next/server";

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // upload directly here
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  cb(null, true); // allow everything (image/video/pdf/etc.)
};

// Create the upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB allowed
  },
});

// Helper to parse multipart/form-data
async function parseMultipartFormData(request) {
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    throw new Error("Invalid content type. Expected multipart/form-data");
  }

  const formData = await request.formData();
  return formData;
}

// Convert NextRequest to Node.js-like request for multer
function convertToNodeRequest(request) {
  const req = {
    method: request.method,
    headers: Object.fromEntries(request.headers),
    body: null,
    files: [],
    file: null,
  };
  return req;
}

export async function POST(request) {
  try {
    // Parse the form data
    const formData = await parseMultipartFormData(request);

    // Get files from form data
    const files = [];
    const fileEntries = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
        fileEntries.push([key, value]);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Process each file
    const uploadedFiles = [];
    const fileUrls = [];

    for (const [fieldName, file] of fileEntries) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueName = Date.now() + "-" + file.name.replace(/\s+/g, "_");
      const filePath = `public/uploads/${uniqueName}`;

      // Write file to disk
      const fs = require("fs");
      const path = require("path");

      // Ensure uploads directory exists
      const uploadDir = "public/uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Create file info object
      const fileInfo = {
        fieldname: fieldName,
        originalname: file.name,
        encoding: "7bit",
        mimetype: file.type,
        destination: "public/uploads",
        filename: uniqueName,
        path: filePath,
        size: file.size,
      };

      uploadedFiles.push(fileInfo);
      fileUrls.push(`/uploads/${uniqueName}`);
    }

    // Get certificateId from form data
    const certificateId = formData.get("certificateId");

    console.log("Upload successful!");
    console.log("Certificate ID:", certificateId);
    console.log("File URLs:", fileUrls);
    console.log("Uploaded files:", uploadedFiles);

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      certificateId,
      fileUrls,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Upload failed",
      },
      { status: 500 }
    );
  }
}

// Configure the route to accept multipart/form-data
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
