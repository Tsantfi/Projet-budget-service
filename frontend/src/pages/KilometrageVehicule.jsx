import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import client from "../api/client";

export default function KilometrageVehicule() {
  const { id } = useParams();

  const [vehicule, setVehicule] = useState(null);
  const [deplacements, setDeplacements] = useState([]);

  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [recherche, setRecherche] = useState("");

  const [tri, setTri] = useState("dateDeplacement");
  const [ordre, setOrdre] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CHARGEMENT DU VEHICULE ET DES DEPLACEMENTS

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [vehiculeRes, deplacementsRes] = await Promise.all([
          client.get(`/vehicules/${id}`),
          client.get(`/deplacements?vehiculeId=${id}`),
        ]);

        console.log("Véhicule :", vehiculeRes.data);
        console.log("Déplacements :", deplacementsRes.data);

        setVehicule(vehiculeRes.data);

        const data = Array.isArray(deplacementsRes.data)
          ? deplacementsRes.data
          : deplacementsRes.data?.content || [];

        setDeplacements(data);
      } catch (err) {
        console.error("=== ERREUR KILOMETRAGE VEHICULE ===");
        console.error("Status :", err.response?.status);
        console.error("Data :", err.response?.data);
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Impossible de charger les déplacements du véhicule."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // ANNEES DISPONIBLES

  const anneesDisponibles = useMemo(() => {
    const annees = new Set();

    deplacements.forEach((item) => {
      if (item.dateDeplacement) {
        const date = new Date(item.dateDeplacement);

        if (!isNaN(date.getTime())) {
          annees.add(date.getFullYear());
        }
      }
    });

    // Toujours garder l'année actuelle disponible
    annees.add(new Date().getFullYear());

    return Array.from(annees).sort((a, b) => b - a);
  }, [deplacements]);

  // DEPLACEMENTS DE L'ANNEE

  const deplacementsAnnee = useMemo(() => {
    return deplacements.filter((item) => {
      if (!item.dateDeplacement) return false;

      const date = new Date(item.dateDeplacement);

      return (
        !isNaN(date.getTime()) &&
        date.getFullYear() === Number(annee)
      );
    });
  }, [deplacements, annee]);

  // RECHERCHE

  const deplacementsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) {
      return deplacementsAnnee;
    }

    return deplacementsAnnee.filter((item) => {
      const depart = item.lieuDepart || "";
      const arrivee = item.lieuArrivee || "";
      const ordreSortie = item.ordreSortie || "";
      const date = item.dateDeplacement || "";

      return (
        depart.toLowerCase().includes(terme) ||
        arrivee.toLowerCase().includes(terme) ||
        ordreSortie.toLowerCase().includes(terme) ||
        date.toLowerCase().includes(terme)
      );
    });
  }, [deplacementsAnnee, recherche]);

  // TRI

  const deplacementsTries = useMemo(() => {
    const resultat = [...deplacementsFiltres];

    resultat.sort((a, b) => {
      let valeurA;
      let valeurB;

      switch (tri) {
        case "dateDeplacement":
          valeurA = a.dateDeplacement
            ? new Date(a.dateDeplacement).getTime()
            : 0;

          valeurB = b.dateDeplacement
            ? new Date(b.dateDeplacement).getTime()
            : 0;
          break;

        case "dateFinParcours":
          valeurA = a.dateFinParcours
            ? new Date(a.dateFinParcours).getTime()
            : 0;

          valeurB = b.dateFinParcours
            ? new Date(b.dateFinParcours).getTime()
            : 0;
          break;

        case "distance":
          valeurA = Number(a.tableKilometrique || 0);
          valeurB = Number(b.tableKilometrique || 0);
          break;

        case "depart":
          valeurA = (a.lieuDepart || "").toLowerCase();
          valeurB = (b.lieuDepart || "").toLowerCase();
          break;

        case "arrivee":
          valeurA = (a.lieuArrivee || "").toLowerCase();
          valeurB = (b.lieuArrivee || "").toLowerCase();
          break;

        default:
          valeurA = 0;
          valeurB = 0;
      }

      if (valeurA < valeurB) {
        return ordre === "asc" ? -1 : 1;
      }

      if (valeurA > valeurB) {
        return ordre === "asc" ? 1 : -1;
      }

      return 0;
    });

    return resultat;
  }, [
    deplacementsFiltres,
    tri,
    ordre,
  ]);

  // TOTAL KM

  const totalKilometres = useMemo(() => {
    return deplacementsAnnee.reduce((total, item) => {
      return total + Number(item.tableKilometrique || 0);
    }, 0);
  }, [deplacementsAnnee]);

  // DISTANCE MOYENNE

  const distanceMoyenne = useMemo(() => {
    if (deplacementsAnnee.length === 0) return 0;

    return totalKilometres / deplacementsAnnee.length;
  }, [totalKilometres, deplacementsAnnee]);

  // PLUS LONG TRAJET

  const plusLongTrajet = useMemo(() => {
    if (deplacementsAnnee.length === 0) return 0;

    return Math.max(
      ...deplacementsAnnee.map((item) =>
        Number(item.tableKilometrique || 0)
      )
    );
  }, [deplacementsAnnee]);

  // DONNEES DU GRAPHE

  const donneesGraphe = useMemo(() => {
    const groupes = {};

    deplacementsAnnee.forEach((item) => {
      if (!item.dateDeplacement) return;

      const date = new Date(item.dateDeplacement);

      if (isNaN(date.getTime())) return;

      const jour = date.toISOString().split("T")[0];

      if (!groupes[jour]) {
        groupes[jour] = {
          date: jour,
          distance: 0,
        };
      }

      groupes[jour].distance += Number(
        item.tableKilometrique || 0
      );
    });

    return Object.values(groupes)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        dateAffichage: new Date(
          item.date
        ).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
      }));
  }, [deplacementsAnnee]);

  // FORMAT DATE

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("fr-FR");
  }

  // FORMAT KM

  function formatKm(value) {
    return Number(value || 0).toLocaleString("fr-FR", {
      maximumFractionDigits: 2,
    });
  }

  // CHANGEMENT TRI

  function handleTriChange(e) {
    setTri(e.target.value);
    setOrdre("asc");
  }

  // CHARGEMENT

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-500">
          Chargement des déplacements...
        </div>
      </div>
    );
  }

  // AFFICHAGE

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*EN-TETE*/}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7 ">

        <div>

          <p className="text-sm text-gray-500 mb-1 mt-4">
            Véhicule
          </p>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Distance parcourue
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Suivi des déplacements du véhicule
          </p>
        </div>

        <Link
          to={`/patrimoine/vehicule/${id}/situation`}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Retour au situation
        </Link>

      </div>

      {/*ERREUR*/}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {/*INFORMATIONS VEHICULE*/}

      {vehicule && (
        <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Immatriculation
              </p>

              <p className="font-semibold text-haigana-dark">
                {vehicule.immatricule || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Genre
              </p>

              <p className="font-semibold text-haigana-dark">
                {vehicule.genre?.genreVehicule || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Marque
              </p>

              <p className="font-semibold text-haigana-dark">
                {vehicule.marque?.marqueVehicule || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Année sélectionnée
              </p>

              <p className="font-semibold text-haigana-blue">
                {annee}
              </p>
            </div>

          </div>

        </div>
      )}

      {/*FILTRES*/}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ANNEE */}

          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Année
            </label>

            <select
              value={annee}
              onChange={(e) => setAnnee(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all"
            >
              {anneesDisponibles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* RECHERCHE */}

          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Rechercher
            </label>

            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Départ, arrivée, date..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all"
            />
          </div>

          {/* TRI */}

          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Trier par
            </label>

            <div className="flex gap-2">

              <select
                value={tri}
                onChange={handleTriChange}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all"
              >
                <option value="dateDeplacement">
                  Date de déplacement
                </option>

                <option value="dateFinParcours">
                  Date de fin
                </option>

                <option value="distance">
                  Distance
                </option>

                <option value="depart">
                  Lieu de départ
                </option>

                <option value="arrivee">
                  Lieu d'arrivée
                </option>
              </select>

              <button
                type="button"
                onClick={() =>
                  setOrdre((prev) =>
                    prev === "asc" ? "desc" : "asc"
                  )
                }
                className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-haigana-dark font-semibold"
                title={
                  ordre === "asc"
                    ? "Ordre croissant"
                    : "Ordre décroissant"
                }
              >
                {ordre === "asc" ? "↑" : "↓"}
              </button>

            </div>
          </div>

        </div>

      </div>

      {/*STATISTIQUES*/}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* TOTAL */}

        <div className="bg-white rounded-2xl shadow-card p-5">

          <p className="text-sm text-gray-500">
            Distance totale
          </p>

          <p className="text-2xl font-bold text-haigana-blue mt-1">
            {formatKm(totalKilometres)} km
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Année {annee}
          </p>

        </div>

        {/* MOYENNE */}

        <div className="bg-white rounded-2xl shadow-card p-5">

          <p className="text-sm text-gray-500">
            Distance moyenne
          </p>

          <p className="text-2xl font-bold text-haigana-dark mt-1">
            {formatKm(distanceMoyenne)} km
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Par déplacement
          </p>

        </div>

        {/* PLUS LONG */}

        <div className="bg-white rounded-2xl shadow-card p-5">

          <p className="text-sm text-gray-500">
            Plus longue distance
          </p>

          <p className="text-2xl font-bold text-haigana-gold mt-1">
            {formatKm(plusLongTrajet)} km
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Sur l'année {annee}
          </p>

        </div>

      </div>

      {/*GRAPHE*/}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">

          <div>
            <h2 className="text-lg font-semibold text-haigana-dark">
              Évolution de la distance parcourue
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Distance parcourue par jour en {annee}
            </p>
          </div>

          <div className="text-sm font-semibold text-haigana-blue">
            {formatKm(totalKilometres)} km
          </div>

        </div>

        <div className="w-full h-[350px]">

          {donneesGraphe.length === 0 ? (

            <div className="h-full flex items-center justify-center text-gray-400">
              Aucun déplacement enregistré pour {annee}.
            </div>

          ) : (

            <ResponsiveContainer width="100%" height="100%">

              <LineChart
                data={donneesGraphe}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="dateAffichage"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  unit=" km"
                />

                <Tooltip
                  formatter={(value) => [
                    `${formatKm(value)} km`,
                    "Distance",
                  ]}
                  labelFormatter={(label) =>
                    `Date : ${label}`
                  }
                />

                <Line
                  type="monotone"
                  dataKey="distance"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

      {/*TABLEAU*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

          <div>
            <h2 className="text-lg font-semibold text-haigana-dark">
              Déplacements de {annee}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {deplacementsTries.length} déplacement
              {deplacementsTries.length > 1 ? "s" : ""}
              affiché
              {deplacementsTries.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="text-sm font-semibold text-haigana-blue">
            Total : {formatKm(totalKilometres)} km
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  #
                </th>

                <th className="text-left px-4 py-3">
                  Date
                </th>

                <th className="text-left px-4 py-3">
                  Départ
                </th>

                <th className="text-left px-4 py-3">
                  Arrivée
                </th>

                <th className="text-right px-4 py-3">
                  Distance
                </th>

                <th className="text-left px-4 py-3">
                  Fin du parcours
                </th>

                <th className="text-left px-4 py-3">
                  Ordre
                </th>

              </tr>

            </thead>

            <tbody>

              {deplacementsTries.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucun déplacement trouvé.
                  </td>

                </tr>

              ) : (

                deplacementsTries.map((item, index) => (

                  <tr
                    key={item.id || index}
                    className="border-t border-gray-100 hover:bg-haigana-bg/50 transition-colors"
                  >

                    <td className="px-4 py-3 text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-haigana-dark">
                      {formatDate(item.dateDeplacement)}
                    </td>

                    <td className="px-4 py-3">
                      {item.lieuDepart || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {item.lieuArrivee || "-"}
                    </td>

                    <td className="px-4 py-3 text-right">

                      <span className="font-semibold text-haigana-blue">
                        {formatKm(item.tableKilometrique)} km
                      </span>

                    </td>

                    <td className="px-4 py-3">
                      {formatDate(item.dateFinParcours)}
                    </td>

                    <td className="px-4 py-3">

                      {item.ordreSortie ? (

                        <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          {item.ordreSortie}
                        </span>

                      ) : (
                        "-"
                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

            {deplacementsTries.length > 0 && (

              <tfoot>

                <tr className="border-t border-gray-200 bg-haigana-bg/40 font-semibold">

                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right"
                  >
                    Total
                  </td>

                  <td className="px-4 py-3 text-right text-haigana-blue">
                    {formatKm(
                      deplacementsTries.reduce(
                        (total, item) =>
                          total +
                          Number(
                            item.tableKilometrique || 0
                          ),
                        0
                      )
                    )}{" "}
                    km
                  </td>

                  <td colSpan={2}></td>

                </tr>

              </tfoot>

            )}

          </table>

        </div>

      </div>

    </div>
  );
}
