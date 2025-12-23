import request from "supertest"
import app from "../build/app.js"

import { AppDataSource } from "../build/data-source.js"
import User from "../build/entity/User.js"

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

export async function logIn(email, password) {
  const res = await request(app).post("/auth/log-in").send({
      email: email,
      password: password,
    })
  return res.body
}

export async function createAdmin() {
  const userData = generateRandomUserData()
  const admin = await AppDataSource.getRepository(User).create({
    ...userData,
    role: "admin"
  })
  await AppDataSource.getRepository(User).save(admin)

  return userData
}