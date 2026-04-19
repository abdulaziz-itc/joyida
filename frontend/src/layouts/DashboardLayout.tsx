import React from 'react';
import { 
  LayoutDashboard, Briefcase, Settings, LogOut, 
  ShieldCheck, MapPin, Zap, Users, PieChart, Film, MessageCircle, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import SubscriptionPlans from '../features/subscription/SubscriptionPlans';
import CheckoutOverlay from '../features/subscription/CheckoutOverlay';

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <motion.div 
    whileHover={{ x: 4, backgroundColor: 'rgba(var(--primary-val), 0.05)' }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all relative group ${
      active 
        ? 'bg-gradient-to-r from-primary/25 to-transparent text-foreground shadow-[inset_0_0_25px_var(--color-primary-glow)]' 
        : 'text-foreground/50 hover:text-foreground'
    }`}
  >
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary scale-110' : 'group-hover:text-foreground'}`} />
    <span className={`font-semibold tracking-wide transition-colors text-sm ${active ? 'text-foreground' : 'group-hover:text-foreground'}`}>{label}</span>
    {active && (
      <>
        <motion.div 
          layoutId="activeNav" 
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_20px_var(--color-primary)]" 
        />
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
      </>
    )}
  </motion.div>
);

const DashboardLayout = ({ children, onNavigate, currentPage }: { children: any, onNavigate: (page: string) => void, currentPage: string }) => {
  const { logout, user } = useAuthStore();
  const [showPlans, setShowPlans] = React.useState(false);
  const [showCheckout, setShowCheckout] = React.useState(false);

  const handleSelectPlan = () => {
    setShowPlans(false);
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    // In a real app, refresh user state
    alert("Successfully upgraded to PRO!");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Floating Glass Sidebar */}
      <aside className="fixed left-6 top-6 bottom-6 w-64 border border-white/10 p-6 flex flex-col bg-glass-bg backdrop-blur-3xl z-40 rounded-[2.5rem] shadow-premium transition-all duration-500">
        <div className="flex items-center gap-3 mb-10 px-2 text-foreground">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_var(--color-primary-glow)] border border-white/10">
            J
          </div>
          <span className="text-2xl font-black tracking-tight font-display">Joyida</span>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          {user?.is_superuser && (
            <div className="space-y-1.5 text-foreground">
              <NavItem icon={ShieldCheck} label="Admin Console" active={currentPage === 'admin'} onClick={() => onNavigate('admin')} />
              <NavItem icon={LayoutDashboard} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
              <NavItem icon={Users} label="Users" />
              <NavItem icon={PieChart} label="Analytics" />
              <NavItem icon={Settings} label="Settings" />
            </div>
          )}

          {!user?.is_superuser && user?.is_expert && (
            <div className="space-y-1.5">
              <NavItem icon={LayoutDashboard} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
              <NavItem icon={Briefcase} label="Orders/Projects" active={currentPage === 'projects'} onClick={() => onNavigate('projects')} />
              <NavItem icon={MessageCircle} label="Messages" active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
              <NavItem icon={Settings} label="Settings" active={currentPage === 'settings'} onClick={() => onNavigate('settings')} />
            </div>
          )}

          {!user?.is_superuser && !user?.is_expert && (
            <div className="space-y-1.5">
              <NavItem icon={MapPin} label="Explore" active={currentPage === 'explore'} onClick={() => onNavigate('explore')} />
              <NavItem icon={Film} label="Reels" active={currentPage === 'reels'} onClick={() => onNavigate('reels')} />
              <NavItem icon={MessageCircle} label="Messages" active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
              <NavItem icon={User} label="Profile & Settings" active={currentPage === 'profile'} onClick={() => onNavigate('profile')} />
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
          {user?.is_expert && user?.subscription_tier !== 'pro' && (
            <motion.button 
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlans(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-[#050505] font-black text-xs uppercase tracking-[2px] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
            >
               <Zap className="w-4 h-4 fill-current" /> Upgrade
            </motion.button>
          )}
          
          <NavItem icon={LogOut} label="Logout" onClick={logout} />
        </div>
      </aside>

      {/* Main Content - Detached and shifted for the floating sidebar */}
      <main className="flex-1 ml-[19rem] min-h-screen bg-transparent relative transition-all duration-500">
        {children}
        
        <AnimatePresence>
          {showPlans && (
            <SubscriptionPlans 
              onClose={() => setShowPlans(false)} 
              onSelectPlan={handleSelectPlan} 
            />
          )}
          {showCheckout && (
            <CheckoutOverlay 
              planName="Professional" 
              price="49,000" 
              onClose={() => setShowCheckout(false)} 
              onSuccess={handleSuccess} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardLayout;
