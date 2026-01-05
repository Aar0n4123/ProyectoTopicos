import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User"
import type { TokenPayload, RegisterRequest, LoginRequest } from "../types"

export class AuthService {
  private jwtSecret: string
  private jwtExpiresIn: string

  constructor(jwtSecret: string, jwtExpiresIn = "24h") {
    this.jwtSecret = jwtSecret
    this.jwtExpiresIn = jwtExpiresIn
  }

  async register(data: RegisterRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
    })

    // Generate token
    const token = this.generateToken({ userId: user._id.toString(), email: user.email })

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  async login(data: LoginRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    // Find user
    const user = await User.findOne({ email: data.email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password)
    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Generate token
    const token = this.generateToken({ userId: user._id.toString(), email: user.email })

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn })
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }
}
