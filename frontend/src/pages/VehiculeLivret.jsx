import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  annee: "",
  dateEcriture: "",
};

export default function VehiculeLivret() {
  const { hasRole } = useAuth();

  const [livrets, setLivrets] = useState([]);
  const [bons, setBons] = useState([]);
  const [selectedLivret, setSelectedLivret] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingBons, setLoadingBons] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  // CHARGER LES LIVRETS

  async function loadLivrets() {
    try {
      setLoading(true);
      setError("");

      const { data } = await client.get("/livrets");

      // Sécurité : toujours un tableau
      setLivrets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement livrets :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les livrets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLivrets();
  }, []);

  // CHARGER LES BONS DU LIVRET

  async function loadBons(livret) {
    try {
      setSelectedLivret(livret);
      setLoadingBons(true);
      setError("");

      const { data } = await client.get(
        `/livrets/${livret.id}/bons`
      );

      setBons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement bons :", err);

      setBons([]);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les bons de commande."
      );
    } finally {
      setLoadingBons(false);
    }
  }

  // FORMULAIRE

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAjouter() {
    setEditingId(null);

    setForm({
      annee: "",
      dateEcriture: new Date().toISOString().split("T")[0],
    });

    setError("");
    setFormOpen(true);
  }

  function openModifier(livret) {
    setEditingId(livret.id);

    setForm({
      annee: livret.annee || "",
      dateEcriture: livret.dateEcriture || "",
    });

    setError("");
    setFormOpen(true);
  }

  // ENREGISTREMENT

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        annee: Number(form.annee),
        dateEcriture: form.dateEcriture || null,
      };

      if (editingId) {
        await client.put(
          `/livrets/${editingId}`,
          payload
        );
      } else {
        await client.post("/livrets", payload);
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadLivrets();
    } catch (err) {
      console.error("Erreur enregistrement livret :", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erreur lors de l'enregistrement du livret."
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
        `/livrets/${deleteTarget.id}`
      );

      if (selectedLivret?.id === deleteTarget.id) {
        setSelectedLivret(null);
        setBons([]);
      }

      setDeleteTarget(null);

      await loadLivrets();
    } catch (err) {
      console.error("Erreur suppression livret :", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer ce livret."
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
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-haigana-dark">
            Livret
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des livrets annuels et des bons de commande
          </p>
        </div>

        {hasRole("ADMINISTRATEUR") && (
          <button
            onClick={openAjouter}
            className="px-5 py-2.5 rounded-lg bg-haigana-dark
                       text-white font-medium
                       hover:bg-haigana-blue transition-colors"
          >
            + Ajouter un livret
          </button>
        )}
      </div>

      {/*ERREUR*/}

      {error && (
        <div className="text-sm text-red-600 bg-red-50
                        border border-red-100 rounded-lg
                        px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/*LISTE DES LIVRETS*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">

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

            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Chargement des livrets...
                </td>
              </tr>
            )}

            {!loading &&
              livrets.map((livret) => {

                const anneeActuelle =
                  new Date().getFullYear();

                const estCourant =
                  livret.annee === anneeActuelle;

                const estSelectionne =
                  selectedLivret?.id === livret.id;

                return (
                  <tr
                    key={livret.id}
                    className={`border-t border-gray-100
                      hover:bg-haigana-bg/60 transition-colors
                      ${
                        estSelectionne
                          ? "bg-haigana-bg/40"
                          : ""
                      }`}
                  >

                    <td className="px-4 py-3 font-medium text-haigana-dark">
                      Livret {livret.annee}
                    </td>

                    <td className="px-4 py-3">
                      {livret.dateEcriture || "-"}
                    </td>

                    <td className="px-4 py-3">

                      {estCourant ? (
                        <span
                          className="px-2.5 py-1 rounded-full
                                     text-xs bg-haigana-gold/20
                                     text-haigana-dark"
                        >
                          Année courante
                        </span>
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full
                                     text-xs bg-gray-100
                                     text-gray-600"
                        >
                          Archivé
                        </span>
                      )}

                    </td>

                    <td className="px-4 py-3 text-right space-x-3">

                      <button
                        onClick={() => loadBons(livret)}
                        className="text-haigana-blue
                                   hover:text-haigana-dark
                                   font-medium"
                      >
                        Consulter
                      </button>

                      {hasRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                      ) &&
                        estCourant && (
                          <button
                            onClick={() =>
                              openModifier(livret)
                            }
                            className="text-haigana-blue
                                       hover:text-haigana-dark
                                       font-medium"
                          >
                            Modifier
                          </button>
                        )}

                      {hasRole("ADMINISTRATEUR") &&
                        estCourant && (
                          <button
                            onClick={() =>
                              setDeleteTarget(livret)
                            }
                            className="text-red-600
                                       hover:text-red-800
                                       font-medium"
                          >
                            Supprimer
                          </button>
                        )}

                    </td>
                  </tr>
                );
              })}

            {!loading &&
              livrets.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Aucun livret enregistré.
                  </td>
                </tr>
              )}

          </tbody>
        </table>
      </div>

      {/*BONS DU LIVRET*/}

      {selectedLivret && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-haigana-dark">
              Bons de commande — Livret {selectedLivret.annee}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Liste des bons associés à ce livret.
            </p>

          </div>

          {loadingBons ? (
            <div className="px-6 py-8 text-center text-gray-400">
              Chargement des bons...
            </div>
          ) : (
            <table className="w-full text-sm">

              <thead className="bg-haigana-bg">
                <tr>
                  <th className="text-left px-4 py-3">
                    Numéro
                  </th>

                  <th className="text-left px-4 py-3">
                    Date
                  </th>

                  <th className="text-left px-4 py-3">
                    Objet
                  </th>

                  <th className="text-right px-4 py-3">
                    Montant
                  </th>
                </tr>
              </thead>

              <tbody>

                {bons.map((bon) => (
                  <tr
                    key={bon.id}
                    className="border-t border-gray-100"
                  >
                    <td className="px-4 py-3 font-medium">
                      {bon.numeroBon || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {bon.dateBon || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {bon.objet || "-"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {bon.montant
                        ? `${bon.montant.toLocaleString(
                            "fr-FR"
                          )} Ar`
                        : "0 Ar"}
                    </td>
                  </tr>
                ))}

                {bons.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Aucun bon de commande dans ce livret.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          )}

        </div>
      )}

      {/*MODALE AJOUT / MODIFICATION*/}

      {formOpen && (
        <div
          className="fixed inset-0 bg-black/40
                     flex items-center justify-center
                     z-50 p-4"
          onClick={() => setFormOpen(false)}
        >

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl
                       p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-semibold text-haigana-dark mb-5">
              {editingId
                ? "Modifier le livret"
                : "Ajouter un livret"}
            </h3>

            {/* ANNEE */}

            <label className={labelClass}>
              Année
            </label>

            <input
              type="number"
              value={form.annee}
              onChange={(e) =>
                set("annee", e.target.value)
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : 2026"
              min="2000"
              max="2100"
              disabled={!!editingId}
              required
            />

            {/* DATE */}

            <label className={labelClass}>
              Date d'écriture
            </label>

            <input
              type="date"
              value={form.dateEcriture}
              onChange={(e) =>
                set("dateEcriture", e.target.value)
              }
              className={inputClass}
              required
            />

            {/* BOUTONS */}

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded-lg text-gray-500
                           hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg
                           bg-haigana-dark text-white
                           font-semibold
                           disabled:opacity-60"
              >
                {submitting
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/*MODALE SUPPRESSION*/}

      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/40
                     flex items-center justify-center
                     z-50 p-4"
          onClick={() => setDeleteTarget(null)}
        >

          <div
            className="bg-white rounded-2xl shadow-2xl
                       p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-semibold text-red-600 mb-3">
              Supprimer le livret {deleteTarget.annee} ?
            </h3>

            <p className="text-sm text-gray-500 mb-5">
              Cette action est irréversible.
              Si le livret contient des bons de commande,
              la suppression sera refusée.
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-gray-500
                           hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                onClick={handleSupprimer}
                disabled={submitting}
                className="px-5 py-2 rounded-lg
                           bg-red-600 text-white
                           font-semibold
                           disabled:opacity-60"
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
}