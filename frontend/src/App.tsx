// Joyida Platform: FINAL DEPLOYMENT PUSH - VERIFIED CONFIG
import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Lazy load feature pages for optimal performance
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const Onboarding = lazy(() => import('./features/auth/Onboarding'));
const PreferenceSelection = lazy(() => import('./features/auth/PreferenceSelection'));
const ProfileSetup = lazy(() => import('./features/auth/ProfileSetup'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage'));
const ProjectsPage = lazy(() => import('./features/projects/ProjectsPage'));
const ClientExplorePage = lazy(() => import('./features/client/ClientExplorePage'));
const ReelsFeedPage = lazy(() => import('./features/client/ReelsFeedPage'));
const ClientProfilePage = lazy(() => import('./features/client/ClientProfilePage'));
const MessagesPage = lazy(() => import('./features/client/MessagesPage'));
const PublicProfilePage = lazy(() => import('./features/client/PublicProfilePage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const ToastContainer = lazy(() => import('./features/notifications/ToastContainer'));

const LoadingScreen = () => (
  <div className="w-full h-[100dvh] bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<number | null>(null);
  const [sharedReelHash, setSharedReelHash] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Deep linking handler: check URL for shared reels
  useEffect(() => {
    const path = window.location.pathname;
    const reelMatch = path.match(/^\/reels\/([a-zA-Z0-9]+)/);
    if (reelMatch && reelMatch[1]) {
      setSharedReelHash(reelMatch[1]);
      setCurrentPage('reels');
    }
  }, []);

  // Determine initial page based on authentication and roles
  useEffect(() => {
    // If we have a shared reel link via URL, don't override it with default pages
    if (sharedReelHash) {
      setCurrentPage('reels');
      return;
    }

    if (isAuthenticated && user && !currentPage) {
       if (user.is_superuser) {
         setCurrentPage('admin');
       } else if (user.is_expert) {
         setCurrentPage('dashboard');
       } else {
         setCurrentPage('explore');
       }
    }
  }, [isAuthenticated, user, currentPage, sharedReelHash]);

  useEffect(() => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('user-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // If user is already authenticated, skip onboarding/preferences flows entirely.
    // These screens are only for new/first-time visitors.
    if (isAuthenticated) {
      // Ensure flags are set so they won't appear after logout→login either
      localStorage.setItem('preferences_seen', 'true');
      localStorage.setItem('onboarding_seen', 'true');
      return;
    }

    const prefsSeen = localStorage.getItem('preferences_seen');
    if (!prefsSeen) {
      setShowPreferences(true);
    } else {
      const onboardSeen = localStorage.getItem('onboarding_seen');
      if (!onboardSeen) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated]);

  // Check profile completion for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const isDismissed = localStorage.getItem('profile_setup_dismissed');
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
    localStorage.setItem('profile_setup_dismissed', 'true');
    setShowProfileSetup(false);
    // In a real app, the user object would be updated via API and store
  };

  if (!isAuthenticated && !sharedReelHash) {
    return (
      <GoogleOAuthProvider clientId="596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com">
        <Suspense fallback={<LoadingScreen />}>
          <div className="App">
            {showRegister ? (
              <RegisterPage onBackToLogin={() => setShowRegister(false)} />
            ) : (
              <LoginPage onRegister={() => setShowRegister(true)} />
            )}
            <ToastContainer />
          </div>
        </Suspense>
      </GoogleOAuthProvider>
    );
  }

  // Authenticated user flows or Public Deep Link flow
  if (showPreferences && !sharedReelHash) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <PreferenceSelection onFinish={handleFinishPreferences} />
      </Suspense>
    );
  }

  if (showOnboarding && !sharedReelHash) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Onboarding onFinish={handleFinishOnboarding} />
      </Suspense>
    );
  }

  if (showProfileSetup && !sharedReelHash) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <ProfileSetup onFinish={handleFinishProfileSetup} />
      </Suspense>
    );
  }

  return (
    <GoogleOAuthProvider clientId="596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com">
      <Suspense fallback={<LoadingScreen />}>
        <div className="App">
          {currentPage ? (
            <DashboardLayout 
              onNavigate={(page) => {
                setCurrentPage(page);
                if (page !== 'reels') setSharedReelHash(null);
                if (page !== 'expert_profile') setSelectedExpertId(null);
              }} 
              currentPage={currentPage}
            >
              {currentPage === 'dashboard' && <DashboardPage />}
              {currentPage === 'projects' && <ProjectsPage />}
              {currentPage === 'explore' && <ClientExplorePage />}
              {currentPage === 'reels' && (
                <ReelsFeedPage 
                  initialReelHash={sharedReelHash} 
                  onViewExpert={(id) => {
                    setSelectedExpertId(id);
                    setCurrentPage('expert_profile');
                  }}
                />
              )}
              {currentPage === 'messages' && <MessagesPage />}
              {currentPage === 'profile' && <ClientProfilePage />}
              {currentPage === 'expert_profile' && selectedExpertId && (
                <PublicProfilePage 
                  expertId={selectedExpertId} 
                  onBack={() => setCurrentPage('reels')}
                  onNavigate={(page) => {
                    setCurrentPage(page);
                    setSelectedExpertId(null);
                  }}
                />
              )}
              {currentPage === 'admin' && <AdminLayout />}
            </DashboardLayout>
          ) : (
            <LoadingScreen />
          )}
          <ToastContainer />
        </div>
      </Suspense>
    </GoogleOAuthProvider>
  );

}

export default App;
