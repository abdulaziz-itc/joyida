import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, ShieldCheck, Users, 
  Settings, Bell, Search, LogOut,
  ChevronRight, LayoutDashboard, Database
} from 'lucide-react';
import AdminStats from '../features/admin/AdminStats';
import VerificationQueue from '../features/admin/VerificationQueue';

const AdminLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<'stats' | 'verification' | 'users'>('stats');

  const menuItems = [
    { id: 'stats', label: 'Overview', icon: LayoutDashboard },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, badge: '2' },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'database', label: 'Backup & DB', icon: Database },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Admin Sidebar */}
      <div className="w-72 bg-[#0A0A0A] border-r border-white/5 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
           <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/20">A</div>
           <div>
              <h2 className="font-bold text-lg leading-tight">Joyida Admin</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Management Console</p>
           </div>
        </div>

        <nav className="flex-1 space-y-2">
           {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  activeView === item.id ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/10' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                   <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-white' : 'group-hover:text-purple-400'} transition-colors`} />
                   <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.badge && (
                   <span className="px-2 py-0.5 rounded-lg bg-red-500 text-[10px] font-black">{item.badge}</span>
                )}
              </button>
           ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
           <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm">
              <LogOut className="w-5 h-5" /> Exit Console
           </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Top Bar */}
         <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0A0A0A]/50 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
               <span>Joyida</span>
               <ChevronRight className="w-4 h-4" />
               <span className="text-white font-bold capitalize">{activeView}</span>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Global search..." 
                    className="bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all w-64"
                  />
               </div>
               <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
               </button>
               <div className="flex items-center gap-3">
                  <div className="text-right">
                     <p className="text-xs font-bold leading-tight">Admin User</p>
                     <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Superuser</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5">
                     <div className="w-full h-full rounded-full bg-[#0A0A0A] flex items-center justify-center p-1">
                        <img src="https://i.pravatar.cc/150?u=admin" className="w-full h-full rounded-full" />
                     </div>
                  </div>
               </div>
            </div>
         </header>

         {/* Content Area */}
         <main className="flex-1 overflow-y-auto custom-scrollbar">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
               {activeView === 'stats' && <AdminStats />}
               {activeView === 'verification' && <VerificationQueue />}
               {activeView === 'users' && (
                  <div className="p-20 text-center text-gray-500 italic">User Management Module Loading...</div>
               )}
            </motion.div>
         </main>
      </div>
    </div>
  );
};

export default AdminLayout;
