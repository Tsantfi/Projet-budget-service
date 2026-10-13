import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  immatriculeVehicule: "",
  dateCondamnation: "",
  lieuCondamnation: "",
  description: "",
};

const getErrorMessage = (err, defaultMessage) => {
  const { hasRole } = useAuth();
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

export default function CondamnationAdmin() {
  const [condamnations, setCondamnations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [selectedCondamnation, setSelectedCondamnation] =
    useState(null);

  const [form, setForm] = useState(emptyForm);
  const { hasRole } = useAuth();

  // CHARGEMENT

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get("/condamnations");

      setCondamnations(response.data || []);
    } catch (err) {
      console.error("Erreur chargement condamnations :", err);

      setError(
        getErrorMessage(
          err,
          "Impossible de charger les condamnations."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // RECHERCHE

  // RECHERCHE AJUSTÉE (SANS LA RÉFÉRENCE DE SORTIE)
  const filteredCondamnations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return condamnations;
    }

    return condamnations.filter((c) => {
      return (
        c.immatriculeVehicule
          ?.toLowerCase()
          .includes(value) ||
        c.lieuCondamnation
          ?.toLowerCase()
          .includes(value) ||
        c.description
          ?.toLowerCase()
          .includes(value) ||
        c.piece
          ?.toLowerCase()
          .includes(value) ||
        c.dateCondamnation
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [condamnations, search]);


  // FORMULAIRE

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OUVRIR MODIFICATION

  const openEditModal = async (id) => {
    try {
      setError("");
      setSuccess("");

      const response = await client.get(`/condamnations/${id}`);
      const c = response.data;

      setEditingId(id);

      setForm({
        immatriculeVehicule: c.immatriculeVehicule || "",
        dateCondamnation: c.dateCondamnation || "",
        lieuCondamnation: c.lieuCondamnation || "",
        description: c.description || "",
        piece: c.piece || "", // <-- AJOUTÉ : Charge la référence de la pièce
      });

      setShowModal(true);

    } catch (err) {
      console.error("Erreur chargement condamnation :", err);
      setError(getErrorMessage(err, "Impossible de modifier la condamnation."));
    }
  };


  // MODIFIER

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId) {
      return;
    }

    setError("");
    setSuccess("");

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!form.immatriculeVehicule.trim()) {
      setError("L'immatriculation est obligatoire.");
      return;
    }

    if (!form.dateCondamnation) {
      setError(
        "La date de condamnation est obligatoire."
      );
      return;
    }

    if (!form.lieuCondamnation.trim()) {
      setError(
        "Le lieu de condamnation est obligatoire."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        immatriculeVehicule: form.immatriculeVehicule.trim(),
        dateCondamnation: form.dateCondamnation,
        lieuCondamnation: form.lieuCondamnation.trim(),
        description: form.description.trim() || null,
        piece: form.piece.trim() || null, // <-- AJOUTÉ : Envoie la pièce modifiée au serveur
      };



      // =====================================================
      // UNIQUEMENT PUT
      // =====================================================

      await client.put(
        `/condamnations/${editingId}`,
        payload
      );

      setSuccess(
        "La condamnation a été modifiée avec succès."
      );

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(
        "Erreur modification condamnation :",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de modifier la condamnation."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // SUPPRESSION

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette condamnation ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await client.delete(
        `/condamnations/${id}`
      );

      setSuccess(
        "La condamnation a été supprimée avec succès."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Erreur suppression condamnation :",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de modifier la condamnation."
        )
      );
    }
  };

  // DETAIL

  const openDetails = (condamnation) => {
    setSelectedCondamnation(condamnation);
    setShowDetailModal(true);
  };

  // FORMAT DATE

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "fr-FR"
      );
    } catch {
      return date;
    }
  };

  // FERMER MODAL MODIFICATION

  const closeEditModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  // RENDER

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/*HEADER*/}

      <div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8
      ">
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
              Condamnation
            </span>

          </div>
          <h1 className=" text-3xl font-bold text-haigana-dark ">  Condamnations </h1>

          <p className="
            text-gray-500
            mt-1
          ">
            Consultation et gestion des véhicules condamnés
          </p>
        </div>

      </div>

      {/* MESSAGES */}

      {error && (
        <div className="
          mb-5
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-red-700
        ">
          {error}
        </div>
      )}

      {success && (
        <div className="
          mb-5
          rounded-xl
          border
          border-green-200
          bg-green-50
          px-4
          py-3
          text-green-700
        ">
          {success}
        </div>
      )}

      {/* RECHERCHE */}

      <div className="mb-6">
        <SearchSortBar
          search={search}
          setSearch={setSearch}
          onSearchChange={setSearch}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une condamnation..."
        />
      </div>

      {/*STATISTIQUES*/}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
        mb-7
      ">

        {/* TOTAL */}

        <div className="
          bg-white
          rounded-2xl
          p-5
          shadow-card
          border
          border-gray-100
        ">

          <p className="text-sm text-gray-500">
            Total condamnations
          </p>

          <p className="
            text-3xl
            font-bold
            text-haigana-dark
            mt-2
          ">
            {condamnations.length}
          </p>

        </div>

        {/* RESULTATS */}

        <div className="
          bg-white
          rounded-2xl
          p-5
          shadow-card
          border
          border-gray-100
        ">

          <p className="text-sm text-gray-500">
            Résultats
          </p>

          <p className="
            text-3xl
            font-bold
            text-haigana-blue
            mt-2
          ">
            {filteredCondamnations.length}
          </p>

        </div>

        {/* VEHICULES */}

        <div className="
          bg-white
          rounded-2xl
          p-5
          shadow-card
          border
          border-gray-100
        ">

          <p className="text-sm text-gray-500">
            Véhicules concernés
          </p>

          <p className="
            text-3xl
            font-bold
            text-haigana-gold
            mt-2
          ">
            {
              new Set(
                condamnations
                  .map(
                    (c) =>
                      c.immatriculeVehicule
                  )
                  .filter(Boolean)
              ).size
            }
          </p>

        </div>

      </div>

      {/*TABLEAU*/}

      <div className="
        bg-white
        rounded-2xl
        shadow-card
        border
        border-gray-100
        overflow-hidden
      ">

        {loading ? (

          <div className="
            p-10
            text-center
            text-gray-500
          ">
            Chargement des condamnations...
          </div>

        ) : filteredCondamnations.length === 0 ? (

          <div className="
            p-10
            text-center
          ">

            <div className="
              w-16
              h-16
              mx-auto
              mb-4
              rounded-2xl
              bg-gray-100
              flex
              items-center
              justify-center
              text-2xl
            ">
              ⚠
            </div>

            <p className="
              font-semibold
              text-gray-700
            ">
              Aucune condamnation trouvée
            </p>

            <p className="
              text-sm
              text-gray-500
              mt-1
            ">
              Aucune condamnation ne correspond
              à votre recherche.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Immatriculation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Lieu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Motif
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Pièce
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>


              <tbody className="divide-y divide-gray-100">
                {filteredCondamnations.map((condamnation) => (
                  <tr key={condamnation.id} className="hover:bg-gray-50 transition">

                    {/* IMMATRICULATION */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-lg bg-haigana-dark/10 text-haigana-dark font-semibold">
                        {condamnation.immatriculeVehicule || "-"}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(condamnation.dateCondamnation)}
                    </td>

                    {/* LIEU */}
                    <td className="px-6 py-4 text-gray-700">
                      {condamnation.lieuCondamnation || "-"}
                    </td>

                    {/* MOTIF */}
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <div className="truncate" title={condamnation.description || ""}>
                        {condamnation.description || "-"}
                      </div>
                    </td>

                    {/* PIÈCE */}
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {condamnation.piece || "-"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openDetails(condamnation)} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition" title="Voir les détails">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" /><circle cx="12" cy="12" r="2.75" strokeWidth="2" /></svg>
                        </button>

                      {((hasRole("ADMINISTRATEUR") || (hasRole("MODIFICATEUR")))  &&
                        <button type="button" onClick={() => openEditModal(condamnation.id)} className="px-3 py-2 rounded-lg bg-haigana-blue/10 text-haigana-blue hover:bg-haigana-blue/20 transition" title="Modifier">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 3.487a2.25 2.25 0 013.182 3.182L8.25 18.462l-4.5 1.125 1.125-4.5L16.862 3.487z" /></svg>
                        </button>
                      )}

                      {(hasRole("ADMINISTRATEUR") &&
                        <button type="button" onClick={() => handleDelete(condamnation.id)} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition" title="Supprimer">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12M9 7V4h6v3m-8 0l.75 13h8.5L17 7M10 11v6m4-6v6" /></svg>
                        </button>
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

      {/* MODAL MODIFICATION */}

      {showModal && (

        <div className="
          fixed
          inset-0
          z-50
          bg-black/50
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            bg-white
            w-full
            max-w-2xl
            rounded-3xl
            shadow-2xl
            overflow-hidden
          ">

            {/* HEADER */}

            <div className="
              px-7
              py-5
              bg-haigana-dark
              text-white
              flex
              items-center
              justify-between
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                ">
                  Modifier la condamnation
                </h2>

                <p className="
                  text-sm
                  text-white/70
                  mt-1
                ">
                  Modifier les informations de la condamnation
                </p>

              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="
                  text-white/80
                  hover:text-white
                  text-2xl
                "
              >
                ×
              </button>

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={handleSubmit}
              className="
                p-7
                space-y-5
              "
            >

              {/* IMMATRICULATION */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Immatriculation *
                </label>

                <input
                  type="text"
                  name="immatriculeVehicule"
                  value={
                    form.immatriculeVehicule
                  }
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    outline-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                  "
                />

              </div>

              {/* DATE */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Date de condamnation *
                </label>

                <input
                  type="date"
                  name="dateCondamnation"
                  value={
                    form.dateCondamnation
                  }
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    outline-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                  "
                />

              </div>

              {/* LIEU */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Lieu de condamnation *
                </label>

                <input
                  type="text"
                  name="lieuCondamnation"
                  value={
                    form.lieuCondamnation
                  }
                  onChange={handleChange}
                  required
                  placeholder="Ex : Mahajanga"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    outline-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Motif ou description de la condamnation..."
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    outline-none
                    resize-none
                    focus:ring-2
                    focus:ring-haigana-blue/30
                    focus:border-haigana-blue
                  "
                />

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motif
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Motif ou description de la condamnation..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none resize-none focus:ring-2 focus:ring-haigana-blue/30 focus:border-haigana-blue"
                />
              </div>

              {/* PIÈCE JUSTIFICATIVE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Référence de la pièce justificative
                </label>
                <input
                  type="text"
                  name="piece"
                  value={form.piece}
                  onChange={handleChange}
                  placeholder="Ex : QUITUS-042/2026"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-haigana-blue/30 focus:border-haigana-blue"
                />
              </div>

              {/* BOUTONS */}

              <div className="
                flex
                justify-end
                gap-3
                pt-3
              ">

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                    transition
                  "
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-haigana-dark
                    text-white
                    font-semibold
                    hover:opacity-90
                    disabled:opacity-50
                    transition
                  "
                >
                  {saving
                    ? "Modification..."
                    : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>

      )}

      {/*MODAL DETAILS SANS LE BLOC SORTIE*/}
      {showDetailModal && selectedCondamnation && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden">

            <div className="px-7 py-5 bg-haigana-dark text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Détails de la condamnation</h2>
                <p className="text-sm text-white/70 mt-1">Informations du véhicule condamné</p>
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>

            <div className="p-7 space-y-5">

              {/* IMMATRICULATION */}
              <div>
                <p className="text-xs uppercase text-gray-400 font-bold">Immatriculation</p>
                <p className="text-xl font-bold text-haigana-dark mt-1">
                  {selectedCondamnation.immatriculeVehicule || "-"}
                </p>
              </div>

              {/* DATE + LIEU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase text-gray-400 font-bold">Date de condamnation</p>
                  <p className="text-gray-700 mt-1">{formatDate(selectedCondamnation.dateCondamnation)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400 font-bold">Lieu</p>
                  <p className="text-gray-700 mt-1">{selectedCondamnation.lieuCondamnation || "-"}</p>
                </div>
              </div>

              {/* PIÈCE JUSTIFICATIVE */}
              <div>
                <p className="text-xs uppercase text-gray-400 font-bold">Pièce justificative (Référence)</p>
                <p className="text-gray-700 font-mono text-sm mt-1">{selectedCondamnation.piece || "-"}</p>
              </div>

              {/* MOTIF / DESCRIPTION */}
              <div>
                <p className="text-xs uppercase text-gray-400 font-bold">Motif de condamnation</p>
                <div className="mt-2 p-4 bg-gray-50 rounded-xl text-gray-700 leading-relaxed">
                  {selectedCondamnation.description || "Aucun motif spécifié."}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => setShowDetailModal(false)} className="px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:opacity-90 transition">
                  Fermer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}