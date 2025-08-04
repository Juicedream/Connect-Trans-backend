import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import {
  pinGenerator,
  accountNumberGenerator,
  generateAvatar,
  generateDefaultPassword,
} from "../config/generator.js";
import { sendMail } from "../config/email.config.js";
import { changePasswordHtml, createAccountHtml, forgotPasswordHtml } from "../htmls/html.js";
import { JWT_SECRET, SALT } from "../env.js";

export const TIME = 10;

//+++++++++++++++++FUNCTION+++++++++++++++
// create login token
function createLoginToken(res, existingUser) {
  const token = jwt.sign(
    {
      id: existingUser._id,
      email: existingUser?.email,
      role: existingUser?.role,
    },
    JWT_SECRET, // Use a secret key stored in environment variables
    { expiresIn: "7d" } // Token expiration
  );

  res.cookie("loginToken", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  }); // Expires in 1 hour, httpOnly for security

  return token;
}

// ++++++++++++++++++++++++++++++++

const createAccount = async (req, res) => {
  const {
    name,
    age,
    gender,
    email,
    role,
    birthday,
    state,
    address,
    phoneNumber,
    password,
    accountType,
  } = req.body;
  let cardType = "";
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        code: 400,
        message: "User already exists",
      });
    }

    // encrypt password

    const hashedPassword = bcrypt.hashSync(password.toString(), Number(SALT));

    // generate avatar for user
    const avatar = generateAvatar(name);

    const newUser = new User({
      name,
      email,
      age,
      avatar,
      gender,
      password: hashedPassword,
      role,
      birthday,
      state,
      address,
      phoneNumber,
    });

    // creating account

    const pin = pinGenerator();
    const accountNumber = accountNumberGenerator(accountType);

    if (accountType === "savings") {
      cardType = "visa";
    }

    if (accountType === "current") {
      cardType = "mastercard";
    }

    const newAccount = new Account({
      userId: newUser?._id,
      accountName: newUser.name.toUpperCase(),
      accountNumber,
      accountType,
      cardType,
      pin,
    });

    newUser.accounts = [newAccount?._id];

    // creating card
    // const panNumber = generatePanNumber(cardType) //based on card type;
    // const expiryDate = generateExpiryDate();
    // const cvv = cvvGenerator();

    // const hashedPanNumber = bcrypt.hashSync(panNumber.toString(), 10);
    // const hashedCvv = bcrypt.hashSync(cvv.toString(), 10);

    // const newCard = new Card({
    //   panNumber: hashedPanNumber,
    //   cardHolderName: name.toUpperCase(),
    //   expiryDate,
    //   cardType,
    //   faceType,
    //   cvv: hashedCvv,
    //   accountId: newAccount?._id,
    // });

    // newUser.cards = [newCard?._id];

    if (!email) {
      console.log("email is undefined");
    } else {
      try {
        await newUser.save();
        await newAccount.save();
        // await newCard.save();
        await sendMail(
          email,
          "Account Creation Successful",
          createAccountHtml(
            name,
            newAccount.accountNumber,
            newAccount.accountType,
            newUser.role,
            address,
            newAccount.balance,
            email,
            password
          )
        );
        const token = createLoginToken(res, newUser); // create a token as registers it in the cookie
        res.status(201).json({
          message: "Account Created successfully, Kindly check your email!",
          token,
          user: newUser,
        });
      } catch (error) {
        console.log("Could not send email", error);
        res.status(500).json({
          code: 500,
          message: "Unable to send email",
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Unable to create account, Kindly re-check your input fields!",
    });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({
        code: 404,
        message: "User not found!",
      });
    }

    const userAccount = await Account.findOne({ userId: existingUser?._id });

    if (!userAccount) {
      return res.status(404).json({
        code: 404,
        message: "User account not found!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        code: 404,
        message: "Invalid Credentials!",
      });
    }

    const token = createLoginToken(res, existingUser); // create a token as registers it in the cookie

    res.status(200).json({
      token: token, // Send token in response
      message: `Signed In Successfully. Welcome ${existingUser.name}!`,
      // user: {
      //   id: existingUser._id,
      //   name: existingUser.name,
      //   email: existingUser.email,
      //   role: existingUser.role,
      // },
      // accounts: [userAccount],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Unable to sign in , Kindly check your internet connection!",
    });
  }
};

