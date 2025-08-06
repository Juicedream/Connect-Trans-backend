import mongoose from "mongoose";

const { Schema, model } = mongoose;

const developerSchema = new Schema({
  userAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  developerId: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    unique: true,
    required: true,
  },
  secretKey: {
    type: String,
    unique: true,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "revoked"],
    default: "active",
  },
  environment: {
    type: String,
    enum: ["test", "production"],
    default: "test",
  },
  tier: {
    type: String,
    enum: ["free", "paid"],
    default: "free",
  },

  maxUsage: {
    type: Number,
    default: 500,
  },

  usageCount: {
    type: Number,
    default: 0,
  },

  lastUsed: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90, // Expires after 3 months (can be '10s', '5d', etc.)
  },
});

const Developer = model("Developer", developerSchema);

export default Developer;
