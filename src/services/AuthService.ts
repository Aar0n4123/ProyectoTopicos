import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import User from "../models/User"
import type { RegisterRequest, LoginRequest, TokenPayload } from "../types"

/**
 * Servicio encargado de la lógica de autenticación y gestión de usuarios
 */
export class AuthService {
  constructor(
    private jwtSecret: string,
    private jwtExpiresIn: string = "24h",
  ) {}

  /**
   * Registra un nuevo usuario en la base de datos
   */
  async register(request: RegisterRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    const { email, password } = request

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error("User already exists")
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = new User({
      email,
      password: hashedPassword,
    })

    await user.save()

    // Generar token de acceso para el nuevo usuario
    const token = this.generateToken(user._id.toString(), user.email)

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  /**
   * Valida las credenciales de un usuario y genera un token
   */
  async login(request: LoginRequest): Promise<{ token: string; user: { id: string; email: string } }> {
    const { email, password } = request

    // Buscar usuario por email
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Comparar la contraseña ingresada con la encriptada en la DB
    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error("Invalid credentials")
    }

    // Generar token de sesión
    const token = this.generateToken(user._id.toString(), user.email)

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    }
  }

  /**
   * Verifica la validez de un token JWT
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload
      return decoded
    } catch {
      throw new Error("Invalid or expired token")
    }
  }

  /**
   * Genera un nuevo token JWT firmado
   */
  private generateToken(userId: string, email: string): string {
    const payload = { userId, email }
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any,
    })
  }
}