const signOut = async (req, res) => {
  res.clearCookie("loginToken");
  res.status(200).json({
    message: "Logged out successfullly!",
  });
};

const me = async (req, res) => {
  const { user } = req;

  try {
    const authUser = await User.findById(user.id).select("-password");
    return res.status(200).json({ authUser });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, message: "An error occured when fetching auth user" });
  }
};

const forgotPassword = async (req, res) => {
try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ code: 400, message: "Email is required" });

    res.status(200).json({
      message:
        "If the email exists, You will receive further instructions via this email!",
    });

    //  checking email in our db
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log("Email doesn't exist on our platform");
      return;
    }

    //if found generate default password and send email

    let fullName = existingUser.name;
    let defaultPassword = generateDefaultPassword();

    let hashedDefaultPassword = bcrypt.hashSync(defaultPassword, 10);

    existingUser.sentPasswordChangeRequest = true;
    existingUser.defaultPassword = hashedDefaultPassword;

    await existingUser.save();

    await sendMail(
      email,
      "FORGOT PASSWORD",
      forgotPasswordHtml(defaultPassword, fullName, TIME)
    );

    console.log(`Default Password email has been sent to ${email}`);


} catch (error) {
  console.log("error in forgot password controller", error);
  throw new Error(error);
}


};

const changePassword = async (req, res) => {
  const {defaultPassword, newPassword, email} = req.body;

  try {
    //checking missing parameters
    let missingFields = [];
    if (!defaultPassword || !newPassword || !email) {
      for (let field in req.body) {
        if (req.body.hasOwnProperty(field)) {
          if (!req.body[field]) {
            missingFields.push(field);
          }
        }
      }

      return res.status(400).json({
        code: 400,
        message: `Missing fields: ${missingFields}`,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ code: 400, message: "User not found" });
    }

    if(!user.sentPasswordChangeRequest){
      return res.status(400).json({ code: 400, message: "No Request was made to change your password" });
    }

    const isMatchedPassword = await bcrypt.compare(defaultPassword, user.defaultPassword);

    if (!isMatchedPassword) {
      return res.status(400).json({
        code: 400,
        message: "Invalid Default Password",
      });
    }

    if(newPassword.length < 6){
       return res.status(400).json({
         code: 400,
         message: "Password must be 6 or more characters",
       });
    }

    let hashedNewPassword = await bcrypt.hashSync(newPassword, 10);

    user.password = hashedNewPassword;
    user.sentPasswordChangeRequest = false;
    user.defaultPassword = "";

    await user.save();

    await sendMail(email, "PASSWORD CHANGED", changePasswordHtml(newPassword, user.name));

    return res.status(200).json({message: "Password changed successfully!"});

  } catch (error) {
    console.log("error in changing password controller", error);
    throw new Error(error);
  }
  

}






// for cron job
const clearAllDefaultPasswords = async () => {
  const now = new Date();
  const twentyMinutesAgo = new Date(now.getTime() - TIME * 60 * 1000);

  // Find users whose defaultPassword was set more than 20 mins ago
  const users = await User.find({
    defaultPassword: { $ne: null },
    updatedAt: { $lte: twentyMinutesAgo },
  });

  for (const user of users) {
    user.defaultPassword = "";
    await user.save();
  }
  
  console.log(`[CRON] Cleared default passwords for ${users.length} users.`);
};

export { createAccount, signIn, signOut, me, forgotPassword, clearAllDefaultPasswords, changePassword };