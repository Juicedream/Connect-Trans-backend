import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import fs from "fs";

import {
  pinGenerator,
  accountNumberGenerator,
  generatePanNumber,
  generateExpiryDate,
  cvvGenerator,
  generateAvatar,
  generateDeveloperId,
  generateSecretKeyForDev,
  generateApiKey,
  getThreeMonthsFromNow,
  encryption,
} from "../config/generator.js";
import { sendMail } from "../config/email.config.js";
import {
  cardCreationHtml,
  createDeveloperHTML,
  receiverTransactionHtml,
  senderTransactionHtml,
} from "../htmls/html.js";
import { ENCRYPTION_PUBLIC_KEY, SALT } from "../env.js";
import { isValidObjectId } from "mongoose";
import Developer from "../models/developer.model.js";
import Account from "../models/account.model.js";
import Transaction from "../models/transactions.model.js";
import Card from "../models/card.model.js";

const raw = fs.readFileSync("./test.users.json", "utf-8");
const data = JSON.parse(raw);

const encryptedPublicKey = Buffer.from(ENCRYPTION_PUBLIC_KEY, "hex");

// ================= users ===============

const allUsers = async (req, res) => {
  // const {user} = req;

  // if(user.role === "customer" && !user.isDeveloper){
  //   return res.status(400).json({
  //     code: 400,
  //     message: "Sorry, You can't access this!"
  //   });
  // }

  const users = await User.find({});

  if (users.length < 1) {
    return res.status(404).json({
      code: 404,
      message: "No Users!",
    });
  }

  return res.status(200).json({
    users,
  });
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // assuming you're passing user ID as a URL param
    const { user } = req;

    if (userId !== user.id)
      return res.status(400).json({ code: 400, message: "Invalid User ID" });

    const updates = req.body;

    // List of fields allowed to be updated
    const allowedFields = [
      "name",
      "age",
      "avatar",
      "password",
      "gender",
      "birthday",
      "state",
      "country",
      "address",
      "phoneNumber",
      "email",
      "password",
      "beneficiaries",
      "developerAccount",
      "isDeveloper",
      "role",
      "otp",
      "accounts",
      "cards",
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Hash password if it's being updated
    if (filteredUpdates.password) {
      const salt = await bcrypt.genSalt(10);
      filteredUpdates.password = await bcrypt.hash(
        filteredUpdates.password,
        salt
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ code: 500, message: "Server error during update" });
  }
};

// cards

const createCard = async (req, res) => {
  const { user } = req;
  const { faceType, cardType } = req.body;
  try {
    if (!faceType || !cardType) {
      return res.status(400).json({
        code: 400,
        message: "All Fields are required",
      });
    }

    // creating card and encrypting details and hashing pin
    const panNumber = generatePanNumber(cardType); //based on card type;
    const expiryDate = generateExpiryDate();
    const cvv = cvvGenerator().toString();
    const pin = pinGenerator();

    //pan encryption
    let {iv, content} = await encryption(panNumber, encryptedPublicKey);
    let panSecretKey = iv;
    let encryptPanNumber = content;
    // cvv encryption
    let {iv:cvvIv, content:cvvContent} = await encryption(cvv, encryptedPublicKey);
    let encryptCvv = cvvContent;
    let cvvSecretKey = cvvIv;
    // pin encryption
    const hashedPin = await bcrypt.hashSync(pin, Number(SALT));

    const userAccount = await Account.findOne({ userId: user._id });
    const newCard = new Card({
      panNumber: encryptPanNumber,
      panSecretKey,
      cardHolderName: user.name.toUpperCase(),
      expiryDate,
      faceType,
      cardType,
      cvv: encryptCvv,
      cvvSecretKey,
      accountId: userAccount?._id,
      pin: hashedPin,
    });



    let amount = cardType === "mastercard" ? 2000 : 1000;

    if(userAccount.accountType !== "current" && cardType === "mastercard"){
      return res.status(400).json({
        code: 400,
        message: "Savings account can't have mastercard",
      });
    }


    let calculated = userAccount.balance - amount;

    if (calculated <= 0) {
      return res.status(400).json({
        code: 400,
        message: "Couldn't create card, Insufficient funds",
      });
    }

    //debit the users account 1000 to the admin account
    const superAdminAccount = await Account.findOne({
      accountNumber: "5015237266",
    });

    const superAdmin = await User.findOne({ email: "judexfrayo@gmail.com" });

    userAccount.balance -= amount;

    superAdminAccount.balance += amount;

    const newTransaction1 = new Transaction({
      accountId: userAccount._id,
      type: "withdrawal",
      amount: 1000,
      status: "successful",
      senderAccount: userAccount.accountNumber,
      receiverAccount: superAdminAccount.accountNumber,
      reference: "Card Creation",
    });

    user.cards = [newCard?._id];
    userAccount.hasCard = true;
    userAccount.cardType = cardType;

    await newTransaction1.save();

    userAccount.transactions = [newTransaction1._id];
    superAdminAccount.transactions = [newTransaction1._id];
    await newCard.save();
    await userAccount.save();
    await superAdminAccount.save();
    await user.save();

    await sendMail(
      user.email,
      "CARD CREATED!",
      cardCreationHtml(
        user.name,
        panNumber,
        cardType,
        newCard.cardHolderName,
        newCard.expiryDate,
        pin,
        cvv,
        newCard.status
      )
    );

    await sendMail(
      user.email,
      "MONEY SENT!",
      senderTransactionHtml(
        user.name,
        userAccount.accountNumber,
        superAdminAccount.accountNumber,
        amount,
        newTransaction1.status,
        userAccount.balance,
        newTransaction1.reference,
        newTransaction1.timestamp
      )
    );

    await sendMail(
      superAdmin.email,
      "MONEY RECEIVED!",
      receiverTransactionHtml(
        superAdmin.name,
        superAdminAccount.accountNumber,
        userAccount.accountNumber,
        amount,
        newTransaction1.status,
        superAdminAccount.balance,
        newTransaction1.reference,
        newTransaction1.timestamp
      )
    );

    return res.status(200).json({
      message: "Card created successfully! check your email",
    });
  } catch (error) {
    console.log("error occured in createCard controller: ", error);
  }
};

