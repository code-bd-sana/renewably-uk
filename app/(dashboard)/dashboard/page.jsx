"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import logo2 from "@/public/shared/logo2.png";
import Image from "next/image";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    thisMonthCertificates: 0,
    accountBalance: "$0",
    editPending: 0,
  });
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch certificates
        const certsResponse = await fetch("/api/certificates", {
          credentials: "include",
        });

        if (!certsResponse.ok) {
          if (certsResponse.status === 401) {
            router.push("/login");
            return;
          }
        }

        if (certsResponse.ok) {
          const certsData = await certsResponse.json();
          if (certsData.success) {
            setCertificates(certsData.certificates || []);

            // Update stats
            const now = new Date();
            const thisMonthCertificates = certsData.certificates.filter(
              (cert) => {
                const certDate = new Date(
                  cert.inceptionDate.split("/").reverse().join("-")
                );
                return (
                  certDate.getMonth() === now.getMonth() &&
                  certDate.getFullYear() === now.getFullYear()
                );
              }
            ).length;

            setStats({
              totalCertificates: certsData.certificates.length,
              thisMonthCertificates: thisMonthCertificates,
              accountBalance: "$1,850.00", // You can calculate this based on payments
              editPending: certsData.certificates.filter(
                (cert) => cert.status === "pending_edit"
              ).length,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  // In the fetchDashboardData function of dashboard/page.jsx:

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.policyNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCertificate = (certificateId) => {
    // Navigate to certificate view
    router.push(`/certificates/${certificateId}`);
  };

  const handleDownloadCertificate = (certificateId) => {
    // Trigger download
    const link = document.createElement("a");
    link.href = `/api/certificates/${certificateId}/download`;
    link.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <main className='p-4 lg:p-6'>
        <div className='animate-pulse'>
          {/* Banner skeleton */}
          <div className='bg-gray-200 h-32 rounded-lg mb-6'></div>

          {/* Stats cards skeleton */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='bg-gray-200 h-24 rounded-lg'></div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className='bg-gray-200 h-64 rounded-lg'></div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 lg:p-6'>
      {/* Blue Banner */}
      <div className='bg-[#0F47A8] text-white p-6 rounded-lg mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>RENEWABLY UK</h2>
        <div className='w-16 h-16 bg-white bg-opacity-20 rounded flex items-center justify-center'>
          <div>
            <Image src={logo2} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold'>{stats.totalCertificates}</h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-gray-600'>Total Certificates</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold'>
              {stats.thisMonthCertificates}
            </h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-gray-600'>This Month</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold'>{stats.accountBalance}</h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-gray-600'>Account Balance</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold'>{stats.editPending}</h3>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                />
              </svg>
            </div>
          </div>
          <p className='text-sm text-gray-600'>Edit Pending</p>
        </div>
      </div>

      {/* Bluedrop Services Logo */}
      <div className='mb-6'>
        <div className='inline-flex items-center gap-2'>
          <div className='w-10 h-10 bg-blue-500 rounded-full'></div>
          <span className='font-bold text-xl'>
            BLUE<span className='text-blue-500'>DROP</span>
          </span>
          <span className='text-xs text-gray-500 ml-2'>SERVICES</span>
        </div>
      </div>

      {/* Certificates Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='p-4  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <h3 className='font-semibold text-lg'>
            Recent Insurance Backed Guarantee Certificates
          </h3>
          <input
            type='text'
            placeholder='Search by policy holder name...'
            className='border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCertificates.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            {certificates.length === 0
              ? "No certificates found"
              : "No matching certificates found"}
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className='md:hidden'>
              {filteredCertificates.map((cert, index) => (
                <div key={index} className='p-4 border-b border-gray-200'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Policy No:</span>
                      <span className='text-sm font-medium'>
                        {cert.policyNo}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Holder:</span>
                      <span className='text-sm'>{cert.holderName}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Type:</span>
                      <span className='text-sm'>{cert.measureType}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Price:</span>
                      <span className='text-sm font-semibold'>
                        {cert.price}
                      </span>
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleViewCertificate(cert.policyNo)}
                        className='flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                          />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate(cert.policyNo)}
                        className='flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                          />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className='hidden border-b border-t border-gray-200 md:block overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Policy No
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Policy Holder Name
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Measure Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Contract Value
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Inception Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Expiry Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Transaction Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-600'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCertificates.map((cert, index) => (
                    <tr
                      key={index}
                      className='border-b border-gray-200 hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm'>{cert.policyNo}</td>
                      <td className='px-4 py-3 text-sm'>{cert.holderName}</td>
                      <td className='px-4 py-3 text-sm'>{cert.measureType}</td>
                      <td className='px-4 py-3 text-sm'>
                        {cert.contractValue}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        {cert.inceptionDate}
                      </td>
                      <td className='px-4 py-3 text-sm'>{cert.expiryDate}</td>
                      <td className='px-4 py-3 text-sm'>
                        {cert.transactionType}
                      </td>
                      <td className='px-4 py-3 text-sm font-semibold'>
                        {cert.price}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleViewCertificate(cert.policyNo)}
                            className='p-2 hover:bg-gray-100 rounded'>
                            <svg
                              className='w-4 h-4 text-blue-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadCertificate(cert.policyNo)
                            }
                            className='p-2 hover:bg-gray-100 rounded'>
                            <svg
                              className='w-4 h-4 text-gray-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default DashboardPage;
