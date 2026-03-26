import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CURRICULUM, LEVELS } from '@/src/data/curriculum';
import { motion } from 'motion/react';
import { ArrowLeft, Swords, Shield, Crown, Lock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useLanguage } from '@/src/contexts/LanguageContext';

const Levels = () => {
  const { gradeId, topicId } = useParams();
  const grade = CURRICULUM.find(g => g.id === Number(gradeId));
  const topic = grade?.topics.find(t => t.id === topicId);
  const { t, language } = useLanguage();
  const studentGrade = localStorage.getItem('studentGrade');

  if (!grade || !topic) {
    return <div className="text-center text-2xl text-red-500">Không tìm thấy chủ đề!</div>;
  }

  const isAllowed = studentGrade === String(grade.id);

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
                ? `You can only access topics for Grade ${studentGrade}.` 
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

  const icons = [Shield, Swords, Crown];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-start mb-8">
        <Link to={`/grade/${gradeId}`} className="inline-flex items-center text-indigo-600 font-medium hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('levels.back')}
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-indigo-900 mb-4">
          {language === 'vi-en' ? `${topic.name} / ${topic.nameEn}` : language === 'en' ? topic.nameEn : topic.name}
        </h1>
        <p className="text-xl text-slate-600">
          {t('levels.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {LEVELS.map((level, index) => {
          const Icon = icons[index];
          return (
            <Link key={level.id} to={`/grade/${gradeId}/topic/${topicId}/play/${level.id}`}>
              <motion.div
                whileHover={{ scale: 1.05, translateY: -10 }}
                whileTap={{ scale: 0.95 }}
                className={`relative overflow-hidden rounded-3xl p-8 shadow-xl cursor-pointer h-full flex flex-col items-center justify-center gap-6 border-b-8 transition-all group ${
                  level.id === 'easy' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                  level.id === 'medium' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300' :
                  'bg-red-50 border-red-200 hover:border-red-300'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner mb-2 ${
                  level.id === 'easy' ? 'bg-green-100 text-green-600' :
                  level.id === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  <Icon className="w-12 h-12" />
                </div>
                
                <h3 className={`text-2xl font-bold ${
                  level.id === 'easy' ? 'text-green-700' :
                  level.id === 'medium' ? 'text-yellow-700' :
                  'text-red-700'
                }`}>
                  {language === 'vi-en' ? `${level.name} / ${level.nameEn}` : language === 'en' ? level.nameEn : level.name}
                </h3>
                
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors" />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Levels;
