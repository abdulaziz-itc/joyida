import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Moon, Sun, Globe, Bell, Shield, LogOut, 
  Lock, Edit3, Camera, Plus, Trash2, GraduationCap, Briefcase, 
  Calendar, Check, AlertCircle, Loader2, Phone, Tag, Globe2, Award, X, CheckCircle2, Star
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';

const translations = {
  uz: {
    title: "Professional Profil",
    subtitle: "Ma'lumotlaringizni boshqaring va professional profilingizni boyiting.",
    appearance: "Tashqi ko'rinish",
    themeDesc: "Tungi yoki kunduzgi rejimni tanlang",
    language: "Til (Language)",
    langDesc: "Platforma uchun asosiy tilini tanlang",
    logout: "Tizimdan chiqish",
    logoutDesc: "Joriy sessiyani tugatish",
    personal: "Shaxsiy ma'lumotlar",
    personalDesc: "Ism, Familiya va Tug'ilgan sanani tahrirlash",
    education: "Ta'lim",
    eduDesc: "O'qigan joylaringiz va mutaxassisligingiz",
    experience: "Ish tajribasi",
    expDesc: "Faoliyat yuritgan joylaringiz va lavozimlaringiz",
    expertise: "Mutaxassislik va Ko'nikmalar",
    expertiseDesc: "Sizning mahoratingiz va ijtimoiy bog'lanishlaringiz",
    save: "Saqlash",
    saving: "Saqlanmoqda...",
    saved: "Muvaffaqiyatli saqlandi",
    lastName: "Familiya",
    firstName: "Ism",
    patronymic: "Otasining ismi",
    birthDate: "Tug'ilgan sana",
    add: "Qo'shish",
    institution: "Muassasa nomi",
    specialization: "Mutaxassislik",
    workplace: "Ish joyi",
    position: "Lavozim",
    duration: "Davomiyligi",
    edit: "Profilni tahrirlash",
    cancel: "Bekor qilish",
    personalInfo: "Shaxsiy ma'lumotlar",
    proInfo: "Kasbiy ma'lumotlar",
    location: "Manzil va Joylashuv",
    noData: "Ma'lumot mavjud emas",
    currentRating: "Reyting",
    totalReviews: "Sharhlar",
    expertSince: "Mutaxassislik boshlangan",
    expert: "Mutaxassis",
    client: "Mijoz",
    phone: "Telefon raqami",
    headline: "Headline (Qisqacha sarlavha)",
    bio: "Bio (O'zingiz haqingizda)",
    skills: "Ko'nikmalar",
    languages: "Tillar",
    socials: "Ijtimoiy tarmoqlar"
  }
};

