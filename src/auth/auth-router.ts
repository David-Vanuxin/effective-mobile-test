import User from "../entity/User.js"
import Session from "../entity/Session.js"
import express from "express"
import { AppDataSource } from "../data-source.js"

const authRouter = express.Router()

authRouter.post("/sign-up", async (req, res) => {
  req.body.role = "user"
  req.body.actve = true
  const user = await AppDataSource.getRepository(User).create(req.body)
  await AppDataSource.getRepository(User).save(user)
  res.json({ status: "OK" })
})

authRouter.post("/log-in", async (req, res) => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    email: req.body.email,
  })

  if (user === null) {
    return res.status(400).json({ error: "User not found" })
  }

  if (user.password !== req.body.password) {
    return res.status(400).json({ error: "Invalid password" })
  }

  const token = Math.round(Math.random() * 1e12).toString()

  const session = await AppDataSource.getRepository(Session).create({
    token,
    user,
  })

  await AppDataSource.getRepository(Session).save(session)

  res.json({ id: user.id, token })
})

export default authRouter
