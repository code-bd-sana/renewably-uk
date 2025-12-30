"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function CreateInsuranceForm() {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showCoverOption, setShowCoverOption] = useState(false);
  const [showRetrofitAssessor, setShowRetrofitAssessor] = useState(false);
  const [showRetrofitCoordinator, setShowRetrofitCoordinator] = useState(false);
  const [showFundingPartner, setShowFundingPartner] = useState(false);
  const [showSchemeProvider, setShowSchemeProvider] = useState(false);
  const [contractorData, setContractorData] = useState(null);
  const [showABS, setShowABS] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [products, setProducts] = useState([]);
  const [activeProductId, setActiveProductId] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    hour: "01",
    minute: "34",
    period: "AM",
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState({});

  const [formData, setFormData] = useState({
    contractorName: "",
    contractorAddress: "",
    policyHolderName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    postcode: "",
    products: [
      {
        id: Date.now(), // Use timestamp for unique ID
        productType: "",
        inceptionDate: "",
        expiryDate: "",
        contractValue: "",
        totalProjectCost: "",
      },
    ],
    retrofitAssessor: "",
    retrofitCoordinator: "",
    fundingPartner: "",
    schemeProvider: "",
    abs: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products.filter((p) => p.Measures)); // Filter out empty rows
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchContractorData();
  }, []);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();
    return products.filter((product) =>
      product.Measures.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const countries = [
    "United Kingdom",
    "United States",
    "Canada",
    "Australia",
    "Germany",
    "France",
  ];
  const dropdownOptions = [
    "Not Required",
    "Assigned",
    "Pending Assignment",
    "External Provider",
  ];

  const fetchContractorData = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Changed from data.contractor to data.user
          setContractorData(data.user);
          setFormData((prev) => ({
            ...prev,
            contractorName: data.user.companyName || data.user.name, // Use companyName first
            contractorAddress: data.user.officeAddress || "", // Assuming you add officeAddress field
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching contractor data:", error);
      toast.error("Failed to load contractor data");
    }
  };

  // for adding product
  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: Date.now() + Math.random(), // Ensure unique ID
          productType: "",
          inceptionDate: "",
          expiryDate: "",
          contractValue: "",
          totalProjectCost: "",
        },
      ],
    }));
  };

  const removeProduct = (id) => {
    if (formData.products.length > 1) {
      setFormData((prev) => ({
        ...prev,
        products: prev.products.filter((product) => product.id !== id),
      }));
    }
  };

  const updateProduct = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      ),
    }));
  };

  // Product dropdown handler
  const toggleProductDropdown = (productId) => {
    setShowProductDropdown((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const selectProductType = (productId, measure) => {
    updateProduct(productId, "productType", measure);
    setShowProductDropdown((prev) => ({
      ...prev,
      [productId]: false,
    }));
  };

  // drop down
  useEffect(() => {
    // Close all dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowCoverOption(false);
        setShowRetrofitAssessor(false);
        setShowRetrofitCoordinator(false);
        setShowFundingPartner(false);
        setShowSchemeProvider(false);
        setShowABS(false);

        // Close all product dropdowns
        setShowProductDropdown({});
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  const MonthPicker = ({ onSelect }) => (
    <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border p-6 w-80'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth())
            )
          }
          className='p-2 hover:bg-gray-100 rounded'>
          <ChevronLeft size={20} />
        </button>
        <span className='font-semibold'>{currentMonth.getFullYear()}</span>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth())
            )
          }
          className='p-2 hover:bg-gray-100 rounded'>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className='grid grid-cols-3 gap-3'>
        {monthNames.map((month, index) => (
          <button
            key={month}
            onClick={() => {
              const monthIndex = index + 1; // January = 1
              const year = currentMonth.getFullYear();

              // Create expiry date as last day of selected month
              const expiryDate = new Date(year, monthIndex, 0); // Last day of month
              const apiDate = `${year}-${String(monthIndex).padStart(
                2,
                "0"
              )}-${String(expiryDate.getDate()).padStart(2, "0")}`;
              const displayDate = `${month} ${year}`;

              setSelectedMonth(displayDate);
              onSelect(apiDate); // Send API-formatted date
              setShowMonthPicker(false);
            }}
            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
              selectedMonth === `${month} ${currentMonth.getFullYear()}`
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}>
            {month}
          </button>
        ))}
      </div>
    </div>
  );

  const DatePicker = ({ onSelect }) => (
    <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border p-4 w-80'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
            )
          }
          className='p-2 hover:bg-gray-100 rounded'>
          <ChevronLeft size={20} />
        </button>
        <span className='font-semibold'>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
            )
          }
          className='p-2 hover:bg-gray-100 rounded'>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className='grid grid-cols-7 gap-2 mb-2'>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className='text-center text-xs font-medium text-gray-600'>
            {day}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-2'>
        {getDaysInMonth(currentMonth).map((dayObj, index) => (
          <button
            key={index}
            onClick={() => {
              if (dayObj.isCurrentMonth) {
                const year = currentMonth.getFullYear();
                const month = String(currentMonth.getMonth() + 1).padStart(
                  2,
                  "0"
                );
                const day = String(dayObj.day).padStart(2, "0");

                // Format for API: "2025-11-25"
                const apiDate = `${year}-${month}-${day}`;

                // Format for display: "25/11/2025"
                const displayDate = `${day}/${month}/${year}`;

                setSelectedDate(displayDate);
                onSelect(apiDate); // Send API-formatted date
                setShowDatePicker(false);
              }
            }}
            className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
              !dayObj.isCurrentMonth
                ? "text-gray-300"
                : selectedDate ===
                  `${dayObj.day}/${
                    currentMonth.getMonth() + 1
                  }/${currentMonth.getFullYear()}`
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}>
            {dayObj.day}
          </button>
        ))}
      </div>
    </div>
  );
  const formatDateForAPI = (dateString) => {
    // Convert from "25/11/2025" to "2025-11-25"
    if (!dateString) return "";

    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return dateString; // Already in correct format
  };

  const DropdownMenu = ({ options, selected, onSelect, show, onClose }) =>
    show && (
      <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border w-full max-w-md'>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
              index === 0 ? "rounded-t-lg" : ""
            } ${index === options.length - 1 ? "rounded-b-lg" : "border-b"}`}>
            <span className={index === 0 ? "font-medium" : ""}>{option}</span>
            {selected === option && (
              <Check
                size={18}
                className='text-white bg-blue-600 rounded-full p-0.5'
              />
            )}
          </button>
        ))}
      </div>
    );

  // Product Dropdown Component
  const ProductDropdown = ({ productId, show }) => {
    const currentProduct = formData.products.find((p) => p.id === productId);
    const selectedMeasure = currentProduct?.productType || "";

    return (
      show && (
        <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border w-full max-w-md max-h-96 overflow-hidden'>
          {/* Search Input */}
          <div className='p-3 border-b'>
            <div className='relative'>
              <Search
                size={18}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              />
              <input
                type='text'
                placeholder='Search products...'
                className='w-full pl-10 pr-3 py-2 border rounded-lg text-sm'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Product List */}
          <div className='overflow-y-auto max-h-72'>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <button
                  key={product._id}
                  onClick={() => selectProductType(productId, product.Measures)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
                    index === 0 ? "" : "border-t"
                  }`}>
                  <div>
                    <span className='font-medium'>{product.Measures}</span>
                    <div className='text-xs text-gray-500 mt-1'>
                      <span>Guarantee Period: {product.Year} years</span>
                      {product.Month > 0 && (
                        <span>, {product.Month} months</span>
                      )}
                      {product.Days > 0 && <span>, {product.Days} days</span>}
                    </div>
                  </div>
                  {selectedMeasure === product.Measures && (
                    <Check
                      size={18}
                      className='text-white bg-blue-600 rounded-full p-0.5'
                    />
                  )}
                </button>
              ))
            ) : (
              <div className='px-4 py-3 text-center text-gray-500'>
                No products found
              </div>
            )}
          </div>
        </div>
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Validate all products before submission
      let validationErrors = [];

      formData.products.forEach((product, index) => {
        // Check contract value
        const contractValue = parseFloat(product.contractValue);
        if (isNaN(contractValue) || contractValue <= 0) {
          validationErrors.push(
            `Product ${
              index + 1
            }: Please enter a valid contract value (must be a number greater than 0)`
          );
        }

        // Check total project cost if provided
        if (
          product.totalProjectCost &&
          product.totalProjectCost.trim() !== ""
        ) {
          const totalCost = parseFloat(product.totalProjectCost);
          if (isNaN(totalCost) || totalCost < 0) {
            validationErrors.push(
              `Product ${index + 1}: Please enter a valid total project cost`
            );
          }
        }

        // Check dates
        if (!product.inceptionDate) {
          validationErrors.push(
            `Product ${index + 1}: Inception date is required`
          );
        }
        if (!product.expiryDate) {
          validationErrors.push(
            `Product ${index + 1}: Expiry date is required`
          );
        }
      });

      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join("\n");
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-right",
        });
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // 2. Prepare products data with proper formatting
      const processedProducts = formData.products.map((product) => {
        const contractValue = parseFloat(product.contractValue);
        const totalProjectCost =
          product.totalProjectCost && product.totalProjectCost.trim() !== ""
            ? parseFloat(product.totalProjectCost)
            : 0;

        // Calculate price (5% of contract value or use existing price if provided)
        const price = product.price
          ? parseFloat(product.price)
          : contractValue * 0.05;

        return {
          productType: product.productType,
          coverOption: product.coverOption || "Insurance Backed Guarantee",
          inceptionDate: product.inceptionDate,
          expiryDate: product.expiryDate,
          contractValue: contractValue, // Keep as number
          totalProjectCost: totalProjectCost, // Keep as number
          price: price, // ADD THIS - required by your schema
        };
      });

      // 3. Prepare submission data
      const submissionData = {
        contractorName: formData.contractorName,
        contractorAddress: formData.contractorAddress || "",
        policyHolderName: formData.policyHolderName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        postcode: formData.postcode,
        products: processedProducts, // Use the processed products array
        retrofitAssessor: formData.retrofitAssessor || "",
        retrofitCoordinator: formData.retrofitCoordinator || "",
        fundingPartner: formData.fundingPartner || "",
        schemeProvider: formData.schemeProvider || "",
        abs: formData.abs || "",
      };

      console.log("Submitting form data:", submissionData);

      // 4. Debug log each product
      submissionData.products.forEach((product, index) => {
        console.log(`Product ${index + 1} Details:`, {
          productType: product.productType,
          inceptionDate: product.inceptionDate,
          expiryDate: product.expiryDate,
          contractValue: product.contractValue,
          totalProjectCost: product.totalProjectCost,
          contractValueType: typeof product.contractValue,
          contractValueNumber: parseFloat(product.contractValue),
        });
      });

      // 5. Submit to API
      const response = await fetch("/api/insurance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      console.log("Api Response -->", result);

      if (!response.ok) {
        let errorMessage = "Failed to create insurance";

        if (result.error) {
          errorMessage = result.error;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.details) {
          errorMessage = result.details;
        } else if (Array.isArray(result.errors)) {
          errorMessage = result.errors.map((err) => err.message).join(", ");
        }

        throw new Error(errorMessage);
      }

      // 6. Success handling
      toast.success("Insurance application created successfully!", {
        duration: 4000,
        position: "top-right",
      });

      // Optional: Add a small delay before redirecting
      setTimeout(() => {
        router.push("/certificates");
      }, 1500);
    } catch (error) {
      console.error("Submission error:", error);

      // Show error toast with proper message
      toast.error(error.message || "Failed to submit form. Please try again.", {
        duration: 5000,
        position: "top-right",
      });

      setError(error.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm("Are you sure you want to cancel? All unsaved data will be lost.")
    ) {
      router.push("/dashboard");
    }
  };

  return (
    <main className='p-4 lg:p-6 max-w-7xl mx-auto'>
      <Toaster
        toastOptions={{
          duration: 4000,
          position: "top-right",
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* Logo */}
      <div className='mb-6'>
        <div className='inline-flex items-center gap-2'>
          <div className='w-10 h-10 bg-blue-500 rounded-full'></div>
          <span className='font-bold text-xl'>
            BLUE<span className='text-blue-500'>DROP</span>
          </span>
          <span className='text-xs text-gray-500 ml-2'>SERVICES</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Contractor Details */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Contractor Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Contractor Name
              </label>
              <input
                type='text'
                value={formData.contractorName || "Loading..."}
                className='w-full border rounded-lg px-3 py-2 bg-gray-50'
                readOnly
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Contractor Office Address
              </label>
              <input
                type='text'
                value={formData.contractorAddress || "Not provided"}
                className='w-full border rounded-lg px-3 py-2 bg-gray-50'
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Policy Holder Details */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Policy Holder Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>Name *</label>
              <input
                type='text'
                placeholder='Enter customer name'
                className='w-full border rounded-lg px-3 py-2'
                value={formData.policyHolderName}
                onChange={(e) =>
                  setFormData({ ...formData, policyHolderName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Email Address *
              </label>
              <input
                type='email'
                placeholder='Enter your email address'
                className='w-full border rounded-lg px-3 py-2'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Phone Number *
              </label>
              <input
                type='tel'
                placeholder='Enter your phone number'
                className='w-full border rounded-lg px-3 py-2'
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Address *
              </label>
              <input
                type='text'
                placeholder='Enter your address'
                className='w-full border rounded-lg px-3 py-2'
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Country *
              </label>
              <select
                className='w-full border rounded-lg px-3 py-2'
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                required>
                <option value=''>Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Postcode *
              </label>
              <input
                type='number'
                placeholder='Enter your postcode'
                className='w-full border rounded-lg px-3 py-2'
                value={formData.postcode}
                onChange={(e) =>
                  setFormData({ ...formData, postcode: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Product Details</h2>

          {formData.products.map((product, index) => (
            <div key={product.id} className='mb-6 p-4 border rounded-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-medium'>Product {index + 1}</h3>
                {formData.products.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeProduct(product.id)}
                    className='text-red-500 hover:text-red-700 text-sm'>
                    Remove Product
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='relative dropdown-container'>
                  <label className='block text-sm font-medium mb-2'>
                    Product Type *
                  </label>
                  <button
                    type='button'
                    onClick={() => toggleProductDropdown(product.id)}
                    className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between hover:border-gray-400'>
                    <span
                      className={
                        product.productType ? "text-gray-900" : "text-gray-400"
                      }>
                      {product.productType || "Select product type"}
                    </span>
                    <ChevronRight
                      size={18}
                      className={`transition-transform ${
                        showProductDropdown[product.id] ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <ProductDropdown
                    productId={product.id}
                    show={showProductDropdown[product.id]}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Cover Option
                  </label>
                  <input
                    type='text'
                    value='Insurance Backed Guarantee'
                    className='w-full border rounded-lg px-3 py-2 bg-gray-50'
                    readOnly
                  />
                </div>
                <div className='relative'>
                  <label className='block text-sm font-medium mb-2'>
                    Inception Date *
                  </label>
                  <input
                    type='text'
                    required
                    placeholder='Click to select date'
                    value={
                      product.inceptionDate
                        ? `${new Date(product.inceptionDate).getDate()}/${
                            new Date(product.inceptionDate).getMonth() + 1
                          }/${new Date(product.inceptionDate).getFullYear()}`
                        : ""
                    }
                    onClick={() => {
                      setActiveProductId(product.id);
                      setShowDatePicker(true);
                    }}
                    className='w-full border rounded-lg px-3 py-2 cursor-pointer'
                    readOnly
                  />
                  {showDatePicker && activeProductId === product.id && (
                    <DatePicker
                      onSelect={(date) => {
                        updateProduct(product.id, "inceptionDate", date);
                        setShowDatePicker(false);
                      }}
                    />
                  )}
                </div>
                <div className='relative'>
                  <label className='block text-sm font-medium mb-2'>
                    Expiry Date *
                  </label>
                  <input
                    type='text'
                    placeholder='Click to select month'
                    value={
                      product.expiryDate
                        ? `${new Date(product.expiryDate).toLocaleDateString(
                            "en-GB"
                          )}`
                        : ""
                    }
                    onClick={() => {
                      setActiveProductId(product.id);
                      setShowMonthPicker(true);
                    }}
                    className='w-full border rounded-lg px-3 py-2 cursor-pointer'
                    readOnly
                  />
                  {showMonthPicker && activeProductId === product.id && (
                    <MonthPicker
                      onSelect={(date) => {
                        updateProduct(product.id, "expiryDate", date);
                        setShowMonthPicker(false);
                      }}
                    />
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Contract Value *
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Enter contract value (e.g., 600.50)'
                    className='w-full border rounded-lg px-3 py-2'
                    value={product.contractValue}
                    onChange={(e) =>
                      updateProduct(product.id, "contractValue", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Total Project Cost
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Enter total project cost (optional)'
                    className='w-full border rounded-lg px-3 py-2'
                    value={product.totalProjectCost}
                    onChange={(e) =>
                      updateProduct(
                        product.id,
                        "totalProjectCost",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type='button'
            onClick={addProduct}
            className='text-blue-600 flex items-center gap-2 text-sm font-medium hover:text-blue-700'>
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Compliance and Submission */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>
            Compliance and Submission
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Retrofit Assessor
              </label>
              <button
                type='button'
                onClick={() => setShowRetrofitAssessor(!showRetrofitAssessor)}
                className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>{formData.retrofitAssessor || "Select"}</span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={dropdownOptions}
                selected={formData.retrofitAssessor}
                onSelect={(option) =>
                  setFormData({ ...formData, retrofitAssessor: option })
                }
                show={showRetrofitAssessor}
                onClose={() => setShowRetrofitAssessor(false)}
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Retrofit Coordinator
              </label>
              <button
                type='button'
                onClick={() =>
                  setShowRetrofitCoordinator(!showRetrofitCoordinator)
                }
                className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>
                  {formData.retrofitCoordinator || "Select your cover option"}
                </span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={dropdownOptions}
                selected={formData.retrofitCoordinator}
                onSelect={(option) =>
                  setFormData({ ...formData, retrofitCoordinator: option })
                }
                show={showRetrofitCoordinator}
                onClose={() => setShowRetrofitCoordinator(false)}
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Funding Partner
              </label>
              <button
                type='button'
                onClick={() => setShowFundingPartner(!showFundingPartner)}
                className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>{formData.fundingPartner || "Select"}</span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={dropdownOptions}
                selected={formData.fundingPartner}
                onSelect={(option) =>
                  setFormData({ ...formData, fundingPartner: option })
                }
                show={showFundingPartner}
                onClose={() => setShowFundingPartner(false)}
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Scheme Provider
              </label>
              <button
                type='button'
                onClick={() => setShowSchemeProvider(!showSchemeProvider)}
                className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>
                  {formData.schemeProvider || "Select your cover option"}
                </span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={dropdownOptions}
                selected={formData.schemeProvider}
                onSelect={(option) =>
                  setFormData({ ...formData, schemeProvider: option })
                }
                show={showSchemeProvider}
                onClose={() => setShowSchemeProvider(false)}
              />
            </div>
            <div className='relative md:col-span-1 dropdown-container'>
              <label className='block text-sm font-medium mb-2'>ABS</label>
              <button
                type='button'
                onClick={() => setShowABS(!showABS)}
                className='w-full border rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>{formData.abs || "Select"}</span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={dropdownOptions}
                selected={formData.abs}
                onSelect={(option) => setFormData({ ...formData, abs: option })}
                show={showABS}
                onClose={() => setShowABS(false)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-6 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50'
            disabled={loading}>
            Cancel
          </button>
          <button
            type='submit'
            className='px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className='animate-spin' />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
