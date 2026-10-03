/**
 * User Profile & Preference Slice for state management
 */
export const userSlice = {
  initialState: {
    profile: null,
    preferences: {
      theme: 'dark',
      notifications: true
    }
  }
};

export default userSlice;
