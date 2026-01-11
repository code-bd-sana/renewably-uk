"use client";
import { useEffect, useState } from "react";

export default function DocumentUploadForm() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch existing documents when userId changes
  useEffect(() => {
    if (userId) {
      fetchExistingDocuments();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
          setUserId(data.user._id || data.user.id);
          console.log("✅ User data fetched:", data.user);
        }
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchExistingDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await fetch(`/api/document?userId=${userId}`, {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setExistingDocuments(data.documents || []);
        console.log(`📋 Found ${data.count} existing documents for user`);

        // যদি এক্সিস্টিং ডকুমেন্ট থাকে, তাহলে ফর্ম প্রি-ফিল করো
        if (data.documents.length > 0) {
          const latestDoc = data.documents[0]; // সবচেয়ে নতুন ডকুমেন্ট
          console.log("📝 Latest document:", latestDoc);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching existing documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const triggerFileInput = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip,.rar";
    fileInput.onchange = (e) => {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    };
    fileInput.click();
  };

  // এক্সিস্টিং ডকুমেন্ট সিলেক্ট করলে
  const handleSelectExistingDocument = (doc) => {
    console.log("📋 Selected existing document:", doc);

    // ফর্ম ফিল করো
    setDocumentTitle(doc.title);
    setCategory(doc.category);
    setDescription(doc.description || "");

    // এক্সিস্টিং ফাইলগুলো দেখাও (যদি থাকে)
    if (doc.ducoment) {
      const fileUrls = doc.ducoment
        .split(",")
        .filter((url) => url.trim() !== "");
      console.log("📁 Existing files:", fileUrls);
      alert(
        `📋 Selected document "${doc.title}"\n\n📁 Contains ${
          fileUrls.length
        } file(s)\n📅 Created: ${new Date(doc.createdAt).toLocaleDateString()}`
      );
    }
  };

  // এক্সিস্টিং ডকুমেন্ট এডিট করার ফাংশন
  const handleEditExistingDocument = (doc) => {
    console.log("✏️ Editing document:", doc);
    // এখানে তুমি এডিট পেজে নিয়ে যেতে পারো
    // বা একটি মডাল খুলে এডিট করতে পারো
    alert(
      `✏️ Edit functionality for "${doc.title}" would open here.\n\nDocument ID: ${doc._id}`
    );
  };

  /* ---------------- SAVE DOCUMENT API ---------------- */
  const saveDocument = async (
    userId,
    title,
    category,
    description,
    documentUrls
  ) => {
    try {
      console.log("💾 Saving document to database...");
      console.log("Data being sent:", {
        userId,
        title,
        category,
        description,
        ducoment: documentUrls.join(","),
      });

      const response = await fetch(`/api/document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          title,
          category,
          description,
          ducoment: documentUrls.join(","),
        }),
      });

      const data = await response.json();
      console.log("💾 Save response:", data);
      return data;
    } catch (error) {
      console.error("Error saving document:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("❌ Please select at least one file to upload");
      return;
    }

    if (!documentTitle.trim()) {
      alert("❌ Please enter a document title");
      return;
    }

    // চেক করো একই ইউজারের জন্য একই নামের ডকুমেন্ট আছে কিনা
    const existingDoc = existingDocuments.find(
      (doc) => doc.title.toLowerCase() === documentTitle.toLowerCase()
    );

    if (existingDoc) {
      alert(
        `❌ A document with title "${documentTitle}" already exists.\n\nPlease use a different title or edit the existing document.`
      );
      return;
    }

    if (!category) {
      alert("❌ Please select a category");
      return;
    }

    if (!userId) {
      alert("❌ User not found. Please try refreshing the page.");
      return;
    }

    setUploading(true);

    try {
      console.log("🚀 Starting upload process...");
      console.log("👤 User ID:", userId);
      console.log("🏷️ Document Title:", documentTitle);
      console.log("📁 Category:", category);
      console.log("📝 Description:", description);
      console.log("📄 Number of files:", files.length);

      // Step 1: Upload files to /api/upload
      const formData = new FormData();

      // Add files
      files.forEach((file, index) => {
        console.log(`📤 Adding file ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: (file.size / 1024 / 1024).toFixed(2) + "MB",
        });
        formData.append("files", file);
      });

      formData.append("userId", userId);

      console.log("📡 Step 1: Uploading to /api/upload...");
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      console.log("📨 Upload Response:", uploadResult);

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.error || "File upload failed");
      }

      console.log("✅ Files uploaded successfully!");
      console.log("🔗 File URLs:", uploadResult.fileUrls);

      // Step 2: Save document metadata to /api/document
      console.log("💾 Step 2: Saving document to /api/document...");
      const saveResponse = await saveDocument(
        userId,
        documentTitle,
        category,
        description,
        uploadResult.fileUrls
      );

      console.log("💾 Save Response:", saveResponse);

      if (saveResponse.success) {
        // Success!
        console.log("🎉 Document saved successfully!");
        console.log("📋 Document ID:", saveResponse.data?._id);
        console.log("👤 User ID:", userId);
        console.log("🏷️ Title:", documentTitle);
        console.log("📁 Category:", category);
        console.log("📝 Description:", description);
        console.log("🔗 Document URLs:", uploadResult.fileUrls);
        console.log("📄 Total files uploaded:", files.length);

        // Show success message
        alert(
          `Successfully uploaded ${files.length} file(s)!\n\n Files saved to: public/uploads/\n Document saved to database`
        );

        // Reset form
        setFiles([]);
        setDocumentTitle("");
        setCategory("");
        setDescription("");

        // Refresh existing documents list
        fetchExistingDocuments();
      } else if (
        saveResponse.error &&
        saveResponse.error.includes("already exists")
      ) {
        // Document already exists error
        alert(
          `❌ ${saveResponse.error}\n\nPlease use a different document title.`
        );
      } else {
        throw new Error(saveResponse.error || "Failed to save document");
      }
    } catch (error) {
      console.error("❌ Error in upload process:", error);
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Show loading state while fetching user data
  if (loadingUser) {
    return (
      <div className='px-8 mt-8'>
        <div className='w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-4'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
              <p className='text-gray-600'>Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // লেটেস্ট এক্সিস্টিং ডকুমেন্ট (যদি থাকে)
  const latestDocument =
    existingDocuments.length > 0 ? existingDocuments[0] : null;

  // ইউনিক টাইটেল এবং ক্যাটাগরি
  const existingTitles = [
    ...new Set(existingDocuments.map((doc) => doc.title)),
  ];
  const existingCategories = [
    ...new Set(existingDocuments.map((doc) => doc.category)),
  ];

  return (
    <div className='px-8 mt-8'>
      <div className='w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-800'>
            Document Upload
          </h2>
          {existingDocuments.length > 0 && (
            <span className='text-sm text-gray-600'>
              📋 You have {existingDocuments.length} document(s)
            </span>
          )}
        </div>

        {/* Latest Existing Document Card (if exists) */}

        {/* Grid Form */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Document Title */}
          <div>
            <div className='flex items-center justify-between mb-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Document Title *
              </label>
              {existingTitles.length > 0 && (
                <button
                  type='button'
                  onClick={() => setDocumentTitle(existingTitles[0])}
                  className='text-xs text-blue-600 hover:text-blue-800 hover:underline'>
                  Use latest: {existingTitles[0]}
                </button>
              )}
            </div>
            <input
              type='text'
              placeholder='Enter your document title'
              className='w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              required
            />
            {/* Existing titles as tags */}
            {existingTitles.length > 0 && (
              <div className='mt-2'>
                <p className='text-xs text-gray-600 mb-1'>
                  Your document titles:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {existingTitles.slice(0, 3).map((title, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => setDocumentTitle(title)}
                      className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-3 py-1 rounded-full border border-gray-300 transition-colors'>
                      {title}
                    </button>
                  ))}
                  {existingTitles.length > 3 && (
                    <span className='text-xs text-gray-500 px-2 py-1'>
                      +{existingTitles.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <div className='flex items-center justify-between mb-1'>
              <label className='block text-sm font-medium text-gray-700'>
                Category *
              </label>
              {existingCategories.length > 0 && (
                <button
                  type='button'
                  onClick={() => setCategory(existingCategories[0])}
                  className='text-xs text-blue-600 hover:text-blue-800 hover:underline'>
                  Use latest: {existingCategories[0]}
                </button>
              )}
            </div>
            <select
              className='w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required>
              <option value=''>Select your document category</option>
              <option value='contracts'>Contracts</option>
              <option value='invoices'>Invoices</option>
              <option value='reports'>Reports</option>
              <option value='certificates'>Certificates</option>
              <option value='other'>Other</option>
            </select>
            {/* Existing categories as tags */}
            {existingCategories.length > 0 && (
              <div className='mt-2'>
                <p className='text-xs text-gray-600 mb-1'>Your categories:</p>
                <div className='flex flex-wrap gap-2'>
                  {existingCategories.slice(0, 3).map((cat, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => setCategory(cat)}
                      className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-900 px-3 py-1 rounded-full border border-blue-300 transition-colors'>
                      {cat}
                    </button>
                  ))}
                  {existingCategories.length > 3 && (
                    <span className='text-xs text-gray-500 px-2 py-1'>
                      +{existingCategories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className='mt-6'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Description (optional)
          </label>
          <textarea
            rows={3}
            placeholder='Enter your document description'
            className='w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {/* Existing descriptions */}
          {existingDocuments.filter(
            (doc) => doc.description && doc.description.trim().length > 0
          ).length > 0 && (
            <div className='mt-2'>
              <p className='text-xs text-gray-600 mb-1'>
                Your recent descriptions:
              </p>
              <div className='flex flex-wrap gap-2'>
                {existingDocuments
                  .filter(
                    (doc) =>
                      doc.description && doc.description.trim().length > 0
                  )
                  .slice(0, 2)
                  .map((doc, index) => (
                    <button
                      key={index}
                      type='button'
                      onClick={() => setDescription(doc.description)}
                      className='text-xs bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-900 px-3 py-1 rounded-full border border-green-300 transition-colors max-w-[200px] truncate'
                      title={doc.description}>
                      {doc.description.length > 30
                        ? `${doc.description.substring(0, 30)}...`
                        : doc.description}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Documents */}
        <div className='mt-8'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-md font-medium text-gray-800'>
              Upload Documents *
            </h3>
            {existingDocuments.length > 0 && (
              <span className='text-xs text-gray-500'>
                You have{" "}
                {existingDocuments.reduce(
                  (total, doc) =>
                    total + (doc.ducoment?.split(",").length || 0),
                  0
                )}{" "}
                files in your documents
              </span>
            )}
          </div>

          <div
            className='w-full border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer'
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={triggerFileInput}>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl'>
                📤
              </div>

              <p className='text-gray-700 font-medium text-lg'>
                Drag & Drop Files Here
              </p>

              <p className='text-gray-500 text-sm'>
                or click anywhere to browse
              </p>

              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className='mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'>
                Browse Files
              </button>

              <p className='text-xs text-gray-500 mt-2'>
                Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT, ZIP, RAR (Max
                100MB per file)
              </p>
            </div>
          </div>

          {/* Show Selected Files */}
          {files.length > 0 && (
            <div className='mt-6 border border-gray-200 rounded-lg p-4 bg-white shadow-sm'>
              <div className='flex justify-between items-center mb-3'>
                <h4 className='font-medium text-gray-700'>
                  Selected Files ({files.length})
                </h4>
                <button
                  onClick={() => setFiles([])}
                  className='text-sm text-red-600 hover:text-red-800 font-medium'>
                  Clear All
                </button>
              </div>
              <ul className='space-y-2'>
                {files.map((file, index) => (
                  <li
                    key={index}
                    className='flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border'>
                    <div className='flex items-center gap-3'>
                      <span className='text-blue-500 text-lg'>📄</span>
                      <div>
                        <span className='text-sm text-gray-700 font-medium'>
                          {file.name}
                        </span>
                        <p className='text-xs text-gray-500 mt-1'>
                          Type: {file.type || "Unknown"} | Size:{" "}
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className='text-red-500 hover:text-red-700 text-lg p-1'
                      title='Remove file'>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>

              <div className='mt-4 pt-4 border-t border-gray-200'>
                <div className='flex justify-between items-center'>
                  <p className='text-sm font-medium text-gray-700'>
                    Total Size:
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {(
                      files.reduce((total, file) => total + file.size, 0) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className='flex justify-end gap-4 mt-10'>
          <button
            type='button'
            onClick={() => {
              if (
                files.length > 0 &&
                !confirm("Are you sure? All unsaved changes will be lost.")
              ) {
                return;
              }
              setFiles([]);
              setDocumentTitle("");
              setCategory("");
              setDescription("");
            }}
            disabled={uploading}
            className='px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium'>
            Cancel
          </button>
          <button
            type='button'
            onClick={handleUpload}
            disabled={
              uploading ||
              files.length === 0 ||
              !documentTitle.trim() ||
              !category ||
              !userId
            }
            className='px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium'>
            {uploading ? (
              <>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                Uploading...
              </>
            ) : (
              <>
                <span>📤</span>
                Upload Documents
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
