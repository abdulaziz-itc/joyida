import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Users, DollarSign, Briefcase, Activity, 
  TrendingUp, TrendingDown, Search, Bell, 
  LayoutDashboard, PieChart, Settings, LogOut, Loader2,
  Eye, Star
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';

const KpiCard = ({ title, value, trend, isPositive, icon: Icon, isLoading }: any) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 flex flex-col justify-between min-h-[140px]"
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="w-1/2 h-4 bg-white/5 rounded-full" />
          <div className="w-3/4 h-8 bg-white/10 rounded-full" />
          <div className="w-1/3 h-4 bg-white/5 rounded-full mt-2" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl bg-opacity-10 shadow-lg ${isPositive ? 'bg-emerald-500 text-emerald-400' : 'bg-rose-500 text-rose-400'}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </div>
            <span className="text-foreground/20 text-[9px] font-black uppercase tracking-wider">{t('dashboard.vs_last_month')}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, analyticsRes, activityRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/dashboard/analytics'),
          apiClient.get('/dashboard/activity')
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  
  const isAdmin = stats?.is_admin || false;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-display tracking-tight text-foreground leading-tight">
            {t('dashboard.welcome')}, <span className="text-primary">{user?.full_name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-foreground/40 font-medium tracking-wide mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 w-4 h-4" />
            <input 
              type="text" 
              placeholder={t('dashboard.search')} 
              className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:border-primary/50 w-full md:w-80 transition-all backdrop-blur-xl"
            />
          </div>
          <button className="p-3.5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl relative group">
            <Bell className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
            <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-glow-primary" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title={isAdmin ? t('dashboard.total_users') : t('dashboard.profile_views')} 
          value={isAdmin ? stats?.total_users?.value : stats?.profile_views?.value} 
          trend={isAdmin ? stats?.total_users?.trend : stats?.profile_views?.trend} 
          isPositive={isAdmin ? stats?.total_users?.is_positive : stats?.profile_views?.is_positive} 
          icon={isAdmin ? Users : Eye}
          isLoading={isLoading}
        />
        <KpiCard 
          title={isAdmin ? t('dashboard.revenue') : t('dashboard.my_revenue')} 
          value={stats?.revenue?.value || "$0.00"} 
          trend={stats?.revenue?.trend || "+0%"} 
          isPositive={stats?.revenue?.is_positive !== false} 
          icon={DollarSign}
          isLoading={isLoading}
        />
        <KpiCard 
          title={t('dashboard.active_projects')} 
          value={stats?.active_projects?.value || "0"} 
          trend={stats?.active_projects?.trend || "+0%"} 
          isPositive={stats?.active_projects?.is_positive !== false} 
          icon={Briefcase}
          isLoading={isLoading}
        />
        <KpiCard 
          title={isAdmin ? t('dashboard.conv_rate') : t('dashboard.my_rating')} 
          value={isAdmin ? stats?.conversion_rate?.value : stats?.rating?.value} 
          trend={isAdmin ? stats?.conversion_rate?.trend : stats?.rating?.trend} 
          isPositive={isAdmin ? stats?.conversion_rate?.is_positive : stats?.rating?.is_positive} 
          icon={isAdmin ? Activity : Star}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32 md:pb-0">
        <div className="lg:col-span-2 glass-card p-8 border-white/5 shadow-premium">
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight uppercase text-foreground/80 text-[12px] tracking-[0.2em]">{t('dashboard.performance')}</h3>
              <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Project growth overview</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none hover:bg-white/10 transition-colors">
              <option>{t('dashboard.last_7_days')}</option>
              <option>{t('dashboard.last_30_days')}</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(var(--primary-val), 0.3)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="rgba(var(--primary-val), 0)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.1)" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.1)" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }}
                />
                <Tooltip 
                  cursor={{ stroke: 'rgba(var(--primary-val), 0.2)', strokeWidth: 2 }}
                  contentStyle={{ backgroundColor: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '800' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="rgba(var(--primary-val), 1)" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={4} 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border-white/5 shadow-premium">
          <div className="space-y-1 mb-10">
            <h3 className="text-xl font-black tracking-tight uppercase text-foreground/80 text-[12px] tracking-[0.2em]">{t('dashboard.recent_activity')}</h3>
            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">Real-time updates</p>
          </div>
          <div className="space-y-8">
            {isLoading ? (
               [1,2,3,4].map(i => (
                 <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 shrink-0" />
                    <div className="flex-1 space-y-2 py-2">
                       <div className="w-3/4 h-3 bg-white/10 rounded-full" />
                       <div className="w-1/4 h-2 bg-white/5 rounded-full" />
                    </div>
                 </div>
               ))
            ) : activity.length > 0 ? activity.map((act, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/5 group-hover:border-primary/20 transition-colors">
                  <Activity className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                <div className="py-1">
                  <p className="text-sm font-black text-foreground/70 group-hover:text-foreground transition-colors leading-snug">
                    <span className="text-foreground">{act.user}</span> {act.action}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mt-1">{act.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-20">
                 <Activity className="w-12 h-12 mx-auto mb-4" />
                 <p className="text-sm font-black uppercase tracking-widest">No activity yet</p>
              </div>
            )}
          </div>
          <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
