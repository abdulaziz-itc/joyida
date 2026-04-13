import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, X, Smartphone, CreditCard } from 'lucide-react';

interface CheckoutOverlayProps {
  planName: string;
  price: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ planName, price, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'payme' | 'click' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate real 2s payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 border-white/10"
      >
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold">Secure Checkout</h2>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
           <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 font-medium">Selected Plan:</span>
              <span className="text-sm text-amber-500 font-bold uppercase tracking-wider">{planName}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Total to Pay:</span>
              <span className="text-xl font-black">{price} UZS</span>
           </div>
        </div>

        <div className="space-y-3 mb-10">
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Choose Payment Method</p>
           
           <button 
             onClick={() => setMethod('payme')}
             className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${
               method === 'payme' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
             }`}
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-[#00BAFF]/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-[#00BAFF]" />
                 </div>
                 <span className="font-bold text-lg">Payme</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'payme' ? 'border-amber-500' : 'border-white/10'}`}>
                 {method === 'payme' && <div className="w-3 h-3 rounded-full bg-amber-500" />}
              </div>
           </button>

           <button 
             onClick={() => setMethod('click')}
             className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between group ${
               method === 'click' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
             }`}
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-[#0060A6]/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#0060A6]" />
                 </div>
                 <span className="font-bold text-lg">CLICK</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === 'click' ? 'border-amber-500' : 'border-white/10'}`}>
                 {method === 'click' && <div className="w-3 h-3 rounded-full bg-amber-500" />}
              </div>
           </button>
        </div>

        <button 
          onClick={handlePay}
          disabled={!method || isProcessing}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            method 
            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-xl shadow-amber-500/20' 
            : 'bg-white/5 text-gray-600 cursor-not-allowed'
          }`}
        >
           {isProcessing ? (
             <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
           ) : (
             <>Confirm Payment <ArrowRight className="w-5 h-5" /></>
           )}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
           <Lock className="w-3 h-3" /> SSL Secured & Encrypted
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CheckoutOverlay;
