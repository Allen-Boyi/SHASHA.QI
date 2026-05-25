import { useState, useEffect } from 'react'
import './App.css'
import IQHubSplash from './IQHubSplash';
import AuthForm from './authForm';
import AdminLayout from './adminLayout'
import ResetPasswordModal from './resetpassword'

function App() {
  // Store both user and step together in one state object so they
  // update atomically in a single render — eliminates the React 17
  // double-render window where currentstep === 'admin' but user is
  // still null (or vice-versa), which caused AuthForm to stay visible.
  const [appState, setAppState] = useState({
    step: 'loading',
    user: null,
  });

  useEffect(() => {
    if (window.location.pathname.includes('reset-password')) {
      setAppState({ step: 'resetpassword', user: null });
    } else {
      setAppState({ step: 'splash', user: null });
    }
  }, []);

  const handleSplashComplete = () =>
    setAppState({ step: 'auth', user: null });

  const handleLoginSuccess = (userData) => {
    console.log('[App] handleLoginSuccess fired, userData:', userData);
    // Single setState → single render → step and user change together
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