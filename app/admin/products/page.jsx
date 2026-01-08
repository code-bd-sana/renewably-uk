"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Eye,
} from "lucide-react";
import Image from "next/image";

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    Measures: "",
    Year: "",
    Month: "",
    Days: "",
    "Price Contract Value <£10,000": "",
    "Price Contract Value <£15,000": "",
    "Price Contract Value <£30,000": "",
    "Price Contract Value <£50,000": "",
    "Transaction Type": "",
  });

  // Fetch products from database
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate insurance period
  const calculateTimePeriod = (years, months, days) => {
    const yearNum = parseInt(years) || 0;
    const monthNum = parseInt(months) || 0;
    const dayNum = parseInt(days) || 0;

    const parts = [];
    if (yearNum > 0) parts.push(`${yearNum} Year${yearNum !== 1 ? "s" : ""}`);
    if (monthNum > 0)
      parts.push(`${monthNum} Month${monthNum !== 1 ? "s" : ""}`);
    if (dayNum > 0) parts.push(`${dayNum} Day${dayNum !== 1 ? "s" : ""}`);

    if (parts.length === 0) return "N/A";
    return parts.join(" ");
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save product
  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      // if (!formData.Measures || !formData["Approved Measures"]) {
      //   alert("Please fill in required fields: Measures and Approved Measures");
      //   return;
      // }
      // Convert numeric fields
      const dataToSend = {
        ...formData,
        Year: parseInt(formData.Year) || 0,
        Month: parseInt(formData.Month) || 0,
        Days: parseInt(formData.Days) || 0,
        "Transaction Type":
          formData["Transaction Type"] || "Insurance Backed Guarantee",
      };

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.success) {
        await fetchProducts(); // Refresh the list
        resetForm();
        alert(
          editingId
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
      } else {
        alert("Error: " + (data.error || "Failed to save product"));
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    console.log("Delete clicked, ID:", id);

    if (!id) {
      console.error("No ID provided for deletion");
      alert("Error: No product ID found");
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      console.log("Sending DELETE request for ID:", id);
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        // Remove from state using _id (MongoDB field)
        setProducts((prev) => prev.filter((product) => product._id !== id));
        alert("Product deleted successfully!");
      } else {
        alert("Error: " + (data.error || "Failed to delete product"));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Check console for details.");
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // Edit product
  const handleEditProduct = (product) => {
    setFormData({
      Measures: product.Measures || "",
      Year: product.Year || "",
      Month: product.Month || "",
      Days: product.Days || "",
      "Price Contract Value <£10,000":
        product["Price Contract Value <£10,000"] || "",
      "Price Contract Value <£15,000":
        product["Price Contract Value <£15,000"] || "",
      "Price Contract Value <£30,000":
        product["Price Contract Value <£30,000"] || "",
      "Price Contract Value <£50,000":
        product["Price Contract Value <£50,000"] || "",
      "Transaction Type":
        product["Transaction Type"] || "Insurance Backed Guarantee", // Default value
      "Approved Measures": product["Approved Measures"] || "",
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      Measures: "",
      Year: "",
      Month: "",
      Days: "",
      "Price Contract Value <£10,000": "",
      "Price Contract Value <£15,000": "",
      "Price Contract Value <£30,000": "",
      "Price Contract Value <£50,000": "",
      "Transaction Type": "Insurance Backed Guarantee", // Set default

    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.Measures?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product["Approved Measures"]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Price columns
  const priceColumns = [
    "Price Contract Value <£10,000",
    "Price Contract Value <£15,000",
    "Price Contract Value <£30,000",
    "Price Contract Value <£50,000",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className=" mx-auto">
        <Image
          src="/bluedrop.png"
          height={200}
          width={200}
          alt="Renewably UK"
          className="h-auto w-auto my-2"
        />
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Insurance Product List
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Mobile Search - Full Width */}
            <div className="md:hidden relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 md:py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <Image
          src="/bluedrop.png"
          height={200}
          width={200}
          alt="Renewably UK"
          className="h-auto w-auto my-2"
        />
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {editingId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={resetForm}
                      className="text-gray-600 hover:text-gray-900"
                      title="Close"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Product Type - Full Width */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type *
                    </label>
                    <input
                      type="text"
                      name="Measures"
                      value={formData.Measures}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Air Source Heat Pump"
                      required
                    />
                  </div>

                  {/* Approved Measures - Full Width */}
                  {/* <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved Measures *
                    </label>
                    <input
                      type="text"
                      name="Approved Measures"
                      value={formData["Approved Measures"]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Air Source Heat Pump"
                      required
                    />
                  </div> */}

                  {/* Cover Option (Insurance Coverage) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Coverage *
                    </label>
                    <select
                      name="Transaction Type"
                      value={formData["Transaction Type"]}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">Select cover option</option>
                      <option value="Insurance Backed Guarantee">
                        Insurance Backed Guarantee
                      </option>
                    </select>
                  </div>

                  {/* Insurance Time Period */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Time Period *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          name="Year"
                          value={formData.Year}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Years"
                          min="0"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="Month"
                          value={formData.Month}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Months"
                          min="0"
                          max="11"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="Days"
                          value={formData.Days}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Days"
                          min="0"
                          max="30"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Contract Values */}
                  {priceColumns.map((column) => (
                    <div key={column}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {column}
                      </label>
                      <input
                        type="text"
                        name={column}
                        value={formData[column]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="£0.00"
                      />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingId ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white text-base rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="text-gray-600 hover:text-gray-900 text-2xl p-2"
                      title="Back"
                    >
                      ≫
                    </button>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
<Image
          src="/bluedrop.png"
          height={200}
          width={200}
          alt="Renewably UK"
          className="h-auto w-auto my-2"
        />
                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                      {selectedProduct.Measures}
                    </h1>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditProduct(selectedProduct);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                        title="Edit"
                      >
                        <Edit2 className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleDeleteProduct(selectedProduct._id);
                        }}
                        className="text-red-600 hover:text-red-800 transition-colors p-2"
                        title="Delete"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Info Rows */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="text-base font-medium text-gray-700">
                        Insurance Time Period
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {calculateTimePeriod(
                          selectedProduct.Year,
                          selectedProduct.Month,
                          selectedProduct.Days
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="text-base font-medium text-gray-700">
                        Insurance Coverage
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {selectedProduct["Transaction Type"] ||
                          "Insurance Backed Guarantee"}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="text-base font-medium text-gray-700">
                        Price Contract Value &lt;£10,000
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {selectedProduct["Price Contract Value <£10,000"] ||
                          "N/A"}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="text-base font-medium text-gray-700">
                        Price Contract Value &lt;£15,000
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {selectedProduct["Price Contract Value <£15,000"] ||
                          "N/A"}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-200">
                      <div className="text-base font-medium text-gray-700">
                        Price Contract Value &lt;£30,000
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {selectedProduct["Price Contract Value <£30,000"] ||
                          "N/A"}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-4">
                      <div className="text-base font-medium text-gray-700">
                        Price Contract Value &lt;£50,000
                      </div>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                        {selectedProduct["Price Contract Value <£50,000"] ||
                          "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {/* <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-base font-medium text-blue-800 mb-2">
                      Approved Measures
                    </h3>
                    <p className="text-blue-700">
                      {selectedProduct["Approved Measures"]}
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Product Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Insurance Time Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Insurance Coverage
                  </th>
                  {priceColumns.map((price, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                    >
                      {price}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={priceColumns.length + 4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (
                    <tr
                      key={`${product._id}-${product.Measures}-${product.Year}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.Measures}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {calculateTimePeriod(
                          product.Year,
                          product.Month,
                          product.Days
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product["Transaction Type"] ||
                          "Insurance Backed Guarantee"}
                      </td>
                      {priceColumns.map((column, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-4 text-sm text-gray-600"
                        >
                          {product[column] || "N/A"}
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-green-600 hover:text-green-800 transition-colors p-1"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id || product.id)
                            }
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Product Cards */}
        <div className="md:hidden space-y-4">
          {currentProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              No products found
            </div>
          ) : (
            currentProducts.map((product) => (
              <div
                key={`${product._id}-mobile-${product.Measures}`}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {product.Measures}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {product["Approved Measures"]}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-green-600 hover:text-green-800 transition-colors p-2 bg-green-50 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProduct(product._id || product.id)
                      }
                      className="text-red-600 hover:text-red-800 transition-colors p-2 bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Time Period:</span>
                    <span>
                      {calculateTimePeriod(
                        product.Year,
                        product.Month,
                        product.Days
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Insurance Coverage:</span>
                    <span>
                      {product["Transaction Type"] ||
                        "Insurance Backed Guarantee"}
                    </span>
                  </div>

                  {/* Price Columns - Stacked for mobile */}
                  {priceColumns.map((column, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-t border-gray-100 pt-2"
                    >
                      <span className="text-xs font-medium">
                        {column.split(" ").slice(-2).join(" ")}:
                      </span>
                      <span>{product[column] || "N/A"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  if (i === 3 && currentPage < totalPages - 3) {
                    return (
                      <span key="ellipsis" className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  if (i === 4 && currentPage < totalPages - 2) {
                    return (
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
