import nodemailer from "nodemailer"

import { EMAIL_PASS, EMAIL_USER } from "../env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER, // Your Gmail
    pass: EMAIL_PASS, // App password (not your normal password!)
  },
});

// Function to send email
export const sendMail = async (to, subject, html) => {
   
  
    if (!to) {
      console.error("Error: No recipient email provided!");
      return;
    }
  
    const mailOptions = {
      from: "admin@connecttrans.com",
      to,
      subject,
      html,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);
    } catch (error) {
      console.error("Error sending email: ", error);
    }
  };
  
