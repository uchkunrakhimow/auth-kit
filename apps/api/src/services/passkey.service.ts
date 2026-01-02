import { PasskeyRepository } from "../repositories/passkey.repository";

export interface CreatePasskeyData {
  userId: string;
  credentialId: string;
  publicKey: string;
  deviceName?: string;
}

export class PasskeyService {
  private passkeyRepository: PasskeyRepository;

  constructor() {
    this.passkeyRepository = new PasskeyRepository();
  }

  async createPasskey(data: CreatePasskeyData) {
    try {
      const existingPasskey = await this.passkeyRepository.findByCredentialId(
        data.credentialId
      );

      if (existingPasskey) {
        throw new Error("Passkey with this credential ID already exists");
      }

      return await this.passkeyRepository.create(data);
    } catch (error) {
      console.error("Error in createPasskey service:", error);
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
      throw new Error(
        error instanceof Error
          ? `Failed to create passkey: ${error.message}`
          : "Failed to create passkey"
      );
    }
  }

  async getUserPasskeys(userId: string) {
    try {
      return await this.passkeyRepository.findByUserId(userId);
    } catch (error) {
      console.error("Error in getUserPasskeys service:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to retrieve passkeys: ${error.message}`
          : "Failed to retrieve passkeys"
      );
    }
  }

  async getPasskeyByCredentialId(credentialId: string) {
    return await this.passkeyRepository.findByCredentialId(credentialId);
  }

  async deletePasskey(passkeyId: string, userId: string) {
    const passkey = await this.passkeyRepository.findById(passkeyId);

    if (!passkey) {
      throw new Error("Passkey not found");
    }

    if (passkey.userId !== userId) {
      throw new Error("Unauthorized to delete this passkey");
    }

    await this.passkeyRepository.delete(passkeyId);
  }

  async updatePasskeyCounter(credentialId: string, counter: bigint) {
    const passkey = await this.passkeyRepository.findByCredentialId(
      credentialId
    );

    if (!passkey) {
      throw new Error("Passkey not found");
    }

    return await this.passkeyRepository.update(passkey.id, {
      counter,
      lastUsedAt: new Date(),
    });
  }
}

