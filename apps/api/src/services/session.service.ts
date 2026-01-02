import { SessionRepository } from "../repositories/session.repository";

export class SessionService {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async validateSession(sessionToken: string) {
    const session =
      await this.sessionRepository.findBySessionToken(sessionToken);

    if (!session) {
      return null;
    }

    // Check if session is expired
    const now = new Date();
    if (now > session.expiresAt) {
      await this.sessionRepository.delete(session.id);
      return null;
    }

    // Rolling expiration: extend session if it's less than 7 days until expiration
    const daysUntilExpiration =
      (session.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiration < 7) {
      // Extend expiration to 30 days from now
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      await this.sessionRepository.update(session.id, {
        lastActivity: now,
        expiresAt: newExpiresAt,
      });

      // Return updated session
      return {
        ...session,
        lastActivity: now,
        expiresAt: newExpiresAt,
      };
    }

    // Just update last activity if expiration is still far away
    await this.sessionRepository.update(session.id, {
      lastActivity: now,
    });

    return {
      ...session,
      lastActivity: now,
    };
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
