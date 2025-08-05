import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accountSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
    },
    accountNumber: {
      type: String,
      unique: true,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "dummy"],
      default: "savings",
      required: true
    },
    cardType: {
      type: String,
      enum: ["visa", "mastercard"],
    },
    hasOtp: {
      type: Boolean,
      default: false
    },
    otpCode: {
      type: String,
      default: ""
    },
    balance: {
      type: Number,
      default: 0.0,
      set: (value) => parseFloat(value.toFixed(2)), // Initial balance
    },
    pin: {
      type: String,
      default: ""
    },
    bank: {
      type: String,
      default: "ConnectTrans Bank",
    },
    currency: {
      type: String,
      default: "NGN", // Nigerian Naira by default
    },
    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
    hasCard: {
      type: Boolean,
      default: false,
    },
    token: {
      type: Number,
    },
    beneficiaries: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Account", // Link to saved users
      }
    ],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction", // Links to multiple accounts
      },
    ],
    pin: {
      type: String,
      required: true
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);

const Account = model("Account", accountSchema);

export default Account;
