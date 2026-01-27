import { useState } from "react";
import {
  Download,
  ChevronDown,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const CertificateActionsDropdown = ({
  requestId,
  requestData,
  onApprove,
  showPending,
  onReject,
  onDelete,
  onDownload,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);

    // Detect if this is a NEW CONTRACTOR REQUEST
    // (we want NO toast/confirmation here — list already handles it)
    const isContractorRequest = requestData?.type === "user_request";

    switch (action) {
      case "approve":
        if (isContractorRequest) {
          // Contractor request → direct call (no toast here)
          onApprove();
        } else {
          // Policy request → show nice custom toast confirmation
          toast.custom((t) => (
            <div className='bg-white p-4 rounded-lg shadow-lg border max-w-sm w-full'>
              <p className='font-medium text-gray-900'>Approve this request?</p>
              <div className='flex gap-2 mt-3'>
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    const loading = toast.loading("Approving request...");
                    try {
                      await onApprove(); // this will run your handleApproveRequest
                      // toast.success("Approved!", { id: loading });
                    } catch {
                      toast.error("Failed to approve", { id: loading });
                    }
                  }}
                  className='flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700'>
                  Yes
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className='flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300'>
                  No
                </button>
              </div>
            </div>
          ));
        }
        break;

      case "reject":
        if (isContractorRequest) {
          // Contractor request → direct call (no toast here)
          onReject();
        } else {
          // Policy request → show nice custom toast confirmation
          toast.custom((t) => (
            <div className='bg-white p-4 rounded-lg shadow-lg border max-w-sm w-full'>
              <p className='font-medium text-gray-900'>Decline this request?</p>
              <div className='flex gap-2 mt-3'>
                <button
                  onClick={async () => {
                    toast.dismiss(t.id);
                    const loading = toast.loading("Declining request...");
                    try {
                      await onReject(); // this will run your handleRejectRequest
                      // toast.success("Declined!", { id: loading });
                    } catch {
                      toast.error("Failed to decline", { id: loading });
                    }
                  }}
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700'>
                  Yes
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className='flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300'>
                  No
                </button>
              </div>
            </div>
          ));
        }
        break;

      case "delete":
        // Always keep confirm for delete (safety for both types)
        const certDetails = requestData
          ? `Policy ${requestData.policyNumber} - ${requestData.policyHolderName}`
          : `Certificate ${requestId}`;
        if (
          confirm(`Are you sure you want to PERMANENTLY delete ${certDetails}?`)
        ) {
          onDelete(requestId);
        }
        break;

      case "pending":
        break;
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Download Button - Only show if onDownload exists */}
      {onDownload && (
        <button
          onClick={() => onDownload(requestId)}
          className='p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors'
          title='Download Certificate PDF'>
          <Download size={18} />
        </button>
      )}

      {/* Action Dropdown */}
      <div className='relative'>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors'>
          Actions
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Click outside to close */}
            <div
              className='fixed inset-0 z-40'
              onClick={() => setIsOpen(false)}
            />

            <div className='absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50'>
              {showPending && (
                <button
                  onClick={() => handleAction("pending")}
                  className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2'>
                  Pending
                </button>
              )}
              {/* Approve Option - Only show if onApprove exists */}
              {onApprove && (
                <button
                  onClick={() => handleAction("approve")}
                  className='w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2'>
                  Approve
                </button>
              )}

              {/* Decline/Reject Option - Only show if onReject exists */}
              {onReject && (
                <button
                  onClick={() => handleAction("reject")}
                  className='w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2'>
                  Decline
                </button>
              )}

              {/* Delete Option - Only show if onDelete exists */}
              {onDelete && (
                <>
                  <div className='border-t border-gray-100 my-1' />
                  <button
                    onClick={() => handleAction("delete")}
                    className='w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium'>
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateActionsDropdown;
