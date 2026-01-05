import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import User from "../models/User"
import type { RegisterRequest, LoginRequest, TokenPayload } from "../types"

export class AuthService {
  constructor(
    private jwtSecret: string,
    private jwtExpiresIn: string = "24h",
  ) {}

  async register(request: RegisterRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    const { email, password } = request

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = new User({
      email,
      password: hashedPassword,
    })

    await user.save()

    const token = this.generateToken(user._id.toString(), user.email)

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  async login(request: LoginRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    const { email, password } = request

    const user = await User.findOne({ email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error("Invalid credentials")
    }

    const token = this.generateToken(user._id.toString(), user.email)

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      return decoded
    } catch {
      throw new Error("Invalid or expired token")
    }
  }

  private generateToken(userId: string, email: string): string {
    const payload = { userId, email }
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    })
  }
}
