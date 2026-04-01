import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../server';

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), false);

        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

        if (!user) {
          // Try to find by email (link existing account)
          user = await prisma.user.findUnique({ where: { email } });
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatar: profile.photos?.[0]?.value },
            });
          } else {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || email.split('@')[0],
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                stats: { create: {} },
              },
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

passport.serializeUser((user: unknown, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
