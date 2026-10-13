
import React from "react";
import { Link } from "react-router-dom";

const items = [
  {
    to: "/patrimoine/materiel",
    label: "Matériel",
    desc: "Mobilier, équipements informatiques et matériels nécessaires au fonctionnement des services.",
    category: "Équipements",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 6h16v10H4V6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 20h8M10 16v4M14 16v4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/patrimoine/logement",
    label: "Logement",
    desc: "Logements de fonction attribués au personnel et suivis par l'administration régionale.",
    category: "Immobilier",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M3 11.5 12 4l9 7.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10.5V20h14v-9.5M9 20v-5h6v5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/patrimoine/vehicule",
    label: "Véhicule",
    desc: "Parc automobile administratif, affectations et informations liées aux véhicules de la région.",
    category: "Transport",
    icon: (
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5 16h14l-1.5-6h-11L5 16Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 16v2M17 16v2M7.5 10l1.5-3h6l1.5 3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="8"
          cy="16"
          r="1.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="16"
          cy="16"
          r="1.2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export default function Patrimoine() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/*HEADER*/}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Fil d'Ariane */}
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
            <Link
              to="/"
              className="hover:text-haigana-blue transition-colors"
            >
              Accueil
            </Link>

            <span>/</span>

            <span className="text-haigana-dark font-medium">
              Patrimoine
            </span>
          </div>

          {/* Titre */}
          <div className="max-w-3xl">

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-haigana-dark">
              Patrimoine de l'Etat Boeny
            </h1>

            <p className="mt-4 text-slate-500 leading-relaxed text-base md:text-lg">
              Consultez et gérez les différentes catégories de biens
              appartenant au patrimoine public régional de la DRBF Boeny.
            </p>
          </div>

        </div>
      </section>

      {/*CONTENU*/}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Introduction */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-haigana-dark">
              Catégories du patrimoine
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sélectionnez une catégorie pour consulter ses informations.
            </p>
          </div>

          <div className="text-sm text-slate-400">
            3 catégories disponibles
          </div>
        </div>

        {/*CARTES*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Effet décoratif */}
              <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-haigana-blue/5 group-hover:bg-haigana-gold/10 transition-colors duration-300" />

              <div className="relative">

                {/* Icône + catégorie */}
                <div className="flex items-start justify-between">

                  <div className="w-16 h-16 rounded-2xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center group-hover:bg-haigana-gold/20 group-hover:text-haigana-dark transition-all duration-300">
                    {item.icon}
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>

                </div>

                {/* Texte */}
                <h3 className="text-xl font-bold text-haigana-dark mt-7">
                  {item.label}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mt-3 min-h-[72px]">
                  {item.desc}
                </p>

                {/* Action */}
                <div className="flex items-center justify-between mt-7 pt-5 border-t border-slate-100">

                  <span className="text-sm font-semibold text-haigana-blue">
                    Consulter
                  </span>

                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-haigana-blue group-hover:text-white transition-all duration-300">
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

              </div>
            </Link>
          ))}

        </div>

        {/*INFORMATION*/}
        <div className="mt-10 rounded-2xl border border-haigana-blue/10 bg-haigana-blue/5 p-6 md:p-7">

          <div className="flex flex-col md:flex-row gap-5 items-start">

            <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center text-haigana-blue shadow-sm">
              <svg
                width="23"
                height="23"
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
              <h3 className="font-bold text-haigana-dark">
                Gestion centralisée
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                Haigana permet de centraliser les informations relatives
                aux biens publics afin de faciliter leur recensement,
                leur affectation, leur suivi et leur traçabilité.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
