import React, { useState } from 'react';
import './forgotpassword.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const WEBSITE_URL="http://192.168.100.100:5000"


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(WEBSITE_URL + '/forgot-password',{method:"POST",
                              headers:{"Content-Type":"application/json"},
                              body:JSON.stringify({userinput:email})
    });
    if(!res.ok){
      console.warn("server respond with status, ",res.ok);
      const errorData=await res.json();
      if(errorData.missing){
        console.log("Error missing field,",errorData.missing);
        setMessage("Error missing field"+errorData.missing);
        setMessageType("error");
        setEmail("");
        setTimeout(()=>{
          setMessage("");
          setMessageType("");
          setIsLoading(false);
      },3000)
      }else{
        setMessage(errorData.message||"Error occured");
        setMessageType("error");
        setEmail("");
        setTimeout(()=>{
          setMessage("");
          setMessageType("");
          setIsLoading(false);
      },3000)
      }
      return ;
    }
    const data=await res.json();
    console.log("success check your email to complete password reset, ",data.message);
    setMessage(`Recovery link has been sent to ${email}`+data.message);
    setMessageType('success');
    setEmail("");
    setTimeout(()=>{
      setMessage("");
      setMessageType("");
      setIsLoading(false);
      setEmail("");
  },3000)
    } catch (error) {
      console.error("Error while connecting to the server",error);
      setMessage("Error occured while trying to communicating to the server, ",error);
      setMessageType("error");
      setEmail("");
      setTimeout(()=>{
        setMessage("");
        setMessageType("");
        setIsLoading(false);
    },3000)
    }finally{
      setIsLoading(false);
    }
  };

 if (!isOpen) return null;

  return (
    <div className="modal-overlay" >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-btn" 
        onClick={onClose}
        >&times;</button>

        <div className="modal-header">
          <h2>Forgot Password</h2>
          <p>Enter your username or email to reset your password</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Username or Email <span style={{ color: '#ff0000' }}>*</span>
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or Email"
              required
            />
          </div>

          {message && (
            <p style={{ 
              textAlign: 'center', 
              fontSize: '13px', 
              fontWeight: 'bold',
              color: messageType === 'success' ? '#1a6aa2' : '#e53e3e',
              marginBottom: '15px'
            }}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Recovery Link'}
          </button>
        </form>

        <div className="modal-footer">
          Remember your password? 
          <button className="back-link" 
          onClick={onClose}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;