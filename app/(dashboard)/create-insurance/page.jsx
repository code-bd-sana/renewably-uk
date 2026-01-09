"use client";

import bluedrop from "@/public/shared/bluedrop2.png";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
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
  const [schemeProviders, setSchemeProviders] = useState([]);
  const [activeProductId, setActiveProductId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState({});
  const [showConnectingMessage, setShowConnectingMessage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [absValue, setAbsValue] = useState("");

  const searchInputRef = useRef(null);

  const [formData, setFormData] = useState({
    contractorName: "",
    contractorAddress: "",
    policyHolderName: "",
    email: "",
    phone: "",
    address: "",
    country: "United Kingdom",
    postcode: "",
    products: [
      {
        id: Date.now(),
        productType: "",
        measureType: "",
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
        setProducts(data.products.filter((p) => p.Measures));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemeProviders = async () => {
    try {
      const response = await fetch("/api/admin/scheme-providers");
      const data = await response.json();
      if (data.success) {
        setSchemeProviders(data.providers);
      }
    } catch (error) {
      console.error("Error fetching scheme providers:", error);
    }
  };

  useEffect(() => {
    // Show connecting message for 3 seconds on page load
    setShowConnectingMessage(true);
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setShowConnectingMessage(false);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Fetch data after showing connecting message
    const timer = setTimeout(() => {
      fetchProducts();
      fetchContractorData();
      fetchSchemeProviders();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return products;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return products.filter((product) =>
      product.Measures.toLowerCase().includes(query)
    );
  }, [products, debouncedSearchQuery]);

  // Filter scheme providers by type
  const getFilteredSchemeProviders = (type) => {
    return schemeProviders
      .filter(
        (provider) => 
          provider.providerType?.includes(type) && 
          provider.status === "active"
      )
      .map(provider => ({
        name: provider.companyName,
        address: provider.address,
        phone: provider.phone,
        email: provider.contactEmail
      }));
  };

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
          setContractorData(data.user);
          setFormData((prev) => ({
            ...prev,
            contractorName: data.user.companyName || data.user.name,
            contractorAddress: data.user.officeAddress || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching contractor data:", error);
      toast.error("Failed to load contractor data");
    }
  };

  // Calculate total project cost
  const calculateTotalProjectCost = () => {
    return formData.products.reduce((total, product) => {
      const cost = parseFloat(product.totalProjectCost) || 0;
      return total + cost;
    }, 0);
  };

  // for adding product
  const addProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: Date.now() + Math.random(),
          productType: "",
          measureType: "",
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
    if (!showProductDropdown[productId]) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const selectProductType = (productId, measure) => {
    updateProduct(productId, "productType", measure);
    updateProduct(productId, "measureType", measure);
    setShowProductDropdown((prev) => ({
      ...prev,
      [productId]: false,
    }));
    setSearchQuery("");
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
        setSearchQuery("");
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

  const MonthPicker = ({ onSelect }) => (
    <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-80'>
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
              const monthIndex = index + 1;
              const year = currentMonth.getFullYear();

              const expiryDate = new Date(year, monthIndex, 0);
              const apiDate = `${year}-${String(monthIndex).padStart(
                2,
                "0"
              )}-${String(expiryDate.getDate()).padStart(2, "0")}`;
              const displayDate = `${month} ${year}`;

              setSelectedMonth(displayDate);
              onSelect(apiDate);
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
    <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80'>
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

                const apiDate = `${year}-${month}-${day}`;
                const displayDate = `${day}/${month}/${year}`;

                setSelectedDate(displayDate);
                onSelect(apiDate);
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

  const DropdownMenu = ({ options, selected, onSelect, show, onClose, type }) =>
    show && (
      <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md max-h-96 overflow-y-auto'>
        {/* First show scheme providers from API */}
        {options.filter(opt => typeof opt === 'object').map((provider, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(provider.name);
              onClose();
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col ${
              index === 0 ? "rounded-t-lg" : ""
            } ${selected === provider.name ? "bg-blue-50" : ""}`}>
            <span className="font-medium text-gray-800">{provider.name}</span>
            {provider.address && (
              <span className="text-xs text-gray-500 mt-1">{provider.address}</span>
            )}
            <div className="flex gap-4 mt-1 text-xs text-gray-600">
              {provider.phone && <span>📞 {provider.phone}</span>}
              {provider.email && <span>✉️ {provider.email}</span>}
            </div>
            {selected === provider.name && (
              <Check
                size={18}
                className='absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-blue-600 rounded-full p-0.5'
              />
            )}
          </button>
        ))}

        {/* Separator */}
        {options.filter(opt => typeof opt === 'object').length > 0 && (
          <div className="border-t border-gray-200 my-1"></div>
        )}

        {/* Then show static options */}
        {options.filter(opt => typeof opt === 'string').map((option, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${
              index === 0 && options.filter(opt => typeof opt === 'object').length === 0 
                ? "rounded-t-lg" : ""
            } ${
              index === options.filter(opt => typeof opt === 'string').length - 1
                ? "rounded-b-lg"
                : ""
            } ${selected === option ? "bg-blue-50" : ""}`}>
            <span className={option === "Not Required" ? "font-medium" : ""}>
              {option}
            </span>
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
    const selectedMeasure = currentProduct?.measureType || "";

    return (
      show && (
        <div className='absolute z-50 top-full mt-2 bg-white rounded-lg shadow-lg w-full max-w-md max-h-96 overflow-hidden border border-gray-200'>
          {/* Search Input */}
          <div className='p-3 border-b border-gray-200 bg-gray-50'>
            <div className='relative'>
              <Search
                size={18}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              />
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Search measures...'
                className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
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
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between transition-colors ${
                    index > 0 ? "border-t border-gray-100" : ""
                  } ${selectedMeasure === product.Measures ? "bg-blue-50" : ""}`}>
                  <div>
                    <span className='font-medium text-gray-800'>{product.Measures}</span>
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
                {searchQuery ? "No measures found" : "No measures available"}
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
        const contractValue = parseFloat(product.contractValue);
        if (isNaN(contractValue) || contractValue <= 0) {
          validationErrors.push(
            `Product ${
              index + 1
            }: Please enter a valid contract value (must be a number greater than 0)`
          );
        }

        if (!product.measureType) {
          validationErrors.push(
            `Product ${index + 1}: Measure Type is required`
          );
        }

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

      // Validate ABS field
      if (absValue && isNaN(parseFloat(absValue))) {
        validationErrors.push("ABS must be a valid number");
      }

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

        const price = product.price
          ? parseFloat(product.price)
          : contractValue * 0.05;

        return {
          productType: product.productType,
          measureType: product.measureType,
          coverOption: product.coverOption || "Insurance Backed Guarantee",
          inceptionDate: product.inceptionDate,
          expiryDate: product.expiryDate,
          contractValue: contractValue,
          totalProjectCost: totalProjectCost,
          price: price,
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
        products: processedProducts,
        retrofitAssessor: formData.retrofitAssessor || "",
        retrofitCoordinator: formData.retrofitCoordinator || "",
        fundingPartner: formData.fundingPartner || "",
        schemeProvider: formData.schemeProvider || "",
        abs: absValue || "",
      };

      console.log("Submitting form data:", submissionData);

      // 4. Submit to API
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

      // 5. Success handling
      toast.success("Insurance Backed Guarantee Certificates generated successfully! PDFs have been emailed.", {
        duration: 5000,
        position: "top-right",
      });

      setTimeout(() => {
        router.push("/certificates");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);

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

  // Show connecting message overlay
  if (showConnectingMessage) {
    return (
      <main className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center'>
          <div className='mb-6'>
            <Image src={bluedrop} height={150} width={192} alt="logo" className="mx-auto flex justify-center"/>
            <h1 className='text-2xl font-bold text-gray-800 mb-2'>
              Connecting to Bluedrop Services
            </h1>
            <p className='text-gray-600'>
              Please wait while we connect you to our services...
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className='mb-4'>
            <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
              <div 
                className='bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Connecting...</span>
              <span>{progress}%</span>
            </div>
          </div>

          <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
            <Loader2 size={16} className='animate-spin' />
            <span>Establishing secure connection</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 sans lg:p-6 max-w-455 mx-auto'>
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
        <div className='mb-6 px-4 mt-4'>
          <Image src={bluedrop} height={150} width={192} alt="logo"/>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 border-gray-200 border border-gray-200-red-200 text-red-700 rounded-lg'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Contractor Details */}
        <div className='bg-white border border-gray-200 rounded-lg  p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Contractor Details</h2>
          <div className='grid grid-cols-1  md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Contractor Name
              </label>
              <input
                type='text'
                value={formData.contractorName || "Loading..."}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50'
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
                className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50'
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Policy Holder Details */}
        <div className='bg-white rounded-lg border border-gray-200  p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Policy Holder Details</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>Name *</label>
              <input
                type='text'
                placeholder='Enter Policy Holder name'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
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
                placeholder='Enter Policy Holder email address'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
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
                placeholder='Enter Policy Holder phone number'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
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
                placeholder='Enter Policy Holder address'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
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
                className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50'
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                disabled
                required>
                <option value='United Kingdom'>United Kingdom</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Postcode *
              </label>
              <input
                type='text'
                placeholder='Enter Policy Holder postcode (e.g., LL31 9FF)'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
                value={formData.postcode}
                onChange={(e) =>
                  setFormData({ ...formData, postcode: e.target.value })
                }
                pattern="[A-Za-z0-9 ]{5,8}"
                title="Enter a valid UK postcode (e.g., LL31 9FF)"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Product Details</h2>

          {formData.products.map((product, index) => (
            <div key={product.id} className='mb-6 py-4 rounded-lg'>
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
                    Measure Type *
                  </label>
                  <button
                    type='button'
                    onClick={() => toggleProductDropdown(product.id)}
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center justify-between hover:border-blue-400 transition-colors'>
                    <span
                      className={
                        product.measureType ? "text-gray-900" : "text-gray-400"
                      }>
                      {product.measureType || "Select measure type"}
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
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50'
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
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 cursor-pointer'
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
                    className='w-full border border-gray-200 rounded-lg px-3 py-2 cursor-pointer'
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
                    className='w-full border border-gray-200 rounded-lg px-3 py-2'
                    value={product.contractValue}
                    onChange={(e) =>
                      updateProduct(product.id, "contractValue", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Project Cost
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='Enter project cost (optional)'
                    className='w-full border border-gray-200 rounded-lg px-3 py-2'
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

                {/* Show Total Project Cost only on last product */}
                {index === formData.products.length - 1 && (
                  <div className='md:col-span-2 pt-4 border-t border-gray-200'>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium text-gray-700'>Total Project Cost:</span>
                      <span className='text-lg font-bold text-blue-600'>
                        £{calculateTotalProjectCost().toFixed(2)}
                      </span>
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                      Total of all selected products
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type='button'
            onClick={addProduct}
            className='text-[#0F47A8] ml-auto flex items-center gap-2 text-sm font-medium hover:text-blue-700 mt-4'>
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Compliance and Submission */}
        <div className='bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>
            Compliance and Submission
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Retrofit Assessor *
              </label>
              <button
                type='button'
                onClick={() => setShowRetrofitAssessor(!showRetrofitAssessor)}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>{formData.retrofitAssessor || "Select"}</span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={[...getFilteredSchemeProviders("Retrofit Assessor"), ...dropdownOptions]}
                selected={formData.retrofitAssessor}
                onSelect={(option) =>
                  setFormData({ ...formData, retrofitAssessor: option })
                }
                show={showRetrofitAssessor}
                onClose={() => setShowRetrofitAssessor(false)}
                type="Retrofit Assessor"
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Retrofit Coordinator *
              </label>
              <button
                type='button'
                onClick={() =>
                  setShowRetrofitCoordinator(!showRetrofitCoordinator)
                }
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>
                  {formData.retrofitCoordinator || "Select your cover option"}
                </span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={[...getFilteredSchemeProviders("Retrofit Coordinator"), ...dropdownOptions]}
                selected={formData.retrofitCoordinator}
                onSelect={(option) =>
                  setFormData({ ...formData, retrofitCoordinator: option })
                }
                show={showRetrofitCoordinator}
                onClose={() => setShowRetrofitCoordinator(false)}
                type="Retrofit Coordinator"
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Funding Partner *
              </label>
              <button
                type='button'
                onClick={() => setShowFundingPartner(!showFundingPartner)}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>{formData.fundingPartner || "Select"}</span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={[...getFilteredSchemeProviders("Funding Partner"), ...dropdownOptions]}
                selected={formData.fundingPartner}
                onSelect={(option) =>
                  setFormData({ ...formData, fundingPartner: option })
                }
                show={showFundingPartner}
                onClose={() => setShowFundingPartner(false)}
                type="Funding Partner"
              />
            </div>
            <div className='relative dropdown-container'>
              <label className='block text-sm font-medium mb-2'>
                Scheme Provider *
              </label>
              <button
                type='button'
                onClick={() => setShowSchemeProvider(!showSchemeProvider)}
                className='w-full border border-gray-200 rounded-lg px-3 py-2 text-left flex items-center justify-between'>
                <span>
                  {formData.schemeProvider || "Select your cover option"}
                </span>
                <ChevronRight size={18} />
              </button>
              <DropdownMenu
                options={[...getFilteredSchemeProviders("Scheme Provider"), ...dropdownOptions]}
                selected={formData.schemeProvider}
                onSelect={(option) =>
                  setFormData({ ...formData, schemeProvider: option })
                }
                show={showSchemeProvider}
                onClose={() => setShowSchemeProvider(false)}
                type="Scheme Provider"
              />
            </div>
            <div className='relative md:col-span-1'>
              <label className='block text-sm font-medium mb-2'>ABS</label>
              <input
                type='text'
                placeholder='Enter ABS number (e.g., 1000)'
                className='w-full border border-gray-200 rounded-lg px-3 py-2'
                value={absValue}
                onChange={(e) => setAbsValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-4'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-6 py-2 cursor-pointer border-gray-200 bg-[#FEE2E2] text-red-500 border border-gray-200-red-300 rounded-lg hover:bg-red-50'
            disabled={loading}>
            Cancel
          </button>
          <button
            type='submit'
            className='px-6 py-2 bg-[#DCFCE7] text-[#16A34A]  rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className='animate-spin' />
                Generating...
              </>
            ) : (
              "Generate Insurance Backed Guarantee Certificates"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}