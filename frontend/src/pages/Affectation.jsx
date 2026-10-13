import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Affectation() {

  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [affectations, setAffectations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // RECHERCHE
  const [search, setSearch] = useState("");
  // TRI
  const [sortField, setSortField] = useState("immatricule");
  const [sortDirection, setSortDirection] = useState("asc");

  // CHARGEMENT
  async function loadAffectations() {

    try {

      setLoading(true);
      setError("");

      const { data } =
        await client.get("/affectations-entree");

      setAffectations(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur chargement affectations :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de charger les affectations."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadAffectations();
  }, []);

  // SUPPRESSION
  async function handleDelete(id) {

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer cette affectation ?\n\nCette action est irréversible."
      );

    if (!confirmation) {
      return;
    }

    try {

      setError("");

      await client.delete(
        `/affectations-entree/${id}`
      );

      setAffectations((prev) =>
        prev.filter(
          (affectation) =>
            affectation.id !== id
        )
      );

    } catch (err) {

      console.error(
        "Erreur suppression affectation :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de supprimer l'affectation."
      );
    }
  }

  // FORMAT DATE
  function formatDate(date) {

    if (!date) {
      return "-";
    }

    try {

      return new Date(date)
        .toLocaleDateString("fr-FR");

    } catch {

      return "-";

    }
  }

  // RECHERCHE + TRI
  const filteredAndSortedAffectations =
    useMemo(() => {

      const searchValue =
        search.trim().toLowerCase();


      // -------------------------
      // RECHERCHE
      // -------------------------

      let result =
        affectations.filter((affectation) => {

          if (!searchValue) {
            return true;
          }

          const immatricule =
            affectation.immatricule
              ?.toLowerCase() || "";

          const description =
            affectation.description
              ?.toLowerCase() || "";

          const lieu =
            affectation.lieuAffectation
              ?.toLowerCase() || "";

          const dateDepart =
            affectation.dateDepart
              ?.toLowerCase() || "";

          const dateFin =
            affectation.dateFin
              ?.toLowerCase() || "";

          return (
            immatricule.includes(searchValue) ||
            description.includes(searchValue) ||
            lieu.includes(searchValue) ||
            dateDepart.includes(searchValue) ||
            dateFin.includes(searchValue)
          );
        });


      // -------------------------
      // TRI
      // -------------------------

      result.sort((a, b) => {

        let valueA;
        let valueB;


        switch (sortField) {

          case "immatricule":

            valueA =
              a.immatricule || "";

            valueB =
              b.immatricule || "";

            break;


          case "description":

            valueA =
              a.description || "";

            valueB =
              b.description || "";

            break;


          case "lieuAffectation":

            valueA =
              a.lieuAffectation || "";

            valueB =
              b.lieuAffectation || "";

            break;


          case "dateDepart":

            valueA =
              a.dateDepart || "";

            valueB =
              b.dateDepart || "";

            break;


          case "dateFin":

            valueA =
              a.dateFin || "";

            valueB =
              b.dateFin || "";

            break;


          default:

            valueA = "";
            valueB = "";
        }


        valueA =
          String(valueA).toLowerCase();

        valueB =
          String(valueB).toLowerCase();


        const comparison =
          valueA.localeCompare(
            valueB,
            "fr",
            {
              numeric: true,
              sensitivity: "base"
            }
          );


        return sortDirection === "asc"
          ? comparison
          : -comparison;

      });


      return result;

    }, [
      affectations,
      search,
      sortField,
      sortDirection
    ]);

  // CHANGEMENT DU TRI
  function handleSortChange(e) {

    setSortField(e.target.value);

    setSortDirection("asc");
  }


  function toggleSortDirection() {

    setSortDirection((prev) =>
      prev === "asc"
        ? "desc"
        : "asc"
    );
  }

  // RESET RECHERCHE
  function clearSearch() {
    setSearch("");
  }

  // CHARGEMENT
  if (loading) {

    return (
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-card p-8 text-center">

          <p className="text-gray-500">
            Chargement des affectations...
          </p>

        </div>

      </div>
    );
  }

  // AFFICHAGE
  return (

    <div className="max-w-7xl mx-auto px-4 py-10">


      {/*EN-TÊTE*/}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          
          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>

          <span>/</span>

          <span className="text-haigana-dark font-medium">
            Affectation par entrée
          </span>

        </div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Affectations par entrée
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des affectations des véhicules.
          </p>

        </div>


        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (

          <button
            type="button"
            onClick={() =>
              navigate(
                "/patrimoine/affectations/nouveau"
              )
            }
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
          >
            + Nouvelle affectation
          </button>

        )}

      </div>


      {/*ERREUR*/}

      {error && (

        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {error}
        </div>

      )}


      {/*RECHERCHE + TRI*/}

      <div className="bg-white rounded-2xl shadow-card p-4 mb-5">

        <div className="flex flex-col lg:flex-row gap-3">


          {/* RECHERCHE */}

          <div className="relative flex-1">

            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
            >

              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

            </svg>


            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Rechercher une immatriculation, description ou lieu..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-haigana-dark placeholder-gray-400 focus:border-haigana-blue focus:ring-1 focus:ring-haigana-blue outline-none transition"
            />


            {search && (

              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Effacer la recherche"
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                </svg>

              </button>

            )}

          </div>


          {/* TRI */}

          <div className="flex gap-2">

            <select
              value={sortField}
              onChange={handleSortChange}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-haigana-dark focus:border-haigana-blue outline-none"
            >

              <option value="immatricule">
                Immatriculation
              </option>

              <option value="description">
                Description
              </option>

              <option value="lieuAffectation">
                Lieu d'affectation
              </option>

              <option value="dateDepart">
                Date de départ
              </option>

              <option value="dateFin">
                Date de fin
              </option>

            </select>


            <button
              type="button"
              onClick={toggleSortDirection}
              className="min-w-[48px] px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-haigana-dark hover:bg-gray-50 transition-colors flex items-center justify-center"
              title={
                sortDirection === "asc"
                  ? "Tri croissant"
                  : "Tri décroissant"
              }
            >

              {sortDirection === "asc" ? (

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <path
                    d="M12 19V5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="m7 10 5-5 5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              ) : (

                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <path
                    d="M12 5v14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  <path
                    d="m7 14 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              )}

            </button>

          </div>

        </div>


        {/* RESULTATS */}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">

          <span>

            {filteredAndSortedAffectations.length}
            {" "}
            résultat
            {filteredAndSortedAffectations.length !== 1
              ? "s"
              : ""}

          </span>


          {search && (

            <span>
              Recherche :
              {" "}
              <strong className="text-haigana-dark">
                "{search}"
              </strong>
            </span>

          )}

        </div>

      </div>


      {/*TABLEAU*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Immatriculation
                </th>

                <th className="text-left px-4 py-3">
                  Description
                </th>

                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Lieu d'affectation
                </th>

                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Date départ
                </th>

                <th className="text-left px-4 py-3 whitespace-nowrap">
                  Date fin
                </th>

                <th className="text-right px-4 py-3 whitespace-nowrap">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredAndSortedAffectations.map(
                (affectation) => (

                  <tr
                    key={affectation.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    {/* IMMATRICULATION */}

                    <td className="px-4 py-3 font-semibold text-haigana-dark whitespace-nowrap">

                      {affectation.immatricule || "-"}

                    </td>


                    {/* DESCRIPTION */}

                    <td className="px-4 py-3 max-w-xs">

                      <span className="line-clamp-2">
                        {affectation.description || "-"}
                      </span>

                    </td>


                    {/* LIEU */}

                    <td className="px-4 py-3">

                      {affectation.lieuAffectation || "-"}

                    </td>


                    {/* DATE DEPART */}

                    <td className="px-4 py-3 whitespace-nowrap">

                      {formatDate(
                        affectation.dateDepart
                      )}

                    </td>


                    {/* DATE FIN */}

                    <td className="px-4 py-3 whitespace-nowrap">

                      {formatDate(
                        affectation.dateFin
                      )}

                    </td>


                    {/* ACTIONS */}

                    <td className="px-4 py-3">

                      <div className="flex justify-end items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/patrimoine/affectations/${affectation.id}/consultation`
                            )
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-medium"
                        >
                          Consulter
                        </button>


                        {hasRole(
                          "ADMINISTRATEUR",
                          "MODIFICATEUR"
                        ) && (

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/patrimoine/affectations/${affectation.id}/modifier`
                              )
                            }
                            className="text-haigana-gold hover:text-haigana-dark font-medium transition-colors"
                          >
                            Modifier
                          </button>

                        )}


                        {hasRole(
                          "ADMINISTRATEUR"
                        ) && (

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                affectation.id
                              )
                            }
                            className="text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            Supprimer
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>

                )
              )}


              {/* AUCUN RESULTAT */}

              {filteredAndSortedAffectations.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >

                    <div className="flex flex-col items-center">

                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mb-3 text-gray-300"
                      >

                        <path
                          d="M4 6.5C4 5.67 4.67 5 5.5 5h13c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-13C4.67 19 4 18.33 4 17.5v-11Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                        <path
                          d="M8 9h8M8 12h8M8 15h5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                      </svg>


                      <p>
                        {search
                          ? "Aucune affectation ne correspond à votre recherche."
                          : "Aucune affectation enregistrée."}
                      </p>


                      {search && (

                        <button
                          type="button"
                          onClick={clearSearch}
                          className="mt-3 text-haigana-blue hover:text-haigana-dark font-medium"
                        >
                          Effacer la recherche
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
