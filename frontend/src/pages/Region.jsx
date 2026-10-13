import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const emptyForm = {
  nomRegion: "",
};

export default function Region() {
  const { hasRole } = useAuth();

  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false)
  // CHARGER LES REGIO

  async function loadRegions() {
    try {
      setError("");

      const { data } = await client.get(
        "/reference/regions"
      );

      setRegions(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Erreur chargement régions :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les régions."
      );
    }
  }

  useEffect(() => {
    loadRegions();
  }, []);

  // MODIFICATION DU FORMULAIRE

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

  function openModifier(region) {
    setEditingId(region.id);

    setForm({
      nomRegion: region.nomRegion || "",
    });

    setError("");
    setFormOpen(true);
  }

  // ENREGISTRER

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const nomRegion = form.nomRegion.trim();

    if (!nomRegion) {
      setError(
        "Le nom de la région est obligatoire."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nomRegion,
      };

      if (editingId) {
        await client.put(
          `/reference/regions/${editingId}`,
          payload
        );
      } else {
        await client.post(
          "/reference/regions",
          payload
        );
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadRegions();

    } catch (err) {
      console.error(
        "Erreur enregistrement région :",
        err
      );

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
        `/reference/regions/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      await loadRegions();

    } catch (err) {
      console.error(
        "Erreur suppression région :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer cette région."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // RECHERCHE

  const filteredRegions = regions
    .filter((region) => {
      const valeur = search
        .toLowerCase()
        .trim();

      return (
        region.nomRegion
          ?.toLowerCase()
          .includes(valeur)
      );
    })
    .sort((a, b) => {
      const nomA = (
        a.nomRegion || ""
      ).toLowerCase();

      const nomB = (
        b.nomRegion || ""
      ).toLowerCase();

      return nomA.localeCompare(
        nomB,
        "fr",
        { numeric: true }
      );
    });

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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

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
              Région
            </span>

          </div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Régions
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des régions de référence.
          </p>

        </div>

        {hasRole("ADMINISTRATEUR") && (
          <button
            onClick={openAjouter}
            className="
              px-5
              py-2.5
              rounded-lg
              bg-haigana-dark
              text-white
              font-medium
              hover:bg-haigana-blue
              transition-colors
            "
          >
            Ajouter une région
          </button>
        )}

      </div>

      {/*   ERREUR
         ===================================================== */}

      {error && (
        <p
          className="
            text-sm
            text-red-600
            bg-red-50
            border
            border-red-100
            rounded-lg
            px-3
            py-2
            mb-4
          "
        >
          {error}
        </p>
      )}

      {/*   RECHERCHE
         ===================================================== */}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <label className={labelClass}>
          Rechercher
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Rechercher une région..."
          className={inputClass}
        />

      </div>

      {/*   TABLEAU
         ===================================================== */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Région
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredRegions.map((region) => (

                <tr
                  key={region.id}
                  className="
                    border-t
                    border-gray-100
                    hover:bg-haigana-bg/60
                    transition-colors
                  "
                >

                  <td className="
                    px-4
                    py-3
                    font-medium
                    text-haigana-dark
                  ">
                    {region.nomRegion || "-"}
                  </td>

                  <td className="
                    px-4
                    py-3
                    text-right
                    space-x-4
                  ">

                    {/* MODIFIER */}

                    {hasRole(
                      "ADMINISTRATEUR",
                      "MODIFICATEUR"
                    ) && (

                      <button
                        onClick={() =>
                          openModifier(region)
                        }
                        className="
                          text-haigana-blue
                          hover:text-haigana-dark
                          font-medium
                        "
                      >
                        Modifier
                      </button>

                    )}

                    {/* SUPPRIMER */}

                    {hasRole("ADMINISTRATEUR") && (

                      <button
                        onClick={() =>
                          setDeleteTarget(region)
                        }
                        className="
                          text-red-600
                          hover:text-red-800
                          font-medium
                        "
                      >
                        Supprimer
                      </button>

                    )}

                  </td>

                </tr>

              ))}

              {filteredRegions.length === 0 && (

                <tr>

                  <td
                    colSpan={2}
                    className="
                      px-4
                      py-8
                      text-center
                      text-gray-400
                    "
                  >
                    Aucune région trouvée.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/*   MODALE AJOUT / MODIFICATION
         ===================================================== */}

      {formOpen && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
          onClick={() =>
            setFormOpen(false)
          }
        >

          <form
            onSubmit={handleSubmit}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
              max-w-md
              w-full
            "
          >

            <h3 className="
              font-semibold
              text-haigana-dark
              mb-5
              text-lg
            ">

              {editingId
                ? "Modifier la région"
                : "Ajouter une région"}

            </h3>

            {/* NOM */}

            <label className={labelClass}>
              Nom de la région
            </label>

            <input
              type="text"
              value={form.nomRegion}
              onChange={(e) =>
                set(
                  "nomRegion",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Boeny"
              required
              autoFocus
            />

            {/* BOUTONS */}

            <div className="
              flex
              justify-end
              gap-2
              mt-6
            ">

              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="
                  px-5
                  py-2
                  rounded-lg
                  bg-haigana-dark
                  text-white
                  font-semibold
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Enregistrement..."
                  : "Enregistrer"}
              </button>

            </div>

          </form>

        </div>

      )}

      {/*   MODALE SUPPRESSION
         ===================================================== */}

      {deleteTarget && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
          onClick={() =>
            setDeleteTarget(null)
          }
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
              max-w-md
              w-full
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="
              font-semibold
              text-red-600
              mb-3
            ">
              Supprimer cette région ?
            </h3>

            <p className="
              text-sm
              text-gray-500
              mb-4
            ">
              Voulez-vous vraiment supprimer{" "}
              <strong>
                {deleteTarget.nomRegion}
              </strong>
              {" "}?
            </p>

            <p className="
              text-xs
              text-gray-400
              mb-5
            ">
              Cette action est irréversible.
            </p>

            <div className="
              flex
              justify-end
              gap-2
            ">

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                Annuler
              </button>

              <button
                onClick={handleSupprimer}
                disabled={submitting}
                className="
                  px-5
                  py-2
                  rounded-lg
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-60
                "
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