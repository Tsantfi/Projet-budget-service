import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { useAuth } from "../context/AuthContext";

export default function Don() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [dons, setDons] = useState([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("dateDon");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDons();
  }, []);

  async function loadDons() {
    setLoading(true);
    setError("");

    try {
      const { data } = await client.get("/dons");
      setDons(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les dons.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const valeur = search.toLowerCase().trim();

    const list = dons.filter((don) => {
      const reference =
        don.reference || "";

      const immatricule =
        don.immatricule || "";

      return (
        reference.toLowerCase().includes(valeur) ||
        immatricule.toLowerCase().includes(valeur)
      );
    });

    list.sort((a, b) => {
      if (sortValue === "dateDon") {
        return (
          (a.dateDon || "").localeCompare(
            b.dateDon || ""
          )
        );
      }

      if (sortValue === "somme") {
        return (
          Number(b.sommeRenverser || 0) -
          Number(a.sommeRenverser || 0)
        );
      }

      return 0;
    });

    return list;
  }, [dons, search, sortValue]);

  const total = useMemo(() => {
    return filtered.reduce(
      (total, don) =>
        total +
        (Number(don.sommeRenverser) || 0),
      0
    );
  }, [filtered]);

  function formatMontant(value) {
    return `${Number(
      value || 0
    ).toLocaleString("fr-FR")} Ar`;
  }

  async function handleDelete(don) {
    if (
      !window.confirm(
        `Voulez-vous supprimer ce don${
          don.reference
            ? ` (${don.reference})`
            : ""
        } ?`
      )
    ) {
      return;
    }

    try {
      await client.delete(`/dons/${don.id}`);

      setDons((prev) =>
        prev.filter((item) => item.id !== don.id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de supprimer le don."
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITRE */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          
          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>
    
          <span>/</span>
    
          <span className="text-haigana-dark font-medium">
            Don
          </span>
    
        </div>

        <h1 className="text-2xl font-bold text-haigana-dark">
          Dons du véhicule
        </h1>

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (
          <button
            onClick={() =>
              navigate("/patrimoine/don/nouveau")
            }
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
          >
            + Nouveau don
          </button>
        )}

      </div>

      {/* ERREUR */}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* RECHERCHE / TRI */}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher par référence ou immatricule..."
        sortOptions={[
          {
            value: "dateDon",
            label: "Date du don",
          },
          {
            value: "somme",
            label: "Somme",
          },
        ]}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      {/* TABLEAU */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-haigana-dark text-white">
            <tr>

              <th className="text-left px-4 py-3">
                Référence
              </th>

              <th className="text-left px-4 py-3">
                Véhicule
              </th>

              <th className="text-left px-4 py-3">
                Date du don
              </th>

              <th className="text-right px-4 py-3">
                Somme reversée
              </th>

              <th className="text-right px-4 py-3">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Chargement...
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((don) => (
                <tr
                  key={don.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  {/* REFERENCE */}

                  <td className="px-4 py-3 font-medium text-haigana-dark">
                    {don.reference || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {don.immatricule || "-"}
                  </td>

                  {/* DATE */}

                  <td className="px-4 py-3">
                    {don.dateDon
                      ? new Date(
                          don.dateDon
                        ).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>

                  {/* SOMME */}

                  <td className="px-4 py-3 text-right font-medium text-haigana-dark">
                    {formatMontant(
                      don.sommeRenverser
                    )}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-4 py-3 text-right">

                    <div className="flex justify-end gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/patrimoine/don/${don.id}/modifier`
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >
                        Modifier
                      </button>

                      {hasRole(
                        "ADMINISTRATEUR"
                      ) && (
                        <button
                          onClick={() =>
                            handleDelete(don)
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

            {!loading &&
              filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Aucun don trouvé.
                  </td>
                </tr>
              )}

          </tbody>

          {/* TOTAL */}

          {!loading &&
            filtered.length > 0 && (
              <tfoot>

                <tr className="border-t-2 border-gray-200 bg-haigana-bg/40 font-semibold">

                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right text-haigana-dark"
                  >
                    Total :
                  </td>

                  <td className="px-4 py-4 text-right text-haigana-dark">
                    {formatMontant(total)}
                  </td>

                  <td></td>

                </tr>

              </tfoot>
            )}

        </table>

      </div>
    </div>
  );
}

