import { LocationEdit } from "lucide-react";
import Image from "next/image";

export default function CertificateTemplate() {
  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='mx-44 bg-white rounded-lg shadow-md'>
        {/* Page Title */}
        <div className='px-8 py-5 border-b border-gray-200'>
          <h2 className='text-lg text-gray-800 font-medium'>
            Certificate Template
          </h2>
        </div>

        {/* Header Section */}
        <div className='px-8 py-8 bg-gray-50 border-b border-gray-200'>
          <div className='flex justify-between items-center '>
            <div>
              <h1 className='text-3xl font-semibold text-[#0F47A8] mb-2'>
                Insurance Backed Guarantee
              </h1>
              <p className='text-sm text-[#0F47A8]'>
                Certificate & Schedule of Insurance
              </p>
            </div>
            <div className=' '>
              <Image
                src='/pex.png'
                height={100}
                width={100}
                alt='Renewably UK'
                className='h-auto w-auto'
              />
            </div>
          </div>

          {/* Cover Section */}
          <div className='bg-blue-50 p-4 rounded-md'>
            <h3 className='text-sm font-semibold text-[#0F47A8] mb-3'>
              Cover Option
            </h3>
            <div>
              <h4 className='text-sm font-medium text-gray-800 mb-1'>
                Insurance Backed Guarantee
              </h4>
              <p className='text-sm text-gray-600 mb-1'>
                Policy Number: BDIGWE201281
              </p>
              <p className='text-xs text-gray-400'>
                Please refer to your policy wording for full details
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='px-8 py-8'>
          {/* Two Column Section */}
          <div className='grid grid-cols-2 gap-5 mb-8'>
            {/* Agent/Broker */}
            <div className='bg-gray-50 p-5 rounded-md'>
              <h3 className='text-sm font-semibold text-[#0F47A8] mb-3'>
                Agent/Broker
              </h3>
              <div className=' '>
                <Image
                  src='/bluedrop.png'
                  height={120}
                  width={120}
                  alt='Renewably UK'
                  className='h-auto w-auto'
                />
              </div>
              <p className='text-xs text-gray-400 mb-2'>SERVICES</p>
              <div className='flex items-start gap-2 text-sm text-gray-600'>
                <span className='text-gray-400 '>
                  <LocationEdit className='text-xs' />
                </span>
                <span>The Mill Suite, Hardmans Business Centre</span>
              </div>
            </div>

            {/* Installation Contractor */}
            <div className='bg-gray-50 p-5 rounded-md'>
              <h3 className='text-sm font-semibold text-[#0F47A8] mb-3'>
                Installation Contractor
              </h3>
              <h4 className='text-lg font-semibold text-gray-800 mb-2'>
                North West Energy Grants Ltd
              </h4>
              <div className='flex items-start gap-2 text-sm text-gray-600'>
                <span className='text-gray-400 '>
                  <LocationEdit className='text-xs' />
                </span>
                <span>2464 Royal Ln. Mesa, New Jersey 45463</span>
              </div>
            </div>
          </div>

          {/* Insured/Policyholder Details */}
          <div className='bg-gray-50 p-5 rounded-md mb-5'>
            <h3 className='text-sm font-semibold text-[#0F47A8] mb-4'>
              Insured / Policyholder Details
            </h3>

            <div className='grid grid-cols-2 gap-5 mb-5'>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Name
                </label>
                <p className='text-sm text-gray-600'>Mr Leslie Corcoran</p>
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Inception Date
                </label>
                <input
                  type='date'
                  defaultValue='2025-09-05'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5 mb-5'>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Address
                </label>
                <p className='text-sm text-gray-600'>
                  Shadyview Gn, Richardson, California 62639
                </p>
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Expiry Date
                </label>
                <input
                  type='date'
                  defaultValue='2027-09-05'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-5'>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Type of Installation
                </label>
                <p className='text-sm text-gray-600'>
                  Gas-Fired Condensing Boiler
                </p>
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Premium
                </label>
                <p className='text-2xl font-semibold text-gray-800'>£19.04</p>
                <p className='text-xs text-gray-400'>
                  Including Fire policy Premium Tax
                </p>
              </div>
            </div>
          </div>

          {/* Scheme Information */}
          <div className='bg-gray-50 p-5 rounded-md mb-5'>
            <h3 className='text-sm font-semibold text-[#0F47A8] mb-4'>
              Scheme Information
            </h3>

            <div className='grid grid-cols-2 gap-5'>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Retrofit Assessor
                </label>
                <input
                  type='text'
                  defaultValue='Savannah Nguyen'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Retrofit Coordinator
                </label>
                <input
                  type='text'
                  defaultValue='Cameron Williamson'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Funding Partner
                </label>
                <input
                  type='text'
                  defaultValue='Bessie Cooper'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white'
                />
              </div>
              <div>
                <label className='text-sm font-semibold text-gray-800 block mb-2'>
                  Scheme Provider
                </label>
                <input
                  type='text'
                  defaultValue='Ronald Richards'
                  className='w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white'
                />
              </div>
            </div>
          </div>

          {/* Information Text */}
          <div className='bg-[#FFFBEF] rounded-2xl p-3 mb-3'>
            <div className='mb-3 '>
              <p className='text-xs text-gray-600  leading-relaxed mb-2'>
                This document includes information provided to us. It shows you
                who is insured, the period of insurance, the level of cover, and
                the premium paid. This policy is made up of this document, the
                IBG and the Policy Wording documents. These documents can be
                found at:
              </p>
              <a href='#' className='text-xs text-[#0F47A8] hover:underline'>
                www.bluedropservices.co.uk/Insurance-Backed-Guarantee
              </a>
            </div>

            <p className='text-xs text-gray-600 mb-5'>
              Should the property be sold please pass this document to your
              solicitor for transfer to the new owner.
            </p>
          </div>

          {/* Insurer Section */}
          <div className='border-t border-gray-200 pt-5'>
            <h3 className='text-base font-semibold text-gray-800 mb-4'>
              Insurer – Financial & Legal Insurance Company Ltd
            </h3>

            <div className='flex gap-10 mb-5'>
              <div className='flex items-center gap-3'>
                <span className='text-[#0F47A8] text-lg'>📞</span>
                <div>
                  <p className='text-xs text-gray-500'>Claims Line</p>
                  <p className='text-sm text-gray-800'>01760 658687</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-[#0F47A8] text-lg'>✉️</span>
                <div>
                  <p className='text-xs text-gray-500'>Claims Email</p>
                  <p className='text-sm text-gray-800'>
                    claims@bluedropservices.co.uk
                  </p>
                </div>
              </div>
            </div>

            <div className='text-center mt-5'>
              <span className='inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-md text-sm font-medium'>
                <span>✓</span>
                Verified & Authenticated Certificate
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='bg-blue-600 text-white px-8 py-4 flex justify-between items-center text-xs rounded-b-lg'>
          <span>© 2024 Bluedrop Services Limited. All rights reserved.</span>
          <span>Certificate ID: BDIGWE201281 | Issue Date: 12/16/2025</span>
        </div>
      </div>
    </div>
  );
}
