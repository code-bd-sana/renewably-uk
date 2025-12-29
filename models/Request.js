// models/Request.js
import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    // Reference to the insurance policy
    insuranceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Insurance",
      required: true,
    },

    // Reference to the contractor making the request
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Request type (same as your modal)
    requestType: {
      type: String,
      enum: ["edit", "cancel"],
      required: true,
    },

    // Status 
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing"], 
      default: "pending",
    },

    // Fields to change (for edit requests)
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Reason for request (optional)
    reason: {
      type: String,
      default: "",
    },

    // Admin notes (for approval/rejection)
    adminNotes: {
      type: String,
      default: "",
    },

    // Original insurance data (for reference)
    originalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Timestamps (same as User model)
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update updatedAt on save
requestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Request ||
  mongoose.model("Request", requestSchema);
