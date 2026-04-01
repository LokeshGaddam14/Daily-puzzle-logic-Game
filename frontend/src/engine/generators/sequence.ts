import { createSeededRandom, seededInt } from '../seed';
import type { SequencePuzzle, Difficulty } from '../../types';

type SequenceRule = {
  generate: (start: number, step: number, length: number) => number[];
  describe: (start: number, step: number) => string;
};

const RULES: SequenceRule[] = [
  // 0: Arithmetic
  {
    generate: (start, step, len) => Array.from({ length: len }, (_, i) => start + i * step),
    describe: (_, step) => step > 0 ? `Add ${step} each step` : `Subtract ${Math.abs(step)} each step`,
  },
  // 1: Geometric
  {
    generate: (start, step, len) => Array.from({ length: len }, (_, i) => start * Math.pow(step, i)),
    describe: (_, step) => `Multiply by ${step} each step`,
  },
  // 2: Fibonacci-like (each term = sum of previous two, seeded start)
  {
    generate: (start, step, len) => {
      const seq = [start, step];
      for (let i = 2; i < len; i++) seq.push(seq[i - 1] + seq[i - 2]);
      return seq;
    },
    describe: () => 'Each number is the sum of the previous two',
  },
  // 3: Square numbers shifted
  {
    generate: (start, _step, len) => Array.from({ length: len }, (_, i) => Math.pow(start + i, 2)),
    describe: (start) => `Squares starting from ${start}²`,
  },
  // 4: Alternating add/multiply
  {
    generate: (start, step, len) => {
      const seq = [start];
      for (let i = 1; i < len; i++) {
        seq.push(i % 2 === 1 ? seq[i - 1] + step : seq[i - 1] * 2);
      }
      return seq;
    },
    describe: (_, step) => `Alternates: add ${step}, then multiply by 2`,
  },
  // 5: Triangular numbers shifted
  {
    generate: (start, _step, len) =>
      Array.from({ length: len }, (_, i) => start + (i * (i + 1)) / 2),
    describe: () => 'Triangular number pattern',
  },
];

export function generateSequence(seed: number, difficulty: Difficulty): SequencePuzzle {
  const rng = createSeededRandom(seed + 200);
  const length = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8;

  const ruleIndex = Math.floor(rng() * RULES.length);
  const rule = RULES[ruleIndex];

  let start: number;
  let step: number;

  // Pick reasonable parameters per rule
  switch (ruleIndex) {
    case 0: // arithmetic
      start = seededInt(1, 20, rng);
      step = seededInt(2, 12, rng) * (rng() > 0.3 ? 1 : -1);
      break;
    case 1: // geometric
      start = seededInt(1, 5, rng);
      step = seededInt(2, 4, rng);
      break;
    case 2: // fibonacci
      start = seededInt(1, 8, rng);
      step = seededInt(1, 8, rng);
      break;
    case 3: // squares
      start = seededInt(1, 6, rng);
      step = 1;
      break;
    case 4: // alternating
      start = seededInt(2, 10, rng);
      step = seededInt(2, 8, rng);
      break;
    case 5: // triangular
      start = seededInt(1, 10, rng);
      step = 1;
      break;
    default:
      start = 1; step = 2;
  }

  const full = rule.generate(start, step, length);
  // Ensure all values are integers and reasonable
  const sequence = full.map(v => Math.round(v));

  // Choose blank positions (not first 2 for context)
  const numBlanks = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const available = Array.from({ length: length - 2 }, (_, i) => i + 2);
  const blankIndices: number[] = [];
  const avail = [...available];
  for (let i = 0; i < numBlanks; i++) {
    const idx = Math.floor(rng() * avail.length);
    blankIndices.push(avail[idx]);
    avail.splice(idx, 1);
  }
  blankIndices.sort((a, b) => a - b);

  const display: (number | null)[] = sequence.map(
    (v, i) => blankIndices.includes(i) ? null : v
  );
  const answers = blankIndices.map(i => sequence[i]);

  return {
    type: 'sequence',
    sequence: display,
    missingIndices: blankIndices,
    answers,
    rule: rule.describe(start, step),
    difficulty,
  };
}
