import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { useAuth } from "../context/AuthContext";

export default function Entree() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [entrees, setEntrees] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("dateEntree");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntrees();
  }, []);

  async function loadEntrees() {
    setLoading(true);
    setError("");

    try {
      const [entreesRes, vehiculesRes] = await Promise.all([
        client.get("/entrees"),
        client.get("/vehicules"),
      ]);

      setEntrees(entreesRes.data);
      setVehicules(vehiculesRes.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les entrées.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();

    const list = entrees.filter((e) => {
      const reference = e.reference?.toLowerCase() || "";
      const immatricule =
        e.vehicule?.immatricule?.toLowerCase() || "";
      const type = e.type?.toLowerCase() || "";

      return (
        reference.includes(value) ||
        immatricule.includes(value) ||
        type.includes(value)
      );
    });

    return [...list].sort((a, b) => {
      if (sortValue === "reference") {
        return (a.reference || "").localeCompare(
          b.reference || ""
        );
      }

      if (sortValue === "dateEntree") {
        return (b.dateEntree || "").localeCompare(
          a.dateEntree || ""
        );
      }

      if (sortValue === "vehicule") {
        return (a.vehicule?.immatricule || "").localeCompare(
          b.vehicule?.immatricule || ""
        );
      }

      return 0;
    });
  }, [entrees, search, sortValue]);

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR");
  }

  async function handleDelete(id) {
    const entree = entrees.find((e) => e.id === id);

    if (
      !window.confirm(
        `Voulez-vous supprimer l'entrée ${
          entree?.reference || `#${id}`
        } ?`
      )
    ) {
      return;
    }

    try {
      await client.delete(`/entrees/${id}`);

      setEntrees((prev) =>
        prev.filter((e) => e.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de supprimer cette entrée."
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        Entrées
      </h1>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher par référence, véhicule ou type..."
        sortOptions={[
          {
            value: "dateEntree",
            label: "Date d'entrée",
          },
          {
            value: "reference",
            label: "Référence",
          },
          {
            value: "vehicule",
            label: "Véhicule",
          },
        ]}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        {loading ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Chargement des entrées...
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">
              <tr>
                <th className="text-left px-4 py-3">
                  Référence
                </th>

                <th className="text-left px-4 py-3">
                  Date
                </th>

                <th className="text-left px-4 py-3">
                  Type
                </th>

                <th className="text-left px-4 py-3">
                  Véhicule
                </th>

                <th className="text-left px-4 py-3">
                  Pièce
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3 font-medium text-haigana-dark">
                    {e.reference || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(e.dateEntree)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs bg-haigana-blue/10 text-haigana-blue">
                      {e.type || "Non défini"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {e.vehicule?.immatricule || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {e.pieceJustificativeUrl ? (
                      <a
                        href={e.pieceJustificativeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >
                        Voir
                      </a>
                    ) : (
                      <span className="text-gray-400">
                        Aucune
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/patrimoine/entree/${e.id}/consultation`
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
                          onClick={() =>
                            navigate(
                              `/patrimoine/entree/${e.id}/modifier`
                            )
                          }
                          className="text-haigana-dark hover:text-haigana-blue font-medium"
                        >
                          Modifier
                        </button>
                      )}

                      {hasRole("ADMINISTRATEUR") && (
                        <button
                          onClick={() =>
                            handleDelete(e.id)
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

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucune entrée trouvée.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        )}

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (
          <div className="p-4 border-t border-gray-100 flex justify-end">

            <button
              onClick={() =>
                navigate("/patrimoine/entree/nouveau")
              }
              className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
            >
              Nouvelle entrée
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
