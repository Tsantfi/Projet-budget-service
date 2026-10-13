import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Livret() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [livrets, setLivrets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [anneeEnCours, setAnneeEnCours] = useState(null);

  // RECHERCHE
  const [search, setSearch] = useState("");

  // TRI
  const [sortField, setSortField] = useState("annee");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    chargerDonnees();
  }, []);


  // CHARGEMENT


  async function chargerDonnees() {
    setLoading(true);
    setError("");

    try {
      const [livretsResponse, anneeResponse] =
        await Promise.all([
          client.get("/livrets"),
          client.get("/livrets/annee-en-cours"),
        ]);

      setLivrets(
        Array.isArray(livretsResponse.data)
          ? livretsResponse.data
          : []
      );

      setAnneeEnCours(anneeResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les données des livrets."
      );
    } finally {
      setLoading(false);
    }
  }


  // ACTIONS


  function consulter(livret) {
    navigate(`/patrimoine/livret/${livret.id}`);
  }

  function modifier(livret) {
    navigate(`/patrimoine/livret/${livret.id}/modifier`);
  }

  async function supprimer(livret) {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer le livret ${livret.annee} ?`
      )
    ) {
      return;
    }

    setError("");

    try {
      await client.delete(`/livrets/${livret.id}`);

      setLivrets((prev) =>
        prev.filter((item) => item.id !== livret.id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de supprimer ce livret."
      );
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR");
  }


  // RECHERCHE + TRI


  const livretsFiltres = useMemo(() => {
    const texteRecherche = search.trim().toLowerCase();

    // -------------------------
    // RECHERCHE
    // -------------------------

    const filtres = livrets.filter((livret) => {
      const estCourant =
        Number(livret.annee) === Number(anneeEnCours);

      const statut = estCourant
        ? "en cours"
        : "ancien";

      const texte = `
        ${livret.annee || ""}
        ${livret.dateEcriture || ""}
        ${formatDate(livret.dateEcriture)}
        ${statut}
      `.toLowerCase();

      return texte.includes(texteRecherche);
    });

    // -------------------------
    // TRI
    // -------------------------

    return [...filtres].sort((a, b) => {
      let valeurA;
      let valeurB;

      if (sortField === "annee") {
        valeurA = Number(a.annee) || 0;
        valeurB = Number(b.annee) || 0;
      }

      if (sortField === "dateEcriture") {
        valeurA = a.dateEcriture
          ? new Date(a.dateEcriture).getTime()
          : 0;

        valeurB = b.dateEcriture
          ? new Date(b.dateEcriture).getTime()
          : 0;
      }

      if (sortField === "statut") {
        const statutA =
          Number(a.annee) === Number(anneeEnCours)
            ? "En cours"
            : "Ancien";

        const statutB =
          Number(b.annee) === Number(anneeEnCours)
            ? "En cours"
            : "Ancien";

        valeurA = statutA;
        valeurB = statutB;
      }

      if (typeof valeurA === "string") {
        const comparaison = valeurA.localeCompare(
          valeurB,
          "fr"
        );

        return sortOrder === "asc"
          ? comparaison
          : -comparaison;
      }

      return sortOrder === "asc"
        ? valeurA - valeurB
        : valeurB - valeurA;
    });
  }, [
    livrets,
    search,
    sortField,
    sortOrder,
    anneeEnCours,
  ]);


  // CHANGEMENT TRI


  function handleSortFieldChange(e) {
    setSortField(e.target.value);
  }

  function handleSortOrderChange(e) {
    setSortOrder(e.target.value);
  }


  // STYLES


  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "bg-white text-haigana-dark " +
    "focus:outline-none focus:border-haigana-blue " +
    "focus:ring-2 focus:ring-haigana-blue/20 " +
    "transition-all";


  // AFFICHAGE


  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* FIL D'ARIANE */}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/gestion"
          className="hover:text-haigana-blue transition-colors"
        >
          Gestion
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Livret
        </span>

      </div>

      {/* TITRE */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-haigana-dark">
            Livrets
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des livrets de dépenses
          </p>
        </div>

        {/* NOUVEAU */}

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (
          <button
            onClick={() =>
              navigate("/patrimoine/livret/nouveau")
            }
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
          >
            Nouveau livret
          </button>
        )}

      </div>

      {/* ERREUR */}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* RECHERCHE + TRI */}

      {!loading && livrets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-5">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* RECHERCHE */}

            <div className="md:col-span-1">

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Rechercher
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Année, date ou statut..."
                  className={`${inputClass} pr-10`}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-haigana-dark"
                    title="Effacer"
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

            {/* CHAMP DE TRI */}

            <div>

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Trier par
              </label>

              <select
                value={sortField}
                onChange={handleSortFieldChange}
                className={inputClass}
              >
                <option value="annee">
                  Année
                </option>

                <option value="dateEcriture">
                  Date d'écriture
                </option>

                <option value="statut">
                  Statut
                </option>
              </select>

            </div>

            {/* ORDRE */}

            <div>

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Ordre
              </label>

              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
                className={inputClass}
              >
                <option value="desc">
                  Décroissant
                </option>

                <option value="asc">
                  Croissant
                </option>
              </select>

            </div>

          </div>

          {/* RESULTATS */}

          <div className="mt-4 text-sm text-gray-500">

            {livretsFiltres.length} livret
            {livretsFiltres.length !== 1
              ? "s"
              : ""}{" "}
            trouvé
            {livretsFiltres.length !== 1
              ? "s"
              : ""}

          </div>

        </div>
      )}

      {/* TABLEAU */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        {loading ? (

          <div className="px-6 py-10 text-center text-gray-400">
            Chargement des livrets...
          </div>

        ) : (

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Année
                </th>

                <th className="text-left px-4 py-3">
                  Date d'écriture
                </th>

                <th className="text-left px-4 py-3">
                  Statut
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {livretsFiltres.map((livret) => {

                const estCourant =
                  Number(livret.annee) ===
                  Number(anneeEnCours);

                return (

                  <tr
                    key={livret.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    {/* ANNÉE */}

                    <td className="px-4 py-3">

                      <span className="font-semibold text-haigana-dark">
                        {livret.annee}
                      </span>

                    </td>

                    {/* DATE */}

                    <td className="px-4 py-3 text-gray-600">

                      {formatDate(
                        livret.dateEcriture
                      )}

                    </td>

                    {/* STATUT */}

                    <td className="px-4 py-3">

                      {estCourant ? (

                        <span className="px-2.5 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          En cours
                        </span>

                      ) : (

                        <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          Ancien
                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-3">

                      <div className="flex justify-end items-center gap-3">

                        {/* CONSULTER */}

                        <button
                          onClick={() =>
                            consulter(livret)
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-medium"
                        >
                          Consulter
                        </button>

                        {/* MODIFIER */}

                        {hasRole(
                          "ADMINISTRATEUR",
                          "MODIFICATEUR"
                        ) && (

                          <button
                            onClick={() =>
                              modifier(livret)
                            }
                            className="px-3 py-1.5 rounded-lg bg-haigana-blue text-white text-xs font-semibold hover:brightness-95 transition-all"
                          >
                            Modifier
                          </button>

                        )}

                        {/* SUPPRIMER */}

                        {hasRole(
                          "ADMINISTRATEUR"
                        ) && (

                          <button
                            onClick={() =>
                              supprimer(livret)
                            }
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all"
                          >
                            Supprimer
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                );
              })}

              {/* AUCUN RESULTAT */}

              {livretsFiltres.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400"
                  >

                    {search
                      ? "Aucun livret ne correspond à votre recherche."
                      : "Aucun livret disponible."}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