// =====================Developers==================
const MAX_NO_REQUESTS = 100;

const registerDeveloper = async (req, res) => {
  const { host } = req.body;
  const { user, isTokenValid } = req;
  // const token = req.cookies.loginToken;

  const ONLY_CUSTOMERS = "customer";

  // const isTokenValid = jwt.verify(token, JWT_SECRET);

  if (!host) {
    return res.status(400).json({
      code: 400,
      message: "host is required!",
    });
  }

  const { email } = user;

  const existingDeveloper = await Developer.findOne({ email });

  if (existingDeveloper) {
    return res.status(400).json({
      code: 400,
      message: "You are registered as a developer",
    });
  }

  // Only customers can create dev accounts
  if (user.role !== ONLY_CUSTOMERS) {
    return res.status(400).json({
      code: 400,
      message: `You can't be registered as a developer because you are an ${user.role}`,
    });
  }

  // create developer id
  let devId = generateDeveloperId(isTokenValid?.id);

  let devUsername = user.name;

  // create and encrypt api key and secret key

  let apiKey = generateApiKey();
  let {iv, content} = await encryption(apiKey, encryptedPublicKey);
  let encryptedSecretKey = iv;
  let encryptedApiKey = content;
  console.log(encryptedSecretKey)

  let apiKeyExpiryDate = getThreeMonthsFromNow();

  // create dev account

  const devAccount = new Developer({
    developerId: devId,
    username: devUsername,
    email,
    host,
    apiKey: encryptedApiKey,
    secretKey: encryptedSecretKey,
    expiryDate: apiKeyExpiryDate,
  });

  // save dev account to db
  await devAccount.save();

  //updating the user's info
  user.isDeveloper = true;
  user.developerAccount = devAccount?._id;

  // saving user's info

  await user.save();

  let devHtml = createDeveloperHTML(
    devUsername,
    devId,
    host,
    apiKeyExpiryDate,
    devAccount.status,
    devAccount.createdAt,
    apiKey,
    encryptedSecretKey,
    devAccount.environment
  );

  try {
    await sendMail(email, "DEVELOPER ACCOUNT CREATED", devHtml);

    return res.status(200).json({
      devAccount,
      message: "Developer created successfully! Happy Coding👍",
    });
  } catch (err) {
    console.log(err.message);
    throw new Error("Something went wrong");
  }
};

const allDevelopers = async (req, res) => {
  const developers = await Developer.find({});
  if (!developers || developers.length < 1) {
    return res.status(404).json({
      code: 404,
      message: "No developers yet!",
    });
  }
  return res.status(200).json({
    developers,
    message: "Successfully fetched all developers!",
  });
};

const getDeveloper = async (req, res) => {
  const { id } = req.params;

  // if id contains dev
  if (id.startsWith("dev")) {
    const dev = await Developer.findOne({ developerId: id });

    getDev(dev);
  } else if (!isValidObjectId(id)) {
    // if normal mongodb object id
    return res.status(400).json({
      code: 400,
      message: "Invalid id Provided",
    });
  } else {
    const dev = await Developer.findById(id);
    getDev(dev);
  }

  function getDev(dev) {
    if (!dev) {
      return res.status(404).json({
        code: 404,
        message: `No developer with ${id} exists`,
      });
    }

    return res.status(302).json({
      dev,
    });
  }
};

const checkDeveloper = async (req, res) => {
  const { user } = req;
  // const token = req.cookies.loginToken;
  // const isTokenValid = jwt.verify(token, JWT_SECRET);

  if (!user.isDeveloper || !user.developerAccount) {
    return res.status(404).json({
      code: 404,
      message: "You are not a developer!",
    });
  }

  return res.status(200).json({
    developer: user,
    message: "You are a developer!",
  });
};

//test
const allTestUsers = async (req, res) => {
  const { users: testUsers } = data;
  if (!testUsers || testUsers.length < 1) {
    return res.status(404).json({ code: 404, message: "No Test users found!" });
  }
  return res.status(200).json({
    testUsers,
  });
};

const getTestUserById = async (req, res) => {
  const { id } = req.params;
  const { users: testUsers } = data;

  const user = testUsers.find((i) => i._id === Number(id));

  if (!user) {
    return res
      .status(404)
      .json({ code: 404, message: `No Test users found with id: ${id}` });
  }

  return res.status(200).json({
    user,
  });
};

export {
  allUsers,
  registerDeveloper,
  allDevelopers,
  checkDeveloper,
  getDeveloper,
  updateUser,
  allTestUsers,
  getTestUserById,
  createCard,
};
