import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '@context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

/**
 * Login form component with Google OAuth
 */
const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleGoogleLogin } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await handleGoogleLogin();
      // Note: The page will redirect, so we don't need to setIsLoading(false)
      // But we'll add a timeout just in case something goes wrong with the redirect
      setTimeout(() => setIsLoading(false), 5000);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-800">Welcome to Xeno CRM</h2>
        <p className="text-gray-600">Sign in to access your dashboard</p>
      </div>

      <div className="space-y-6">
        <GoogleLoginButton onClick={handleLogin} isLoading={isLoading} />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Powered by
            </span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <motion.div
            className="text-center text-sm text-gray-600"
            whileHover={{ scale: 1.05 }}
          >
            Xeno SDE Internship Project
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;