import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CURRICULUM } from '@/src/data/curriculum';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Calculator, Shapes, Ruler, User, Trophy, Lock } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useLanguage } from '@/src/contexts/LanguageContext';

const icons = [BookOpen, Calculator, Shapes, Ruler, GraduationCap];

// Cute fruit images for each grade
const gradeImages = [
  { src: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f353.svg", bg: "bg-red-50", border: "border-red-200", hoverBorder: "hover:border-red-400" },    // Lớp 1 - Dâu tây
  { src: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f34a.svg", bg: "bg-orange-50", border: "border-orange-200", hoverBorder: "hover:border-orange-400" }, // Lớp 2 - Cam
  { src: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f34c.svg", bg: "bg-yellow-50", border: "border-yellow-200", hoverBorder: "hover:border-yellow-400" }, // Lớp 3 - Chuối
  { src: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f349.svg", bg: "bg-green-50", border: "border-green-200", hoverBorder: "hover:border-green-400" },  // Lớp 4 - Dưa hấu
  { src: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f347.svg", bg: "bg-blue-50", border: "border-blue-200", hoverBorder: "hover:border-blue-400" }    // Lớp 5 - Nho
];

// Cute face SVG to overlay on fruits
const CuteFace = () => (
  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-80" style={{ transform: 'scale(0.5) translateY(10px)' }}>
    {/* Eyes */}
    <circle cx="35" cy="45" r="6" fill="#1e293b" />
    <circle cx="65" cy="45" r="6" fill="#1e293b" />
    {/* Eye sparkles */}
    <circle cx="33" cy="43" r="2" fill="white" />
    <circle cx="63" cy="43" r="2" fill="white" />
    {/* Blush */}
    <ellipse cx="20" cy="55" rx="8" ry="4" fill="#ff8a8a" opacity="0.6" />
    <ellipse cx="80" cy="55" rx="8" ry="4" fill="#ff8a8a" opacity="0.6" />
    {/* Smile */}
    <path d="M 40 55 Q 50 65 60 55" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const Home = () => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const updateUserData = () => {
      const savedName = localStorage.getItem('studentName');
      const savedClass = localStorage.getItem('studentClass');
      const savedGrade = localStorage.getItem('studentGrade');
      if (savedName && savedGrade) {
        setStudentName(savedName);
        setStudentClass(savedClass || '');
        setStudentGrade(savedGrade);
        setIsNameSet(true);
      } else {
        setIsNameSet(false);
      }
    };
    
    updateUserData();
    window.addEventListener('user-updated', updateUserData);
    return () => window.removeEventListener('user-updated', updateUserData);
  }, []);

  const handleEditName = () => {
    window.dispatchEvent(new Event('open-login'));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="font-extrabold text-indigo-900 mb-4 tracking-tight uppercase flex flex-col gap-2">
          <span className="text-2xl md:text-4xl lg:text-5xl block">
            {language === 'en' ? 'TRAN VAN DU PRIMARY SCHOOL' : 'TRƯỜNG TIỂU HỌC TRẦN VĂN DƯ'}
          </span>
          <span className="text-4xl md:text-6xl lg:text-7xl block text-green-600">
            {language === 'en' ? 'AMAZING MATHEMATICS' : 'TOÁN HỌC KỲ THÚ'}
          </span>
        </h1>
        {isNameSet ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-indigo-600 font-bold">
              {t('home.welcome')} <span className="text-pink-500">{studentName}</span>! 👋
            </p>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-4">
              {t('home.instruction')}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleEditName}
                className="text-sm text-slate-400 hover:text-indigo-500 underline transition-colors"
              >
                {t('home.changeName')}
              </button>
              <Link to="/leaderboard">
                <Button variant="outline" size="sm" className="rounded-full border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800">
                  <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                  {language === 'en' ? 'Leaderboard' : 'Bảng Xếp Hạng'}
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </motion.div>

      {!isNameSet ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border-4 border-yellow-400 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="font-bold text-slate-800 mb-6 flex flex-col gap-1">
            <span className="text-lg md:text-xl block">
              {language === 'en' ? 'WELCOME TO' : 'CHÀO MỪNG EM ĐẾN VỚI'}
            </span>
            <span className="text-2xl md:text-3xl block text-green-600">
              {language === 'en' ? 'AMAZING MATHEMATICS' : 'TOÁN HỌC KỲ THÚ'}
            </span>
          </h2>
          <p className="text-slate-600 mb-8">{language === 'en' ? 'Please login to start playing.' : 'Vui lòng đăng nhập để bắt đầu chơi.'}</p>
          <Button 
            onClick={() => window.dispatchEvent(new Event('open-login'))}
            className="w-full py-6 text-xl rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
          >
            {language === 'en' ? 'Login' : 'Đăng nhập'}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl">
          {CURRICULUM.map((grade, index) => {
            const Icon = icons[index % icons.length];
            const imageInfo = gradeImages[index % gradeImages.length];
            const isAllowed = studentGrade === String(grade.id);

            const cardContent = (
              <motion.div
                whileHover={isAllowed ? { scale: 1.05, translateY: -5 } : {}}
                whileTap={isAllowed ? { scale: 0.95 } : {}}
                className={`bg-white rounded-3xl p-6 shadow-xl border-4 border-b-8 ${imageInfo.border} ${isAllowed ? imageInfo.hoverBorder : ''} transition-all h-full flex flex-col items-center justify-center gap-4 group relative overflow-hidden ${isAllowed ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale-[30%]'}`}
              >
                {!isAllowed && (
                  <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                    <div className="bg-slate-800/80 text-white p-3 rounded-full shadow-lg">
                      <Lock className="w-6 h-6" />
                    </div>
                  </div>
                )}
                <div className={`w-32 h-32 mb-2 rounded-full overflow-hidden border-4 border-white shadow-md flex items-center justify-center p-4 relative ${imageInfo.bg}`}>
                  <img src={imageInfo.src} alt={`Lớp ${grade.id}`} className="w-full h-full object-contain drop-shadow-sm relative z-0" referrerPolicy="no-referrer" />
                  <CuteFace />
                </div>
                <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                  index === 0 ? 'bg-red-100 text-red-600' :
                  index === 1 ? 'bg-orange-100 text-orange-600' :
                  index === 2 ? 'bg-yellow-100 text-yellow-600' :
                  index === 3 ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {grade.id}
                </div>
                <h2 className={`text-2xl font-bold text-slate-800 transition-colors ${isAllowed ? 'group-hover:text-indigo-600' : ''}`}>
                  {language === 'vi-en' ? `${grade.name} / Grade ${grade.id}` : language === 'en' ? `Grade ${grade.id}` : grade.name}
                </h2>
                <div className="text-sm text-slate-500 text-center font-medium bg-slate-100 px-3 py-1 rounded-full">
                  {grade.topics.length} {t('home.topicsCount')}
                </div>
              </motion.div>
            );

            return isAllowed ? (
              <Link key={grade.id} to={`/grade/${grade.id}`}>
                {cardContent}
              </Link>
            ) : (
              <div key={grade.id} onClick={() => alert(language === 'en' ? 'You can only play games for your selected grade.' : 'Em chỉ được chọn khối lớp đã đăng nhập để làm bài.')}>
                {cardContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
