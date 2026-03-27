import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { generateQuestions, Question } from '@/src/lib/game-logic';
import { Button } from '@/src/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Volume2, VolumeX, Lock, Bot } from 'lucide-react';
import { playSound, resumeAudioContext } from '@/src/lib/sound';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { GAME_CONSTANTS } from '@/src/constants';

const renderTextWithFractions = (text: string | undefined) => {
  if (!text) return text;
  
  // Match mixed numbers (e.g., "1 2/3") or simple fractions (e.g., "1/2")
  // We use a regex that looks for optional whole number, space, numerator, slash, denominator.
  const fractionRegex = /(?:(\d+)\s+)?(\d+)\/(\d+)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = fractionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const whole = match[1];
    const num = match[2];
    const den = match[3];

    parts.push(
      <span key={match.index} className="inline-flex items-center align-middle mx-1">
        {whole && <span className="mr-1">{whole}</span>}
        <span className="inline-flex flex-col items-center justify-center text-[0.8em]">
          <span className="border-b-[1.5px] border-current w-full text-center px-1 leading-[1.1]">{num}</span>
          <span className="w-full text-center px-1 leading-[1.1]">{den}</span>
        </span>
      </span>
    );
    
    lastIndex = fractionRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const Game = () => {
  const { gradeId, topicId, levelId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const studentGrade = localStorage.getItem('studentGrade');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_CONSTANTS.TOTAL_TIME);
  const [startTime, setStartTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  // Matching game states
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ left: string, right: string }[]>([]);
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  // Comparison game states
  const [showSignDropdown, setShowSignDropdown] = useState(false);

  const toggleSound = async () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue.toString());
    if (newValue) {
      await resumeAudioContext();
    }
  };

  useEffect(() => {
    if (gradeId && topicId && levelId && studentGrade === gradeId) {
      const qs = generateQuestions(Number(gradeId), topicId, levelId, GAME_CONSTANTS.QUESTIONS_PER_GAME, language);
      setQuestions(qs);
      setCurrentQIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setTextAnswer('');
      setIsAnswered(false);
      setShowFeedback(false);
      setTimeLeft(GAME_CONSTANTS.TOTAL_TIME);
      setStartTime(Date.now());
      setMatchedPairs([]);
      setSelectedLeft(null);
    }
  }, [gradeId, topicId, levelId, language, studentGrade]);

  const isAllowed = studentGrade === gradeId;

  if (!isAllowed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          {language === 'en' ? 'Access Denied' : 'Không có quyền truy cập'}
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          {!studentGrade 
            ? (language === 'en' ? 'Please login and select your grade first.' : 'Vui lòng đăng nhập và chọn khối lớp trước.')
            : (language === 'en' 
                ? `You can only access games for Grade ${studentGrade}.` 
                : `Em chỉ được phép làm bài tập của Khối ${studentGrade}.`)}
        </p>
        <Link to="/">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-lg">
            {language === 'en' ? 'Back to Home' : 'Quay lại Trang chủ'}
          </Button>
        </Link>
      </div>
    );
  }

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQIndex];
      if (currentQuestion.type === 'matching' && currentQuestion.pairs) {
        setShuffledLeft(currentQuestion.pairs.map(p => p.left).sort(() => Math.random() - 0.5));
        setShuffledRight(currentQuestion.pairs.map(p => p.right).sort(() => Math.random() - 0.5));
      }
    }
  }, [currentQIndex, questions]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeOut();
    }
  }, [timeLeft]);

  const handleTimeOut = async () => {
    await playSound('complete');
    const timeSpent = GAME_CONSTANTS.TOTAL_TIME;
    navigate('/result', { state: { score, total: questions.length, gradeId, topicId, levelId, timeSpent } });
  };

  const handleMatch = async (side: 'left' | 'right', item: string) => {
    if (isAnswered) return;
    
    if (side === 'left') {
      setSelectedLeft(item === selectedLeft ? null : item);
    } else if (side === 'right' && selectedLeft) {
      // Check if it's a correct match
      const currentQuestion = questions[currentQIndex];
      const isCorrectMatch = currentQuestion.pairs?.some(p => p.left === selectedLeft && p.right === item);
      
      if (isCorrectMatch) {
        await playSound('correct');
        const newMatchedPairs = [...matchedPairs, { left: selectedLeft, right: item }];
        setMatchedPairs(newMatchedPairs);
        setSelectedLeft(null);
        
        // Check if all pairs are matched
        if (newMatchedPairs.length === currentQuestion.pairs?.length) {
          await handleAnswer('matching');
        }
      } else {
        await playSound('wrong');
        setSelectedLeft(null);
      }
    }
  };

  const handleAnswer = async (answer: string) => {
    if (isAnswered) return;
    
    // Normalize answer for comparison (case insensitive, trim whitespace)
    const normalizedUserAnswer = answer.trim().toLowerCase();
    const normalizedCorrectAnswer = questions[currentQIndex].correctAnswer.trim().toLowerCase();
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowFeedback(true);
    
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      await playSound('correct');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      await playSound('wrong');
    }
  };

  const nextQuestion = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setIsAnswered(false);
      setShowFeedback(false);
      // Do not reset timeLeft here
      setMatchedPairs([]);
      setSelectedLeft(null);
      setShowSignDropdown(false);
      await playSound('next');
    } else {
      await playSound('complete');
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      navigate('/result', { state: { score, total: questions.length, gradeId, topicId, levelId, timeSpent } });
    }
  };

  const askAIForHelp = () => {
    const currentQuestion = questions[currentQIndex];
    let userAnswer = selectedAnswer || textAnswer;
    if (currentQuestion.type === 'matching') {
      userAnswer = matchedPairs.map(p => `${p.left} -> ${p.right}`).join(', ');
    }

    const event = new CustomEvent('explain-math-problem', {
      detail: {
        question: currentQuestion.text,
        userAnswer: userAnswer || (language === 'en' ? 'No answer yet' : 'Chưa có câu trả lời'),
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation
      }
    });
    window.dispatchEvent(event);
  };

  if (questions.length === 0) return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin w-8 h-8 text-indigo-600" /></div>;

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-red-500 transition-colors">
            <XCircle className="w-6 h-6" />
          </Link>
          <button onClick={toggleSound} className="text-slate-400 hover:text-indigo-500 transition-colors" title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}>
            {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
        </div>
        <div className="text-slate-500 font-medium">
          {t('game.question')} {currentQIndex + 1} / {questions.length}
        </div>
        <div className="text-indigo-600 font-bold text-xl">
          {t('game.score')}: {score}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-b-8 border-indigo-100 mb-8 text-center relative"
        >
          {/* Timer Bar */}
          <div className="absolute top-0 left-0 h-2 bg-indigo-100 w-full rounded-t-3xl overflow-hidden">
            <motion.div 
              className={`h-full ${timeLeft <= 60 ? 'bg-red-500' : 'bg-indigo-500'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / GAME_CONSTANTS.TOTAL_TIME) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          
          <div className="absolute top-4 right-6 font-mono font-bold text-xl text-slate-400">
            <span className={timeLeft <= 60 ? 'text-red-500 animate-pulse' : ''}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-8 tracking-tight leading-tight mt-4 whitespace-pre-wrap">
            {renderTextWithFractions(currentQuestion.text)}
          </h2>

          {currentQuestion.imageUrl && (
            <div className="flex justify-center mb-8">
              <img src={currentQuestion.imageUrl} alt="Question visual" className="max-h-48 object-contain rounded-xl shadow-sm border border-slate-100 p-2 bg-slate-50" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Render based on Question Type */}
          {currentQuestion.type === 'multiple-choice' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                let btnClass = "bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700";
                
                if (isAnswered) {
                  if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                  else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-200";
                  else btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    animate={isAnswered && isCorrect ? { 
                      scale: [1, 1.05, 1], 
                      boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 20px rgba(34,197,94,0.6)", "0px 0px 10px rgba(34,197,94,0.4)"] 
                    } : {}}
                    transition={{ duration: 0.5 }}
                    onClick={async () => await handleAnswer(option)}
                    disabled={isAnswered}
                    className={`py-6 px-8 rounded-2xl text-2xl font-bold transition-all shadow-sm ${btnClass}`}
                  >
                    {renderTextWithFractions(option)}
                  </motion.button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'true-false' && (
            <div className="flex gap-6 justify-center">
               <motion.button
                  whileHover={!isAnswered ? { scale: 1.05 } : {}}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                  animate={isAnswered && currentQuestion.correctAnswer === 'true' ? { 
                    scale: [1, 1.1, 1], 
                    boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 25px rgba(34,197,94,0.6)", "0px 0px 15px rgba(34,197,94,0.4)"] 
                  } : {}}
                  transition={{ duration: 0.5 }}
                  onClick={async () => await handleAnswer('true')}
                  disabled={isAnswered}
                  className={`w-40 h-40 rounded-full text-3xl font-bold flex items-center justify-center border-4 shadow-lg transition-all ${
                    isAnswered 
                      ? (currentQuestion.correctAnswer === 'true' ? 'bg-green-100 border-green-500 text-green-700' : (selectedAnswer === 'true' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-slate-100 border-slate-300 text-slate-400'))
                      : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-400'
                  }`}
                >
                  {language === 'vi-en' ? 'ĐÚNG / TRUE' : language === 'en' ? 'TRUE' : 'ĐÚNG'}
                </motion.button>
                <motion.button
                  whileHover={!isAnswered ? { scale: 1.05 } : {}}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                  animate={isAnswered && currentQuestion.correctAnswer === 'false' ? { 
                    scale: [1, 1.1, 1], 
                    boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 25px rgba(34,197,94,0.6)", "0px 0px 15px rgba(34,197,94,0.4)"] 
                  } : {}}
                  transition={{ duration: 0.5 }}
                  onClick={async () => await handleAnswer('false')}
                  disabled={isAnswered}
                  className={`w-40 h-40 rounded-full text-3xl font-bold flex items-center justify-center border-4 shadow-lg transition-all ${
                    isAnswered 
                      ? (currentQuestion.correctAnswer === 'false' ? 'bg-green-100 border-green-500 text-green-700' : (selectedAnswer === 'false' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-slate-100 border-slate-300 text-slate-400'))
                      : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-400'
                  }`}
                >
                  {language === 'vi-en' ? 'SAI / FALSE' : language === 'en' ? 'FALSE' : 'SAI'}
                </motion.button>
            </div>
          )}

          {(currentQuestion.type === 'fill-in-blank' || currentQuestion.type === 'short-answer') && (
            <div className="flex flex-col items-center gap-6">
              <motion.input 
                type="text" 
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={isAnswered}
                placeholder={currentQuestion.placeholder || (language === 'vi-en' ? "Nhập câu trả lời... / Enter your answer..." : language === 'en' ? "Enter your answer..." : "Nhập câu trả lời...")}
                className={`w-full max-w-md text-center text-3xl p-4 border-b-4 focus:outline-none bg-transparent font-bold placeholder:text-slate-300 transition-all ${
                  isAnswered 
                    ? (selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() 
                        ? 'border-green-500 text-green-700' 
                        : 'border-red-500 text-red-700')
                    : 'border-indigo-200 focus:border-indigo-600 text-indigo-900'
                }`}
                animate={isAnswered && selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase() ? { 
                  scale: [1, 1.05, 1], 
                  textShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 10px rgba(34,197,94,0.6)", "0px 0px 5px rgba(34,197,94,0.4)"] 
                } : {}}
                transition={{ duration: 0.5 }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !isAnswered && textAnswer.trim()) {
                    await handleAnswer(textAnswer);
                  }
                }}
              />
              <Button 
                onClick={async () => await handleAnswer(textAnswer)} 
                disabled={isAnswered || !textAnswer.trim()}
                size="lg" 
                className="px-12 py-6 text-xl rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                {language === 'vi-en' ? 'Trả lời / Answer' : language === 'en' ? 'Answer' : 'Trả lời'}
              </Button>
            </div>
          )}

          {currentQuestion.type === 'matching' && (
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              <div className="flex flex-col gap-4">
                {shuffledLeft.map((item, idx) => {
                  const isMatched = matchedPairs.some(p => p.left === item);
                  const isSelected = selectedLeft === item;
                  return (
                    <motion.button
                      key={`left-${idx}`}
                      whileHover={!isAnswered && !isMatched ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered && !isMatched ? { scale: 0.98 } : {}}
                      animate={isMatched ? { 
                        scale: [1, 1.05, 1], 
                        boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 15px rgba(34,197,94,0.6)", "0px 0px 0px rgba(34,197,94,0)"] 
                      } : {}}
                      transition={{ duration: 0.5 }}
                      onClick={() => !isMatched && handleMatch('left', item)}
                      disabled={isAnswered || isMatched}
                      className={`p-4 rounded-xl text-base sm:text-lg font-medium transition-all shadow-sm border-2 text-left ${
                        isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-50' :
                        isSelected ? 'bg-indigo-100 border-indigo-500 text-indigo-800 ring-2 ring-indigo-200' :
                        'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                      }`}
                    >
                      {renderTextWithFractions(item)}
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-4">
                {shuffledRight.map((item, idx) => {
                  const isMatched = matchedPairs.some(p => p.right === item);
                  return (
                    <motion.button
                      key={`right-${idx}`}
                      whileHover={!isAnswered && !isMatched && selectedLeft ? { scale: 1.02 } : {}}
                      whileTap={!isAnswered && !isMatched && selectedLeft ? { scale: 0.98 } : {}}
                      animate={isMatched ? { 
                        scale: [1, 1.05, 1], 
                        boxShadow: ["0px 0px 0px rgba(34,197,94,0)", "0px 0px 15px rgba(34,197,94,0.6)", "0px 0px 0px rgba(34,197,94,0)"] 
                      } : {}}
                      transition={{ duration: 0.5 }}
                      onClick={() => !isMatched && handleMatch('right', item)}
                      disabled={isAnswered || isMatched || !selectedLeft}
                      className={`p-4 rounded-xl text-base sm:text-lg font-medium transition-all shadow-sm border-2 text-left ${
                        isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-50' :
                        'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                      } ${!selectedLeft && !isMatched ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {renderTextWithFractions(item)}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {currentQuestion.type === 'comparison' && (
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-3xl sm:text-5xl font-bold my-12">
              <div className="bg-slate-50 px-6 py-4 sm:px-8 sm:py-6 rounded-2xl shadow-inner border-2 border-slate-100 min-w-[100px] text-center text-indigo-900">
                {renderTextWithFractions(currentQuestion.leftStr)}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => !isAnswered && setShowSignDropdown(!showSignDropdown)}
                  disabled={isAnswered}
                  className={`flex items-center justify-center gap-2 min-w-[100px] h-20 rounded-2xl border-4 transition-all ${
                    isAnswered
                      ? (selectedAnswer === currentQuestion.correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-red-100 border-red-500 text-red-700')
                      : 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 shadow-md'
                  }`}
                >
                  {selectedAnswer || '?'} 
                  {!isAnswered && <span className="text-xl">▼</span>}
                </button>
                
                <AnimatePresence>
                  {showSignDropdown && !isAnswered && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border-2 border-indigo-100 rounded-xl shadow-xl overflow-hidden z-10 flex flex-row"
                    >
                      {['<', '=', '>'].map(sign => (
                        <button
                          key={sign}
                          onClick={async () => {
                            setShowSignDropdown(false);
                            await handleAnswer(sign);
                          }}
                          className="px-6 py-4 text-4xl hover:bg-indigo-50 transition-colors border-r border-slate-100 last:border-0 text-indigo-700 font-bold"
                        >
                          {sign}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-slate-50 px-6 py-4 sm:px-8 sm:py-6 rounded-2xl shadow-inner border-2 border-slate-100 min-w-[100px] text-center text-indigo-900">
                {renderTextWithFractions(currentQuestion.rightStr)}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-lg ${
              (selectedAnswer?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase())
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="shrink-0 mt-1">
              {(selectedAnswer?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) 
                ? <CheckCircle className="w-8 h-8 text-green-600" /> 
                : <XCircle className="w-8 h-8 text-red-600" />
              }
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                {timeLeft === 0 && !selectedAnswer 
                  ? (language === 'vi-en' ? 'Hết giờ! / Time out!' : language === 'en' ? 'Time out!' : 'Hết giờ!') 
                  : (selectedAnswer?.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) 
                    ? (language === 'vi-en' ? 'Chính xác! Giỏi quá! / Correct! Great job!' : language === 'en' ? 'Correct! Great job!' : 'Chính xác! Giỏi quá!') 
                    : (language === 'vi-en' ? 'Tiếc quá, sai rồi! / Oops, incorrect!' : language === 'en' ? 'Oops, incorrect!' : 'Tiếc quá, sai rồi!')}
              </h3>
              <p className="text-lg opacity-90">{renderTextWithFractions(currentQuestion.explanation)}</p>
              <button 
                onClick={askAIForHelp}
                className="mt-2 text-sm font-bold flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Bot className="w-4 h-4" />
                {language === 'en' ? 'Ask AI for more explanation' : 'Nhờ AI giải thích thêm'}
              </button>
            </div>
            <Button onClick={nextQuestion} size="lg" className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
              {language === 'vi-en' ? 'Tiếp tục / Continue' : language === 'en' ? 'Continue' : 'Tiếp tục'} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
