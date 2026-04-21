import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  User as UserIcon, Globe, MapPin, Calendar, 
  MessageCircle, Star, Briefcase, GraduationCap, 
  Globe2, Award, ChevronLeft, Send, PlusCircle, CheckCircle2, ShieldCheck, Sparkles, Loader2
} from 'lucide-react';
import apiClient from '../../api/apiClient';

interface PublicProfilePageProps {
  expertId: number;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const PublicProfilePage = ({ expertId, onBack, onNavigate }: PublicProfilePageProps) => {
  const { t } = useTranslation();
  const [expert, setExpert] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/experts/${expertId}`);
        setExpert(response.data);
      } catch (err: any) {
        console.error("Failed to fetch expert profile", err);
        setError(err.response?.data?.detail || "Mutaxassis topilmadi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpert();
  }, [expertId]);

  const getMediaUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = apiClient.defaults.baseURL || import.meta.env.VITE_API_URL || 'https://backend.joida.uz';
    const domain = base.split('/api/v1')[0];
    return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground/40 font-black uppercase text-[10px] tracking-widest animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
            <XIcon size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">{error || "Xatolik yuz berdi"}</h3>
            <p className="text-sm text-foreground/40 font-medium">Bu mutaxassisning profili mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
          </div>
          <button onClick={onBack} className="glow-button w-full !py-4">
            <ChevronLeft className="w-5 h-5" /> Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-background p-4 md:p-8 scroll-smooth no-scrollbar relative animate-in fade-in duration-700">
      
      {/* Dynamic Background Aurora for the specific expert */}
      <div className="absolute inset-x-0 top-0 h-[50vh] -z-10 pointer-events-none opacity-40">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/20 blur-[150px] rounded-full animate-aurora" />
         <div className="absolute top-20 left-0 w-[30%] h-full bg-cyan-500/10 blur-[150px] rounded-full animate-nebula-float" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 pb-32">
        
        {/* LEFT COLUMN: Identity & Stats */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-8 border-white/10 shadow-premium relative overflow-hidden group inner-glow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
            
            <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all z-20">
              <ChevronLeft className="w-5 h-5 text-white/50" />
            </button>

            <div className="relative w-32 h-32 mx-auto mb-6 pt-4">
              <div className="w-full h-full rounded-[2rem] p-1 bg-gradient-to-br from-primary to-cyan-500 shadow-glow-primary">
                <div className="w-full h-full bg-background rounded-[1.8rem] flex items-center justify-center overflow-hidden relative border-4 border-background">
                  {expert.profile_picture_url ? (
                    <img 
                      src={getMediaUrl(expert.profile_picture_url)!} 
                      className="w-full h-full object-cover" 
                      alt="Expert" 
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-foreground/10" />
                  )}
                  {expert.subscription_tier === 'pro' && (
                    <div className="absolute top-1 right-1">
                      <div className="bg-primary text-white p-1 rounded-lg">
                        <ShieldCheck size={12} className="fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mb-8">
              <div className="flex items-center justify-center gap-1">
                <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">
                  {expert.full_name}
                </h2>
                <CheckCircle2 size={16} className="text-blue-400" />
              </div>
              <p className="text-primary font-black text-[10px] uppercase tracking-[3px] space-x-1">
                {expert.profession || "Mutaxassis"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center shadow-inner">
                  <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Reyting</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-amber-500">
                     <Star className="w-3 h-3 fill-current" /> {expert.rating || "5.0"}
                  </div>
               </div>
               <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center shadow-inner">
                  <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Sharhlar</div>
                  <div className="text-sm font-black text-foreground">{expert.review_count || 0}</div>
               </div>
            </div>

            <div className="space-y-3">
               <button 
                 onClick={() => onNavigate('messages')}
                 className="w-full py-4 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center justify-center gap-2 shadow-glow-primary hover:scale-105 active:scale-95 transition-all"
               >
                 <Send className="w-4 h-4" /> Xabar yuborish
               </button>
               <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[2px] flex items-center justify-center gap-2 transition-all">
                 <PlusCircle className="w-4 h-4" /> Loyihaga taklif
               </button>
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 shadow-premium space-y-4">
             <div className="flex items-center gap-3 text-foreground/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary"><MapPin size={16} /></div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Joylashuv</span>
                   <span className="text-xs font-bold">{expert.service_location_name || "Toshkent, O'zbekiston"}</span>
                </div>
             </div>
             <div className="flex items-center gap-3 text-foreground/60">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400"><Calendar size={16} /></div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Tajriba</span>
                   <span className="text-xs font-bold">5+ yil</span>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bio, Skills, Education */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Bio Section */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-cyan-400" />
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground font-display">Mutaxassis haqida</h3>
             </div>
             <p className="text-foreground/70 text-lg leading-relaxed font-medium italic border-l-4 border-primary/20 pl-6 bg-white/[0.01] py-4 rounded-r-2xl">
                {expert.bio || "Mutaxassis o'z bio ma'lumotlarini hali to'ldirmagan."}
             </p>
          </div>

          {/* Skills / Expertise */}
          {expert.skills && expert.skills.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                  <Award size={20} className="text-primary" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-foreground font-display">Asosiy ko'nikmalar</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {expert.skills.map((skill: string) => (
                  <span key={skill} className="px-5 py-3 bg-white/[0.02] border border-white/10 rounded-2xl text-[10px] font-black text-foreground uppercase tracking-[2px] shadow-sm hover:border-primary/40 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Combined Experience & Education Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Education */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <GraduationCap size={20} className="text-blue-400" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-foreground font-display">Ta'lim</h3>
                </div>
                <div className="space-y-4">
                  {expert.education_info?.length > 0 ? expert.education_info.map((edu: any, i: number) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-primary/30 transition-all border-l-4 border-l-primary/30">
                       <span className="text-[10px] font-black text-primary/50 tracking-widest">{edu.year}</span>
                       <h4 className="font-black text-sm text-foreground mb-1">{edu.institution}</h4>
                       <p className="text-[11px] font-medium text-foreground/40">{edu.specialization}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-foreground/20 italic">Ma'lumot mavjud emas</p>
                  )}
                </div>
             </div>

             {/* Experience */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Briefcase size={20} className="text-rose-400" />
                    <h3 className="text-lg font-black uppercase tracking-widest text-foreground font-display">Ish tajribasi</h3>
                </div>
                <div className="space-y-4">
                   {expert.experience_info?.length > 0 ? expert.experience_info.map((exp: any, i: number) => (
                    <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-rose-500/30 transition-all border-l-4 border-l-rose-500/30">
                       <span className="text-[10px] font-black text-rose-500/50 tracking-widest">{exp.duration}</span>
                       <h4 className="font-black text-sm text-foreground mb-1">{exp.position}</h4>
                       <p className="text-[11px] font-medium text-foreground/40">{exp.workplace}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-foreground/20 italic">Ma'lumot mavjud emas</p>
                  )}
                </div>
             </div>
          </div>

          {/* Social Links */}
          {expert.social_links && expert.social_links.length > 0 && (
            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Haqolalar:</span>
                <div className="flex gap-4">
                   {expert.social_links.map((link: any, i: number) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-foreground/40 hover:text-primary transition-all hover:scale-110">
                       <Globe2 size={20} />
                    </a>
                   ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const XIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default PublicProfilePage;
