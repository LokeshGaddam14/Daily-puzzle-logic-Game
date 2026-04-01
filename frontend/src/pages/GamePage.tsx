import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { RootState, AppDispatch } from '../store';
import {
  loadPuzzle, tickTimer, useHint, solvePuzzle, giveUp, hideOverlay, updateUserState,
} from '../store/slices/puzzleSlice';
import { setStreakData } from '../store/slices/streakSlice';
import { SudokuBoard } from '../components/puzzles/SudokuBoard';
import { PatternPuzzleBoard } from '../components/puzzles/PatternPuzzle';
import { SequencePuzzleBoard } from '../components/puzzles/SequencePuzzle';
import { DeductionGrid } from '../components/puzzles/DeductionGrid';
import { BinaryPuzzleBoard } from '../components/puzzles/BinaryPuzzle';
import { Button } from '../components/ui/Button';
import { PuzzleTypeBadge } from '../components/ui/PuzzleTypeBadge';
import { ScoreOverlay } from '../components/ui/ScoreOverlay';
import { generateSudoku } from '../engine/generators/sudoku';
import { generatePattern } from '../engine/generators/pattern';
import { generateSequence } from '../engine/generators/sequence';
import { generateDeduction } from '../engine/generators/deduction';
import { generateBinary } from '../engine/generators/binary';
import { validatePuzzle } from '../engine/validators';
import { calculateScore } from '../engine/scoring';
import {
  getSeedForDate, getPuzzleTypeForDate, getDifficultyForDate, getDateString,
} from '../engine/seed';
import {
  savePuzzleProgress, getPuzzleProgress, getHintsUsed, incrementHint, updateStreakAfterSolve,
} from '../lib/db';
import { scoresAPI } from '../lib/api';
import type { AnyPuzzle } from '../types';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getInitialUserState(puzzle: AnyPuzzle): unknown {
  switch (puzzle.type) {
    case 'sudoku': return puzzle.board.map(r => [...r]);
    case 'pattern': return -1;
    case 'sequence': return puzzle.answers.map(() => null);
    case 'deduction': return Array.from({ length: 4 }, (_, p) => [p, ...Array(3).fill(-1)]);
    case 'binary': return puzzle.board.map(r => [...r]);
    default: return null;
  }
}

