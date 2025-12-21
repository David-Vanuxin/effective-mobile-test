import express, {Request, Response, NextFunction} from "express"
import { AppDataSource } from "../data-source.js"
import Session from "../entity/Session.js"

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req)
    res.locals.user = await findUserBySessionToken(token)
    next()
  } catch (err) {
    console.error(err)
    res.status(400)
    res.json({ error: "Authorization error" })
  }
}

function extractToken(req: Request): string {
  const authHeader = req.get("Authorization")

  if (authHeader === undefined) throw new Error("Authorization needed")

  const token = authHeader.split(" ")[1]

  if (token) return token

  throw new Error("Invalid token")
}

async function findUserBySessionToken(token: string) {
  const session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token,
    },
    relations: {
      user: true,
    },
  })

  if (session) return session.user

  throw new Error("Invalid token")
}