import React from "react";
import { Link } from "react-router-dom";

export default function APropos() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/*HERO*/}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/propos.webp')",
        }}
      >
        {/* Voile sombre pour garder le texte lisible */}
        <div className="absolute inset-0 bg-haigana-dark/70" />

        {/* Décorations */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-haigana-gold/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">

          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link
              to="/"
              className="hover:text-white transition-colors"
            >
              Accueil
            </Link>

            <span>/</span>

            <span className="text-white font-medium">
              À propos
            </span>
          </div>

          <div className="max-w-3xl">

            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              À propos de
              <span className="block text-haigana-gold">
                Haigana
              </span>
            </h1>

            <p className="mt-5 text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
              Une solution numérique dédiée à la gestion, au suivi et à la
              traçabilité du patrimoine public régional de la région Boeny.
            </p>

          </div>
        </div>
      </section>

      {/*CONTENU*/}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Présentation */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Texte principal */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-7 md:p-9">

            <div className="flex items-center gap-4 mb-6">

              <div className="w-14 h-14 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center">

                <svg
                  width="28"
                  height="28"
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

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-haigana-blue">
                  Présentation
                </span>

                <h2 className="text-2xl font-bold text-haigana-dark">
                  Qu'est-ce que Haigana ?
                </h2>
              </div>

            </div>

            <p className="text-slate-600 leading-relaxed mb-5">
              Haigana est le système de gestion du patrimoine de la
              Direction Régionale du Budget et des Finances (DRBF) —
              Service Régional du Budget et des Programmes de l'État (SRPE),
              région Boeny.
            </p>

            <p className="text-slate-600 leading-relaxed mb-5">
              Il centralise le recensement, le suivi, le contrôle et la
              traçabilité budgétaire des biens publics régionaux, notamment
              les véhicules, les matériels et les logements de fonction.
            </p>

            <p className="text-slate-600 leading-relaxed">
              L'objectif est de fournir aux services régionaux un
              environnement structuré permettant d'améliorer la gestion,
              la transparence et le suivi du patrimoine public.
            </p>

          </div>

          {/* Carte institutionnelle */}
          <div
          className="
            group
            relative
            overflow-hidden
            rounded-3xl
            p-7
            text-white
            shadow-lg
            bg-gradient-to-br
            from-haigana-dark
            to-haigana-blue
            transition-all
            duration-500
          "
        >
          {/* IMAGE DE FOND */}
          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-500
            "
            style={{
              backgroundImage: "url('/Le-grand-Baobab-de-Majunga.jpg')",
            }}
          />

          {/* VOILE SUR L'IMAGE */}
          <div
            className="
              absolute
              inset-0
              bg-haigana-dark/60
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-500
            "
          />

          {/* CONTENU */}
          <div className="relative z-10">

            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">

              <svg
                width="28"
                height="28"
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

            <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors duration-300">
              Structure de référence
            </p>

            <h3 className="text-xl font-bold mt-1">
              DRBF — SRPE Boeny
            </h3>

            <div className="h-px bg-white/10 my-6" />

            <div className="space-y-5">

              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Domaine
                </p>

                <p className="font-medium mt-1">
                  Gestion du budget et service
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">
                  Système
                </p>

                <p className="font-medium mt-1">
                  Haigana
                </p>
              </div>

            </div>

          </div>
        </div>
        </section>

        {/*MISSION*/}
        <section className="mt-10">

          <div className="mb-7">
            <span className="text-sm font-semibold uppercase tracking-wider text-haigana-blue">
              Objectifs
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-haigana-dark mt-1">
              Une gestion plus structurée du patrimoine
            </h2>

            <p className="text-slate-500 mt-2 max-w-2xl">
              Haigana accompagne les services régionaux dans les principales
              étapes du cycle de vie des biens publics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Recensement */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center mb-5">

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M8 3h8l3 3v15H5V3h3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 9h8M8 13h8M8 17h5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <h3 className="text-lg font-bold text-haigana-dark">
                Recensement
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                Identifier et enregistrer les biens publics afin de disposer
                d'une vision complète du patrimoine régional.
              </p>

            </div>

            {/* Suivi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center mb-5">

                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 19V9M10 19V5M16 19v-8M22 19H2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <h3 className="text-lg font-bold text-haigana-dark">
                Suivi
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                Suivre l'affectation, l'état et l'évolution de chaque bien
                tout au long de son cycle de vie.
              </p>

            </div>

            {/* Traçabilité */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">

              <div className="w-12 h-12 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center mb-5">

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
                    d="M8 12h8M12 8v8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <h3 className="text-lg font-bold text-haigana-dark">
                Traçabilité
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                Conserver un historique structuré des opérations et des
                dépenses liées aux biens publics.
              </p>

            </div>

          </div>
        </section>

        {/*CYCLE DE VIE*/}
        <section className="mt-10 bg-white rounded-3xl border border-slate-200 p-7 md:p-9">

          <div className="max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-haigana-blue">
              Cycle de vie
            </span>

            <h2 className="text-2xl md:text-3xl font-bold text-haigana-dark mt-1">
              Du recensement à la sortie du bien
            </h2>

            <p className="text-slate-500 mt-3 leading-relaxed">
              L'application permet de suivre un bien sous un code SOA
              unique, depuis sa prise en charge jusqu'à sa sortie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

            {[
              ["01", "Prise en charge", "Enregistrement initial du bien."],
              ["02", "Affectation", "Attribution du bien à un service ou utilisateur."],
              ["03", "Entretien", "Suivi des opérations de maintenance et réparation."],
              ["04", "Sortie", "Clôture du cycle de vie et historique du bien."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="relative rounded-2xl bg-slate-50 border border-slate-100 p-5"
              >
                <span className="text-xs font-bold text-haigana-blue">
                  {number}
                </span>

                <h3 className="font-bold text-haigana-dark mt-2">
                  {title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}

          </div>

        </section>

        {/*BUDGET*/}
        <section className="mt-10 rounded-3xl bg-haigana-blue/5 border border-haigana-blue/10 p-7 md:p-9">

          <div className="flex flex-col md:flex-row gap-6 items-start">

            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white text-haigana-blue flex items-center justify-center shadow-sm">

              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M3 9h18M8 14h3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

              </svg>

            </div>

            <div>
              <h2 className="text-xl font-bold text-haigana-dark">
                Suivi budgétaire
              </h2>

              <p className="text-slate-600 leading-relaxed mt-2">
                Haigana prend également en compte les dépenses associées
                aux biens, notamment à travers les bons de commande et
                le livret annuel, afin de faciliter le suivi budgétaire
                des opérations réalisées.
              </p>
            </div>

          </div>

        </section>

        {/*INFORMATIONS APPLICATION*/}
        <section className="mt-10">

          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-wider text-haigana-blue">
              Informations
            </span>

            <h2 className="text-2xl font-bold text-haigana-dark mt-1">
              Identité de l'application
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Site
              </p>

              <p className="text-lg font-bold text-haigana-dark mt-2">
                DRBF — SRPE Boeny
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Direction Régionale du Budget et des Finances
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Région
              </p>

              <p className="text-lg font-bold text-haigana-dark mt-2">
                Boeny
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Madagascar
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Application
              </p>

              <p className="text-lg font-bold text-haigana-dark mt-2">
                Haigana
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Version 1.0
              </p>
            </div>

          </div>
        </section>

      </main>

      {/*FOOTER*/}
      <footer className="border-t border-slate-200 bg-white mt-8">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex flex-col md:flex-row items-center justify-between gap-3">

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Haigana — DRBF Boeny
            </p>

            <p className="text-sm text-slate-400">
              Système de gestion du budget et service
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

