import { createSeededRandom, seededShuffle } from '../seed';
import type { DeductionPuzzle, DeductionClue, Difficulty } from '../../types';

// ============================================
// PUZZLE DATA POOLS
// ============================================
const CATEGORY_SETS = [
  {
    categories: ['Person', 'Shirt', 'Pet', 'Drink'],
    items: [
      ['Alice', 'Bob', 'Carol', 'David'],
      ['Red', 'Blue', 'Green', 'Yellow'],
      ['Cat', 'Dog', 'Bird', 'Fish'],
      ['Tea', 'Coffee', 'Juice', 'Water'],
    ],
  },
  {
    categories: ['Artist', 'Style', 'Instrument', 'City'],
    items: [
      ['Maya', 'Leo', 'Zoe', 'Kai'],
      ['Jazz', 'Rock', 'Pop', 'Classical'],
      ['Guitar', 'Piano', 'Drums', 'Violin'],
      ['Paris', 'Tokyo', 'Lagos', 'Lima'],
    ],
  },
  {
    categories: ['Scientist', 'Field', 'Lab Color', 'Day'],
    items: [
      ['Riya', 'Omar', 'Priya', 'Sven'],
      ['Physics', 'Biology', 'Chemistry', 'Maths'],
      ['White', 'Blue', 'Red', 'Green'],
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    ],
  },
];

type Assignment = number[][]; // assignment[person][category] = itemIndex

function generateValidAssignment(size: number, rng: () => number): Assignment {
  const assignment: Assignment = Array.from({ length: size }, () => Array(size).fill(-1));
  // Person 0 is the "anchor" — categories are assigned per person
  // solution[p][0] always = p (person index is identity)
  // solution[p][cat>0] = shuffled indices

  for (let cat = 0; cat < size; cat++) {
    const order = seededShuffle(Array.from({ length: size }, (_, i) => i), rng);
    for (let p = 0; p < size; p++) {
      assignment[p][cat] = order[p];
    }
  }
  // Person identity (cat 0)
  for (let p = 0; p < size; p++) assignment[p][0] = p;

  return assignment;
}

function generateClues(
  assignment: Assignment,
  items: string[][],
  categories: string[],
  difficulty: Difficulty,
  rng: () => number
): DeductionClue[] {
  const clues: DeductionClue[] = [];
  const size = assignment.length;

  // Generate direct clues: "[Person] has [Attribute]"
  for (let p = 0; p < size; p++) {
    for (let cat = 1; cat < size; cat++) {
      const personName = items[0][assignment[p][0]];
      const attrName = items[cat][assignment[p][cat]];
      clues.push({
        type: 'direct',
        text: `${personName} ${categories[cat] === 'Drink' ? 'drinks' : categories[cat] === 'Pet' ? 'has a' : 'wears'} ${attrName}.`,
      });
    }
  }

  // Generate adjacency clues (for medium/hard)
  if (difficulty !== 'easy') {
    for (let p = 0; p < size - 1; p++) {
      const p1Name = items[0][assignment[p][0]];
      const p2Name = items[0][assignment[p + 1][0]];
      const cat = 1 + Math.floor(rng() * (size - 1));
      clues.push({
        type: 'adjacent',
        text: `${p1Name} and ${p2Name} share the same ${categories[cat].toLowerCase()} preference.`,
      });
    }
  }

  // Shuffle and limit clues based on difficulty
  const shuffled = seededShuffle(clues, rng);
  const directClues = shuffled.filter(c => c.type === 'direct');
  const otherClues = shuffled.filter(c => c.type !== 'direct');

  const needed = difficulty === 'easy' ? size * (size - 1) * 0.8 : size * (size - 1) * 0.6;
  return [...directClues.slice(0, Math.ceil(needed)), ...otherClues.slice(0, 2)];
}

// ============================================
// MAIN GENERATOR
// ============================================
export function generateDeduction(seed: number, difficulty: Difficulty): DeductionPuzzle {
  const rng = createSeededRandom(seed + 300);
  const size = 4;

  const dataset = CATEGORY_SETS[Math.floor(rng() * CATEGORY_SETS.length)];
  const { categories, items } = dataset;

  // Shuffle item orders for variety
  const shuffledItems = items.map(itemList => seededShuffle([...itemList], rng));
  const solution = generateValidAssignment(size, rng);
  const clues = generateClues(solution, shuffledItems, categories, difficulty, rng);

  return {
    type: 'deduction',
    categories,
    items: shuffledItems,
    solution,
    clues,
    difficulty,
  };
}
