import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Mail, Lock, LogIn, ArrowRight, ArrowLeft, Camera, FileText, MapPin, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [isExpert, setIsExpert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthYear: 2000,
    gender: 'Male',
    educationLevel: 'Bachelor',
    workplace: '',
    serviceIds: [] as number[],
    latitude: null as number | null,
    longitude: null as number | null,
    locationName: '',
    profilePictureUrl: '',
    diplomaUrl: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/utils/services');
        setServices(response.data);
      } catch (e) {
        console.error('Error fetching services', e);
      }
    };
    fetchServices();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'diplomaUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setIsLoading(true);
      const response = await apiClient.post('/utils/upload', data);
      setFormData(prev => ({ ...prev, [field]: response.data.url }));
    } catch (error) {
       console.error('Upload failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        is_expert: isExpert,
        birth_year: formData.birthYear,
        gender: formData.gender,
        education_level: formData.educationLevel,
        workplace: formData.workplace,
        service_ids: formData.serviceIds,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_location_name: formData.locationName,
        profile_picture_url: formData.profilePictureUrl,
      });

      const loginData = new FormData();
      loginData.append('username', formData.email);
      loginData.append('password', formData.password);
      
      const loginResponse = await apiClient.post('/auth/login/access-token', loginData);
      setAuth(response.data, loginResponse.data.access_token);
    } catch (error: any) {
       console.error('Registration failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const stepVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-main">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-30 mix-blend-overlay" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-12 flex items-end justify-between px-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3" /> {t('register.step_indicator', 'Onboarding')}
            </div>
            <h2 className="text-5xl font-black font-display text-white tracking-tight">
              {t('register.title', 'Join Us')}.
            </h2>
            <p className="text-foreground/50 font-medium">{t('register.subtitle', 'Create your professional profile today.')}</p>
          </div>
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <motion.div
           layout
           className="glass-card p-8 md:p-12 border-white/5 shadow-2xl shadow-primary/5"
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <h3 className="text-2xl font-black text-white px-2 tracking-tight">{t('register.choose_role', 'Select your path')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setIsExpert(false)}
                    className={`p-10 rounded-[32px] border-2 transition-all cursor-pointer group ${!isExpert ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${!isExpert ? 'bg-primary text-white' : 'bg-white/5 text-foreground/40'}`}>
                      <User className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-black text-white">{t('auth.regular_user', 'Client')}</h4>
                    <p className="text-sm text-foreground/40 mt-3 font-medium leading-relaxed">{t('register.user_desc', 'I want to discover and book architects.')}</p>
                  </div>
                  <div 
                    onClick={() => setIsExpert(true)}
                    className={`p-10 rounded-[32px] border-2 transition-all cursor-pointer group ${isExpert ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isExpert ? 'bg-primary text-white' : 'bg-white/5 text-foreground/40'}`}>
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-black text-white">{t('auth.expert', 'Architect')}</h4>
                    <p className="text-sm text-foreground/40 mt-3 font-medium leading-relaxed">{t('register.expert_desc', 'I want to offer my services to clients.')}</p>
                  </div>
                </div>
                <div className="pt-4 px-2">
                  <button onClick={nextStep} className="glow-button w-full">
                    {t('register.next', 'Continue')} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="relative group px-1">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-5 h-5 transition-colors" />
                  <input 
                    type="text" placeholder={t('register.fullname_placeholder', 'Full Name')} className="premium-input pl-14" 
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="relative group px-1">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-5 h-5 transition-colors" />
                  <input 
                    type="email" placeholder={t('register.email_placeholder', 'Email Address')} className="premium-input pl-14" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative group px-1">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-5 h-5 transition-colors" />
                  <input 
                    type="password" placeholder={t('register.password_placeholder', 'Create Password')} className="premium-input pl-14" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-6 px-1">
                  <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-foreground/40 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> {t('register.prev', 'Back')}
                  </button>
                  <button onClick={isExpert ? nextStep : handleRegister} className="flex-[2] glow-button">
                    {isExpert ? t('register.next', 'Next') : (isLoading ? t('register.creating', 'Joining...') : t('register.register_now', 'Join Now'))}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="px-1">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mb-6 block">{t('register.prof_categories', 'Expertise Fields')}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {services.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => {
                          const ids = formData.serviceIds.includes(s.id) 
                            ? formData.serviceIds.filter(id => id !== s.id)
                            : [...formData.serviceIds, s.id];
                          setFormData({...formData, serviceIds: ids});
                        }}
                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all ${formData.serviceIds.includes(s.id) ? 'bg-primary text-white shadow-glow-primary' : 'bg-white/5 border border-white/10 text-foreground/40 hover:border-primary/50'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 px-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 leading-none">{t('auth.birth_year', 'Birth Year')}</label>
                    <select 
                      className="premium-input py-4 text-sm" 
                      value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: parseInt(e.target.value)})}
                    >
                      {Array.from({length: 50}, (_, i) => 2010 - i).map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 leading-none">{t('auth.gender', 'Gender')}</label>
                    <select 
                      className="premium-input py-4 text-sm"
                      value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Male" className="bg-background">{t('auth.male', 'Male')}</option>
                      <option value="Female" className="bg-background">{t('auth.female', 'Female')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 leading-none">{t('auth.education', 'Qualification')}</label>
                  <div className="relative group">
                    <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-5 h-5 transition-colors" />
                    <select className="premium-input pl-14 py-4 text-sm" value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})}>
                      <option value="Bachelor" className="bg-background">{t('register.bachelor', 'Bachelor')}</option>
                      <option value="Master" className="bg-background">{t('register.master', 'Master')}</option>
                      <option value="PhD" className="bg-background">{t('register.phd', 'PhD')}</option>
                      <option value="DS" className="bg-background">{t('register.professor', 'Doctor Science')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 px-1">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 leading-none">{t('auth.workplace', 'Organization')}</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-5 h-5 transition-colors" />
                    <input 
                      type="text" placeholder={t('register.workplace_hint', 'Company Name')} className="premium-input pl-14" 
                      value={formData.workplace} onChange={e => setFormData({...formData, workplace: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 px-1">
                  <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-foreground/40 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> {t('register.prev', 'Back')}
                  </button>
                  <button onClick={nextStep} className="flex-[2] glow-button">
                    {t('register.next', 'Continue')}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                <div className="grid grid-cols-2 gap-8 px-1">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] pl-1">{t('register.profile_photo', 'Identity Scan')}</label>
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/5 rounded-[32px] cursor-pointer hover:border-primary/50 hover:bg-white/[0.03] transition-all group overflow-hidden">
                      {formData.profilePictureUrl ? (
                        <img src={`https://backend.joida.uz${formData.profilePictureUrl}`} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                             <Camera className="w-6 h-6 text-foreground/30 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-[10px] text-foreground/30 font-black uppercase tracking-wider group-hover:text-white transition-colors">{t('register.select_image', 'Upload Photo')}</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'profilePictureUrl')} />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] pl-1">{t('register.diploma_cert', 'Certification')}</label>
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/5 rounded-[32px] cursor-pointer hover:border-primary/50 hover:bg-white/[0.03] transition-all group overflow-hidden">
                      {formData.diplomaUrl ? (
                        <div className="flex flex-col items-center text-primary">
                          <FileText className="w-10 h-10 mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{t('register.uploaded', 'Ready')}</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                             <FileText className="w-6 h-6 text-foreground/30 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-[10px] text-foreground/30 font-black uppercase tracking-wider group-hover:text-white transition-colors">{t('register.select_file', 'Upload PDF')}</span>
                        </>
                      )}
                      <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'diplomaUrl')} />
                    </label>
                  </div>
                </div>

                <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-between mx-1 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                      <MapPin className="text-primary w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-black text-white text-sm">{t('register.service_location', 'Practice Location')}</h5>
                      <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                        {formData.locationName || t('register.detecting', 'Awaiting Sync')}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setFormData({...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude, locationName: 'Satellite Verified'});
                      });
                    }}
                    className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {t('register.get_gps', 'Sync GPS')}
                  </button>
                </div>

                <div className="flex gap-4 pt-6 px-1">
                  <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-foreground/40 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4" /> {t('register.prev', 'Back')}
                  </button>
                  <button onClick={handleRegister} disabled={isLoading} className="flex-[2] glow-button">
                    {isLoading ? t('register.finalizing', 'Processing...') : t('register.register_expert', 'Complete Registration')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-12 text-center">
          <button onClick={onBackToLogin} className="text-foreground/30 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto">
            <LogIn className="w-4 h-4" /> {t('register.already_account', 'Established User? Sign In')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
