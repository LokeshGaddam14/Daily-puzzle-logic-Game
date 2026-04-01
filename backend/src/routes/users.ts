import { Router, Response, Request } from 'express';
import { prisma } from '../server';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler, AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { stats: true },
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ status: 'success', data: user });
}));

// PATCH /api/users/me
router.patch('/me', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user.id;
  const { name, avatar } = req.body;
  if (name && (typeof name !== 'string' || name.length > 60)) {
    throw new AppError(400, 'Invalid name');
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(avatar ? { avatar } : {}),
    },
  });
  res.json({ status: 'success', data: updated });
}));

export default router;
