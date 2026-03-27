import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CURRICULUM } from '@/src/data/curriculum';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Zap, Brain, Lock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useLanguage } from '@/src/contexts/LanguageContext';

const Topics = () => {
  const { gradeId } = useParams();
  const navigate = useNavigate();
  const grade = CURRICULUM.find(g => g.id === Number(gradeId));
  const { t, language } = useLanguage();
  const studentGrade = localStorage.getItem('studentGrade');

  if (!grade) {
    return <div className="text-center text-2xl text-red-500">Không tìm thấy lớp học!</div>;
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

  const icons = [Zap, Brain, Star];

  const getGradeColors = (id: number) => {
    switch (id) {
      case 1: return ['border-red-200', 'border-rose-200', 'border-pink-200', 'border-orange-200'];
      case 2: return ['border-orange-200', 'border-amber-200', 'border-yellow-200', 'border-red-200'];
      case 3: return ['border-yellow-200', 'border-amber-200', 'border-orange-200', 'border-lime-200'];
      case 4: return ['border-green-200', 'border-lime-200', 'border-emerald-200', 'border-teal-200'];
      case 5: return ['border-blue-200', 'border-sky-200', 'border-indigo-200', 'border-cyan-200'];
      default: return ['border-indigo-200', 'border-purple-200', 'border-pink-200', 'border-blue-200'];
    }
  };

  const getGradeHoverColors = (id: number) => {
    switch (id) {
      case 1: return ['hover:border-red-400', 'hover:border-rose-400', 'hover:border-pink-400', 'hover:border-orange-400'];
      case 2: return ['hover:border-orange-400', 'hover:border-amber-400', 'hover:border-yellow-400', 'hover:border-red-400'];
      case 3: return ['hover:border-yellow-400', 'hover:border-amber-400', 'hover:border-orange-400', 'hover:border-lime-400'];
      case 4: return ['hover:border-green-400', 'hover:border-lime-400', 'hover:border-emerald-400', 'hover:border-teal-400'];
      case 5: return ['hover:border-blue-400', 'hover:border-sky-400', 'hover:border-indigo-400', 'hover:border-cyan-400'];
      default: return ['hover:border-indigo-400', 'hover:border-purple-400', 'hover:border-pink-400', 'hover:border-blue-400'];
    }
  };

  const getGradeBgColors = (id: number) => {
    switch (id) {
      case 1: return ['bg-red-50', 'bg-rose-50', 'bg-pink-50', 'bg-orange-50'];
      case 2: return ['bg-orange-50', 'bg-amber-50', 'bg-yellow-50', 'bg-red-50'];
      case 3: return ['bg-yellow-50', 'bg-amber-50', 'bg-orange-50', 'bg-lime-50'];
      case 4: return ['bg-green-50', 'bg-lime-50', 'bg-emerald-50', 'bg-teal-50'];
      case 5: return ['bg-blue-50', 'bg-sky-50', 'bg-indigo-50', 'bg-cyan-50'];
      default: return ['bg-indigo-50', 'bg-purple-50', 'bg-pink-50', 'bg-blue-50'];
    }
  };

  const getGradeTextColors = (id: number) => {
    switch (id) {
      case 1: return ['text-red-600', 'text-rose-600', 'text-pink-600', 'text-orange-600'];
      case 2: return ['text-orange-600', 'text-amber-600', 'text-yellow-600', 'text-red-600'];
      case 3: return ['text-yellow-600', 'text-amber-600', 'text-orange-600', 'text-lime-600'];
      case 4: return ['text-green-600', 'text-lime-600', 'text-emerald-600', 'text-teal-600'];
      case 5: return ['text-blue-600', 'text-sky-600', 'text-indigo-600', 'text-cyan-600'];
      default: return ['text-indigo-600', 'text-purple-600', 'text-pink-600', 'text-blue-600'];
    }
  };

  const gradeBorders = getGradeColors(grade.id);
  const gradeHovers = getGradeHoverColors(grade.id);
  const gradeBgs = getGradeBgColors(grade.id);
  const gradeTexts = getGradeTextColors(grade.id);

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-indigo-600 font-medium mb-8 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('topics.back')}
      </Link>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">
          {language === 'vi-en' ? `Chương trình ${grade.name} / ${grade.nameEn} Program` : language === 'en' ? `${grade.nameEn} Program` : `Chương trình ${grade.name}`}
        </h1>
        <p className="text-slate-600 text-lg">
          {t('topics.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grade.topics.map((topic, index) => {
          const Icon = icons[index % icons.length];
          const borderClass = gradeBorders[index % gradeBorders.length];
          const hoverClass = gradeHovers[index % gradeHovers.length];
          const bgClass = gradeBgs[index % gradeBgs.length];
          const textClass = gradeTexts[index % gradeTexts.length];

          return (
            <Link key={topic.id} to={`/grade/${gradeId}/topic/${topic.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white rounded-2xl p-6 shadow-lg border-4 border-b-8 ${borderClass} ${hoverClass} transition-all flex items-start gap-4 h-full`}
              >
                <div className={`p-3 rounded-xl shrink-0 ${bgClass} ${textClass}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {language === 'vi-en' ? `${topic.name} / ${topic.nameEn}` : language === 'en' ? topic.nameEn : topic.name}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {language === 'vi-en' ? `${topic.description} / ${topic.descriptionEn}` : language === 'en' ? topic.descriptionEn : topic.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Topics;
