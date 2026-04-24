import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, Moon, Sun, Globe, LogOut, 
  Edit3, Camera, Plus, Trash2, GraduationCap, Briefcase, 
  Calendar, Check, Loader2, Phone, Tag, Globe2, Award, X, Star, ChevronDown, Sparkles,
  MapPin, Mail, ShieldCheck, ExternalLink, Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/apiClient';

const ClientProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, setAuth, token } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('user-theme') || 'dark');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('user-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangDropdown(false);
  };

  const currentLangLabel = () => {
    switch (i18n.language) {
      case 'uz': return "O'zbek";
      case 'ru': return "Русский";
      case 'en': return "English";
      default: return "O'zbek";
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

  const handleBecomeExpert = async () => {
    setSaveStatus('saving');
    try {
      const response = await apiClient.put('/auth/me', {
        is_expert: true,
        full_name: user?.full_name || user?.email.split('@')[0],
      });
      setAuth(response.data, token!);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Conversion to expert failed', error);
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
      setImgError(false);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getMediaUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = apiClient.defaults.baseURL || import.meta.env.VITE_API_URL || 'https://backend.joida.uz';
    const domain = base.split('/api/v1')[0];
    return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
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

  const DetailCard = ({ label, value, icon: Icon, className = "" }: any) => (
    <div className={`p-5 glass-card bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-sm font-bold text-foreground truncate">{value || t('profile.noData')}</div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground font-main overflow-x-hidden p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8 pb-40">
        
        {/* HERO SECTION - Redesigned for Impact */}
        <div className="relative rounded-[3rem] overflow-hidden bg-glass-bg border border-white/5 p-8 md:p-12 shadow-premium">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row items-center lg:items-end gap-10">
            {/* Avatar with dynamic glow */}
            <div className="relative shrink-0">
               <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] p-1 bg-gradient-to-br from-primary via-secondary to-accent shadow-glow-primary overflow-hidden group">
                  <div className="w-full h-full bg-background rounded-[2.3rem] overflow-hidden relative">
                     {user?.profile_picture_url && !imgError ? (
                        <img src={getMediaUrl(user.profile_picture_url)!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Avatar" onError={() => setImgError(true)} />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/[0.02]"><UserIcon className="w-16 h-16 text-foreground/10" /></div>
                     )}
                     {isUploading && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>}
                  </div>
               </div>
               <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-10 border-4 border-background group/cam">
                  <Camera className="w-6 h-6 group-hover/cam:rotate-12 transition-transform" />
               </button>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            {/* Profile Info & Actions */}
            <div className="flex-1 text-center lg:text-left space-y-6">
               <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                     <h1 className="text-4xl md:text-6xl font-black tracking-tight font-display leading-[0.9]">{user?.full_name || user?.email.split('@')[0]}</h1>
                     {user?.is_expert && <div className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Award className="w-3 h-3" /> Expert</div>}
                  </div>
                  <p className="text-foreground/40 font-bold text-sm tracking-wide flex items-center justify-center lg:justify-start gap-4">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
                    {user?.phone_number && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {user?.phone_number}</span>}
                  </p>
               </div>

               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  {isEditing ? (
                    <>
                      <button onClick={handleSave} disabled={saveStatus === 'saving'} className="glow-button !px-10 !py-4 min-w-[160px]">
                        {saveStatus === 'saving' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        {saveStatus === 'saving' ? t('profile.saving') : t('profile.save')}
                      </button>
                      <button onClick={handleCancel} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-foreground">
                        {t('profile.cancel')}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="glow-button !px-10 !py-4 min-w-[160px] whitespace-nowrap overflow-hidden">
                      <Edit3 className="w-5 h-5 shrink-0" /> <span className="truncate">{t('profile.edit')}</span>
                    </button>
                  )}
                  
                  {!user?.is_expert && (
                    <button onClick={handleBecomeExpert} className="px-8 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2">
                       <Sparkles className="w-4 h-4" /> {t('profile.becomeExpert')}
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* BENTO GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Column 1: Stats & Meta */}
           <div className="space-y-8">
              {/* Profile Meta Bento */}
              <div className="glass-card p-8 border-white/5 space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.personalInfo', 'Statistika')}</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">{t('profile.currentRating')}</div>
                       <div className="text-xl font-black text-amber-500 flex items-center gap-1"><Star className="w-4 h-4 fill-current" /> {user?.rating || '0.0'}</div>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <div className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">{t('profile.totalReviews')}</div>
                       <div className="text-xl font-black text-foreground">{user?.review_count || '0'}</div>
                    </div>
                 </div>

                 {/* Language & Theme in one card */}
                 <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="relative" ref={langDropdownRef}>
                       <button onClick={() => setShowLangDropdown(!showLangDropdown)} className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-primary" /><span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('profile.language')}</span></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{currentLangLabel()}</span>
                       </button>
                       <AnimatePresence>
                          {showLangDropdown && (
                             <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute bottom-full left-0 w-full mb-2 bg-background/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                                {[{c:'uz',l:'Uzbek'},{c:'ru',l:'Russian'},{c:'en',l:'English'}].map(lng=>(
                                   <button key={lng.c} onClick={()=>handleLanguageChange(lng.c)} className={`w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all ${i18n.language===lng.c?'text-primary bg-primary/5':'text-foreground/40'}`}>{lng.l}</button>
                                ))}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                    <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-3">{theme==='dark'?<Moon className="w-4 h-4 text-amber-500"/>:<Sun className="w-4 h-4 text-amber-500"/>}<span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('profile.appearance')}</span></div>
                       <div className={`w-10 h-5 rounded-full relative p-1 transition-colors ${theme==='dark'?'bg-primary':'bg-foreground/10'}`}><div className={`w-3 h-3 bg-white rounded-full transition-all ${theme==='dark'?'translate-x-5':'translate-x-0'}`}/></div>
                    </button>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all mt-4"><LogOut className="w-4 h-4"/> {t('profile.logout')}</button>
                 </div>
              </div>

              {/* Skills Card */}
              <div className="glass-card p-8 border-white/5 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.skills')}</h3>
                    {isEditing && <Zap className="w-4 h-4 text-primary animate-pulse" />}
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {(isEditing ? localUser.skills : user?.skills)?.map((s:string)=>(
                       <span key={s} className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                          {s} {isEditing && <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={()=>removeSkill(s)}/>}
                       </span>
                    ))}
                    {isEditing && (
                       <div className="w-full mt-4 flex gap-2">
                          <input type="text" value={tempSkill} onChange={e=>setTempSkill(e.target.value)} onKeyDown={e=>e.key==='Enter' && addSkill()} className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary/50" placeholder="Add skill..." />
                          <button onClick={addSkill} className="p-2 bg-primary text-white rounded-xl"><Plus className="w-4 h-4"/></button>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Column 2 & 3: Main Profile Details */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* Bio & Headline Bento */}
              <div className="glass-card p-10 border-white/5 space-y-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                 <div className="relative space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">{t('profile.headline', 'Professional Headline')}</label>
                       {isEditing ? (
                          <input type="text" value={localUser.headline} onChange={e=>setLocalUser({...localUser, headline:e.target.value})} className="w-full bg-white/[0.02] border-b border-white/10 text-xl font-bold p-2 outline-none focus:border-primary transition-all" />
                       ) : (
                          <div className="text-2xl font-black text-foreground/80 tracking-tight">{user?.headline || t('profile.noData')}</div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">{t('profile.bio', 'Haqimda')}</label>
                       {isEditing ? (
                          <textarea rows={5} value={localUser.bio} onChange={e=>setLocalUser({...localUser, bio:e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm font-medium outline-none focus:border-primary transition-all resize-none" />
                       ) : (
                          <p className="text-lg font-medium text-foreground/50 leading-relaxed italic border-l-4 border-primary/20 pl-8">{user?.bio || t('profile.noData')}</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* Personal Details Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="glass-card p-8 border-white/5 space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.personalInfo')}</h3>
                    <div className="space-y-6">
                       {isEditing ? (
                          <div className="space-y-4">
                             <input type="text" placeholder="Last Name" value={localUser.lastName} onChange={e=>setLocalUser({...localUser, lastName:e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm font-bold" />
                             <input type="text" placeholder="First Name" value={localUser.firstName} onChange={e=>setLocalUser({...localUser, firstName:e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm font-bold" />
                             <input type="date" value={localUser.birthDate} onChange={e=>setLocalUser({...localUser, birthDate:e.target.value})} className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-sm font-bold" />
                          </div>
                       ) : (
                          <div className="space-y-6">
                             <DetailCard label={t('profile.lastName')} value={user?.last_name} icon={UserIcon} />
                             <DetailCard label={t('profile.firstName')} value={user?.first_name} icon={UserIcon} />
                             <DetailCard label={t('profile.birthDate')} value={user?.birth_date} icon={Calendar} />
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="glass-card p-8 border-white/5 space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.location', 'Aloqa va Ijtimoiy')}</h3>
                    <div className="space-y-6">
                        <DetailCard label={t('profile.phone')} value={user?.phone_number} icon={Phone} />
                        <div className="p-5 glass-card bg-white/[0.02] border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Globe2 className="w-4 h-4"/></div>
                              <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{t('profile.socials')}</span>
                           </div>
                           <div className="flex gap-2">
                              {user?.social_links?.map((s:any, i:number)=>(
                                 <a key={i} href={s.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 transition-all"><ExternalLink className="w-3 h-3"/></a>
                              ))}
                              {isEditing && <button className="w-8 h-8 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-foreground/20">+</button>}
                           </div>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Education & Experience Section */}
              {user?.is_expert && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 border-white/5 space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.education')}</h3>
                          {isEditing && <Plus className="w-4 h-4 text-primary cursor-pointer" />}
                       </div>
                       <div className="space-y-6">
                          {(isEditing ? localUser.educationInfo : user?.education_info)?.map((edu:any, i:number)=>(
                             <div key={i} className="relative pl-6 border-l-2 border-primary/20">
                                <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-primary" />
                                <div className="text-sm font-black text-foreground">{edu.institution}</div>
                                <div className="text-[10px] font-bold text-foreground/40 uppercase mt-1">{edu.specialization} • {edu.year}</div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="glass-card p-8 border-white/5 space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">{t('profile.experience')}</h3>
                          {isEditing && <Plus className="w-4 h-4 text-primary cursor-pointer" />}
                       </div>
                       <div className="space-y-6">
                          {(isEditing ? localUser.experienceInfo : user?.experience_info)?.map((exp:any, i:number)=>(
                             <div key={i} className="relative pl-6 border-l-2 border-secondary/20">
                                <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-secondary" />
                                <div className="text-sm font-black text-foreground">{exp.position}</div>
                                <div className="text-[10px] font-bold text-foreground/40 uppercase mt-1">{exp.workplace} • {exp.duration}</div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
