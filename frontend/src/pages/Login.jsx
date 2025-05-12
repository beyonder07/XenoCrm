import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '@hooks/useAuth';
import EmailLoginForm from '@components/auth/EmailLoginForm';
import GoogleLoginButton from '@components/auth/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, handleGoogleLogin } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await handleGoogleLogin();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  if (loading) return null; // Don't render until auth state is determined

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
      </div>
      
      <motion.div
        className="relative max-w-md w-full mx-auto px-8 py-12 bg-white rounded-2xl shadow-soft"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center mb-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <svg 
              className="mx-auto h-16 w-auto text-primary-600" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AuraCRM
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-600">
            Sign in to access your customer data and campaigns
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <GoogleLoginButton onClick={handleGoogleSignIn} />
          </motion.div>

          <motion.div variants={itemVariants} className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <EmailLoginForm />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-500">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;