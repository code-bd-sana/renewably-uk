"use client";

import bluedrop from "@/public/shared/bluedrop.jpg";
import logo2 from "@/public/shared/logo3.jpg";
import { downloadPdf } from "@/utils/pdfGenerator";
import {
  Calendar,
  ChartLine,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileCheck,
  FileText,
  Loader2,
  NotepadText,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function DashboardPage() {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    thisMonthCertificates: 0,
    accountBalance: "£0.00",
    editPending: 0,
  });

  const [certificates, setCertificates] = useState([]);
  const [thisMonthCerts, setThisMonthCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const router = useRouter();
  const itemsPerPage = 10;

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

          // console.log(certsData, "This is certs Data, yeah");

          if (certsData.success) {
            setCertificates(certsData.certificates || []);

            const now = new Date();

            // Filter this month's certificates
            const thisMonthCertificates = certsData.certificates.filter(
              (cert) => {
                if (!cert.inceptionDate) return false;

                const certDate = new Date(
                  cert.inceptionDate.split("/").reverse().join("-"),
                );

                return (
                  certDate.getMonth() === now.getMonth() &&
                  certDate.getFullYear() === now.getFullYear()
                );
              },
            );

            setThisMonthCerts(thisMonthCertificates);

            // Sum prices for this month
            const accountBalanceNumber = thisMonthCertificates.reduce(
              (total, cert) => {
                if (!cert.price) return total;

                // "£ 2.25" -> 2.25
                const priceNumber = parseFloat(
                  cert.price.replace(/[^\d.]/g, ""),
                );

                return total + (isNaN(priceNumber) ? 0 : priceNumber);
              },
              0,
            );

            setStats({
              totalCertificates: certsData.certificates.length,
              thisMonthCertificates: thisMonthCertificates.length,
              accountBalance: `£${accountBalanceNumber.toFixed(2)}`,
              editPending: certsData.certificates.filter(
                (cert) => cert.status === "pending_edit",
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

  // Search ONLY this month certificates
  const filteredCertificates = thisMonthCerts.filter(
    (cert) =>
      cert.holderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.policyNo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCertificates = filteredCertificates.slice(
    startIndex,
    endIndex,
  );

  // View Certificate Modal Function
  const handleViewCertificate = (certificate) => {
    setSelectedCertificate({
      policyNumber: certificate.policyNo,
      policyHolderName: certificate.holderName,
      productType: certificate.productType || certificate.measureType,
      contractValue: certificate.contractValue,
      inceptionDate: certificate.inceptionDate,
      expiryDate: certificate.expiryDate,
      price: certificate.price,
      status: certificate.status || "active",
      contractorName:
        certificate.rawData?.insurance?.contractorName || "Not provided",
      contractorAddress:
        certificate.rawData?.insurance?.contractorAddress || "Not provided",
      email: certificate.rawData?.insurance?.email || "Not provided",
      phone: certificate.rawData?.insurance?.phone || "Not provided",
      address: certificate.rawData?.insurance?.address || "Not provided",
      country: certificate.rawData?.insurance?.country || "Not provided",
      postcode: certificate.rawData?.insurance?.postcode || "Not provided",
      insuranceId: certificate.insuranceId || certificate.id?.split("-")[0],
    });
    setShowModal(true);
  };

  // Download Certificate Function
  const handleDownloadCertificate = async (cert) => {
    try {
      // Get contractor data from the certificate or create fallback
      const contractor = {
        name:
          cert.contractorData?.name ||
          cert.rawData?.insurance?.contractorName ||
          "Not provided",
        email:
          cert.contractorData?.email ||
          cert.rawData?.insurance?.email ||
          "Not provided",
        phone:
          cert.contractorData?.phone ||
          cert.rawData?.insurance?.phone ||
          "Not provided",
        companyName:
          cert.contractorData?.companyName ||
          cert.rawData?.insurance?.contractorName ||
          "Not provided",
        address:
          cert.contractorData?.address ||
          cert.rawData?.insurance?.address ||
          "Not provided",
        postcode:
          cert.contractorData?.postcode ||
          cert.rawData?.insurance?.postcode ||
          "Not provided",
        country:
          cert.contractorData?.country ||
          cert.rawData?.insurance?.country ||
          "Not provided",
      };

      const certificateData = {
        ...cert,
        // Ensure all fields exist
        policyNo: cert.policyNo || cert.policyNumber,
        policyNumber: cert.policyNumber || cert.policyNo,
        holderName:
          cert.holderName || cert.rawData?.insurance?.policyHolderName,
        email: cert.email || cert.rawData?.insurance?.email,
        phone: cert.phone || cert.rawData?.insurance?.phone,
        address: cert.address || cert.rawData?.insurance?.address,
        country: cert.country || cert.rawData?.insurance?.country,
        postcode: cert.postcode || cert.rawData?.insurance?.postcode,
        contractorName:
          cert.contractorName || cert.rawData?.insurance?.contractorName,
        rawData: {
          ...cert.rawData,
          insurance: {
            ...cert.rawData?.insurance,
            contractorName:
              cert.rawData?.insurance?.contractorName || cert.contractorName,
            contractorAddress: cert.rawData?.insurance?.contractorAddress || "",
            email: cert.rawData?.insurance?.email || cert.email,
            phone: cert.rawData?.insurance?.phone || cert.phone,
            address: cert.rawData?.insurance?.address || cert.address,
            country: cert.rawData?.insurance?.country || cert.country,
            postcode: cert.rawData?.insurance?.postcode || cert.postcode,
            policyHolderName:
              cert.rawData?.insurance?.policyHolderName || cert.holderName,
            retrofitAssessor:
              cert.rawData?.insurance?.retrofitAssessor ||
              cert.retrofitAssessor,
            retrofitCoordinator:
              cert.rawData?.insurance?.retrofitCoordinator ||
              cert.retrofitCoordinator,
            schemeProvider:
              cert.rawData?.insurance?.schemeProvider || cert.schemeProvider,
            fundingPartner:
              cert.rawData?.insurance?.fundingPartner || cert.fundingPartner,
          },
          product: {
            ...cert.rawData?.product,
            coverOption:
              cert.rawData?.product?.coverOption ||
              "Insurance Backed Guarantee",
          },
        },
      };

      // Call the downloadPdf function with both certificate and contractor
      await downloadPdf(certificateData, contractor);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    } finally {
      setDownloading(false);
    }
  };

  // Helper function to render fields in modal
  const renderField = (label, value) => (
    <div className='flex items-start py-2'>
      <div className='w-1/3 text-sm font-medium text-gray-700'>{label}</div>
      <div className='w-2/3'>
        <span className='text-sm text-gray-600'>{value || "Not provided"}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className='p-4 lg:p-6'>
        <div className='animate-pulse'>
          <div className='bg-gray-200 h-32 rounded-lg mb-6'></div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='bg-gray-200 h-24 rounded-lg'></div>
            ))}
          </div>
          <div className='bg-gray-200 h-64 rounded-lg'></div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 lg:p-6 bg-[#FAFAF9]'>
      {/* Blue Banner */}
      <div className='bg-[#0F47A8] text-white p-6 rounded-lg mb-6 flex items-center justify-between'>
        <div className='rounded flex items-center justify-center'>
          <div>
            <Image
              src={logo2}
              height='70'
              width='70'
              alt='Renewably UK'
              className='h-auto w-auto'
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono '>
              {stats.totalCertificates}
            </h3>
            <div className='p-2 rounded-lg bg-blue-50'>
              <NotepadText className='text-[#0F47A8] w-6 h-6' />
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans '>
            Total Certificates
          </p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono'>
              {stats.thisMonthCertificates}
            </h3>
            <div className='p-2 rounded-lg bg-blue-50'>
              <ChartLine className='text-[#0F47A8] w-6 h-6' />
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>This Month</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-semibold font-mono'>
              {stats.accountBalance}
            </h3>
            <div className='p-2 rounded-lg bg-blue-50'>
              <Calendar className='text-[#0F47A8] w-6 h-6' />
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>Account Balance</p>
        </div>

        <div className='bg-white p-4 rounded-lg shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-2xl font-bold font-mono'>
              {stats.editPending}
            </h3>
            <div className='p-2 rounded-lg bg-blue-50'>
              <FileCheck className='text-[#0F47A8] w-6 h-6' />
            </div>
          </div>
          <p className='text-sm text-[#6B7280] font-sans'>Edit Pending</p>
        </div>
      </div>

      {/* Certificates Table */}
      <div className='bg-[#FFFFFF] pb-12 border border-gray-200 rounded-xl  overflow-hidden'>
        <div className='mb-6 px-4 mt-4'>
          <Image src={bluedrop} height={150} width={192} alt='BlueDrop' />
        </div>
        <div className='px-6 pb-4 text-[#262626]  font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <h3 className='font-semibold font-sans text-[28px]'>
            This Month’s Insurance Backed Guarantee Certificates
            <span className='text-sm font-normal text-gray-600 ml-2'>
              ({filteredCertificates.length} certificates)
            </span>
          </h3>
          <div className='relative w-full sm:w-64'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search by policy holder name...'
              className='border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
            <p>No certificates found for this month</p>
            {searchTerm && (
              <p className='text-sm mt-1'>Try a different search term</p>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className='md:hidden'>
              {paginatedCertificates.map((cert, index) => (
                <div key={index} className='p-4 border-b border-gray-200'>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>
                        Policy Number:
                      </span>
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
                      <span className='text-sm'>
                        {cert.productType || cert.measureType}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-xs text-gray-500'>Price:</span>
                      <span className='text-sm font-semibold'>
                        {cert.price}
                      </span>
                    </div>
                    <div className='flex gap-2 mt-3'>
                      <button
                        onClick={() => handleViewCertificate(cert)}
                        className='flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-blue-700 transition-colors'>
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadCertificate(cert)}
                        disabled={downloading}
                        className='flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50'>
                        {downloading ? (
                          <Loader2 size={16} className='animate-spin' />
                        ) : (
                          <Download size={16} />
                        )}
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className='hidden border-b  border-t mt-4  md:block  mx-6 border border-gray-200 overflow-x-auto'>
              <table className='w-full '>
                <thead className='bg-[#FAFAF9] border-b border-gray-200'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Policy Number
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Policy Holder Name
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Product Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Contract Value
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Inception Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Expiry Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Transaction Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold text-[#030712]'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-[#FFFFFF] '>
                  {paginatedCertificates.slice(0, 5).map((cert, index) => (
                    <tr
                      key={index}
                      className='border-b border-gray-200 hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm font-mono text-[#030712]'>
                        {cert.policyNo}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal font-sans text-[#6B7280]'>
                        {cert.holderName}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal font-sans text-[#6B7280]'>
                        {cert.productType || cert.measureType}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.contractValue}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.inceptionDate}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.expiryDate}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-sans'>
                        {cert.transactionType}
                      </td>
                      <td className='px-4 py-3 text-sm font-normal text-[#6B7280] font-mono'>
                        {cert.price}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded'>
                            <Eye size={18} className='text-blue-600' />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(cert)}
                            disabled={downloading}
                            className='p-2 hover:bg-gray-100 cursor-pointer rounded disabled:opacity-50'>
                            {downloading ? (
                              <Loader2
                                size={18}
                                className='text-gray-600 animate-spin'
                              />
                            ) : (
                              <Download size={18} className='text-gray-600' />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='px-4 py-4 hidden flex items-center justify-center border-t border-gray-200'>
                <nav className='flex items-center gap-2'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className='px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className='flex items-center gap-1'>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}>
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                    Next
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Certificate Modal */}
      {showModal && selectedCertificate && (
        <div className='fixed inset-0 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
            {/* Modal Header */}
            <div className='p-6 border-b border-gray-200'>
              <div className='flex items-center justify-between mb-6'>
                <div className='inline-flex items-center gap-2'>
                  <div className='mb-6 px-4 mt-4'>
                    <Image
                      src={bluedrop}
                      height={150}
                      width={192}
                      alt='BlueDrop'
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedCertificate(null);
                  }}
                  className='p-2 hover:bg-gray-100 rounded-lg'>
                  <X size={20} />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-semibold text-gray-900'>
                  {selectedCertificate.policyNumber}
                </h1>
                <button
                  onClick={() => {
                    const cert = thisMonthCerts.find(
                      (c) => c.policyNo === selectedCertificate.policyNumber,
                    );
                    if (cert) {
                      handleDownloadCertificate(cert);
                    }
                  }}
                  className='p-2 text-gray-600 hover:bg-gray-100 rounded'
                  disabled={downloading}>
                  {downloading ? (
                    <Loader2 size={20} className='animate-spin' />
                  ) : (
                    <Download size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Certificate Details */}
            <div className='p-6 overflow-y-auto max-h-[calc(90vh-200px)]'>
              {/* Contractor Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Contractor Details
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Contractor Name
                    </div>
                    <div className='text-base font-medium'>
                      {selectedCertificate.contractorName}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500 mb-1'>
                      Contractor Address
                    </div>
                    <div className='text-base'>
                      {selectedCertificate.contractorAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Holder Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Policy Holder Details
                </h2>
                <div className='space-y-3'>
                  {renderField(
                    "Policy Holder Name",
                    selectedCertificate.policyHolderName,
                  )}
                  {renderField("Address", selectedCertificate.address)}
                  {renderField("Country", selectedCertificate.country)}
                  {renderField("Postcode", selectedCertificate.postcode)}
                  {renderField("Policyholder email", selectedCertificate.email)}
                  {renderField("Policyholder Phone", selectedCertificate.phone)}
                </div>
              </div>

              {/* Product Details */}
              <div className='mb-6'>
                <h2 className='text-lg font-semibold text-gray-800 mb-3'>
                  Product Details
                </h2>
                <div className='space-y-3'>
                  {renderField("Product Type", selectedCertificate.productType)}
                  {renderField(
                    "Insurance Coverage",
                    "Insurance Backed Guarantee",
                  )}
                  {renderField(
                    "Inception Date",
                    selectedCertificate.inceptionDate,
                  )}
                  {renderField("Expiry Date", selectedCertificate.expiryDate)}
                  {renderField(
                    "Contract Value",
                    selectedCertificate.contractValue,
                  )}
                  {renderField("Transaction Type", "Certificate Generated")}
                  {renderField("Price", selectedCertificate.price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardPage;
