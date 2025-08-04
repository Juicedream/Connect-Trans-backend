import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dummyAccountSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  accountBalance: {
    type: Number,
    default: 0.0,
  },

  paymentRecieved: {
    type: Boolean,
    default: false,
  },

  receiverAccountNumber: {
    type: String,
    required: true,
  },

  receiverBank: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 2, //expires after 35 mins
  },
});

const DummyAccount = model("DummyAccount", dummyAccountSchema);

export default DummyAccount;
