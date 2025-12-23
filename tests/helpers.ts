import request from "supertest"
import app from "../src/app.js"

import { AppDataSource } from "../src/data-source.js"
import User from "../src/entity/User.js"
import calcHash from "../src/auth/password-hash.js"

export function generateRandomUserData() {
  return {
    firstname: "Иванов",
    secondname: "Иван",
    patronymic: "Иванович",
    email: `test${Math.round(Math.random() * 1000)}@mail.com`,
    password: "1234",
    birthdate: Date.now(),
    role: "user",
  }
}

export async function createTestUser(role = "user") {
  const user = generateRandomUserData()
  user.role = role
  await request(app).post("/auth/sign-up").send(user)

  return user
}

export async function logIn(email: string, password: string) {
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
    role: "admin",
    password: calcHash(userData.password),
  })
  await AppDataSource.getRepository(User).save(admin)

  return userData
}
