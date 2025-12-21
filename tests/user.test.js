import { describe, it, before, after } from "node:test"
import { strict as assert } from "node:assert"

describe.skip("Get user info ( /user/id )", () => {
  let token
  before(async () => {
    await request("POST", "/sign-up", user)
    token = await request("POST", "/log-in", loginData)
  })

  after(() => {
    // TODO: delete users from database
  })

  it("Try without authorization", async () => {
    const res = await request("GET", "/user/1")
    assert.deepEqual(res, { error: "Access denied" })
  })

  it.skip("For role=user try fetch another user's info", async () => {
    const res = await request("GET", "/user/2", null, token)
    assert.strictEqual(res.status, "error")
  })

  it.skip("For role=admin fetch another user's info", () => {})
})

describe.skip("Get all users ( /user )", () => {
  /*  it("Try for role=admin", async () => {
    const res = await request("GET", "/user")
    assert.strictEqual(res.status, "OK")
    // TODO: create many users before test running
  })*/

  it("Try for role=user", async () => {
    const res = await request("GET", "/user")
    assert.deepEqual(res, { error: "Access denied" })
  })
})