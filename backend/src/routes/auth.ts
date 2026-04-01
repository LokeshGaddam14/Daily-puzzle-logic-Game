import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { requireAuth, AuthRequest, AuthUser } from '../middleware/auth.middleware';

const router = Router();

// ── Google OAuth ─────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=failed' }),
  (req: Request, res: Response) => {
    // passport.authenticate populates req.user
    const user = req.user as AuthUser;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '30d' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?token=${token}`);
  }
);

// ── Current user ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response) => {
  // requireAuth ensures req.user exists
  const authReq = req as AuthRequest;
  res.json({ status: 'success', data: authReq.user });
});

// ── Logout ────────────────────────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Logged out' });
});

export default router;
