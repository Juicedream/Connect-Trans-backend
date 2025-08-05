import jwt from "jsonwebtoken";
import fs from "fs";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import path from "path";
import { fileURLToPath } from "url";

import { JWT_SECRET, SALT } from "../env.js";
import { APPROVED_ROLES } from "../middlewares/auth.middleware.js";
import { isObjectIdOrHexString, isValidObjectId } from "mongoose";
import { accountNumberGenerator, fetchResponses } from "../config/generator.js";
import DummyAccount from "../models/dummyAccount.model.js";
import VirtualAccount from "../models/virtual.model.js";
import Transaction from "../models/transactions.model.js";

const raw = fs.readFileSync("./test.accounts.json", "utf-8");
const data = JSON.parse(raw);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================Accounts============================

const getAccountDetailsByAccountNumber = async (req, res) => {
  const { accountNumber } = req.params;

  const { user } = req;

  if (!accountNumber) {
    return res.status(400).json({
      code: 400,
      message: "Account Number field cannot be empty",
    });
  }
  if (typeof accountNumber !== "string") {
    return res.status(400).json({
      code: 400,
      message: "Account Number must be a string",
    });
  }
  if (accountNumber.length < 10 || accountNumber.length > 10) {
    return res.status(400).json({
      code: 400,
      message: "Account Number must be 10 characters",
    });
  }
  try {
    const accountDetails = await Account.findOne({
      accountNumber: accountNumber,
    });

    // if not in accounts
    if (!accountDetails) {
      // checking in virtual accounts
      const vaccountDetails = await VirtualAccount.findOne({
        accountNumber: accountNumber,
      });

      //  if not in virtual accounts
      if (!vaccountDetails)
        return res.status(404).json({
          code: 404,
          message: "Account Not Found!",
        });

      //if in virtual accounts
      return res.status(302).json({
        message: `Successfully fetched details for ${accountNumber}!`,
        accountDetails: {
          accountNumber,
          accountName: vaccountDetails.accountName,
          bank: vaccountDetails.bank,
        },
      });
    }

    const userDetails = await User.find({ _id: accountDetails.userId });
    if (!userDetails) {
      return res.status(404).json({
        code: 404,
        message: "User Not Found!",
      });
    }

    return APPROVED_ROLES.includes(user?.role)
      ? // TODO: when you fix employee to see info reduce the vallues for them as well
        res.status(302).json({
          message: `Successfully fetched details for ${accountNumber}!`,
          accountDetails,
        })
      : res.status(302).json({
          message: `Successfully fetched details for ${accountNumber}!`,
          accountDetails: {
            accountNumber,
            accountName: accountDetails.accountName,
            bank: accountDetails.bank,
          },
        });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message:
        "Unable to get account details , Kindly check your internet connection!",
    });
  }
};

const getAllAccounts = async (req, res) => {
  const accounts = await Account.find({});
  const virtualAccounts = await VirtualAccount.find({});
  if (!accounts && !virtualAccounts) {
    return res.status(404).json({
      code: 404,
      message: "No accounts found!",
    });
  }
  res.status(200).json({
    accounts,
    virtualAccounts,
    message: "Successfully fetched all accounts!",
  });
};

const getBeneficiaries = async (req, res) => {
  const { user } = req;
  //   const loginToken = req.cookies.loginToken;

  //   const isTokenValid = jwt.verify(loginToken, JWT_SECRET);
  //   const { id } = isTokenValid;

  const userAccount = await Account.findOne({ userId: user._id });

  if (!userAccount) {
    return res.status(404).json({
      code: 404,
      message: "No account found!",
    });
  }

  const { beneficiaries } = userAccount;

  if (beneficiaries.length < 1) {
    return res.status(404).json({
      code: 404,
      message: "No Beneficiaries found!",
    });
  }

  return res.status(200).json({
    beneficiaries,
  });
};

