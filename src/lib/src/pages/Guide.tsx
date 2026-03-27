import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Trophy, Star, MousePointer2, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/src/contexts/LanguageContext';

const Guide = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      icon: <MousePointer2 className="w-8 h-8 text-indigo-500" />,
      title: language === 'en' ? 'Step 1: Login' : 'Bước 1: Đăng nhập',
      description: language === 'en' 
        ? 'Click the "Login" button on the top right to enter your name and class.' 
        : 'Bấm vào nút "Đăng nhập" ở góc trên bên phải để nhập tên và lớp của em.',
      color: 'bg-indigo-50',
      borderColor: 'border-indigo-400',
      glowColor: 'shadow-indigo-200',
      stepBg: 'bg-indigo-600'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: language === 'en' ? 'Step 2: Choose Grade' : 'Bước 2: Chọn Lớp',
      description: language === 'en' 
        ? 'Select your current grade level (from Grade 1 to Grade 5).' 
        : 'Chọn khối lớp mà em đang học (từ Lớp 1 đến Lớp 5).',
      color: 'bg-blue-50',
      borderColor: 'border-blue-400',
      glowColor: 'shadow-blue-200',
      stepBg: 'bg-blue-600'
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: language === 'en' ? 'Step 3: Pick a Topic' : 'Bước 3: Chọn Chủ Đề',
      description: language === 'en' 
        ? 'Choose a math topic you want to practice, like Addition, Subtraction, or Geometry.' 
        : 'Chọn một chủ đề toán học mà em muốn luyện tập, ví dụ: Phép cộng, Phép trừ, Hình học...',
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      glowColor: 'shadow-yellow-200',
      stepBg: 'bg-yellow-500'
    },
    {
      icon: <HelpCircle className="w-8 h-8 text-green-500" />,
      title: language === 'en' ? 'Step 4: Select Level' : 'Bước 4: Chọn Mức Độ',
      description: language === 'en' 
        ? 'Pick a difficulty level: Easy, Medium, or Hard.' 
        : 'Chọn mức độ thử thách: Dễ, Trung bình hoặc Khó.',
      color: 'bg-green-50',
      borderColor: 'border-green-400',
      glowColor: 'shadow-green-200',
      stepBg: 'bg-green-600'
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-pink-500" />,
      title: language === 'en' ? 'Step 5: Play & Learn' : 'Bước 5: Chơi & Học',
      description: language === 'en' 
        ? 'Answer the questions correctly to earn points and see explanations.' 
        : 'Trả lời chính xác các câu hỏi để ghi điểm và xem giải thích chi tiết.',
      color: 'bg-pink-50',
      borderColor: 'border-pink-400',
      glowColor: 'shadow-pink-200',
      stepBg: 'bg-pink-600'
    },
    {
      icon: <Trophy className="w-8 h-8 text-orange-500" />,
      title: language === 'en' ? 'Step 6: Get Rewards' : 'Bước 6: Nhận Thưởng',
      description: language === 'en' 
        ? 'Achieve high scores to get certificates and be on the Leaderboard!' 
        : 'Đạt điểm cao để nhận Giấy chứng nhận và ghi danh vào Bảng xếp hạng!',
      color: 'bg-orange-50',
      borderColor: 'border-orange-400',
      glowColor: 'shadow-orange-200',
      stepBg: 'bg-orange-600'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-black text-pink-600 mb-4 flex items-center justify-center gap-3">
          <ArrowRight className="w-10 h-10" />
          {language === 'en' ? 'How to Play?' : 'Hướng Dẫn Cách Chơi'}
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          {language === 'en' 
            ? 'Follow these simple steps to start your math adventure!' 
            : 'Hãy làm theo các bước đơn giản sau để bắt đầu hành trình khám phá toán học nhé!'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-3xl p-8 shadow-xl border-2 ${step.borderColor} ${step.glowColor} hover:shadow-2xl transition-all relative group`}
            style={{ boxShadow: `0 10px 30px -10px var(--tw-shadow-color), 0 0 15px -5px var(--tw-shadow-color)` }}
          >
            <div className={`absolute -top-4 -left-4 w-10 h-10 ${step.stepBg} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
              {index + 1}
            </div>
            <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {step.icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{step.title}</h2>
            <p className="text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 bg-indigo-600 rounded-[40px] p-10 text-white text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <h2 className="text-3xl font-bold mb-4 relative z-10">
          {language === 'en' ? 'Ready to start?' : 'Em đã sẵn sàng chưa?'}
        </h2>
        <p className="text-xl text-indigo-100 mb-8 relative z-10">
          {language === 'en' 
            ? 'Join thousands of students and become a math master today!' 
            : 'Hãy tham gia cùng hàng ngàn bạn nhỏ khác và trở thành bậc thầy toán học ngay hôm nay!'}
        </p>
        <a href="/" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition-colors shadow-lg relative z-10">
          {language === 'en' ? 'Play Now' : 'Chơi Ngay Thôi'}
          <ArrowRight className="w-6 h-6" />
        </a>
      </motion.div>
    </div>
  );
};

export default Guide;
