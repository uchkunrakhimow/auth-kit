import { UserRepository } from "../repositories/user.repository";
import type { Role } from "../types/enums";

export class RoleService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async updateUserRole(userId: string, newRole: Role) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return await this.userRepository.updateRole(userId, newRole);
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }
}

