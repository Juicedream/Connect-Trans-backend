import fs from "fs";

import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import path from "path";
import { fileURLToPath } from "url";

import { ENCRYPTION_PUBLIC_KEY } from "../env.js";
import { APPROVED_ROLES } from "../middlewares/auth.middleware.js";
import { isObjectIdOrHexString, isValidObjectId } from "mongoose";
import {
  accountNumberGenerator,
  checkIfCardhasExpired,
  decryption,
  fetchResponses,
} from "../config/generator.js";
import DummyAccount from "../models/dummyAccount.model.js";
import VirtualAccount from "../models/virtual.model.js";
import Transaction from "../models/transactions.model.js";
import Card from "../models/card.model.js";

import { sendMail } from "../config/email.config.js";
import {
  receiverTransactionHtml,
  senderTransactionHtml,
} from "../htmls/html.js";

const raw = fs.readFileSync("./test.accounts.json", "utf-8");
const data = JSON.parse(raw);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPROVED_CARD_STATUS = "active";
const encryptedPublicKey = Buffer.from(ENCRYPTION_PUBLIC_KEY, "hex");

const mainUrl = "https://connect-trans-backend.onrender.com/api/v1";

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
  const { otp, tran_id } = req.body;
  if (!otp || !tran_id) {
    return res.status(400).json({
      code: 400,
      message: "All fields are required!",
    });
  }

  if (otp.length !== 6) {
    return res.status(400).json({
      code: 400,
      message: "Kindly provide the right six digits",
    });
  }

  if (!isValidObjectId(tran_id)) {
    return res.status(400).json({
      code: 400,
      message: "Invalid transaction id",
    });
  }

  let currentTransaction = await Transaction.findById(tran_id);

  if (!currentTransaction) {
    return res.status(404).json({
      code: 404,
      message: "No Transactions found for this id: " + tran_id,
    });
  }

  // check the account that has the otp provided
  let account = await Account.findOne({ otpCode: otp });

  let foundAccount = account;

  if (!foundAccount) {
    return res.status(404).json({
      code: 404,
      message: "No Account found",
    });
  }

  let receiverAccount = await Account.findOne({
    accountNumber: currentTransaction.receiverAccount,
  });
  // let senderAccount = await Account.findOne({accountNumber: currentTransaction.senderAccount});

  if (!receiverAccount) {
    return res.status(404).json({
      code: 404,
      message:
        "Account With the number: " +
        currentTransaction.receiverAccount +
        ", does not exist",
    });
  }

  let { email: senderEmail, name: senderName } = await User.findById(
    foundAccount.userId
  );
  let { email: receiverEmail, name: receiverName } = await User.findById(
    receiverAccount.userId
  );

  if (!receiverEmail) {
    return res.status(400).json({
      code: 400,
      message: "No receiver with such account",
    });
  }
  if (!senderEmail) {
    return res.status(400).json({
      code: 400,
      message: "No sender with such account",
    });
  }

  let status = ["successful"];
  // const idx = Math.floor(Math.random() * 2);
  let statusMessage = status[0];

  console.log(statusMessage);

  // let tran_id = foundAccount.transactions[foundAccount.transactions.length - 1];
  // console.log("transactions", foundAccount.transactions);
  // console.log("last transaction", tran_id);

  // let transaction = await Transaction.findById(tran_id);

  // if (!transaction) {
  //   return res.status(404).json({
  //     code: 404,
  //     message: `No transactions found for this id: ${tran_id}`,
  //   });
  // }

  foundAccount.hasOtp = false;
  foundAccount.otpCode = "";

  let convertedAmount = Number(currentTransaction.amount);
  let failed_calculated =
    foundAccount.balance - convertedAmount < 100 ? true : false;

  if (failed_calculated) {
    currentTransaction.status = "failed";
    await foundAccount.save();
    await currentTransaction.save();

    return res.status(400).json({
      code: 400,
      foundAccount,
      currentTransaction,
      failed_calulated:
        "Your account hit the failed calculated check simply because your account balance is to low to be debited for this transaction",
      message: `Payment failed`,
    });
  }

  currentTransaction.status = statusMessage;

  // if (statusMessage === "failed") {
  //   await foundAccount.save();
  //   await currentTransaction.save();

  //   // //send mail to sender
  //   // await sendMail(senderEmail, "CARD PAYMENT FAILED")

  //   return res.status(400).json({
  //     code: 400,
  //     foundAccount,
  //     currentTransaction,
  //     message: `Payment ${statusMessage}`,
  //   });
  // }

  //debit sender account
  foundAccount.balance -= convertedAmount;
  foundAccount.transactions.push(currentTransaction._id);

  await foundAccount.save();
  await sendMail(
    senderEmail,
    "DEBIT ON YOUR ACCOUNT",
    senderTransactionHtml(
      senderName,
      foundAccount.accountNumber,
      receiverAccount.accountNumber,
      convertedAmount,
      statusMessage,
      foundAccount.balance,
      `Debit on your card for ${currentTransaction.reference}`,
      currentTransaction.timestamp
    )
  );

  // credit the reciever account
  receiverAccount.balance += convertedAmount;
  receiverAccount.transactions = [currentTransaction._id];

  const tranTime = (Math.floor(Math.random() * 6) + 1) * 1000; // from 1000 to 6000 for random success time
  console.log("transaction time", tranTime);

  setTimeout(async () => {
    await receiverAccount.save();
    await currentTransaction.save();

    await sendMail(
      receiverEmail,
      "ACCOUNT CREDITED!",
      receiverTransactionHtml(
        receiverName,
        receiverAccount.accountNumber,
        foundAccount.accountNumber,
        convertedAmount,
        statusMessage,
        receiverAccount.balance,
        "From" + currentTransaction.reference,
        currentTransaction.timestamp
      )
    );
    return res.status(200).json({
      transaction: currentTransaction,
      message: `Payment ${statusMessage}`,
    });
  }, tranTime);
};

