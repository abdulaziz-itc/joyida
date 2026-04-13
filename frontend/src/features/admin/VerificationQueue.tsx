import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, XCircle, User, FileText, 
  ExternalLink, Check, X, Search, Filter 
} from 'lucide-react';

interface PendingExpert {
  id: number;
  name: string;
  profession: string;
  submittedAt: string;
  documents: { type: string; url: string }[];
}

const VerificationQueue: React.FC = () => {
  const [experts, setExperts] = useState<PendingExpert[]>([
    { 
      id: 1, 
      name: 'Sherzod Inatillaev', 
      profession: 'Elektrik', 
      submittedAt: 'Today, 14:20', 
      documents: [
        { type: 'Identity Card', url: 'https://images.unsplash.com/photo-1540560085459-0efa9c453421?w=800' },
        { type: 'Certification', url: 'https://images.unsplash.com/photo-1581242163695-19d0acfd486f?w=800' }
      ]
    },
    { 
      id: 2, 
      name: 'Malika Karimova', 
      profession: 'Advokat', 
      submittedAt: 'Yesterday, 18:45', 
      documents: [
        { type: 'Passport', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800' }
      ]
    }
  ]);

  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleApprove = (id: number) => {
    setExperts(experts.filter(e => e.id !== id));
  };

  const handleReject = (id: number) => {
    setExperts(experts.filter(e => e.id !== id));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold mb-2">Verification Queue</h1>
            <p className="text-gray-400">Review and verify professional identities to maintain platform safety.</p>
         </div>
         <div className="flex gap-2">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input 
                 type="text" 
                 placeholder="Search experts..." 
                 className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all w-64"
               />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
               <Filter className="w-5 h-5 text-gray-400" />
            </button>
         </div>
      </div>

      <div className="glass-card overflow-hidden border-white/5">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Expert</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Profession</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Submitted</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500">Documents</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               <AnimatePresence>
                  {experts.map((e) => (
                     <motion.tr 
                       key={e.id}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                     >
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                                 <User className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors">{e.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-400 font-medium">{e.profession}</td>
                        <td className="px-8 py-6 text-sm text-gray-500 font-medium">{e.submittedAt}</td>
                        <td className="px-8 py-6">
                           <div className="flex gap-2">
                              {e.documents.map((doc, i) => (
                                 <button 
                                   key={i}
                                   onClick={() => setSelectedDoc(doc.url)}
                                   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                                 >
                                    <FileText className="w-3.5 h-3.5" /> View {doc.type}
                                 </button>
                              ))}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleReject(e.id)}
                                className="w-10 h-10 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                              >
                                 <X className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleApprove(e.id)}
                                className="w-10 h-10 rounded-xl border border-green-500/20 bg-green-500/5 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-500/20"
                              >
                                 <Check className="w-5 h-5" />
                              </button>
                           </div>
                        </td>
                     </motion.tr>
                  ))}
               </AnimatePresence>
            </tbody>
         </table>
         {experts.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
               <div className="w-16 h-16 rounded-3xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold">All caught up!</h3>
               <p className="text-gray-500">No pending verification requests at the moment.</p>
            </div>
         )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
         {selectedDoc && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-10"
               onClick={() => setSelectedDoc(null)}
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 className="relative max-w-5xl w-full h-full flex flex-col gap-6"
                 onClick={e => e.stopPropagation()}
               >
                  <div className="flex items-center justify-between text-white">
                     <h2 className="text-2xl font-bold flex items-center gap-3">
                        <FileText className="w-6 h-6 text-purple-400" /> Document Inspection
                     </h2>
                     <button 
                       onClick={() => setSelectedDoc(null)}
                       className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                     >
                        <XCircle className="w-6 h-6" />
                     </button>
                  </div>
                  <div className="flex-1 rounded-3xl overflow-hidden border border-white/10 bg-[#050505] flex items-center justify-center">
                     <img src={selectedDoc} className="max-w-full max-h-full object-contain" alt="Document Inspection" />
                  </div>
                  <div className="flex justify-center gap-4 py-4">
                     <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
                        <ExternalLink className="w-5 h-5" /> Open Full Resolution
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default VerificationQueue;
