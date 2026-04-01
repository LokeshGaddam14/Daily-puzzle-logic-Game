import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AnyPuzzle, PuzzleType, Difficulty } from '../../types';

interface PuzzleState {
  currentPuzzle: AnyPuzzle | null;
  puzzleType: PuzzleType | null;
  difficulty: Difficulty | null;
  date: string | null;
  // Game state
  userState: unknown;         // board state (type-specific)
  selectedCell: [number, number] | null;
  // Timer
  timerRunning: boolean;
  timerSeconds: number;
  // Hints
  hintsUsed: number;
  hintsMax: number;
  hintsReveal: unknown | null; // hint data (e.g., cell coords for sudoku)
  // Status
  isCompleted: boolean;
  isGaveUp: boolean;
  isSolved: boolean;
  showOverlay: boolean;
  finalScore: number | null;
}

const initialState: PuzzleState = {
  currentPuzzle: null,
  puzzleType: null,
  difficulty: null,
  date: null,
  userState: null,
  selectedCell: null,
  timerRunning: false,
  timerSeconds: 0,
  hintsUsed: 0,
  hintsMax: 3,
  hintsReveal: null,
  isCompleted: false,
  isGaveUp: false,
  isSolved: false,
  showOverlay: false,
  finalScore: null,
};

const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState,
  reducers: {
    loadPuzzle(
      state,
      action: PayloadAction<{
        puzzle: AnyPuzzle;
        date: string;
        initialUserState: unknown;
        hintsUsed: number;
      }>
    ) {
      state.currentPuzzle = action.payload.puzzle;
      state.puzzleType = action.payload.puzzle.type;
      state.difficulty = action.payload.puzzle.difficulty;
      state.date = action.payload.date;
      state.userState = action.payload.initialUserState;
      state.hintsUsed = action.payload.hintsUsed;
      state.timerSeconds = 0;
      state.timerRunning = true;
      state.isCompleted = false;
      state.isGaveUp = false;
      state.isSolved = false;
      state.showOverlay = false;
      state.finalScore = null;
    },
    restoreProgress(
      state,
      action: PayloadAction<{ userState: unknown; timerSeconds: number; hintsUsed: number }>
    ) {
      state.userState = action.payload.userState;
      state.timerSeconds = action.payload.timerSeconds;
      state.hintsUsed = action.payload.hintsUsed;
    },
    updateUserState(state, action: PayloadAction<unknown>) {
      state.userState = action.payload;
    },
    setSelectedCell(state, action: PayloadAction<[number, number] | null>) {
      state.selectedCell = action.payload;
    },
    tickTimer(state) {
      state.timerSeconds += 1;
    },
    startTimer(state) {
      state.timerRunning = true;
    },
    pauseTimer(state) {
      state.timerRunning = false;
    },
    useHint(state, action: PayloadAction<unknown>) {
      state.hintsUsed += 1;
      state.hintsReveal = action.payload;
    },
    clearHintReveal(state) {
      state.hintsReveal = null;
    },
    solvePuzzle(state, action: PayloadAction<number>) {
      state.isSolved = true;
      state.isCompleted = true;
      state.timerRunning = false;
      state.showOverlay = true;
      state.finalScore = action.payload;
    },
    giveUp(state) {
      state.isGaveUp = true;
      state.isCompleted = true;
      state.timerRunning = false;
      state.showOverlay = true;
      state.finalScore = 0;
    },
    hideOverlay(state) {
      state.showOverlay = false;
    },
  },
});

export const {
  loadPuzzle,
  restoreProgress,
  updateUserState,
  setSelectedCell,
  tickTimer,
  startTimer,
  pauseTimer,
  useHint,
  clearHintReveal,
  solvePuzzle,
  giveUp,
  hideOverlay,
} = puzzleSlice.actions;

export default puzzleSlice.reducer;
