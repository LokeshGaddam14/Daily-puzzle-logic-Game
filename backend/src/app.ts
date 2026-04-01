import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth';
import scoresRoutes from './routes/scores';
import leaderboardRoutes from './routes/leaderboard';
import usersRoutes from './routes/users';
import './config/passport';

const app = express();

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));

// ── Parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Session (for Passport OAuth flow) ────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'logic-looper-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/scores',      scoresRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/users',       usersRoutes);

// ── Error handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
