import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Camera, Send, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  expertName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, photos: string[]) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ expertName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(rating, comment, []);
      onClose();
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
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-lg w-full p-8 border-white/10 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-2xl font-bold">Xizmatni baholang</h2>
                    <p className="text-gray-400 text-sm mt-1">{expertName} tomonidan ko'rsatilgan xizmat qanday bo'ldi?</p>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-all text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-3 mb-10">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <motion.button
                     key={star}
                     whileHover={{ scale: 1.2 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setRating(star)}
                     onMouseEnter={() => setHover(star)}
                     onMouseLeave={() => setHover(0)}
                     className="relative"
                   >
                      <Star 
                        className={`w-12 h-12 transition-all duration-300 ${
                          star <= (hover || rating) 
                          ? 'text-amber-400 fill-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' 
                          : 'text-white/10'
                        }`} 
                      />
                   </motion.button>
                 ))}
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Sizning fikringiz (ixtiyoriy)</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ish jarayoni haqida qisqacha yozing..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm min-h-[120px] focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                    />
                 </div>

                 <div className="flex gap-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/10 transition-all">
                       <Camera className="w-5 h-5" /> Rasm qo'shish
                    </button>
                 </div>

                 <button 
                   onClick={handleSubmit}
                   disabled={rating === 0}
                   className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                     rating > 0 
                     ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20' 
                     : 'bg-white/5 text-gray-600 cursor-not-allowed'
                   }`}
                 >
                    Yuborish <Send className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center flex flex-col items-center"
            >
               <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black mb-2">Rahmat!</h2>
               <p className="text-gray-400">Sizning fikringiz biz uchun muhim. Sharh muvaffaqiyatli yuborildi.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ReviewModal;
