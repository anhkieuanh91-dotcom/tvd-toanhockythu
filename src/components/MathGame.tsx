import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, Flame, RotateCcw, HelpCircle } from 'lucide-react';
import { Difficulty, Operation, MathProblem, GameState } from '../types';
import { getMathExplanation } from '../lib/gemini';

interface MathGameProps {
  difficulty: Difficulty;
  operation: Operation;
  onBack: () => void;
}

export const MathGame: React.FC<MathGameProps> = ({ difficulty, operation, onBack }) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalAnswered: 0,
  });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const generateProblem = useCallback(() => {
    let min = 1, max = 10;
    if (difficulty === 'Medium') max = 50;
    if (difficulty === 'Hard') max = 100;

    let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    let question = '';
    let answer = 0;

    switch (operation) {
      case 'Addition':
        question = `${num1} + ${num2}`;
        answer = num1 + num2;
        break;
      case 'Subtraction':
        if (num1 < num2) [num1, num2] = [num2, num1];
        question = `${num1} - ${num2}`;
        answer = num1 - num2;
        break;
      case 'Multiplication':
        if (difficulty === 'Easy') max = 10;
        num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        num2 = Math.floor(Math.random() * 10) + 1;
        question = `${num1} × ${num2}`;
        answer = num1 * num2;
        break;
      case 'Division':
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2}`;
        break;
    }

    const options = new Set<number>();
    options.add(answer);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = answer + (offset === 0 ? 7 : offset);
      if (wrong >= 0) options.add(wrong);
    }

    setProblem({
      id: Math.random().toString(36).substr(2, 9),
      question,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    });
    setFeedback(null);
    setExplanation(null);
  }, [difficulty, operation]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleAnswer = (selected: number) => {
    if (feedback) return;

    const isCorrect = selected === problem?.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setGameState(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        score: isCorrect ? prev.score + 10 : prev.score,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalAnswered: prev.totalAnswered + 1,
      };
    });

    if (isCorrect) {
      setTimeout(() => {
        generateProblem();
      }, 1000);
    }
  };

  const handleGetHelp = async () => {
    if (!problem) return;
    setLoadingExplanation(true);
    const text = await getMathExplanation(problem.question);
    setExplanation(text);
    setLoadingExplanation(false);
  };

  if (!problem) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2"
        >
          <RotateCcw size={16} /> Back to Menu
        </button>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold">
            <Flame size={18} />
            <span>{gameState.streak}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
            <Trophy size={18} />
            <span>{gameState.score}</span>
          </div>
        </div>
      </div>

      <motion.div 
        key={problem.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden"
      >
        <div className="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-4">
          {operation} • {difficulty}
        </div>
        <h2 className="text-7xl font-bold text-gray-900 mb-12">
          {problem.question}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {problem.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
              className={`
                py-6 rounded-2xl text-2xl font-bold transition-all
                ${feedback === null ? 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-95' : ''}
                ${feedback === 'correct' && option === problem.answer ? 'bg-green-500 text-white' : ''}
                ${feedback === 'wrong' && option === problem.answer ? 'bg-green-500 text-white' : ''}
                ${feedback === 'wrong' && option !== problem.answer ? 'bg-red-100 text-red-400 opacity-50' : ''}
                ${feedback === 'correct' && option !== problem.answer ? 'opacity-50' : ''}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none"
            >
              <CheckCircle2 size={120} className="text-green-500" />
            </motion.div>
          )}
          {feedback === 'wrong' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none"
            >
              <XCircle size={120} className="text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-4">
        {feedback === 'wrong' && (
          <button
            onClick={generateProblem}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Try Another One
          </button>
        )}
        
        <button
          onClick={handleGetHelp}
          disabled={loadingExplanation}
          className="flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          <HelpCircle size={20} />
          {loadingExplanation ? 'Thinking...' : 'Ask AI Tutor for help'}
        </button>

        <AnimatePresence>
          {explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 p-6 rounded-2xl text-blue-800 text-left w-full border border-blue-100"
            >
              <p className="leading-relaxed">{explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
