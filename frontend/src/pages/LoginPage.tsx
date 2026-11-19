import { Link } from "react-router";
import {
  ArrowRight,
  GraduationCap,
  Users,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type LoginFormData,
} from "../features/auth/schemas/login.schema";
import { loginUser } from "../services/auth.service";
import axios from "axios";
import { useState } from "react";

function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage("");
    try {
      const response = await loginUser(data);
      console.log("Zalogowano użytkownika:", response.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage("Nieprawidłowy adres e-mail lub hasło");
        } else {
          setErrorMessage("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
        }
      } else {
        setErrorMessage("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0d17] text-white lg:grid lg:grid-cols-2">
      {/* Lewa strona - branding */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#121525] p-12 lg:flex">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

        <Link to="/login" className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
            <GraduationCap size={25} />
          </div>
          <span className="text-2xl font-bold tracking-tight">UniHub</span>
        </Link>

        <div className="relative z-10 mx-auto max-w-lg text-center">
          <div className="relative mx-auto mb-10 flex h-72 w-72 items-center justify-center rounded-full border border-violet-400/20 bg-linear-to-br from-violet-500/20 to-blue-500/10 shadow-2xl shadow-violet-950/50">
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <div className="absolute inset-16 rounded-full border border-white/10" />

            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-linear-to-br from-violet-500 to-blue-600 shadow-2xl shadow-violet-900/50">
              <GraduationCap size={64} strokeWidth={1.5} />
            </div>

            <div className="absolute -right-4 top-12 rounded-2xl border border-white/10 bg-[#20243a] p-4 shadow-xl">
              <Users size={25} className="text-blue-400" />
            </div>

            <div className="absolute -bottom-2 left-0 rounded-2xl border border-white/10 bg-[#20243a] p-4 shadow-xl">
              <Sparkles size={25} className="text-violet-400" />
            </div>
          </div>

          <h1 className="mb-5 text-4xl font-bold leading-tight">
            Your university life,
            <span className="block bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              connected.
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-gray-400">
            Poznawaj ludzi, rozwijaj swoje pomysły i twórz coś wyjątkowego razem
            ze społecznością studentów.
          </p>
        </div>

        <p className="relative z-10 text-sm text-gray-500 text-center">
          © 2026 UniHub. Connect. Learn. Build.
        </p>
      </section>

      {/* Prawa strona - formularz */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600">
                <GraduationCap size={25} />
              </div>
              <span className="text-2xl font-bold">UniHub</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">
              Witaj ponownie!
            </h2>
            <p className="text-gray-400">
              Zaloguj się i wróć do swojej społeczności.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Adres e-mail
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="student@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#171b2e] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Hasło
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Wpisz swoje hasło"
                  className="w-full rounded-xl border border-white/10 bg-[#171b2e] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-blue-600 py-3.5 font-semibold transition hover:brightness-110"
            >
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Nie masz jeszcze konta?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-400 hover:text-violet-300"
            >
              Zarejestruj się
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
