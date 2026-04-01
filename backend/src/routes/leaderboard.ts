import { Router, Request, Response } from 'express';
import { prisma } from '../server';
import { asyncHandler } from '../middleware/error.middleware';
import dayjs from 'dayjs';

const router = Router();

// GET /api/leaderboard/daily?date=YYYY-MM-DD
router.get('/daily', asyncHandler(async (req: Request, res: Response) => {
  const date = (req.query.date as string) || dayjs().format('YYYY-MM-DD');

  const scores = await prisma.dailyScore.findMany({
    where: { date, gaveUp: false },
    orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }],
    take: 100,
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  const entries = scores.map((s, i) => ({
    rank: i + 1,
    userId: s.user.id,
    name: s.user.name,
    avatar: s.user.avatar,
    score: s.score,
    timeTaken: s.timeTaken,
    hintsUsed: s.hintsUsed,
  }));

  res.json({ status: 'success', data: entries });
}));

// GET /api/leaderboard/alltime
router.get('/alltime', asyncHandler(async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { totalPoints: { gt: 0 } },
    orderBy: { totalPoints: 'desc' },
    take: 100,
    select: {
      id: true, name: true, avatar: true,
      totalPoints: true, streakCount: true,
      stats: { select: { puzzlesSolved: true } },
    },
  });

  const entries = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    score: u.totalPoints,
    timeTaken: 0,
    hintsUsed: 0,
    streak: u.streakCount,
    solved: u.stats?.puzzlesSolved ?? 0,
  }));

  res.json({ status: 'success', data: entries });
}));

export default router;
