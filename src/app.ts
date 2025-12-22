import express, { Request, Response, NextFunction } from "express"
import "reflect-metadata"
import authRouter from "./auth/auth-router.js"
import userRouter from "./user/user-router.js"

const app = express()

app.use(express.json())

app.use((req: Request, res: Response, next: NextFunction) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
  })
  next()
})

app.use("/auth", authRouter)
app.use("/user", userRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Invalid path")
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).send("Server error")
})

export default app
