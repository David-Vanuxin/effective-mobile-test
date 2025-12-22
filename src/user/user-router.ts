import User from "../entity/User.js"
import Session from "../entity/Session.js"
import { AppDataSource } from "../data-source.js"
import express from "express"
import { authMiddleware } from "../auth/auth-middleware.js"

const userRouter = express.Router()

userRouter.use(authMiddleware)

userRouter.get("/", async (req, res) => {
  if (res.locals.user.role !== "admin")
    return res.status(401).json({ error: "Access denied" })

  const users = await AppDataSource.getRepository(User).find()

  res.json(users)
})

userRouter.use("/:id", async (req, res, next) => {
  if (
    res.locals.user.id !== parseInt(req.params.id) &&
    res.locals.user.role !== "admin"
  ) {
    return res.status(402).json({ error: "Access denied" })
  }
  next()
})

userRouter.get("/:id", async (req, res) => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: parseInt(req.params.id),
  })

  if (user) return res.json(user)

  res.status(404).json({ error: "User not found" })
})

userRouter.put("/:id/block", async (req, res) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: parseInt(req.params.id),
    })

    if (user === null) {
      return res.status(400).json({ error: "User not found" })
    }

    user.active = false

    await AppDataSource.getRepository(User).save(user)
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: "Server error" })
  }
})

export default userRouter
