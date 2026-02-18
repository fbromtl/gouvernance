import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (profile && !profile.cgu_accepted && location.pathname !== "/conditions") {
    return <Navigate to="/conditions" replace />;
  }

  // Redirect to onboarding if user has no organization
  if (
    profile &&
    profile.cgu_accepted &&
    !profile.organization_id &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
