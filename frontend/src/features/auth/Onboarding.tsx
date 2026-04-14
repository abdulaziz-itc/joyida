import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Star, Sparkles, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Onboarding: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/images/onboarding1.png',
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
      color: '#8b5cf6',
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      image: '/images/onboarding2.png',
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
      color: '#ec4899',
      icon: <Star className="w-6 h-6" />
    },
    {
      image: '/images/onboarding3.png',
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
      color: '#00d2ff',
      icon: <Activity className="w-6 h-6" />
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
    <div className="fixed inset-0 z-50 bg-[#020205] flex items-center justify-center p-6 lg:p-12 overflow-hidden">
      {/* Dynamic Ambient Background */}
      <AnimatePresence>
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            background: `radial-gradient(circle at ${currentSlide * 30 + 20}% 50%, ${slides[currentSlide].color}20, transparent 75%)` 
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      </AnimatePresence>
      <div className="ambient-glow glow-purple opacity-10" />
      <div className="ambient-glow glow-pink opacity-10" style={{ left: '-10%', bottom: '-10%' }} />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-center relative z-10 h-full max-h-[900px]">
        {/* Image Section with Depth */}
        <div className="relative flex justify-center items-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 80, rotateY: 30, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -80, rotateY: -30, scale: 0.8 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full flex justify-center"
            >
              <div 
                 className="absolute inset-0 blur-[100px] rounded-full opacity-40 transition-all duration-1000"
                 style={{ backgroundColor: slides[currentSlide].color }}
              />
              <img
                src={slides[currentSlide].image}
                className="max-h-[350px] md:max-h-[500px] lg:max-h-[650px] w-auto relative z-10 drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] object-contain"
                alt="Onboarding"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge */}
          <motion.div 
            key={`badge-${currentSlide}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-xs uppercase tracking-widest mb-10"
            style={{ color: slides[currentSlide].color }}
          >
            {slides[currentSlide].icon}
            {t('onboarding.step_n_of_m', { step: currentSlide + 1, total: slides.length })}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl lg:text-8xl font-black mb-8 tracking-tighter leading-[1.05] gradient-text">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl lg:text-2xl text-gray-400 mb-12 leading-relaxed max-w-xl font-medium">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="flex gap-4 mb-12">
            {slides.map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ 
                  width: i === currentSlide ? 60 : 16,
                  backgroundColor: i === currentSlide ? slides[currentSlide].color : 'rgba(255,255,255,0.1)'
                }}
                className="h-2 rounded-full transition-all duration-500"
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-auto">
            <button 
              onClick={nextSlide}
              className="glow-button group flex items-center justify-center gap-4 px-12 py-6 text-2xl relative overflow-hidden min-w-[240px]"
            >
              <span className="relative z-10">
                {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
              </span>
              <ChevronRight className="w-8 h-8 relative z-10 transition-transform group-hover:translate-x-2" />
            </button>
            <button 
              onClick={onFinish}
              className="flex items-center justify-center px-10 py-6 text-gray-400 hover:text-white transition-all font-black text-lg hover:bg-white/5 rounded-2xl tracking-widest"
            >
              {t('onboarding.skip').toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
