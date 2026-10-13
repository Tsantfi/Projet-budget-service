import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profil() {
  const { user, updateSession } = useAuth();
  const [immatricule, setImmatricule] = useState(user?.immatricule || "");
  const [nom, setNom] = useState(user?.nom || "");
  const [prenom, setPrenom] = useState(user?.prenom || "");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motPasse, setMotPasse] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.immatricule) return;
    client.get(`/auth/me?immatricule=${user.immatricule}`)
      .then((res) => {
        setImmatricule(res.data.immatricule || "");
        setNom(res.data.nom || "");
        setPrenom(res.data.prenom || "");
        setEmail(res.data.email || "");
        setTelephone(res.data.telephone || "");
      })
      .catch(() => setError("Impossible de charger les informations du profil."))
      .finally(() => setLoading(false));
  }, [user?.immatricule]);

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-haigana-dark mb-1";

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await client.put(`/comptes/profil/${user.immatricule}`, {
        immatricule, nom, prenom, email, telephone, motPasse: motPasse || null,
      });
      updateSession(data);
      setMessage(
        immatricule !== user.immatricule
          ? "Profil mis a jour. Votre nouvel immatricule de connexion est : " + data.immatricule
          : "Profil mis a jour avec succes."
      );
      setMotPasse("");
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la mise a jour du profil.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-haigana-dark mb-6">Mon profil</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-haigana-blue text-white flex items-center justify-center text-xl font-semibold">
            {prenom?.[0]}{nom?.[0]}
          </div>
          <p className="text-sm text-gray-500">{user?.role}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Immatricule (identifiant de connexion)</label>
            <input value={immatricule} onChange={(e) => setImmatricule(e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">
              Attention : changer cette valeur modifie votre identifiant de connexion.
            </p>
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prenom</label>
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telephone</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Nouveau mot de passe (optionnel)</label>
            <input type="password" value={motPasse} onChange={(e) => setMotPasse(e.target.value)} className={inputClass} placeholder="Laisser vide pour ne pas changer" />
          </div>
        </div>

        {message && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{message}</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}