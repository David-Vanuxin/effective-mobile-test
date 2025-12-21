import User from "./entity/User.js"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  entities: [User],
  synchronize: true,
})
