import User from "../entity/User.js"
import Session from "../entity/Session.js"
import { AppDataSource } from "../data-source.js"
import express from "express"
import { authMiddleware } from "../auth/auth-middleware.js"

const userRouter = express.Router()

userRouter.use(authMiddleware)

userRouter.get("/", async (req, res) => {
  if (res.locals.user.role !== "admin") {
    res.status(401)
    res.json({ error: "Access denied" })
    return
  }

  const users = await AppDataSource.getRepository(User).find()

  res.json(users)
})

/*userRouter.get("/user/:id", async (req, res) => {
  res.status(400)
  res.json({ error: "Access denied" })
})*/

export default userRouter
