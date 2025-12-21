import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

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
}
