import request from "supertest"
import app from "../build/app.js"

export function generateRandomUserData() {
  return {
    firstname: "Иванов",
    secondname: "Иван",
    patronymic: "Иванович",
    email: `test${Math.round(Math.random() * 1000)}@mail.com`,
    password: "1234",
    birthdate: Date.now(),
  }
}

export async function createTestUser(role = "user") {
  const user = generateRandomUserData()
  user.role = role
  await request(app).post("/auth/sign-up").send(user)

  return user
}
