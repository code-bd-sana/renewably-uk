import { LocationEdit, MapPin } from "lucide-react";
import Image from "next/image";

export default function CertificateTemplate() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-4 md:mx-24 bg-white rounded-lg shadow-md">
        {/* Page Title */}
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base md:text-lg text-gray-800 font-medium">
            Certificate Template
          </h2>
          <Image
            src="/bluedrop.png"
            height={150}
            width={150}
            alt="Renewably UK"
            className="h-auto w-auto"
          />
        </div>

        {/* Header Section */}
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="order-2 md:order-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0F47A8] mb-2">
                Insurance Backed Guarantee
              </h1>
              <p className="text-xs md:text-sm text-[#0F47A8] font-semibold">
                Certificate & Schedule of Insurance
              </p>
            </div>
            <div className="order-1 md:order-2 self-center md:self-auto">
              <Image
                src="/pex.png"
                height={80}
                width={80}
                alt="Renewably UK"
                className="h-auto w-auto md:h-20 md:w-20 lg:h-auto lg:w-auto"
              />
            </div>
          </div>

          {/* Cover Section */}
          <div className="bg-blue-50 p-3 md:p-4 rounded-md mt-4">
            <h3 className="text-sm font-semibold text-[#0F47A8] mb-3">
              Cover Option
            </h3>
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-1">
                Insurance Backed Guarantee
              </h4>
              <p className="text-sm text-gray-600 mb-1">
                Policy Number: <span className="font-bold">BDIGWE201281</span>
              </p>
              <p className="text-xs text-gray-400">
                Please refer to your policy wording for full details
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Two Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
            {/* Agent/Broker */}
            <div className="bg-gray-50 p-4 md:p-5 rounded-md">
              <h3 className="text-xl md:text-2xl font-bold text-[#0F47A8] mb-3">
                Agent/Broker
              </h3>
              <div className="">
                <Image
                  src="/bluedrop.png"
                  height={100}
                  width={100}
                  alt="Renewably UK"
                  className="h-auto w-auto"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span className="text-gray-400 mt-0.5">
                  <MapPin className="text-xs" />
                </span>
                <span className="text-xs md:text-sm">
                  The Mill Suite, Hardmans Business Centre
                </span>
              </div>
            </div>

            {/* Installation Contractor */}
            <div className="bg-gray-50 p-4 md:p-5 rounded-md">
              <h3 className="text-xl md:text-2xl font-bold text-[#0F47A8] mb-3">
                Installation Contractor
              </h3>
              <h4 className="text-base font-semibold text-gray-800 mb-2">
                North West Energy Grants Ltd
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">
                  <MapPin className="text-xs" />
                </span>
                <span className="text-xs md:text-sm">
                  2464 Royal Ln. Mesa, New Jersey 45463
                </span>
              </div>
            </div>
          </div>

          {/* Insured/Policyholder Details */}
          <div className="bg-gray-50 p-4 md:p-5 rounded-md mb-4 md:mb-5">
            <h3 className="text-xl md:text-2xl font-bold text-[#0F47A8] mb-4">
              Insured / Policyholder Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Name
                </label>
                <p className="text-sm text-gray-600">Mr Leslie Corcoran</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Inception Date
                </label>
                <input
                  type="date"
                  defaultValue="2025-09-05"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Address
                </label>
                <p className="text-sm text-gray-600">
                  Shadyview Gn, Richardson, California 62639
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  defaultValue="2027-09-05"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Type of Installation
                </label>
                <p className="text-sm text-gray-600">
                  Gas-Fired Condensing Boiler
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Premium
                </label>
                <p className="text-xl md:text-2xl font-semibold text-gray-800">
                  £19.04
                </p>
                <p className="text-xs text-gray-400">
                  Including Fire policy Premium Tax
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Inception Date
                </label>
                <input
                  type="date"
                  defaultValue="2025-12-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Scheme Information */}
          <div className="bg-gray-50 p-4 md:p-5 rounded-md mb-4 md:mb-5">
            <h3 className="text-sm font-semibold text-[#0F47A8] mb-4">
              Scheme Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Retrofit Assessor
                </label>
                <input
                  type="text"
                  defaultValue="Savannah Nguyen"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Retrofit Coordinator
                </label>
                <input
                  type="text"
                  defaultValue="Cameron Williamson"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Funding Partner
                </label>
                <input
                  type="text"
                  defaultValue="Bessie Cooper"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  Scheme Provider
                </label>
                <input
                  type="text"
                  defaultValue="Ronald Richards"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Information Text */}
          <div className="bg-[#FFFBEF] rounded-2xl p-3 md:p-4 mb-4 md:mb-5">
            <div className="mb-3">
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                This document includes information provided to us. It shows you
                who is insured, the period of insurance, the level of cover, and
                the premium paid. This policy is made up of this document, the
                IBG and the Policy Wording documents. These documents can be
                found at:
              </p>
              <a
                href="#"
                className="text-xs text-[#0F47A8] hover:underline break-all"
              >
                www.bluedropservices.co.uk/Insurance-Backed-Guarantee
              </a>
            </div>

            <p className="text-xs text-gray-600 mb-5">
              Should the property be sold please pass this document to your
              solicitor for transfer to the new owner.
            </p>
          </div>

          {/* Insurer Section */}
          <div className="border-t border-gray-200 pt-4 md:pt-5">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Insurer – Financial & Legal Insurance Company Ltd
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 mb-5">
              <div className="flex items-center gap-3">
                <span className="text-[#0F47A8] text-lg">📞</span>
                <div>
                  <p className="text-xs text-gray-500">Claims Line</p>
                  <p className="text-sm text-gray-800">01760 658687</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#0F47A8] text-lg">✉️</span>
                <div>
                  <p className="text-xs text-gray-500">Claims Email</p>
                  <p className="text-sm text-gray-800 break-all sm:break-normal">
                    claims@bluedropservices.co.uk
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-md text-sm font-medium">
                <span>✓</span>
                Verified & Authenticated Certificate
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs rounded-b-lg">
          <span className="text-center sm:text-left">
            © 2024 Bluedrop Services Limited. All rights reserved.
          </span>
          <span className="text-center sm:text-right">
            Certificate ID: BDIGWE201281 | Issue Date: 12/16/2025
          </span>
        </div>
      </div>
    </div>
  );
}