const showOtp = async (req, res) => {
  const { panNumber, expiryDate, cvv, receiverAcc, receiverBank, amount } =
    req.body;
  res.clearCookie("otp");

  if (
    !panNumber ||
    !expiryDate ||
    !cvv ||
    !receiverAcc ||
    !receiverBank ||
    !amount
  ) {
    return res.status(400).json({
      code: 400,
      message: "All fields are required!",
    });
  }

  console.log({ panNumber, expiryDate, cvv });

  if (amount.length < 4) {
    return res.status(400).json({
      code: 400,
      message: "Amount cannot be less than a ₦1000!",
    });
  }

  // Validate expiryDate format: MM/YY
  const expiryDateFormat = /^\d{2}\/\d{2}$/;
  if (!expiryDateFormat.test(expiryDate)) {
    return res.status(400).json({
      code: 400,
      message: "Invalid expiryDate format!",
    });
  }

  // Validate CVV length
  if (cvv.length !== 3 || isNaN(cvv)) {
    return res.status(400).json({
      code: 400,
      message: "CVV must be exactly 3 digits",
    });
  }

  // Get cards
  const cards = await Card.find({});
  if (!cards || cards.length === 0) {
    return res.status(400).json({
      code: 400,
      message: "No cards found",
    });
  }

  // Check if card exists
  let matchedCard = null;
  for (const card of cards) {
    const foundCard =
      (await decryption(
        card.panNumber,
        card.panSecretKey,
        encryptedPublicKey
      )) === panNumber;
    // const isMatched = await bcrypt.compare(panNumber, card.panNumber);
    if (foundCard) {
      matchedCard = card;
      break;
    }
  }

  if (!matchedCard) {
    return res.status(404).json({
      code: 404,
      message: "Card not found or invalid PAN",
    });
  }

  console.log("Matched card:", matchedCard);

  if (matchedCard.status !== APPROVED_CARD_STATUS) {
    return res.status(403).json({
      code: 403,
      message: "Card is blocked, Kindly visit your branch!",
    });
  }

  let isMatchedExpiryDate = expiryDate === matchedCard.expiryDate;
  let isMatchedCvv =
    (await decryption(
      matchedCard.cvv,
      matchedCard.cvvSecretKey,
      encryptedPublicKey
    )) === cvv;

  if (!isMatchedExpiryDate || !isMatchedCvv) {
    return res.status(400).json({
      code: 400,
      message: "Card Details are Invalid!",
    });
  }

  //lets check if the card has expired
  let cardExpiryChecker = checkIfCardhasExpired(expiryDate);
  if (cardExpiryChecker) {
    return res.status(400).json({
      code: 400,
      message: "Card has Expired!",
    });
  }

  const checkReceiverExist = await Account.findOne({
    accountNumber: receiverAcc,
  });
  if (!checkReceiverExist) {
    return res.status(404).json({
      code: 404,
      message: "Receiver not found",
    });
  }

  const senderInfo = await Account.findById(matchedCard.accountId);

  if (!senderInfo) {
    return res.status(404).json({
      code: 404,
      message: "No account found for this card",
    });
  }

  let newTransaction = new Transaction({
    accountId: senderInfo._id,
    type: "card",
    amount: Number(amount),
    status: "pending",
    senderAccount: senderInfo.accountNumber,
    receiverAccount: receiverAcc,
    reference: "PayVerge Card Platform",
  });

  await newTransaction.save();

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in a cookie (or a DB/cache with session ID)
  // res.cookie("otp", otp, {
  //   maxAge: 5 * 60 * 1000,
  //   // httpOnly: false,
  //   // sameSite: "None",
  //   // secure: false,
  // }); // valid for 5 min

  // send otp

  senderInfo.transactions.push(newTransaction._id);
  senderInfo.otpCode = otp;
  senderInfo.hasOtp = true;

  await senderInfo.save();

  return res.status(200).json({
    link: `${mainUrl}/account/popup/${newTransaction._id}`,
    tran_id: newTransaction._id.toString(),
  });
};

