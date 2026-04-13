import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Briefcase, ShieldCheck, 
  Activity, Clock, TrendingUp,
  ChevronUp, ChevronDown
} from 'lucide-react';

const AdminStats: React.FC = () => {
  const stats = [
    { label: 'Total Users', value: '1,284', icon: Users, color: 'blue', change: '+12%', up: true },
    { label: 'Active Experts', value: '342', icon: Briefcase, color: 'purple', change: '+5%', up: true },
    { label: 'Verified', value: '89', icon: ShieldCheck, color: 'green', change: '+24%', up: true },
    { label: 'Active Jobs', value: '56', icon: Activity, color: 'orange', change: '-2%', up: false },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
         <h1 className="text-3xl font-bold mb-2">Platform Overview</h1>
         <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${s.color}-500/10 blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-${s.color}-500/20 transition-all duration-500`} />
            
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl bg-${s.color}-500/10 text-${s.color}-400`}>
                  <s.icon className="w-6 h-6" />
               </div>
               <div className={`flex items-center gap-1 text-xs font-bold ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                  {s.up ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {s.change}
               </div>
            </div>
            
            <div>
               <h3 className="text-3xl font-black mb-1 tracking-tight">{s.value}</h3>
               <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Growth Chart Mockup */}
         <div className="lg:col-span-2 glass-card p-8 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-xl font-bold">User Growth</h2>
                  <p className="text-sm text-gray-500">Real-time platform activity</p>
               </div>
               <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">Week</button>
                  <button className="px-4 py-1.5 rounded-lg bg-purple-500 border border-purple-400 text-xs font-bold shadow-lg shadow-purple-500/20">Month</button>
               </div>
            </div>
            <div className="flex-1 flex items-end gap-2 pb-4">
                {[40, 60, 45, 70, 85, 65, 90, 75, 55, 100, 80, 95].map((h, i) => (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: i * 0.05, duration: 1 }}
                     className="flex-1 bg-gradient-to-t from-purple-600/20 to-purple-500 rounded-t-lg relative group"
                   >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-white text-[#050505] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                         {h}k
                      </div>
                   </motion.div>
                ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4 px-2">
               <span>Jan</span>
               <span>Mar</span>
               <span>May</span>
               <span>Jul</span>
               <span>Sep</span>
               <span>Dec</span>
            </div>
         </div>

         {/* Recent Activity Mini-Feed */}
         <div className="glass-card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <Clock className="w-5 h-5 text-gray-500" /> Recent Activity
            </h2>
            <div className="space-y-6">
               {[
                 { user: 'Anvar T.', action: 'submitted documents', time: '2m ago' },
                 { user: 'Dilnoza A.', action: 'completed a job', time: '15m ago' },
                 { user: 'Aziz R.', action: 'registered as expert', time: '1h ago' },
                 { user: 'Nigora K.', action: 'updated portfolio', time: '2h ago' },
               ].map((a, i) => (
                  <div key={i} className="flex gap-4 group cursor-default">
                     <div className="w-1.5 h-10 rounded-full bg-white/5 group-hover:bg-purple-500 transition-all" />
                     <div>
                        <p className="text-sm font-bold text-gray-300">
                           <span className="text-purple-400">{a.user}</span> {a.action}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">{a.time}</p>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full mt-10 py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-gray-400">
               View All Activity
            </button>
         </div>
      </div>
    </div>
  );
};

export default AdminStats;
