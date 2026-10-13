import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LivretForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();

  const modeModification = Boolean(id);

  const [form, setForm] = useState({
    annee: "",
    dateEcriture: "",
  });

  const [anneeEnCours, setAnneeEnCours] = useState(null);

  const [loading, setLoading] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [error, setError] = useState("");


  // VÉRIFICATION DU RÔLE


  useEffect(() => {
    if (!hasRole("ADMINISTRATEUR", "MODIFICATEUR")) {
      navigate("/patrimoine/livret");
    }
  }, [hasRole, navigate]);


  // CHARGEMENT INITIAL


  useEffect(() => {
    chargerDonnees();
  }, [id]);

  async function chargerDonnees() {
    try {
      setChargement(true);
      setError("");

      // Récupération de l'année définie par le backend
      const anneeResponse =
        await client.get("/livrets/annee-en-cours");

      const anneeBackend = anneeResponse.data;

      setAnneeEnCours(anneeBackend);


      // MODE CRÉATION


      if (!modeModification) {
        const aujourdHui = new Date()
          .toISOString()
          .split("T")[0];

        setForm({
          annee: anneeBackend,
          dateEcriture: aujourdHui,
        });

        return;
      }


      // MODE MODIFICATION


      const livretResponse =
        await client.get(`/livrets/${id}`);

      const data = livretResponse.data;

      setForm({
        annee: data.annee ?? "",
        dateEcriture: data.dateEcriture ?? "",
      });

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les données du livret."
      );
    } finally {
      setChargement(false);
    }
  }


  // CHANGEMENT


  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  // ENREGISTREMENT


  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.annee) {
      setError("L'année du livret est obligatoire.");
      return;
    }

    if (!form.dateEcriture) {
      setError("La date d'écriture est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        annee: Number(form.annee),
        dateEcriture: form.dateEcriture,
      };

      if (modeModification) {
        await client.put(
          `/livrets/${id}`,
          payload
        );
      } else {
        await client.post(
          "/livrets",
          payload
        );
      }

      navigate("/patrimoine/livret");

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  }


  // CHARGEMENT


  if (chargement) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">

            <div className="w-10 h-10 border-4 border-slate-200 border-t-haigana-blue rounded-full animate-spin mx-auto" />

            <p className="text-sm text-slate-400 mt-4">
              Chargement du livret...
            </p>

          </div>

        </div>
      </div>
    );
  }


  // AFFICHAGE


  return (
    <div className="min-h-screen bg-slate-50">

      {/*EN-TÊTE*/}

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

            <button
              type="button"
              onClick={() =>
                navigate("/patrimoine/livret")
              }
              className="hover:text-haigana-blue transition-colors"
            >
              Livrets
            </button>

            <span>/</span>

            <span className="text-haigana-dark font-medium">
              {modeModification
                ? "Modifier"
                : "Nouveau"}
            </span>

          </div>

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 4h10l3 3v13H6V4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 9h6M9 13h6M9 17h4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-haigana-dark">
                {modeModification
                  ? "Modifier le livret"
                  : "Nouveau livret"}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                {modeModification
                  ? "Modification des informations du livret."
                  : "Créer un nouveau livret de dépenses."}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/*FORMULAIRE*/}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* HEADER */}
          <div className="px-6 md:px-8 py-5 border-b border-slate-100">

            <h2 className="text-lg font-bold text-haigana-dark">
              Informations du livret
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Renseignez les informations nécessaires.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8"
          >

            {/* ERREUR */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 shrink-0"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M12 8v5M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

                <span>{error}</span>

              </div>
            )}

            <div className="space-y-6">

              {/* ANNÉE */}

              <div>

                <label className="block text-sm font-semibold text-haigana-dark mb-2">
                  Année
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="number"
                  name="annee"
                  value={form.annee}
                  onChange={handleChange}
                  disabled={modeModification}
                  className={`w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all ${
                    modeModification
                      ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                      : "bg-white text-haigana-dark focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/10"
                  }`}
                  placeholder="Année"
                />

                {modeModification ? (
                  <p className="text-xs text-slate-400 mt-2">
                    L'année d'un livret existant ne peut pas
                    être modifiée.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">
                    Année courante définie par le système :
                    {" "}
                    <span className="font-semibold text-haigana-dark">
                      {anneeEnCours}
                    </span>
                  </p>
                )}

              </div>

              {/* DATE */}

              <div>

                <label className="block text-sm font-semibold text-haigana-dark mb-2">
                  Date d'écriture
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="date"
                  name="dateEcriture"
                  value={form.dateEcriture}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-haigana-dark outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/10 transition-all"
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-slate-100">

              <button
                type="button"
                onClick={() =>
                  navigate("/patrimoine/livret")
                }
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Enregistrement..."
                  : modeModification
                  ? "Enregistrer les modifications"
                  : "Créer le livret"}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}