import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Flame, Zap, Trophy, Crown, ArrowRight, Play, Medal, Hash, Boxes, Fingerprint, Focus, Activity } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { setStreakData } from '../store/slices/streakSlice';
import { fetchDailyLeaderboard } from '../store/slices/leaderboardSlice';
import { HeatmapGrid } from '../components/ui/HeatmapGrid';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PuzzleTypeBadge } from '../components/ui/PuzzleTypeBadge';
import { Avatar } from '../components/ui/Avatar';
import { getStreakData, getHeatmapData } from '../lib/db';
import { getPuzzleTypeForDate, getDifficultyForDate, getDateString } from '../engine/seed';
import dayjs from 'dayjs';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } },
  item: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  },
};

const NumberTicker = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1500;
    const incrementTime = (duration / end) * 3;
    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isGuest } = useSelector((s: RootState) => s.auth);
  const { currentStreak, longestStreak } = useSelector((s: RootState) => s.streak);
  const { daily: leaderboard } = useSelector((s: RootState) => s.leaderboard);

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const today = getDateString();
  const todayPuzzleType = getPuzzleTypeForDate(today);
  const todayDifficulty = getDifficultyForDate(today);

  useEffect(() => {
    getStreakData().then(data => dispatch(setStreakData(data)));
    getHeatmapData().then(setHeatmapData);
    dispatch(fetchDailyLeaderboard());
  }, [dispatch]);

  const puzzleTypeLabels: Record<string, string> = {
    sudoku: 'Number Matrix',
    pattern: 'Pattern Match',
    sequence: 'Sequence Solver',
    deduction: 'Deduction Grid',
    binary: 'Binary Logic',
  };

  const puzzleIcons: Record<string, React.ReactNode> = {
    sudoku: <Hash className="w-6 h-6 text-primary" />,
    pattern: <Fingerprint className="w-6 h-6 text-primary" />,
    sequence: <Activity className="w-6 h-6 text-primary" />,
    deduction: <Focus className="w-6 h-6 text-primary" />,
    binary: <Boxes className="w-6 h-6 text-primary" />,
  };

  const difficultyColor: Record<string, string> = {
    easy: 'text-accent shadow-[0_0_12px_rgba(0,240,255,0.4)]',
    medium: 'text-warning shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    hard: 'text-error shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  };

  // Mouse tilt effect for hero card
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12 pb-24 relative">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

      {/* Hero section */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-8">
        
        {/* Greeting */}
        <motion.div variants={stagger.item} className="space-y-2">
          <p className="text-primary-light text-sm font-semibold tracking-widest uppercase">
            {dayjs().format('dddd, MMMM D')}
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-text-primary to-text-secondary">
            {isGuest ? 'Welcome Back' : `Hey, ${user?.name?.split(' ')[0]} 👋`}
          </h1>
        </motion.div>

        {/* Today's puzzle CTA - Ultra Premium */}
        <motion.div variants={stagger.item}>
          <div 
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0c1a]/80 backdrop-blur-3xl shadow-[0_24px_80px_-12px_rgba(93,61,232,0.4)] transition-all hover:border-primary/40 duration-500 will-change-transform"
            onMouseMove={({ currentTarget, clientX, clientY }) => {
              let { left, top } = currentTarget.getBoundingClientRect();
              mouseX.set(clientX - left);
              mouseY.set(clientY - top);
            }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(93, 61, 232, 0.15), transparent 80%)`
              }}
            />
            {/* Glossy inner bevel */}
            <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none" />
            
            <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                    <Zap className="w-3.5 h-3.5 text-accent" /> Daily Drop
                  </span>
                  <span className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md ${difficultyColor[todayDifficulty].split(' ')[0]}`}>
                    {todayDifficulty}
                  </span>
                </div>
                
                <div>
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight">
                    {puzzleTypeLabels[todayPuzzleType]}
                  </h2>
                  <p className="text-text-secondary text-base max-w-sm leading-relaxed">
                    Test your logic limits with today's dynamically generated mind-bender. No hints, pure skill.
                  </p>
                </div>
                
                <div className="pt-2">
                  <PuzzleTypeBadge type={todayPuzzleType} size="md" />
                </div>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/play')}
                className="sm:shrink-0 w-full sm:w-auto min-w-[180px] shadow-[0_0_30px_rgba(93,61,232,0.6)]"
                icon={<Play className="w-5 h-5 fill-current" />}
              >
                Start Puzzle
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={stagger.item} className="grid grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: 'Current Streak', value: currentStreak, icon: <Flame className="w-6 h-6 text-streak" />, color: 'text-streak', glow: 'shadow-glow-streak' },
            { label: 'Longest Streak', value: longestStreak, icon: <Crown className="w-6 h-6 text-warning" />, color: 'text-warning', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
            { label: 'Total Points', value: user?.totalPoints ?? 0, icon: <Trophy className="w-6 h-6 text-accent" />, color: 'text-accent', glow: 'shadow-glow-accent' },
          ].map((stat, i) => (
            <Card key={stat.label} padding="lg" elevated className="group text-center border-t border-t-white/10">
              <div className={`mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${stat.glow}`}>
                {stat.icon}
              </div>
              <div className={`font-display font-extrabold text-3xl sm:text-4xl mb-1 ${stat.color}`}>
                <NumberTicker value={stat.value} />
              </div>
              <div className="text-text-secondary text-xs sm:text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
            </Card>
          ))}
        </motion.div>
      </motion.div>

      {/* Grid layouts for bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Heatmap */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="lg:col-span-2"
        >
          <Card padding="lg" glass className="h-full border-t border-t-white/10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Activity Map
              </h2>
              <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-text-secondary text-sm font-bold">{dayjs().year()}</span>
            </div>
            <div className="overflow-x-auto pb-4 hide-scrollbar">
              <HeatmapGrid data={heatmapData} />
            </div>
          </Card>
        </motion.section>

        {/* Leaderboard preview */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, type: 'spring' }}
        >
          <Card padding="lg" glass className="h-full border-t border-t-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" /> Top solvers
              </h2>
              <button
                onClick={() => navigate('/leaderboard')}
                className="group text-primary text-sm font-bold hover:text-primary-light transition-colors flex items-center gap-1"
              >
                All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                <Medal className="w-10 h-10 text-text-muted mb-3" />
                <p className="text-text-secondary text-sm font-medium">Be the first to conquer<br/>today's challenge!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <motion.div
                    key={entry.userId}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                      i === 0 ? 'bg-warning/20 text-warning border border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 
                      i === 1 ? 'bg-text-secondary/20 text-text-primary border border-text-secondary/30' : 
                      i === 2 ? 'bg-streak/20 text-streak border border-streak/30' : 
                      'bg-white/5 text-text-muted border border-white/5'
                    }`}>
                      {i + 1}
                    </div>
                    <Avatar name={entry.name} src={entry.avatar} size="sm" />
                    <span className="flex-1 text-sm font-bold text-white truncate">
                      {entry.name}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-display font-black text-primary-light">{entry.score}</div>
                      <div className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                        {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.section>
      </div>

      {/* Puzzle modes - Floating Cards */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <div className="flex items-center justify-between mb-6">
           <h2 className="font-display font-bold text-2xl text-white">Logic Engines</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(['sudoku', 'pattern', 'sequence', 'deduction', 'binary'] as const).map((type, idx) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
            >
              <Card 
                hover 
                padding="md" 
                onClick={() => navigate('/play')}
                className="group h-full border-t border-t-white/10"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  {puzzleIcons[type]}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-2 capitalize">{puzzleTypeLabels[type]}</h3>
                <p className="text-sm font-medium text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                  {type === 'sudoku' && 'Master the ultimate 9x9 matrix. No repeated numbers per row, column, or region.'}
                  {type === 'pattern' && 'Identify spatial anomalies and complete visual sequencing.'}
                  {type === 'sequence' && 'Crack the algebraic or geometric progression rule hidden inside the numbers.'}
                  {type === 'deduction' && 'Use pure logical elimination to match identities across a complex matrix.'}
                  {type === 'binary' && 'Balance zeroes and ones. Prevent clusters. Equalize the weight.'}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
