  Briefcase, Settings, LogOut, ShieldCheck, MapPin, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import SubscriptionPlans from '../features/subscription/SubscriptionPlans';
import CheckoutOverlay from '../features/subscription/CheckoutOverlay';

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <motion.div 
    whileHover={{ x: 5 }}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="activeNav" className="ml-auto w-1 h-5 bg-purple-500 rounded-full" />}
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
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col fixed h-full bg-[#050505]/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 mb-12 px-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl">
            J
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Joyida</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={currentPage === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          {user?.is_superuser && (
            <NavItem 
              icon={ShieldCheck} 
              label="Admin Console" 
              active={currentPage === 'admin'} 
              onClick={() => onNavigate('admin')} 
            />
          )}
          <NavItem 
            icon={Briefcase} 
            label="Projects" 
            active={currentPage === 'projects'} 
            onClick={() => onNavigate('projects')} 
          />
          <NavItem 
            icon={MapPin} 
            label="Explore" 
            active={currentPage === 'explore'} 
            onClick={() => onNavigate('explore')} 
          />
          <NavItem icon={PieChart} label="Analytics" />
          <NavItem icon={Users} label="Users" />
          <NavItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
          {user?.is_expert && user?.subscription_tier !== 'pro' && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlans(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-400 text-[#050505] font-black text-xs uppercase tracking-[1px] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
            >
               <Zap className="w-4 h-4 fill-current" /> Go Pro
            </motion.button>
          )}
          
          <NavItem icon={LogOut} label="Logout" onClick={logout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-transparent relative">
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
