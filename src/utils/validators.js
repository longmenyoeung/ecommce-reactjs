/**
 * Form and input validation helper functions
 */
export const validators = {
  isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPhone: (phone) => /^[+\d\s()-]{7,15}$/.test(phone),
  isValidPassword: (pass) => pass && pass.length >= 6
};

export default validators;