const getTransHistory = async (req, res) => {
  const { user } = req;

  const userAccount = await Account.findOne({ userId: user._id });

  if (!userAccount) {
    return res.status(404).json({
      code: 404,
      message: "No account found!",
    });
  }

  const { transactions } = userAccount;

  if (transactions.length < 1) {
    return res.status(404).json({
      code: 404,
      message: "No Transactions found!",
    });
  }

 
  const allTransactions = await Promise.all(
    transactions.map((tran) => Transaction.findById(tran.toString()))
  );

  // console.log(allTransactions);
  return res.status(200).json({
    transactions: allTransactions,
  });
};

const getAccountTransHistoryById = async (req, res) => {
  const { accountId: accNumOrUserId } = req.params;

  if (accNumOrUserId.startsWith("501") || accNumOrUserId.startsWith("301")) {
    // check with accountNumber

    const account = await Account.findOne({ accountNumber: accNumOrUserId });
    if (!account) {
      return res.status(404).json({
        code: 404,
        message: `No account found with this account number: ${accNumOrUserId}`,
      });
    }

    const { transactions } = account;

    // if transactions array is empty

    if (transactions.length < 1) {
      return res.status(404).json({
        code: 404,
        message:
          "No Transactions have been made on this account for " +
          account.accountName +
          " !",
      });
    }

    // if transactions are in the array
    return res.status(200).json({
      transactions,
      message: `Here is ${account.accountName}'s transaction history`,
    });
  }

  // check if it a valid mongoose id string
  if (!isObjectIdOrHexString(accNumOrUserId)) {
    return res.status(400).json({
      code: 400,
      message: `Invalid user id or account number`,
    });
  }

  // check with user ID
  const account = await Account.findOne({ userId: accNumOrUserId });
  if (!account) {
    return res.status(404).json({
      code: 404,
      message: `No account found with this user id: ${accNumOrUserId}`,
    });
  }

  const { transactions } = account;

  // if transactions array is empty

  if (transactions.length < 1) {
    return res.status(404).json({
      code: 404,
      message:
        "No Transactions have been made on this account " +
        account.accountName +
        " !",
    });
  }

  // if transactions are in the array
  return res.status(200).json({
    transactions,
    message: `Here is ${account.accountName}'s transaction history`,
  });
};

const verifyOtp = async (req, res) => {
  const { payment } = req;
  if (payment === "failed") {
    // res.redirect("http://127.0.0.1:5500/backend/public/card.html?status=failed");
    res.status(200).json({ message: "failed" });
  }
  if (payment === "success") {
    res.status(200).json({ message: "success" });
    // res.redirect("http://127.0.0.1:5500/backend/public/card.html?status=success");
  }
};

const showOtp = async (req, res) => {
  const { cardNumber, expiry, cvv } = req.body;

  console.log({ cardNumber, expiry, cvv });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in a cookie (or a DB/cache with session ID)
  res.cookie("otp", otp, { maxAge: 5 * 60 * 1000 }); // valid for 5 min

  res.sendFile(path.join(__dirname, "../public", "otp.html"));
};

//developers

const generateDummyAccount = async (req, res) => {
  const { _, userAcc } = req;
  const { platform, amount, email, receiverBank, receiverAccountNumber } =
    req.body;
  let missingFields = [];

  if (!platform) {
    missingFields.push("platform");
  }
  if (!amount) {
    missingFields.push("amount");
  }
  if (!email) {
    missingFields.push("email");
  }
  if (!receiverBank) {
    missingFields.push("receiverBank");
  }
  if (!receiverAccountNumber) {
    missingFields.push("receiverAccountNumber");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      code: 400,
      message: `Creation of Virtual Account is missing: ${[...missingFields]}`,
    });
  }

  //check if there is existingVirtual Account so they can only create it once

  const virtualAccExists = await DummyAccount.findOne({
    createdBy: userAcc._id,
  });

  if (virtualAccExists) {
    return res.status(400).json({
      code: 400,
      message:
        "Virtual account exists, Kindly make neccessary payment to the account",
      virtualAccount: virtualAccExists,
    });
  }

  try {
    // creating account
    const accountType = "virtual";
    const accountNumber = accountNumberGenerator(accountType);

    const newAccount = new VirtualAccount({
      accountName: `${platform}_ConnectTrans_Bank_WEBPay`,
      accountNumber,
      accountType,
    });

    await newAccount.save();

    const dummy = new DummyAccount({
      createdBy: userAcc._id,
      accountName: newAccount.accountName,
      accountNumber: newAccount.accountNumber,
      bankName: newAccount.bank,
      amount,
      platform,
      accountBalance: newAccount.balance,
      receiverAccountNumber,
      receiverBank,
    });

    await dummy.save();

    return res.status(200).json({
      account: dummy,
      expiryMinutes: 35,
      message: `Virtual Account Generated for payment on ${platform} platform!`,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      code: 500,
      message:
        "Couldn't create the Virtual account at the moment, something went wrong",
    });
  }
};

