import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import type { RootState, AppDispatch } from '../store';
import { fetchDailyLeaderboard, fetchAllTimeLeaderboard } from '../store/slices/leaderboardSlice';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import dayjs from 'dayjs';

type Tab = 'daily' | 'alltime';

export const LeaderboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { daily, allTime, isLoading } = useSelector((s: RootState) => s.leaderboard);
  const { user } = useSelector((s: RootState) => s.auth);
  const [tab, setTab] = useState<Tab>('daily');

  useEffect(() => {
    dispatch(fetchDailyLeaderboard());
    dispatch(fetchAllTimeLeaderboard());
  }, [dispatch]);

  const entries = tab === 'daily' ? daily : allTime;

  const rankStyle = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-text-primary">Leaderboard</h1>
        <p className="text-text-muted text-sm font-body mt-1">
          {tab === 'daily' ? `Today · ${dayjs().format('MMMM D, YYYY')}` : 'All-Time Rankings'}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-bg-surface border border-border rounded-xl p-1">
        {(['daily', 'alltime'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all duration-200',
              tab === t
                ? 'bg-primary text-white shadow-glow'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {t === 'daily' ? 'Today' : 'All-Time'}
          </button>
        ))}
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          loading={isLoading}
          onClick={() => {
            dispatch(fetchDailyLeaderboard());
            dispatch(fetchAllTimeLeaderboard());
          }}
        >
          ↻ Refresh
        </Button>
      </div>

      {/* List */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-text-muted font-body">
              {tab === 'daily' ? "No one has solved today's puzzle yet." : 'No scores recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, i) => {
              const isMe = entry.userId === user?.id;
              return (
                <motion.div
                  key={entry.userId}
                  className={[
                    'flex items-center gap-4 px-5 py-3.5 transition-colors',
                    isMe ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-bg-elevated',
                  ].join(' ')}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Rank */}
                  <span className={`w-8 text-center font-display font-bold text-lg ${
                    i < 3 ? '' : 'text-text-muted text-base'
                  }`}>
                    {rankStyle(i + 1)}
                  </span>

                  {/* Avatar + Name */}
                  <Avatar name={entry.name} src={entry.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-body font-medium truncate ${
                      isMe ? 'text-primary' : 'text-text-primary'
                    }`}>
                      {entry.name} {isMe && <span className="text-xs">(you)</span>}
                    </p>
                    <p className="text-xs text-text-muted font-body">
                      {entry.hintsUsed === 0 ? 'No hints 🧠' : `${entry.hintsUsed} hint${entry.hintsUsed > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Score + Time */}
                  <div className="text-right shrink-0">
                    <div className="font-display font-bold text-primary">{entry.score.toLocaleString()}</div>
                    <div className="text-xs text-text-muted font-body">
                      {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-text-muted font-body">
        Top 100 players · Updated after each submission
      </p>
    </div>
  );
};
