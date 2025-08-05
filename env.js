import dotenv from "dotenv";

dotenv.config();

export const { PORT, JWT_SECRET, DB_URI, EMAIL_USER, EMAIL_PASS, SALT, URL } =
  process.env;
