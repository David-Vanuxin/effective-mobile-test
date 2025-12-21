import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import Session from "./Session.js"

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstname: string

  @Column()
  secondname: string

  @Column()
  patronymic: string

  @Column({
    unique: true,
  })
  email: string

  @Column()
  password: string

  @Column()
  birthdate: number

  @Column({
    enum: ["admin", "user"],
    default: "user",
  })
  role: string

  @Column({
    default: true,
  })
  active: boolean

  @OneToMany(() => Session, session => session.user)
  sessions: Session[]
}
