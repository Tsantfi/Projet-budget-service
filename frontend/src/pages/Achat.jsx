import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link} from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { useAuth } from "../context/AuthContext";

export default function Achat() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [achats, setAchats] = useState([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("dateAchat");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchats();
  }, []);

  async function loadAchats() {
    setLoading(true);
    setError("");

    try {
      const { data } = await client.get("/achats");
      setAchats(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger les achats."
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const value = search.toLowerCase().trim();

    const list = achats.filter((a) => {
    const reference =
    a.reference?.toLowerCase() || "";

    const immatricule =
      a.immatricule?.toLowerCase() || "";

      return (
        reference.includes(value) ||
        immatricule.includes(value)
      );
    });

    return [...list].sort((a, b) => {
      if (sortValue === "dateAchat") {
        return (b.dateAchat || "").localeCompare(
          a.dateAchat || ""
        );
      }

      if (sortValue === "sommePayer") {
        return (
          Number(b.sommePayer || 0) -
          Number(a.sommePayer || 0)
        );
      }

      if (sortValue === "reference") {
        return (
          a.entree?.reference || ""
        ).localeCompare(
          b.entree?.reference || ""
        );
      }

      return 0;
    });
  }, [achats, search, sortValue]);

  const totalAchats = useMemo(() => {
    return filtered.reduce(
      (total, achat) =>
        total + (Number(achat.sommePayer) || 0),
      0
    );
  }, [filtered]);

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("fr-FR");
  }

  function formatMontant(montant) {
    return `${Number(
      montant || 0
    ).toLocaleString("fr-FR")} Ar`;
  }

  async function handleDelete(id) {
    const achat = achats.find(
      (a) => a.id === id
    );

    if (
      !window.confirm(
        `Voulez-vous supprimer cet achat ?`
      )
    ) {
      return;
    }

    try {
      await client.delete(`/achats/${id}`);

      setAchats((prev) =>
        prev.filter((a) => a.id !== id)
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de supprimer cet achat."
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
      
      <Link
        to="/gestion"
        className="hover:text-haigana-blue transition-colors"
      >
        Gestion
      </Link>

      <span>/</span>

      <span className="text-haigana-dark font-medium">
        Achat
      </span>

    </div>

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        Achats
      </h1>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher par référence ou immatricule..."
        sortOptions={[
          {
            value: "dateAchat",
            label: "Date d'achat",
          },
          {
            value: "sommePayer",
            label: "Montant",
          },
          {
            value: "reference",
            label: "Référence",
          },
        ]}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        {loading ? (
          <div className="px-4 py-10 text-center text-gray-400">
            Chargement des achats...
          </div>
        ) : (
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
                  Date d'achat
                </th>

                <th className="text-right px-4 py-3">
                  Somme payée
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3 font-medium text-haigana-dark">
                    {a.reference || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {a.immatricule || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(a.dateAchat)}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-haigana-dark">
                    {formatMontant(a.sommePayer)}
                  </td>

                  <td className="px-4 py-3 text-right">

                    <div className="flex justify-end gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/patrimoine/achat/${a.id}/consultation`
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
                              `/patrimoine/achat/${a.id}/modifier`
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
                            handleDelete(a.id)
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
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucun achat trouvé.
                  </td>
                </tr>
              )}

            </tbody>

            {filtered.length > 0 && (
              <tfoot>

                <tr className="border-t-2 border-gray-200 bg-haigana-bg/40 font-semibold">

                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right text-haigana-dark"
                  >
                    Total des achats :
                  </td>

                  <td className="px-4 py-4 text-right text-haigana-dark">
                    {formatMontant(totalAchats)}
                  </td>

                  <td></td>

                </tr>

              </tfoot>
            )}

          </table>
        )}

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (
          <div className="p-4 border-t border-gray-100 flex justify-end">

            <button
              onClick={() =>
                navigate("/patrimoine/achat/nouveau")
              }
              className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
            >
              Nouvel achat
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
