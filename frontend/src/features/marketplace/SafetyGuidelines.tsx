import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface SafetyGuidelinesProps {
  onClose: () => void;
  onContinue: () => void;
}

const SafetyGuidelines: React.FC<SafetyGuidelinesProps> = ({ onClose, onContinue }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="glass-card max-w-2xl w-full p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-purple-500/20 text-purple-400">
               <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
               <h2 className="text-3xl font-bold">Safety First</h2>
               <p className="text-gray-400">Please read our safety guidelines before contacting professionals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="space-y-4">
               <h3 className="font-bold text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Dos
               </h3>
               <ul className="space-y-3 text-sm text-gray-300">
                  <li>• Meet in a public place or with others present.</li>
                  <li>• Pay only AFTER the service is fully completed.</li>
                  <li>• Verify the expert's identity upon arrival.</li>
                  <li>• Keep all communication within the Joyida app.</li>
               </ul>
            </div>

            <div className="space-y-4">
               <h3 className="font-bold text-red-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Don'ts
               </h3>
               <ul className="space-y-3 text-sm text-gray-300">
                  <li>• Do not pay an advance or deposit.</li>
                  <li>• Do not share your personal financial details.</li>
                  <li>• Avoid meeting in isolated dark areas.</li>
                  <li>• Don't ignore your intuition - safety first!</li>
               </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <button 
               onClick={onClose}
               className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-bold text-gray-400"
             >
                Go Back
             </button>
             <button 
               onClick={onContinue}
               className="flex-[2] py-4 rounded-2xl glow-button font-bold flex items-center justify-center gap-2"
             >
                I Understand & Continue <ArrowRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SafetyGuidelines;
