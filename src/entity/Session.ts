import { Entity, Column, PrimaryColumn, ManyToOne, Relation } from "typeorm"
import User from "./User.js"

@Entity()
export default class Session {
  @PrimaryColumn()
  token: string

  @ManyToOne(() => User, user => user.sessions)
  user: Relation<User>
}
