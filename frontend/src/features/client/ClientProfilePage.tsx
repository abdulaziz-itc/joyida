import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Globe, Bell, Shield, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ClientProfilePage = () => {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('user-theme') || 'dark');
  const [language, setLanguage] = useState('uz');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('user-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 relative">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-foreground font-display tracking-tight mb-2">Settings & Profile</h1>
        <p className="text-foreground/50">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: User Card */}
        <div className="col-span-1">
          <div className="glass-card p-6 border-white/5 rounded-3xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 p-1">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-foreground/50" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{user?.full_name || 'Joyida User'}</h2>
            <p className="text-foreground/50 text-sm mb-6">{user?.email}</p>
            <div className="inline-flex px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {user?.is_expert ? 'Specialist' : 'Client'}
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          <div className="glass-card border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Appearance</h3>
                <p className="text-foreground/50 text-sm">Toggle between light and dark mode</p>
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
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Language</h3>
                <p className="text-foreground/50 text-sm">Select your preferred platform language</p>
              </div>
              <div className="ml-auto">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/5 border border-white/10 text-foreground px-4 py-2 rounded-xl outline-none"
                >
                  <option value="uz">O'zbek</option>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-rose-500 text-lg">Log Out</h3>
                <p className="text-foreground/50 text-sm">End your current session</p>
              </div>
              <div className="ml-auto">
                <button onClick={logout} className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl font-bold transition-colors">
                  Log Out
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
