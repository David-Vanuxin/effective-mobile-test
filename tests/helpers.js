const headers = {
  "Content-Type": "application/json",
}

const origin = "http://0.0.0.0:3000"

export async function request(method, endpoint, data = null, authToken = null) {
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  try {
    const res = await fetch(origin + endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const json = await res.json()
    // console.dir({method, endpoint, json})
    return json

  } catch (err) {
    console.dir({method, endpoint, data, authToken})
    console.error(err)

    const res = await fetch(origin + endpoint, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const txt = await res.text()
    console.dir({method, endpoint, txt})

  }

}

export function generateRandomUserData() {
  return {
    firstname: "Иванов",
    secondname: "Иван",
    patronymic: "Иванович",
    email: `test${Math.round(Math.random() * 1000)}@mail.com`,
    password: "1234",
    birthdate: Date.now(),
  }
}