import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Globe, Bell, Shield, LogOut, Lock, Edit3, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const translations = {
  uz: {
    title: "Sozlamalar va Profil",
    subtitle: "Profilingiz va ilova sozlamalarini boshqaring.",
    appearance: "Tashqi ko'rinish",
    themeDesc: "Tungi yoki kunduzgi rejimni tanlang",
    language: "Til (Language)",
    langDesc: "Platforma uchun asosiy tilini tanlang",
    logout: "Tizimdan chiqish",
    logoutDesc: "Joriy sessiyani tugatish",
    btnOut: "Chiqish",
    personal: "Shaxsiy ma'lumotlar",
    personalDesc: "Ismingiz va rasmingizni o'zgartiring",
    namePlace: "To'liq ismingiz",
    save: "Saqlash",
    security: "Xavfsizlik & Parol",
    secDesc: "Hisobingiz xavfsizligini ta'minlang",
    passOld: "Joriy parol",
    passNew: "Yangi parol",
    expert: "Mutaxassis",
    client: "Mijoz"
  },
  ru: {
    title: "Настройки и Профиль",
    subtitle: "Управление настройками профиля и приложения.",
    appearance: "Внешний вид",
    themeDesc: "Выберите дневной или ночной режим",
    language: "Язык (Language)",
    langDesc: "Выберите основной язык платформы",
    logout: "Выйти из системы",
    logoutDesc: "Завершить текущий сеанс",
    btnOut: "Выйти",
    personal: "Личные данные",
    personalDesc: "Изменить имя и фотографию",
    namePlace: "Полное имя",
    save: "Сохранить",
    security: "Безопасность и Пароль",
    secDesc: "Обеспечьте безопасность аккаунта",
    passOld: "Текущий пароль",
    passNew: "Новый пароль",
    expert: "Специалист",
    client: "Клиент"
  },
  en: {
    title: "Settings & Profile",
    subtitle: "Manage your profile and app settings.",
    appearance: "Appearance",
    themeDesc: "Toggle between light and dark mode",
    language: "Language",
    langDesc: "Select your main platform language",
    logout: "Log Out",
    logoutDesc: "End your current session",
    btnOut: "Log Out",
    personal: "Personal Info",
    personalDesc: "Update your name and photo",
    namePlace: "Full Name",
    save: "Save",
    security: "Security & Password",
    secDesc: "Ensure your account security",
    passOld: "Current Password",
    passNew: "New Password",
    expert: "Expert",
    client: "Client"
  }
};

const ClientProfilePage = () => {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('user-theme') || 'dark');
  const [language, setLanguage] = useState<'uz' | 'ru' | 'en'>('uz');
  
  const t = translations[language];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('user-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="w-full h-[calc(100vh-theme(spacing.16))] md:h-screen overflow-y-auto bg-[#050505] p-8 relative scroll-smooth hide-scrollbar">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-black text-white font-display tracking-tight mb-2">{t.title}</h1>
        <p className="text-foreground/50">{t.subtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        
        {/* Left Column: User Card & Navigation */}
        <div className="col-span-1 space-y-6">
          <div className="glass-card p-6 border border-white/5 rounded-3xl text-center">
            <div className="relative w-28 h-28 mx-auto mb-4 group cursor-pointer">
              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full p-1">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                  <User className="w-12 h-12 text-foreground/50" />
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.full_name || 'Foydalanuvchi'}</h2>
            <p className="text-foreground/50 text-sm mb-6">{user?.email}</p>
            <div className="inline-flex px-4 py-1.5 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {user?.is_expert ? t.expert : t.client}
            </div>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          
          {/* General Preferences */}
          <div className="glass-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{t.appearance}</h3>
                <p className="text-foreground/50 text-sm">{t.themeDesc}</p>
              </div>
              <div className="ml-auto">
                <button 
                  onClick={toggleTheme}
                  className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 transition-colors"
                >
                   <motion.div 
                     layout
                     transition={{ type: "spring", stiffness: 700, damping: 30 }}
                     className={`w-6 h-6 rounded-full bg-white absolute ${theme === 'dark' ? 'right-1' : 'left-1'}`}
                   />
                </button>
              </div>
            </div>

            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{t.language}</h3>
                <p className="text-foreground/50 text-sm">{t.langDesc}</p>
              </div>
              <div className="ml-auto">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'uz'|'ru'|'en')}
                  className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none min-w-[120px] focus:border-primary/50"
                >
                  <option value="uz">O'zbekcha</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="p-6 flex items-center gap-4 bg-rose-500/5 hover:bg-rose-500/10 transition-colors cursor-pointer" onClick={logout}>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-rose-500 text-lg">{t.logout}</h3>
                <p className="text-foreground/50 text-sm">{t.logoutDesc}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="glass-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                   <Edit3 className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-lg">{t.personal}</h3>
                   <p className="text-foreground/50 text-sm">{t.personalDesc}</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-2">
                 <div>
                   <label className="text-xs uppercase text-foreground/50 font-bold mb-2 block">{t.namePlace}</label>
                   <input type="text" defaultValue={user?.full_name} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
                 </div>
                 <div className="flex justify-end">
                    <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all">
                      {t.save}
                    </button>
                 </div>
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="glass-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                   <Lock className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-lg">{t.security}</h3>
                   <p className="text-foreground/50 text-sm">{t.secDesc}</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-2">
                 <div>
                   <label className="text-xs uppercase text-foreground/50 font-bold mb-2 block">{t.passOld}</label>
                   <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50" />
                 </div>
                 <div>
                   <label className="text-xs uppercase text-foreground/50 font-bold mb-2 block">{t.passNew}</label>
                   <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50" />
                 </div>
                 <div className="flex justify-end">
                    <button className="px-6 py-2.5 bg-white/10 text-white border border-white/10 font-bold rounded-xl hover:bg-white/20 transition-all">
                      {t.save}
                    </button>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
