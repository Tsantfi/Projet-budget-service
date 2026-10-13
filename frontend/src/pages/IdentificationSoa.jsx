import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;

const ETAT_CONFIG = {
  EN_MARCHE: {
    label: "En marche",
    icon: "✓",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    numberColor: "text-emerald-700",
  },

  EN_PANNE: {
    label: "En panne",
    icon: "!",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    numberColor: "text-amber-700",
  },

  SUR_CALLE: {
    label: "Sur calle",
    icon: "⚠",
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    numberColor: "text-orange-700",
  },

  EN_EPAVE: {
    label: "En épave",
    icon: "×",
    bg: "bg-red-50",
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    numberColor: "text-red-700",
  },
};

function normaliser(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getEtatNom(vehicule) {
  if (!vehicule) return "INCONNU";

  if (vehicule.etat && typeof vehicule.etat === "object") {
    return vehicule.etat.etatVehicule || vehicule.etat.libelle || "INCONNU";
  }

  if (typeof vehicule.etat === "string") {
    return vehicule.etat;
  }

  return "INCONNU";
}


function getSoaCode(vehicule) {
  if (!vehicule) return "";

  if (typeof vehicule.codeSoa === "string") {
    return vehicule.codeSoa;
  }

  if (typeof vehicule.soa === "string") {
    return vehicule.soa;
  }

  if (vehicule.codeSoa?.codeSoa) {
    return vehicule.codeSoa.codeSoa;
  }

  if (vehicule.soa?.codeSoa) {
    return vehicule.soa.codeSoa;
  }

  if (vehicule.codeSoa?.code) {
    return vehicule.codeSoa.code;
  }

  if (vehicule.soa?.code) {
    return vehicule.soa.code;
  }

  return "";
}

function getEtatKey(vehicule) {
  // On récupère le nom de l'état et on le passe en minuscules pour la comparaison
  const etat = String(getEtatNom(vehicule)).toLowerCase().trim();

  if (etat.includes("marche") || etat.includes("bon")) {
    return "EN_MARCHE";
  }

  if (etat.includes("panne") || etat.includes("mauvais")) {
    return "EN_PANNE";
  }

  if (etat.includes("calle") || etat.includes("cale")) {
    return "SUR_CALLE";
  }

  if (etat.includes("epave") || etat.includes("épave")) {
    return "EN_EPAVE";
  }

  return "INCONNU";
}

function getMarque(vehicule) {
  if (!vehicule?.marque) return "-";

  if (typeof vehicule.marque === "string") {
    return vehicule.marque;
  }

  return vehicule.marque.marqueVehicule || vehicule.marque.libelle || "-";
}

function getGenre(vehicule) {
  if (!vehicule?.genre) return "-";

  if (typeof vehicule.genre === "string") {
    return vehicule.genre;
  }
  return vehicule.genre.genreVehicule || vehicule.genre.libelle || "-";
}

function getType(vehicule) {
  if (!vehicule?.type) return "-";

  if (typeof vehicule.type === "string") {
    return vehicule.type;
  }

  return vehicule.type.typeDuVehicule || vehicule.type.libelle || "-";
}

function getCarburant(vehicule) {
  if (!vehicule?.carburant) return "-";

  if (typeof vehicule.carburant === "string") {
    return vehicule.carburant;
  }

  return (
    vehicule.carburant.nomCarburant ||
    vehicule.carburant.libelle ||
    vehicule.carburant.nom ||
    "-"
  );
}

function getEtatLabel(vehicule) {
  const key = getEtatKey(vehicule);

  if (ETAT_CONFIG[key]) {
    return ETAT_CONFIG[key].label;
  }

  return getEtatNom(vehicule) || "Inconnu";
}

function getCategorieLabel(vehicule) {
  if (!vehicule?.categorie) return "-";

  const categorie = normaliser(vehicule.categorie);

  switch (categorie) {
    case "REPRESENTATION":
      return "Représentation";

    case "FONCTION":
      return "Fonction";

    case "SERVICE":
      return "Service";

    default:
      return vehicule.categorie;
  }
}

function getDetenteur(vehicule) {
  if (!vehicule?.detenteur) return "-";

  if (typeof vehicule.detenteur === "string") {
    return vehicule.detenteur;
  }

  const nom = vehicule.detenteur.nomDetenteur || "";
  const prenom = vehicule.detenteur.prenomDetenteur || "";
  const complet = `${nom} ${prenom}`.trim();

  return complet || vehicule.detenteur.immatriculeDetenteur || "-";
}

function getLieuAffectation(vehicule) {
  return (
    vehicule?.lieuAffectationActuel ||
    vehicule?.localiteTexte ||
    vehicule?.lieuAffectation ||
    "-"
  );
}

function getCarteGrise(vehicule) {
  if (vehicule?.carteGriseDisponible === true) {
    return "Oui";
  }

  if (vehicule?.carteGriseDisponible === false) {
    return "Non";
  }

  return "-";
}

export default function IdentificationSoa() {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [search, setSearch] = useState("");
  const [filterEtat, setFilterEtat] = useState("TOUS");
  const [filterSoa, setFilterSoa] = useState("TOUS");
  const [filterCategorie, setFilterCategorie] = useState("TOUS");

  const [sortField, setSortField] = useState("soa");
  const [sortDirection, setSortDirection] = useState("asc");

  const [page, setPage] = useState(1);

  useEffect(() => {
    chargerVehicules();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterEtat, filterSoa, filterCategorie]);

  const chargerVehicules = async () => {
    try {
      setLoading(true);
      setErreur("");

      const response = await client.get("/vehicules");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.data || [];

      setVehicules(data);
    } catch (error) {
      console.error("Erreur chargement véhicules :", error);

      setErreur(
        error?.response?.data?.message ||
          "Impossible de charger les véhicules."
      );

      setVehicules([]);
    } finally {
      setLoading(false);
    }
  };

  // STATISTIQUES

  const statistiques = useMemo(() => {
  const stats = {
    total: vehicules.length,
    EN_MARCHE: 0,
    EN_PANNE: 0,
    SUR_CALLE: 0,
    EN_EPAVE: 0,
    INCONNU: 0,
  };

  vehicules.forEach((vehicule) => {
    const etat = getEtatKey(vehicule);

    if (stats[etat] !== undefined) {
      stats[etat]++;
    } else {
      stats.INCONNU++;
    }
  });

  return stats;
}, [vehicules]);

  // LISTE DES SOA

  const soaList = useMemo(() => {
    const codes = vehicules
      .map((vehicule) => getSoaCode(vehicule))
      .filter(Boolean);

    return [...new Set(codes)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [vehicules]);

  // LISTE DES CATEGORIES

  const categorieList = useMemo(() => {
    const categories = vehicules
      .map((vehicule) => vehicule?.categorie)
      .filter(Boolean);

    return [...new Set(categories)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [vehicules]);

  // RECHERCHE + FILTRES

  const vehiculesFiltres = useMemo(() => {
    const recherche = normaliser(search);

    return vehicules.filter((vehicule) => {
      const soa = getSoaCode(vehicule);
      const immatriculation = vehicule?.immatricule || "";
      const marque = getMarque(vehicule);
      const type = getType(vehicule);
      const genre = getGenre(vehicule);
      const carburant = getCarburant(vehicule);
      const detenteur = getDetenteur(vehicule);
      const lieu = getLieuAffectation(vehicule);
      const categorie = vehicule?.categorie || "";

      const texteRecherche = normaliser(
        [
          soa,
          immatriculation,
          marque,
          type,
          genre,
          carburant,
          detenteur,
          lieu,
          categorie,
        ].join(" ")
      );

      const correspondRecherche =
        !recherche || texteRecherche.includes(recherche);

      const correspondEtat =
        filterEtat === "TOUS" || getEtatKey(vehicule) === filterEtat;

      const correspondSoa =
        filterSoa === "TOUS" || soa === filterSoa;

      const correspondCategorie =
        filterCategorie === "TOUS" ||
        normaliser(categorie) === normaliser(filterCategorie);

      return (
        correspondRecherche &&
        correspondEtat &&
        correspondSoa &&
        correspondCategorie
      );
    });
  }, [
    vehicules,
    search,
    filterEtat,
    filterSoa,
    filterCategorie,
  ]);

  // TRI

  const vehiculesTries = useMemo(() => {
    const copie = [...vehiculesFiltres];

    copie.sort((a, b) => {
      let valeurA = "";
      let valeurB = "";

      switch (sortField) {
        case "soa":
          valeurA = getSoaCode(a);
          valeurB = getSoaCode(b);
          break;

        case "immatriculation":
          valeurA = a?.immatricule || "";
          valeurB = b?.immatricule || "";
          break;

        case "marque":
          valeurA = getMarque(a);
          valeurB = getMarque(b);
          break;

        case "type":
          valeurA = getType(a);
          valeurB = getType(b);
          break;

        case "genre":
          valeurA = getGenre(a);
          valeurB = getGenre(b);
          break;

        case "etat":
          valeurA = getEtatLabel(a);
          valeurB = getEtatLabel(b);
          break;

        case "categorie":
          valeurA = getCategorieLabel(a);
          valeurB = getCategorieLabel(b);
          break;

        case "date":
          valeurA = a?.dateCirculation || "";
          valeurB = b?.dateCirculation || "";
          break;

        default:
          valeurA = getSoaCode(a);
          valeurB = getSoaCode(b);
      }

      if (sortField === "date") {
        const dateA = new Date(valeurA).getTime() || 0;
        const dateB = new Date(valeurB).getTime() || 0;

        return sortDirection === "asc"
          ? dateA - dateB
          : dateB - dateA;
      }

      const comparaison = String(valeurA).localeCompare(
        String(valeurB),
        "fr",
        {
          numeric: true,
          sensitivity: "base",
        }
      );

      return sortDirection === "asc"
        ? comparaison
        : -comparaison;
    });

    return copie;
  }, [vehiculesFiltres, sortField, sortDirection]);

  // PAGINATION

  const totalPages = Math.max(
    1,
    Math.ceil(vehiculesTries.length / PAGE_SIZE)
  );

  const vehiculesPage = useMemo(() => {
    const debut = (page - 1) * PAGE_SIZE;

    return vehiculesTries.slice(
      debut,
      debut + PAGE_SIZE
    );
  }, [vehiculesTries, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // TRI

  const changerTri = (field) => {
    if (sortField === field) {
      setSortDirection((ancienne) =>
        ancienne === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const afficherFlecheTri = (field) => {
    if (sortField !== field) {
      return (
        <span className="ml-1 text-gray-300">
          ↕
        </span>
      );
    }

    return (
      <span className="ml-1 text-haigana-gold">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // BADGE ETAT

  const renderEtat = (vehicule) => {
    const key = getEtatKey(vehicule);
    const config = ETAT_CONFIG[key];

    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
          {getEtatLabel(vehicule)}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.iconColor}`}
      >
        <span className="mr-1 font-bold">
          {config.icon}
        </span>

        {config.label}
      </span>
    );
  };

  // RESET FILTRES

  const reinitialiserFiltres = () => {
    setSearch("");
    setFilterEtat("TOUS");
    setFilterSoa("TOUS");
    setFilterCategorie("TOUS");
    setSortField("soa");
    setSortDirection("asc");
    setPage(1);
  };

  // RENDU

  return (
    <div className="min-h-screen bg-haigana-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-[1800px] mx-auto">

        {/* EN-TETE */}

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          <Link
            to="/patrimoine/vehicule"
            className="hover:text-haigana-blue transition-colors"
          >
            Véhicule
          </Link>
          <span>/</span>
          <span className="text-haigana-dark font-medium">
            Identifiant
          </span>
        </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-haigana-dark flex items-center justify-center shadow-card">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="text-haigana-gold"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3M5 11h14M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01"
                    />
                  </svg>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-haigana-dark">
                    Identification des véhicules
                  </h1>

                  <p className="text-gray-500 mt-1">
                    Vue globale des véhicule de tous les SOA
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={chargerVehicules}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 20v-5h-5"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.5 15a7 7 0 0011.9 2M18.5 9A7 7 0 006.6 7"
                />
              </svg>

              Actualiser
            </button>
          </div>
        </div>

        
        {/* ERREUR */}
        

        {erreur && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <div className="flex items-center gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  d="M12 8v5"
                />
                <path
                  strokeLinecap="round"
                  d="M12 16h.01"
                />
              </svg>

              <span>{erreur}</span>
            </div>
          </div>
        )}

        
        {/* CARTES STATISTIQUES */}
        

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">

          {/* TOTAL */}

          <div className="bg-gradient-to-br from-haigana-dark to-haigana-blue rounded-3xl p-6 text-white shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Total véhicules
                </p>

                <p className="text-4xl font-bold mt-2">
                  {loading ? "..." : statistiques.total}
                </p>

                <p className="text-white/60 text-xs mt-2">
                  Tous les SOA
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 17h14l1-5-2-4H6l-2 4 1 5z"
                  />

                  <circle cx="7" cy="17" r="1.5" />
                  <circle cx="17" cy="17" r="1.5" />

                  <path
                    strokeLinecap="round"
                    d="M7 8l1-3h8l1 3"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* BON */}

          {["EN_MARCHE", "EN_PANNE", "SUR_CALLE", "EN_EPAVE"].map(
            (key) => {
              const config = ETAT_CONFIG[key];

              return (
                <div
                  key={key}
                  className={`rounded-3xl p-6 border ${config.bg} ${config.border} shadow-card`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        {config.label}
                      </p>

                      <p
                        className={`text-4xl font-bold mt-2 ${config.numberColor}`}
                      >
                        {loading ? "..." : statistiques[key]}
                      </p>

                      <p className="text-gray-500 text-xs mt-2">
                        véhicules
                      </p>
                    </div>

                    <div
                      className={`w-12 h-12 rounded-2xl ${config.iconBg} flex items-center justify-center`}
                    >
                      <span
                        className={`text-xl font-bold ${config.iconColor}`}
                      >
                        {config.icon}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        
        {/* RECHERCHE + FILTRES */}
        

        <div className="bg-white rounded-3xl shadow-card p-5 md:p-6 mb-6">

          <div className="flex flex-col xl:flex-row gap-4">

            {/* RECHERCHE */}

            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />

                <path
                  strokeLinecap="round"
                  d="m20 20-4-4"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par SOA, immatriculation, marque, type, détenteur..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-haigana-blue/20 focus:border-haigana-blue transition"
              />
            </div>

            {/* SOA */}

            <select
              value={filterSoa}
              onChange={(e) => setFilterSoa(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-haigana-blue/20"
            >
              <option value="TOUS">
                Tous les SOA
              </option>

              {soaList.map((soa) => (
                <option key={soa} value={soa}>
                  {soa}
                </option>
              ))}
            </select>

            {/* ETAT */}

            <select
            value={filterEtat}
            onChange={(e) => setFilterEtat(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-haigana-blue/20"
            >
            <option value="TOUS">
                Tous les états
            </option>

            <option value="EN_MARCHE">
                En marche
            </option>

            <option value="EN_PANNE">
                En panne
            </option>

            <option value="SUR_CALLE">
                Sur calle
            </option>

            <option value="EN_EPAVE">
                En épave
            </option>

            <option value="INCONNU">
                Inconnu
            </option>
            </select>

            {/* CATEGORIE */}

            <select
              value={filterCategorie}
              onChange={(e) =>
                setFilterCategorie(e.target.value)
              }
              className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-haigana-blue/20"
            >
              <option value="TOUS">
                Toutes les catégories
              </option>

              {categorieList.map((categorie) => (
                <option
                  key={categorie}
                  value={categorie}
                >
                  {getCategorieLabel({
                    categorie,
                  })}
                </option>
              ))}
            </select>

            {/* RESET */}

            {(search ||
              filterEtat !== "TOUS" ||
              filterSoa !== "TOUS" ||
              filterCategorie !== "TOUS") && (
              <button
                type="button"
                onClick={reinitialiserFiltres}
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition whitespace-nowrap"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* RESULTAT */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-haigana-dark">
                {vehiculesTries.length}
              </span>{" "}
              véhicule{vehiculesTries.length > 1 ? "s" : ""} trouvé
              {vehiculesTries.length > 1 ? "s" : ""}
            </p>

            <p className="text-sm text-gray-400">
              {vehicules.length} véhicule
              {vehicules.length > 1 ? "s" : ""} au total
            </p>
          </div>
        </div>

        
        {/* TABLEAU */}
        

        <div className="bg-white rounded-3xl shadow-card overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-haigana-dark">
              Liste des véhicules
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Ensemble des véhicules enregistrés dans tous les SOA
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-haigana-blue rounded-full animate-spin" />

              <p className="text-gray-500 mt-4">
                Chargement des véhicules...
              </p>
            </div>
          ) : vehiculesPage.length === 0 ? (
            <div className="py-20 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 17h14l1-5-2-4H6l-2 4 1 5z"
                  />

                  <circle cx="7" cy="17" r="1.5" />
                  <circle cx="17" cy="17" r="1.5" />
                </svg>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                Aucun véhicule trouvé
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Modifiez votre recherche ou vos filtres.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1450px]">

                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">

                      <th
                        onClick={() => changerTri("soa")}
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        SOA
                        {afficherFlecheTri("soa")}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("immatriculation")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        Immatriculation
                        {afficherFlecheTri(
                          "immatriculation"
                        )}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("marque")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        Marque
                        {afficherFlecheTri("marque")}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("type")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        Type
                        {afficherFlecheTri("type")}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("genre")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        Genre
                        {afficherFlecheTri("genre")}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("etat")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        État
                        {afficherFlecheTri("etat")}
                      </th>

                      <th
                        onClick={() =>
                          changerTri("categorie")
                        }
                        className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-haigana-dark whitespace-nowrap"
                      >
                        Catégorie
                        {afficherFlecheTri(
                          "categorie"
                        )}
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Carburant
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Détenteur
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Affectation
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Carte grise
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {vehiculesPage.map(
                      (vehicule, index) => (
                        <tr
                          key={
                            vehicule.id ||
                            `${getSoaCode(
                              vehicule
                            )}-${vehicule.immatricule}-${index}`
                          }
                          className="hover:bg-gray-50 transition"
                        >

                          {/* SOA */}

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-haigana-dark/5 text-haigana-dark font-semibold text-sm whitespace-nowrap">
                              {getSoaCode(
                                vehicule
                              ) || "-"}
                            </span>
                          </td>

                          {/* IMMATRICULATION */}

                          <td className="px-5 py-4">
                            <span className="font-bold text-haigana-dark whitespace-nowrap">
                              {vehicule.immatricule ||
                                "-"}
                            </span>
                          </td>

                          {/* MARQUE */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {getMarque(
                              vehicule
                            )}
                          </td>

                          {/* TYPE */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {getType(
                              vehicule
                            )}
                          </td>

                          {/* GENRE */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {getGenre(
                              vehicule
                            )}
                          </td>

                          {/* ETAT */}

                          <td className="px-5 py-4">
                            {renderEtat(
                              vehicule
                            )}
                          </td>

                          {/* CATEGORIE */}

                          <td className="px-5 py-4">
                            <span className="text-sm font-medium text-gray-700">
                              {getCategorieLabel(
                                vehicule
                              )}
                            </span>
                          </td>

                          {/* CARBURANT */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {getCarburant(
                              vehicule
                            )}
                          </td>

                          {/* DETENTEUR */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">

                              <div className="w-8 h-8 rounded-full bg-haigana-blue/10 flex items-center justify-center flex-shrink-0">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="text-haigana-blue"
                                >
                                  <circle
                                    cx="12"
                                    cy="8"
                                    r="3"
                                  />

                                  <path
                                    strokeLinecap="round"
                                    d="M5 20c.8-3.5 3-5 7-5s6.2 1.5 7 5"
                                  />
                                </svg>
                              </div>

                              <span className="text-sm text-gray-700 whitespace-nowrap">
                                {getDetenteur(
                                  vehicule
                                )}
                              </span>
                            </div>
                          </td>

                          {/* AFFECTATION */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {getLieuAffectation(
                                vehicule
                              )}
                            </span>
                          </td>

                          {/* CARTE GRISE */}

                          <td className="px-5 py-4 text-center">
                            {vehicule.carteGriseDisponible ===
                            true ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                <span>✓</span>
                                Oui
                              </span>
                            ) : vehicule.carteGriseDisponible ===
                              false ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                                <span>×</span>
                                Non
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                -
                              </span>
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>
                </table>
              </div>

              
              {/* PAGINATION */}
              

              <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <p className="text-sm text-gray-500">
                  Affichage de{" "}
                  <span className="font-semibold text-gray-700">
                    {vehiculesTries.length === 0
                      ? 0
                      : (page - 1) *
                          PAGE_SIZE +
                        1}
                  </span>{" "}
                  à{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(
                      page * PAGE_SIZE,
                      vehiculesTries.length
                    )}
                  </span>{" "}
                  sur{" "}
                  <span className="font-semibold text-gray-700">
                    {vehiculesTries.length}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((ancienne) =>
                        Math.max(1, ancienne - 1)
                      )
                    }
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  )
                    .filter((numero) => {
                      if (totalPages <= 5)
                        return true;

                      if (numero === 1)
                        return true;

                      if (
                        numero ===
                        totalPages
                      )
                        return true;

                      return Math.abs(
                        numero - page
                      ) <= 1;
                    })
                    .map((numero) => (
                      <button
                        key={numero}
                        type="button"
                        onClick={() =>
                          setPage(numero)
                        }
                        className={`w-10 h-10 rounded-xl font-semibold transition ${
                          page === numero
                            ? "bg-haigana-dark text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {numero}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={
                      page === totalPages
                    }
                    onClick={() =>
                      setPage((ancienne) =>
                        Math.min(
                          totalPages,
                          ancienne + 1
                        )
                      )
                    }
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    →
                  </button>

                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}