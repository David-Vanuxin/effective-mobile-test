import { describe, it, before, after, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import { generateRandomUserData, createTestUser } from "./helpers.js"
import request from "supertest"

import { AppDataSource } from "../build/data-source.js"
import User from "../build/entity/User.js"
import Session from "../build/entity/Session.js"
import app from "../build/app.js"

const testUser = generateRandomUserData()

describe("Get user info ( /user/id )", async () => {
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

  it("Try without authorization", async () => {
    await request(app)
      .get("/user/1")
      .expect(400, { error: "Authorization error" })
  })

  it("For role=user try fetch another user's info", async () => {
    const user = await createTestUser()
    await createTestUser()

    const loginRes = await request(app).post("/auth/log-in").send({
      email: user.email,
      password: user.password,
    })

    const token = loginRes.body.token

    await request(app)
      .get("/user/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(402, { error: "Access denied" })
  })

  it("For role=admin fetch another user's info", async () => {
    const admin = await createTestUser("admin")
    const user = await createTestUser()

    const adminLoginRes = await request(app).post("/auth/log-in").send({
      email: admin.email,
      password: admin.password,
    })

    const adminToken = adminLoginRes.body.token

    const userLoginRes = await request(app).post("/auth/log-in").send({
      email: user.email,
      password: user.password,
    })

    const userID = userLoginRes.body.id

    const userInfoRes = await request(app)
      .get("/user/" + userID)
      .set("Authorization", `Bearer ${adminToken}`)

    const userInfo = userInfoRes.body

    assert.strictEqual(userInfo.id, userID)
    assert.strictEqual(userInfo.role, "user")
  })

  it("User fetch own info", async () => {
    const user = await createTestUser()

    const { email, password } = user
    const loginRes = await request(app)
      .post("/auth/log-in")
      .send({
        email,
        password,
      })
      .expect(200)

    const { id, token } = loginRes.body

    const userInfoRes = await request(app)
      .get("/user/" + id)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const userInfo = userInfoRes.body

    assert.strictEqual(userInfo.id, id)
  })
})

describe("Get all users ( /user )", function () {
  before(async () => {
    await AppDataSource.initialize()
  })

  after(async () => {
    await AppDataSource.destroy()
  })

  afterEach(async () => {
    await AppDataSource.getRepository(Session).clear()
    await AppDataSource.getRepository(User).clear()
  })

  it("Try without authorization", async () => {
    await request(app)
      .get("/user/")
      .expect(400, { error: "Authorization error" })
  })

  it("Try for role=user", async () => {
    const user = await createTestUser()

    const res = await request(app).post("/auth/log-in").send({
      email: user.email,
      password: user.password,
    })

    const token = res.body.token

    await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`)
      .expect(401, { error: "Access denied" })
  })

  it("Try for role=admin", async () => {
    const admin = await createTestUser("admin")
    await createTestUser()
    await createTestUser()
    await createTestUser()

    const loginRes = await request(app)
      .post("/auth/log-in")
      .send({
        email: admin.email,
        password: admin.password,
      })
      .expect(200)

    const token = loginRes.body.token

    const res = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    assert.strictEqual(res.body.length, 4)
  })
})

describe("Block user", async () => {
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

  it("User blocks himself", async () => {
    const user = generateRandomUserData()
    await request(app).post("/auth/sign-up").send(user)

    const { email, password } = user
    const loginRes = await request(app)
      .post("/auth/log-in")
      .send({
        email,
        password,
      })
      .expect(200)

    const { id, token } = loginRes.body

    const updateRes = await request(app)
      .put(`/user/${id}/block`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        active: false,
      })
      .expect(200)

    const newUserData = updateRes.body

    assert.strictEqual(newUserData.active, false)
  })

  it("Admin blocks user", async () => {
    const admin = generateRandomUserData()
    admin.role = "admin"
    await request(app).post("/auth/sign-up").send(admin)

    await createTestUser()

    const { email, password } = admin
    const loginRes = await request(app)
      .post("/auth/log-in")
      .send({
        email,
        password,
      })
      .expect(200)

    const token = loginRes.body.token

    const usersRes = await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const users = usersRes.body
    const { id: userID } = users.find(u => u.role === "user")

    const updateRes = await request(app)
      .put(`/user/${userID}/block`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        active: false,
      })
      .expect(200)

    const newUserData = updateRes.body

    assert.strictEqual(userID, newUserData.id)
    assert.strictEqual(newUserData.active, false)
  })

  it("User try block another user", async () => {
    const user1 = await createTestUser()
    await createTestUser()

    const loginRes = await request(app)
      .post("/auth/log-in")
      .send({
        email: user1.email,
        password: user1.password,
      })
      .expect(200)

    const { id, token } = loginRes.body

    await request(app)
      .put(`/user/${id + 1}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ active: false })
      .expect(402, { error: "Access denied" })
  })
})
