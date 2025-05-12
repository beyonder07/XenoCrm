import * as Yup from 'yup';

/**
 * Email validation regex pattern
 */
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Indian phone number regex pattern
 * Validates formats like +91 9876543210, +919876543210, 09876543210, 9876543210
 */
export const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

/**
 * URL validation regex pattern
 */
export const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Validate if a string is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate if a string is a valid Indian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  return PHONE_REGEX.test(phone);
};

/**
 * Validate if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url) => {
  return URL_REGEX.test(url);
};

/**
 * Validate if a string contains only alphanumeric characters
 * @param {string} str - String to validate
 * @returns {boolean} Whether the string is alphanumeric
 */
export const isAlphanumeric = (str) => {
  return /^[a-zA-Z0-9]*$/.test(str);
};

/**
 * Validate if a value is a valid date
 * @param {string|Date} date - Date to validate
 * @returns {boolean} Whether the date is valid
 */
export const isValidDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * Yup validation schema for customer form
 */
export const customerSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less'),
  email: Yup.string()
    .required('Email is required')
    .matches(EMAIL_REGEX, 'Invalid email address'),
  phone: Yup.string()
    .matches(PHONE_REGEX, 'Invalid phone number')
    .nullable(),
  location: Yup.string()
    .max(100, 'Location must be 100 characters or less')
    .nullable(),
  isActive: Yup.boolean()
});

/**
 * Yup validation schema for campaign form
 */
export const campaignSchema = Yup.object({
  name: Yup.string()
    .required('Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must be 100 characters or less'),
  message: Yup.string()
    .required('Message is required')
    .max(500, 'Message must be 500 characters or less'),
  segmentId: Yup.string()
    .when('customRules', {
      is: (val) => !val || val.conditions?.length === 0,
      then: Yup.string().required('Segment or custom rules required')
    }),
  scheduledDate: Yup.date()
    .nullable()
    .min(new Date(), 'Scheduled date must be in the future')
});

/**
 * Yup validation schema for segment form
 */
export const segmentSchema = Yup.object({
  name: Yup.string()
    .required('Segment name is required')
    .min(3, 'Segment name must be at least 3 characters')
    .max(100, 'Segment name must be 100 characters or less'),
  description: Yup.string()
    .max(500, 'Description must be 500 characters or less')
});

/**
 * Yup validation schema for login form
 */
export const loginSchema = Yup.object({
  email: Yup.string()
    .required('Email is required')
    .matches(EMAIL_REGEX, 'Invalid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
});

/**
 * Validate a MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Whether the ID is a valid ObjectId
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};