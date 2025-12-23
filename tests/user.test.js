import { describe, it, before, after, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import {
  generateRandomUserData,
  createTestUser,
  createAdmin,
  logIn,
} from "./helpers.js"
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
    const user1 = await createTestUser()
    const user2 = await createTestUser()

    const { id: anotherUserID } = await logIn(user1.email, user1.password)
    const { token } = await logIn(user2.email, user2.password)

    await request(app)
      .get(`/user/2${anotherUserID}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(402, { error: "Access denied" })
  })

  it("For role=admin fetch another user's info", async () => {
    const admin = await createAdmin(AppDataSource)
    const user = await createTestUser()

    const { token: adminToken } = await logIn(admin.email, admin.password)
    const { id: userID } = await logIn(user.email, user.password)

    const userInfoRes = await request(app)
      .get("/user/" + userID)
      .set("Authorization", `Bearer ${adminToken}`)

    const userInfo = userInfoRes.body

    assert.strictEqual(userInfo.id, userID)
    assert.strictEqual(userInfo.role, "user")
  })

  it("User fetch own info", async () => {
    const user = await createTestUser()
    const { id, token } = await logIn(user.email, user.password)

    const userInfoRes = await request(app)
      .get("/user/" + id)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)

    const userInfo = userInfoRes.body

    assert.strictEqual(userInfo.id, id)

    // object user don't have this properties
    delete userInfo.id
    delete userInfo.active
    assert.deepEqual(user, userInfo)
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
    const { email, password } = await createTestUser()
    const { token } = await logIn(email, password)

    await request(app)
      .get("/user/")
      .set("Authorization", `Bearer ${token}`)
      .expect(401, { error: "Access denied" })
  })

  it("Try for role=admin", async () => {
    const { email, password } = await createAdmin()
    const { id, token } = await logIn(email, password)

    await createTestUser()
    await createTestUser()
    await createTestUser()

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
    const { email, password } = await createTestUser()
    const { id, token } = await logIn(email, password)

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
    const { email, password } = await createAdmin()
    const { token: adminAuthToken } = await logIn(email, password)

    const { id: testUserEmail, password: testUserPwd } = await createTestUser()
    const { id: testUserID } = await logIn(testUserEmail, testUserPwd)

    const updateRes = await request(app)
      .put(`/user/${testUserID}/block`)
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        active: false,
      })
      .expect(200)

    const { id, active } = updateRes.body

    assert.strictEqual(id, testUserID)
    assert.strictEqual(active, false)
  })

  it("User try block another user", async () => {
    const user1 = await createTestUser()
    const user2 = await createTestUser()

    const { id: anotherUserID } = await logIn(user1.email, user1.password)
    const { token } = await logIn(user2.email, user2.password)

    await request(app)
      .put(`/user/2${anotherUserID}`)
      .send({ active: false })
      .set("Authorization", `Bearer ${token}`)
      .expect(402, { error: "Access denied" })
  })
})
