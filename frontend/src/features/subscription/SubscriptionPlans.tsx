import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Gem, Zap, Star, ArrowRight, X } from 'lucide-react';

interface SubscriptionPlansProps {
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onClose, onSelectPlan }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '0',
      description: 'Start your journey as a local expert.',
      features: [
        { text: 'Basic visibility in search', included: true },
        { text: 'Up to 3 Portfolio items', included: true },
        { text: 'Standard profile badge', included: true },
        { text: 'Priority ranking', included: false },
        { text: 'Unlimited Reels/Photos', included: false },
        { text: 'Advanced Analytics', included: false },
      ],
      isPopular: false,
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '49,000',
      description: 'Take your business to the next level.',
      features: [
        { text: 'Basic visibility in search', included: true },
        { text: 'Unlimited Portfolio items', included: true },
        { text: 'Premium Diamond badge', included: true },
        { text: 'Top Priority ranking', included: true },
        { text: 'Unlimited Reels/Photos', included: true },
        { text: 'Advanced Analytics', included: true },
      ],
      isPopular: true,
      color: 'amber'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-5xl w-full relative z-10"
      >
        <button 
          onClick={onClose}
          className="absolute -top-16 right-0 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all group"
        >
          <X className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
        </button>

        <div className="text-center mb-16">
           <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-6"
           >
              <Zap className="w-4 h-4" /> Freemium Upgrade
           </motion.div>
           <h1 className="text-5xl font-black mb-4 tracking-tight">Boost Your Visibility</h1>
           <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium">Choose the plan that fits your growth. Priority experts get 5x more client requests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {plans.map((plan) => (
             <motion.div 
               key={plan.id}
               whileHover={{ y: -10 }}
               className={`glass-card p-10 border-white/5 relative flex flex-col ${plan.isPopular ? 'border-amber-500/30' : ''}`}
             >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-400 text-white text-[10px] font-black uppercase tracking-[2px] shadow-lg shadow-amber-500/20">
                    Most Popular
                  </div>
                )}

                <div className="mb-10">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <div className={`p-3 rounded-2xl bg-${plan.color === 'amber' ? 'amber-500/10' : 'white/5'} text-${plan.color === 'amber' ? 'amber-500' : 'gray-400'}`}>
                         {plan.id === 'pro' ? <Gem className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                      </div>
                   </div>
                   <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">UZS / Month</span>
                   </div>
                   <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                   {plan.features.map((feature, i) => (
                     <div key={i} className={`flex items-center gap-3 ${feature.included ? 'text-gray-200' : 'text-gray-600'}`}>
                        {feature.included ? (
                          <Check className={`w-5 h-5 ${plan.id === 'pro' ? 'text-amber-500' : 'text-purple-500'}`} />
                        ) : (
                          <Check className="w-5 h-5 opacity-10" />
                        )}
                        <span className="text-sm font-medium">{feature.text}</span>
                     </div>
                   ))}
                </div>

                <button 
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    plan.id === 'pro' 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-xl shadow-amber-500/20' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                   {plan.id === 'pro' ? 'Upgrade to Pro' : 'Stay with Free'} <ArrowRight className="w-5 h-5" />
                </button>
             </motion.div>
           ))}
        </div>

        <div className="mt-12 text-center">
           <p className="text-xs text-gray-500 font-medium">Safe and secure payments powered by <span className="text-gray-400 font-bold">CLICK</span> and <span className="text-gray-400 font-bold">Payme</span></p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPlans;
