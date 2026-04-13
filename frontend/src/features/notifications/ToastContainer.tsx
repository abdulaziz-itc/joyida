import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../../store/notificationStore';
import { 
  Bell, MessageSquare, CheckCircle2, 
  AlertCircle, X, Info, Zap 
} from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'booking': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed top-24 right-8 z-[300] flex flex-col gap-4 pointer-events-none w-80">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className="glass-card p-5 border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 group-hover:bg-purple-500 transition-all" />
               
               <div className="flex gap-4">
                  <div className="mt-0.5">
                     {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                     <h4 className="text-sm font-bold text-white mb-1">{n.title}</h4>
                     <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                  </div>
                  <button 
                    onClick={() => removeNotification(n.id)}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
