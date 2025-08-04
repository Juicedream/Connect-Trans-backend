import express from "express"

const employeeRouter = express.Router();

//routes start

employeeRouter.get("/beneficiary")
employeeRouter.get("/account/:accountNumber")
employeeRouter.get("/trans-history/:id")
employeeRouter.get("/accounts")
employeeRouter.get("/cards")


employeeRouter.post("/create-account")
employeeRouter.post("/sign-in")
employeeRouter.post("/transfer")
employeeRouter.post("/create-card")

employeeRouter.put("/info/:id")




// routes end




export default employeeRouter