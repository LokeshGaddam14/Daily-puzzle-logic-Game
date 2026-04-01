import { createSeededRandom, seededShuffle, seededChoice } from '../seed';
import type { PatternPuzzle, PatternItem, PatternColor, PatternShape, Difficulty } from '../../types';

const SHAPES: PatternShape[] = ['circle', 'square', 'triangle', 'diamond', 'star'];
const COLORS: PatternColor[] = ['primary', 'accent', 'warning', 'error', 'success'];

function randomItem(rng: () => number, exclude?: PatternItem): PatternItem {
  let shape: PatternShape;
  let color: PatternColor;
  do {
    shape = seededChoice(SHAPES, rng);
    color = seededChoice(COLORS, rng);
  } while (
    exclude &&
    shape === exclude.shape &&
    color === exclude.color
  );
  return { shape, color };
}

function generateWrongOptions(correct: PatternItem, rng: () => number): PatternItem[] {
  const wrong: PatternItem[] = [];
  while (wrong.length < 3) {
    const candidate = randomItem(rng, correct);
    const isDuplicate = wrong.some(
      w => w.shape === candidate.shape && w.color === candidate.color
    );
    if (!isDuplicate) wrong.push(candidate);
  }
  return wrong;
}

// Pattern rules:
// Type 0: alternating shapes (A B A B ...)
// Type 1: color progression (cycling through colors)
// Type 2: shape + color pairs that cycle
// Type 3: arithmetic on shape index, fixed color
// Type 4: color cycling, shape fixed

export function generatePattern(seed: number, difficulty: Difficulty): PatternPuzzle {
  const rng = createSeededRandom(seed + 100); // offset seed for variety

  const patternType = Math.floor(rng() * 5);
  const sequenceLength = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 8;
  const sequence: PatternItem[] = [];

  const baseShape = seededChoice(SHAPES, rng);
  const baseColor = seededChoice(COLORS, rng);
  const altShape = seededChoice(SHAPES.filter(s => s !== baseShape), rng);
  const altColor = seededChoice(COLORS.filter(c => c !== baseColor), rng);

  for (let i = 0; i < sequenceLength; i++) {
    switch (patternType) {
      case 0: // alternating shape, fixed color
        sequence.push({ shape: i % 2 === 0 ? baseShape : altShape, color: baseColor });
        break;
      case 1: // fixed shape, cycling colors
        sequence.push({ shape: baseShape, color: COLORS[i % COLORS.length] });
        break;
      case 2: // both cycle independently
        sequence.push({
          shape: SHAPES[i % SHAPES.length],
          color: COLORS[(i * 2) % COLORS.length],
        });
        break;
      case 3: // alternating colors, fixed shape
        sequence.push({ shape: baseShape, color: i % 2 === 0 ? baseColor : altColor });
        break;
      case 4: // shape steps +2, color alternates
        sequence.push({
          shape: SHAPES[(i * 2) % SHAPES.length],
          color: i % 2 === 0 ? baseColor : altColor,
        });
        break;
      default:
        sequence.push({ shape: baseShape, color: baseColor });
    }
  }

  // Pick missing index (not first or last for easier difficulty)
  const minIdx = difficulty === 'easy' ? 2 : 1;
  const maxIdx = difficulty === 'easy' ? sequenceLength - 3 : sequenceLength - 2;
  const missingIndex = minIdx + Math.floor(rng() * (maxIdx - minIdx + 1));

  const correct = sequence[missingIndex];
  const wrongOptions = generateWrongOptions(correct, rng);
  const allOptions = seededShuffle([correct, ...wrongOptions], rng);
  const correctIndex = allOptions.findIndex(
    o => o.shape === correct.shape && o.color === correct.color
  );

  const displaySequence: (PatternItem | null)[] = sequence.map(
    (item, i) => (i === missingIndex ? null : item)
  );

  return {
    type: 'pattern',
    sequence: displaySequence,
    missingIndex,
    options: allOptions,
    correctIndex,
    difficulty,
  };
}
