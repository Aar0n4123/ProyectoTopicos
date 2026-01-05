---
description: Repository Information Overview
alwaysApply: true
---

# Image Manipulation API Information

## Summary
The **Image Manipulation API** is a RESTful service developed as part of the "Tópicos Especiales de Programación" course at UCAB. It provides image processing capabilities (resize, crop, rotate, filters) using **Sharp**. The project demonstrates advanced software engineering principles including **AOP (Aspect Oriented Programming)** via decorators, **Injection of Dependencies**, and design patterns such as **Strategy, Decorator, and Factory**.

## Structure
- **src/**: Main source code directory.
  - **config/**: Configuration for database and other environment settings.
  - **decorators/**: Implementation of AOP aspects like `AuthDecorator` and `LoggingDecorator`.
  - **handlers/**: Request handlers for image processing.
  - **logging/**: Logging infrastructure (File, MongoDB, Composite).
  - **models/**: Mongoose schemas and data models (e.g., `User`).
  - **routes/**: Express route definitions for authentication and image operations.
  - **services/**: Core business logic (Sharp-based image processing, authentication).
  - **types/**: Centralized TypeScript type definitions.
- **styles/**: Global CSS styles (likely for a future or partially implemented frontend).
- **logs/**: Local directory for application logs.

## Language & Runtime
**Language**: TypeScript  
**Version**: Node.js v18+  
**Build System**: TSC (TypeScript Compiler)  
**Package Manager**: npm (pnpm-lock.yaml suggests pnpm is also used)

## Dependencies
**Main Dependencies**:
- **express**: Web framework for the API.
- **sharp**: High-performance image processing library.
- **mongoose**: MongoDB object modeling tool.
- **jsonwebtoken**: JWT implementation for secure authentication.
- **bcryptjs**: Library for hashing passwords.
- **multer**: Middleware for handling `multipart/form-data` (image uploads).
- **next / react / react-dom**: UI framework and libraries (present in dependencies but the core is Express).

**Development Dependencies**:
- **typescript**: Language support and compiler.
- **ts-node-dev**: Development tool for automatic reloading.
- **eslint**: Linting tool for code quality.
- **tailwindcss / postcss**: Styling utilities.

## Build & Installation
```bash
# Install dependencies
npm install

# Build the project (compiles TS to JS in dist/)
npm run build

# Run in development mode with hot-reload
npm run dev

# Start the compiled production build
npm start
```

## Main Files & Resources
- **src/index.ts**: Main entry point that initializes the Express application, database connection, and routes.
- **src/config/database.ts**: MongoDB connection configuration.
- **.env.example**: Template for environment variables (MONGODB_URI, JWT_SECRET, etc.).
- **src/routes/image.routes.ts**: Entry point for all image manipulation endpoints.

## Validation
- **Linting**: ESLint is used for static analysis.
```bash
npm run lint
```
- **Type Checking**: TypeScript provides static type safety throughout the codebase.
- **Logging**: The system validates operations via comprehensive logging to both `logs/app.log` and a MongoDB collection.
