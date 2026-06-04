/**
 * Returns the dashboard route for a given user role.
 * @param {string} role - 'seller' | 'creator'
 * @returns {string} route path
 */
export function redirectByRole(role) {
  switch (role) {
    case 'seller':
      return '/dashboard/seller';
    case 'creator':
      return '/dashboard/creator';
    default:
      return '/login';
  }
}
