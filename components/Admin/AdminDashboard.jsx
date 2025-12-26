"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Download,
  Users,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    premiumTotal: 0,
    thisMonthPolicies: 0,
    totalContractors: 0,
    editRequests: 0,
  });

  // Check if user is admin AND fetch data
  const checkAdminAndLoadData = useCallback(async () => {
    try {
      // FIRST: Check if user is admin using the main admin endpoint
      const adminCheck = await fetch("/api/admin");

      if (adminCheck.status === 403) {
        router.push("/login");
        return;
      }

      if (!adminCheck.ok) {
        throw new Error("Admin check failed");
      }

      // User is admin, now fetch pending users AND stats in parallel
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/contractor?status=pending"),
        fetch("/api/admin?action=get-stats"),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (usersData.success) {
        setPendingUsers(usersData.users);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  const handleApprove = async (userId) => {
    try {
      // Use the specific approve endpoint
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove approved user from list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalContractors: prev.totalContractors + 1,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleReject = async (userId) => {
    try {
      // Use the specific reject endpoint
      const res = await fetch("/api/admin/reject-user", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        // Remove rejected user from list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));

        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingApprovals: prev.pendingApprovals - 1,
        }));
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-12 md:mt-0">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-700 to-blue-600 text-white p-8 rounded-lg mb-6">
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          Welcome Back, Admin 👋
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">Total Policies</div>
            <div className="bg-blue-50 p-2 rounded">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalPolicies}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">Premium Total</div>
            <div className="bg-green-50 p-2 rounded">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            £
            {stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">This Month Policies</div>
            <div className="bg-purple-50 p-2 rounded">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.thisMonthPolicies}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">Total Contractors</div>
            <div className="bg-orange-50 p-2 rounded">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.totalContractors}
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            New Contractor Request ({pendingUsers.length})
          </h2>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No pending approvals
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Apply Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Contractor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <tr key={user.id || user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-50 text-green-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-green-100 transition-colors"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="bg-red-50 text-red-600 px-4 py-1.5 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">Months Premium Total</div>
            <div className="bg-blue-50 p-2 rounded">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            £
            {stats.premiumTotal.toLocaleString("en-GB", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-600 text-sm">Edit Request Pending</div>
            <div className="bg-yellow-50 p-2 rounded">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.editRequests}
          </div>
        </div>
      </div>
    </div>
  );
}
