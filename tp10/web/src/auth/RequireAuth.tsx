import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Guards a page. Logged in, it shows `children`. Logged out, it sends to
 * /login, and remembers the page that was asked for in the state of the
 * navigation: the login page comes back to it.
 *
 * It only hides a page. The protection is on the API, which checks the token
 * of every POST: a front can always be bypassed.
 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // replace: the protected page does not stay in the history, "Back" does not loop on it.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};
