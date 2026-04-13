import React, { useState } from 'react';
import { Mail, Lock, LogIn, Github, Chrome, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020205] overflow-hidden">
      {/* --- LEFT SIDE: HERO CONTENT (Desktop only) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="ambient-glow glow-purple opacity-30" style={{ width: '80%', height: '80%' }} />
        <div className="ambient-glow glow-pink opacity-20" style={{ right: '-20%', bottom: '-20%' }} />
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm mb-8 uppercase tracking-widest">
            <Zap className="w-4 h-4" /> The Future of Real Estate
          </div>
          
          <h1 className="text-7xl font-extrabold tracking-tighter leading-[1.05] mb-8 gradient-text">
            Design your space,<br />
            Find your <span className="text-purple-500">Expert.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed">
            Join the most advanced ecosystem for real estate planning, expert connection, and seamless transactions. Elegant. Transparent. Powerful.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Secure Data</h4>
                <p className="text-sm text-gray-500">Industry-leading encryption for your assets.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-pink-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold mb-1">Global Network</h4>
                <p className="text-sm text-gray-500">Connect with experts from around the world.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3D Decorative Shape (Abstract) */}
        <motion.div 
           animate={{ 
             y: [0, -20, 0],
             rotate: [0, 5, 0]
           }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute bottom-[-10%] right-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/20 to-transparent blur-[80px] rounded-full z-0"
        />
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="flex-1 flex items-center justify-center relative px-6 py-12 lg:bg-white/[0.01] lg:border-l lg:border-white/5">
        {/* Mobile Background Glows */}
        <div className="lg:hidden ambient-glow glow-purple opacity-20" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card w-full max-w-md p-10 md:p-12 relative z-10"
        >
          <div className="text-center mb-10">
            <motion.div className="lg:hidden mb-4 inline-block px-3 py-1 bg-purple-500/10 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest">
              Joyida Platform
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 gradient-text">
              Welcome back
            </h2>
            <p className="text-gray-400 font-medium">Log in to your dashboard to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="relative mb-4">
              <Mail className="absolute left-4 top-[17px] text-gray-500 w-5 h-5 pointer-events-none" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="premium-input pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative mb-8">
              <Lock className="absolute left-4 top-[17px] text-gray-500 w-5 h-5 pointer-events-none" />
              <input 
                type="password" 
                placeholder="Password" 
                className="premium-input pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="glow-button w-full text-xl py-5 group"
            >
              {isLoading ? 'Processing...' : (
                <>
                  Sign In <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black">
              <span className="bg-[#0b0b14] px-4 text-gray-500">Security Checkpoint</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex justify-center flex-col gap-3">
              <label className="text-xs text-center text-gray-500 font-bold mb-1">Instant Access</label>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
              />
            </div>
            
            <button type="button" className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 p-5 rounded-2xl hover:bg-white/[0.07] transition-all font-bold group">
              <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="text-center mt-12 text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-purple-400 hover:text-purple-200 font-black transition-colors">START FOR FREE</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
