"use client";

import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function RolesModal({
  showRolesModal,
  editingContractor,
  setEditingContractor,
  closeRolesModal,
  fetchContractors,
}) {
  if (!showRolesModal || !editingContractor) return null;

  const handleSaveRoles = async () => {
    try {
      const res = await fetch(`/api/admin/contractor/${editingContractor.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roles: editingContractor.roles,
        }),
      });

      const result = await res.json();

      if (result.success) {
        await fetchContractors();
        toast.success("Roles updated successfully");
        closeRolesModal();
      } else {
        alert(result.error || "Failed to update roles");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const rolesList = [
    {
      value: "retrofit_assessor",
      label: "Retrofit Assessor",
    },
    {
      value: "retrofit_coordinator",
      label: "Retrofit Coordinator",
    },
    {
      value: "funding_partner",
      label: "Funding Partner",
    },
    {
      value: "scheme_provider",
      label: "Scheme Provider",
    },
  ];

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-bold text-gray-900'>
            Edit Roles – {editingContractor.name}
          </h3>
          <button
            onClick={closeRolesModal}
            className='text-gray-500 hover:text-gray-700'>
            <X size={24} />
          </button>
        </div>

        <div className='space-y-4'>
          {rolesList.map((role) => (
            <label key={role.value} className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={editingContractor.roles?.includes(role.value) || false}
                onChange={(e) => {
                  const newRoles = e.target.checked
                    ? [
                        ...new Set([
                          ...(editingContractor.roles || []),
                          role.value,
                        ]),
                      ]
                    : (editingContractor.roles || []).filter(
                        (r) => r !== role.value,
                      );

                  setEditingContractor((prev) => ({
                    ...prev,
                    roles: newRoles,
                  }));
                }}
                className='h-5 w-5 text-blue-600 rounded'
              />
              <span>{role.label}</span>
            </label>
          ))}
        </div>

        <div className='flex justify-end gap-4 mt-8'>
          <button
            onClick={closeRolesModal}
            className='px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'>
            Cancel
          </button>
          <button
            onClick={handleSaveRoles}
            className='px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors'>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
