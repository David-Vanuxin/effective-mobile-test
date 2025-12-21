import test from "node:test"
import { strict as assert } from "node:assert"

test("index endpoint test", async () => {
  const res = await fetch("http://0.0.0.0:3000/")
  const answer = await res.text()
  assert.strictEqual(answer, "Hello, World!")
})
