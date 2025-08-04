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
} from "../config/generator.js";
import { sendMail } from "../config/email.config.js";
import { createDeveloperHTML } from "../htmls/html.js";
import { SALT } from "../env.js";
import { isValidObjectId } from "mongoose";
import Developer from "../models/developer.model.js";

const raw = fs.readFileSync("./test.users.json", "utf-8");
const data = JSON.parse(raw);

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

  if(users.length < 1){
    return res.status(404).json({
      code: 404,
      message: "No Users!"
    });
  }

  return res.status(200).json({
    users
  });
}

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // assuming you're passing user ID as a URL param
    const {user} = req;

    if(userId !== user.id)return res.status(400).json({ code: 400, message: "Invalid User ID" });


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









// =====================Developers==================
const MAX_NO_REQUESTS = 100;

const registerDeveloper = async (req, res) => {
  const { host } = req.body;
  const {user, isTokenValid} = req;
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

  // create api key and secret key
  let devSecretKey = generateSecretKeyForDev();
  let hashedSecretKey = bcrypt.hashSync(devSecretKey, Number(SALT));

  let apiKey = generateApiKey();
  let hashedAPIKey = bcrypt.hashSync(apiKey, Number(SALT));

  let apiKeyExpiryDate = getThreeMonthsFromNow();

  // create dev account

  const devAccount = new Developer({
    developerId: devId,
    username: devUsername,
    email,
    host,
    apiKey: hashedAPIKey,
    secretKey: hashedSecretKey,
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
    devSecretKey,
    devAccount.environment
  );

  try {
    await sendMail(email, "DEVELOPER ACCOUNT CREATION", devHtml);

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
  const {users: testUsers} = data;
  if(!testUsers || testUsers.length < 1){
    return res.status(404).json({code: 404, message: "No Test users found!"})
  }
  return res.status(200).json({
    testUsers
  });
}

const getTestUserById = async (req, res) => {
  const {id} = req.params;
  const { users: testUsers } = data;

  const user = testUsers.find(i => i._id === Number(id));

  if(!user){
     return res
       .status(404)
       .json({ code: 404, message: `No Test users found with id: ${id}` });
  }
  
  return res.status(200).json({
    user,
  });
  
}

export {
  allUsers,
  registerDeveloper,
  allDevelopers,
  checkDeveloper,
  getDeveloper,
  updateUser,
  allTestUsers,
  getTestUserById,
};
