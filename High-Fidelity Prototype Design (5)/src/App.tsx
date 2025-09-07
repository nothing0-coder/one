import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import MainApp from './components/MainApp';
import AuthPage from './components/AuthPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in, show the app
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        {currentView === 'landing' ? (
          <LandingPage onEnterApp={() => setCurrentView('app')} />
        ) : (
          <MainApp onBackToLanding={() => setCurrentView('landing')} />
        )}
      </div>
    );
  }

  // If no user, show auth page
  return <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}