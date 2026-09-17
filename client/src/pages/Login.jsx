import React, { useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });
      login(res.data.user);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <Droplet size={48} className="icon-blue" />
          <h1>Water Footprint Calculator</h1>
          <p>Discover the water footprint of your crops and assess regional suitability.</p>
        </div>
        
        <div className="google-btn-wrapper">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            useOneTap
            shape="pill"
            theme="filled_blue"
            size="large"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
