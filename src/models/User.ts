import mongoose, { Schema, type Model } from "mongoose"
import type { IUserDocument } from "../types"

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

const User: Model<IUserDocument> = mongoose.model<IUserDocument>("User", userSchema)

export default User
