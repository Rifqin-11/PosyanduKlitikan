import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const authSchema = z.object({
  login: z.string().min(3, "Masukkan username atau email"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp, resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({ resolver: zodResolver(authSchema) });

  const handleForgotPassword = async () => {
    const loginValue = getValues("login");

    if (!loginValue.includes("@")) {
      // Username → cari email
      const { data, error } = await supabase
        .from("users") // pastikan `users` ada dan punya kolom username+email
        .select("email")
        .eq("username", loginValue)
        .single();

      if (error || !data?.email) {
        setError("Username tidak ditemukan.");
        return;
      }

      const { error: resetError } = await resetPassword(data.email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Link reset kata sandi dikirim ke email.");
      }
    } else {
      // Langsung pakai email
      const { error } = await resetPassword(loginValue);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Link reset kata sandi dikirim ke email.");
      }
    }
  };

  const { getValues } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const loginInput = data.login.trim();
      const isEmail = loginInput.includes("@");
      let emailToUse = loginInput;

      if (!isEmail) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("email")
          .eq("username", loginInput)
          .single();

        if (error || !userData?.email) {
          setError("Username tidak ditemukan.");
          return;
        }

        emailToUse = userData.email;
      }

      const { error } = isLogin
        ? await signIn(emailToUse, data.password)
        : await signUp(emailToUse, data.password);

      if (error) {
        setError(error.message);
      } else if (!isLogin) {
        setSuccess("Silakan periksa email Anda untuk tautan konfirmasi.");
      }
    } catch {
      setError("Terjadi kesalahan saat memproses permintaan Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
            {isLogin ? "Selamat Datang Kembali" : "Buat Akun"}
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm">
            {isLogin
              ? "Masuk untuk mengakses Manajemen Posyandu"
              : "Daftar untuk mulai menggunakan Manajemen Posyandu"}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="login"
                className="text-sm font-medium text-slate-700"
              >
                Email atau Username
              </Label>
              <Input
                id="login"
                placeholder="contoh: ibu123 atau ibu@mail.com"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                {...register("login")}
                disabled={loading}
              />
              {errors.login && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.login.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Kata Sandi
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi Anda"
                className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                {...register("password")}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 underline mt-1"
                >
                  Lupa kata sandi?
                </button>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Sedang masuk..." : "Membuat akun..."}
                </>
              ) : isLogin ? (
                "Masuk"
              ) : (
                "Daftar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                disabled={loading}
              >
                {isLogin ? "Daftar" : "Masuk"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
