import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Moon, Sun, ChevronRight, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-[60] bg-[#020205] flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative Ambient Glows */}
      <div className="ambient-glow glow-purple opacity-20" />
      <div className="ambient-glow glow-pink opacity-20" style={{ left: '-10%', bottom: '-10%' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card max-w-lg w-full p-8 md:p-10 relative"
      >
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 gradient-text">
              {t('preferences.title')}
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              {t('preferences.subtitle')}
            </p>
          </motion.div>

          {/* Language Selection */}
          <div className="mb-10">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-purple-400/80 mb-6 block flex items-center gap-2">
              <Globe className="w-4 h-4" /> {t('preferences.language')}
            </label>
            <div className="flex flex-col gap-3">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 ${
                    selectedLang === lang.code 
                      ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02]' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                      {lang.flag}
                    </span>
                    <span className={`text-lg font-semibold ${selectedLang === lang.code ? 'text-white' : 'text-gray-400'}`}>
                      {lang.name}
                    </span>
                  </div>
                  <AnimatePresence>
                    {selectedLang === lang.code && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="mb-12">
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-purple-400/80 mb-6 block flex items-center gap-2">
              <Sun className="w-4 h-4" /> {t('preferences.theme')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={() => setSelectedTheme('dark')}
                className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedTheme === 'dark' 
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className={`p-3 rounded-full ${selectedTheme === 'dark' ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                  <Moon className={`w-6 h-6 ${selectedTheme === 'dark' ? 'text-purple-400' : 'text-gray-500'}`} />
                </div>
                <span className={`font-bold ${selectedTheme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                  {t('preferences.dark')}
                </span>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => setSelectedTheme('light')}
                className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
                  selectedTheme === 'light' 
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <div className={`p-3 rounded-full ${selectedTheme === 'light' ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                  <Sun className={`w-6 h-6 ${selectedTheme === 'light' ? 'text-purple-400' : 'text-gray-500'}`} />
                </div>
                <span className={`font-bold ${selectedTheme === 'light' ? 'text-white' : 'text-gray-500'}`}>
                  {t('preferences.light')}
                </span>
              </motion.button>
            </div>
          </div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleContinue}
            className="glow-button w-full flex items-center justify-center gap-3 py-5 text-xl relative group"
          >
            <span className="relative z-10 font-bold">{t('preferences.continue')}</span>
            <ChevronRight className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PreferenceSelection;
