import React from 'react';
import { 
  LayoutDashboard, Briefcase, Settings, LogOut, 
  ShieldCheck, MapPin, Zap, Users, PieChart, Film, MessageCircle, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    <div className="flex h-[100dvh] bg-background text-foreground transition-colors duration-500 overflow-hidden relative">
      {/* ELITE BACKGROUND LAYER: Aurora & Nebula Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Deep Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full animate-aurora mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full animate-nebula-float mix-blend-screen" />
        
        {/* Subtle Animated Particles/Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_100%)] opacity-30" />
      </div>

      {/* Mobile Top Header - Truly Pinned */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-glass-bg backdrop-blur-3xl border-b border-white/10 z-50 flex items-center justify-between px-6 shadow-premium">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_var(--color-primary-glow)] border border-white/10">
            J
          </div>
          <span className="text-xl font-black tracking-tight font-display">Joyida</span>
        </div>
        {!user && (
          <button 
            onClick={() => window.location.href = '/'}
            className="text-xs font-black uppercase tracking-widest text-primary hover:text-cyan-400 transition-colors"
          >
            {t('nav.login')}
          </button>
        )}
      </header>

      {/* Floating Glass Sidebar - Hidden on mobile with force-hide classes */}
      <aside 
        className="hidden lg:flex fixed left-6 top-6 bottom-6 w-64 border border-white/10 p-6 flex-col bg-glass-bg backdrop-blur-3xl z-40 rounded-[2.5rem] shadow-premium transition-all duration-500 inner-glow"
        style={{ display: typeof window !== 'undefined' && window.innerWidth < 1024 ? 'none' : undefined }}
      >
        <div className="flex items-center gap-3 mb-10 px-2 text-foreground">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_var(--color-primary-glow)] border border-white/10">
            J
          </div>
          <span className="text-2xl font-black tracking-tight font-display">Joyida</span>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
          {user?.is_superuser && (
            <div className="space-y-1.5 text-foreground">
              <NavItem icon={ShieldCheck} label={t('nav.admin')} active={currentPage === 'admin'} onClick={() => onNavigate('admin')} />
              <NavItem icon={LayoutDashboard} label={t('nav.dashboard')} active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
              <NavItem icon={Users} label={t('nav.users')} />
              <NavItem icon={PieChart} label={t('nav.analytics')} />
              <NavItem icon={Settings} label={t('nav.settings')} />
            </div>
          )}

          {!user?.is_superuser && user?.is_expert && (
            <div className="space-y-1.5">
              <NavItem icon={LayoutDashboard} label={t('nav.dashboard')} active={currentPage === 'dashboard'} onClick={() => onNavigate('dashboard')} />
              <NavItem icon={Briefcase} label={t('nav.projects')} active={currentPage === 'projects'} onClick={() => onNavigate('projects')} />
              <NavItem icon={MessageCircle} label={t('nav.messages')} active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
              <NavItem icon={Settings} label={t('nav.settings')} active={currentPage === 'settings'} onClick={() => onNavigate('settings')} />
            </div>
          )}

          {(!user || (!user?.is_superuser && !user?.is_expert)) && (
            <div className="space-y-1.5">
              <NavItem icon={MapPin} label={t('nav.explore')} active={currentPage === 'explore'} onClick={() => onNavigate('explore')} />
              <NavItem icon={Film} label={t('nav.reels')} active={currentPage === 'reels'} onClick={() => onNavigate('reels')} />
              {user && (
                <>
                  <NavItem icon={MessageCircle} label={t('nav.messages')} active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
                  <NavItem icon={User} label={t('nav.profile')} active={currentPage === 'profile'} onClick={() => onNavigate('profile')} />
                </>
              )}
            </div>
          )}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          {user?.is_expert && user?.subscription_tier !== 'pro' && (
            <motion.button 
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlans(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-cyan-500 text-white font-black text-xs uppercase tracking-[2px] flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(var(--primary-val),0.3)]"
            >
               <Zap className="w-4 h-4 fill-current" /> {t('nav.upgrade')}
            </motion.button>
          )}
          
          {user ? (
            <NavItem icon={LogOut} label={t('nav.logout')} onClick={logout} />
          ) : (
            <NavItem 
              icon={User} 
              label={t('nav.login', 'Kirish')} 
              onClick={() => window.location.href = '/'} 
            />
          )}
        </div>
      </aside>

      {/* Main Content - Independent Internal Scroll */}
      <main 
        className="flex-1 h-full overflow-y-auto no-scrollbar lg:ml-[20rem] min-h-full bg-transparent relative transition-all duration-500 z-10 pb-32 lg:pb-8 pt-16 lg:pt-8"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth < 1024 ? '0' : undefined }}
      >
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

      {/* Modern Floating Bottom Navigation Bar (Elite Pill) */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 px-6">
        <nav className="h-20 bg-glass-bg backdrop-blur-3xl border border-white/15 rounded-[2.5rem] shadow-premium flex items-center justify-around px-2 relative overflow-hidden inner-glow">
          {/* Subtle Dynamic Light inside the pill */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
          
          <MobileNavItem icon={MapPin} active={currentPage === 'explore'} onClick={() => onNavigate('explore')} />
          <MobileNavItem icon={Film} active={currentPage === 'reels'} onClick={() => onNavigate('reels')} />
          {user && (
            <>
              <MobileNavItem icon={MessageCircle} active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
              <MobileNavItem icon={User} active={currentPage === 'profile'} onClick={() => onNavigate('profile')} />
            </>
          )}
          {!user && (
             <MobileNavItem icon={User} active={false} onClick={() => window.location.href = '/'} />
          )}
        </nav>
      </div>
    </div>
  );
};

const MobileNavItem = ({ icon: Icon, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 transition-all duration-300 relative z-10 ${active ? 'text-primary' : 'text-foreground/50 hover:text-foreground/80'}`}
  >
    <Icon className={`w-7 h-7 transition-transform ${active ? 'scale-110 drop-shadow-[0_0_15px_var(--color-primary-glow)]' : ''}`} />
    {active && (
      <motion.div 
        layoutId="activeBottomNav"
        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]"
      />
    )}
  </button>
);

export default DashboardLayout;
