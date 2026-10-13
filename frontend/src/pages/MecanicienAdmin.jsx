import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = {
  nomMecanicien: "",
  districtMecanicien: "",
};

export default function MecanicienAdmin() {
  const [mecaniciens, setMecaniciens] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  // CHARGEMENT

  async function loadMecaniciens() {
    try {
      const response = await client.get("/mecaniciens");
      setMecaniciens(response.data);
    } catch (err) {
      console.error("Erreur chargement mécaniciens :", err);
      setError("Impossible de charger les mécaniciens.");
    }
  }

  useEffect(() => {
    loadMecaniciens();
  }, []);

  // FORMULAIRE

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  // AJOUT / MODIFICATION

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (!form.nomMecanicien.trim()) {
        throw new Error("Le nom du mécanicien est obligatoire.");
      }

      const payload = {
        nomMecanicien: form.nomMecanicien.trim(),
        districtMecanicien:
          form.districtMecanicien.trim() || null,
      };

      if (editingId) {
        await client.put(
          `/mecaniciens/${editingId}`,
          payload
        );

        setSuccess(
          "Le mécanicien a été modifié avec succès."
        );
      } else {
        await client.post("/mecaniciens", payload);

        setSuccess(
          "Le mécanicien a été ajouté avec succès."
        );
      }

      resetForm();
      await loadMecaniciens();

    } catch (err) {
      console.error(
        "Erreur enregistrement mécanicien :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'enregistrement du mécanicien."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // MODIFICATION

  function handleEdit(mecanicien) {
    setEditingId(mecanicien.id);

    setForm({
      nomMecanicien:
        mecanicien.nomMecanicien || "",

      districtMecanicien:
        mecanicien.districtMecanicien || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // SUPPRESSION

  async function handleDelete(id) {
    const mecanicien = mecaniciens.find(
      (m) => m.id === id
    );

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le mécanicien "${
        mecanicien?.nomMecanicien || ""
      }" ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await client.delete(`/mecaniciens/${id}`);

      setSuccess(
        "Le mécanicien a été supprimé avec succès."
      );

      if (editingId === id) {
        resetForm();
      }

      await loadMecaniciens();

    } catch (err) {
      console.error(
        "Erreur suppression mécanicien :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer le mécanicien."
      );
    }
  }

  // RECHERCHE

  const filtered = mecaniciens.filter((m) => {
    const value = search.toLowerCase();

    return (
      m.nomMecanicien
        ?.toLowerCase()
        .includes(value) ||
      m.districtMecanicien
        ?.toLowerCase()
        .includes(value)
    );
  });

  // STYLE

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // AFFICHAGE

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* TITRE */}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
      <Link
        to="/gestion"
        className="hover:text-haigana-blue transition-colors"
      >
        Gestion
      </Link>

      <span>/</span>

      <span className="text-haigana-dark font-medium">
        Mecanicien
      </span>

    </div>

      <h1 className="text-2xl font-bold text-haigana-dark mb-2">
        Gestion des mécaniciens
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Ajoutez, modifiez ou supprimez les mécaniciens
        responsables de la maintenance des véhicules.
      </p>

      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-8 space-y-6 mb-8"
      >

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-semibold text-haigana-dark">
              {editingId
                ? "Modifier le mécanicien"
                : "Ajouter un mécanicien"}
            </h2>

            <p className="text-sm text-gray-500">
              Renseignez les informations du mécanicien.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* NOM */}

          <div>
            <label className={labelClass}>
              Nom du mécanicien *
            </label>

            <input
              required
              value={form.nomMecanicien}
              onChange={(e) =>
                set(
                  "nomMecanicien",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : RAKOTO Jean"
            />
          </div>

          {/* DISTRICT */}

          <div>
            <label className={labelClass}>
              District
            </label>

            <input
              value={form.districtMecanicien}
              onChange={(e) =>
                set(
                  "districtMecanicien",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Mahajanga I"
            />
          </div>

        </div>

        {/* MESSAGES */}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        {/* BOUTON */}

        <div className="flex justify-end border-t border-gray-100 pt-5">

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
          >
            {submitting
              ? "Enregistrement..."
              : editingId
              ? "Modifier le mécanicien"
              : "Ajouter le mécanicien"}
          </button>

        </div>

      </form>

      {/* RECHERCHE */}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher un mécanicien..."
      />

      {/* TABLEAU */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-haigana-dark text-white">

            <tr>

              <th className="text-left px-4 py-3">
                Nom du mécanicien
              </th>

              <th className="text-left px-4 py-3">
                District
              </th>

              <th className="text-center px-4 py-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((mecanicien) => (

              <tr
                key={mecanicien.id}
                className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
              >

                <td className="px-4 py-3 font-medium text-haigana-dark">
                  {mecanicien.nomMecanicien || "-"}
                </td>

                <td className="px-4 py-3">
                  {mecanicien.districtMecanicien || "-"}
                </td>

                <td className="px-4 py-3">

                  <div className="flex justify-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(mecanicien)
                      }
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-haigana-blue bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          mecanicien.id
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      Supprimer
                    </button>

                  </div>

                </td>

              </tr>

            ))}

            {filtered.length === 0 && (

              <tr>

                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Aucun mécanicien enregistré.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

