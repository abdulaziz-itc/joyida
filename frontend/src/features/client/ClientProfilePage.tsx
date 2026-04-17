import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Moon, Sun, Globe, Bell, Shield, LogOut, 
  Lock, Edit3, Camera, Plus, Trash2, GraduationCap, Briefcase, 
  Calendar, Check, AlertCircle, Loader2, Phone, Tag, Globe2, Award, X
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
    expert: "Mutaxassis",
    client: "Mijoz",
    headline: "Headline (Qisqacha sarlavha)",
    bio: "Bio (O'zingiz haqingizda)",
    phone: "Telefon raqami",
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

  return (
    <div className="w-full h-screen overflow-y-auto bg-background p-4 md:p-8 scroll-smooth hide-scrollbar transition-colors duration-500 font-main">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
        
        {/* LEFT ASPECT: Brand & Info */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-8 border-white/5 shadow-2xl relative overflow-hidden group">
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
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 border-4 border-background"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-black text-white leading-tight">{user?.full_name || 'Foydalanuvchi'}</h2>
              <p className="text-foreground/40 font-medium text-xs tracking-wider">{user?.email}</p>
              <div className="pt-4">
                <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl border border-primary/20 shadow-glow-primary">
                  {user?.is_expert ? "Mutaxassis" : "Mijoz"}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Globe className="w-4 h-4" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t.language}</span>
                </div>
                <span className="text-xs font-black text-white">O'zbek</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{t.appearance}</span>
                </div>
                <button onClick={toggleTheme} className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                  <motion.div animate={{ x: theme === 'dark' ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-lg" />
                </button>
              </div>

              <button onClick={logout} className="w-full mt-4 flex items-center justify-center gap-3 p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/10 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT ASPECT: Settings Forms */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-black text-white font-display tracking-tight leading-none">{t.title}</h1>
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`glow-button group !px-10 !py-4 ${saveStatus === 'success' ? '!bg-emerald-500 shadow-emerald-500/20' : ''}`}
            >
              {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : saveStatus === 'success' ? <Check className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              {saveStatus === 'saving' ? t.saving : saveStatus === 'success' ? t.saved : t.save}
            </button>
          </div>

          <div className="space-y-6">
            
            {/* 1. PERSONAL & BIO */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-glow-primary"><Edit3 className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-white">{t.personal}</h3>
                  <p className="text-sm text-foreground/40 font-medium">{t.personalDesc}</p>
                </div>
              </div>

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
            </div>

            {/* 2. EXPERTISE & SKILLS */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-glow-amber"><Award className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-white">{t.expertise}</h3>
                  <p className="text-sm text-foreground/40 font-medium">{t.expertiseDesc}</p>
                </div>
              </div>

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
            </div>

            {/* 3. EDUCATION */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-glow-blue"><GraduationCap className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.education}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.eduDesc}</p>
                  </div>
                </div>
                <button onClick={addEdu} className="p-3 bg-white/5 hover:bg-primary/20 text-primary border border-white/10 rounded-2xl transition-all shadow-lg"><Plus className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                {localUser.educationInfo.map((edu: any, idx: number) => (
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
                ))}
              </div>
            </div>

            {/* 4. EXPERIENCE */}
            <div className="glass-card p-6 md:p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-glow-rose"><Briefcase className="w-6 h-6" /></div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.experience}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.expDesc}</p>
                  </div>
                </div>
                <button onClick={addExp} className="p-3 bg-white/5 hover:bg-rose-500/20 text-rose-500 border border-white/10 rounded-2xl transition-all shadow-lg"><Plus className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4">
                {localUser.experienceInfo.map((exp: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 relative group hover:border-rose-500/30 transition-all">
                    <button onClick={() => { const nl = [...localUser.experienceInfo]; nl.splice(idx, 1); setLocalUser({...localUser, experienceInfo: nl}); }} className="absolute top-4 right-4 p-2 text-foreground/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder={t.workplace} className="premium-input !py-3 !text-sm" value={exp.workplace} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].workplace = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                      <input type="text" placeholder={t.position} className="premium-input !py-3 !text-sm" value={exp.position} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].position = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                      <input type="text" placeholder={t.duration} className="premium-input !py-3 !text-sm md:col-span-2" value={exp.duration} onChange={e => { const nl = [...localUser.experienceInfo]; nl[idx].duration = e.target.value; setLocalUser({...localUser, experienceInfo: nl}); }} />
                    </div>
                  </div>
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
