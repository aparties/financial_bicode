"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, TrendingUp, AlertCircle, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginToast = toast.loading("Validando credenciales...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error inesperado.");
      }

      toast.success("¡Acceso concedido!", { id: loginToast });
      
      // Delay redirect slightly to show success message
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Error al iniciar sesión", { id: loginToast });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b241c] flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="bottom-right" />

      {/* Background glowing gradients (matching dashboard aesthetics) */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#57cc99]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#80ed99]/3 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-[#143028] border border-[#57cc99]/20 p-4 rounded-3xl text-[#57cc99] shadow-xl mb-4 group hover:border-[#57cc99]/40 transition-all duration-300">
            <TrendingUp className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-[#57cc99] font-bold text-[10px] tracking-[0.25em] uppercase">
            Bicode Control Premium
          </span>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mt-1">
            Dashboard Financiero
          </h1>
          <p className="text-xs text-[#a8b5b0] mt-2 max-w-xs">
            Ingresa tu clave de acceso y contraseña para acceder a la analítica de activos y pasivos.
          </p>
        </div>

        {/* Glassmorphic Card Form */}
        <div className="bg-[#143028]/80 backdrop-blur-xl border border-[#57cc99]/15 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#57cc99] to-[#80ed99]" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl p-4 flex items-start gap-3 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold">Error de acceso:</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Username/Key Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-[#a8b5b0] block ml-1">
                Clave de Acceso (Usuario)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a8b5b0]/60 group-focus-within:text-[#57cc99] transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="username"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. admin"
                  className="w-full bg-[#0b241c] border border-[#1d4034] text-white text-sm rounded-full pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99]/20 placeholder-[#a8b5b0]/35 transition-all duration-300 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-[#a8b5b0] block ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#a8b5b0]/60 group-focus-within:text-[#57cc99] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b241c] border border-[#1d4034] text-white text-sm rounded-full pl-11 pr-12 py-3.5 focus:outline-none focus:border-[#57cc99] focus:ring-1 focus:ring-[#57cc99]/20 placeholder-[#a8b5b0]/35 transition-all duration-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#a8b5b0]/60 hover:text-[#57cc99] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#57cc99] hover:bg-[#80ed99] text-[#0b241c] font-black text-sm rounded-full py-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#57cc99]/10"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0b241c]/20 border-t-[#0b241c] rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Acceder al Dashboard</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#a8b5b0]/40 mt-6 tracking-wide">
          Bicode Control Premium &copy; {new Date().getFullYear()}. Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}
