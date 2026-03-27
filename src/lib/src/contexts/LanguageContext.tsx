import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'vi' | 'en' | 'vi-en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  vi: {
    'app.title': 'Toán Tiểu Học',
    'nav.home': 'Trang Chủ',
    'nav.leaderboard': 'Bảng Xếp Hạng',
    'nav.guide': 'Hướng Dẫn',
    'nav.leaderboard.tooltip': 'Tính năng đang phát triển',
    'score': 'Điểm',
    'home.title': 'TRƯỜNG TIỂU HỌC TRẦN VĂN DƯ',
    'home.welcome': 'Chào bạn nhỏ',
    'home.instruction': 'Hãy chọn lớp của mình để bắt đầu hành trình khám phá nhé!',
    'home.changeName': 'Đổi tên khác',
    'home.subtitle': 'Chào mừng các em đến với thế giới toán học thật vui.',
    'home.askName': 'Bạn tên là gì nhỉ?',
    'home.namePlaceholder': 'Nhập tên của bạn vào đây...',
    'home.start': 'Bắt đầu chơi nào! 🚀',
    'home.topicsCount': 'chủ đề',
    'topics.title': 'Chủ Đề Toán Học',
    'topics.subtitle': 'Chọn một chủ đề để bắt đầu luyện tập',
    'topics.back': 'Quay lại chọn lớp',
    'levels.title': 'Chọn Mức Độ',
    'levels.subtitle': 'Thử thách bản thân với các mức độ khác nhau',
    'levels.back': 'Quay lại chọn chủ đề',
    'levels.level': 'Mức độ',
    'levels.questions': 'câu hỏi',
    'game.back': 'Thoát',
    'game.question': 'Câu hỏi',
    'game.score': 'Điểm',
    'game.next': 'Câu tiếp theo',
    'game.finish': 'Hoàn thành',
    'game.correct': 'Chính xác!',
    'game.incorrect': 'Chưa đúng rồi!',
    'game.correctAnswer': 'Đáp án đúng là:',
    'game.explanation': 'Giải thích:',
    'result.title': 'Hoàn Thành Xuất Sắc!',
    'result.score': 'Điểm số của bạn',
    'result.correct': 'Số câu đúng',
    'result.time': 'Thời gian',
    'result.playAgain': 'Chơi Lại',
    'result.home': 'Về Trang Chủ',
    'chatbot.title': 'Trợ lý Toán học',
    'chatbot.placeholder': 'Hỏi tôi bất cứ điều gì về toán...',
    'chatbot.send': 'Gửi',
    'chatbot.loading': 'Đang suy nghĩ...',
  },
  en: {
    'app.title': 'Primary Math',
    'nav.home': 'Home',
    'nav.leaderboard': 'Leaderboard',
    'nav.guide': 'Guide',
    'nav.leaderboard.tooltip': 'Feature in development',
    'score': 'Points',
    'home.title': 'Math is Fun!',
    'home.welcome': 'Hello there',
    'home.instruction': 'Choose your grade to start the adventure!',
    'home.changeName': 'Change name',
    'home.subtitle': 'Welcome to the wonderful world of mathematics.',
    'home.askName': 'What is your name?',
    'home.namePlaceholder': 'Enter your name here...',
    'home.start': 'Let\'s play! 🚀',
    'home.topicsCount': 'topics',
    'topics.title': 'Math Topics',
    'topics.subtitle': 'Choose a topic to start practicing',
    'topics.back': 'Back to grades',
    'levels.title': 'Select Level',
    'levels.subtitle': 'Challenge yourself with different levels',
    'levels.back': 'Back to topics',
    'levels.level': 'Level',
    'levels.questions': 'questions',
    'game.back': 'Exit',
    'game.question': 'Question',
    'game.score': 'Score',
    'game.next': 'Next Question',
    'game.finish': 'Finish',
    'game.correct': 'Correct!',
    'game.incorrect': 'Incorrect!',
    'game.correctAnswer': 'Correct answer is:',
    'game.explanation': 'Explanation:',
    'result.title': 'Excellent Work!',
    'result.score': 'Your Score',
    'result.correct': 'Correct Answers',
    'result.time': 'Time',
    'result.playAgain': 'Play Again',
    'result.home': 'Back to Home',
    'chatbot.title': 'Math Assistant',
    'chatbot.placeholder': 'Ask me anything about math...',
    'chatbot.send': 'Send',
    'chatbot.loading': 'Thinking...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi-en');

  const t = (key: string): string => {
    const viText = translations['vi'][key as keyof typeof translations['vi']] || key;
    const enText = translations['en'][key as keyof typeof translations['en']] || key;
    
    if (language === 'vi-en') {
      if (viText === enText) return viText;
      return `${viText} / ${enText}`;
    }
    
    return translations[language as 'vi' | 'en'][key as keyof typeof translations['vi']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
