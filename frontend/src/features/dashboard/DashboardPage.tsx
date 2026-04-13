import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, DollarSign, Briefcase, Activity, 
  TrendingUp, TrendingDown, Search, Bell, 
  LayoutDashboard, PieChart, Settings, LogOut 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const data = [
  { name: 'Jan', users: 4000, revenue: 2400 },
  { name: 'Feb', users: 3000, revenue: 1398 },
  { name: 'Mar', users: 2000, revenue: 9800 },
  { name: 'Apr', users: 2780, revenue: 3908 },
  { name: 'May', users: 1890, revenue: 4800 },
  { name: 'Jun', users: 2390, revenue: 3800 },
  { name: 'Jul', users: 3490, revenue: 4300 },
];

const KpiCard = ({ title, value, trend, isPositive, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${isPositive ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {isPositive ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
      <span className={isPositive ? 'text-green-400' : 'text-red-400'}>{trend}</span>
      <span className="text-gray-500 text-sm">vs last month</span>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, Alex!</h1>
          <p className="text-gray-400">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 ml-2" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard title="Total Users" value="67.4k" trend="+12%" isPositive={true} icon={Users} />
        <KpiCard title="Revenue" value="$1.2M" trend="+24%" isPositive={true} icon={DollarSign} />
        <KpiCard title="Active Projects" value="815" trend="-3%" isPositive={false} icon={Briefcase} />
        <KpiCard title="Conversion Rate" value="4.8%" trend="+7%" isPositive={true} icon={Activity} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold">Performance Overview</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9D50BB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9D50BB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#666" axisLine={false} tickLine={false} />
                <YAxis stroke="#666" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#9D50BB" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8">
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sarah L. logged in</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
