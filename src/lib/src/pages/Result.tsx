import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Home, Star, Award, Download, ListOrdered } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { saveToGoogleSheets } from '@/src/lib/google-sheets';
import { GAME_CONSTANTS } from '@/src/constants';

const Result = () => {
  const location = useLocation();
  const { score, total, gradeId, topicId, levelId, timeSpent } = location.state || { score: 0, total: 0, timeSpent: 0 };
  const { t, language } = useLanguage();
  
  const percentage = Math.round((score / total) * 100) || 0;
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const hasSavedScore = useRef(false);

  useEffect(() => {
    console.log('Result useEffect running...');
    const name = localStorage.getItem('studentName');
    const cls = localStorage.getItem('studentClass');
    const grd = localStorage.getItem('studentGrade');
    if (name) {
      setStudentName(name);
      if (cls) setStudentClass(cls);
      if (grd) setStudentGrade(grd);
    }
    
    if (percentage >= GAME_CONSTANTS.EXCELLENT_PERCENTAGE) {
      setShowCertificate(true);
    }

    if (name && total > 0 && !hasSavedScore.current) {
      console.log('Conditions met for saving score. Name:', name, 'Total:', total);
      hasSavedScore.current = true;
      const newEntry = {
        id: Date.now().toString(),
        name: name,
        className: cls || '',
        studentGrade: grd || '',
        score,
        total,
        percentage,
        gradeId,
        topicId,
        levelId,
        timeSpent: timeSpent || 0,
        date: new Date().toISOString(),
      };
      
      console.log('Saving to local storage and Google Sheets...');
      const existingData = localStorage.getItem('leaderboard');
      let leaderboard = [];
      if (existingData) {
        try {
          leaderboard = JSON.parse(existingData);
        } catch (e) {
          console.error('Failed to parse leaderboard data');
        }
      }
      
      leaderboard.push(newEntry);
      
      // Sort by percentage descending, then by score descending, then by timeSpent ascending, then by date descending
      leaderboard.sort((a: any, b: any) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        if (b.score !== a.score) return b.score - a.score;
        if (a.timeSpent !== b.timeSpent) return (a.timeSpent || 0) - (b.timeSpent || 0);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      // Keep top 100 per grade
      const groupedByGrade: Record<string, any[]> = {};
      leaderboard.forEach((entry: any) => {
        const gId = String(entry.gradeId);
        if (!groupedByGrade[gId]) groupedByGrade[gId] = [];
        groupedByGrade[gId].push(entry);
      });
      
      let newLeaderboard: any[] = [];
      Object.keys(groupedByGrade).forEach(gId => {
        newLeaderboard = newLeaderboard.concat(groupedByGrade[gId].slice(0, 100));
      });
      
      leaderboard = newLeaderboard;
      
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
      
      // Save to Google Sheets
      saveToGoogleSheets(newEntry);
    } else {
      console.log('Conditions NOT met for saving score:', { name, total, alreadySaved: hasSavedScore.current });
    }
  }, [percentage, score, total, gradeId, topicId, levelId, timeSpent]);

  useEffect(() => {
    if (percentage >= GAME_CONSTANTS.PASS_PERCENTAGE) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [percentage]);

  let message = '';
  let color = '';
  
  if (percentage === 100) {
    message = language === 'en' ? 'Excellent!\nYou are a math genius!' : 'Xuất sắc!\nEm là thiên tài toán học!';
    color = 'text-yellow-500';
  } else if (percentage >= GAME_CONSTANTS.EXCELLENT_PERCENTAGE) {
    message = language === 'en' ? 'Great job!\nKeep it up!' : 'Giỏi lắm!\nCố gắng thêm chút nữa nhé!';
    color = 'text-green-500';
  } else if (percentage >= GAME_CONSTANTS.PASS_PERCENTAGE) {
    message = language === 'en' ? 'Good effort! You need a bit more practice.' : 'Khá tốt! Em cần luyện tập thêm nha.';
    color = 'text-blue-500';
  } else {
    message = language === 'en' ? 'Don\'t be sad! Review and try again.' : 'Đừng buồn nhé! Hãy ôn lại bài và thử lại nào.';
    color = 'text-slate-500';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto pb-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-yellow-200 rounded-full blur-3xl opacity-50 animate-pulse" />
        <Trophy className={`w-40 h-40 ${percentage >= GAME_CONSTANTS.EXCELLENT_PERCENTAGE ? 'text-yellow-400 drop-shadow-lg' : 'text-slate-300'}`} />
        {percentage === 100 && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4"
          >
            <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />
          </motion.div>
        )}
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-3xl md:text-5xl font-bold mb-4 whitespace-pre-line ${color}`}
      >
        {message}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-2xl text-slate-700 font-medium mb-12 bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2"
      >
        <div>
          {language === 'en' ? 'Result:' : 'Kết quả:'} <span className="font-bold text-indigo-600 text-4xl">{score}</span> / {total} {language === 'en' ? 'correct' : 'câu đúng'}
        </div>
        <div className="text-lg text-slate-500">
          {language === 'en' ? 'Time:' : 'Thời gian:'} <span className="font-bold text-slate-700">{Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}</span>
        </div>
      </motion.div>

      {showCertificate && studentName && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring" }}
          className="w-full max-w-3xl mb-12 relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-[32px] blur opacity-30 animate-pulse"></div>
          <div className="bg-white border-8 border-yellow-100 rounded-[24px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-yellow-400 rounded-tl-xl m-4"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-yellow-400 rounded-tr-xl m-4"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-yellow-400 rounded-bl-xl m-4"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-yellow-400 rounded-br-xl m-4"></div>
            
            <div className="flex flex-col items-center relative z-10">
              <div className="text-center mb-4">
                <p className="text-sm md:text-base font-bold text-slate-700 uppercase tracking-wider">
                  {language === 'en' ? 'TRAN VAN DU PRIMARY SCHOOL' : 'TRƯỜNG TIỂU HỌC TRẦN VĂN DƯ'}
                </p>
                <p className="text-xs md:text-sm font-medium text-green-600 uppercase tracking-wide">
                  {language === 'en' ? 'AMAZING MATHEMATICS ORGANIZING COMMITTEE' : 'BAN TỔ CHỨC TOÁN HỌC KỲ THÚ'}
                </p>
              </div>
              <Award className="w-20 h-20 text-yellow-500 mb-4" />
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 uppercase tracking-widest">
                {language === 'en' ? 'Certificate' : 'Giấy Chứng Nhận'}
              </h2>
              <p className="text-lg text-slate-500 mb-8 uppercase tracking-widest">
                {language === 'en' ? 'Outstanding Achievement' : 'Thành Tích Xuất Sắc'}
              </p>
              
              <p className="text-xl text-slate-600 mb-2">{language === 'en' ? 'Awarded to:' : 'Chứng nhận bạn nhỏ:'}</p>
              <h3 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-6 font-serif italic">
                {studentName}
              </h3>
              
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                {language === 'en' 
                  ? `Has successfully completed the Math exercises with a score of ` 
                  : `Đã hoàn thành xuất sắc bài tập Toán với số điểm `}
                <span className="font-bold text-indigo-600">{score}/{total}</span>.
                <br />
                {language === 'en' 
                  ? `Wishing you continued success and love for Math!` 
                  : `Chúc em luôn học giỏi và yêu thích môn Toán!`}
              </p>
              
              <div className="flex justify-between w-full mt-8 pt-8 border-t-2 border-slate-100 px-8">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{language === 'en' ? 'Date' : 'Ngày hoàn thành'}</p>
                  <p className="font-bold text-slate-700">{new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-2">{language === 'en' ? 'Signature' : 'Chữ ký'}</p>
                  <p className="font-bold text-indigo-400 font-serif italic text-xl">{language === 'en' ? 'Organizing Committee' : 'BAN TỔ CHỨC'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center">
        {gradeId && topicId && levelId ? (
          <Link to={`/grade/${gradeId}/topic/${topicId}/play/${levelId}`} className="w-full sm:w-auto flex-1">
            <Button size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-16 text-xl shadow-lg hover:shadow-xl transition-all">
              <RefreshCw className="mr-2 w-6 h-6" /> {t('result.playAgain')}
            </Button>
          </Link>
        ) : null}
        <Link to="/leaderboard" className="w-full sm:w-auto flex-1">
          <Button variant="outline" size="lg" className="w-full border-2 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-xl h-16 text-xl">
            <ListOrdered className="mr-2 w-6 h-6" /> {language === 'en' ? 'Leaderboard' : 'Bảng Xếp Hạng'}
          </Button>
        </Link>
        <Link to="/" className="w-full sm:w-auto flex-1">
          <Button variant="outline" size="lg" className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl h-16 text-xl">
            <Home className="mr-2 w-6 h-6" /> {t('result.home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Result;
