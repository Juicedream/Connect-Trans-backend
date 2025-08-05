import express from "express";
import {
  validateDevApiKey,
  validateRole,
  validateToken,
} from "../middlewares/auth.middleware.js";
import {
  allDevelopers,
  registerDeveloper,
  checkDeveloper,
  getDeveloper,
  updateUser,
  allTestUsers,
  getTestUserById,
  createCard,
} from "../controllers/user.controller.js";
import { allUsers } from "../controllers/user.controller.js";

const userRouter = express.Router();

//routes start

// users
userRouter
  .get("/all", validateRole, allUsers)

  // register as a developer
  .post("/developer/register", validateToken, registerDeveloper) //only logged in or register users can register as developers

  .get("/all-developers", validateRole, allDevelopers)

  // check if current user is a developer
  .get("/developer", validateToken, checkDeveloper)

  // check developer by id or devid only admins and employees
  .get("/developer/:id", validateRole, getDeveloper)

  .put("/:userId", validateToken, updateUser)

  .post("/create-card", validateToken, createCard)
  .get("/card-details/:id")

  .put("/info/:id")

  // for developers to access

  // test
  .get("/test/all", validateDevApiKey, allTestUsers)
  .get("/test/:id", validateDevApiKey, getTestUserById);

// routes end

export default userRouter;
