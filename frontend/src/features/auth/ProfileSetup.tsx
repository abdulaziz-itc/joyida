import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, MapPin, CheckCircle, ChevronRight, ArrowLeft, ShieldCheck, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';

const ProfileSetup: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { t } = useTranslation();
  const { updateUser, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isExpert: false,
    professions: [] as string[],
    bio: '',
    location: ''
  });

  const totalSteps = formData.isExpert ? 4 : 3;

  const professions = [
    { id: 'plumber', name: 'Santexnik', icon: '🔧' },
    { id: 'electrician', name: 'Elektrchi', icon: '⚡' },
    { id: 'lawyer', name: 'Advokat', icon: '⚖️' },
    { id: 'tutor', name: 'O\'qituvchi', icon: '📚' },
    { id: 'it', name: 'IT Mutaxassis', icon: '💻' },
  ];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updateData = {
        is_expert: formData.isExpert,
        skills: formData.professions,
        bio: formData.bio,
        profile_completed: true
      };

      // Call the API to update user profile
      await apiClient.put('/auth/me', updateData);
      
      // Update local store
      updateUser({
        is_expert: formData.isExpert,
        skills: formData.professions,
        bio: formData.bio,
        profile_completed: true
      });
      
      onFinish();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Fallback: still call onFinish so user can use the app, but log it
      onFinish();
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (formData.isExpert && step === 3) {
      nextStep();
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex items-center justify-center p-6">
      <motion.div 
        layout
        className="glass-card max-w-lg w-full p-8 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4].filter(i => i <= totalSteps).map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-purple-500' : 'w-4 bg-white/10'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">Step {step} of {totalSteps}</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">Siz kimsiz?</h2>
              <p className="text-gray-400 mb-8">Platformadagi asosiy rolingizni tanlang.</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => { setFormData({...formData, isExpert: false}); nextStep(); }}
                  className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Oddiy Mijozman</h3>
                    <p className="text-sm text-gray-500">O'zimga kerakli ishlarni qilib beruvchi mutaxassislarni izlayapman.</p>
                  </div>
                </button>

                <button
                  onClick={() => { setFormData({...formData, isExpert: true}); nextStep(); }}
                  className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Men Mutaxassisman</h3>
                    <p className="text-sm text-gray-500">O'z ishim va faoliyatimni obunachilarga taklif qilmoqchiman.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">
                {formData.isExpert ? "Ixtisosligingiz nima?" : "Nima qidiryapsiz?"}
              </h2>
              <p className="text-gray-400 mb-8">Sizni qiziqtirgan barcha yo'nalishlarni belgilashingiz mumkin.</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {professions.map(p => {
                  const isSelected = formData.professions.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                         if (isSelected) {
                            setFormData({...formData, professions: formData.professions.filter(n => n !== p.name)});
                         } else {
                            setFormData({...formData, professions: [...formData.professions, p.name]});
                         }
                      }}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                        isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <span className="text-sm font-medium">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              <textarea 
                className="input-field min-h-[100px] resize-none"
                placeholder={formData.isExpert ? "O'zingiz va ishlaringiz haqida yozing..." : "Qanday xizmatlar kutmoqdasiz? (Ixtiyoriy)"}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />

              <div className="flex gap-4">
                <button onClick={prevStep} className="px-6 py-4 text-gray-500 hover:text-white flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Orqaga
                </button>
                <button onClick={nextStep} className="glow-button flex-1 flex items-center justify-center gap-2">
                  Davom etish <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mx-auto mb-6">
                <MapPin className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Manzilingizni tasdiqlang</h2>
              <p className="text-gray-400 mb-8">Biz manzilingizdan kelib chiqib sizga eng yaqin xizmatlarni taklif qilamiz.</p>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-sm font-medium">Manzil aniqlanmoqda...</span>
                </div>
                <button className="text-xs text-purple-400 font-bold hover:underline">Xaritadan tanlash</button>
              </div>

               <div className="flex gap-4">
                <button onClick={prevStep} className="px-6 py-4 text-gray-500 hover:text-white">Orqaga</button>
                <button 
                  onClick={handleFinish} 
                  disabled={loading}
                  className="glow-button flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>{formData.isExpert ? "Keyingisi: Tasdiqlash" : "Yakunlash"} <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="w-8 h-8 text-purple-400" />
                 <h2 className="text-3xl font-bold">Mutaxassislikni tasdiqlash</h2>
              </div>
              <p className="text-gray-400 mb-8">Tasdiqlangan mutaxassislar 3 marta ko'proq mijoz topishadi. Ishonch belgisini olish uchun hujjatingizni onlayn tasdiqlang.</p>
              
              <div className="space-y-4 mb-8">
                 <div className="p-6 rounded-2xl border border-white/10 bg-white/5 border-dashed flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium">Shaxsni Tasdiqlovchi Hujjat (Pasport/Pravasi)</span>
                 </div>
                 <div className="p-6 rounded-2xl border border-white/10 bg-white/5 border-dashed flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-sm font-medium">Sertifikat yoki Diplom (Ixtiyoriy)</span>
                 </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="px-6 py-4 text-gray-500 hover:text-white">Orqaga</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="glow-button flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Tasdiqlash va Yakunlash <CheckCircle className="w-5 h-5" /></>
                  )}
                </button>
              </div>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full mt-4 text-sm text-gray-500 hover:text-gray-300 disabled:opacity-50"
              >
                {loading ? "Yuklanmoqda..." : "Hoziroq emas, o'tkazib yuborish"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
