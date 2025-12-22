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

userRouter.use("/:id", async (req, res, next) => {
  if (
    res.locals.user.id !== parseInt(req.params.id) &&
    res.locals.user.role !== "admin"
  ) {
    res.status(402)
    res.json({ error: "Access denied" })
    return
  }
  next()
})

userRouter.get("/:id", async (req, res) => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    id: parseInt(req.params.id),
  })

  if (user) return res.json(user)

  res.status(404)
  res.json({ error: "User not found" })
})

userRouter.put("/:id/block", async (req, res) => {
  try {
    const user = await AppDataSource.getRepository(User).findOneBy({
      id: parseInt(req.params.id),
    })

    if (user === null) {
      res.status(400)
      return res.json({ error: "User not found" })
    }

    user.active = false

    await AppDataSource.getRepository(User).save(user)
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500)
    res.json({ error: "Server error" })
  }
})

export default userRouter
