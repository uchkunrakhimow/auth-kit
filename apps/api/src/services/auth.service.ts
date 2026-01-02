import { UserRepository } from "../repositories/user.repository";
import {
  SessionRepository,
  type CreateSessionData,
} from "../repositories/session.repository";
import { hashPassword, comparePassword } from "../utils/password.util";
import type { Role } from "../types/enums";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  profilePic?: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.sessionRepository = new SessionRepository();
  }

  async register(data: RegisterData) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      picture: data.profilePic,
      role: "USER" as Role,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async login(
    credentials: LoginCredentials,
    sessionToken: string,
    deviceInfo?: {
      deviceName?: string;
      deviceType?: string;
      userAgent?: string;
      ipAddress?: string;
    }
  ) {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error("Password not set for this account");
    }

    const isPasswordValid = await comparePassword(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const sessionData: CreateSessionData = {
      userId: user.id,
      sessionToken,
      deviceName: deviceInfo?.deviceName,
      deviceType: deviceInfo?.deviceType,
      userAgent: deviceInfo?.userAgent,
      ipAddress: deviceInfo?.ipAddress,
      expiresAt,
    };

    await this.sessionRepository.create(sessionData);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async logout(sessionToken: string) {
    await this.sessionRepository.deleteBySessionToken(sessionToken);
  }
}
