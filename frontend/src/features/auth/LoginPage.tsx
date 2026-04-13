import { Mail, Lock, LogIn, Github, Chrome } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useGoogleLogin } from '@react-oauth/google';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/google-auth/google', {
          idToken: tokenResponse.access_token 
        });
        const { access_token } = response.data;
        setAuth({ id: 1, email: 'google-user@joyida.com', full_name: 'Google User', is_active: true }, access_token);
        alert('Google Login successful!');
      } catch (error) {
        console.error('Google Login failed', error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login/access-token', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { access_token } = response.data;
      
      // Get user details (mocking for now, or add an extra endpoint)
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
    <div className="min-h-screen flex items-center justify-center relative px-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2"
          >
            Joyida
          </motion.h1>
          <p className="text-gray-400">Welcome back! Sign in to continue.</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="relative mb-4">
            <Mail className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="input-field pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative mb-6">
            <Lock className="absolute left-4 top-4 text-gray-500 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="glow-button w-full flex items-center justify-center gap-2 text-lg"
          >
            {isLoading ? 'Signing in...' : (
              <>
                Sign In <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-[#050505] px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => googleLogin()}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Chrome className="w-5 h-5 text-red-500" />
            <span className="text-sm">Google</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
            <Github className="w-5 h-5 text-white" />
            <span className="text-sm">GitHub</span>
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account? <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">Sign Up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
