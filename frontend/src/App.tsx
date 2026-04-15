// Joyida Platform: FINAL DEPLOYMENT PUSH - VERIFIED CONFIG
import { useState, useEffect } from 'react';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import Onboarding from './features/auth/Onboarding';
import PreferenceSelection from './features/auth/PreferenceSelection';
import ProfileSetup from './features/auth/ProfileSetup';
import DashboardPage from './features/dashboard/DashboardPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ClientExplorePage from './features/client/ClientExplorePage';
import ReelsFeedPage from './features/client/ReelsFeedPage';
import ClientProfilePage from './features/client/ClientProfilePage';
import MessagesPage from './features/client/MessagesPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ToastContainer from './features/notifications/ToastContainer';
import { useAuthStore } from './store/authStore';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('user-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const prefsSeen = localStorage.getItem('preferences_seen');
    if (!prefsSeen) {
      setShowPreferences(true);
    } else {
      const onboardSeen = localStorage.getItem('onboarding_seen');
      if (!onboardSeen) {
        setShowOnboarding(true);
      }
    }
  }, []);

  // Check profile completion for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const isDismissed = sessionStorage.getItem('profile_setup_dismissed');
      if (!user.profile_completed && !isDismissed) {
        setShowProfileSetup(true);
      } else {
        setShowProfileSetup(false);
      }
    }
  }, [isAuthenticated, user]);
      
  // Enforce default routing based on user role when navigating
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.is_expert && !user.is_superuser && (currentPage === 'dashboard' || currentPage === 'admin')) {
        setCurrentPage('explore');
      } else if (user.is_superuser && (currentPage === 'explore' || currentPage === 'dashboard')) {
        setCurrentPage('admin');
      }
    }
  }, [isAuthenticated, user, currentPage]);

  const handleFinishPreferences = () => {
    localStorage.setItem('preferences_seen', 'true');
    setShowPreferences(false);
    setShowOnboarding(true);
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  const handleFinishProfileSetup = () => {
    sessionStorage.setItem('profile_setup_dismissed', 'true');
    setShowProfileSetup(false);
    // In a real app, the user object would be updated via API and store
  };

  if (showPreferences) {
    return <PreferenceSelection onFinish={handleFinishPreferences} />;
  }

  if (showOnboarding) {
    return <Onboarding onFinish={handleFinishOnboarding} />;
  }

  if (showProfileSetup) {
    return <ProfileSetup onFinish={handleFinishProfileSetup} />;
  }

  return (
    <GoogleOAuthProvider clientId="596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com">
      <div className="App">
        {isAuthenticated ? (
          <DashboardLayout onNavigate={setCurrentPage} currentPage={currentPage}>
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'projects' && <ProjectsPage />}
            {currentPage === 'explore' && <ClientExplorePage />}
            {currentPage === 'reels' && <ReelsFeedPage />}
            {currentPage === 'messages' && <MessagesPage />}
            {currentPage === 'profile' && <ClientProfilePage />}
            {currentPage === 'admin' && <AdminLayout />}
          </DashboardLayout>
        ) : (
          showRegister ? (
            <RegisterPage onBackToLogin={() => setShowRegister(false)} />
          ) : (
            <LoginPage onRegister={() => setShowRegister(true)} />
          )
        )}
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
