import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { GraduationCap, UserRound, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "../../services/auth.service";
import { useAuthStore } from "../../stores/auth.store";

function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMessage("");

    try {
      await logoutUser();

      clearUser();

      queryClient.removeQueries({ queryKey: ["currentUser"] });
      queryClient.removeQueries({ queryKey: ["profile"] });

      navigate("/login", { replace: true });
    } catch {
      setErrorMessage("Nie udało się wylogować. Spróbuj ponownie.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#121525]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/profile" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
            <GraduationCap size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            UniHub
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/profile"
            className="flex items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-violet-400"
          >
            <UserRound size={18} />
            Mój profil
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut size={18} />
            {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
          </button>
        </nav>
      </div>

      {errorMessage && (
        <p className="pb-3 text-center text-sm text-red-400">{errorMessage}</p>
      )}
    </header>
  );
}

export default Navbar;
