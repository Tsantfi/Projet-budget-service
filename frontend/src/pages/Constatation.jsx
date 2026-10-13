import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Constatation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const controleId = searchParams.get("controleId");

  const [controle, setControle] = useState(null);
  const [constatations, setConstatations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!controleId) {
      setError("Aucun contrôle sélectionné.");
      setLoading(false);
      return;
    }

    loadData();
  }, [controleId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // Récupération du contrôle
      const controleResponse = await client.get(
        `/controles/${controleId}`
      );

      setControle(controleResponse.data);

      // Récupération des constatations
      const constatationsResponse = await client.get(
        `/constatations?controleId=${controleId}`
      );

      setConstatations(constatationsResponse.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les constatations."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette constatation ?"
    );

    if (!confirmation) return;

    try {
      await client.delete(`/constatations/${id}`);

      setConstatations((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de supprimer la constatation."
      );
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR");
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400">
          Chargement des constatations...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITRE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-haigana-dark">
            Constatations
          </h1>

          {controle?.vehicule && (
            <p className="text-sm text-gray-500 mt-1">
              Véhicule :{" "}
              <span className="font-medium text-haigana-dark">
                {controle.vehicule.immatricule || "-"}
              </span>
            </p>
          )}
        </div>

        {/* AJOUT : ADMIN UNIQUEMENT */}
        {hasRole("ADMINISTRATEUR") && (
          <button
            onClick={() =>
              navigate(
                `/patrimoine/vehicule/constatation/nouveau?controleId=${controleId}`
              )
            }
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
          >
            Nouvelle constatation
          </button>
        )}
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* INFORMATIONS DU CONTROLE */}
      {controle && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

          <h2 className="text-lg font-semibold text-haigana-dark mb-4">
            Informations du contrôle
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <p className="text-xs text-gray-400">
                Véhicule
              </p>

              <p className="font-medium text-haigana-dark">
                {controle.vehicule?.immatricule || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Date du contrôle
              </p>

              <p className="font-medium text-haigana-dark">
                {formatDate(controle.dateControle)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Description
              </p>

              <p className="font-medium text-haigana-dark">
                {controle.description || "-"}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Date constat
                </th>

                <th className="text-left px-4 py-3">
                  Départ
                </th>

                <th className="text-left px-4 py-3">
                  Arrivée
                </th>

                <th className="text-left px-4 py-3">
                  Raison
                </th>

                <th className="text-left px-4 py-3">
                  Dégât
                </th>

                <th className="text-left px-4 py-3">
                  Description
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {constatations.map((item) => (

                <tr
                  key={item.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3">
                    {formatDate(item.dateConstat)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(item.dateDepart)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(item.dateArrivee)}
                  </td>

                  <td className="px-4 py-3">
                    {item.raisonDeplacement || "-"}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        item.degat
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {item.degat || "Aucun"}
                    </span>

                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <span className="line-clamp-2">
                      {item.descriptionConstat || "-"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">

                    <div className="flex justify-end items-center gap-3">

                      {/* MODIFIER */}
                      {hasRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                      ) && (
                        <button
                          onClick={() =>
                            navigate(
                              `/patrimoine/vehicule/constatation/${item.id}/modifier`
                            )
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-medium"
                        >
                          Modifier
                        </button>
                      )}

                      {/* SUPPRIMER */}
                      {hasRole("ADMINISTRATEUR") && (
                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

              {constatations.length === 0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucune constatation pour ce contrôle.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* RETOUR */}
      <div className="mt-6">

        <button
          onClick={() => navigate(-1)}
          className="text-haigana-blue hover:text-haigana-dark font-medium"
        >
          ← Retour
        </button>

      </div>

    </div>
  );
}
