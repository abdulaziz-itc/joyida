import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../api/apiClient';

interface UploadReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadReelModal = ({ isOpen, onClose, onSuccess }: UploadReelModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoUrl, setVideoUrl] = useState(''); // Simple URL for now as per current backend capability
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);

  const getPlatformIcon = (link: string) => {
    if (link.includes('instagram.com')) return <div className="text-pink-500 font-bold text-xs">Instagram</div>;
    if (link.includes('tiktok.com')) return <div className="text-foreground font-bold text-xs">TikTok</div>;
    if (link.includes('.mp4') || link.includes('.mov')) return <div className="text-blue-500 font-bold text-xs">Direct MP4</div>;
    return <Video className="w-5 h-5 text-foreground/20" />;
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
      setStep(2); // Success step
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setVideoUrl('');
    setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-background border border-glass-border rounded-[2.5rem] shadow-premium overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black font-display text-foreground">{t('reels.upload_title', 'Upload New Work')}</h3>
                <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                  <X size={24} className="text-foreground/50" />
                </button>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-3 ml-1">
                      {t('reels.video_url', 'Video URL')}
                    </label>
                    <div className="relative group">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border-r border-glass-border pr-3">
                          {getPlatformIcon(videoUrl)}
                       </div>
                       <input 
                         type="url" 
                         required
                         value={videoUrl}
                         onChange={(e) => setVideoUrl(e.target.value)}
                         placeholder="YouTube, Instagram, TikTok or MP4 link..."
                         className="w-full bg-input-bg border border-input-border rounded-2xl py-4 pl-16 pr-4 text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-3 ml-1">
                        {t('reels.work_title', 'Title')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Project title..."
                        className="w-full bg-input-bg border border-input-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-3 ml-1">
                        {t('reels.category', 'Category')}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Plumbing, Design, etc."
                        className="w-full bg-input-bg border border-input-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-foreground/40 mb-3 ml-1">
                      {t('reels.description', 'Description')}
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Tell more about this work..."
                      className="w-full bg-input-bg border border-input-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-primary/50 transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="glow-button w-full h-16 group"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                        {t('reels.submit_upload', 'Share Now')}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 border border-green-500/30">
                    <Check size={48} />
                  </div>
                  <h4 className="text-2xl font-black text-foreground mb-2">{t('reels.success_title', 'Success!')}</h4>
                  <p className="text-foreground/50">{t('reels.success_desc', 'Your work has been published.')}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadReelModal;
