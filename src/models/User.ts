import mongoose, { Schema, type Model } from "mongoose"
import type { IUserDocument } from "../types"

/**
 * Definición del esquema de Mongoose para el modelo de Usuario
 */
const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Creación del modelo basado en el esquema definido
const User: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema)

export default User
