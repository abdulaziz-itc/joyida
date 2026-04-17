import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, Moon, Sun, Globe, Bell, Shield, LogOut, 
  Lock, Edit3, Camera, Plus, Trash2, GraduationCap, Briefcase, 
  Calendar, Check, AlertCircle, Loader2 
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
    client: "Mijoz"
  },
  ru: {
    title: "Профессиональный Профиль",
    subtitle: "Управляйте данными и обогащайте свой профессиональный профиль.",
    appearance: "Внешний вид",
    themeDesc: "Выберите дневной или ночной режим",
    language: "Язык (Language)",
    langDesc: "Выберите основной язык платформы",
    logout: "Выйти из системы",
    logoutDesc: "Завершить текущий сеанс",
    personal: "Личные данные",
    personalDesc: "Изменить имя, фамилию и дату рождения",
    education: "Образование",
    eduDesc: "Места обучения и ваша специализация",
    experience: "Опыт работы",
    expDesc: "Места работы и ваши должности",
    save: "Сохранить",
    saving: "Сохранение...",
    saved: "Успешно сохранено",
    lastName: "Фамилия",
    firstName: "Имя",
    patronymic: "Отчество",
    birthDate: "Дата рождения",
    add: "Добавить",
    institution: "Название учреждения",
    specialization: "Специальность",
    workplace: "Место работы",
    position: "Должность",
    duration: "Длительность",
    expert: "Специалист",
    client: "Клиент"
  }
};