const ClientProfilePage = () => {
  const { user, logout, setAuth, token } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('user-theme') || 'dark');
  const [language, setLanguage] = useState<'uz'>('uz');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localUser, setLocalUser] = useState<any>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    patronymic: user?.patronymic || '',
    birthDate: user?.birth_date || '',
    phone: user?.phone_number || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    languages: user?.languages || [],
    socialLinks: user?.social_links || [],
    educationInfo: user?.education_info || [],
    experienceInfo: user?.experience_info || [],
  });

  const [tempSkill, setTempSkill] = useState('');

  const t = translations[language];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('user-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleEditToggle = () => {
    if (isEditing) {
      // If cancelling, reset to original data
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setLocalUser({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      patronymic: user?.patronymic || '',
      birthDate: user?.birth_date || '',
      phone: user?.phone_number || '',
      headline: user?.headline || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      languages: user?.languages || [],
      socialLinks: user?.social_links || [],
      educationInfo: user?.education_info || [],
      experienceInfo: user?.experience_info || [],
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const response = await apiClient.put('/auth/me', {
        first_name: localUser.firstName,
        last_name: localUser.lastName,
        patronymic: localUser.patronymic,
        birth_date: localUser.birthDate || null,
        phone_number: localUser.phone,
        headline: localUser.headline,
        bio: localUser.bio,
        skills: localUser.skills,
        languages: localUser.languages,
        social_links: localUser.socialLinks,
        education_info: localUser.educationInfo,
        experience_info: localUser.experienceInfo,
        full_name: `${localUser.lastName} ${localUser.firstName} ${localUser.patronymic}`.trim()
      });
      setAuth(response.data, token!);
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Update failed', error);
      setSaveStatus('error');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setIsUploading(true);
      const uploadRes = await apiClient.post('/utils/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const photoUrl = uploadRes.data.url;
      
      const updateRes = await apiClient.put('/auth/me', { profile_picture_url: photoUrl });
      setAuth(updateRes.data, token!);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addSkill = () => {
    if (tempSkill && !localUser.skills.includes(tempSkill)) {
      setLocalUser({ ...localUser, skills: [...localUser.skills, tempSkill] });
      setTempSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setLocalUser({ ...localUser, skills: localUser.skills.filter((s: string) => s !== skill) });
  };

  const addEdu = () => {
    setLocalUser({
      ...localUser, 
      educationInfo: [...localUser.educationInfo, { type: 'Bakalavr', institution: '', specialization: '', year: new Date().getFullYear() }]
    });
  };

  const addExp = () => {
    setLocalUser({
      ...localUser,
      experienceInfo: [...localUser.experienceInfo, { workplace: '', position: '', duration: '', description: '' }]
    });
  };

  const DetailItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-primary/40 shrink-0" />}
        <span className="text-sm font-bold text-foreground">{value || t.noData}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen overflow-y-auto bg-background p-4 md:p-8 scroll-smooth hide-scrollbar transition-colors duration-500 font-main">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
        
        {/* LEFT ASPECT: Identity Card */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-8 border-white/5 shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-primary to-secondary animate-pulse">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden relative border-4 border-background">
                  {user?.profile_picture_url ? (
                    <img src={`https://backend.joida.uz${user.profile_picture_url}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-foreground/10" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {isEditing && (
                  <motion.button 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 border-4 border-background"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-black text-foreground leading-tight">{user?.full_name || 'Foydalanuvchi'}</h2>
              <p className="text-foreground/40 font-medium text-xs tracking-wider">{user?.email}</p>
              <div className="pt-4">
                <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl border border-primary/20 shadow-glow-primary">
                  {user?.is_expert ? t.expert : t.client}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-glass-border">
              {user?.is_expert && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                   <div className="p-3 bg-white/[0.02] border border-glass-border rounded-xl text-center">
                      <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">{t.currentRating}</div>
                      <div className="flex items-center justify-center gap-1 text-sm font-black text-amber-500">
                         <Star className="w-3 h-3 fill-current" /> {user.rating}
                      </div>
                   </div>
                   <div className="p-3 bg-white/[0.02] border border-glass-border rounded-xl text-center">
                      <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">{t.totalReviews}</div>
                      <div className="text-sm font-black text-foreground">{user.review_count}</div>
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Globe className="w-4 h-4" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t.language}</span>
                </div>
                <span className="text-xs font-black text-foreground">O'zbek</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t.appearance}</span>
                </div>
                <button onClick={toggleTheme} className="w-12 h-6 bg-foreground/10 rounded-full relative p-1 transition-colors">
                  <motion.div animate={{ x: theme === 'dark' ? 24 : 0 }} className="w-4 h-4 bg-background rounded-full shadow-lg" />
                </button>
              </div>

              <button onClick={logout} className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/10 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT ASPECT: Information Display & Edit Forms */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-black text-foreground font-display tracking-tight leading-none">{t.title}</h1>
              <p className="text-sm text-foreground/40 font-medium">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="p-4 bg-glass-bg border border-glass-border text-foreground hover:bg-white/5 rounded-2xl transition-all shadow-lg flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                    <X className="w-4 h-4" /> {t.cancel}
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className={`glow-button !px-8 !py-4 ${saveStatus === 'success' ? '!bg-emerald-500 shadow-emerald-500/20' : ''}`}
                  >
                    {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {saveStatus === 'saving' ? t.saving : t.save}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="glow-button !px-8 !py-4">
                  <Edit3 className="w-5 h-5" /> {t.edit}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* 1. PERSONAL INFORMATION */}
            <div className="glass-card p-6 md:p-8 border-glass-border shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-glow-primary"><UserIcon className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{t.personal}</h3>
                  <p className="text-sm text-foreground/40 font-medium">{t.personalDesc}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.lastName}</label>
                    <input type="text" value={localUser.lastName} onChange={e => setLocalUser({...localUser, lastName: e.target.value})} className="premium-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.firstName}</label>
                    <input type="text" value={localUser.firstName} onChange={e => setLocalUser({...localUser, firstName: e.target.value})} className="premium-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.phone}</label>
                    <input type="tel" value={localUser.phone} onChange={e => setLocalUser({...localUser, phone: e.target.value})} className="premium-input w-full" placeholder="+998 90..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.birthDate}</label>
                    <input type="date" value={localUser.birthDate} onChange={e => setLocalUser({...localUser, birthDate: e.target.value})} className="premium-input w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.headline}</label>
                    <input type="text" value={localUser.headline} onChange={e => setLocalUser({...localUser, headline: e.target.value})} className="premium-input w-full" placeholder="Masalan: Senior Software Engineer" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.bio}</label>
                    <textarea rows={4} value={localUser.bio} onChange={e => setLocalUser({...localUser, bio: e.target.value})} className="premium-input w-full resize-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <DetailItem label={t.lastName} value={user?.last_name} />
                     <DetailItem label={t.firstName} value={user?.first_name} />
                     <DetailItem label={t.phone} value={user?.phone_number} icon={Phone} />
                     <DetailItem label={t.birthDate} value={user?.birth_date} icon={Calendar} />
                  </div>
                  <div className="pt-6 border-t border-glass-border">
                    <DetailItem label={t.headline} value={user?.headline} icon={Tag} />
                    <div className="mt-6 flex flex-col gap-2">
                       <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{t.bio}</span>
                       <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                         {user?.bio || t.noData}
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. EXPERTISE & SKILLS */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-glow-amber"><Award className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-foreground">{t.expertise}</h3>
                  <p className="text-sm text-foreground/40 font-medium">{t.expertiseDesc}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.skills}</label>
                    <div className="flex gap-2">
                      <input type="text" value={tempSkill} onChange={e => setTempSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="premium-input flex-1 !py-3" placeholder="Ko'nikma qo'shish..." />
                      <button onClick={addSkill} className="px-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-2xl font-black text-xs">+</button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {localUser.skills.map((s: string) => (
                        <span key={s} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs flex items-center gap-2 group">
                          {s} <X className="w-3 h-3 text-foreground/20 hover:text-rose-500 cursor-pointer" onClick={() => removeSkill(s)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.languages}</label>
                        <div className="space-y-2">
                          {localUser.languages.map((l: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm">
                                <span className="font-bold">{l.language}</span>
                                <span className="text-primary font-black uppercase text-[10px]">{l.level}</span>
                            </div>
                          ))}
                          <button className="w-full py-2 border border-dashed border-white/10 hover:border-primary/50 text-foreground/20 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">+ Qo'shish</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.socials}</label>
                        <div className="space-y-2">
                          {localUser.socialLinks.map((s: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-sm">
                              <Globe2 className="w-4 h-4 text-foreground/20" />
                              <span className="truncate flex-1">{s.url}</span>
                              <Trash2 className="w-3 h-3 text-foreground/20 hover:text-rose-500 cursor-pointer" />
                            </div>
                          ))}
                          <button className="w-full py-2 border border-dashed border-white/10 hover:border-primary/50 text-foreground/20 hover:text-primary transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">+ Ulash</button>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{t.skills}</span>
                      <div className="flex flex-wrap gap-2">
                         {user?.skills?.length ? user.skills.map((s: string) => (
                           <span key={s} className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                             {s}
                           </span>
                         )) : <span className="text-sm text-foreground/30 italic">{t.noData}</span>}
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-glass-border">
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{t.languages}</span>
                        <div className="flex flex-wrap gap-2">
                           {user?.languages?.length ? user.languages.map((l: any, i: number) => (
                             <div key={i} className="px-3 py-1.5 bg-glass-bg border border-glass-border rounded-lg text-xs font-bold flex items-center gap-2">
                               {l.language} <span className="w-1 h-1 rounded-full bg-primary" /> <span className="text-[9px] text-primary uppercase">{l.level}</span>
                             </div>
                           )) : <span className="text-sm text-foreground/30 italic">{t.noData}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{t.socials}</span>
                        <div className="flex gap-3">
                           {user?.social_links?.length ? user.social_links.map((s: any, i: number) => (
                             <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-glass-bg border border-glass-border flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/30 transition-all">
                               <Globe2 className="w-5 h-5" />
                             </a>
                           )) : <span className="text-sm text-foreground/30 italic">{t.noData}</span>}
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* 3. EDUCATION */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-glow-blue"><GraduationCap className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{t.education}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.eduDesc}</p>
                  </div>
                </div>
                {isEditing && <button onClick={addEdu} className="p-3 bg-white/5 hover:bg-primary/20 text-primary border border-white/10 rounded-2xl transition-all shadow-lg"><Plus className="w-5 h-5" /></button>}
              </div>

              <div className="space-y-4">
                {(isEditing ? localUser.educationInfo : user?.education_info)?.map((edu: any, idx: number) => (
                  isEditing ? (
                    <div key={idx} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 relative group hover:border-blue-500/30 transition-all">
                      <button onClick={() => { const nl = [...localUser.educationInfo]; nl.splice(idx, 1); setLocalUser({...localUser, educationInfo: nl}); }} className="absolute top-4 right-4 p-2 text-foreground/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select className="premium-input !py-3 !text-sm appearance-none" value={edu.type} onChange={e => { const nl = [...localUser.educationInfo]; nl[idx].type = e.target.value; setLocalUser({...localUser, educationInfo: nl}); }}>
                          <option value="Bakalavr">Bakalavr</option>
                          <option value="Magistr">Magistr</option>
                          <option value="Kolledj">Kolledj</option>
                          <option value="Litsey">Litsey</option>
                        </select>
                        <input type="text" placeholder={t.institution} className="premium-input !py-3 !text-sm md:col-span-2" value={edu.institution} onChange={e => { const nl = [...localUser.educationInfo]; nl[idx].institution = e.target.value; setLocalUser({...localUser, educationInfo: nl}); }} />
                        <input type="text" placeholder={t.specialization} className="premium-input !py-3 !text-sm md:col-span-2" value={edu.specialization} onChange={e => { const nl = [...localUser.educationInfo]; nl[idx].specialization = e.target.value; setLocalUser({...localUser, educationInfo: nl}); }} />
                        <input type="number" placeholder="Yil" className="premium-input !py-3 !text-sm" value={edu.year} onChange={e => { const nl = [...localUser.educationInfo]; nl[idx].year = parseInt(e.target.value); setLocalUser({...localUser, educationInfo: nl}); }} />
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex gap-4 p-6 bg-glass-bg border border-glass-border rounded-2xl group hover:border-primary/20 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-primary uppercase">{edu.type?.charAt(0)}</span>
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="font-black text-foreground">{edu.institution}</h4>
                             <span className="text-xs font-bold text-primary">{edu.year}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground/60">{edu.specialization}</p>
                          <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black text-primary uppercase tracking-tighter">{edu.type}</div>
                       </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* 4. EXPERIENCE */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-glow-rose"><Briefcase className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-foreground">{t.experience}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.expDesc}</p>
                  </div>
                </div>
                {isEditing && <button onClick={addExp} className="p-3 bg-white/5 hover:bg-rose-500/20 text-rose-500 border border-white/10 rounded-2xl transition-all shadow-lg"><Plus className="w-5 h-5" /></button>}
              </div>

              <div className="space-y-4">
                {(isEditing ? localUser.experienceInfo : user?.experience_info)?.map((exp: any, idx: number) => (
                  isEditing ? (
                    <div key={idx} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 relative group hover:border-rose-500/30 transition-all">
                      <button onClick={() => { const nl = [...localUser.experienceInfo]; nl.splice(idx, 1); setLocalUser({...localUser, experienceInfo: nl}); }} className="absolute top-4 right-4 p-2 text-foreground/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder={t.workplace} className="premium-input !py-3 !text-sm" value={exp.workplace} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].workplace = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                        <input type="text" placeholder={t.position} className="premium-input !py-3 !text-sm" value={exp.position} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].position = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                        <input type="text" placeholder={t.duration} className="premium-input !py-3 !text-sm md:col-span-2" value={exp.duration} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].duration = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex gap-4 p-6 bg-glass-bg border border-glass-border rounded-2xl group hover:border-rose-500/20 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-rose-500/5 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-rose-500/40" />
                       </div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <h4 className="font-black text-foreground">{exp.position}</h4>
                             <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">{exp.duration}</span>
                          </div>
                          <p className="text-sm font-black text-foreground/40">{exp.workplace}</p>
                       </div>
                    </div>
                  )
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientProfilePage;
