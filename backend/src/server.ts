import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT || '4000', 10);

async function main() {
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(PORT, () => {
    console.log(`🚀 Logic Looper API running on http://localhost:${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  });
}

main().catch((err) => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
