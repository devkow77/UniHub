import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";

function ProtectedRoute() {
  const { isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d17] text-white">
        <p className="text-gray-400">Sprawdzanie sesji...</p>
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
