import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const emptyForm = {
  nomChauffeur: "",
  immatriculeChauffeur: "",
  cinChauffeur: "",
};


const emptyAttributionForm = {
  vehiculeId: "",
  dateConduite: "",
};

export default function Chauffeur() {
  const { hasRole } = useAuth();


  // CHAUFFEURS


  const [chauffeurs, setChauffeurs] = useState([]);
  const [recherche, setRecherche] = useState("");

  const [sortField, setSortField] = useState("nomChauffeur");
  const [sortDirection, setSortDirection] = useState("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);


  // ATTRIBUTIONS


  const [attributionsOpen, setAttributionsOpen] = useState(false);
  const [selectedChauffeur, setSelectedChauffeur] = useState(null);

  const [attributions, setAttributions] = useState([]);
  const [loadingAttributions, setLoadingAttributions] = useState(false);

  const [attributionFormOpen, setAttributionFormOpen] = useState(false);
  const [editingAttributionId, setEditingAttributionId] = useState(null);

  const [attributionForm, setAttributionForm] = useState(
    emptyAttributionForm
  );

  const [attributionDeleteTarget, setAttributionDeleteTarget] =
    useState(null);

  const [vehicules, setVehicules] = useState([]);


  // ETAT GENERAL


  const [error, setError] = useState("");
  const [attributionError, setAttributionError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [attributionSubmitting, setAttributionSubmitting] = useState(false);


  // CLASSES


  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";


  // CHARGER LES CHAUFFEURS


  async function loadChauffeurs() {
    try {
      setError("");

      const response = await client.get("/chauffeurs");

      setChauffeurs(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les chauffeurs."
      );
    }
  }

  useEffect(() => {
    loadChauffeurs();
  }, []);


  // CHARGER LES VEHICULES


  async function loadVehicules() {
    try {
      const response = await client.get("/vehicules");

      setVehicules(response.data);
    } catch (err) {
      console.error(err);

      setAttributionError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les véhicules."
      );
    }
  }


  // RECHERCHE + TRI


  const filteredChauffeurs = useMemo(() => {
    const valeur = recherche.trim().toLowerCase();

    return [...chauffeurs]
      .filter((chauffeur) => {
        if (!valeur) return true;

        return (
          chauffeur.nomChauffeur?.toLowerCase().includes(valeur) ||
          chauffeur.immatriculeChauffeur
            ?.toLowerCase()
            .includes(valeur) ||
          chauffeur.cinChauffeur?.toLowerCase().includes(valeur)
        );
      })
      .sort((a, b) => {
        const valeurA = (a[sortField] || "")
          .toString()
          .toLowerCase();

        const valeurB = (b[sortField] || "")
          .toString()
          .toLowerCase();

        const comparaison = valeurA.localeCompare(
          valeurB,
          "fr",
          {
            numeric: true,
          }
        );

        return sortDirection === "asc"
          ? comparaison
          : -comparaison;
      });
  }, [
    chauffeurs,
    recherche,
    sortField,
    sortDirection,
  ]);


  // FORMULAIRE CHAUFFEUR


  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAjouter() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  async function openModifier(chauffeur) {
    setEditingId(chauffeur.id);

    setForm({
      nomChauffeur: chauffeur.nomChauffeur || "",
      immatriculeChauffeur:
        chauffeur.immatriculeChauffeur || "",
      cinChauffeur: chauffeur.cinChauffeur || "",
    });

    setError("");
    setFormOpen(true);

    await openAttributions(chauffeur);
  }


  // ENREGISTRER CHAUFFEUR


  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!form.nomChauffeur.trim()) {
      setError("Le nom du chauffeur est obligatoire.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nomChauffeur: form.nomChauffeur.trim(),
        immatriculeChauffeur:
          form.immatriculeChauffeur.trim(),
        cinChauffeur:
          form.cinChauffeur.trim(),
      };

      if (editingId) {
        await client.put(
          `/chauffeurs/${editingId}`,
          payload
        );
      } else {
        await client.post(
          "/chauffeurs",
          payload
        );
      }

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadChauffeurs();

      if (
        selectedChauffeur &&
        selectedChauffeur.id === editingId
      ) {
        setSelectedChauffeur({
          ...selectedChauffeur,
          ...payload,
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erreur lors de l'enregistrement du chauffeur."
      );
    } finally {
      setSubmitting(false);
    }
  }


  // SUPPRIMER CHAUFFEUR


  async function handleSupprimer() {
    if (!deleteTarget) return;

    setSubmitting(true);
    setError("");

    try {
      await client.delete(
        `/chauffeurs/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      if (
        selectedChauffeur &&
        selectedChauffeur.id === deleteTarget.id
      ) {
        setAttributionsOpen(false);
        setSelectedChauffeur(null);
        setAttributions([]);
      }

      await loadChauffeurs();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer le chauffeur."
      );
    } finally {
      setSubmitting(false);
    }
  }


  // OUVRIR LES ATTRIBUTIONS


  async function openAttributions(chauffeur) {
    setSelectedChauffeur(chauffeur);
    setAttributionsOpen(true);

    setAttributionError("");
    setLoadingAttributions(true);

    try {
      const response = await client.get(
        `/conduite-chauffeur/chauffeur/${chauffeur.id}`
      );

      setAttributions(response.data);

      await loadVehicules();
    } catch (err) {
      console.error(err);

      setAttributionError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les véhicules conduits."
      );
    } finally {
      setLoadingAttributions(false);
    }
  }


  // FERMER ATTRIBUTIONS


  function closeAttributions() {
    setAttributionsOpen(false);
    setSelectedChauffeur(null);
    setAttributions([]);
    setAttributionError("");
    setAttributionFormOpen(false);
    setEditingAttributionId(null);
    setAttributionForm(emptyAttributionForm);
  }


  // FORMULAIRE ATTRIBUTION


  function setAttribution(field, value) {
    setAttributionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAjouterAttribution() {
    setEditingAttributionId(null);

    setAttributionForm({
      vehiculeId: "",
      dateConduite:
        new Date().toISOString().split("T")[0],
    });

    setAttributionError("");
    setAttributionFormOpen(true);
  }

  function openModifierAttribution(attribution) {
    setEditingAttributionId(attribution.id);

    setAttributionForm({
      vehiculeId:
        attribution.vehicule?.id
          ? String(attribution.vehicule.id)
          : "",

      dateConduite:
        attribution.dateConduite || "",
    });

    setAttributionError("");
    setAttributionFormOpen(true);
  }


  // ENREGISTRER ATTRIBUTION


  async function handleSubmitAttribution(e) {
    e.preventDefault();

    setAttributionError("");

    if (!selectedChauffeur) {
      setAttributionError(
        "Aucun chauffeur sélectionné."
      );
      return;
    }

    if (!attributionForm.vehiculeId) {
      setAttributionError(
        "Veuillez sélectionner un véhicule."
      );
      return;
    }

    setAttributionSubmitting(true);

    try {
      const payload = {
        chauffeurId: selectedChauffeur.id,
        vehiculeId: Number(
          attributionForm.vehiculeId
        ),
        dateConduite:
          attributionForm.dateConduite ||
          new Date()
            .toISOString()
            .split("T")[0],
      };

      if (editingAttributionId) {
        await client.put(
          `/conduite-chauffeur/${editingAttributionId}`,
          payload
        );
      } else {
        await client.post(
          "/conduite-chauffeur",
          payload
        );
      }

      setAttributionFormOpen(false);
      setEditingAttributionId(null);
      setAttributionForm(emptyAttributionForm);

      await refreshAttributions();
    } catch (err) {
      console.error(err);

      setAttributionError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erreur lors de l'enregistrement de l'attribution."
      );
    } finally {
      setAttributionSubmitting(false);
    }
  }


  // ACTUALISER ATTRIBUTIONS


  async function refreshAttributions() {
    if (!selectedChauffeur) return;

    try {
      setLoadingAttributions(true);

      const response = await client.get(
        `/conduite-chauffeur/chauffeur/${selectedChauffeur.id}`
      );

      setAttributions(response.data);
    } catch (err) {
      console.error(err);

      setAttributionError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible d'actualiser les attributions."
      );
    } finally {
      setLoadingAttributions(false);
    }
  }


  // SUPPRIMER ATTRIBUTION


  async function handleSupprimerAttribution() {
    if (!attributionDeleteTarget) return;

    setAttributionSubmitting(true);
    setAttributionError("");

    try {
      await client.delete(
        `/conduite-chauffeur/${attributionDeleteTarget.id}`
      );

      setAttributionDeleteTarget(null);

      await refreshAttributions();
    } catch (err) {
      console.error(err);

      setAttributionError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer l'attribution."
      );
    } finally {
      setAttributionSubmitting(false);
    }
  }


  // VEHICULES DISPONIBLES


  const vehiculesDisponibles = useMemo(() => {
    return vehicules.filter((vehicule) => {
      if (
        editingAttributionId &&
        attributionForm.vehiculeId ===
          String(vehicule.id)
      ) {
        return true;
      }

      const dejaAttribue = attributions.some(
        (attribution) =>
          attribution.vehicule?.id === vehicule.id
      );

      return !dejaAttribue;
    });
  }, [
    vehicules,
    attributions,
    editingAttributionId,
    attributionForm.vehiculeId,
  ]);


  // RENDU


  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}

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
            Entrée
          </span>

        </div>

        <h1 className="text-2xl font-bold text-haigana-dark">
          Chauffeurs
        </h1>

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (
          <button
            onClick={openAjouter}
            className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
          >
            Ajouter un chauffeur
          </button>
        )}

      </div>

      {/*ERREUR*/}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {/*RECHERCHE + TRI*/}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="md:col-span-2">

            <label className={labelClass}>
              Rechercher un chauffeur
            </label>

            <input
              value={recherche}
              onChange={(e) =>
                setRecherche(e.target.value)
              }
              className={inputClass}
              placeholder="Nom, matricule ou CIN..."
            />

          </div>

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

              <option value="nomChauffeur-asc">
                Nom — A à Z
              </option>

              <option value="nomChauffeur-desc">
                Nom — Z à A
              </option>

              <option value="immatriculeChauffeur-asc">
                Matricule — A à Z
              </option>

              <option value="immatriculeChauffeur-desc">
                Matricule — Z à A
              </option>

              <option value="cinChauffeur-asc">
                CIN — A à Z
              </option>

              <option value="cinChauffeur-desc">
                CIN — Z à A
              </option>

            </select>

          </div>

        </div>

      </div>

      {/*TABLEAU CHAUFFEURS*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Nom
                </th>

                <th className="text-left px-4 py-3">
                  Matricule
                </th>

                <th className="text-left px-4 py-3">
                  CIN
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredChauffeurs.map(
                (chauffeur) => (

                  <tr
                    key={chauffeur.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    <td className="px-4 py-3 font-medium text-haigana-dark">
                      {chauffeur.nomChauffeur || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {chauffeur.immatriculeChauffeur || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {chauffeur.cinChauffeur || "-"}
                    </td>

                    <td className="px-4 py-3 text-right space-x-4">

                      {hasRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                      ) && (
                        <button
                          onClick={() =>
                            openModifier(chauffeur)
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-medium"
                        >
                          Modifier
                        </button>
                      )}

                      {hasRole("ADMINISTRATEUR") && (
                        <button
                          onClick={() =>
                            setDeleteTarget(chauffeur)
                          }
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer
                        </button>
                      )}

                    </td>

                  </tr>
                )
              )}

              {filteredChauffeurs.length === 0 && (
                <tr>

                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucun chauffeur trouvé.
                  </td>

                </tr>
              )}

            </tbody>

            {filteredChauffeurs.length > 0 && (
              <tfoot>

                <tr className="border-t-2 border-gray-200 bg-haigana-bg/40">

                  <td
                    colSpan={3}
                    className="px-4 py-4 text-right font-semibold text-haigana-dark"
                  >
                    Total des chauffeurs :
                  </td>

                  <td className="px-4 py-4 text-right font-semibold text-haigana-dark">
                    {filteredChauffeurs.length}
                  </td>

                </tr>

              </tfoot>
            )}

          </table>

        </div>

      </div>

      {/*MODALE CHAUFFEUR*/}

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

            <h3 className="font-semibold text-haigana-dark text-lg mb-5">

              {editingId
                ? "Modifier le chauffeur"
                : "Ajouter un chauffeur"}

            </h3>

            <label className={labelClass}>
              Nom du chauffeur
            </label>

            <input
              value={form.nomChauffeur}
              onChange={(e) =>
                set(
                  "nomChauffeur",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Nom complet"
              required
            />

            <label className={labelClass}>
              Matricule du chauffeur
            </label>

            <input
              value={form.immatriculeChauffeur}
              onChange={(e) =>
                set(
                  "immatriculeChauffeur",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : CH-001"
            />

            <label className={labelClass}>
              CIN
            </label>

            <input
              value={form.cinChauffeur}
              onChange={(e) =>
                set(
                  "cinChauffeur",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Numéro CIN"
            />

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
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

      {/*MODALE ATTRIBUTIONS*/}

      {attributionsOpen && selectedChauffeur && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeAttributions}
        >

          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-haigana-dark">
                  Véhicules conduits
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Chauffeur :{" "}
                  <span className="font-semibold text-haigana-dark">
                    {selectedChauffeur.nomChauffeur}
                  </span>
                </p>

              </div>

              <button
                onClick={closeAttributions}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

            </div>

            {/* CONTENU */}

            <div className="p-6 overflow-y-auto max-h-[70vh]">

              {attributionError && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {attributionError}
                </div>
              )}

              <div className="flex items-center justify-between mb-5">

                <div>

                  <h3 className="font-semibold text-haigana-dark">
                    Liste des attributions
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {attributions.length} véhicule(s)
                    attribué(s)
                  </p>

                </div>

                {hasRole(
                  "ADMINISTRATEUR",
                  "MODIFICATEUR"
                ) && (
                  <button
                    onClick={openAjouterAttribution}
                    className="px-4 py-2 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
                  >
                    + Ajouter une attribution
                  </button>
                )}

              </div>

              {loadingAttributions ? (

                <div className="py-10 text-center text-gray-400">
                  Chargement des véhicules...
                </div>

              ) : attributions.length === 0 ? (

                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">

                  <p className="text-gray-400">
                    Aucun véhicule attribué à ce chauffeur.
                  </p>

                  {hasRole(
                    "ADMINISTRATEUR",
                    "MODIFICATEUR"
                  ) && (
                    <button
                      onClick={openAjouterAttribution}
                      className="mt-4 px-4 py-2 rounded-lg bg-haigana-dark text-white text-sm"
                    >
                      Ajouter le premier véhicule
                    </button>
                  )}

                </div>

              ) : (

                <div className="border border-gray-100 rounded-xl overflow-hidden">

                  <table className="w-full text-sm">

                    <thead className="bg-haigana-dark text-white">

                      <tr>

                        <th className="text-left px-4 py-3">
                          Matricule
                        </th>

                        <th className="text-left px-4 py-3">
                          Marque
                        </th>

                        <th className="text-left px-4 py-3">
                          Genre
                        </th>

                        <th className="text-left px-4 py-3">
                          Date de conduite
                        </th>

                        <th className="text-right px-4 py-3">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                    {attributions.map((attribution) => {

                      const vehicule = attribution.vehicule;

                      return (
                        <tr
                          key={attribution.id}
                          className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                        >

                          {/* IMMATRICULE */}

                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                openModifierAttribution(attribution)
                              }
                              className="font-semibold text-haigana-blue hover:text-haigana-dark"
                            >
                              {vehicule?.immatricule || "-"}
                            </button>
                          </td>


                          {/* MARQUE */}

                          <td className="px-4 py-3">
                            {vehicule?.marque?.marqueVehicule || "-"}
                          </td>


                          {/* GENRE */}

                          <td className="px-4 py-3">
                            {vehicule?.genre?.genreVehicule || "-"}
                          </td>


                          {/* DATE */}

                          <td className="px-4 py-3">
                            {attribution.dateConduite || "-"}
                          </td>


                          {/* ACTIONS */}

                          <td className="px-4 py-3 text-right space-x-4">

                            {hasRole(
                              "ADMINISTRATEUR",
                              "MODIFICATEUR"
                            ) && (
                              <button
                                onClick={() =>
                                  openModifierAttribution(attribution)
                                }
                                className="text-haigana-blue hover:text-haigana-dark font-medium"
                              >
                                Modifier
                              </button>
                            )}

                            {hasRole("ADMINISTRATEUR") && (
                              <button
                                onClick={() =>
                                  setAttributionDeleteTarget(attribution)
                                }
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Supprimer
                              </button>
                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                  </table>

                </div>

              )}

            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

              <button
                onClick={closeAttributions}
                className="px-5 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Fermer
              </button>

            </div>

          </div>

        </div>
      )}

      {/*MODALE AJOUT / MODIFICATION ATTRIBUTION*/}

      {attributionFormOpen && selectedChauffeur && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          onClick={() =>
            setAttributionFormOpen(false)
          }
        >

          <form
            onSubmit={handleSubmitAttribution}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
          >

            <h3 className="font-semibold text-haigana-dark text-lg mb-5">

              {editingAttributionId
                ? "Modifier l'attribution"
                : "Ajouter une attribution"}

            </h3>

            <p className="text-sm text-gray-500 mb-5">

              Chauffeur :{" "}

              <strong className="text-haigana-dark">
                {selectedChauffeur.nomChauffeur}
              </strong>

            </p>

            {attributionError && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {attributionError}
              </div>
            )}

            <label className={labelClass}>
              Véhicule
            </label>

            <select
              value={attributionForm.vehiculeId}
              onChange={(e) =>
                setAttribution(
                  "vehiculeId",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              required
            >

              <option value="">
                Sélectionner un véhicule
              </option>

              {vehiculesDisponibles.map(
                (vehicule) => (
                  <option
                    key={vehicule.id}
                    value={vehicule.id}
                  >
                    {vehicule.immatricule}

                    {vehicule.marque?.marqueVehicule
                      ? ` — ${vehicule.marque.marqueVehicule}`
                      : ""}
                  </option>
                )
              )}

            </select>

            <label className={labelClass}>
              Date de conduite
            </label>

            <input
              type="date"
              value={attributionForm.dateConduite}
              onChange={(e) =>
                setAttribution(
                  "dateConduite",
                  e.target.value
                )
              }
              className={inputClass}
              required
            />

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() =>
                  setAttributionFormOpen(false)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={attributionSubmitting}
                className="px-5 py-2 rounded-lg bg-haigana-dark text-white font-semibold disabled:opacity-60"
              >
                {attributionSubmitting
                  ? "Enregistrement..."
                  : editingAttributionId
                  ? "Modifier"
                  : "Enregistrer"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/*MODALE SUPPRESSION CHAUFFEUR*/}

      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
          onClick={() =>
            setDeleteTarget(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-semibold text-red-600 text-lg mb-3">
              Supprimer ce chauffeur ?
            </h3>

            <p className="text-sm text-gray-500 mb-4">

              Voulez-vous vraiment supprimer{" "}

              <strong className="text-haigana-dark">
                {deleteTarget.nomChauffeur}
              </strong>{" "}
              ?

            </p>

            <p className="text-xs text-gray-400 mb-5">
              Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
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

      {/*MODALE SUPPRESSION ATTRIBUTION*/}

      {attributionDeleteTarget && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4"
          onClick={() =>
            setAttributionDeleteTarget(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >

            <h3 className="font-semibold text-red-600 text-lg mb-3">
              Supprimer cette attribution ?
            </h3>

            <p className="text-sm text-gray-500 mb-4">

              Voulez-vous supprimer l'attribution du véhicule{" "}

              <strong className="text-haigana-dark">
                {
                  attributionDeleteTarget
                    .vehicule?.immatricule
                }
              </strong>{" "}

              pour le chauffeur{" "}

              <strong className="text-haigana-dark">
                {selectedChauffeur?.nomChauffeur}
              </strong>
              ?

            </p>

            <p className="text-xs text-gray-400 mb-5">
              Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-2">

              <button
                onClick={() =>
                  setAttributionDeleteTarget(null)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                onClick={
                  handleSupprimerAttribution
                }
                disabled={attributionSubmitting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {attributionSubmitting
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
