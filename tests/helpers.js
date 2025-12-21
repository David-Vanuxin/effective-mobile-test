const headers = {
  "Content-Type": "application/json",
}

const origin = "http://0.0.0.0:3000"

export async function request(method, endpoint, data = null, authToken = null) {
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  const res = await fetch(origin + endpoint, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  })
  return await res.json()
}