import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const emptyForm = {
  nomMinistere: "",
  districtMinistere: "",
};

export default function Ministere() {
  const { hasRole } = useAuth();

  const [ministeres, setMinisteres] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("nomMinistere");
  const [sortDirection, setSortDirection] = useState("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  // CHARGER LES MINISTERES


  async function loadMinisteres() {
    try {
      setError("");

      const { data } = await client.get("/reference/ministeres");

      setMinisteres(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Impossible de charger les ministères."
      );
    }
  }

  useEffect(() => {
    loadMinisteres();
  }, []);


  // CHANGEMENT FORMULAIRE


  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // AJOUTER

  function openAjouter() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  // MODIFIER

  function openModifier(ministere) {
    setEditingId(ministere.id);

    setForm({
      nomMinistere: ministere.nomMinistere || "",
      districtMinistere: ministere.districtMinistere || "",
    });

    setError("");
    setFormOpen(true);
  }

  // ENREGISTRER

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.nomMinistere.trim()) {
      setError("Le nom du ministère est obligatoire.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nomMinistere: form.nomMinistere.trim(),
        districtMinistere:
          form.districtMinistere.trim() || null,
      };

      if (editingId) {
        await client.put(
          `/reference/ministeres/${editingId}`,
          payload
        );
      } else {
        await client.post(
          "/reference/ministeres",
          payload
        );
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadMinisteres();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement."
      );
    } finally {
      setSubmitting(false);
    }
  }


  // SUPPRIMER


  async function handleSupprimer() {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError("");

    try {
        await client.delete(
        `/reference/ministeres/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      await loadMinisteres();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer ce ministère."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // RECHERCHE

const filteredMinisteres = ministeres
  .filter((ministere) => {
    const valeur = search.toLowerCase();

    return (
      ministere.nomMinistere
        ?.toLowerCase()
        .includes(valeur) ||
      ministere.districtMinistere
        ?.toLowerCase()
        .includes(valeur)
    );
  })
  .sort((a, b) => {
    const valeurA = (a[sortField] || "").toString().toLowerCase();
    const valeurB = (b[sortField] || "").toString().toLowerCase();

    const comparaison = valeurA.localeCompare(
      valeurB,
      "fr",
      { numeric: true }
    );

    return sortDirection === "asc"
      ? comparaison
      : -comparaison;
  });


  // CLASSES


  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITRE */}



      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          
          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>
  
          <span>/</span>
  
          <span className="text-haigana-dark font-medium">
            Ministre
          </span>
  
        </div>

        <h1 className="text-2xl font-bold text-haigana-dark">
          Ministères
        </h1>

        {hasRole("ADMINISTRATEUR") && (
          <button
            onClick={openAjouter}
            className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
          >
            Ajouter un ministère
          </button>
        )}

      </div>

      {/* ERREUR */}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* RECHERCHE */}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    {/* RECHERCHE */}

    <div className="md:col-span-2">

      <label className={labelClass}>
        Rechercher
      </label>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Nom du ministère ou district..."
        className={inputClass}
      />

    </div>

    {/* TRI */}

    <div>

            <label className={labelClass}>
              Trier par
            </label>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] =
                  e.target.value.split("-");

                setSortField(field);
                setSortDirection(direction);
              }}
              className={inputClass}
            >

              <option value="nomMinistere-asc">
                Ministère — A à Z
              </option>

              <option value="nomMinistere-desc">
                Ministère — Z à A
              </option>

              <option value="districtMinistere-asc">
                District — A à Z
              </option>

              <option value="districtMinistere-desc">
                District — Z à A
              </option>

            </select>

          </div>

        </div>

      </div>

      </div>

      {/* TABLEAU */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-haigana-dark text-white">

            <tr>

              <th className="text-left px-4 py-3">
                Ministère
              </th>

              <th className="text-left px-4 py-3">
                District
              </th>

              <th className="text-right px-4 py-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredMinisteres.map((ministere) => (

              <tr
                key={ministere.id}
                className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
              >

                <td className="px-4 py-3 font-medium text-haigana-dark">
                  {ministere.nomMinistere || "-"}
                </td>

                <td className="px-4 py-3">
                  {ministere.districtMinistere || "-"}
                </td>

                <td className="px-4 py-3 text-right space-x-4">

                  {/* MODIFIER */}

                  {hasRole(
                    "ADMINISTRATEUR",
                    "MODIFICATEUR"
                  ) && (
                    <button
                      onClick={() =>
                        openModifier(ministere)
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
                        setDeleteTarget(ministere)
                      }
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Supprimer
                    </button>
                  )}

                </td>

              </tr>

            ))}

            {filteredMinisteres.length === 0 && (

              <tr>

                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Aucun ministère trouvé.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/*MODALE AJOUT / MODIFICATION*/}

      {formOpen && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setFormOpen(false)}
        >

          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
          >

            <h3 className="font-semibold text-haigana-dark mb-5 text-lg">

              {editingId
                ? "Modifier le ministère"
                : "Ajouter un ministère"}

            </h3>

            {/* NOM */}

            <label className={labelClass}>
              Nom du ministère
            </label>

            <input
              type="text"
              value={form.nomMinistere}
              onChange={(e) =>
                set(
                  "nomMinistere",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : Ministère des Finances"
              required
            />

            {/* DISTRICT */}

            <label className={labelClass}>
              District
            </label>

            <input
              type="text"
              value={form.districtMinistere}
              onChange={(e) =>
                set(
                  "districtMinistere",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Mahajanga I"
            />

            {/* BOUTONS */}

            <div className="flex justify-end gap-2 mt-6">

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
                  : "Enregistrer"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/* =========================
          MODALE SUPPRESSION*/}

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
              Supprimer ce ministère ?
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Voulez-vous vraiment supprimer{" "}
              <strong>
                {deleteTarget.nomMinistere}
              </strong>
              {" "}?
            </p>

            <p className="text-xs text-gray-400 mb-5">
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
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
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
  );
};