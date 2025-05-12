import { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '@services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already logged in
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Google OAuth login handler
  const handleGoogleLogin = async () => {
    try {
      // Use the authService to get the Google Auth URL
      const authUrl = await authService.getGoogleAuthUrl();
      
      // Redirect to the Google Auth URL
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initialize Google login');
      console.error('Google login error:', error);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      
      if (token && location.pathname === '/auth/callback') {
        try {
          setLoading(true);
          // Use authService to handle the OAuth callback
          const userData = await authService.handleOAuthCallback(token);
          setUser(userData);
          toast.success('Successfully logged in!');
          navigate('/');
        } catch (error) {
          toast.error('Authentication failed');
          console.error('Auth callback error:', error);
          navigate('/login');
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [location, navigate]);

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Email/password login handler
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const userData = await authService.login(credentials);
      setUser(userData);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Let the form handle the error
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const newUser = await authService.register(userData);
      setUser(newUser);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Let the form handle the error
    } finally {
      setLoading(false);
    }
  };

  // Value object with auth state and methods
  const authValue = {
    user,
    loading,
    isAuthenticated: !!user,
    handleLogin,
    handleRegister,
    handleGoogleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};