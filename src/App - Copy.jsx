import { useState, useEffect } from 'react'
import './App.css'
import IQHubSplash from './IQHubSplash';
import AuthForm from './authForm';
import AdminLayout from './adminLayout'
import ResetPasswordModal from './resetpassword'

function App() {
  const [user, setUser] = useState(null);
  // Change default to null or 'loading'
  const [currentstep, setCurrentStep] = useState('loading'); 

  useEffect(() => {
    // Check if the URL contains 'reset-password'
    if (window.location.pathname.includes('reset-password')) {
      setCurrentStep('resetpassword');
    } else {
      setCurrentStep('splash');
    }
  }, []);

  const handleSplashComplete = () => setCurrentStep('auth');
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentStep("admin");
  };
  const onLogout = () => {
    setUser(null);
    setCurrentStep("auth");
  };
  const handleResetPasswordSuccess = () => setCurrentStep("auth");

// REPLACE WITH THIS NEW SECTION:
return (
  <div className="App"> 
    {currentstep === 'splash' && <IQHubSplash onComplete={handleSplashComplete} />}
    {currentstep === 'auth' && <AuthForm onLoginSuccess={handleLoginSuccess} />}
    
    {/* This new wrapper below fixes the mobile layout issues */}
    {currentstep === 'admin' && user && (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AdminLayout user={user} onLogout={onLogout} />
      </div>
    )}
    
    {currentstep === "resetpassword" && (
      <ResetPasswordModal 
        onSuccess={handleResetPasswordSuccess} 
        onClose={() => setCurrentStep('auth')} 
      />
    )}
  </div>
);
}
export default App