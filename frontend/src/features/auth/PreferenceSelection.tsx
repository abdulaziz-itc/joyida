import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Moon, Sun, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PreferenceSelection: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t, i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language.split('-')[0] || 'uz');
  const [selectedTheme, setSelectedTheme] = useState('dark');

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang);
    document.documentElement.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('user-theme', selectedTheme);
    onFinish();
  };

  const languages = [
    { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-8"
      >
        <h2 className="text-2xl font-bold mb-2">{t('preferences.title')}</h2>
        <p className="text-gray-400 mb-8">{t('preferences.subtitle')}</p>

        {/* Language Selection */}
        <div className="mb-8">
          <label className="text-sm font-medium text-gray-400 mb-4 block flex items-center gap-2">
            <Globe className="w-4 h-4" /> {t('preferences.language')}
          </label>
          <div className="grid grid-cols-1 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  selectedLang === lang.code 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {selectedLang === lang.code && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#9D50BB]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="mb-10">
          <label className="text-sm font-medium text-gray-400 mb-4 block flex items-center gap-2">
            <Moon className="w-4 h-4" /> {t('preferences.theme')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedTheme('dark')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedTheme === 'dark' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Moon className={`w-6 h-6 ${selectedTheme === 'dark' ? 'text-purple-400' : 'text-gray-500'}`} />
              <span className="text-sm">{t('preferences.dark')}</span>
            </button>
            <button
              onClick={() => setSelectedTheme('light')}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedTheme === 'light' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Sun className={`w-6 h-6 ${selectedTheme === 'light' ? 'text-purple-400' : 'text-gray-500'}`} />
              <span className="text-sm">{t('preferences.light')}</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="glow-button w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          {t('preferences.continue')}
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

export default PreferenceSelection;
