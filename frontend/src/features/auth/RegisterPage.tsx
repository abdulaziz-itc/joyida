import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ShieldCheck, Mail, Lock, LogIn, ArrowRight, ArrowLeft, 
  Camera, FileText, MapPin, Sparkles, GraduationCap, Briefcase, 
  Phone, Languages, Globe, Tag, Award, CheckCircle2, X
} from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle } from 'lucide-react';

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
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    email: '',
    password: '',
    phone: '',
    headline: '',
    bio: '',
    birthDay: '15',
    birthMonth: '06',
    birthYear: '1995',
    gender: 'Erkak',
    educationLevel: 'Bakalavr',
    educationInfo: [] as any[],
    experienceInfo: [] as any[],
    skills: [] as string[],
    languages: [{ language: 'O\'zbek', level: 'Native' }] as any[],
    socialLinks: [] as any[],
    serviceIds: [] as number[],
    latitude: null as number | null,
    longitude: null as number | null,
    locationName: '',
    profilePictureUrl: '',
    diplomaUrl: '',
  });

  const [tempSkill, setTempSkill] = useState('');

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

  // Email availability check with debounce
  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setEmailStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setEmailStatus('checking');
      try {
        const res = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        setEmailStatus(res.data.available ? 'available' : 'taken');
      } catch (e) {
        setEmailStatus('idle');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'diplomaUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setIsLoading(true);
      const response = await apiClient.post('/utils/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      const fullName = `${formData.lastName} ${formData.firstName} ${formData.patronymic}`.trim();
      
      const response = await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: fullName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        patronymic: formData.patronymic,
        is_expert: isExpert,
        birth_date: birthDate,
        gender: formData.gender,
        education_level: formData.educationLevel,
        education_info: formData.educationInfo,
        experience_info: formData.experienceInfo,
        phone_number: formData.phone,
        bio: formData.bio,
        headline: formData.headline,
        skills: formData.skills,
        languages: formData.languages,
        social_links: formData.socialLinks,
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
       const detail = error.response?.data?.detail;
       if (typeof detail === 'string') {
         setGeneralError(detail);
       } else if (Array.isArray(detail)) {
         setGeneralError(detail[0]?.msg || 'Ma\'lumotlar xato kiritildi');
       } else {
         setGeneralError('Ro\'yxatdan o\'tishda kutilmagan xatolik yuz berdi');
       }
    } finally {
      setIsLoading(false);
      setIsRegistering(false);
    }
  };

  const addSkill = () => {
    if (tempSkill && !formData.skills.includes(tempSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, tempSkill] });
      setTempSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden font-main">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-color-dodge" />
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10 items-stretch">
        
        {/* LEFT: FORM SIDE */}
        <div className="flex-1 space-y-8 lg:space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3" /> Step {step + 1} / 6
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
              {step === 0 ? "Siz kimsiz?" : "Ma'lumotlar"}.
            </h2>
            <div className="flex gap-1.5 pt-2">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${step === i ? 'w-10 bg-primary shadow-glow-primary' : (step > i ? 'w-4 bg-primary/50' : 'w-4 bg-white/5')}`} />
              ))}
            </div>
          </div>

          <AnimatePresence>
            {generalError && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Xatolik yuz berdi</p>
                  <p className="text-sm font-medium text-white/80">{generalError}</p>
                </div>
                <button onClick={() => setGeneralError(null)} className="p-1 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="glass-card p-6 md:p-10 border-white/5 shadow-2xl overflow-visible">
            <AnimatePresence mode="wait">
              {/* Step 0: Role Selection */}
              {step === 0 && (
                <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <h3 className="text-xl font-bold text-white/90">O'zingizga mos rolni tanlang</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      onClick={() => setIsExpert(false)}
                      className={`p-8 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col ${!isExpert ? 'border-primary bg-primary/10 shadow-glow-primary' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${!isExpert ? 'bg-primary text-white' : 'bg-white/5 text-foreground/40'}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-white">Mijoz</h4>
                      <p className="text-sm text-foreground/40 mt-3 font-medium leading-relaxed">Mutaxassislarni izlayotgan va xizmat buyurayotgan foydalanuvchi.</p>
                      { !isExpert && <CheckCircle2 className="w-5 h-5 text-primary mt-4 self-end" /> }
                    </div>
                    <div 
                      onClick={() => setIsExpert(true)}
                      className={`p-8 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col ${isExpert ? 'border-primary bg-primary/10 shadow-glow-primary' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isExpert ? 'bg-primary text-white' : 'bg-white/5 text-foreground/40'}`}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-white">Mutaxassis</h4>
                      <p className="text-sm text-foreground/40 mt-3 font-medium leading-relaxed">O'z professional xizmatlarini mijozlarga taklif qiluvchi ekspert.</p>
                      { isExpert && <CheckCircle2 className="w-5 h-5 text-primary mt-4 self-end" /> }
                    </div>
                  </div>
                  <button onClick={nextStep} className="glow-button w-full py-5 text-lg">
                    Davom etish <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Account Info */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Familiya</label>
                       <input type="text" placeholder="Masalan: Aliyev" className="premium-input w-full" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Ism</label>
                       <input type="text" placeholder="Masalan: Aziz" className="premium-input w-full" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Telefon raqami</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-4 h-4 transition-colors" />
                      <input type="tel" placeholder="+998 90 123 45 67" className="premium-input w-full pl-12" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Email manzil</label>
                    <div className="relative group">
                      <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${emailStatus === 'taken' ? 'text-rose-500' : 'text-foreground/20 group-focus-within:text-primary'}`} />
                      <input 
                        type="email" 
                        placeholder="example@joida.uz" 
                        className={`premium-input w-full pl-12 ${emailStatus === 'taken' ? 'border-rose-500/50 bg-rose-500/5 focus:border-rose-500' : ''}`} 
                        value={formData.email} 
                        onChange={e => { setFormData({...formData, email: e.target.value}); setGeneralError(null); }} 
                      />
                      {emailStatus === 'checking' && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                      )}
                      {emailStatus === 'available' && formData.email && (
                        <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                      {emailStatus === 'taken' && (
                        <X className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                      )}
                    </div>
                    <AnimatePresence>
                      {emailStatus === 'taken' && (
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[10px] font-bold text-rose-500 ml-2 mt-1 uppercase tracking-wider">
                          Bu email manzili allaqachon band
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Maxfiy so'z</label>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary w-4 h-4 transition-colors" />
                      <input type="password" placeholder="********" className="premium-input w-full pl-12" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                   <div className="flex gap-4 pt-6">
                    <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Ortga</button>
                    <button onClick={nextStep} disabled={emailStatus === 'taken' || emailStatus === 'checking'} className="flex-[2] glow-button disabled:opacity-50 disabled:cursor-not-allowed">Keyingisi <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Branding */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Siz haqingizda qisqacha (Headline)</label>
                    <input type="text" placeholder="Masalan: Professional Interyer Dizayner" className="premium-input w-full" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Tug'ilgan sana</label>
                      <div className="flex gap-2">
                        <select className="premium-input flex-1 py-3 text-xs appearance-none" value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: e.target.value})}>
                           {Array.from({length: 60}, (_, i) => 2010 - i).map(y => <option key={y} value={y.toString()} className="bg-background">{y}</option>)}
                        </select>
                        <select className="premium-input flex-1 py-3 text-xs appearance-none" value={formData.birthMonth} onChange={e => setFormData({...formData, birthMonth: e.target.value})}>
                           {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(m => <option key={m} value={m} className="bg-background">{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Jinsi</label>
                      <select className="premium-input w-full py-3 text-xs appearance-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="Erkak" className="bg-background">Erkak</option>
                        <option value="Ayol" className="bg-background">Ayol</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Bio / O'zingiz haqingizda to'liqroq</label>
                    <textarea rows={4} placeholder="O'z tajribangiz va maqsadlaringiz haqida yozing..." className="premium-input w-full resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Ortga</button>
                    <button onClick={nextStep} className="flex-[2] glow-button">Keyingisi <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: History */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[13px] font-black text-white/80 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Ta'lim ma'lumotlari</h4>
                      <button onClick={() => setFormData({...formData, educationInfo: [...formData.educationInfo, {type: 'Bakalavr', institution: '', specialization: '', year: 2020}]})} className="text-[10px] text-primary font-black uppercase hover:underline">+ Qo'shish</button>
                    </div>
                    <div className="space-y-3">
                      {formData.educationInfo.map((edu, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative group">
                          <div className="grid grid-cols-2 gap-3">
                            <select className="premium-input py-2 text-xs" value={edu.type} onChange={e => { const n = [...formData.educationInfo]; n[idx].type = e.target.value; setFormData({...formData, educationInfo: n}); }}>
                              <option value="Bakalavr">Bakalavr</option>
                              <option value="Magistr">Magistr</option>
                              <option value="Kolledj">Kolledj</option>
                              <option value="Litsey">Litsey</option>
                            </select>
                            <input type="number" placeholder="Bitirgan yili" className="premium-input py-2 text-xs" value={edu.year} onChange={e => { const n = [...formData.educationInfo]; n[idx].year = parseInt(e.target.value); setFormData({...formData, educationInfo: n}); }} />
                          </div>
                          <input type="text" placeholder="Muassasa nomi" className="premium-input py-2 text-xs w-full" value={edu.institution} onChange={e => { const n = [...formData.educationInfo]; n[idx].institution = e.target.value; setFormData({...formData, educationInfo: n}); }} />
                          <button onClick={() => setFormData({...formData, educationInfo: formData.educationInfo.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 p-1 text-foreground/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[13px] font-black text-white/80 flex items-center gap-2"><Briefcase className="w-4 h-4 text-secondary" /> Ish tajribasi</h4>
                      <button onClick={() => setFormData({...formData, experienceInfo: [...formData.experienceInfo, {workplace: '', position: '', duration: '', description: ''}]})} className="text-[10px] text-primary font-black uppercase hover:underline">+ Qo'shish</button>
                    </div>
                    <div className="space-y-3">
                      {formData.experienceInfo.map((exp, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 relative group">
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Ish joyi" className="premium-input py-2 text-xs" value={exp.workplace} onChange={e => { const n = [...formData.experienceInfo]; n[idx].workplace = e.target.value; setFormData({...formData, experienceInfo: n}); }} />
                            <input type="text" placeholder="Davomiyligi" className="premium-input py-2 text-xs" value={exp.duration} onChange={e => { const n = [...formData.experienceInfo]; n[idx].duration = e.target.value; setFormData({...formData, experienceInfo: n}); }} />
                          </div>
                          <input type="text" placeholder="Lavozimingiz" className="premium-input py-2 text-xs w-full" value={exp.position} onChange={e => { const n = [...formData.experienceInfo]; n[idx].position = e.target.value; setFormData({...formData, experienceInfo: n}); }} />
                          <button onClick={() => setFormData({...formData, experienceInfo: formData.experienceInfo.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 p-1 text-foreground/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Ortga</button>
                    <button onClick={nextStep} className="flex-[2] glow-button">Keyingisi <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Expertise */}
              {step === 4 && (
                <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                   <div className="space-y-4">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Award className="w-3 h-3" /> Asosiy yo'nalishlar</label>
                    <div className="flex flex-wrap gap-2">
                       {services.map(s => (
                         <button 
                           key={s.id} 
                           type="button"
                           onClick={() => { const ids = formData.serviceIds.includes(s.id) ? formData.serviceIds.filter(i => i !== s.id) : [...formData.serviceIds, s.id]; setFormData({...formData, serviceIds: ids}); }}
                           className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.serviceIds.includes(s.id) ? 'bg-primary text-white shadow-glow-primary' : 'bg-white/5 border border-white/10 text-foreground/40 hover:border-primary/50'}`}
                         >{s.name}</button>
                       ))}
                    </div>
                   </div>

                   <div className="space-y-4">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Tag className="w-3 h-3" /> Ko'nikmalar (Skills)</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Masalan: Figma, Python, Revit..." className="premium-input flex-1 py-3 text-xs" value={tempSkill} onChange={e => setTempSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                      <button type="button" onClick={addSkill} className="px-5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-black">+</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <div key={skill} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs flex items-center gap-2">
                          {skill} <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3 text-foreground/30" /></button>
                        </div>
                      ))}
                    </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Languages className="w-3 h-3" /> Tillar</label>
                        <select className="premium-input w-full py-3 text-xs appearance-none" onChange={e => { if(e.target.value) setFormData({...formData, languages: [...formData.languages, {language: e.target.value, level: 'Middle'}]}); }}>
                           <option value="">Til qo'shish...</option>
                           <option value="Ingliz">Ingliz tili</option>
                           <option value="Rus">Rus tili</option>
                           <option value="Turk">Turk tili</option>
                        </select>
                        <div className="space-y-2">
                           {formData.languages.map((l, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs border border-white/5">
                                <span>{l.language}</span>
                                <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-full text-[9px] uppercase">{l.level}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Globe className="w-3 h-3" /> Ijtimoiy tarmoqlar</label>
                        <input type="text" placeholder="LinkedIn URL" className="premium-input w-full py-3 text-xs" onBlur={e => { if(e.target.value) setFormData({...formData, socialLinks: [...formData.socialLinks.filter(l => l.platform !== 'LinkedIn'), {platform: 'LinkedIn', url: e.target.value}]}) }} />
                        <input type="text" placeholder="Telegram @username" className="premium-input w-full py-3 text-xs" onBlur={e => { if(e.target.value) setFormData({...formData, socialLinks: [...formData.socialLinks.filter(l => l.platform !== 'Telegram'), {platform: 'Telegram', url: e.target.value}]}) }} />
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                    <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Ortga</button>
                    <button onClick={nextStep} className="flex-[2] glow-button">Keyingisi <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Final Assets */}
              {step === 5 && (
                <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] pl-1">Profil rasmi</label>
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/5 rounded-[40px] cursor-pointer hover:border-primary/50 hover:bg-white/[0.03] transition-all group overflow-hidden">
                          {formData.profilePictureUrl ? (
                            <img src={`https://backend.joida.uz${formData.profilePictureUrl}`} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <>
                              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                <Camera className="w-7 h-7 text-foreground/20 group-hover:text-primary transition-colors" />
                              </div>
                              <span className="text-[10px] text-foreground/20 font-black uppercase tracking-wider group-hover:text-white transition-colors">Rasm yuklash</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'profilePictureUrl')} />
                        </label>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] pl-1">Diplom / Sertifikat</label>
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/5 rounded-[40px] cursor-pointer hover:border-primary/50 hover:bg-white/[0.03] transition-all group overflow-hidden">
                          {formData.diplomaUrl ? (
                            <div className="flex flex-col items-center text-primary">
                              <CheckCircle2 className="w-12 h-12 mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Yuklandi</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                <FileText className="w-7 h-7 text-foreground/20 group-hover:text-primary transition-colors" />
                              </div>
                              <span className="text-[10px] text-foreground/20 font-black uppercase tracking-wider group-hover:text-white transition-colors">Fayl tanlash (PDF/JPG)</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, 'diplomaUrl')} />
                        </label>
                     </div>
                  </div>

                  <div className="p-8 rounded-[40px] bg-white/[0.03] border border-white/10 flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <MapPin className="text-primary w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-black text-white text-base">Hozirgi joylashuvingiz</h5>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
                          {formData.locationName || "GPS sinxronizatsiyasi kutilmoqda"}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setFormData({...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude, locationName: 'Sputnik orqali aniqlandi'});
                        });
                      }}
                      className="px-6 py-4 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >Sinxronlash</button>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button onClick={prevStep} className="flex-1 py-4 border border-white/10 rounded-2xl hover:bg-white/5 text-foreground/40 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Ortga</button>
                    <button onClick={handleRegister} disabled={isLoading || (isExpert && !formData.profilePictureUrl)} className="flex-[2] glow-button">
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : "Ro'yxatdan o'tishni yakunlash"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="text-center">
            <button onClick={onBackToLogin} className="text-foreground/30 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto">
              <LogIn className="w-4 h-4" /> Allaqachon akavuntingiz bormi? Kirish
            </button>
          </div>
        </div>

        {/* RIGHT: PREVIEW SIDE */}
        <div className="hidden lg:flex w-96 flex-col gap-6 pt-24">
          <div className="sticky top-24 space-y-6">
             <div className="glass-card p-2 border-white/10 shadow-glow-primary overflow-visible">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 group">
                   {formData.profilePictureUrl ? (
                     <img src={`https://backend.joida.uz${formData.profilePictureUrl}`} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center"><User className="w-20 h-20 text-white/5" /></div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest"><Sparkles className="w-3 h-3" /> {isExpert ? "Top Mutaxassis" : "Yangi Mijoz"}</div>
                      <h3 className="text-2xl font-black text-white leading-tight">{formData.firstName || "Ismingiz"} {formData.lastName || "Familiyangiz"}</h3>
                      <p className="text-white/60 text-xs font-medium">{formData.headline || "Kasbingiz yoki yo'nalishingiz"}</p>
                   </div>
                </div>
             </div>

             <div className="glass-card p-6 border-white/5 space-y-5">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Ko'nikmalar</h4>
                   <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <div className="w-1 h-1 rounded-full bg-primary/40" />
                   </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.slice(0, 5).map(s => <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold text-white/70">{s}</span>)}
                  {formData.skills.length === 0 && <span className="text-[10px] text-foreground/20 italic">Hali qo'shilmadi...</span>}
                </div>
                
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Languages className="w-5 h-5 text-primary" /></div>
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Tillar</p>
                        <p className="text-[11px] font-bold text-white/80">{formData.languages.map(l => l.language).join(', ')}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-secondary" /></div>
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Tajriba</p>
                        <p className="text-[11px] font-bold text-white/80">{formData.experienceInfo.length} ta ish joyi</p>
                     </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
