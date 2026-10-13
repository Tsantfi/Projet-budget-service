import React from "react";
import { Link } from "react-router-dom";

export default function Accueil() {
  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{
        backgroundImage: "url('/Gestion_Patrimoine.jpg')",
      }}
    >
      {/* Voile limité à la page Accueil */}
      <div className="absolute inset-0 bg-white/65 pointer-events-none z-0" />

      {/* Contenu */}
      <div className="relative z-10">

      {/*   HERO / PRESENTATION*/}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">

          <div
            className="
              relative
              overflow-hidden
              rounded-3xl
              bg-white
              border
              border-white
              shadow-card
              animate-fadeUp
            "
          >

            {/* Décoration discrète */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-haigana-blue/5" />
            <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-haigana-blue/5" />

            <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-8 items-center p-7 md:p-10">

              {/* TEXTE */}
              <div className="lg:col-span-3">

                <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-haigana-dark">
                  Direction Régionale du Budget et des Finances
                  <span className="block text-haigana-blue mt-1">
                    Boeny
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-slate-600 leading-relaxed">
                  La DRBF Boeny assure la gestion, le suivi et le contrôle
                  du patrimoine public régional. Haigana centralise les
                  informations relatives aux véhicules, matériels et
                  logements de fonction afin de faciliter leur gestion
                  et leur traçabilité.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-7">

                  <Link
                    to="/patrimoine"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-3
                      rounded-xl
                      bg-haigana-dark
                      text-white
                      font-semibold
                      hover:bg-haigana-blue
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >
                    Consulter le patrimoine

                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <Link
                    to="/statistique"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-3
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-haigana-dark
                      font-semibold
                      hover:border-haigana-blue
                      hover:text-haigana-blue
                      transition-all
                      duration-300
                    "
                  >
                    Voir les statistiques
                  </Link>

                </div>

              </div>

              {/* BLOC VISUEL */}
              <div className="lg:col-span-2">

                <div className="relative max-w-sm mx-auto">

                  <div className="rounded-3xl bg-haigana-dark p-5 shadow-xl">

                    <div className="flex items-center gap-3 mb-6">

                      <div className="w-11 h-11 rounded-xl bg-white/10 text-white flex items-center justify-center">
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3 21V9l9-6 9 6v12M9 21v-6h6v6"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="text-xs text-white/50 uppercase tracking-wider">
                          Système
                        </p>

                        <h2 className="text-lg font-bold text-white">
                          Haigana
                        </h2>
                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Patrimoine
                            </p>

                            <p className="text-xs text-white/50 mt-1">
                              Véhicules, matériels et logements
                            </p>
                          </div>

                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white/50"
                          >
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Suivi
                            </p>

                            <p className="text-xs text-white/50 mt-1">
                              Affectations et cycle de vie
                            </p>
                          </div>

                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white/50"
                          >
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Recensement
                            </p>

                            <p className="text-xs text-white/50 mt-1">
                              Historique et suivi budgétaire
                            </p>
                          </div>

                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-white/50"
                          >
                            <path
                              d="M5 12h14M13 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/*   ACCES RAPIDES*/}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        <div className="mb-6 animate-[fadeUp_0.7s_ease-out_0.15s_forwards] opacity-0">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-haigana-blue">
                Accès rapide
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-haigana-dark mt-1">
                Accédez aux principaux espaces
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Consultez rapidement les informations dont vous avez besoin.
              </p>
            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* PATRIMOINE */}
          <Link
            to="/patrimoine"
            className="
              group
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-6
              shadow-sm
              opacity-0
              animate-[fadeUp_0.7s_ease-out_0.25s_forwards]
              hover:-translate-y-1
              hover:shadow-xl
              hover:border-slate-300
              transition-all
              duration-300
            "
          >

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 21V9l9-6 9 6v12M9 21v-6h6v6"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-300 group-hover:text-haigana-blue group-hover:translate-x-1 transition-all duration-300"
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

            <h3 className="text-lg font-bold text-haigana-dark mt-6">
              Patrimoine
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Consultez les véhicules, matériels et logements
              du patrimoine régional.
            </p>

            <div className="mt-5 text-sm font-semibold text-haigana-blue">
              Accéder au patrimoine
            </div>

          </Link>

          {/* STATISTIQUES */}
          <Link
            to="/statistique"
            className="
              group
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-6
              shadow-sm
              opacity-0
              animate-[fadeUp_0.7s_ease-out_0.4s_forwards]
              hover:-translate-y-1
              hover:shadow-xl
              hover:border-slate-300
              transition-all
              duration-300
            "
          >

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 20V10M12 20V4M20 20v-7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-300 group-hover:text-haigana-blue group-hover:translate-x-1 transition-all duration-300"
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

            <h3 className="text-lg font-bold text-haigana-dark mt-6">
              Statistiques
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Visualisez les indicateurs et l'évolution
              du patrimoine régional.
            </p>

            <div className="mt-5 text-sm font-semibold text-haigana-blue">
              Consulter les statistiques
            </div>

          </Link>

          {/* A PROPOS */}
          <Link
            to="/a-propos"
            className="
              group
              bg-white
              rounded-2xl
              border
              border-slate-200
              p-6
              shadow-sm
              opacity-0
              animate-[fadeUp_0.7s_ease-out_0.55s_forwards]
              hover:-translate-y-1
              hover:shadow-xl
              hover:border-slate-300
              transition-all
              duration-300
            "
          >

            <div className="flex items-start justify-between">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M12 11v5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="8"
                    r="1"
                    fill="currentColor"
                  />
                </svg>

              </div>

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-300 group-hover:text-haigana-blue group-hover:translate-x-1 transition-all duration-300"
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

            <h3 className="text-lg font-bold text-haigana-dark mt-6">
              À propos
            </h3>

            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Découvrez Haigana et son rôle dans la gestion
              du patrimoine public régional.
            </p>

            <div className="mt-5 text-sm font-semibold text-haigana-blue">
              En savoir plus
            </div>

          </Link>

        </div>
      </section>

      {/*   BANDEAU INFORMATION*/}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        <div
          className="
            rounded-2xl
            bg-haigana-dark
            p-6
            md:p-7
            opacity-0
            animate-[fadeUp_0.7s_ease-out_0.65s_forwards]
          "
        >

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
                Haigana
              </p>

              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Une gestion centralisée du patrimoine public
              </h2>

              <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                Recensement, affectation, entretien, suivi et
                traçabilité des biens publics régionaux dans un
                environnement unique.
              </p>

            </div>

            <Link
              to="/a-propos"
              className="
                shrink-0
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-white
                text-haigana-dark
                font-semibold
                hover:bg-slate-100
                transition-colors
              "
            >
              Découvrir Haigana

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

          </div>

        </div>

      </section>

    </div>
    </div>
  );
}