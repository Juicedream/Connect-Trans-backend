import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CardSchema = new Schema(
  {
    panNumber: {
      type: String, // Changed to String to prevent number precision issues
      required: true,
      unique: true, // Ensures no duplicate card numbers
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String, // Format: MM/YY
      required: true,
    },
    cvv: {
      type: String, // Should be encrypted in a real-world app
      required: true,
    },
    cardType: {
      type: String,
      enum: ["visa", "mastercard"],
      required: true,
    },
    faceType:{
        type: String,
        enum: ["regular", "corporate", "kids", "women", "men", "platinum"],
        default:"regular"
    },
    status: {
      type: String,
      enum: ["active", "blocked", "expired"],
      default: "active",
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account", // Links the card to an account
      required: true,
    },
    pin:{
      type: String,
      required: true
    }
  },
  { timestamps: true } // Adds createdAt & updatedAt
);

const Card = model("Card", CardSchema);

export default Card;
