import { AppDataSource } from "./data-source.js"
import app from "./app.js"

try {
  await AppDataSource.initialize()
  console.log("Data Source has been initialized!")
} catch (error) {
  console.log(error)
}

app.listen(3000, () => {
  console.log(`Server started`)
})
