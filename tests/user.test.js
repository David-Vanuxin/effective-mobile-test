import { describe, it, before, after, afterEach } from "node:test"
import { strict as assert } from "node:assert"
import { request, generateRandomUserData } from "./helpers.js"

const testUser = generateRandomUserData()

describe("Get user info ( /user/id )", async () => {
  before(async () => {
    await request("POST", "/purge")
  })

  it("Try without authorization", async () => {
    const res = await request("GET", "/user/1")
    assert.deepEqual(res, { error: "Authorization error" })
  })

  it("For role=user try fetch another user's info", async () => {
    const user = generateRandomUserData()
    await request("POST", "/auth/sign-up", user)
    await request("POST", "/auth/sign-up", generateRandomUserData())
    const { token } = await request("POST", "/auth/log-in", {
      email: user.email,
      password: user.password,
    })
    const res = await request("GET", "/user/2", null, token)
    assert.deepEqual(res, { error: "Access denied" })
  })

  it("For role=admin fetch another user's info", async () => {
    const admin = generateRandomUserData()
    admin.role = "admin"

    const user = generateRandomUserData()

    await request("POST", "/auth/sign-up", admin)

    await request("POST", "/auth/sign-up", user)

    const { token } = await request("POST", "/auth/log-in", {
      email: admin.email,
      password: admin.password,
    })

    const { id } = await request("POST", "/auth/log-in", {
      email: user.email,
      password: user.password,
    })

    const userInfo = await request("GET", "/user/" + id, null, token)

    assert.strictEqual(userInfo.id, id)
    assert.strictEqual(userInfo.role, "user")
  })

  it("User fetch own info", async () => {
    const user = generateRandomUserData()
    await request("POST", "/auth/sign-up", user)

    const { email, password } = user
    const { id, token } = await request("POST", "/auth/log-in", {
      email,
      password,
    })

    const userInfo = await request("GET", "/user/" + id, null, token)

    assert.strictEqual(userInfo.id, id)
  })

  afterEach(async () => {
    await request("POST", "/purge")
  })
})

describe("Get all users ( /user )", function () {
  before(async () => {
    await request("POST", "/auth/sign-up", testUser)
  })

  after(async () => {
    await request("POST", "/purge")
  })

  it("Try without authorization", async () => {
    const res = await request("GET", "/user/")
    assert.deepEqual(res, { error: "Authorization error" })
  })

  it("Try for role=user", async () => {
    const { token } = await request("POST", "/auth/log-in", {
      email: testUser.email,
      password: testUser.password,
    })
    const res = await request("GET", "/user/", null, token)
    assert.deepEqual(res, { error: "Access denied" })
  })

  it("Try for role=admin", async () => {
    await request("POST", "/purge")

    const admin = generateRandomUserData()
    admin.role = "admin"
    await request("POST", "/auth/sign-up", admin)

    await request("POST", "/auth/sign-up", generateRandomUserData())
    await request("POST", "/auth/sign-up", generateRandomUserData())
    await request("POST", "/auth/sign-up", generateRandomUserData())

    const { token } = await request("POST", "/auth/log-in", {
      email: admin.email,
      password: admin.password,
    })
    const res = await request("GET", "/user/", null, token)

    assert.strictEqual(res.length, 4)
  })
})
