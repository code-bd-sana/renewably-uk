"use client";

import logo from "@/public/shared/logo.png";
import { Download, Eye, FileText, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ITEMS_PER_PAGE = 5;

export default function SubmissionPage() {
  const router = useRouter();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // New state for view certificate modal
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    fetchCertificates();
  }, [router]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/certificates", {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      console.log(data, "hokkam");
      if (data.success) {
        setCertificates(data.certificates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log(certificates, "all certificate");

  /* ---------------- FILTER & PAGINATION ---------------- */
  const filteredData = certificates.filter((item) =>
    item.holderName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  console.log(paginatedData, "paginated data ekahneeee");

  /* ---------------- FILE HANDLING ---------------- */
  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  /* ---------------- VIEW CERTIFICATE DETAILS ---------------- */
  const handleViewCertificate = (certificate) => {
    console.log("Viewing certificate:", certificate);
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  /* ---------------- DOWNLOAD FILE ---------------- */
  const handleDownload = (documentUrl, fileName, certificate) => {
    console.log(certificate, "Downloading certificate");

    if (!documentUrl) {
      toast.error("No document available to download");
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement("a");

      // Ensure URL is absolute
      let fullUrl = documentUrl;
      if (!documentUrl.startsWith("http")) {
        fullUrl = `${window.location.origin}${
          documentUrl.startsWith("/") ? "" : "/"
        }${documentUrl}`;
      }

      link.href = fullUrl;

      // Extract filename from URL or use provided filename
      const downloadName = fileName || certificate?.policyNo || "certificate";
      link.download = downloadName + ".pdf";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  /* ---------------- UPDATE INSURANCE API ---------------- */
  const updateInsurance = async (certificateId, documentUrls) => {
    try {
      const response = await fetch(`/api/insurance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          certificateId,
          documentUrls,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating insurance:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload files to server
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`files`, file);
      });
      formData.append("certificateId", selectedCertificate.id);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      console.log("Upload successful! File URLs:", uploadResult.fileUrls);

      // Step 2: Update insurance with document URLs
      const updateResponse = await updateInsurance(
        selectedCertificate.id, // Changed back to id instead of insuranceId
        uploadResult.fileUrls
      );

      if (updateResponse.success) {
        console.log("Insurance updated successfully");
        toast.success(
          `Successfully uploaded ${files.length} file(s) and updated insurance record`
        );

        // Step 3: Refresh certificate data
        await fetchCertificates();

        // Reset modal and files
        setOpenModal(false);
        setFiles([]);
        setSelectedCertificate(null);
      } else {
        throw new Error(updateResponse.error || "Failed to update insurance");
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- FORMAT DATE ---------------- */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className='bg-[#FAFAF9]'>
      <div className='mt-4 mx-4 bg-white p-6'>
        <Toaster position='top-right' />

        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <Image src={logo} alt='logo' className='h-10 w-auto' />
          <input
            type='text'
            placeholder='Search by policy holder name...'
            className='rounded-md border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className='overflow-x-auto rounded-lg bg-white shadow'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-[#FAFAF9] border-gray-200 text-gray-600'>
              <tr>
                <th className='px-4 py-3 text-[#030712]'>Policy Holder</th>
                <th className='px-4 py-3 text-[#030712]'>Address</th>
                <th className='px-4 py-3 text-[#030712]'>Funding Partner</th>
                <th className='px-4 py-3 text-[#030712]'>Project ABS</th>
                <th className='px-4 py-3 text-[#030712]'>Status</th>
                <th className='px-4 py-3 text-[#030712]'>
                  Date and Time stamp
                </th>
                <th className='px-4 py-3 text-[#030712]'>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan='7' className='py-6 text-center'>
                    <div className='flex items-center justify-center'>
                      <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
                      <span className='ml-2'>Loading certificates...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan='7' className='py-6 text-center text-gray-500'>
                    No certificates found
                  </td>
                </tr>
              )}

              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className='border-t border-gray-200 hover:bg-gray-50'>
                  <td className='px-4 py-3 font-sans text-[#6B7280]'>
                    {item.holderName}
                  </td>
                  <td className='px-4 py-3 text-[#6B7280] font-sans'>
                    {item.address || "N/A"}
                  </td>
                  <td className='px-4 py-3 '>
                    <p className='bg-[#F1F5F9] whitespace-nowrap rounded-xs text-center text-[#6B7280] font-semibold p-3 '>
                      {" "}
                      {item.fundingPartner || "------------"}{" "}
                    </p>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {item.abs || "---"}{" "}
                  </td>

                  <td className='px-4 py-3'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "submitted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                      {item.status === "active"
                        ? "New"
                        : item.status?.charAt(0).toUpperCase() +
                          item.status?.slice(1)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    {formatDateTime(item.createdAt)}
                  </td>

                  <td className='px-4 py-3 flex items-center gap-3'>
                    {/* Eye icon for viewing certificate details */}
                    <button
                      onClick={() => handleViewCertificate(item)}
                      title='View Certificate Details'
                      className='text-gray-600 hover:text-blue-800 hover:scale-110 transition-transform p-1 rounded hover:bg-gray-50'>
                      <Eye className='h-5 w-5' />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCertificate(item);
                        setOpenModal(true);
                      }}
                      className='rounded-md bg-[#0F47A8] px-4 py-1.5 text-white hover:bg-blue-700 transition-colors text-sm'>
                      Submit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6 flex justify-end gap-2'>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className='rounded border px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors'>
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
                }`}>
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className='rounded border px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors'>
              Next
            </button>
          </div>
        )}

        {/* ---------------- CERTIFICATE DETAILS MODAL ---------------- */}
        {showCertificateModal && selectedCertificate && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto'>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200'>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => setShowCertificateModal(false)}
                    className='text-gray-600 hover:text-gray-900 text-2xl p-1'
                    title='Back'>
                    ≫
                  </button>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Certificate Details
                  </h3>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => setShowCertificateModal(false)}
                    className='text-gray-600 hover:text-gray-900 p-1'
                    title='Close'>
                    <X className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className='p-6'>
                <div className='flex items-center justify-between pb-8'>
                  <Image src={logo} />

                  <button
                    onClick={() =>
                      handleDownload(
                        selectedCertificate.document,
                        selectedCertificate.documentName,
                        selectedCertificate
                      )
                    }
                    className='flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors'
                    title='Download Certificate'>
                    <Download className='w-5 h-5' />
                  </button>
                </div>
                {/* Certificate Details Grid */}
                <div className='space-y-6'>
                  {/* Certificate ID & Policy No */}

                  {/* Policy Holder Details */}
                  <div className='space-y-4'>
                    <div className='flex justify-between items-start py-3 '>
                      <div className=' font-medium  text-[#030712]'>
                        Policy Holder Name
                      </div>
                      <div className='text-sm  text-right text-[#6B7280]'>
                        {selectedCertificate.holderName}
                      </div>
                    </div>

                    <div className='flex justify-between items-start py-3 '>
                      <div className='font-medium  text-[#030712]'>Address</div>
                      <div className='text-sm text-[#6B7280] text-right max-w-xs text-right'>
                        {selectedCertificate.address || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className='space-y-4'>
                    <div className='font-medium  text-[#030712] '>
                      Funding Partner
                      <div className='text-sm text-[#6B7280] text-right'>
                        {selectedCertificate.fundingPartner || "N/A"}
                      </div>
                    </div>

                    <div className='flex justify-between items-start py-3 '>
                      <div className='font-medium  text-[#030712]'>
                        Project ABS
                      </div>
                      <div className='text-sm  text-right text-[#6B7280]'>
                        {selectedCertificate.abs || "N/A"}
                      </div>
                    </div>
                    <div className='flex justify-between items-start py-3 '>
                      <div className='font-medium  text-[#030712]'>Status</div>
                      <div className='text-sm  text-right text-[#6B7280]'>
                        {selectedCertificate.status || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Status */}
                  <div className='space-y-4'>
                    <div className='flex justify-between items-start py-3'>
                      <div className='font-medium  text-[#030712]'>
                        Date and Time stamp
                      </div>
                      <div className='text-sm text-gray-900 text-right'>
                        {formatDateTime(selectedCertificate.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Document Links */}
                  <div className='space-y-4'>
                    {selectedCertificate.document ? (
                      <div className='flex justify-between items-start py-3'>
                        <div className='font-medium  text-[#030712]'>
                          Submission File
                        </div>
                        <div className='text-sm text-gray-900 text-right'>
                          <a
                            href={selectedCertificate.document}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 justify-end'>
                            <FileText className='w-3 h-3' />
                            <span>View Document</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-3 text-sm text-gray-500'>
                        No documents available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- UPLOAD MODAL ---------------- */}
        {openModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
            <div className='w-full max-w-lg rounded-lg bg-white shadow-lg'>
              <div className='border-b px-6 py-4'>
                <h2 className='text-lg font-semibold'>
                  Upload Files for {selectedCertificate?.policyNo}
                </h2>
                <p className='text-sm text-gray-500'>
                  Upload installation photos, warranty documents, or compliance
                  files
                </p>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className='m-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors'>
                <div className='mb-2 text-3xl'>📁</div>
                <p className='font-medium'>Drag & Drop Files Here</p>
                <p className='text-sm text-gray-500 mb-3'>or click to browse</p>

                <label className='cursor-pointer rounded bg-[#0F47A8] px-4 py-2 text-white hover:bg-blue-700 transition-colors'>
                  Browse Files
                  <input
                    type='file'
                    multiple
                    accept='.pdf,.jpg,.jpeg,.png,.mp4,.doc,.docx,.xls,.xlsx'
                    className='hidden'
                    onChange={handleFiles}
                  />
                </label>

                <p className='mt-3 text-xs text-gray-400'>
                  PDF, Images, Videos, Documents (Max 100MB per file)
                </p>
              </div>

              {files.length > 0 && (
                <div className='px-6 pb-4'>
                  <h3 className='mb-2 font-medium'>
                    Selected Files ({files.length}):
                  </h3>
                  <ul className='space-y-2 max-h-40 overflow-y-auto text-sm text-gray-600'>
                    {files.map((file, i) => (
                      <li
                        key={i}
                        className='flex items-center justify-between py-2 px-3 bg-gray-50 rounded'>
                        <div className='flex items-center gap-2'>
                          <span className='text-blue-500'>📄</span>
                          <span className='truncate max-w-xs'>{file.name}</span>
                        </div>
                        <span className='text-xs text-gray-500 whitespace-nowrap'>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className='flex justify-end gap-3 border-t px-6 py-4'>
                <button
                  onClick={() => {
                    setOpenModal(false);
                    setFiles([]);
                  }}
                  disabled={uploading}
                  className='rounded border bg-[#F1F5F9] border-[#D1D5DB] px-4 py-2 cursor-pointer text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors'>
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className='rounded bg-[#0F47A8] px-4 py-2 text-sm text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'>
                  {uploading ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      Uploading...
                    </>
                  ) : (
                    "Submit Files"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
