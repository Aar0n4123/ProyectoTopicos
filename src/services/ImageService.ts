import sharp, { type Sharp } from "sharp"
import type { ResizeParams, CropParams, FormatParams, RotateParams, FilterParams } from "../types"

export interface IImageOperation {
  execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer>
}

export class ResizeOperation implements IImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { width, height, fit } = params as ResizeParams

    let sharpInstance: Sharp = sharp(buffer)

    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, { fit: fit || "cover" })
    }

    return await sharpInstance.toBuffer()
  }
}

export class CropOperation implements IImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { left, top, width, height } = params as CropParams

    return await sharp(buffer).extract({ left, top, width, height }).toBuffer()
  }
}

export class FormatOperation implements IImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { format } = params as FormatParams

    return await sharp(buffer).toFormat(format).toBuffer()
  }
}

export class RotateOperation implements IImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { angle } = params as RotateParams

    return await sharp(buffer).rotate(angle).toBuffer()
  }
}

export class FilterOperation implements IImageOperation {
  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { filter } = params as FilterParams

    let sharpInstance: Sharp = sharp(buffer)

    switch (filter) {
      case "blur":
        sharpInstance = sharpInstance.blur(5)
        break
      case "sharpen":
        sharpInstance = sharpInstance.sharpen()
        break
      case "grayscale":
        sharpInstance = sharpInstance.grayscale()
        break
      default:
        throw new Error(`Unknown filter: ${filter}`)
    }

    return await sharpInstance.toBuffer()
  }
}

export class OperationFactory {
  private operations: Map<string, IImageOperation>

  constructor() {
    this.operations = new Map()
    this.operations.set("resize", new ResizeOperation())
    this.operations.set("crop", new CropOperation())
    this.operations.set("format", new FormatOperation())
    this.operations.set("rotate", new RotateOperation())
    this.operations.set("filter", new FilterOperation())
    this.operations.set("pipeline", new PipelineOperation(this))
  }

  getOperation(type: string): IImageOperation {
    const operation = this.operations.get(type)
    if (!operation) {
      throw new Error(`Unknown operation: ${type}`)
    }
    return operation
  }
}

export class PipelineOperation implements IImageOperation {
  constructor(private factory: OperationFactory) {}

  async execute(buffer: Buffer, params: Record<string, unknown>): Promise<Buffer> {
    const { operations } = params as unknown as { operations: Array<{ type: string; params?: Record<string, unknown> }> }

    if (!operations || !Array.isArray(operations)) {
      throw new Error("Invalid pipeline operations")
    }

    let currentBuffer = buffer

    for (const op of operations) {
      const operation = this.factory.getOperation(op.type)
      currentBuffer = await operation.execute(currentBuffer, op.params || {})
    }

    return currentBuffer
  }
}
