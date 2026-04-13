import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Onboarding: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/images/onboarding1.png',
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
      color: 'var(--primary)'
    },
    {
      image: '/images/onboarding2.png',
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
      color: 'var(--secondary)'
    },
    {
      image: '/images/onboarding3.png',
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
      color: 'var(--accent)'
    },
  ];

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onFinish();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020205] flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Ambient Background */}
      <motion.div 
        animate={{ 
          background: `radial-gradient(circle at ${currentSlide * 30}% 50%, ${slides[currentSlide].color}15, transparent 70%)` 
        }}
        className="absolute inset-0 z-0 pointer-events-none"
      />
      <div className="ambient-glow glow-purple opacity-10" />
      <div className="ambient-glow glow-pink opacity-10" style={{ left: '-10%', bottom: '-10%' }} />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        {/* Image Section with Parallax Effect */}
        <div className="relative flex justify-center items-center perspective-1000">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 60, rotateY: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, rotateY: -20, scale: 0.8 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-purple-500/20 blur-[80px] rounded-full" />
              <img
                src={slides[currentSlide].image}
                className="max-h-[450px] md:max-h-[550px] w-auto relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                alt="Onboarding"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Progress Indicators */}
          <div className="flex gap-3 mb-10">
            {slides.map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ 
                  width: i === currentSlide ? 40 : 12,
                  backgroundColor: i === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                }}
                className="h-1.5 rounded-full transition-all duration-500"
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 tracking-tighter leading-[1.1] gradient-text">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-lg font-medium">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4">
            <button 
              onClick={nextSlide}
              className="glow-button group flex items-center justify-center gap-3 px-10 py-5 text-xl relative overflow-hidden"
            >
              <span className="relative z-10">
                {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
              </span>
              <ChevronRight className="w-6 h-6 relative z-10 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={onFinish}
              className="flex items-center justify-center px-10 py-5 text-gray-500 hover:text-white transition-all font-bold text-lg hover:bg-white/5 rounded-2xl"
            >
              {t('onboarding.skip')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
