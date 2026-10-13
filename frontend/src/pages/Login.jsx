import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [immatricule, setImmatricule] = useState("");
  const [motPasse, setMotPasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(immatricule, motPasse);

      navigate("/accueil");
    } catch (err) {
      setError("Matricule ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }
//https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(44,57,71,0.75), rgba(44,57,71,0.85)), url('/images.jpg')",
      }}
    >
      <div className="w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 animate-in">
        <div className="flex flex-col items-center mb-6">
          <div className="w-38 h-20 flex items-center justify-center">
            <img
              src="/Haigana2.png"
              alt="Haigana"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs text-haigana-blue mt-1 text-center">
            DRBF — Service Regional du Budget Boeny
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">Matricule</label>
            <input
              type="text"
              required
              value={immatricule}
              onChange={(e) => setImmatricule(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all"
              placeholder="xxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={motPasse}
                onChange={(e) => setMotPasse(e.target.value)}
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-haigana-blue transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.6 9.6 0 0112 5c5 0 9 4 10 7-.3 1-1 2.2-2 3.3M6.5 6.6C4.6 7.9 3.2 9.7 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.7"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Valider"}
          </button>
        </form>
      </div>
    </div>
  );
}
