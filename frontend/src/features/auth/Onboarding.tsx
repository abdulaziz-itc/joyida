import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Onboarding: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/images/onboarding1.png',
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
    },
    {
      image: '/images/onboarding2.png',
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
    },
    {
      image: '/images/onboarding3.png',
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
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
    <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Image Section */}
        <div className="relative flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={slides[currentSlide].image}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="max-h-[500px] w-auto drop-shadow-[0_0_30px_#9D50BB4D]"
              alt="Onboarding"
            />
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="flex gap-2 mb-8">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-purple-500' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-md">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={nextSlide}
              className="glow-button flex items-center justify-center gap-2 px-8 py-4 text-lg"
            >
              {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onFinish}
              className="px-8 py-4 text-gray-500 hover:text-white transition-colors"
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
