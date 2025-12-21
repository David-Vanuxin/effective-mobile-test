import { describe, it, before, after } from "node:test"
import { strict as assert } from "node:assert"
import { request } from "./helpers.js"

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

describe.only("Sign up and log in", () => {
  it("Create new account", async () => {
    const res = await request("POST", "/auth/sign-up", user)

    assert.deepEqual(res, { status: "OK" })
  })

  it("Log in with unexisting email", async () => {
    const res = await request("POST", "/auth/log-in", {
      email: "unexisting",
      password: "1234",
    })

    assert.deepEqual(res, { error: "User not found" })
  })

  it("Log in with invalid password", async () => {
    const res = await request("POST", "/auth/log-in", {
      email: user.email,
      password: "4321",
    })

    assert.deepEqual(res, { error: "Invalid password" })
  })

  it("Perfect log in", async () => {
    const res = await request("POST", "/auth/log-in", {
      email: user.email,
      password: user.password,
    })

    assert.match(res.token, /\d+/)
  })

  after(() => {
    // TODO: delete user from database
  })
})