import React, { useState } from 'react';
import { Mail, Lock, LogIn, Github, Chrome } from 'lucide-react';
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
      // credentialResponse.credential contains the JWT ID Token
      const response = await apiClient.post('/google-auth/google', {
        idToken: credentialResponse.credential 
      });
      const { access_token } = response.data;
      setAuth({ id: 1, email: 'google-user@joyida.com', full_name: 'Google User', is_active: true }, access_token);
      alert('Google Login successful!');
    } catch (error) {
      console.error('Google Login failed', error);
      alert('Google Login failed. Please try again.');
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
    <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden bg-[#020205]">
      {/* Premium Background Glows */}
      <div className="ambient-glow glow-purple opacity-20" />
      <div className="ambient-glow glow-pink opacity-20" style={{ right: '-10%', bottom: '-10%' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-card w-full max-w-md p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl font-extrabold mb-3 gradient-text"
          >
            Joyida
          </motion.h1>
          <p className="text-gray-400 font-medium">Welcome back! Sign in to continue.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <Mail className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
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
            <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
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
            className="glow-button w-full text-xl py-4"
          >
            {isLoading ? 'Signing in...' : (
              <>
                Sign In <LogIn className="w-6 h-6" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="bg-[#020205] px-4 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="pill"
              size="large"
              width="100%"
            />
          </div>
          
          <button type="button" className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 p-4 rounded-2xl hover:bg-white/[0.07] transition-all font-bold group">
            <Github className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="text-center mt-10 text-sm text-gray-500">
          Don't have an account? <a href="#" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">Sign Up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
