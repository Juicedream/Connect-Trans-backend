import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    avatar: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    beneficiaries: [
       {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", // Links to multiple accounts
      },
    ],
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    developerAccount:   {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Developer", 
    },
    isDeveloper:{
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ["admin", "customer", "employee"],
      default: "customer",
    },
    birthday: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "Nigeria"
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String, // Changed to String to support leading zeros
      required: true,
    },
    otp: {
      type: String,
    },
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account", // Links to multiple accounts
      },
    ],
    cards:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card"
        }
    ],
    sentPasswordChangeRequest: {
      type: Boolean,
      default: false
    },
    defaultPassword: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