const ClientProfilePage = () => {
  const { user, logout, setAuth, token } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('user-theme') || 'dark');
  const [language, setLanguage] = useState<'uz' | 'ru'>('uz');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localUser, setLocalUser] = useState<any>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    patronymic: user?.patronymic || '',
    birthDate: user?.birth_date || '',
    educationInfo: user?.education_info || [],
    experienceInfo: user?.experience_info || [],
  });

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
      const uploadRes = await apiClient.post('/utils/upload', data);
      const photoUrl = uploadRes.data.url;
      
      const updateRes = await apiClient.put('/auth/me', { profile_picture_url: photoUrl });
      setAuth(updateRes.data, token!);
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
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

  const removeEdu = (idx: number) => {
    const newList = [...localUser.educationInfo];
    newList.splice(idx, 1);
    setLocalUser({ ...localUser, educationInfo: newList });
  };

  const removeExp = (idx: number) => {
    const newList = [...localUser.experienceInfo];
    newList.splice(idx, 1);
    setLocalUser({ ...localUser, experienceInfo: newList });
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-background p-4 md:p-8 scroll-smooth hide-scrollbar transition-colors duration-500">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-20">
        
        {/* Left Aspect: Brand & Quick Settings */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-8 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-primary to-secondary animate-gradient-xy">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden relative">
                  {user?.profile_picture_url ? (
                    <img src={`https://backend.joida.uz${user.profile_picture_url}`} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-foreground/20" />
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
                className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>

            <div className="text-center space-y-1 mb-8">
              <h2 className="text-2xl font-black text-white">{user?.full_name || 'Foydalanuvchi'}</h2>
              <p className="text-foreground/40 font-medium text-sm">{user?.email}</p>
              <div className="pt-4">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                  {user?.is_expert ? t.expert : t.client}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold">{t.language}</span>
                </div>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as 'uz'|'ru')}
                  className="bg-transparent border-none text-sm font-bold text-foreground/60 focus:ring-0 cursor-pointer"
                >
                  <option value="uz">O'zbek</option>
                  <option value="ru">Русский</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-bold">{t.appearance}</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="w-12 h-6 bg-white/10 rounded-full relative p-1"
                >
                  <motion.div 
                    animate={{ x: theme === 'dark' ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg"
                  />
                </button>
              </div>

              <button 
                onClick={logout}
                className="w-full mt-4 flex items-center gap-3 p-3 bg-rose-500/5 hover:bg-rose-500/10 rounded-2xl text-rose-500 transition-all font-black text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> {t.logout}
              </button>
            </div>
          </div>
        </div>

        {/* Right Aspect: Detailed Professional Profile */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-white font-display tracking-tight">{t.title}</h1>
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`glow-button group flex items-center gap-3 !px-8 !py-3 ${saveStatus === 'success' ? '!bg-green-500 !shadow-green-500/20' : ''}`}
            >
              {saveStatus === 'saving' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saveStatus === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              )}
              {saveStatus === 'saving' ? t.saving : saveStatus === 'success' ? t.saved : t.save}
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Personal Data Card */}
            <div className="glass-card p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-glow-primary">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{t.personal}</h3>
                  <p className="text-sm text-foreground/40 font-medium">{t.personalDesc}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.lastName}</label>
                  <input 
                    type="text" value={localUser.lastName} onChange={e => setLocalUser({...localUser, lastName: e.target.value})}
                    placeholder="Familiyangiz" className="premium-input px-6 py-4" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.firstName}</label>
                  <input 
                    type="text" value={localUser.firstName} onChange={e => setLocalUser({...localUser, firstName: e.target.value})}
                    placeholder="Ismingiz" className="premium-input px-6 py-4" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.patronymic}</label>
                  <input 
                    type="text" value={localUser.patronymic} onChange={e => setLocalUser({...localUser, patronymic: e.target.value})}
                    placeholder="Otangizning ismi" className="premium-input px-6 py-4" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">{t.birthDate}</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20" />
                    <input 
                      type="date" value={localUser.birthDate} onChange={e => setLocalUser({...localUser, birthDate: e.target.value})}
                      className="premium-input pl-14 px-6 py-4" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Education Management */}
            <div className="glass-card p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.education}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.eduDesc}</p>
                  </div>
                </div>
                <button onClick={addEdu} className="p-3 bg-white/5 hover:bg-primary/20 text-primary rounded-xl transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {localUser.educationInfo.map((edu: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative group hover:border-blue-500/20 transition-all">
                    <button onClick={() => removeEdu(idx)} className="absolute top-4 right-4 p-2 text-foreground/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select 
                        className="premium-input !py-3 !text-sm"
                        value={edu.type} onChange={e => {
                          const newList = [...localUser.educationInfo];
                          newList[idx].type = e.target.value;
                          setLocalUser({...localUser, educationInfo: newList});
                        }}
                      >
                        <option value="Bakalavr">Bakalavr</option>
                        <option value="Kolledj">Kolledj</option>
                        <option value="Litsey">Litsey</option>
                        <option value="Master">Master</option>
                      </select>
                      <input 
                        type="text" placeholder={t.institution} className="premium-input !py-3 !text-sm md:col-span-2"
                        value={edu.institution} onChange={e => {
                          const newList = [...localUser.educationInfo];
                          newList[idx].institution = e.target.value;
                          setLocalUser({...localUser, educationInfo: newList});
                        }}
                      />
                      <input 
                        type="text" placeholder={t.specialization} className="premium-input !py-3 !text-sm md:col-span-3"
                        value={edu.specialization} onChange={e => {
                          const newList = [...localUser.educationInfo];
                          newList[idx].specialization = e.target.value;
                          setLocalUser({...localUser, educationInfo: newList});
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Management */}
            <div className="glass-card p-8 border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{t.experience}</h3>
                    <p className="text-sm text-foreground/40 font-medium">{t.expDesc}</p>
                  </div>
                </div>
                <button onClick={addExp} className="p-3 bg-white/5 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {localUser.experienceInfo.map((exp: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative group hover:border-orange-500/20 transition-all">
                    <button onClick={() => removeExp(idx)} className="absolute top-4 right-4 p-2 text-foreground/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" placeholder={t.workplace} className="premium-input !py-3 !text-sm"
                        value={exp.workplace} onChange={e => {
                          const newList = [...localUser.experienceInfo];
                          newList[idx].workplace = e.target.value;
                          setLocalUser({...localUser, experienceInfo: newList});
                        }}
                      />
                      <input 
                        type="text" placeholder={t.position} className="premium-input !py-3 !text-sm"
                        value={exp.position} onChange={e => {
                          const newList = [...localUser.experienceInfo];
                          newList[idx].position = e.target.value;
                          setLocalUser({...localUser, experienceInfo: newList});
                        }}
                      />
                      <input 
                        type="text" placeholder={t.duration} className="premium-input !py-3 !text-sm md:col-span-2"
                        value={exp.duration} onChange={e => {
                          const newList = [...localUser.experienceInfo];
                          newList[idx].duration = e.target.value;
                          setLocalUser({...localUser, experienceInfo: newList});
                        }}
                      />
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

