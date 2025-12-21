import { describe, it, before, after } from "node:test"
import { strict as assert } from "node:assert"

const headers = {
  "Content-Type": "application/json",
}

const origin = "http://0.0.0.0:3000"

async function request(method, endpoint, data = null, authToken = null) {
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  const res = await fetch(origin + endpoint, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })
  // console.log(await res.text())
  return await res.json()
}

const user = {
  firstname: "Иванов",
  secondname: "Иван",
  patronymic: "Иванович",
  email: "test@email.com",
  password: "1234",
  birthdate: Date.now(),
}

const loginData = {
  email: user.email,
  password: user.password,
}

describe("Sign up and log in", () => {
  it("Create new account", async () => {
    const res = await request("POST", "/sign-up", user)

    assert.deepEqual(res, { status: "OK" })
  })

  it("Log in to created account", async () => {
    const res = await request("POST", "/log-in", loginData)

    assert.match(res.token.toString(), /\d+/)
  })

  after(() => {
    // TODO: delete user from database
  });
})

describe("Get user info ( /user/id )", () => {
  let token
  before(async () => {
    await request("POST", "/sign-up", user)
    token = await request("POST", "/log-in", loginData)
  })

  after(() => {
    // TODO: delete users from database
  });

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
