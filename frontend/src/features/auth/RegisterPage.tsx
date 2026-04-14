import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Mail, Lock, LogIn, ArrowRight, ArrowLeft, Camera, FileText, MapPin, Zap, GraduationCap, Briefcase } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';

interface RegisterPageProps {
  onBackToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState(0);
  const [isExpert, setIsExpert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const { setAuth } = useAuthStore();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    birthYear: 2000,
    gender: 'Male',
    educationLevel: 'Bachelor',
    workplace: '',
    serviceIds: [] as number[],
    latitude: null as number | null,
    longitude: null as number | null,
    locationName: '',
    profilePictureUrl: '',
    diplomaUrl: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get('/utils/services');
        setServices(response.data);
      } catch (e) {
        console.error('Error fetching services', e);
      }
    };
    fetchServices();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'diplomaUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    try {
      setIsLoading(true);
      const response = await apiClient.post('/utils/upload', data);
      setFormData(prev => ({ ...prev, [field]: response.data.url }));
    } catch (error) {
      alert('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        is_expert: isExpert,
        birth_year: formData.birthYear,
        gender: formData.gender,
        education_level: formData.educationLevel,
        workplace: formData.workplace,
        service_ids: formData.serviceIds,
        latitude: formData.latitude,
        longitude: formData.longitude,
        service_location_name: formData.locationName,
        profile_picture_url: formData.profilePictureUrl,
      });

      // Automatically login
      const loginData = new FormData();
      loginData.append('username', formData.email);
      loginData.append('password', formData.password);
      
      const loginResponse = await apiClient.post('/auth/login/access-token', loginData);
      setAuth(response.data, loginResponse.data.access_token);
      alert('Registration successful!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center p-6 bg-glow-mesh selection:bg-purple-500/30">
        <div className="max-w-2xl w-full">
            <div className="mb-12 flex items-center justify-between">
                <div>
                   <h2 className="text-4xl font-black gradient-text">Create Account.</h2>
                   <p className="text-gray-400 mt-2">Join Joyida Ecosystem</p>
                </div>
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="step0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <h3 className="text-xl font-bold mb-8">I want to register as...</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                                onClick={() => setIsExpert(false)}
                                className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${!isExpert ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                            >
                                <User className={`w-12 h-12 mb-4 ${!isExpert ? 'text-purple-400' : 'text-gray-400'}`} />
                                <h4 className="text-xl font-bold">Regular User</h4>
                                <p className="text-sm text-gray-400 mt-2">I am looking for services and specialists.</p>
                            </div>
                            <div 
                                onClick={() => setIsExpert(true)}
                                className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${isExpert ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                            >
                                <ShieldCheck className={`w-12 h-12 mb-4 ${isExpert ? 'text-purple-400' : 'text-gray-400'}`} />
                                <h4 className="text-xl font-bold">Specialist / Expert</h4>
                                <p className="text-sm text-gray-400 mt-2">I want to offer my services to clients.</p>
                            </div>
                        </div>
                        <div className="pt-8">
                             <button onClick={nextStep} className="glow-button w-full py-5 text-xl flex items-center justify-center gap-2">
                                Continue <ArrowRight className="w-6 h-6" />
                             </button>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                        <div className="group relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input 
                                type="text" placeholder="Full Name" className="premium-input pl-14 py-5" 
                                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>
                        <div className="group relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input 
                                type="email" placeholder="Email Address" className="premium-input pl-14 py-5" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="group relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input 
                                type="password" placeholder="Password" className="premium-input pl-14 py-5" 
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4 pt-8">
                            <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-5 h-5" /> Back
                            </button>
                            <button onClick={isExpert ? nextStep : handleRegister} className="flex-[2] glow-button py-5 text-xl">
                                {isExpert ? 'Next Step' : (isLoading ? 'Creating...' : 'Register Now')}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                        <div>
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 block">Professional Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {services.map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => {
                                            const ids = formData.serviceIds.includes(s.id) 
                                                ? formData.serviceIds.filter(id => id !== s.id)
                                                : [...formData.serviceIds, s.id];
                                            setFormData({...formData, serviceIds: ids});
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${formData.serviceIds.includes(s.id) ? 'bg-purple-500 text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:border-purple-500/50'}`}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="premium-input-group">
                                <label className="text-xs text-gray-500 ml-2">Birth Year</label>
                                <select 
                                    className="premium-input py-3" 
                                    value={formData.birthYear} onChange={e => setFormData({...formData, birthYear: parseInt(e.target.value)})}
                                >
                                    {Array.from({length: 50}, (_, i) => 2010 - i).map(y => <option key={y} value={y} className="bg-[#020205]">{y}</option>)}
                                </select>
                            </div>
                            <div className="premium-input-group">
                                <label className="text-xs text-gray-500 ml-2">Gender</label>
                                <select 
                                    className="premium-input py-3"
                                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="Male" className="bg-[#020205]">Male</option>
                                    <option value="Female" className="bg-[#020205]">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="premium-input-group">
                            <label className="text-xs text-gray-500 ml-2">Education Level</label>
                            <div className="flex gap-3">
                                <GraduationCap className="text-purple-400 w-6 h-6 mt-3" />
                                <select className="premium-input py-3" value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})}>
                                    <option value="Bachelor" className="bg-[#020205]">Bachelor Degree</option>
                                    <option value="Master" className="bg-[#020205]">Master Degree</option>
                                    <option value="PhD" className="bg-[#020205]">PhD / Doctorate</option>
                                    <option value="DS" className="bg-[#020205]">Docent / Professor</option>
                                    <option value="Middle" className="bg-[#020205]">Secondary / Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="group relative">
                            <Briefcase className="absolute left-5 top-14 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <label className="text-xs text-gray-500 ml-2">Current Workplace</label>
                            <input 
                                type="text" placeholder="Company or Institution" className="premium-input pl-14 py-4" 
                                value={formData.workplace} onChange={e => setFormData({...formData, workplace: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-5 h-5" /> Back
                            </button>
                            <button onClick={nextStep} className="flex-[2] glow-button py-5 text-xl">
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Profile Photo</label>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all group">
                                    {formData.profilePictureUrl ? (
                                        <img src={`https://backend.joida.uz${formData.profilePictureUrl}`} className="w-full h-full object-cover rounded-3xl" alt="Profile" />
                                    ) : (
                                        <>
                                          <Camera className="w-10 h-10 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                          <span className="text-xs text-gray-500 mt-3 font-bold group-hover:text-white transition-colors">Select Image</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'profilePictureUrl')} />
                                </label>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Diploma / Cert</label>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all group">
                                    {formData.diplomaUrl ? (
                                        <div className="flex flex-col items-center text-purple-400">
                                            <FileText className="w-10 h-10" />
                                            <span className="text-[10px] mt-2 font-bold uppercase">Uploaded</span>
                                        </div>
                                    ) : (
                                        <>
                                          <FileText className="w-10 h-10 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                          <span className="text-xs text-gray-500 mt-3 font-bold group-hover:text-white transition-colors">Select PDF/IMG</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'diplomaUrl')} />
                                </label>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <MapPin className="text-purple-400 w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold">Service Location</h5>
                                    <p className="text-xs text-gray-500">{formData.locationName || 'Detecting...'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.geolocation.getCurrentPosition((pos) => {
                                        setFormData({...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude, locationName: 'Current Location Verified'});
                                    });
                                }}
                                className="px-5 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                            >
                                Get GPS
                            </button>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={prevStep} className="flex-1 py-5 border border-white/10 rounded-2xl hover:bg-white/5 transition-all text-gray-400 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-5 h-5" /> Back
                            </button>
                            <button onClick={handleRegister} disabled={isLoading} className="flex-[2] glow-button py-5 text-xl">
                                {isLoading ? 'Finalizing...' : 'Register as Specialist'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 text-center">
                 <button onClick={onBackToLogin} className="text-gray-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                    <LogIn className="w-4 h-4" /> Already have an account? Login
                 </button>
            </div>
        </div>
    </div>
  );
};

export default RegisterPage;
