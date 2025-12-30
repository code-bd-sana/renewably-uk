"use client";
import { useState } from "react";

const Page = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
    file: null,
  });

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // handle file upload
  const handleFile = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0],
    });
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      policyHolderName: formData.name,
      email: formData.email,
      ticketCategory: formData.category,
      description: formData.description,
      uploadedFile: formData.file ? formData.file.name : null,
    };

    console.log("SUBMITTED DATA OBJECT:", finalData);
  };

  return (
    <div className='min-h-screen bg-[#f9fafb] py-10 px-4 flex justify-center'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-5xl bg-white rounded-lg shadow p-8'>
        <h2 className='text-[22px] font-semibold text-gray-800 mb-6'>
          Hubspot Ticket
        </h2>

        {/* Inputs */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col'>
            <label className='font-medium text-gray-700 mb-1'>
              Policy Holder Name*
            </label>
            <input
              name='name'
              type='text'
              className='border border-gray-300 rounded-md px-3 py-2'
              placeholder='Enter your document title'
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col'>
            <label className='font-medium text-gray-700 mb-1'>Email*</label>
            <input
              name='email'
              type='email'
              className='border border-gray-300 rounded-md px-3 py-2'
              placeholder='Enter your email'
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Category */}
        <div className='mt-6'>
          <label className='font-medium text-gray-700 mb-1'>
            Ticket Category*
          </label>
          <select
            name='category'
            className='w-full border border-gray-300 rounded-md px-3 py-2'
            onChange={handleChange}>
            <option value=''>Select your Ticket category</option>
            <option value='General'>General</option>
            <option value='Technical'>Technical</option>
            <option value='Billing'>Billing</option>
          </select>
        </div>

        {/* Description */}
        <div className='mt-6'>
          <label className='font-medium text-gray-700 mb-1'>
            Description (optional)
          </label>
          <textarea
            name='description'
            rows='4'
            className='w-full border border-gray-300 rounded-md px-3 py-2'
            placeholder='Please provide details about your issue or question...'
            onChange={handleChange}></textarea>
        </div>

        {/* Upload */}
        <div className='mt-10 border rounded-lg p-6 bg-[#fafafa]'>
          <h3 className='text-[18px] font-medium text-gray-700 mb-4'>
            Upload File
          </h3>

          <div className='border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-white'>
            <input
              type='file'
              className='hidden'
              id='fileInput'
              onChange={handleFile}
            />

            <label htmlFor='fileInput' className='cursor-pointer'>
              <div className='text-blue-500 text-5xl mb-4'>📤</div>
              <p className='text-gray-600 font-medium'>
                Drag & Drop Files Here
              </p>
              <p className='text-gray-400 text-sm mb-4'>or click to browse</p>

              <button
                type='button'
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'>
                Browse Files
              </button>
            </label>

            <p className='text-gray-400 text-xs mt-4'>
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </p>

            {formData.file && (
              <p className='mt-3 text-sm text-green-600'>
                Selected File: {formData.file.name}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 mt-8'>
          <button
            type='button'
            className='px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 transition'>
            Cancel
          </button>

          <button
            type='submit'
            className='px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition'>
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
