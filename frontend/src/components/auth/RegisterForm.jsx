import { useState } from 'react';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import useAuth from '@hooks/useAuth';

// Validation schema for registration
const registerSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  passwordConfirm: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleRegister } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await handleRegister(values);
      } catch (error) {
        // Error is handled by the API interceptor
        console.error('Registration error:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <motion.form
      onSubmit={formik.handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              formik.touched.name && formik.errors.name
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            {...formik.getFieldProps('name')}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              formik.touched.email && formik.errors.email
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              formik.touched.password && formik.errors.password
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            {...formik.getFieldProps('password')}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
          Confirm password
        </label>
        <div className="mt-1">
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            className={`appearance-none block w-full px-3 py-2 border ${
              formik.touched.passwordConfirm && formik.errors.passwordConfirm
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
            {...formik.getFieldProps('passwordConfirm')}
          />
          {formik.touched.passwordConfirm && formik.errors.passwordConfirm && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.passwordConfirm}</p>
          )}
        </div>
      </div>

      <div>
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Create account'
          )}
        </motion.button>
      </div>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.form>
  );
};

export default RegisterForm; 