import { Router, Response, Request } from 'express';
import { prisma } from '../server';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import rateLimit from 'express-rate-limit';
import dayjs from 'dayjs';

const router = Router();

// Rate limit: 2 submissions per day per user
const submitLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 2,
  message: { status: 'error', message: 'Score already submitted today' },
  keyGenerator: (req: Request) => (req as AuthRequest).user?.id || req.ip || '',
});

// POST /api/scores — submit today's score
router.post('/', requireAuth, submitLimit, asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user.id;
  const { puzzleType, score, timeTaken, hintsUsed, date } = req.body;

  if (!puzzleType || score === undefined || !timeTaken || !date) {
    throw new AppError(400, 'Missing required fields');
  }

  const today = dayjs().format('YYYY-MM-DD');
  if (date !== today) throw new AppError(400, 'Can only submit for today');
  if (score < 0 || score > 1500) throw new AppError(400, 'Invalid score');

  // Upsert score (allow update if improving)
  const existing = await prisma.dailyScore.findUnique({ where: { userId_date: { userId, date } } });

  let savedScore;
  if (existing) {
    if (score <= existing.score) {
      return res.json({ status: 'success', data: existing, improved: false });
    }
    savedScore = await prisma.dailyScore.update({
      where: { id: existing.id },
      data: { score, timeTaken, hintsUsed },
    });
  } else {
    savedScore = await prisma.dailyScore.create({
      data: { userId, date, puzzleType, score, timeTaken, hintsUsed },
    });
  }

  // Update user stats and streak
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const isConsecutive = user.lastPlayed === yesterday || user.lastPlayed === today;
    const newStreak = isConsecutive ? user.streakCount + (user.lastPlayed === today ? 0 : 1) : 1;

    await prisma.user.update({
      where: { id: userId },
      data: {
        streakCount: newStreak,
        lastPlayed: today,
        totalPoints: { increment: score - (existing?.score ?? 0) },
      },
    });

    await prisma.userStats.upsert({
      where: { userId },
      update: {
        puzzlesSolved: { increment: existing ? 0 : 1 },
        hintsTotal: { increment: hintsUsed },
      },
      create: { userId, puzzlesSolved: 1, hintsTotal: hintsUsed },
    });
  }

  res.status(201).json({ status: 'success', data: savedScore, improved: true });
}));

// GET /api/scores/today
router.get('/today', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const today = dayjs().format('YYYY-MM-DD');
  const score = await prisma.dailyScore.findUnique({
    where: { userId_date: { userId: authReq.user.id, date: today } },
  });
  res.json({ status: 'success', data: score });
}));

export default router;
