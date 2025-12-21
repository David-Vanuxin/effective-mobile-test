import express from "express"

const app = express()
const port = 3000

app.use(express.json())

app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Methods': "*",
    'Access-Control-Allow-Headers': "*",
  })
  next()
})

app.get('/', (req, res) => {
  res.end('Hello, World!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
