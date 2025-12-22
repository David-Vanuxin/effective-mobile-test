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

describe("Block user", async () => {
  before(async () => {
    await request("POST", "/purge")
  })

  after(async () => {
    await request("POST", "/purge")
  })

  it("User blocks himself", async () => {
    const user = generateRandomUserData()
    await request("POST", "/auth/sign-up", user)
    const { email, password } = user
    const { id, token } = await request("POST", "/auth/log-in", {
      email,
      password,
    })

    const newUserData = await request(
      "PUT",
      `/user/${id}/block`,
      {
        active: false,
      },
      token,
    )

    assert.strictEqual(newUserData.active, false)
  })

  it("Admin blocks user", async () => {
    const admin = generateRandomUserData()
    admin.role = "admin"
    await request("POST", "/auth/sign-up", admin)
    const user = generateRandomUserData()
    await request("POST", "/auth/sign-up", user)

    const { email, password } = admin
    const { token } = await request("POST", "/auth/log-in", {
      email,
      password,
    })

    const users = await request("GET", "/user/", null, token)

    const { id: userID } = users.find(u => u.role === "user")

    const newUserData = await request(
      "PUT",
      `/user/${userID}/block`,
      {
        active: false,
      },
      token,
    )

    assert.strictEqual(userID, newUserData.id)
    assert.strictEqual(newUserData.active, false)
  })

  it("User try block another user", async () => {
    const { email, password } = await createTestUser()
    await createTestUser()

    const { id, token } = await request("POST", "/auth/log-in", {
      email,
      password,
    })

    const res = await request(
      "PUT",
      `/user/${id + 1}`, // id + 1 - second user has that id
      { active: false },
      token,
    )

    assert.deepEqual(res, { error: "Access denied" })
  })
})

async function createTestUser(role = "user") {
  const user = generateRandomUserData()
  user.role = role
  await request("POST", "/auth/sign-up", user)

  return user
}
