import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minLength: 8, // minimum number of characters
      maxLength: 15, // maximum number of characters
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // For initial approval by admin
    },
    isSuspended: {
      type: Boolean,
      default: false, // field for suspension
    },
    suspensionReason: {
      type: String,
      default: "",
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "contractor"],
      default: "contractor",
    },

    roles: {
      type: [String],
      default: ["contractor"],
    },
    officeAddress: String,
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    allowedProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    policyNoPrefix: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
      maxlength: 10,
      minlength: 3,
    },

    lastCertificateSequence: {
      type: Number,
      default: 0,
    },

    isPrefixLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
