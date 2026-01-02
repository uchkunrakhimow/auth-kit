import { SessionRepository } from "../repositories/session.repository";

export class SessionService {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async validateSession(sessionToken: string) {
    const session = await this.sessionRepository.findBySessionToken(
      sessionToken
    );

    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.delete(session.id);
      return null;
    }

    await this.sessionRepository.update(session.id, {
      lastActivity: new Date(),
    });

    return session;
  }

  async getUserSessions(userId: string) {
    return await this.sessionRepository.findByUserId(userId);
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== userId) {
      throw new Error("Unauthorized to delete this session");
    }

    await this.sessionRepository.delete(sessionId);
  }

  async deleteAllUserSessions(userId: string) {
    await this.sessionRepository.deleteByUserId(userId);
  }
}

