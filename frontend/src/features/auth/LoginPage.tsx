import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, Github, ShieldCheck, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import apiClient from '../../api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onRegister }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/google-auth/google', {
        idToken: credentialResponse.credential 
      });
      const { access_token } = response.data;
      setAuth({ id: 1, email: 'google-user@joyida.com', full_name: 'Google User', is_active: true }, access_token);
    } catch (error) {
      console.error('Google Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login/access-token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { access_token } = response.data;
      setAuth({ id: 1, email, full_name: 'Test User', is_active: true }, access_token);
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden font-main">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
      </div>

      {/* --- LEFT SIDE: THE HERO (Visionary Context) --- */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center px-16 xl:px-32 z-10 transition-all duration-700">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-12 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> 
            {t('login.digital_evo', 'Transforming Architecture')}
          </div>

          <h1 className="text-6xl xl:text-8xl font-black font-display leading-[0.9] tracking-tighter text-white mb-10 text-gradient">
            {t('login.hero_title', 'Design your dream space.')}
          </h1>

          <p className="text-xl text-foreground/60 max-w-xl leading-relaxed mb-16 font-medium">
            {t('login.hero_p', 'Joyida brings together visionary planners and expert specialists. Built for growth, designed for clarity.')}
          </p>

          <div className="grid grid-cols-2 gap-12 max-w-xl">
            <div className="group">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('login.security_title', 'Ironclad Security')}</h4>
              <p className="text-sm text-foreground/40 leading-relaxed">{t('login.security_desc', 'Your assets and data are protected by industry-standard protocols.')}</p>
            </div>
            <div className="group">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-secondary mb-5 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Globe className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('login.global_reach', 'Global Reach')}</h4>
              <p className="text-sm text-foreground/40 leading-relaxed">{t('login.global_desc', 'Access a worldwide network of property experts and innovative designers.')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM (Glass Interface) --- */}
      <div className="flex-1 flex items-center justify-center relative p-6 md:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md glass-card p-10 md:p-14 border-white/5"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight font-display">
              {t('login.title', 'Sign In.')}
            </h2>
            <p className="text-foreground/50 text-base font-medium">
              {t('login.subtitle', 'Enter your credentials to manage your space.')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('register.email_placeholder', 'Email Address')}
                  className="premium-input pl-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('register.password_placeholder', 'Password')}
                  className="premium-input pl-14"
                  required
                />
              </div>
              <div className="flex justify-end pt-1">
                <a href="#" className="text-xs font-bold text-foreground/30 hover:text-white transition-colors">
                  {t('login.forgot_password', 'Forgot Password?')}
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="glow-button w-full text-lg py-5 mt-4"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('login.sign_in_btn', 'Sign In')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="my-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.4em] font-black text-foreground/20">
              <span className="bg-[#0b0c10] px-4">{t('login.omni_channel', 'Omni-Channel')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="pill"
              size="large"
              width="100%"
            />
            
            <button 
              type="button" 
              className="w-full flex items-center justify-center gap-4 bg-white/[0.03] border border-white/10 py-4 rounded-2xl hover:bg-white/[0.08] transition-all group"
            >
              <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white/80">{t('login.github_login', 'Continue with GitHub')}</span>
            </button>
          </div>

          <p className="text-center mt-12 text-sm text-foreground/40 font-medium">
            {t('login.dont_have_account', "Don't have an account?")}{' '}
            <button 
              onClick={onRegister}
              className="text-primary hover:text-primary/80 font-black transition-colors ml-1 uppercase tracking-widest text-[11px]"
            >
              {t('login.join_now', 'Join Now')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
