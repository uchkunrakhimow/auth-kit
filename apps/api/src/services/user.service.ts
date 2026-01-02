import { UserRepository } from "../repositories/user.repository";
import type { CreateUserData } from "../repositories/user.repository";
import type { GoogleProfile } from "../types/google-profile";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findOrCreateByGoogleProfile(profile: GoogleProfile, accessToken: string) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new Error("Email is required from Google profile");
    }

    const userData: CreateUserData = {
      email,
      googleId: profile.id,
      name: profile.displayName,
      picture: profile.photos?.[0]?.value,
      accessToken,
    };

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      if (!existingUser.googleId && profile.id) {
        return await this.userRepository.updateByEmail(email, {
          name: userData.name,
          picture: userData.picture,
          accessToken: userData.accessToken,
          googleId: userData.googleId,
        });
      }
      return await this.userRepository.updateByEmail(email, {
        name: userData.name,
        picture: userData.picture,
        accessToken: userData.accessToken,
      });
    }

    return await this.userRepository.create(userData);
  }
}
