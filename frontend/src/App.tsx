import { useState, useEffect } from 'react';
import LoginPage from './features/auth/LoginPage';
import Onboarding from './features/auth/Onboarding';
import PreferenceSelection from './features/auth/PreferenceSelection';
import ProfileSetup from './features/auth/ProfileSetup';
import DashboardPage from './features/dashboard/DashboardPage';
import ProjectsPage from './features/projects/ProjectsPage';
import ExpertExplorer from './features/marketplace/ExpertExplorer';
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
    if (isAuthenticated && user && !user.profile_completed) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, user]);

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
            {currentPage === 'explore' && <ExpertExplorer />}
            {currentPage === 'admin' && <AdminLayout />}
          </DashboardLayout>
        ) : (
          <LoginPage />
        )}
        <ToastContainer />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
