import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, Check, Loader2, Link as LinkIcon, ArrowRight, FileVideo, Instagram, Youtube, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/apiClient';

interface UploadReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SourceType = 'url' | 'file' | null;

const UploadReelModal = ({ isOpen, onClose, onSuccess }: UploadReelModalProps) => {
  const { t } = useTranslation();
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState(''); 
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(0); // 0: Choice, 1: Source Input, 2: Metadata, 3: Success
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPlatformIcon = (link: string) => {
    if (link.includes('instagram.com')) return <Instagram className="w-5 h-5 text-pink-500" />;
    if (link.includes('youtube.com') || link.includes('youtu.be')) return <Youtube className="w-5 h-5 text-red-500" />;
    if (link.includes('tiktok.com')) return <Video className="w-5 h-5 text-white" />;
    return <Globe className="w-5 h-5 text-primary/40" />;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/utils/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVideoUrl(response.data.url);
      setStep(2); // Go to metadata
    } catch (err) {
      console.error("File upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await apiClient.post('/projects/', {
        title,
        description,
        category,
        video_url: videoUrl,
        status: 'Completed'
      });
      setStep(3); // Success step
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2500);
    } catch (err) {
      console.error("Project creation failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setVideoUrl('');
    setSourceType(null);
    setStep(0);
  };

  const ChoiceCard = ({ icon: Icon, title: cardTitle, desc, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="group relative w-full p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] text-left hover:border-primary/50 transition-all duration-500 overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-7 h-7 text-white/80 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-black text-white mb-1">{cardTitle}</h4>
          <p className="text-xs text-white/40 font-medium">{desc}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-xl bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black font-display text-white tracking-tight">
                    {step === 3 ? t('reels.success_title', 'Muvaffaqiyat!') : t('reels.upload_title', 'Yangi ish namunasi')}
                  </h3>
                  {step < 3 && (
                    <p className="text-sm text-white/40 font-medium">Bajarilgan ishingizni butun dunyoga ko'rsating.</p>
                  )}
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all group">
                  <X size={20} className="text-white/30 group-hover:text-white" />
                </button>
              </div>

              <div className="min-h-[320px]">
                <AnimatePresence mode="wait">
                  {/* STEP 0: Choice */}
                  {step === 0 && (
                    <motion.div 
                      key="choice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <ChoiceCard 
                        icon={LinkIcon}
                        title="Havola orqali ulashish"
                        desc="Instagram, TikTok yoki YouTube havolasini kiriting"
                        color="from-primary/20 to-secondary/20"
                        onClick={() => { setSourceType('url'); setStep(1); }}
                      />
                      <ChoiceCard 
                        icon={Upload}
                        title="Video fayl yuklash"
                        desc="Kompyuteringizdan MP4 yoki MOV formatidagi faylni tanlang"
                        color="from-emerald-500/10 to-teal-500/10"
                        onClick={() => { setSourceType('file'); setStep(1); }}
                      />
                    </motion.div>
                  )}

                  {/* STEP 1: Source Input (URL or File Zone) */}
                  {step === 1 && (
                    <motion.div 
                      key="input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {sourceType === 'url' ? (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Video havolasi (URL)</label>
                            <div className="relative group">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-transform">
                                {getPlatformIcon(videoUrl)}
                              </div>
                              <input 
                                type="url" 
                                autoFocus
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-white/10"
                              />
                            </div>
                          </div>
                          <button 
                            disabled={!videoUrl}
                            onClick={() => setStep(2)}
                            className="glow-button w-full h-16 disabled:opacity-50"
                          >
                            Davom etish <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Video fayl yuklash</label>
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/50 cursor-pointer transition-all duration-500"
                          >
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <span className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Yuklanmoqda...</span>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                  <FileVideo className="w-8 h-8 text-white/20 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Faylni tanlang yoki shu yerga tashlang</span>
                              </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileUpload} />
                          </div>
                        </div>
                      )}
                      
                      <button onClick={() => setStep(0)} className="w-full text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">
                        Tanlovga qaytish
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: Metadata */}
                  {step === 2 && (
                    <motion.div 
                      key="metadata"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Sarlavha</label>
                          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Misol: Modern Dizayn" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Toifa</label>
                          <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Misol: Dizayn" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/10 font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Tavsif</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Ishingiz haqida batafsil..." className="w-full bg-white/[0.03] border border-white/5 rounded-2x border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none placeholder:text-white/10" />
                      </div>
                      <button 
                        onClick={handleSubmit}
                        disabled={isUploading || !title || !category} 
                        className="glow-button w-full h-16 group disabled:opacity-50"
                      >
                        {isUploading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                            Hoziroq ulashish
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 3: Success */}
                  {step === 3 && (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center text-center"
                    >
                      <div className="relative w-28 h-28 mb-8">
                        <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                        <div className="relative w-full h-full bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                          <Check size={56} className="animate-bounce" />
                        </div>
                      </div>
                      <h4 className="text-3xl font-black text-white mb-3 tracking-tight">Muvaffaqiyat!</h4>
                      <p className="text-white/40 max-w-xs leading-relaxed font-medium">Sizning ish namunangiz muvaffaqiyatli saqlandi va barchaga ko'rinadi.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadReelModal;
