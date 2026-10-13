import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SearchSortBar from "../components/SearchSortBar";

export default function LivretConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [livret, setLivret] = useState(null);
  const [bons, setBons] = useState([]);
  const [anneeEnCours, setAnneeEnCours] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // RECHERCHE + TRI
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");


  // CHARGEMENT


  useEffect(() => {
    async function charger() {
      try {
        setLoading(true);
        setError("");

        const [
          livretResponse,
          bonsResponse,
          anneeResponse,
        ] = await Promise.all([
          client.get(`/livrets/${id}`),
          client.get(`/livrets/${id}/bons`),
          client.get("/livrets/annee-en-cours"),
        ]);

        setLivret(livretResponse.data);
        setBons(bonsResponse.data || []);
        setAnneeEnCours(anneeResponse.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Impossible de charger le livret."
        );
      } finally {
        setLoading(false);
      }
    }

    charger();
  }, [id]);


  // FORMAT DATE


  function formatDate(date) {
    if (!date) return "-";

    const [annee, mois, jour] = date.split("-");

    return `${jour}/${mois}/${annee}`;
  }


  // FORMAT MONTANT


  function formatMontant(montant) {
    return `${Number(montant || 0).toLocaleString(
      "fr-FR"
    )} Ar`;
  }


  // RECHERCHE + TRI DES BONS


  const bonsFiltres = useMemo(() => {
    const terme = search.trim().toLowerCase();

    let resultat = bons.filter((bon) => {
      if (!terme) {
        return true;
      }

      const description =
        bon.description || "";

      const date =
        bon.dateBon || "";

      const soa =
        bon.codeSoa?.codeSoa || "";

      const statut =
        bon.statut === "PAYE"
          ? "payé"
          : "non payé";

      const montant =
        String(bon.prixTotal || "");

      const texte = `
        ${description}
        ${date}
        ${soa}
        ${statut}
        ${montant}
      `.toLowerCase();

      return texte.includes(terme);
    });

    resultat.sort((a, b) => {
      let comparaison = 0;

      switch (sortBy) {
        case "date": {
          const dateA = a.dateBon
            ? new Date(a.dateBon).getTime()
            : 0;

          const dateB = b.dateBon
            ? new Date(b.dateBon).getTime()
            : 0;

          comparaison = dateA - dateB;
          break;
        }

        case "montant": {
          const montantA =
            Number(a.prixTotal) || 0;

          const montantB =
            Number(b.prixTotal) || 0;

          comparaison = montantA - montantB;
          break;
        }

        case "description": {
          comparaison = (
            a.description || ""
          ).localeCompare(
            b.description || "",
            "fr",
            {
              sensitivity: "base",
            }
          );

          break;
        }

        case "soa": {
          comparaison = (
            a.codeSoa?.codeSoa || ""
          ).localeCompare(
            b.codeSoa?.codeSoa || "",
            "fr",
            {
              sensitivity: "base",
            }
          );

          break;
        }

        case "statut": {
          const statutA =
            a.statut === "PAYE"
              ? "Payé"
              : "Non payé";

          const statutB =
            b.statut === "PAYE"
              ? "Payé"
              : "Non payé";

          comparaison = statutA.localeCompare(
            statutB,
            "fr",
            {
              sensitivity: "base",
            }
          );

          break;
        }

        default:
          comparaison = 0;
      }

      return sortOrder === "asc"
        ? comparaison
        : -comparaison;
    });

    return resultat;
  }, [
    bons,
    search,
    sortBy,
    sortOrder,
  ]);


  // TOTAL DES BONS


  const total = useMemo(() => {
    return bons.reduce(
      (somme, bon) =>
        somme +
        (Number(bon.prixTotal) || 0),
      0
    );
  }, [bons]);


  // CHARGEMENT


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-10">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">

            <div className="w-10 h-10 border-4 border-slate-200 border-t-haigana-blue rounded-full animate-spin mx-auto" />

            <p className="text-sm text-slate-400 mt-4">
              Chargement du livret...
            </p>

          </div>

        </div>
      </div>
    );
  }


  // ERREUR


  if (error || !livret) {
    return (
      <div className="min-h-screen bg-slate-50">

        <div className="max-w-6xl mx-auto px-4 py-10">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

            <div className="flex items-start gap-3 text-red-600 mb-6">

              <svg
                width="20"
                height="20"
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

              <p>
                {error ||
                  "Livret introuvable."}
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/patrimoine/livret")
              }
              className="px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
            >
              Retour aux livrets
            </button>

          </div>

        </div>

      </div>
    );
  }


  // STATUT


  const estCourant =
    Number(livret.annee) ===
    Number(anneeEnCours);

  const statutLabel = estCourant
    ? "Année en cours"
    : "Ancien";


  // AFFICHAGE


  return (
    <div className="min-h-screen bg-slate-50">

      {/* EN-TÊTE */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <button
                onClick={() =>
                  navigate("/patrimoine/livret")
                }
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-haigana-blue transition-colors mb-5"
              >

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M19 12H5M11 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Retour aux livrets

              </button>

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

                  <div className="flex items-center gap-3">

                    <h1 className="text-3xl font-bold text-haigana-dark">
                      Livret {livret.annee}
                    </h1>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        estCourant
                          ? "bg-haigana-blue/10 text-haigana-blue"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statutLabel}
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Consultation du livret et de ses bons de commande.
                  </p>

                </div>

              </div>

            </div>

            {/* MODIFIER */}

            {hasRole(
              "ADMINISTRATEUR",
              "MODIFICATEUR"
            ) && (
              <button
                onClick={() =>
                  navigate(
                    `/patrimoine/livret/${livret.id}/modifier`
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="m14 6 4 4M5 19l3.5-.8L19 7.7a2.1 2.1 0 0 0-3-3L5.5 15.2 5 19Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Modifier

              </button>
            )}

          </div>

        </div>

      </section>

      {/* CONTENU */}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* INFORMATIONS */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-6">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-haigana-dark">
              Informations du livret
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Informations générales du livret sélectionné.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* ANNÉE */}

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Année
              </p>

              <p className="text-2xl font-bold text-haigana-dark mt-2">
                {livret.annee}
              </p>

            </div>

            {/* DATE */}

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Date d'écriture
              </p>

              <p className="text-lg font-bold text-haigana-dark mt-2">
                {formatDate(
                  livret.dateEcriture
                )}
              </p>

            </div>

            {/* STATUT */}

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Statut
              </p>

              <div className="mt-2">

                <span
                  className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    estCourant
                      ? "bg-haigana-blue/10 text-haigana-blue"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {estCourant
                    ? "Année en cours"
                    : "Ancien livret"}
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* RÉSUMÉ */}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 4h12v16H6V4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 8h6M9 12h6M9 16h4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

              </svg>

            </div>

            <p className="text-sm text-slate-500">
              Nombre de bons de commande
            </p>

            <p className="text-3xl font-bold text-haigana-dark mt-1">
              {bons.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">

              <svg
                width="22"
                height="22"
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

            <p className="text-sm text-slate-500">
              Montant total
            </p>

            <p className="text-3xl font-bold text-haigana-dark mt-1">
              {formatMontant(total)}
            </p>

          </div>

        </section>

        {/* BONS DE COMMANDE */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 md:p-7 border-b border-slate-100">

            <h2 className="text-xl font-bold text-haigana-dark">
              Bons de commande
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Bons de commande enregistrés dans ce livret.
            </p>

          </div>

          {/* RECHERCHE + TRI */}

          <div className="p-6 border-b border-slate-100 bg-slate-50/50">

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">

              {/* RECHERCHE */}

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Rechercher un bon..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 bg-white text-haigana-dark placeholder-slate-400 focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/10 transition-all"
                />

                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  width="18"
                  height="18"
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

              </div>

              {/* TRI PAR */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/10"
              >

                <option value="date">
                  Trier par date
                </option>

                <option value="montant">
                  Trier par montant
                </option>

                <option value="description">
                  Trier par description
                </option>

                <option value="soa">
                  Trier par SOA
                </option>

                <option value="statut">
                  Trier par statut
                </option>

              </select>

              {/* ORDRE */}

              <button
                type="button"
                onClick={() =>
                  setSortOrder((current) =>
                    current === "asc"
                      ? "desc"
                      : "asc"
                  )
                }
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-haigana-dark font-semibold hover:bg-slate-100 transition-colors"
                title={
                  sortOrder === "asc"
                    ? "Ordre croissant"
                    : "Ordre décroissant"
                }
              >

                {sortOrder === "asc"
                  ? "↑ Croissant"
                  : "↓ Décroissant"}

              </button>

            </div>

            {/* RÉSULTATS */}

            <div className="flex items-center justify-between mt-3">

              <p className="text-xs text-slate-400">

                {search
                  ? `${bonsFiltres.length} résultat${
                      bonsFiltres.length !== 1
                        ? "s"
                        : ""
                    } trouvé${
                      bonsFiltres.length !== 1
                        ? "s"
                        : ""
                    }`
                  : `${bons.length} bon${
                      bons.length !== 1
                        ? "s"
                        : ""
                    } enregistré${
                      bons.length !== 1
                        ? "s"
                        : ""
                    }`}

              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="text-xs font-semibold text-haigana-blue hover:underline"
                >
                  Effacer la recherche
                </button>
              )}

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    SOA
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Statut
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Montant
                  </th>

                </tr>

              </thead>

              <tbody>

                {bonsFiltres.map((bon) => (

                  <tr
                    key={bon.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                  >

                    <td className="px-6 py-4 font-medium text-haigana-dark">
                      {bon.description || "-"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(bon.dateBon)}
                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {bon.codeSoa?.codeSoa ||
                          "-"}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      {bon.statut ===
                      "PAYE" ? (

                        <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700">
                          Payé
                        </span>

                      ) : (

                        <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
                          Non payé
                        </span>

                      )}

                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-haigana-dark">
                      {formatMontant(
                        bon.prixTotal
                      )}
                    </td>

                  </tr>

                ))}

                {bonsFiltres.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">

                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 4h12v16H6V4Z"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M9 8h6M9 12h6M9 16h4"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />

                          </svg>

                        </div>

                        <p className="font-semibold text-haigana-dark mt-4">
                          {search
                            ? "Aucun résultat"
                            : "Aucun bon de commande"}
                        </p>

                        <p className="text-sm text-slate-400 mt-1">

                          {search
                            ? "Aucun bon ne correspond à votre recherche."
                            : "Aucun bon n'est enregistré dans ce livret."}

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

              {bons.length > 0 && (

                <tfoot>

                  <tr className="border-t-2 border-slate-200 bg-slate-50">

                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right font-semibold text-haigana-dark"
                    >
                      Total
                    </td>

                    <td className="px-6 py-4 text-right text-lg font-bold text-haigana-dark">
                      {formatMontant(total)}
                    </td>

                  </tr>

                </tfoot>

              )}

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}