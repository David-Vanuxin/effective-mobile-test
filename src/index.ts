import express, { Request, Response, NextFunction } from "express"
import "reflect-metadata"
import { AppDataSource } from "./data-source.js"
import User from "./entity/User.js"
import Session from "./entity/Session.js"
import authRouter from "./auth/auth-router.js"
import userRouter from "./user/user-router.js"

try {
  await AppDataSource.initialize()
  console.log("Data Source has been initialized!")
} catch (error) {
  console.log(error)
}

const app = express()
const port = 3000

app.use(express.json())

app.use((req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  })
  next()
})

app.use("/auth", authRouter)
app.use("/user", userRouter)

// DELETE THIS !!!
app.post("/purge", async (req, res) => {
  await AppDataSource.getRepository(Session).clear()
  await AppDataSource.getRepository(User).clear()
  console.log("WARNING! Database purged")
  return res.json({ status: "purged" })
})

app.use((req, res, next) => {
  res.status(404).send("Invalid path")
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).send('Server error')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
