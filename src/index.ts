import express, { Request } from "express"
import "reflect-metadata"
import { AppDataSource } from "./data-source.js"
import User from "./entity/User.js"

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

app.post("/sign-up", async (req, res) => {
  const user = await AppDataSource.getRepository(User).create(req.body)
  const results = await AppDataSource.getRepository(User).save(user)
  res.json({ status: "OK" })
})

app.post("/log-in", (req, res) => {
  res.json({ token: Math.round(Math.random() * 1e12) })
})

const trueToken = 123456789

function userHasAccess(req: Request) {
  const authHeader = req.get("Authorization")

  if (authHeader === undefined) return false

  const token = authHeader.split(" ")[1]

  if (token !== trueToken.toString()) return false

  return true
}

app.get("/user/:id", (req, res) => {
  if (!userHasAccess(req)) {
    res.status(400)
    res.json({ error: "Access denied" })
    return
  }

  const user = {
    id: req.params.id,
    firstname: "Иванов",
    secondname: "Иван",
    patronymic: "Иванович",
    email: "test@email.com",
    password: "1234",
    birthdate: Date.now(),
  }
  res.json(user)
})

app.get("/user/", (req, res) => {
  res.json({ status: "in development" })
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
