import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema(
  {
    // Basic info
    // policyNumber: {
    //   type: String,
    //   default: function () {
    //     const year = new Date().getFullYear().toString().slice(-2);
    //     const random = Math.floor(Math.random() * 1000000)
    //       .toString()
    //       .padStart(6, "0");
    //     return `${year}${random}`;
    //   },
    // },

    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Contractor Details
    contractorName: {
      type: String,
      required: true,
    },
    contractorAddress: {
      type: String,
      default: "Not provided",
    },
    document: String,

    // Policy Holder Details
    policyHolderName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
    },

    // Products Array
    products: [
      {
        productType: {
          type: String,
          required: true,
        },
        coverOption: {
          type: String,
          default: "Insurance Backed Guarantee",
        },
        inceptionDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
          required: true,
        },
        contractValue: {
          type: Number,
          required: true,
        },
        totalProjectCost: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          required: false,
          default: 0,
        },
      },
    ],

    // Compliance and Submission
    retrofitAssessor: String,
    retrofitCoordinator: String,
    fundingPartner: String,
    schemeProvider: String,
    abs: String,

    // Status
    status: {
      type: String,
      enum: ["active", "pending_edit", "pending_cancel", "cancelled"],
      default: "active",
    },
    requestData: {
      type: {
        type: String,
        enum: ["edit", "cancel"],
      },
      changes: Object, // or mongoose.Schema.Types.Mixed
      reason: String,
      requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      requestedAt: Date,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

insuranceSchema.virtual("policyNo").get(function () {
  return this.policyNumber;
});

// userId for faster queries
insuranceSchema.index({ userId: 1 });
insuranceSchema.index({ status: 1 });
insuranceSchema.index({ createdAt: -1 });

export default mongoose.models.Insurance ||
  mongoose.model("Insurance", insuranceSchema);

// import mongoose from "mongoose";

// const insuranceSchema = new mongoose.Schema(
//   {
//     // Basic info
//     policyNumber: {
//       type: String,
//       default: function () {
//         const year = new Date().getFullYear().toString().slice(-2);
//         const random = Math.floor(Math.random() * 1000000)
//           .toString()
//           .padStart(6, "0");
//         return `${year}${random}`;
//       },
//     },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Contractor Details
//     contractorName: {
//       type: String,
//       required: true,
//     },
//     contractorAddress: {
//       type: String,
//       default: "Not provided",
//     },
//     document: String,

//     // Policy Holder Details
//     policyHolderName: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     phone: {
//       type: String,
//       required: true,
//     },
//     address: {
//       type: String,
//       required: true,
//     },
//     country: {
//       type: String,
//       required: true,
//     },
//     postcode: {
//       type: String,
//       required: true,
//     },

//     // Products Array
//     products: [
//       {
//         productType: {
//           type: String,
//           required: true,
//         },
//         coverOption: {
//           type: String,
//           default: "Insurance Backed Guarantee",
//         },
//         inceptionDate: {
//           type: Date,
//           required: true,
//         },
//         expiryDate: {
//           type: Date,
//           required: true,
//         },
//         contractValue: {
//           type: Number,
//           required: true,
//         },
//         totalProjectCost: {
//           type: Number,
//           default: 0,
//         },
//         price: {
//           type: Number,
//           required: false,
//           default: 0,
//         },
//       },
//     ],

//     // Compliance and Submission
//     retrofitAssessor: String,
//     retrofitCoordinator: String,
//     fundingPartner: String,
//     schemeProvider: String,
//     abs: String,

//     // Status
//     status: {
//       type: String,
//       enum: ["active", "pending_edit", "pending_cancel", "cancelled"],
//       default: "active",
//     },
//     requestData: {
//       type: {
//         type: String,
//         enum: ["edit", "cancel"],
//       },
//       changes: Object, // or mongoose.Schema.Types.Mixed
//       reason: String,
//       requestedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       requestedAt: Date,
//       status: {
//         type: String,
//         enum: ["pending", "approved", "rejected"],
//         default: "pending",
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.models.Insurance ||
//   mongoose.model("Insurance", insuranceSchema);
