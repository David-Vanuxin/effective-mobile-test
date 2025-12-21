import User from "../entity/User.js"
import Session from "../entity/Session.js"
import express from "express"
import { AppDataSource } from "../data-source.js"

const authRouter = express.Router()

authRouter.post("/sign-up", async (req, res) => {
  const user = await AppDataSource.getRepository(User).create(req.body)
  await AppDataSource.getRepository(User).save(user)
  res.json({ status: "OK" })
})

authRouter.post("/log-in", async (req, res) => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    email: req.body.email,
  })

  if (user === null) {
    res.status(400)
    res.json({ error: "User not found" })
    return
  }

  if (user.password !== req.body.password) {
    res.status(400)
    res.json({ error: "Invalid password" })
    return
  }

  const token = Math.round(Math.random() * 1e12).toString()

  const session = await AppDataSource.getRepository(Session).create({
    token,
    user,
  })

  await AppDataSource.getRepository(Session).save(session)

  res.json({ token })
})

export default authRouter
