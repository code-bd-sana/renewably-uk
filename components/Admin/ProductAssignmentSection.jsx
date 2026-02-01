"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Loader2, Check, X } from "lucide-react";

export default function ProductAssignmentSection({
  selectedProductIds,
  setSelectedProductIds,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/products");
        const data = await response.json();
        if (data.success) {
          // Filter products that have Measures (as per your earlier code)
          const filtered = data.products.filter((p) => p.Measures);
          setProducts(filtered);
        } else {
          toast.error("Failed to load products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    // Search in Measures or Approved Measures (adjust fields as needed)
    return (
      product.Measures?.toLowerCase()?.includes(searchLower) ||
      product["Approved Measures"]?.toLowerCase()?.includes(searchLower)
    );
  });

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  return (
    <div className='mb-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-3'>
        Assign Insurance Products Access
      </h3>

      {/* Search input */}
      <div className='relative mb-4'>
        <Search
          className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          size={18}
        />
        <input
          type='text'
          placeholder='Search products by measure...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Product list */}
      {loading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className='text-gray-500 text-center py-6'>
          {searchTerm
            ? "No products match your search"
            : "No products available"}
        </p>
      ) : (
        <div className='max-h-64 overflow-y-auto border border-gray-200 rounded-lg'>
          {filteredProducts.map((product) => {
            const isSelected = selectedProductIds.includes(
              product._id.toString(),
            );
            const displayName =
              product.Measures ||
              product["Approved Measures"] ||
              "Unnamed Product";

            return (
              <div
                key={product._id}
                onClick={() => toggleProduct(product._id.toString())}
                className={`flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50" : ""
                }`}>
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300"
                  }`}>
                  {isSelected && <Check size={14} className='text-white' />}
                </div>

                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>{displayName}</p>
                  {product["Transaction Type"] && (
                    <p className='text-xs text-gray-500'>
                      {product["Transaction Type"]}
                    </p>
                  )}
                </div>

                {product["Price Contract Value <£10,000"] && (
                  <div className='text-right text-sm text-gray-600'>
                    From £{product["Price Contract Value <£10,000"]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className='text-sm text-gray-500 mt-2'>
        Selected: {selectedProductIds.length} product
        {selectedProductIds.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
