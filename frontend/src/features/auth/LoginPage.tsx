import React, { useState } from 'react';
import { Mail, Lock, LogIn, Github, Chrome, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onRegister }) => {
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
      alert('Google Login successful!');
    } catch (error) {
      console.error('Google Login failed', error);
      alert('Google Login failed. Please check your SSL status and try again.');
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
      alert('Login successful!');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020205] overflow-hidden selection:bg-purple-500/30">
      
      {/* --- LEFT SIDE: PREMIUM HERO (Wider 55%) --- */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="hidden md:flex md:w-[50%] lg:w-[55%] relative flex-col justify-center p-12 lg:p-24 xl:p-32 overflow-hidden"
      >
        {/* Advanced Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-600/15 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-purple-400 font-black text-xs mb-10 uppercase tracking-[0.2em] shadow-2xl">
            <Zap className="w-4 h-4 fill-purple-400" /> Digital Evolution
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.95] mb-10 text-white">
            Design your <br />
            <span className="gradient-text">dream space.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl lg:text-2xl text-gray-400 mb-16 max-w-xl leading-relaxed font-medium">
            Joyida brings together visionary planners and expert specialists in one seamless ecosystem. Built for growth, designed for clarity.
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-2xl">
            <div className="space-y-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 text-purple-400 shadow-xl">
                <ShieldCheck className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-white">Ironclad Security</h4>
              <p className="text-sm lg:text-base text-gray-500 leading-relaxed font-medium">Your assets and data are protected by industry-standard encryption protocols.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-pink-400 shadow-xl">
                <Globe className="w-6 h-6 lg:w-7 lg:h-7" />
              </div>
              <h4 className="text-lg lg:text-xl font-bold text-white">Global Reach</h4>
              <p className="text-sm lg:text-base text-gray-500 leading-relaxed font-medium">Access a worldwide network of property experts and innovative designers.</p>
            </div>
          </motion.div>
        </div>

        {/* Abstract 3D Element (Floating) */}
        <motion.div 
           animate={{ y: [0, -30, 0], rotate: [0, 8, 0], scale: [1, 1.05, 1] }}
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full z-0 pointer-events-none"
        />
      </motion.div>

      {/* --- RIGHT SIDE: PRECISION LOGIN FORM (Fixed 45%) --- */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-20 md:py-0 md:bg-[#050508]/50 backdrop-blur-3xl md:border-l md:border-white/[0.05]">
        {/* Background Accents for Mobile/Tablet */}
        <div className="md:hidden absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-600/20 blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-blue-600/20 blur-[100px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center md:text-left mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-purple-400 uppercase tracking-[0.25em] mb-6"
            >
              <Sparkles className="w-3 h-3" /> Secure Access
            </motion.div>
            <h2 className="text-5xl md:text-5xl lg:text-6xl font-black mb-4 text-white tracking-tight">
              Sign In.
            </h2>
            <p className="text-gray-400 text-lg font-medium">Enter your credentials to manage your space.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="group relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="premium-input pl-14 py-5 bg-white/[0.02] border-white/10 focus:bg-white/[0.04] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-purple-400" />
              <input 
                type="password" 
                placeholder="Password" 
                className="premium-input pl-14 py-5 bg-white/[0.02] border-white/10 focus:bg-white/[0.04] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <a href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="glow-button w-full text-xl py-5 group shadow-2xl shadow-purple-500/20"
            >
              {isLoading ? 'Authenticating...' : (
                <span className="flex items-center justify-center gap-3">
                  Sign In <LogIn className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.05]"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
              <span className="bg-[#050508] px-4 text-gray-600">Omni-Channel Login</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="space-y-4">
            <div className="flex justify-center flex-col gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>
            
            <button type="button" className="flex items-center justify-center gap-4 bg-white/[0.03] border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-all font-black group w-full text-sm">
              <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center mt-12 text-sm text-gray-400 font-medium">
            Don't have an account? <button 
              onClick={onRegister}
              className="text-purple-400 hover:text-purple-300 font-black transition-colors ml-1 uppercase tracking-wider"
            >
              Join Now
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
