import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

/**
 * Route guard for the /portail section.
 *
 * - Not authenticated  -> redirect to homepage
 * - Authenticated but CGU not accepted -> redirect to /portail/conditions
 * - Authenticated + CGU accepted -> render child routes
 */
export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but CGU not accepted -> redirect to conditions page
  // (unless we're already on the conditions page)
  if (
    profile &&
    !profile.cgu_accepted &&
    location.pathname !== "/portail/conditions"
  ) {
    return <Navigate to="/portail/conditions" replace />;
  }

  return <Outlet />;
}
