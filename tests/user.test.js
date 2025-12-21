import { describe, it, before, after } from "node:test"
import { strict as assert } from "node:assert"
import { request, generateRandomUserData } from "./helpers.js"

const testUser = generateRandomUserData()

describe.skip("Get user info ( /user/id )", async () => {
  before(async () => {
    await request("POST", "/auth/sign-up", testUser)
  })

  it("Try without authorization", async () => {
    const res = await request("GET", "/user/1")
    assert.deepEqual(res, { error: "Authorization needed" })
  })

  it.skip("For role=user try fetch another user's info", async () => {
    const {token} = await request("POST", "/auth/log-in", { email: testUser.email, password: testUser.password })
    const res = await request("GET", "/user/2", null, token)
    assert.strictEqual(res.status, "error")
  })

  it.skip("For role=admin fetch another user's info", () => {})
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
    const { token } = await request("POST", "/auth/log-in", { email: testUser.email, password: testUser.password })
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

    const { token } = await request("POST", "/auth/log-in", { email: admin.email, password: admin.password })
    const res = await request("GET", "/user/", null, token)

    assert.strictEqual(res.length, 4)
  })
})