// +++++++++END OF PRODUCTION +++++++++++

//test for developers

const getTestAccount = async (req, res) => {
  let { accNo: accountNumber } = req.query;

  if (!accountNumber || isNaN(accountNumber)) {
    res.status(400).json({
      code: 400,
      message: "Invalid account number",
    });
  }

  //  if (!Number(accountNumber)) {
  //    res.status(400).json({
  //      code: 400,
  //      message: "Account Number must be numbers",
  //    });
  //  }

  if (accountNumber.length !== 10) {
    res.status(400).json({
      code: 400,
      message: "Account Number must be 10 digits",
    });
  }

  let foundAcc = data.accounts.find(
    (acc) => accountNumber === acc.accountNumber
  );

  if (!foundAcc) {
    return res.status(404).json({
      code: 404,
      message:
        "Account with the account number: " + accountNumber + " doesn't exist!",
    });
  }

  return res.status(302).json({
    account: foundAcc,
    message: "Account Found!",
  });
};
const getTestAccounts = async (req, res) => {
  return res.status(200).json({
    accounts: data.accounts,
  });
};
const testTransfer = async (req, res) => {
  const { senderAcc, receiverAcc, amount, senderPin, narration } = req.body;
  let missingFields = [];

  if (!senderAcc) {
    missingFields.push("senderAcc");
  }
  if (!receiverAcc) {
    missingFields.push("receiverAcc");
  }
  if (!amount) {
    missingFields.push("amount");
  }
  if (!senderPin) {
    missingFields.push("senderPin");
  }
  if (!narration) {
    missingFields.push("narration");
  }

  if (missingFields > 1) {
    return res.status(400).json({
      code: 400,
      message: `Missing Fields: ${missingFields}`,
    });
  }
  function checkAccounts(testAcc) {
    let account = data.accounts.find((acc) => acc.accountNumber === testAcc);
    return account;
  }

  let acc1 = checkAccounts(senderAcc);
  let acc2 = checkAccounts(receiverAcc);

  if (!acc1) {
    return res.status(400).json({
      code: 400,
      message: "Invalid Sender acc",
    });
  }

  if (!acc2) {
    return res.status(400).json({
      code: 400,
      message: "Invalid reciever acc",
    });
  }

  if (acc1.pin !== senderPin) {
    return res.status(400).json({
      code: 400,
      message: "Invalid Pin",
    });
  }

  let calcualated_expense =
    acc1.balance - amount >= acc1.balance || acc1.balance - amount <= 0
      ? 0
      : acc1.balance - amount;

  if (calcualated_expense <= 0) {
    return res.status(400).json({
      code: 400,
      message:
        "This transaction could not be concluded, check your account balance",
    });
  }

  // transfer
  acc1.balance -= amount;
  acc2.balance += amount;

  const ref = Math.floor(Math.random() * 1000000) + 1000000;

  await fetchResponses(res, amount, acc1, acc2, ref);
};

// ==========End of Accounts====================

export {
  getAccountDetailsByAccountNumber,
  getAllAccounts,
  getBeneficiaries,
  getAccountTransHistoryById,
  getTransHistory,
  getTestAccounts,
  getTestAccount,
  testTransfer,
  generateDummyAccount,
  verifyOtp,
  showOtp,
};