const checkTransactionStatus = async (req, res) => {
  const { id: tran_id } = req.params;
  if (!tran_id) {
    return res.status(400).json({
      code: 400,
      message: "tran id is required!",
    });
  }

  if (!isValidObjectId(tran_id)) {
    return res.status(400).json({
      code: 400,
      message: "Invalid tran id",
    });
  }
  const transactionExist = await Transaction.findById(tran_id);

  if (!transactionExist) {
    return res.status(404).json({
      code: 404,
      message: "No transactions found",
    });
  }

  return res.status(200).json({
    transaction: {
      tran_id: transactionExist._id,
      status: transactionExist.status,
    },
    message: "Transaction found",
  });
};

const showPopUp = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "otp.html"));
};
const showBankLogo = (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "bank-logo.png"));
};

const transferFund = async (req, res) => {
  const {
    amount,
    senderAccountNumber,
    receiverAccountNumber,
    narration,
    senderPin,
  } = req.body;

  try {
    const APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS = 20000;
    // check if the other fields are empty
    if (
      !senderAccountNumber ||
      !receiverAccountNumber ||
      !narration ||
      !senderPin
    ) {
      return res.status(400).json({
        code: 400,
        message: "All Fields are required!",
      });
    }
    //check if the amount is all numbers no letters included
    if (isNaN(amount)) {
      return res.status(400).json({
        code: 400,
        message: "Amount should be in digits",
      });
    }
    //check if sender and receiver account number is the same
    if (senderAccountNumber === receiverAccountNumber) {
      return res.status(400).json({
        code: 400,
        message:
          "Sender account number and Receiver account number must be different",
      });
    }
    //hard parsing the amount to integer or number or digits
    let amountToBeDebited = parseInt(amount);

    //if amount is not greater than Approved transferable amount per transactions
    if (amountToBeDebited > APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS) {
      return res.status(400).json({
        code: 400,
        message: `Amount can not be greater than ₦${APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS.toLocaleString()}`,
      });
    }

    //if all checks out, check the account numbers existence
    // receiver
    const receiver = await Account.findOne({
      accountNumber: receiverAccountNumber,
    });
    // sender
    const sender = await Account.findOne({
      accountNumber: senderAccountNumber,
    });

    if (!receiver || !sender) {
      return res.status(404).json({
        code: 404,
        message: "Account not found!",
      });
    }

    //check if the pin matches the sender's pin stored in the db

    if (senderPin !== sender.pin) {
      return res.status(400).json({
        code: 400,
        message: "Incorrect Pin!",
      });
    }

    //check if the sender can actually send the amount inputed
    const senderCanBeDebited =
      sender.balance - amountToBeDebited <= 9 ? false : true;
    if (!senderCanBeDebited) {
      console.log("Insufficient Funds!");
      return res.status(400).json({
        code: 400,
        message: "Insufficient Funds!",
      });
    }

    //create a new transaction
    const newTransaction = new Transaction({
      accountId: sender._id,
      type: "transfer",
      amount: amountToBeDebited,
      status: "pending",
      senderAccount: senderAccountNumber,
      receiverAccount: receiverAccountNumber,
      reference: narration,
    });
    await newTransaction.save();

    //debit the sender and update info
    sender.balance -= amountToBeDebited;
    sender.transactions.push(newTransaction._id);

    //credit the receiver and update info
    receiver.balance += amountToBeDebited;
    receiver.transactions.push(newTransaction._id);

    //update transaction info and save receiver, sender info
    newTransaction.status = "successful";

    //complete the transaction
    console.log("Transfer was successful");

    //get the email address for both the sender and the receiver
    const { email: senderEmail, name: senderName } = await User.findById(
      sender.userId
    );
    const { email: receiverEmail, name: receiverName } = await User.findById(
      receiver.userId
    );

    //sender mail
    await sendMail(
      senderEmail,
      "MONEY SENT",
      senderTransactionHtml(
        senderName,
        senderAccountNumber,
        receiverAccountNumber,
        amountToBeDebited,
        newTransaction.status,
        sender.balance,
        narration,
        newTransaction.timestamp
      )
    );
    //receiver mail
    await sendMail(
      receiverEmail,
      "MONEY RECEIVED",
      receiverTransactionHtml(
        receiverName,
        receiverAccountNumber,
        senderAccountNumber,
        amountToBeDebited,
        newTransaction.status,
        receiver.balance,
        narration,
        newTransaction.timestamp
      )
    );

    await newTransaction.save();
    await receiver.save();
    await sender.save();

    res.status(200).json({
      message: "Transfer was successful!",
      transaction: newTransaction,
    });
  } catch (error) {
    console.log("Error occured in the transfer funds controller: ", error);
    res.status(500).json({
      code: 500,
      message: "Internal Server Error!",
    });
  }
};
const bulkTransferFunds = async (req, res) => {
  let {
    amount,
    senderAccountNumber,
    receiverAccountNumbers,
    narration,
    senderPin,
  } = req.body;

  try {
    if (!Array.isArray(receiverAccountNumbers)) {
      return res.status(400).json({
        code: 400,
        message: "Receiver account numbers should be an array",
      });
    }

    receiverAccountNumbers = [...receiverAccountNumbers];

    const APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS = 20000;

    // Required fields check
    if (!senderAccountNumber || !narration || !senderPin) {
      return res.status(400).json({
        code: 400,
        message: "All fields are required",
      });
    }

    if (isNaN(amount)) {
      return res.status(400).json({
        code: 400,
        message: "Amount should be numeric",
      });
    }

    if (receiverAccountNumbers.length < 2) {
      return res.status(400).json({
        code: 400,
        message: "At least 2 receiver accounts required",
      });
    }

    // Validate accounts
    for (const accNo of receiverAccountNumbers) {
      if (isNaN(accNo)) {
        return res
          .status(400)
          .json({ code: 400, message: "Account number must be digits" });
      }
      if (accNo.length !== 10) {
        return res
          .status(400)
          .json({ code: 400, message: "Account number must be 10 digits" });
      }
      if (senderAccountNumber === accNo) {
        return res.status(400).json({
          code: 400,
          message: "Sender and receiver cannot be the same",
        });
      }
    }

    const amountToBeDebited = parseInt(amount);
    if (amountToBeDebited > APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS) {
      return res.status(400).json({
        code: 400,
        message: `Amount cannot exceed ₦${APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS.toLocaleString()}`,
      });
    }

    // Find sender
    const sender = await Account.findOne({
      accountNumber: senderAccountNumber,
    });
    if (!sender) {
      return res
        .status(404)
        .json({ code: 404, message: "Sender's account not found" });
    }

    // PIN check
    if (senderPin !== sender.pin) {
      return res.status(400).json({ code: 400, message: "Incorrect PIN" });
    }

    // Total debit check
    const totalDebit = amountToBeDebited * receiverAccountNumbers.length;
    if (sender.balance - totalDebit < 10) {
      return res.status(400).json({ code: 400, message: "Insufficient funds" });
    }

    // Check all receivers exist first
    const receivers = [];
    for (const receiverAccountNumber of receiverAccountNumbers) {
      const receiver = await Account.findOne({
        accountNumber: receiverAccountNumber,
      });
      if (!receiver) {
        return res.status(404).json({
          code: 404,
          message: `Account ${receiverAccountNumber} not found`,
        });
      }
      receivers.push(receiver);
    }

    // Deduct total from sender once
    sender.balance -= totalDebit;

    // Process each transfer
    for (let i = 0; i < receivers.length; i++) {
      const receiver = receivers[i];

      const newTransaction = new Transaction({
        accountId: sender._id,
        type: "transfer",
        amount: amountToBeDebited,
        status: "successful",
        senderAccount: senderAccountNumber,
        receiverAccount: receiver.accountNumber,
        reference: narration,
      });

      sender.transactions.push(newTransaction._id);
      receiver.balance += amountToBeDebited;
      receiver.transactions.push(newTransaction._id);

      await newTransaction.save();

      // Email both
      const { email: senderEmail, name: senderName } = await User.findById(
        sender.userId
      );
      const { email: receiverEmail, name: receiverName } = await User.findById(
        receiver.userId
      );

      await sendMail(
        senderEmail,
        "MONEY SENT",
        senderTransactionHtml(
          senderName,
          senderAccountNumber,
          receiver.accountNumber,
          amountToBeDebited,
          "successful",
          sender.balance,
          narration,
          newTransaction.timestamp
        )
      );

      await sendMail(
        receiverEmail,
        "MONEY RECEIVED",
        receiverTransactionHtml(
          receiverName,
          receiver.accountNumber,
          senderAccountNumber,
          amountToBeDebited,
          "successful",
          receiver.balance,
          narration,
          newTransaction.timestamp
        )
      );

      await receiver.save();
    }

    await sender.save();

    res.status(200).json({
      message: "Bulk Transfer successful",
      accounts: receiverAccountNumbers,
    });
  } catch (error) {
    console.error("Bulk transfer error:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const cardTransferFund = async (
  amount,
  senderAccountNumber,
  receiverAccountNumber,
  narration,
  senderPin,
  res
) => {
  try {
    const APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS = 20000;
    // check if the other fields are empty
    if (
      !senderAccountNumber ||
      !receiverAccountNumber ||
      !narration ||
      !senderPin
    ) {
      return res.status(400).json({
        code: 400,
        message: "All Fields are required!",
      });
    }
    //check if the amount is all numbers no letters included
    if (isNaN(amount)) {
      return res.status(400).json({
        code: 400,
        message: "Amount should be in digits",
      });
    }
    //check if sender and receiver account number is the same
    if (senderAccountNumber === receiverAccountNumber) {
      return res.status(400).json({
        code: 400,
        message:
          "Sender account number and Receiver account number must be different",
      });
    }
    //hard parsing the amount to integer or number or digits
    let amountToBeDebited = parseInt(amount);

    //if amount is not greater than Approved transferable amount per transactions
    if (amountToBeDebited > APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS) {
      return res.status(400).json({
        code: 400,
        message: `Amount can not be greater than ₦${APPROVED_TRANSFERABLE_AMOUNT_PER_TRANSACTIONS.toLocaleString()}`,
      });
    }

    //if all checks out, check the account numbers existence
    // receiver
    const receiver = await Account.findOne({
      accountNumber: receiverAccountNumber,
    });
    // sender
    const sender = await Account.findOne({
      accountNumber: senderAccountNumber,
    });

    if (!receiver || !sender) {
      return res.status(404).json({
        code: 404,
        message: "Account not found!",
      });
    }

    //check if the pin matches the sender's pin stored in the db

    if (senderPin !== sender.pin) {
      return res.status(400).json({
        code: 400,
        message: "Incorrect Pin!",
      });
    }

    //check if the sender can actually send the amount inputed
    const senderCanBeDebited =
      sender.balance - amountToBeDebited <= 9 ? false : true;
    if (!senderCanBeDebited) {
      console.log("Insufficient Funds!");
      return res.status(400).json({
        code: 400,
        message: "Insufficient Funds!",
      });
    }

    //create a new transaction
    const newTransaction = new Transaction({
      accountId: sender._id,
      type: "transfer",
      amount: amountToBeDebited,
      status: "pending",
      senderAccount: senderAccountNumber,
      receiverAccount: receiverAccountNumber,
      reference: narration,
    });
    await newTransaction.save();

    //debit the sender and update info
    sender.balance -= amountToBeDebited;
    sender.transactions.push(newTransaction._id);

    //credit the receiver and update info
    receiver.balance += amountToBeDebited;
    receiver.transactions.push(newTransaction._id);

    //update transaction info and save receiver, sender info
    newTransaction.status = "successful";

    //complete the transaction
    console.log("Transfer was successful");

    //get the email address for both the sender and the receiver
    const { email: senderEmail, name: senderName } = await User.findById(
      sender.userId
    );
    const { email: receiverEmail, name: receiverName } = await User.findById(
      receiver.userId
    );

    //sender mail
    await sendMail(
      senderEmail,
      "MONEY SENT",
      senderTransactionHtml(
        senderName,
        senderAccountNumber,
        receiverAccountNumber,
        amountToBeDebited,
        newTransaction.status,
        sender.balance,
        narration,
        newTransaction.timestamp
      )
    );
    //receiver mail
    await sendMail(
      receiverEmail,
      "MONEY RECEIVED",
      receiverTransactionHtml(
        receiverName,
        receiverAccountNumber,
        senderAccountNumber,
        amountToBeDebited,
        newTransaction.status,
        receiver.balance,
        narration,
        newTransaction.timestamp
      )
    );

    await newTransaction.save();
    await receiver.save();
    await sender.save();

    res.status(200).json({
      message: "Transfer was successful!",
      transaction: newTransaction,
    });
  } catch (error) {
    console.log("Error occured in the transfer funds controller: ", error);
    res.status(500).json({
      code: 500,
      message: "Internal Server Error!",
    });
  }
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
  showPopUp,
  showBankLogo,
  checkTransactionStatus,
  transferFund,
  bulkTransferFunds,
  cardTransferFund,
};
