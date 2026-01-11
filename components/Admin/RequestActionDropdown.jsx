import { useState } from "react";
import {
  Download,
  ChevronDown,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

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

    switch (action) {
      case "approve":
        if (confirm("Approve this request?")) {
          onApprove(requestId);
        }
        break;

      case "reject":
        if (confirm("Decline this request?")) {
          onReject(requestId);
        }
        break;

      case "delete":
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
        // Do nothing - just keep as pending
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Download Button - Only show if onDownload exists */}
      {onDownload && (
        <button
          onClick={() => onDownload(requestId)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Download Certificate PDF"
        >
          <Download size={18} />
        </button>
      )}

      {/* Action Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
        >
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
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
              {showPending && (
                <button
                  onClick={() => handleAction("pending")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  Pending
                </button>
              )}
              {/* Approve Option - Only show if onApprove exists */}
              {onApprove && (
                <button
                  onClick={() => handleAction("approve")}
                  className="w-full text-left px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                >
                  Approve
                </button>
              )}

              {/* Decline/Reject Option - Only show if onReject exists */}
              {onReject && (
                <button
                  onClick={() => handleAction("reject")}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                >
                  Decline
                </button>
              )}

              {/* Delete Option - Only show if onDelete exists */}
              {onDelete && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => handleAction("delete")}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
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
