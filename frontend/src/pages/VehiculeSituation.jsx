import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
export default function VehiculeSituation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicule, setVehicule] = useState(null);
  const [loading, setLoading] = useState(true);

  const {hasRole} = useAuth();
  useEffect(() => {
    const chargerVehicule = async () => {
      try {
        setLoading(true);

        const { data } = await client.get(`/vehicules/${id}`);

        setVehicule(data);

        console.log("Véhicule :", data);
        console.log("SOA :", data.codeSoa);

      } catch (error) {
        console.error(
          "Erreur récupération véhicule :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    chargerVehicule();
  }, [id]);

    const handleSortieQuitus = () => {
    if (!vehicule) {
      return;
    }

    const soaId = vehicule.codeSoa?.id;

    const ministere =
      vehicule.ministere?.nomMinistere ||
      vehicule.ministere?.nomMinist ||
      vehicule.codeSoa?.ministere?.nomMinistere ||
      vehicule.codeSoa?.ministere?.nomMinist ||
      "";

    if (!soaId) {
      console.error("SOA introuvable pour ce véhicule.");
      return;
    }

    navigate("/quitus/sortie", {
      state: {
        soaId: soaId,
        ministere: ministere,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/*EN-TÊTE*/}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

            <Link
              to={`/patrimoine/vehicule/${id}/consultation`}
              className="inline-flex items-center gap-1.5 hover:text-haigana-blue transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Véhicule
            </Link>

            <span>/</span>

            <span className="text-haigana-dark font-medium">
              Situation
            </span>

          </div>

          {/* Titre */}
          <div className="flex items-start gap-4">

            <div className="w-14 h-14 shrink-0 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 19V10M10 19V5M16 19v-8M22 19H2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-haigana-blue">
                Gestion du véhicule
              </span>

              <h1 className="text-3xl md:text-4xl font-bold text-haigana-dark mt-1">
                Suivi et contrôle
              </h1>

              <p className="text-sm md:text-base text-slate-500 mt-2 leading-relaxed">
                Consultez les informations relatives au suivi technique
                et aux contrôles effectués sur ce véhicule.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/*CONTENU*/}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-7">
          <h2 className="text-xl font-bold text-haigana-dark">
            Choisissez une rubrique
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Accédez aux informations de suivi du véhicule.
          </p>
        </div>

        {/*CARTES*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ================= SUIVI ================= */}
          <Link
            to={`/patrimoine/vehicule/${id}/deplacement`}
            className="
              group
              relative
              overflow-hidden
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-7
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              hover:border-slate-300
              transition-all
              duration-300
            "
          >

            {/* Décoration */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-haigana-blue/5 group-hover:bg-haigana-blue/10 transition-colors duration-300" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M4 19V10M10 19V5M16 19v-8M22 19H2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-haigana-blue/10 group-hover:text-haigana-blue transition-all duration-300">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

              </div>

              <h3 className="text-xl font-bold text-haigana-dark mt-7 group-hover:text-haigana-blue transition-colors">
                Suivi
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Consultez le cycle de vie complet du véhicule,
                son historique et les différentes opérations
                enregistrées au cours de son utilisation.
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100">

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-haigana-blue transition-colors">
                  Consulter le cycle de vie
                </span>

              </div>

            </div>

          </Link>

          {/* CONTROLE */}
          <Link
            to={`/patrimoine/vehicule/${id}/controle`}
            className="
              group
              relative
              overflow-hidden
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-7
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              hover:border-slate-300
              transition-all
              duration-300
            "
          >

            {/* Décoration */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-haigana-blue/5 group-hover:bg-haigana-blue/10 transition-colors duration-300" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="m16 16 4 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-haigana-blue/10 group-hover:text-haigana-blue transition-all duration-300">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

              </div>

              <h3 className="text-xl font-bold text-haigana-dark mt-7 group-hover:text-haigana-blue transition-colors">
                Contrôle
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Consultez les contrôles réalisés sur le véhicule,
                les constatations enregistrées et les informations
                relatives aux procédures de contrôle.
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100">

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-haigana-blue transition-colors">
                  Consulter les contrôles
                </span>

              </div>

            </div>

          </Link>

          {/* QUITUS */}
          {hasRole("ADMINISTRATEUR") && (
          <button
            type="button"
            onClick={handleSortieQuitus}
            disabled={loading || !vehicule}
            className="
              group
              relative
              overflow-hidden
              bg-white
              rounded-3xl
              border
              border-slate-200
              p-7
              shadow-sm
              hover:shadow-xl
              hover:-translate-y-1
              hover:border-slate-300
              transition-all
              duration-300
              text-left
              w-full
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {/* Décoration */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-haigana-blue/5 group-hover:bg-haigana-blue/10 transition-colors duration-300" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div className="w-14 h-14 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                <svg
                  width="27"
                  height="27"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>


                </div>

                <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-haigana-blue/10 group-hover:text-haigana-blue transition-all duration-300">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

              </div>

              <h3 className="text-xl font-bold text-haigana-dark mt-7 group-hover:text-haigana-blue transition-colors">
                Sortir le Quitus
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Imprimmer le quitus et enregistrer la mise à jour des bases de
                données
              </p>

              <div className="mt-6 pt-5 border-t border-slate-100">

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-haigana-blue transition-colors">
                  Sortie du quitus
                </span>

              </div>

            </div>

          </button>
          )}

        </div>

      </main>
    </div>
  );
}