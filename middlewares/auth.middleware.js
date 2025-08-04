import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "../env.js";
import Developer from "../models/developer.model.js";
import User from "../models/user.model.js";

export const APPROVED_ROLES = ["admin", "employee"];

export async function validateToken(req, res, next){
  const token = req.cookies.loginToken;

  // if no token in the cookies
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized Access - No Token Provided, Kindly login",
    });
  }

  // if token is valid or not

  const isTokenValid = jwt.verify(token, JWT_SECRET);

  if (!isTokenValid) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized Access - Invalid Token Provided",
    });
  }

  const user = await User.findById(isTokenValid?.id);

  req.user = user;
  req.isTokenValid = isTokenValid;

  next();
}

// only for admin and employees
export async function validateRole(req, res, next){
  const token = req.cookies.loginToken;

  // if no token in the cookies
  if (!token) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized Access - No Token Provided, Kindly login",
    });
  }

  // if token is valid or not
  const isTokenValid = jwt.verify(token, JWT_SECRET);

  // console.log(isTokenValid);

  if (!isTokenValid) {
    return res.status(401).json({
      code: 401,
      message: "Unauthorized Access - Invalid Token Provided",
    });
  }

  //   checking roles
  if (!APPROVED_ROLES.includes(isTokenValid?.role))
    return res.status(401).json({
      code: 401,
      message: "You are not authorized to access this!",
    });

  const user = await User.findById(isTokenValid?.id);

  req.user = user;

  next();
}

// only admin
export function onlyAdmins(req, res, next){




    next();
}

// for developers only
export async function validateDevApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];
    const pathName = `${req.protocol}://${req.get("host")}`;

    if (!apiKey) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized Access - API Key is required",
      });
    }

    const developers = await Developer.find({});

    if (!developers || developers.length < 1) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized Access - No developers found",
      });
    }

    let matchedKey;
    let userAcc;

    for (const keyRecord of developers) {
      const isMatch = await bcrypt.compare(apiKey, keyRecord.apiKey);
      if (isMatch) {
        matchedKey = keyRecord;
        userAcc = await User.findOne({ developerAccount: matchedKey._id });
        break;
      }
    }

    if (!matchedKey) {
      return res.status(403).json({
        code: 403,
        message: "Unauthorized Access - Invalid API Key!",
      });
    }

    if (matchedKey.host !== pathName) {
      return res.status(400).json({
        code: 400,
        message: "You are making this request from a wrong host!",
      });
    }

    // Revoke access if usage count is exceeded
    if (matchedKey.usageCount >= matchedKey.maxUsage) {
      if (userAcc) {
        userAcc.developerAccount = undefined;
        userAcc.isDeveloper = false;
        await userAcc.save();
      }

      await matchedKey.deleteOne();

      return res.status(401).json({
        code: 401,
        message: "Unauthorized Access - API Key usage limit reached",
      });
    }

    // Log usage
    matchedKey.usageCount += 1;
    matchedKey.lastUsed = new Date();
    await matchedKey.save();

    req.user = matchedKey;
    req.userAcc = userAcc;

    console.log({
      user: matchedKey.username,
      path: req.url,
      count: matchedKey.usageCount,
      apiKey,
    });

    next();
  } catch (error) {
    console.error("Error in validateDevApiKey middleware:", error);
    return res.status(500).json({
      code: 500,
      message: "Server Error in API Key validation",
    });
  }
}
