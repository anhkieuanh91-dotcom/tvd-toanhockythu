import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Medal, Home, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { GAME_CONSTANTS } from '@/src/constants';

interface LeaderboardEntry {
  id: string;
  name: string;
  className?: string;
  score: number;
  total: number;
  percentage: number;
  gradeId: number;
  topicId: string;
  levelId: string;
  timeSpent?: number;
  date: string;
}

const Leaderboard = () => {
  const { t, language } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentGrade, setStudentGrade] = useState<string | null>(null);

  useEffect(() => {
    const grade = localStorage.getItem('studentGrade');
    setStudentGrade(grade);

    const data = localStorage.getItem('leaderboard');
    if (data) {
      try {
        const parsed = JSON.parse(data) as LeaderboardEntry[];
        if (grade) {
          // Filter by gradeId matching the student's grade
          setLeaderboard(parsed.filter(entry => String(entry.gradeId) === grade));
        } else {
          setLeaderboard(parsed);
        }
      } catch (e) {
        console.error('Failed to parse leaderboard data');
      }
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Link to="/">
          <Button variant="ghost" className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === 'en' ? 'Back' : 'Quay lại'}
          </Button>
        </Link>
        <div className="flex items-center gap-3 bg-yellow-50 text-yellow-700 px-6 py-3 rounded-2xl border border-yellow-200 shadow-sm">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">
            {language === 'en' ? 'Leaderboard' : 'Bảng Xếp Hạng'}
            {studentGrade ? ` - ${language === 'en' ? 'Grade' : 'Khối'} ${studentGrade}` : ''}
          </h1>
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">
            {language === 'en' ? 'No records yet' : 'Chưa có thành tích nào'}
          </h2>
          <p className="text-slate-500 mb-8">
            {language === 'en' ? 'Play a game to see your name here!' : 'Hãy chơi một trò chơi để ghi danh vào bảng xếp hạng nhé!'}
          </p>
          <Link to="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
              <Home className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Go to Home' : 'Về trang chủ'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 font-semibold text-slate-600 w-16 text-center">#</th>
                  <th className="py-4 px-6 font-semibold text-slate-600">{language === 'en' ? 'Name' : 'Tên'}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-center">{language === 'en' ? 'Class' : 'Lớp'}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-center">{language === 'en' ? 'Score' : 'Điểm'}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-center">{language === 'en' ? 'Accuracy' : 'Tỉ lệ đúng'}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-center">{language === 'en' ? 'Time' : 'Thời gian'}</th>
                  <th className="py-4 px-6 font-semibold text-slate-600 text-right">{language === 'en' ? 'Date' : 'Ngày'}</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-50 hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-center">
                      {index === 0 ? (
                        <Medal className="w-6 h-6 text-yellow-500 mx-auto" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-slate-400 mx-auto" />
                      ) : index === 2 ? (
                        <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                      ) : (
                        <span className="text-slate-400 font-medium">{index + 1}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">
                      {entry.name}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600">
                      {entry.className || '-'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
                        {entry.score} / {entry.total}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`font-semibold ${
                        entry.percentage >= GAME_CONSTANTS.EXCELLENT_PERCENTAGE ? 'text-green-600' : 
                        entry.percentage >= GAME_CONSTANTS.PASS_PERCENTAGE ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        {entry.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-600 font-medium">
                      {entry.timeSpent !== undefined ? `${Math.floor(entry.timeSpent / 60)}:${String(entry.timeSpent % 60).padStart(2, '0')}` : '--:--'}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-500 text-sm">
                      {new Date(entry.date).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
