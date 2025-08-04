import express from "express"

const adminRouter = express.Router();

//routes start


adminRouter.get("/beneficiary")
adminRouter.get("/accounts")
adminRouter
.get("/account/:accountNumber")
.delete("/account/:accountNumber")
.patch("/account/:accountNumber")

adminRouter.get("/history")
adminRouter.get("/users")
adminRouter.get("/cards")
adminRouter.get("/history/:id")


adminRouter.post("/create-account") 

adminRouter.post("/sign-in")
adminRouter.post("/reversal-amount/:trans-id")
adminRouter.post("/transfer")
adminRouter.post("/create-card")

adminRouter.put("/info/:id")

adminRouter.delete("/user/:id")


// routes end




export default adminRouter