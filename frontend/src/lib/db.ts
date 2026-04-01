import { openDB, type IDBPDatabase } from 'idb';
import type { PuzzleProgress, StreakData } from '../types';

const DB_NAME = 'logic-looper-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Puzzle progress store
        if (!db.objectStoreNames.contains('puzzle_progress')) {
          const ps = db.createObjectStore('puzzle_progress', { keyPath: 'date' });
          ps.createIndex('completed', 'completed');
        }

        // Streak data store (single record)
        if (!db.objectStoreNames.contains('streak')) {
          db.createObjectStore('streak', { keyPath: 'id' });
        }

        // User preferences
        if (!db.objectStoreNames.contains('prefs')) {
          db.createObjectStore('prefs', { keyPath: 'key' });
        }

        // Hints used today
        if (!db.objectStoreNames.contains('hints')) {
          db.createObjectStore('hints', { keyPath: 'date' });
        }

        // Achievements
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ============================================
// PUZZLE PROGRESS
// ============================================

export async function savePuzzleProgress(progress: PuzzleProgress): Promise<void> {
  const db = await getDB();
  await db.put('puzzle_progress', progress);
}

export async function getPuzzleProgress(date: string): Promise<PuzzleProgress | undefined> {
  const db = await getDB();
  return db.get('puzzle_progress', date);
}

export async function getAllProgress(): Promise<PuzzleProgress[]> {
  const db = await getDB();
  return db.getAll('puzzle_progress');
}

// ============================================
// STREAK DATA
// ============================================

const STREAK_KEY = 'streak_singleton';

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPlayed: null,
  history: {},
};

export async function getStreakData(): Promise<StreakData> {
  const db = await getDB();
  const record = await db.get('streak', STREAK_KEY);
  return record?.data ?? DEFAULT_STREAK;
}

export async function saveStreakData(data: StreakData): Promise<void> {
  const db = await getDB();
  await db.put('streak', { id: STREAK_KEY, data });
}

export async function updateStreakAfterSolve(date: string, score: number): Promise<StreakData> {
  const streak = await getStreakData();
  const today = date;

  if (streak.lastPlayed === today) {
    // Already played today, just update score
    streak.history[today] = Math.max(streak.history[today] ?? 0, score);
    await saveStreakData(streak);
    return streak;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const isConsecutive = streak.lastPlayed === yesterdayStr;

  streak.currentStreak = isConsecutive ? streak.currentStreak + 1 : 1;
  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastPlayed = today;
  streak.history[today] = score;

  await saveStreakData(streak);
  return streak;
}

// ============================================
// HINTS
// ============================================

export async function getHintsUsed(date: string): Promise<number> {
  const db = await getDB();
  const record = await db.get('hints', date);
  return record?.count ?? 0;
}

export async function incrementHint(date: string): Promise<number> {
  const db = await getDB();
  const current = (await db.get('hints', date))?.count ?? 0;
  const next = current + 1;
  await db.put('hints', { date, count: next });
  return next;
}

// ============================================
// USER PREFS
// ============================================

export async function getPref(key: string): Promise<unknown> {
  const db = await getDB();
  const record = await db.get('prefs', key);
  return record?.value;
}

export async function setPref(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('prefs', { key, value });
}

// ============================================
// ACHIEVEMENTS
// ============================================

export async function getUnlockedAchievements(): Promise<string[]> {
  const db = await getDB();
  const all = await db.getAll('achievements');
  return all.map(a => a.id);
}

export async function unlockAchievement(id: string): Promise<boolean> {
  const db = await getDB();
  const existing = await db.get('achievements', id);
  if (existing) return false; // already unlocked
  await db.put('achievements', { id, unlockedAt: new Date().toISOString() });
  return true;
}

// ============================================
// HEATMAP DATA (derived from progress)
// ============================================

export async function getHeatmapData(): Promise<Record<string, number>> {
  const all = await getAllProgress();
  const map: Record<string, number> = {};
  for (const p of all) {
    if (p.completed) map[p.date] = p.score;
  }
  return map;
}
