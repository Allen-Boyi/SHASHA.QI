import { useState, useEffect } from 'react'
import './App.css'
import IQHubSplash from './IQHubSplash';
import AuthForm from './authForm';
import AdminLayout from './adminLayout'
import ResetPasswordModal from './resetpassword'

function App() {
  // Determine initial screen step directly during state initialization
  // This guarantees the app NEVER renders the splash/login step first if a hash is present
  const getInitialStep = () => {
    if (window.location.hash.includes('reset-password')) {
      return 'resetpassword';
    }
    return 'splash'; // Standard loading process path
  };

  const [appState, setAppState] = useState({
    step: getInitialStep(),
    user: null,
  });

  // Keep a clean hash listener just in case a user navigates around dynamically
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.includes('reset-password')) {
        setAppState({ step: 'resetpassword', user: null });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSplashComplete = () =>
    setAppState({ step: 'auth', user: null });

  const handleLoginSuccess = (userData) => {
    console.log('[App] handleLoginSuccess fired, userData:', userData);
    setAppState({ step: 'admin', user: userData });
  };

  const onLogout = () =>
    setAppState({ step: 'auth', user: null });

  const handleResetPasswordSuccess = () =>
    setAppState({ step: 'auth', user: null });

  const { step, user } = appState;

  return (
    <div className="App">
      {step === 'splash' && (
        <IQHubSplash onComplete={handleSplashComplete} />
      )}

      {step === 'auth' && (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}

      {step === 'admin' && user && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AdminLayout user={user} onLogout={onLogout} />
        </div>
      )}

      {step === 'resetpassword' && (
        <ResetPasswordModal
          onSuccess={handleResetPasswordSuccess}
          onClose={() => setAppState({ step: 'auth', user: null })}
        />
      )}
    </div>
  );
}

export default App;
