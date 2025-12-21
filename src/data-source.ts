import User from "./entity/User.js"
import Session from "./entity/Session.js"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  entities: [User, Session],
  synchronize: true,
})
