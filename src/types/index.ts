import type { Request, Express } from "express"
import type { Document } from "mongoose"

// User types
export interface IUser {
  id: string
  email: string
  password: string
  createdAt: Date
}

export interface IUserDocument extends IUser, Document {
  _id: string
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

// Auth types
export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenPayload {
  userId: string
  email: string
}

export interface AuthApiResponse extends ApiResponse<{ token: string; user: { id: string; email: string } }> {}

// Image operation types
export interface ImageRequest {
  file: Express.Multer.File
  token?: string
  user?: TokenPayload
  params: OperationParams
}

export interface ImageResponse {
  buffer: Buffer
  format: string
  filename: string
}

export type OperationParams = ResizeParams | CropParams | FormatParams | RotateParams | FilterParams | PipelineParams

export interface ResizeParams {
  width?: number
  height?: number
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
}

export interface CropParams {
  left: number
  top: number
  width: number
  height: number
}

export interface FormatParams {
  format: "jpeg" | "png" | "webp"
}

export interface RotateParams {
  angle: 90 | 180 | 270
}

export interface FilterParams {
  filter: "blur" | "sharpen" | "grayscale"
}

export interface PipelineOperation {
  type: string
  params?: Record<string, unknown>
}

export interface PipelineParams {
  operations: PipelineOperation[]
}

// Logging types
export interface LogEntry {
  timestamp: string
  level: "info" | "error"
  user: string
  endpoint: string
  params: Record<string, unknown>
  duration: number
  result: "success" | "error"
  message?: string
}

// Express Request with user
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload
}
