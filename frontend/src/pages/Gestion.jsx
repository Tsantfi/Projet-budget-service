import React from "react";
import { useNavigate } from "react-router-dom";

/*ICÔNES SVG*/

const icons = {
  vehicle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </svg>
  ),

  entrance: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m8 11 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 20h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),

  purchase: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5h2l1.5 10h9.5l2-7H7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.4" fill="currentColor" />
      <circle cx="17" cy="19" r="1.4" fill="currentColor" />
      <path
        d="M9 8h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  donation: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  condamnation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 17h14a2 2 0 002-2v-3l-2.5-5A2 2 0 0016.7 6H7.3a2 2 0 00-1.8 1L3 12v3a2 2 0 002 2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17v2m10-2v2"
      />
      <circle
        cx="17.5"
        cy="7.5"
        r="4.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 4.5l6 6"
      />
    </svg>
  ),

  assignment: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 4h8l2 2v14H6V4h2Z"
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
  ),

  recensement: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 13h15l1.5-4H5.5L3 13Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="16.5" r="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="14.5" cy="16.5" r="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <path
        d="m13 4 2.5 2.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),


  maintenance: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.5 6.5a4 4 0 0 0-5 5l-5 5a2 2 0 1 0 3 3l5-5a4 4 0 0 0 5-5l-2.5 2.5-2.5-1.5-1.5-2.5 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  repair: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="m14 6-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m5 19 3-1 10-10-2-2L6 16l-1 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m14 4 2-2 4 4-2 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  ),

  control: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
  ),

  tracking: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V10M10 19V5M16 19v-7M22 19H2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  movement: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 7h14M15 3l4 4-4 4M19 17H5M9 13l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  booklet: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8 20V7a3 3 0 0 1 3-3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  ),

  order: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 3h9l3 3v15H6V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 10h6M9 14h6M9 18h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  state: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3h10v18H7V3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6M9 16h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  gender: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="10"
        cy="14"
        r="4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M13 11l6-6M15 5h4v4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  type: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 9h8M8 13h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  ministry: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 21h18M5 18V8l7-4 7 4v10M9 18v-5h6v5M8 8h.01M12 8h.01M16 8h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  region: (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 6.5 10 4l4 2 6-2v13.5L14 20l-4-2-6 2V6.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M10 4v14M14 6v14"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    <path
      d="M6.5 9.5h1M6.5 13h1M16.5 10h1M16.5 13.5h1"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
  ),

  driver: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5 20c.8-3.5 3.1-5.5 7-5.5s6.2 2 7 5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  holder: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="9"
        cy="9"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="16"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 20c.7-3.3 2.7-5 5.5-5s4.8 1.7 5.5 5M13.5 15.5c2.5-.3 4.8 1.2 5.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  nomenclature: (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />

    <path
      d="M8 8h2M12 8h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    <path
      d="M8 12h2M12 12h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    <path
      d="M8 16h2M12 16h4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
  ),

  soa: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 5h12v14H6V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h6M9 13h6M9 17h3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),

  exit: (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5V4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M11 12h9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />

    <path
      d="m16 8 4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  ),
  money: (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle
      cx="12"
      cy="12"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M7 9h.01M17 15h.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
  ),
  generality: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7h4M7 10v4M14 17h-4M17 14v-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ),
};

/*DONNÉES*/

