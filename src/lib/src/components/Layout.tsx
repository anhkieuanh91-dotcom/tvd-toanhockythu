import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Star, Trophy, Globe, UserCircle, LogIn, HelpCircle } from 'lucide-react';
import Chatbot from './Chatbot';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { Button } from '@/src/components/ui/button';
import { resumeAudioContext } from '@/src/lib/sound';

const Layout = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempClass, setTempClass] = useState('');
  const [tempGrade, setTempGrade] = useState('');

  useEffect(() => {
    const handleFirstInteraction = () => {
      resumeAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    const updateUserData = () => {
      setStudentName(localStorage.getItem('studentName') || '');
      setStudentClass(localStorage.getItem('studentClass') || '');
      setStudentGrade(localStorage.getItem('studentGrade') || '');
    };
    
    const handleOpenLogin = () => {
      setTempName(localStorage.getItem('studentName') || '');
      setTempClass(localStorage.getItem('studentClass') || '');
      setTempGrade(localStorage.getItem('studentGrade') || '');
      setShowLogin(true);
    };
    
    updateUserData();
    window.addEventListener('user-updated', updateUserData);
    window.addEventListener('open-login', handleOpenLogin);
    return () => {
      window.removeEventListener('user-updated', updateUserData);
      window.removeEventListener('open-login', handleOpenLogin);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim() && tempGrade) {
      localStorage.setItem('studentName', tempName.trim());
      localStorage.setItem('studentClass', tempClass.trim());
      localStorage.setItem('studentGrade', tempGrade);
      window.dispatchEvent(new Event('user-updated'));
      setShowLogin(false);
    } else if (!tempGrade) {
      alert(language === 'en' ? 'Please select your grade.' : 'Vui lòng chọn khối lớp của em.');
    }
  };

  const openLogin = () => {
    setTempName(studentName);
    setTempClass(studentClass);
    setTempGrade(studentGrade);
    setShowLogin(true);
  };

  const toggleLanguage = () => {
    if (language === 'vi') setLanguage('en');
    else if (language === 'en') setLanguage('vi-en');
    else setLanguage('vi');
  };

  return (
    <div className="min-h-screen bg-yellow-50 font-sans text-slate-800">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-indigo-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-indigo-900 tracking-tight">{t('app.title')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={`flex items-center gap-1 font-medium transition-colors ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
              <Home className="w-4 h-4" /> {t('nav.home')}
            </Link>
            <Link to="/leaderboard" className={`flex items-center gap-1 font-medium transition-colors ${location.pathname === '/leaderboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
              <Trophy className="w-4 h-4" /> {t('nav.leaderboard')}
            </Link>
            <Link to="/guide" className={`flex items-center gap-1 font-medium transition-colors ${location.pathname === '/guide' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}>
              <HelpCircle className="w-4 h-4" /> {t('nav.guide')}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors bg-slate-100 px-3 py-1.5 rounded-full"
            >
              <Globe className="w-4 h-4" />
              {language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'English' : 'Việt - Anh'}
            </button>
            <div className="flex items-center gap-2">
              {studentName && studentGrade ? (
                <button onClick={openLogin} className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-indigo-200 hover:bg-indigo-200 transition-colors">
                  <UserCircle className="w-5 h-5" />
                  <span className="truncate max-w-[200px]">{studentName}</span>
                </button>
              ) : (
                <button onClick={openLogin} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm">
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'en' ? 'Login' : 'Đăng nhập'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        <Outlet />
      </main>

      <Chatbot />

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              {language === 'en' ? 'Student Information' : 'Thông tin học sinh'}
            </h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'en' ? 'Full Name' : 'Họ và tên'}</label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none"
                  placeholder={language === 'en' ? 'Enter your name' : 'Nhập tên của em'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'en' ? 'Grade' : 'Khối lớp'}</label>
                <select
                  required
                  value={tempGrade}
                  onChange={(e) => setTempGrade(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none bg-white"
                >
                  <option value="">{language === 'en' ? 'Select grade' : 'Chọn khối lớp'}</option>
                  <option value="1">{language === 'en' ? 'Grade 1' : 'Khối 1'}</option>
                  <option value="2">{language === 'en' ? 'Grade 2' : 'Khối 2'}</option>
                  <option value="3">{language === 'en' ? 'Grade 3' : 'Khối 3'}</option>
                  <option value="4">{language === 'en' ? 'Grade 4' : 'Khối 4'}</option>
                  <option value="5">{language === 'en' ? 'Grade 5' : 'Khối 5'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{language === 'en' ? 'Class' : 'Lớp'}</label>
                <input
                  type="text"
                  value={tempClass}
                  onChange={(e) => setTempClass(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none"
                  placeholder={language === 'en' ? 'Enter your class (e.g., 3A)' : 'Nhập lớp (VD: 3A)'}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowLogin(false)} className="flex-1 rounded-xl">
                  {language === 'en' ? 'Cancel' : 'Hủy'}
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  {language === 'en' ? 'Save' : 'Lưu'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
