"use client";

import { PauseCircle, PlayCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function SuspendModal({
  showSuspendModal,
  selectedContractorForAction,
  actionType,
  suspendReason,
  setSuspendReason,
  handleSuspendAction,
  setShowSuspendModal,
  setSelectedContractorForAction,
  actionLoading,
}) {
  const [localReason, setLocalReason] = useState(suspendReason);

  // Update local reason when modal opens
  useEffect(() => {
    setLocalReason(suspendReason);
  }, [suspendReason]);

  if (!showSuspendModal) return null;

  const handleSubmit = () => {
    setSuspendReason(localReason);
    handleSuspendAction(
      selectedContractorForAction.id,
      actionType === "suspend",
      localReason,
    );
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div
              className={`p-2 rounded-full ${
                actionType === "suspend"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-green-100 text-green-600"
              }`}>
              {actionType === "suspend" ? (
                <PauseCircle className='w-6 h-6' />
              ) : (
                <PlayCircle className='w-6 h-6' />
              )}
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>
                {actionType === "suspend" ? "Suspend User" : "Unsuspend User"}
              </h3>
              <p className='text-sm text-gray-600'>
                {selectedContractorForAction?.name} •{" "}
                {selectedContractorForAction?.companyName}
              </p>
            </div>
          </div>

          <p className='text-gray-600 mb-4'>
            {actionType === "suspend"
              ? `User will be blocked from logging in until unsuspended.`
              : `User will regain access to their account immediately.`}
          </p>

          {actionType === "suspend" && (
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Reason for suspension (optional):
              </label>
              <textarea
                value={localReason}
                onChange={(e) => setLocalReason(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none'
                rows='3'
                placeholder='Enter reason for suspension...'
              />
              <p className='text-xs text-gray-500 mt-1'>
                This message will be shown to the user when they try to log in.
              </p>
            </div>
          )}

          <div className='flex justify-end gap-3 mt-6'>
            <button
              onClick={() => {
                setShowSuspendModal(false);
                setSuspendReason("");
                setSelectedContractorForAction(null);
              }}
              className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium'
              disabled={actionLoading}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                actionType === "suspend"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className='w-5 h-5 animate-spin mx-auto' />
              ) : actionType === "suspend" ? (
                "Suspend User"
              ) : (
                "Unsuspend User"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
