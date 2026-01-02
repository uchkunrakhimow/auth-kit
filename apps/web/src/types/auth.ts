export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  VIEWER = "VIEWER",
  EDITOR = "EDITOR",
}

export type User = {
  id: string
  email: string
  name?: string | null
  picture?: string | null
  role: Role
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  message: string
  user: User
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  profilePic?: string
}
