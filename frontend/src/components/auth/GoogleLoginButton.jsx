import { motion } from 'framer-motion';

/**
 * Google sign-in button component with animation
 * @param {Object} props Component props
 * @param {Function} props.onClick Click handler function
 * @param {Boolean} props.isLoading Loading state
 */
const GoogleLoginButton = ({ onClick, isLoading = false }) => {
  return (
    <motion.button
      className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      onClick={onClick}
      disabled={isLoading}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      data-testid="google-login-button"
    >
      {isLoading ? (
        <svg className="h-5 w-5 animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
        </svg>
      )}
      <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
    </motion.button>
  );
};

export default GoogleLoginButton;