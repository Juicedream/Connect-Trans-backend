import express from "express"
import cors from 'cors'
import http from "http";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit"
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import { NODE_ENV, PORT } from "./env.js"
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import accountRouter from "./routes/account.routes.js";
import { validateRole } from "./middlewares/auth.middleware.js";
import employeeRouter from "./routes/employee.routes.js";
import adminRouter from "./routes/admin.routes.js";
import errorHandler from "./middlewares/errorhandler.middleware.js";
import connectDB from "./config/db.config.js";
import { clearAllDefaultPasswords, TIME } from "./controllers/auth.controller.js";





const TRY_AGAIN_AFTER_MINS = 5;
const MAX_NO_REQUESTS = 1000;
const LIMIT_MESSAGE = `Too many requests. Try again after ${TRY_AGAIN_AFTER_MINS} mins`;

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = PORT || 5000;


// console.log(http.STATUS_CODES);

const limiter = rateLimit({
    windowMs: TRY_AGAIN_AFTER_MINS * 60 * 1000,
    max: MAX_NO_REQUESTS,
    message: LIMIT_MESSAGE
});



// clears default password after 10 mins
cron.schedule(`*/${TIME} * * * *`, () => {
  console.log("Running Background Job with cron \n*3");
  clearAllDefaultPasswords();   
});


express.static(path.join(__dirname, "public"));

app.set("trust proxy", true);

app.use(cors());
app.use(cookieParser())
app.use(express.json()); // Middleware to parse JSON requests


app.get("/", (req, res) => {
    // res.send("Welcome to connect trans backend api v1");
     res.sendFile(path.join(__dirname, "public", "index.html"));
})



app.use("/api/v1/auth", authRouter);

// rate limiter to reduce multiple request to our server only after TRY_AGAIN_AFTER_MINS
app.use(limiter);


app.use("/api/v1/user", userRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/employee", validateRole, employeeRouter);
app.use("/api/v1/admin", validateRole, adminRouter);



app.use(errorHandler);


//connecting to database
connectDB()


if(NODE_ENV !== "production"){
    app.listen(port, () => {
        console.log(`Server running on ${port}...`);
    })

}