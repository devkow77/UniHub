import { useProfile } from "../features/profile/hooks/useProfile";
import { GraduationCap, Mail, User } from "lucide-react";
import Navbar from "../components/layout/Navbar";

function ProfilePage() {
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d17] text-gray-400">
        Ładowanie profilu...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d17] text-red-400">
        Nie udało się pobrać profilu.
      </div>
    );
  }

  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0b0d17] px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#171b2e]">
            <div className="h-48 bg-linear-to-r from-violet-600/60 via-blue-600/40 to-violet-500/30" />

            <div className="px-8 pb-8">
              <div className="-mt-16 mb-6 flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-[#171b2e] bg-linear-to-br from-violet-500 to-blue-600 text-4xl font-bold shadow-xl">
                {initials || <User size={48} />}
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>

                <p className="mt-2 text-gray-400">@{user.username}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#20243a] p-4">
                  <Mail className="text-violet-400" size={22} />
                  <div>
                    <p className="text-xs text-gray-500">Adres e-mail</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#20243a] p-4">
                  <GraduationCap className="text-blue-400" size={22} />
                  <div>
                    <p className="text-xs text-gray-500">Rola</p>
                    <p className="text-sm">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProfilePage;
