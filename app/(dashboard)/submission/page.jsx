"use client";

import logo from "@/public/shared/logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
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
        if (data.success) {
          setCertificates(data.certificates || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [router]);

  /* ---------------- FILTER & PAGINATION ---------------- */
  const filteredData = certificates.filter((item) =>
    item.holderName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("certificateId", selectedCertificate.id);

    // 🔥 API CALL HERE
    console.log("Uploading:", files);

    setOpenModal(false);
    setFiles([]);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className='min-h-screen bg-gray-50 p-6'>
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
          <thead className='bg-gray-100 text-gray-600'>
            <tr>
              <th className='px-4 py-3'>Policy Holder</th>
              <th className='px-4 py-3'>Product</th>
              <th className='px-4 py-3'>Policy No</th>
              <th className='px-4 py-3'>Contract Value</th>
              <th className='px-4 py-3'>Status</th>
              <th className='px-4 py-3'>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan='6' className='py-6 text-center'>
                  Loading...
                </td>
              </tr>
            )}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan='6' className='py-6 text-center'>
                  No data found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr key={item.id} className='border-t hover:bg-gray-50'>
                <td className='px-4 py-3 font-medium'>{item.holderName}</td>
                <td className='px-4 py-3'>{item.productType}</td>
                <td className='px-4 py-3'>{item.policyNo}</td>
                <td className='px-4 py-3'>{item.contractValue}</td>
                <td className='px-4 py-3'>
                  <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'>
                    {item.status}
                  </span>
                </td>
                <td className='px-4 py-3 flex items-center gap-3'>
                  {/* Download icon only if document exists */}
                  {item.documentName && (
                    <a
                      href={item.documentUrl}
                      download
                      title='Download'
                      className='text-blue-600 hover:text-blue-800'>
                      ⬇️
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCertificate(item);
                      setOpenModal(true);
                    }}
                    className='rounded-md bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700'>
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
            className='rounded border px-3 py-1 text-sm disabled:opacity-40'>
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`rounded px-3 py-1 text-sm ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "border"
              }`}>
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className='rounded border px-3 py-1 text-sm disabled:opacity-40'>
            Next
          </button>
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
              className='m-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center'>
              <div className='mb-2 text-3xl'>☁️</div>
              <p className='font-medium'>Drag & Drop Files Here</p>
              <p className='text-sm text-gray-500 mb-3'>or click to browse</p>

              <label className='cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
                Browse Files
                <input
                  type='file'
                  multiple
                  accept='.pdf,.jpg,.jpeg,.png,.mp4'
                  className='hidden'
                  onChange={handleFiles}
                />
              </label>

              <p className='mt-3 text-xs text-gray-400'>
                PDF, Images, Videos (Max 10MB)
              </p>
            </div>

            {files.length > 0 && (
              <div className='px-6 pb-4'>
                <ul className='space-y-1 text-sm text-gray-600'>
                  {files.map((file, i) => (
                    <li key={i}>📄 {file.name}</li>
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
                className='rounded border px-4 py-2 text-sm'>
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className='rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700'>
                Submit Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