const sections = [
  {
    title: "Gestion des entrées",
    description: "Gérer les différentes opérations d'entrée des véhicules.",
    items: [
      {
        title: "Affectations",
        description: "Gestion des affectations des véhicules.",
        path: "/patrimoine/affectations",
        icon: icons.assignment,
      },

      {
        title: "Condamnations",
        description: "Gestion des véhicules condamnés.",
        path: "/patrimoine/condamnations",
        icon: icons.condamnation,
      },
      {
        title: "Argent public",
        description: "Gestion des fonds publics destinés aux véhicules.",
        path: "/patrimoine/argent-public",
        icon: icons.money,
      },
      {
        title: "Recesement",
        description: "Gestion des recesement à une année.",
        path: "/gestion/verification-recensement",
        icon: icons.recensement,
      },
    ],
  },

  {
    title: "Suivi des véhicules",
    description: "Suivi technique et administratif du parc automobile.",
    items: [
      {
        title: "Entretiens",
        description: "Gestion des entretiens des véhicules.",
        path: "/gestion/entretiens",
        icon: icons.maintenance,
      },
      {
        title: "Réparations",
        description: "Gestion des réparations.",
        path: "/gestion/reparations",
        icon: icons.repair,
      },
      {
        title: "Contrôles",
        description: "Gestion des contrôles des véhicules.",
        path: "/gestion/vehicules/controles",
        icon: icons.control,
      },
      {
        title: "Suivis",
        description: "Gestion du suivi des véhicules.",
        path: "/gestion/suivis",
        icon: icons.tracking,
      },
      {
        title: "Déplacements",
        description: "Gestion des déplacements des véhicules.",
        path: "/gestion/deplacements",
        icon: icons.movement,
      },
    ],
  },

  {
    title: "Documents et commandes",
    description: "Gestion des documents administratifs liés au patrimoine.",
    items: [
      {
        title: "Livrets",
        description: "Gestion des livrets des véhicules.",
        path: "/patrimoine/livret",
        icon: icons.booklet,
      },
      {
        title: "Bons de commande",
        description: "Gestion des bons de commande.",
        path: "/patrimoine/vehicule/bon-commande",
        icon: icons.order,
      },
    ],
  },

  {
    title: "Référentiels",
    description: "Gestion des données de référence de l'application.",
    items: [
      {
        title: "États",
        description: "Gestion des états des véhicules.",
        path: "/gestion/etats",
        icon: icons.state,
      },
      {
        title: "Genres",
        description: "Gestion des genres de véhicules.",
        path: "/gestion/genres",
        icon: icons.gender,
      },
      {
        title: "Types de véhicules",
        description: "Gestion des types de véhicules.",
        path: "/gestion/types-vehicules",
        icon: icons.type,
      },
      {
        title: "Ministères",
        description: "Gestion des ministères.",
        path: "/patrimoine/ministeres",
        icon: icons.ministry,
      },

      {
      title: "Régions",
      description: "Gestion des régions.",
      path: "/patrimoine/regions",
      icon: icons.region,
      },

      {
        title: "Chauffeurs",
        description: "Gestion des chauffeurs.",
        path: "/gestion/chauffeurs",
        icon: icons.driver,
      },
      {
        title: "Détenteurs",
        description: "Gestion des détenteurs.",
        path: "/patrimoine/detenteur",
        icon: icons.holder,
      },
      {
        title: "Codes SOA des entités",
        description: "Gestion des codes SOA.",
        path: "/patrimoine/vehicule/codes-soa",
        icon: icons.soa,
      },

      {
        title: "Codes SOA générale",
        description: "Gestion de tous les codes SOA.",
        path: "/patrimoine/admin/gestion-soa", // <-- VOTRE NOUVEAU CHEMIN DE ROUTAGE
        icon: icons.generality,
      },

      {
        title: "Nomenclature",
        description: "Gestion des nomenclatures matériel.",
        path: "/gestion/nomenclatures",
        icon: icons.nomenclature,
      },

    ],
  },
];

export default function Gestion() {
  const navigate = useNavigate();

  const totalItems = sections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/*EN-TÊTE*/}

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-haigana-dark tracking-tight">
                Gestion
              </h1>

              <p className="mt-3 max-w-2xl text-slate-500 leading-relaxed">
                Centralisez la gestion des données, des opérations et des
                référentiels nécessaires au suivi du patrimoine automobile.
              </p>
            </div>


          </div>
        </div>
      </section>

      {/*CONTENU*/}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="space-y-12">

          {sections.map((section, sectionIndex) => (
            <section key={section.title}>

              {/* En-tête section */}
              <div className="flex items-start gap-4 mb-5">

                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-haigana-blue text-white flex items-center justify-center text-xs font-bold">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </div>

                  <div className="hidden sm:block w-px h-5 bg-slate-200 mt-2" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-haigana-dark">
                    {section.title}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {section.description}
                  </p>
                </div>

              </div>

              {/* Cartes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

                {section.items.map((item) => (

                  <button
                    key={item.title}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="
                      group
                      relative
                      text-left
                      bg-white
                      rounded-2xl
                      border
                      border-slate-200
                      p-5
                      shadow-sm
                      hover:shadow-xl
                      hover:-translate-y-1
                      hover:border-haigana-blue/40
                      transition-all
                      duration-300
                      focus:outline-none
                      focus:ring-2
                      focus:ring-haigana-blue/30
                    "
                  >

                    {/* Icône */}
                    <div className="flex items-start justify-between">

                      <div
                        className="
                          w-12
                          h-12
                          rounded-xl
                          bg-haigana-blue/10
                          text-haigana-blue
                          flex
                          items-center
                          justify-center
                          group-hover:bg-haigana-blue
                          group-hover:text-white
                          transition-all
                          duration-300
                        "
                      >
                        {item.icon}
                      </div>

                      {/* Flèche */}
                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          bg-slate-50
                          text-slate-300
                          flex
                          items-center
                          justify-center
                          group-hover:bg-haigana-blue/10
                          group-hover:text-haigana-blue
                          transition-colors
                        "
                      >
                        <svg
                          width="16"
                          height="16"
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

                    {/* Texte */}
                    <div className="mt-5">

                      <h3 className="font-semibold text-haigana-dark group-hover:text-haigana-blue transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-sm text-slate-500 mt-2 leading-relaxed min-h-[42px]">
                        {item.description}
                      </p>

                    </div>

                    {/* Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100">

                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-haigana-blue transition-colors">
                        Accéder au module
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            </section>
          ))}

        </div>

        {/* BLOC INFORMATION*/}

        <div className="mt-14 rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
          <div className="flex flex-col md:flex-row gap-5 items-start">

            <div className="w-12 h-12 shrink-0 rounded-xl bg-white text-haigana-blue flex items-center justify-center shadow-sm">

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
                Espace d'administration
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                Utilisez les différents modules pour gérer les véhicules,
                les opérations d'entrée, le suivi technique, les documents
                administratifs et les référentiels de Haigana.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
