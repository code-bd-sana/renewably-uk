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
    passwordHash: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // User CANNOT login if it's false
    },
    role: {
      type: String,
      enum: ["admin", "contractor"],
      default: "contractor",
    },
    companyName: String,
    officeAddress: String,
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // create createdAt & updatedAt
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
