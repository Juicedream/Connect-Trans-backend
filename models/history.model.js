import mongoose from "mongoose";

const { Schema, model } = mongoose;

const historySchema = new Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String, // Store city/country where transaction happened
    },
    ipAddress: {
      type: String, // Track IP address for security
    },
    device: {
      type: String, // Optional: Can store "mobile", "desktop", etc.
    },
  },
  { timestamps: true }
);

const History = model("History", historySchema);

export default History;
