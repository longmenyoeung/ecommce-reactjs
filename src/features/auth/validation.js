import validators from '../../utils/validators';

/**
 * Auth Feature Validation Rules
 */
export const authValidation = {
  validateLogin: (email, password) => {
    const errors = {};
    if (!validators.isValidEmail(email)) errors.email = 'Valid email is required';
    if (!validators.isValidPassword(password)) errors.password = 'Password must be at least 6 characters';
    return errors;
  },
  validateRegister: (name, email, password) => {
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!validators.isValidEmail(email)) errors.email = 'Valid email is required';
    if (!validators.isValidPassword(password)) errors.password = 'Password must be at least 6 characters';
    return errors;
  }
};

export default authValidation;