export const GamePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentPuzzle, puzzleType, difficulty, date, userState,
    timerRunning, timerSeconds, hintsUsed, hintsMax,
    isCompleted, isSolved, isGaveUp, showOverlay, finalScore,
  } = useSelector((s: RootState) => s.puzzle);
  const { isGuest } = useSelector((s: RootState) => s.auth);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load puzzle on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const today = getDateString();
    const seed = getSeedForDate(today);
    const type = getPuzzleTypeForDate(today);
    const diff = getDifficultyForDate(today);

    let puzzle: AnyPuzzle;
    switch (type) {
      case 'sudoku':    puzzle = generateSudoku(seed, diff);    break;
      case 'pattern':   puzzle = generatePattern(seed, diff);   break;
      case 'sequence':  puzzle = generateSequence(seed, diff);  break;
      case 'deduction': puzzle = generateDeduction(seed, diff); break;
      case 'binary':    puzzle = generateBinary(seed, diff);    break;
    }

    const initState = getInitialUserState(puzzle);
    const hintsAlreadyUsed = 0;

    dispatch(loadPuzzle({ puzzle, date: today, initialUserState: initState, hintsUsed: hintsAlreadyUsed }));

    // Check if already completed today
    getPuzzleProgress(today).then(progress => {
      if (progress?.completed) {
        toast(`You already solved today's puzzle! 🎉 Score: ${progress.score}`);
      }
    });

    getHintsUsed(today).then(h => {
      if (h > 0) toast(`You've used ${h} hint(s) today.`);
    });
  }, [dispatch]);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => dispatch(tickTimer()), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, dispatch]);

  // ── Handle submit ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!currentPuzzle || isCompleted) return;
    const result = validatePuzzle(currentPuzzle, userState);
    if (!result.isComplete) {
      toast.error('Puzzle is not fully filled in yet!');
      return;
    }
    if (!result.isCorrect) {
      toast.error('Some answers are incorrect. Keep trying!');
      return;
    }
    const scoreResult = calculateScore(timerSeconds, hintsUsed, difficulty!);
    dispatch(solvePuzzle(scoreResult.finalScore));

    // Save to IndexedDB
    savePuzzleProgress({
      date: date!, puzzleType: puzzleType!, difficulty: difficulty!,
      completed: true, gaveUp: false, score: scoreResult.finalScore,
      timeTaken: timerSeconds, hintsUsed, boardState: userState,
    });

    // Update streak
    updateStreakAfterSolve(date!, scoreResult.finalScore).then(streak => {
      dispatch(setStreakData(streak));
    });

    // Sync to server (non-blocking)
    if (!isGuest) {
      scoresAPI.submit({
        puzzleType: puzzleType!, score: scoreResult.finalScore,
        timeTaken: timerSeconds, hintsUsed, date: date!,
      }).catch(() => {});
    }
  }, [currentPuzzle, userState, timerSeconds, hintsUsed, difficulty, date, puzzleType, isCompleted, dispatch, isGuest]);

  // ── Handle hint ──────────────────────────────────────────────────────────
  const handleHint = useCallback(async () => {
    if (!currentPuzzle || isCompleted) return;
    const used = await getHintsUsed(date || getDateString());
    if (used >= hintsMax) { toast.error('No hints remaining today.'); return; }
    await incrementHint(date || getDateString());

    let hintData: unknown = null;

    if (currentPuzzle.type === 'sudoku') {
      const board = userState as (number | null)[][];
      let found = false;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!currentPuzzle.given[r][c] && board[r][c] === null) {
            hintData = [r, c];
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = currentPuzzle.solution[r][c];
            dispatch(updateUserState(newBoard));
            found = true;
            break;
          }
        }
        if (found) break;
      }
      toast('💡 Cell revealed!', { icon: '💡' });
    } else if (currentPuzzle.type === 'pattern') {
      hintData = currentPuzzle.correctIndex;
      toast('💡 The correct answer is now highlighted.', { icon: '💡' });
    } else if (currentPuzzle.type === 'binary') {
      const board = userState as (number | null)[][];
      const size = board.length;
      let found = false;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c] === null) {
            hintData = [r, c];
            const newBoard = board.map(row => [...row]);
            newBoard[r][c] = currentPuzzle.solution[r][c];
            dispatch(updateUserState(newBoard));
            found = true;
            break;
          }
        }
        if (found) break;
      }
      toast('💡 Binary cell revealed!', { icon: '💡' });
    } else if (currentPuzzle.type === 'deduction') {
      hintData = currentPuzzle.solution[0]; // Reveal first clue's result
      toast('💡 A logic gap has been filled.', { icon: '💡' });
    } else if (currentPuzzle.type === 'sequence') {
      hintData = `Rule: ${currentPuzzle.rule}`;
      toast(`💡 Rule: ${currentPuzzle.rule}`, { icon: '💡' });
    }

    dispatch(useHint(hintData));
    toast.success(`Used ${used + 1}/${hintsMax} hints`);
  }, [currentPuzzle, userState, hintsMax, date, isCompleted, dispatch]);

  // ── Handle give up ───────────────────────────────────────────────────────
  const handleGiveUp = useCallback(() => {
    if (!currentPuzzle || isCompleted) return;
    dispatch(giveUp());
    savePuzzleProgress({
      date: date!, puzzleType: puzzleType!, difficulty: difficulty!,
      completed: true, gaveUp: true, score: 0, timeTaken: timerSeconds, hintsUsed,
    });
    toast('Better luck tomorrow! 💪');
  }, [currentPuzzle, date, puzzleType, difficulty, timerSeconds, hintsUsed, isCompleted, dispatch]);

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const text = `🧠 Logic Looper — ${date}\n🔥 ${isSolved ? `Score: ${finalScore}` : 'Attempted'}\nPlay at logiclooper.app`;
    if (navigator.share) {
      navigator.share({ title: 'Logic Looper', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
    }
  }, [date, isSolved, finalScore]);

  const scoreResult = finalScore
    ? calculateScore(timerSeconds, hintsUsed, difficulty || 'medium')
    : null;

  if (!currentPuzzle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted font-body">Loading puzzle…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <PuzzleTypeBadge type={puzzleType!} size="sm" />
          <p className="text-text-muted text-xs font-body mt-1 capitalize">
            {difficulty} · {date}
          </p>
        </div>

        {/* Timer + hints */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: hintsMax }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < hintsUsed ? 'bg-text-muted' : 'bg-warning shadow-sm'
                }`}
                title={i < hintsUsed ? 'Used' : 'Available'}
              />
            ))}
          </div>
          <div className={`font-display font-bold text-xl tabular-nums tracking-tight ${
            timerSeconds >= 300 ? 'text-error' : 'text-text-primary'
          }`}>
            {formatTime(timerSeconds)}
          </div>
        </div>
      </motion.div>

      {/* Puzzle area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={puzzleType}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          {currentPuzzle.type === 'sudoku'    && <SudokuBoard puzzle={currentPuzzle} />}
          {currentPuzzle.type === 'pattern'   && <PatternPuzzleBoard puzzle={currentPuzzle} />}
          {currentPuzzle.type === 'sequence'  && <SequencePuzzleBoard puzzle={currentPuzzle} />}
          {currentPuzzle.type === 'deduction' && <DeductionGrid puzzle={currentPuzzle} />}
          {currentPuzzle.type === 'binary'    && <BinaryPuzzleBoard puzzle={currentPuzzle} />}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {!isCompleted && (
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="md"
            onClick={handleHint}
            disabled={hintsUsed >= hintsMax || isCompleted}
            className="flex-1"
            icon={<span>💡</span>}
          >
            Hint ({hintsMax - hintsUsed})
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            className="flex-2"
          >
            Submit Answer
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleGiveUp}
            className="flex-1"
          >
            Give Up
          </Button>
        </motion.div>
      )}

      {/* Score overlay */}
      <ScoreOverlay
        visible={showOverlay}
        score={scoreResult}
        timeTaken={timerSeconds}
        hintsUsed={hintsUsed}
        isSolved={isSolved}
        puzzleType={puzzleType || ''}
        date={date || ''}
        onShare={handleShare}
        onClose={() => dispatch(hideOverlay())}
      />
    </div>
  );
};
