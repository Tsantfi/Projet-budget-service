import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  typeDuVehicule: "",
};

export default function TypeVehiculeAdmin() {
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const {hasRole} = useAuth();

  async function loadTypes() {
    try {
      const response = await client.get(
        "/reference/types"
      );

      setTypes(response.data);

    } catch (err) {
      console.error(
        "Erreur chargement types de véhicules :",
        err
      );

      setError(
        "Impossible de charger les types de véhicules."
      );
    }
  }

  useEffect(() => {
    loadTypes();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      typeDuVehicule: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.typeDuVehicule.trim()) {
      setError(
        "Le type de véhicule est obligatoire."
      );

      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        typeDuVehicule:
          form.typeDuVehicule.trim(),
      };

      if (editingId) {

        await client.put(
          `/reference/types/${editingId}`,
          payload
        );

        setSuccess(
          "Type de véhicule modifié avec succès."
        );

      } else {

        await client.post(
          "/reference/types",
          payload
        );

        setSuccess(
          "Type de véhicule ajouté avec succès."
        );
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadTypes();

    } catch (err) {

      console.error(
        "Erreur type véhicule :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Une erreur est survenue."
      );

    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(item) {

    setEditingId(item.id);

    setForm({
      typeDuVehicule:
        item.typeDuVehicule || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {

    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  async function handleDelete(id) {

    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce type de véhicule ?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {

      await client.delete(
        `/reference/types/${id}`
      );

      setSuccess(
        "Type de véhicule supprimé avec succès."
      );

      await loadTypes();

    } catch (err) {

      console.error(
        "Erreur suppression type véhicule :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer ce type de véhicule."
      );
    }
  }

  const filtered = types.filter((item) =>
    item.typeDuVehicule
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
        
        <Link
          to="/gestion"
          className="hover:text-haigana-blue transition-colors"
        >
          Gestion
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Etat
        </span>

      </div>

      <h1 className="text-2xl font-bold text-haigana-dark mb-2">
        Gestion des types de véhicules
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Ajoutez, modifiez ou supprimez les types de
        véhicules disponibles.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-8 mb-8"
      >

        <h2 className="text-lg font-semibold text-haigana-dark mb-4">
          {editingId
            ? "Modifier un type de véhicule"
            : "Ajouter un type de véhicule"}
        </h2>

        <div>

          <label className={labelClass}>
            Type de véhicule *
          </label>

          <input
            type="text"
            required
            value={form.typeDuVehicule}
            onChange={handleChange}
            className={inputClass}
            placeholder="Ex : Véhicule particulier"
          />

        </div>

        {error && (
          <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-5 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              (!editingId && hasRole("MODIFICATEUR"))
            }
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
          >
            {submitting
              ? "Enregistrement..."
              : !editingId && hasRole("MODIFICATEUR")
              ? "Admin seulement"
              : editingId
              ? "Modifier le type"
              : "Ajouter le type"}
          </button>

        </div>

      </form>

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher un type de véhicule..."
      />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-haigana-dark text-white">

            <tr>

              <th className="text-left px-4 py-3">
                ID
              </th>

              <th className="text-left px-4 py-3">
                Type de véhicule
              </th>

              <th className="text-center px-4 py-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((item) => (

              <tr
                key={item.id}
                className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
              >

                <td className="px-4 py-3 text-gray-500">
                  {item.id}
                </td>

                <td className="px-4 py-3 font-medium text-haigana-dark">
                  {item.typeDuVehicule}
                </td>

                <td className="px-4 py-3">

                  <div className="flex justify-center gap-2">

                  {((hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR"))  && (
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-haigana-blue hover:bg-blue-50 transition-colors"
                    >
                      Modifier
                    </button>
                  ))}

                  {hasRole("ADMINISTRATEUR") && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
                  colSpan={3}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Aucun type de véhicule enregistré.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
