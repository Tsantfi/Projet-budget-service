import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SearchSortBar from "../components/SearchSortBar";

const emptyForm = {
  datePv: "",
  descriptionDegat: "",
  pieceJustificativeUrl: "",
};

export default function VehiculeProcesVerbal() {
  const { id, constatationId } = useParams();
  const { hasRole } = useAuth();

  const [pvList, setPvList] = useState([]);
  const [soaId, setSoaId] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // RECHERCHE ET TRI

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("datePv");
  const [sortDirection, setSortDirection] = useState("desc");

  // CHARGEMENT DES PV

  async function loadPv() {
    setError("");

    try {
      const response = await client.get(
        `/proces-verbaux?constatationId=${constatationId}`
      );

      setPvList(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Impossible de charger les procès-verbaux."
      );
    }
  }

  useEffect(() => {
    loadPv();

    client
      .get(`/vehicules/${id}`)
      .then((r) => {
        setSoaId(r.data.codeSoa?.id || "");
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            "Impossible de récupérer le SOA du véhicule."
        );
      });
  }, [id, constatationId]);

  // RECHERCHE + TRI

  const filteredAndSortedPv = useMemo(() => {
    const term = search.trim().toLowerCase();

    let result = pvList.filter((pv) => {
      if (!term) return true;

      return (
        (pv.datePv || "").toLowerCase().includes(term) ||
        (pv.descriptionDegat || "").toLowerCase().includes(term) ||
        (pv.pieceJustificativeUrl || "").toLowerCase().includes(term)
      );
    });

    result.sort((a, b) => {
      let valueA = a[sortField] ?? "";
      let valueB = b[sortField] ?? "";

      if (sortField === "id") {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else {
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [pvList, search, sortField, sortDirection]);

  function handleSortChange(e) {
    setSortField(e.target.value);
  }

  function toggleSortDirection() {
    setSortDirection((current) =>
      current === "asc" ? "desc" : "asc"
    );
  }

  // FORMULAIRE

  function set(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  function openAjouter() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError("");
  }

  function openModifier(pv) {
    setEditingId(pv.id);

    setForm({
      datePv: pv.datePv || "",
      descriptionDegat: pv.descriptionDegat || "",
      pieceJustificativeUrl: pv.pieceJustificativeUrl || "",
    });

    setFormOpen(true);
    setError("");
  }

  // AJOUT / MODIFICATION

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        constatation: {
          id: Number(constatationId),
        },
        datePv: form.datePv || null,
        descriptionDegat: form.descriptionDegat,
        pieceJustificativeUrl:
          form.pieceJustificativeUrl || null,
      };

      if (editingId) {
        await client.put(
          `/proces-verbaux/${editingId}`,
          payload
        );
      } else {
        await client.post("/proces-verbaux", payload);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPv();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Erreur lors de l'enregistrement du PV."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // SUPPRESSION

  async function handleSupprimer() {
    if (!deleteTarget) return;

    setError("");
    setSubmitting(true);

    try {
      await client.delete(
        `/proces-verbaux/${deleteTarget}`
      );

      setDeleteTarget(null);

      await loadPv();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Erreur lors de la suppression."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // CLASSES

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // AFFICHAGE

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* =========================
            EN-TETE */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-2xl font-bold text-haigana-dark">
              Procès-verbal
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Procès-verbaux de la constatation
            </p>
          </div>

          {hasRole("ADMINISTRATEUR") && (
            <button
              onClick={openAjouter}
              className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
            >
              Ajouter un PV
            </button>
          )}

        </div>

        {/* =========================
            ERREUR */}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* =========================
            RECHERCHE + TRI */}

        <div className="mb-5">

          <SearchSortBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Rechercher par date, description ou document..."
          />

          <div className="flex flex-wrap items-center justify-end gap-3 mt-3">

            <label className="text-sm text-gray-500">
              Trier par :
            </label>

            <select
              value={sortField}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-haigana-blue"
            >
              <option value="datePv">
                Date du PV
              </option>

              <option value="descriptionDegat">
                Description du dégât
              </option>

              <option value="pieceJustificativeUrl">
                Document
              </option>

              <option value="id">
                ID
              </option>
            </select>

            <button
              type="button"
              onClick={toggleSortDirection}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-haigana-dark hover:bg-haigana-bg transition-colors"
            >
              {sortDirection === "asc"
                ? "↑ Croissant"
                : "↓ Décroissant"}
            </button>

          </div>

        </div>

        {/* =========================
            LISTE DES PV */}

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Date du PV
                </th>

                <th className="text-left px-4 py-3">
                  Description du dégât
                </th>

                <th className="text-left px-4 py-3">
                  Lien
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredAndSortedPv.map((pv) => (

                <tr
                  key={pv.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3">
                    {pv.datePv || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {pv.descriptionDegat || "-"}
                  </td>

                  <td className="px-4 py-3">

                    {pv.pieceJustificativeUrl ? (
                      <a
                        href={pv.pieceJustificativeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-haigana-blue hover:underline"
                      >
                        Voir le document
                      </a>
                    ) : (
                      <span className="text-gray-400">
                        Aucun
                      </span>
                    )}

                  </td>

                  <td className="px-4 py-3 text-right space-x-3">

                    {hasRole(
                      "ADMINISTRATEUR",
                      "MODIFICATEUR"
                    ) && (
                      <button
                        onClick={() => openModifier(pv)}
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >
                        Modifier
                      </button>
                    )}

                    {hasRole("ADMINISTRATEUR") && (
                      <button
                        onClick={() =>
                          setDeleteTarget(pv.id)
                        }
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer
                      </button>
                    )}

                  </td>

                </tr>

              ))}

              {filteredAndSortedPv.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    {search
                      ? "Aucun procès-verbal ne correspond à la recherche."
                      : "Aucun procès-verbal enregistré pour cette constatation."}
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            BON DE COMMANDE */}

        <div className="flex justify-end">

          <Link
            to={`/patrimoine/vehicule/bon-commande?soaId=${soaId}`}
            className="px-6 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
          >
            Bon de commande
          </Link>

        </div>

        {/* =========================
            FORMULAIRE AJOUT / MODIFICATION */}

        {formOpen && (

          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setFormOpen(false)}
          >

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >

              <h3 className="font-semibold text-haigana-dark mb-4">

                {editingId
                  ? "Modifier le PV"
                  : "Ajouter un PV"}

              </h3>

              <label className={labelClass}>
                Date du PV
              </label>

              <input
                type="date"
                value={form.datePv}
                onChange={(e) =>
                  set("datePv", e.target.value)
                }
                className={`${inputClass} mb-3`}
              />

              <label className={labelClass}>
                Description du dégât
              </label>

              <textarea
                value={form.descriptionDegat}
                onChange={(e) =>
                  set(
                    "descriptionDegat",
                    e.target.value
                  )
                }
                rows={3}
                className={`${inputClass} mb-3`}
              />

              <label className={labelClass}>
                Lien du document (pièce justificative)
              </label>

              <input
                value={form.pieceJustificativeUrl}
                onChange={(e) =>
                  set(
                    "pieceJustificativeUrl",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="https://..."
              />

              <div className="flex justify-end gap-2 mt-5">

                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-haigana-dark text-white font-semibold disabled:opacity-60"
                >
                  {submitting
                    ? "Enregistrement..."
                    : editingId
                    ? "Modifier"
                    : "Enregistrer"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* =========================
            CONFIRMATION SUPPRESSION */}

        {deleteTarget && (

          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteTarget(null)}
          >

            <div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >

              <h3 className="font-semibold text-red-600 mb-3">
                Supprimer ce PV ?
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Cette action est irréversible.
              </p>

              <div className="flex justify-end gap-2">

                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  Annuler
                </button>

                <button
                  onClick={handleSupprimer}
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
                >
                  {submitting
                    ? "Suppression..."
                    : "Confirmer"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}
