import { describe, it, before, after, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import { generateRandomUserData, createTestUser, logIn } from "./helpers.js"
import request from "supertest"

import { AppDataSource } from "../build/data-source.js"
import User from "../build/entity/User.js"
import Session from "../build/entity/Session.js"
import app from "../build/app.js"

describe("Sign up and log in", () => {
  before(async () => {
    await AppDataSource.initialize()
  })

  afterEach(async () => {
    await AppDataSource.getRepository(Session).clear()
    await AppDataSource.getRepository(User).clear()
  })

  after(async () => {
    await AppDataSource.destroy()
  })

  it("Create new account", async () => {
    await request(app)
      .post("/auth/sign-up")
      .send(generateRandomUserData())
      .expect(200, { status: "OK" })
  })

  it("Log in with unexisting email", async () => {
    await request(app)
      .post("/auth/log-in")
      .send({
        email: "unexisting",
        password: "1234",
      })
      .expect(400, { error: "User not found" })
  })

  it("Log in with invalid password", async () => {
    const user = await createTestUser()

    await request(app)
      .post("/auth/log-in")
      .send({
        email: user.email,
        password: "4321",
      })
      .expect(400, { error: "Invalid password" })
  })

  it("Perfect log in", async () => {
    const user = await createTestUser()

    const res = await request(app)
      .post("/auth/log-in")
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)

    assert.match(res.body.token, /\d+/)
  })

  it("Try create admin account", async () => {
    const { email, password } = await createTestUser("admin")

    const { id, token } = await logIn(email, password)

    const res = await request(app)
      .get(`/user/${id}`)
      .set("Authorization", `Bearer ${token}`)

    assert.notStrictEqual(res.body.role, "admin")
  })
})
