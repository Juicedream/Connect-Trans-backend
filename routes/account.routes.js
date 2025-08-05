import express from "express";
import {
  validateDevApiKey,
  validateRole,
  validateToken,
} from "../middlewares/auth.middleware.js";
import {
  generateDummyAccount,
  getAccountDetailsByAccountNumber,
  getAccountTransHistoryById,
  getAllAccounts,
  getBeneficiaries,
  getTestAccount,
  getTestAccounts,
  getTransHistory,
  showOtp,
  testTransfer,
  verifyOtp,
} from "../controllers/account.controller.js";

const accountRouter = express.Router();

accountRouter
  .get("/beneficiaries", validateToken, getBeneficiaries) //the id from the login token to fetch this
  // get account details with account
  .get("/acc/:accountNumber", validateToken, getAccountDetailsByAccountNumber) // only logged in users can access this

  .post("/show-otp", showOtp)
  .post("/verify-otp", verifyOtp)

  .get("/all-accounts", validateRole, getAllAccounts) //only admins and employees can access this not customers

  .get("/trans-history/:accountId", validateRole, getAccountTransHistoryById) //only for admins and employees
  .get("/trans-history", validateToken, getTransHistory) // for the logged in user

  // for developer
  //dev-production
  .post("/generate-virtual-accnumber", validateDevApiKey, generateDummyAccount)

  //dev-test

  .post("/otp", validateDevApiKey, showOtp)
  .get("/test", validateDevApiKey, getTestAccount)
  .get("/test/all", validateDevApiKey, getTestAccounts)
  .post("/test/acc/transfer-to-account", validateDevApiKey, testTransfer);

export default accountRouter;
