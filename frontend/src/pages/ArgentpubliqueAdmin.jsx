import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

export default function ArgentpubliqueAdmin() {

  const [fonds, setFonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedFonds, setSelectedFonds] = useState(null);

  // FORMULAIRE

  const [form, setForm] = useState({
    montantTotal: "",
    montantUtilise: "0",
  });

  // RÔLE UTILISATEUR

  const getUserRole = () => {
    try {
      const user =
        JSON.parse(localStorage.getItem("haigana_user")) ||
        JSON.parse(localStorage.getItem("user"));

      if (user?.role) {
        return user.role;
      }

      if (user?.roles && Array.isArray(user.roles)) {
        return user.roles[0];
      }

      const role = localStorage.getItem("role");

      return role || "";
    } catch {
      return localStorage.getItem("role") || "";
    }
  };

  const role = getUserRole();

  const isAdmin =
    role === "ADMINISTRATEUR" ||
    role === "ROLE_ADMINISTRATEUR";

  // MESSAGE D'ERREUR

  const getErrorMessage = (err, defaultMessage) => {
    const data = err?.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.title) {
      return data.title;
    }

    return defaultMessage;
  };

  // CHARGEMENT

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get(
        "/argent-public-vehicule"
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setFonds(data);
      } else if (data) {
        setFonds([data]);
      } else {
        setFonds([]);
      }

    } catch (err) {
      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Impossible de charger les données de l'argent public."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // RECHERCHE

  const filteredFonds = useMemo(() => {

    const value = search.trim().toLowerCase();

    if (!value) {
      return fonds;
    }

    return fonds.filter((item) => {

      const total =
        item.montantTotal?.toString() || "";

      const disponible =
        item.montantDisponible?.toString() || "";

      const utilise =
        item.montantUtilise?.toString() || "";

      const id =
        item.id?.toString() || "";

      return (
        id.toLowerCase().includes(value) ||
        total.toLowerCase().includes(value) ||
        disponible.toLowerCase().includes(value) ||
        utilise.toLowerCase().includes(value)
      );
    });

  }, [fonds, search]);

  // FORMULAIRE

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OUVRIR MODALE AJOUT

  const openCreateModal = () => {

    if (!isAdmin) return;

    setEditingId(null);

    setForm({
      montantTotal: "",
      montantUtilise: "0",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // OUVRIR MODALE MODIFICATION

  const openEditModal = (item) => {

    if (!isAdmin) return;

    setEditingId(item.id);

    setForm({
      montantTotal:
        item.montantTotal ?? "",

      montantUtilise:
        item.montantUtilise ?? "0",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // DÉTAILS

  const openDetails = (item) => {

    setSelectedFonds(item);
    setShowDetailModal(true);
  };

  // FERMER MODALE

  const closeModal = () => {

    if (saving) return;

    setShowModal(false);
    setEditingId(null);

    setForm({
      montantTotal: "",
      montantUtilise: "0",
    });
  };

  // FORMAT MONTANT

  const formatMontant = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0 Ar";
    }

    return `${Number(value).toLocaleString("fr-FR")} Ar`;
  };

  // FORMAT DATE

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleString("fr-FR");
    } catch {
      return "-";
    }
  };

  // CALCUL DU DISPONIBLE

  const getDisponible = (item) => {

    const total =
      Number(item.montantTotal) || 0;

    const utilise =
      Number(item.montantUtilise) || 0;

    return total - utilise;
  };

  // AJOUT / MODIFICATION

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!isAdmin) {
      return;
    }

    setError("");
    setSuccess("");

    const montantTotal =
      Number(form.montantTotal);

    const montantUtilise =
      form.montantUtilise === ""
        ? 0
        : Number(form.montantUtilise);

    // ----------------------------------------------------------
    // VALIDATION MONTANT TOTAL
    // ----------------------------------------------------------

    if (
      form.montantTotal === "" ||
      Number.isNaN(montantTotal)
    ) {
      setError(
        "Le montant total est obligatoire."
      );
      return;
    }

    if (montantTotal < 0) {

      setError(
        "Le montant total ne peut pas être négatif."
      );

      return;
    }

    // ----------------------------------------------------------
    // VALIDATION MONTANT UTILISÉ
    // ----------------------------------------------------------

    if (Number.isNaN(montantUtilise)) {

      setError(
        "Le montant utilisé est invalide."
      );

      return;
    }

    if (montantUtilise < 0) {

      setError(
        "Le montant utilisé ne peut pas être négatif."
      );

      return;
    }

    if (montantUtilise > montantTotal) {

      setError(
        "Le montant utilisé ne peut pas être supérieur au montant total."
      );

      return;
    }

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload = {
      montantTotal,
      montantUtilise,
    };

    try {

      setSaving(true);

      if (editingId) {

        await client.put(
          `/argent-public-vehicule/${editingId}`,
          payload
        );

        setSuccess(
          "L'argent public a été modifié avec succès."
        );

      } else {

        await client.post(
          "/argent-public-vehicule",
          payload
        );

        setSuccess(
          "L'argent public a été ajouté avec succès."
        );
      }

      setShowModal(false);

      setForm({
        montantTotal: "",
        montantUtilise: "0",
      });

      setEditingId(null);

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          editingId
            ? "Impossible de modifier l'argent public."
            : "Impossible d'ajouter l'argent public."
        )
      );

    } finally {

      setSaving(false);
    }
  };

  // SUPPRESSION

  const handleDelete = async (id) => {

    if (!isAdmin) {
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cet argent public ?"
    );

    if (!confirmation) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await client.delete(
        `/argent-public-vehicule/${id}`
      );

      setSuccess(
        "L'argent public a été supprimé avec succès."
      );

      await loadData();

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Impossible de supprimer l'argent public."
        )
      );
    }
  };

  // STATISTIQUES

  const totalGlobal = useMemo(() => {

    return fonds.reduce(
      (total, item) =>
        total +
        (Number(item.montantTotal) || 0),
      0
    );

  }, [fonds]);

  const totalUtilise = useMemo(() => {

    return fonds.reduce(
      (total, item) =>
        total +
        (Number(item.montantUtilise) || 0),
      0
    );

  }, [fonds]);

  const totalDisponible = useMemo(() => {

    return fonds.reduce(
      (total, item) =>
        total +
        (Number(item.montantDisponible) || 0),
      0
    );

  }, [fonds]);

  // AFFICHAGE

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">

      {/*EN-TÊTE
      ======================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

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
              Argent public
            </span>

          </div>

          <h1 className="text-3xl font-bold text-haigana-dark">
            Argent public
          </h1>

          <p className="text-gray-500 mt-1">
            Gestion des fonds publics destinés aux véhicules
          </p>

        </div>

        {isAdmin && (

          <button
            type="button"
            onClick={openCreateModal}
            className="
              inline-flex items-center justify-center
              px-5 py-3
              rounded-xl
              bg-haigana-dark
              text-white
              font-semibold
              shadow-card
              hover:opacity-90
              transition
            "
          >
            + Ajouter un fonds
          </button>

        )}

      </div>

      {/*MESSAGES
      ======================================================== */}

      {error && (

        <div className="
          rounded-xl
          border border-red-200
          bg-red-50
          px-4 py-3
          text-sm text-red-700
        ">
          {error}
        </div>

      )}

      {success && (

        <div className="
          rounded-xl
          border border-green-200
          bg-green-50
          px-4 py-3
          text-sm text-green-700
        ">
          {success}
        </div>

      )}

      {/*STATISTIQUES
      ======================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-2xl shadow-card p-6">

          <p className="text-sm font-medium text-gray-500">
            Montant total alloué
          </p>

          <p className="mt-2 text-2xl font-bold text-haigana-dark">
            {formatMontant(totalGlobal)}
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">

          <p className="text-sm font-medium text-gray-500">
            Montant utilisé
          </p>

          <p className="mt-2 text-2xl font-bold text-haigana-dark">
            {formatMontant(totalUtilise)}
          </p>

        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">

          <p className="text-sm font-medium text-gray-500">
            Argent disponible
          </p>

          <p className="mt-2 text-2xl font-bold text-haigana-dark">
            {formatMontant(totalDisponible)}
          </p>

        </div>

      </div>

      {/*RECHERCHE
      ======================================================== */}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher un montant..."
      />

      {/*TABLEAU
      ======================================================== */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100">

          <h2 className="text-xl font-bold text-haigana-dark">
            Fonds publics
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {filteredFonds.length} résultat
            {filteredFonds.length > 1 ? "s" : ""}
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center">

            <div className="animate-pulse text-gray-500">
              Chargement des données...
            </div>

          </div>

        ) : filteredFonds.length === 0 ? (

          <div className="p-10 text-center">

            <p className="text-gray-500">
              Aucun fonds public trouvé.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="bg-haigana-dark text-white">

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Montant total
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Montant utilisé
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Disponible
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Date création
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Date modification
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredFonds.map((item) => (

                  <tr
                    key={item.id}
                    className="
                      border-t
                      border-gray-100
                      hover:bg-haigana-bg/60
                      transition
                    "
                  >

                    <td className="px-5 py-4">

                      <span className="font-semibold text-haigana-dark">
                        #{item.id}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="font-medium text-gray-700">
                        {formatMontant(item.montantTotal)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="font-medium text-gray-700">
                        {formatMontant(item.montantUtilise)}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span className="font-semibold text-haigana-dark">
                        {formatMontant(
                          item.montantDisponible ??
                          getDisponible(item)
                        )}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(item.dateCreation)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(item.dateModification)}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-4">

                        <button
                          type="button"
                          onClick={() => openDetails(item)}
                          className="
                            text-haigana-blue
                            font-semibold
                            text-sm
                            hover:underline
                            transition
                          "
                        >
                          Voir
                        </button>

                        {isAdmin && (

                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="
                                text-haigana-blue
                                font-semibold
                                text-sm
                                hover:underline
                                transition
                              "
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="
                                text-red-600
                                font-semibold
                                text-sm
                                hover:underline
                                transition
                              "
                            >
                              Supprimer
                            </button>
                          </>

                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/*MODALE AJOUT / MODIFICATION
      ======================================================== */}

      {showModal && isAdmin && (

        <div className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/40 p-4
        ">

          <div className="
            w-full max-w-lg
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            <div className="px-6 py-5 border-b border-gray-100">

              <h2 className="text-xl font-bold text-haigana-dark">

                {editingId
                  ? "Modifier l'argent public"
                  : "Ajouter un fonds public"}

              </h2>

              <p className="text-sm text-gray-500 mt-1">

                {editingId
                  ? "Modifier les informations du fonds."
                  : "Enregistrer un nouveau fonds public."}

              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* MONTANT TOTAL */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Montant total alloué
                </label>

                <input
                  type="number"
                  name="montantTotal"
                  value={form.montantTotal}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Ex : 50000000"
                  className="
                    w-full
                    rounded-xl
                    border border-gray-200
                    px-4 py-3
                    text-gray-700
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                    transition
                  "
                />

              </div>

              {/* MONTANT UTILISÉ */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Montant utilisé
                </label>

                <input
                  type="number"
                  name="montantUtilise"
                  value={form.montantUtilise}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Ex : 10000000"
                  className="
                    w-full
                    rounded-xl
                    border border-gray-200
                    px-4 py-3
                    text-gray-700
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                    transition
                  "
                />

              </div>

              {/* APERÇU DISPONIBLE */}

              <div className="
                rounded-xl
                bg-haigana-bg
                border border-gray-100
                px-4 py-4
              ">

                <p className="text-sm text-gray-500">
                  Argent disponible
                </p>

                <p className="
                  mt-1
                  text-xl
                  font-bold
                  text-haigana-dark
                ">
                  {formatMontant(
                    Math.max(
                      0,
                      (Number(form.montantTotal) || 0) -
                      (Number(form.montantUtilise) || 0)
                    )
                  )}
                </p>

              </div>

              {/* BOUTONS */}

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    border border-gray-200
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                    transition
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5 py-2.5
                    rounded-xl
                    bg-haigana-dark
                    text-white
                    font-semibold
                    shadow-card
                    hover:opacity-90
                    transition
                    disabled:opacity-50
                  "
                >

                  {saving
                    ? "Enregistrement..."
                    : editingId
                    ? "Modifier"
                    : "Ajouter"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/*MODALE DÉTAILS
      ======================================================== */}

      {showDetailModal && selectedFonds && (

        <div className="
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/40 p-4
        ">

          <div className="
            w-full max-w-lg
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          ">

            <div className="
              px-6 py-5
              border-b border-gray-100
              flex items-center justify-between
            ">

              <div>

                <h2 className="text-xl font-bold text-haigana-dark">
                  Détails de l'argent public
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Informations du fonds
                </p>

              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="
                  w-9 h-9
                  rounded-xl
                  flex items-center justify-center
                  text-gray-500
                  hover:bg-gray-100
                  hover:text-gray-800
                  transition
                "
              >
                ×
              </button>

            </div>

            <div className="p-6 space-y-4">

              <div className="
                flex items-center justify-between
                py-3 border-b border-gray-100
              ">

                <span className="text-sm text-gray-500">
                  ID
                </span>

                <span className="font-semibold text-haigana-dark">
                  #{selectedFonds.id}
                </span>

              </div>

              <div className="
                flex items-center justify-between
                py-3 border-b border-gray-100
              ">

                <span className="text-sm text-gray-500">
                  Montant total
                </span>

                <span className="font-semibold text-haigana-dark">
                  {formatMontant(
                    selectedFonds.montantTotal
                  )}
                </span>

              </div>

              <div className="
                flex items-center justify-between
                py-3 border-b border-gray-100
              ">

                <span className="text-sm text-gray-500">
                  Montant utilisé
                </span>

                <span className="font-semibold text-gray-700">
                  {formatMontant(
                    selectedFonds.montantUtilise
                  )}
                </span>

              </div>

              <div className="
                flex items-center justify-between
                py-3 border-b border-gray-100
              ">

                <span className="text-sm text-gray-500">
                  Argent disponible
                </span>

                <span className="font-bold text-haigana-dark">
                  {formatMontant(
                    selectedFonds.montantDisponible ??
                    getDisponible(selectedFonds)
                  )}
                </span>

              </div>

              <div className="
                flex items-center justify-between
                py-3 border-b border-gray-100
              ">

                <span className="text-sm text-gray-500">
                  Date de création
                </span>

                <span className="text-sm font-semibold text-gray-700">
                  {formatDate(
                    selectedFonds.dateCreation
                  )}
                </span>

              </div>

              <div className="
                flex items-center justify-between
                py-3
              ">

                <span className="text-sm text-gray-500">
                  Date de modification
                </span>

                <span className="text-sm font-semibold text-gray-700">
                  {formatDate(
                    selectedFonds.dateModification
                  )}
                </span>

              </div>

            </div>

            <div className="
              px-6 pb-6
              flex justify-end
            ">

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="
                  px-5 py-2.5
                  rounded-xl
                  bg-haigana-dark
                  text-white
                  font-semibold
                  shadow-card
                  hover:opacity-90
                  transition
                "
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}