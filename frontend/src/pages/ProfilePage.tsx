import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { RootState } from '../store';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { StreakWidget } from '../components/ui/StreakWidget';
import { ACHIEVEMENTS } from '../types';
import { getAllProgress, getUnlockedAchievements } from '../lib/db';
import type { PuzzleProgress } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useSelector((s: RootState) => s.auth);
  const { currentStreak, longestStreak } = useSelector((s: RootState) => s.streak);

  const [history, setHistory] = useState<PuzzleProgress[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    getAllProgress().then(data => setHistory(data.sort((a, b) => b.date.localeCompare(a.date))));
    getUnlockedAchievements().then(setAchievements);
  }, []);

  const solved = history.filter(h => h.completed && !h.gaveUp);
  const avgTime = solved.length > 0
    ? Math.round(solved.reduce((sum, h) => sum + h.timeTaken, 0) / solved.length)
    : 0;
  const bestScore = solved.length > 0 ? Math.max(...solved.map(h => h.score)) : 0;

  if (isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Sign In to See Profile</h1>
        <p className="text-text-muted font-body mb-6">
          Track your progress, streaks, and achievements by creating a free account.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
          Sign In / Register
        </Button>
        <p className="text-text-muted text-xs font-body mt-4">
          Local stats are still saved offline as a guest.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Avatar name={user?.name} src={user?.avatar} size="xl" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-text-primary">{user?.name}</h1>
          <p className="text-text-muted text-sm font-body">{user?.email}</p>
          <div className="mt-2">
            <StreakWidget streak={currentStreak} size="sm" />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: 'Solved', value: solved.length, icon: '✅' },
          { label: 'Best Streak', value: longestStreak, icon: '🔥' },
          { label: 'Avg Time', value: `${Math.floor(avgTime / 60)}m ${avgTime % 60}s`, icon: '⏱️' },
          { label: 'Best Score', value: bestScore.toLocaleString(), icon: '⭐' },
        ].map(stat => (
          <Card key={stat.label} padding="md" className="text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-xl text-text-primary">{stat.value}</div>
            <div className="text-text-muted text-xs font-body mt-0.5">{stat.label}</div>
          </Card>
        ))}
      </motion.div>

      {/* Achievements */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display font-bold text-lg text-text-primary mb-3">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map(achievement => {
            const unlocked = achievements.includes(achievement.id);
            return (
              <Card
                key={achievement.id}
                padding="md"
                className={`${unlocked ? 'border-primary/40 bg-primary/5' : 'opacity-50'}`}
              >
                <div className={`text-3xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="font-body font-medium text-sm text-text-primary">{achievement.title}</div>
                <div className="text-text-muted text-xs font-body mt-0.5">{achievement.description}</div>
                {unlocked && (
                  <div className="text-accent text-xs font-body font-medium mt-1">✓ Unlocked</div>
                )}
              </Card>
            );
          })}
        </div>
      </motion.section>

      {/* Recent history */}
      {history.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display font-bold text-lg text-text-primary mb-3">Recent History</h2>
          <Card padding="none">
            <div className="divide-y divide-border">
              {history.slice(0, 10).map(h => (
                <div key={h.date} className="flex items-center gap-3 px-4 py-3">
                  <div className="text-2xl">
                    {h.gaveUp ? '😔' : h.completed ? '✅' : '⭕'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-body font-medium text-text-primary capitalize">
                      {h.puzzleType} — {h.date}
                    </div>
                    <div className="text-xs text-text-muted font-body capitalize">
                      {h.difficulty} · {Math.floor(h.timeTaken / 60)}m {h.timeTaken % 60}s
                      {h.hintsUsed > 0 && ` · ${h.hintsUsed} hints`}
                    </div>
                  </div>
                  {!h.gaveUp && (
                    <div className="font-display font-bold text-primary">{h.score}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      )}
    </div>
  );
};
