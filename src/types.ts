export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Operation = 'Addition' | 'Subtraction' | 'Multiplication' | 'Division';

export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  options: number[];
}

export interface GameState {
  score: number;
  streak: number;
  bestStreak: number;
  totalAnswered: number;
}
