import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import cors from "cors";
import { v4 } from "uuid";
import { env } from "./env";
import { UserService } from "./services/user.service";
import { SessionRepository } from "./repositories/session.repository";
import { extractDeviceInfo } from "./utils/device.util";
import { authRoutes } from "./routes/auth.routes";
import { sessionRoutes } from "./routes/session.routes";
import { passkeyRoutes } from "./routes/passkey.routes";
import { roleRoutes } from "./routes/role.routes";
import { userRoutes } from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: env.ORIGIN_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    genid: () => {
      return v4();
    },
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on every request
    name: "sessionId", // Custom session name
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (2,592,000,000 ms)
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: unknown, done) => {
  done(null, user as Express.User);
});

// Google OAuth (optional, only if credentials are provided)
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.CALLBACK_URL) {
  const userService = new UserService();

  passport.use(
    new Strategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleProfile = {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails,
            photos: profile.photos,
          };
          const user = await userService.findOrCreateByGoogleProfile(
            googleProfile,
            accessToken
          );
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${env.ORIGIN_URL}/auth/login`,
    }),
    async (req, res) => {
      try {
        // Create database session after Google OAuth
        const sessionToken = req.sessionID;
        const user = req.user as { id: string };

        if (sessionToken && user?.id) {
          const sessionRepository = new SessionRepository();
          const deviceInfo = extractDeviceInfo(req);

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await sessionRepository.create({
            userId: user.id,
            sessionToken,
            deviceName: deviceInfo.deviceName,
            deviceType: deviceInfo.deviceType,
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            expiresAt,
          });
        }

        res.redirect(`${env.ORIGIN_URL}/me`);
      } catch (error) {
        console.error("Error creating session after Google OAuth:", error);
        res.redirect(`${env.ORIGIN_URL}/auth/login`);
      }
    }
  );
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to OAuth API",
    sessionId: req.sessionID,
  });
});

app.use("/auth", authRoutes);
app.use("/sessions", sessionRoutes);
app.use("/passkeys", passkeyRoutes);
app.use("/admin", roleRoutes);
app.use("/users", userRoutes);

app.listen(Number(env.PORT), () => {
  console.log(`[STARTUP] HTTP server is running at http://0.0.0.0:${env.PORT}`);
});
