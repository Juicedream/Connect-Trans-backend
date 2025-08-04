import { nigerianStates } from "../../data.js";

const cardFaceTypes = [
  "regular",
  "corporate",
  "kids",
  "women",
  "men",
  "platinum",
];

const userValidation = (req, res, next) => {
  const {
    name,
    age,
    gender,
    email,
    birthday,
    state,
    address,
    phoneNumber,
    password,
    accountType,
    faceType,
    role,
  } = req.body;

  // user input validations
  try {
    if (
      !name ||
      !age ||
      !gender ||
      !role ||
      !email ||
      !birthday ||
      !state ||
      !address ||
      !phoneNumber ||
      !password ||
      !accountType 
    ) {
      res.status(400);
      throw new Error("All Fields are required!");
    }

    //   name validation

    const nameRegex = /^[A-Za-z]+(?:[\s-][A-Za-z]+)*$/;

    if (name.trim().length >= 30) {
      res.status(400);
      throw new Error("Name is too long!");
    }

    if (!nameRegex.test(name)) {
      res.status(400);
      throw new Error("Invalid Name!");
    }

    //   age validation

    if (typeof age !== "number") {
      res.status(400);
      throw new Error("Age must be a number!");
    }

    if (age < 18) {
      res.status(400);
      throw new Error("Age must be greater than 17 years old!");
    }

    //   gender validation for either male or female

    if (gender !== "male" && gender !== "female") {
      res.status(400);
      throw new Error("Gender can only be male or female!");
    }

    //   email validation

    const emailRegex =
      /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Invalid Email Address!");
    }

    // role validation

    if (role !== "admin" && role !== "customer" && role !== "customer") {
      res.status(400);
      throw new Error("Invalid role!");
    }

    // state validation

    if (!nigerianStates.includes(state)) {
      res.status(400);
      throw new Error("Invalid State!");
    }

    // address validation

    const addressRegex = /^[a-zA-Z0-9\s.,#/-]{5,100}$/;

    if (address.trim().length >= 60) {
      res.status(400);
      throw new Error("Address is too long!");
    }

    if (!addressRegex.test(address)) {
      res.status(400);
      throw new Error("Invalid Address!");
    }

    //phone number validation
    // Ensure it's a string and remove unwanted spaces

    if (typeof phoneNumber !== "string") {
      res.status(400);
      throw new Error("Phone number must be a string!");
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, ""); // Remove all non-digit characters

    if (cleanedNumber.length !== 11 || !cleanedNumber.startsWith("0")) {
      res.status(400);
      throw new Error(
        "Invalid Phone Number! Must be 11 digits and start with '0'."
      );
    }

    //   password validation

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be 6 characters or more!");
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      res.status(400);
      throw new Error(
        "Password must contain at least one uppercase letter, at least one lowercase letter, at least one number and at least one special character!"
      );
    }

    //   cardHolderName validation

    // if (cardHolderName.trim().length > 12) {
    //   res.status(400);
    //   throw new Error("Card Holder Name is too long!");
    // }

    // if (!nameRegex.test(cardHolderName)) {
    //   res.status(400);
    //   throw new Error("Invalid Card Holder Name!");
    // }

    //   account type validaition

    if (accountType !== "savings" && accountType !== "current") {
      res.status(400);
      throw new Error("Account Type can only be savings or current!");
    }

    //   card type validation

    // if (cardType !== "visa" && cardType !== "mastercard") {
    //   res.status(400);
    //   throw new Error("Card Type can only be visa or mastercard!");
    // }

    //   card face type validation

    // if (!cardFaceTypes.includes(faceType)) {
    //   res.status(400);
    //   throw new Error(
    //     "Face Type can only be regular or corporate or kids or women or men or platinum"
    //   );
    // }

    next();
  } catch (error) {
    next(error);
  }
};

const signInValidation = (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      res.status(400);
      throw new Error("Email Field is required!");
    }

    if (!password) {
      res.status(400);
      throw new Error("Password Field is required!");
    }

    const emailRegex =
      /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error("Invalid Email Address!");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be 6 characters or more!");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { userValidation, signInValidation };

