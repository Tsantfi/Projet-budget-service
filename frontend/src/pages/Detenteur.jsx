import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const emptyForm = {
  nomDetenteur: "",
  prenomDetenteur: "",
  immatriculeDetenteur: "",
  cinDetenteur: "",
  districtDetenteur: "",
  serviceId: "",
};

export default function Detenteur() {
  const { hasRole } = useAuth();


  // DETENTEURS


  const [detenteurs, setDetenteurs] = useState([]);
  const [soaList, setSoaList] = useState([]);

  const [search, setSearch] = useState("");

  const [sortField, setSortField] = useState("nomDetenteur");
  const [sortDirection, setSortDirection] = useState("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);


  // VEHICULES DU DETENTEUR


  const [vehiculesOpen, setVehiculesOpen] = useState(false);
  const [selectedDetenteur, setSelectedDetenteur] = useState(null);

  const [vehiculesDetenteur, setVehiculesDetenteur] = useState([]);
  const [loadingVehicules, setLoadingVehicules] = useState(false);
  const [vehiculeError, setVehiculeError] = useState("");


  // CLASSES


  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";


  // CHARGEMENT DES DETENTEURS


  async function loadDetenteurs() {
    try {
      setLoading(true);
      setError("");

      const response = await client.get("/detenteurs");

      setDetenteurs(response.data);
    } catch (err) {
      console.error("Erreur chargement détenteurs :", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les détenteurs."
      );
    } finally {
      setLoading(false);
    }
  }


  // CHARGEMENT DES SOA

  async function loadSoa() {
    try {
      const response = await client.get("/soa");

      setSoaList(response.data);
    } catch (err) {
      console.error("Erreur chargement SOA :", err);
    }
  }


  // INITIALISATION


  useEffect(() => {
    loadDetenteurs();
    loadSoa();
  }, []);


  // RECHERCHE + TRI


  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();

    let result = [...detenteurs];

    if (value) {
      result = result.filter((d) => {
        const nom = d.nomDetenteur || "";
        const prenom = d.prenomDetenteur || "";
        const cin = d.cinDetenteur || "";
        const immatricule = d.immatriculeDetenteur || "";
        const district = d.districtDetenteur || "";
        const service = d.service?.codeSoa || "";

        return (
          nom.toLowerCase().includes(value) ||
          prenom.toLowerCase().includes(value) ||
          cin.toLowerCase().includes(value) ||
          immatricule.toLowerCase().includes(value) ||
          district.toLowerCase().includes(value) ||
          service.toLowerCase().includes(value)
        );
      });
    }

    result.sort((a, b) => {
      let valeurA = "";
      let valeurB = "";

      if (sortField === "service") {
        valeurA = a.service?.codeSoa || "";
        valeurB = b.service?.codeSoa || "";
      } else {
        valeurA = a[sortField] || "";
        valeurB = b[sortField] || "";
      }

      valeurA = valeurA.toString().toLowerCase();
      valeurB = valeurB.toString().toLowerCase();

      const comparaison = valeurA.localeCompare(
        valeurB,
        "fr",
        {
          numeric: true,
          sensitivity: "base",
        }
      );

      return sortDirection === "asc"
        ? comparaison
        : -comparaison;
    });

    return result;
  }, [
    detenteurs,
    search,
    sortField,
    sortDirection,
  ]);


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
    setForm({ ...emptyForm });

    setError("");
    setSuccess("");

    setFormOpen(true);
  }


  // MODIFIER


  function openModifier(detenteur) {
    setEditingId(detenteur.id);

    setForm({
      nomDetenteur: detenteur.nomDetenteur || "",
      prenomDetenteur: detenteur.prenomDetenteur || "",
      immatriculeDetenteur:
        detenteur.immatriculeDetenteur || "",
      cinDetenteur: detenteur.cinDetenteur || "",
      districtDetenteur:
        detenteur.districtDetenteur || "",
      serviceId: detenteur.service?.id
        ? String(detenteur.service.id)
        : "",
    });

    setError("");
    setSuccess("");

    setFormOpen(true);
  }


  // ENREGISTREMENT


  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.nomDetenteur.trim()) {
      setError("Le nom du détenteur est obligatoire.");
      return;
    }

    if (!form.cinDetenteur.trim()) {
      setError("Le CIN est obligatoire.");
      return;
    }

    setSubmitting(true);

    try {
      const selectedSoa = soaList.find(
        (soa) => soa.id === Number(form.serviceId)
      );

      const payload = {
        nomDetenteur: form.nomDetenteur.trim(),

        prenomDetenteur:
          form.prenomDetenteur.trim(),

        immatriculeDetenteur:
          form.immatriculeDetenteur.trim(),

        cinDetenteur:
          form.cinDetenteur.trim(),

        districtDetenteur:
          form.districtDetenteur.trim(),

        service: selectedSoa
          ? {
              id: selectedSoa.id,
            }
          : null,
      };

      if (editingId) {
        await client.put(
          `/detenteurs/${editingId}`,
          payload
        );

        setSuccess(
          "Détenteur modifié avec succès."
        );
      } else {
        await client.post(
          "/detenteurs",
          payload
        );

        setSuccess(
          "Détenteur ajouté avec succès."
        );
      }

      setFormOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await loadDetenteurs();

    } catch (err) {
      console.error(
        "Erreur sauvegarde détenteur :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'enregistrement du détenteur."
      );
    } finally {
      setSubmitting(false);
    }
  }


  // CHARGER LES VEHICULES DU DETENTEUR


  async function openVehicules(detenteur) {
    setSelectedDetenteur(detenteur);

    setVehiculesOpen(true);

    setVehiculeError("");
    setVehiculesDetenteur([]);

    setLoadingVehicules(true);

    try {
      const response = await client.get(
        `/detenteurs/${detenteur.id}/vehicules`
      );

      setVehiculesDetenteur(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Erreur chargement véhicules du détenteur :",
        err
      );

      setVehiculeError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les véhicules détenus."
      );
    } finally {
      setLoadingVehicules(false);
    }
  }


  // FERMER VEHICULES


  function closeVehicules() {
    setVehiculesOpen(false);
    setSelectedDetenteur(null);
    setVehiculesDetenteur([]);
    setVehiculeError("");
  }


  // SUPPRESSION


  async function handleSupprimer() {
    if (!deleteTarget) {
      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await client.delete(
        `/detenteurs/${deleteTarget.id}`
      );

      setDeleteTarget(null);

      setSuccess(
        "Détenteur supprimé avec succès."
      );

      await loadDetenteurs();

    } catch (err) {
      console.error(
        "Erreur suppression détenteur :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer ce détenteur."
      );
    } finally {
      setSubmitting(false);
    }
  }


  // AFFICHAGE


  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/*BREADCRUMB*/}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/gestion"
          className="hover:text-haigana-blue transition-colors"
        >
          Gestion
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Détenteur
        </span>

      </div>

      {/*HEADER*/}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Détenteurs
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des détenteurs de véhicules
          </p>

        </div>

        {hasRole(
          "ADMINISTRATEUR",
          "MODIFICATEUR"
        ) && (

          <button
            onClick={openAjouter}
            className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
          >
            + Ajouter un détenteur
          </button>

        )}

      </div>

      {/*MESSAGES*/}

      {error && !formOpen && (

        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>

      )}

      {success && (

        <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4">
          {success}
        </div>

      )}

      {/*RECHERCHE + TRI*/}

      <div className="bg-white rounded-2xl shadow-card p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* RECHERCHE */}

          <div className="md:col-span-2">

            <label className={labelClass}>
              Rechercher un détenteur
            </label>

            <div className="flex gap-3">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className={inputClass}
                placeholder="Nom, prénom, CIN, immatricule, district ou service..."
              />

              {search && (

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Effacer
                </button>

              )}

            </div>

          </div>

          {/* TRI */}

          <div>

            <label className={labelClass}>
              Trier par
            </label>

            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {

                const lastDash =
                  e.target.value.lastIndexOf("-");

                const field =
                  e.target.value.substring(
                    0,
                    lastDash
                  );

                const direction =
                  e.target.value.substring(
                    lastDash + 1
                  );

                setSortField(field);
                setSortDirection(direction);

              }}
              className={`${inputClass} bg-white`}
            >

              <option value="nomDetenteur-asc">
                Nom — A à Z
              </option>

              <option value="nomDetenteur-desc">
                Nom — Z à A
              </option>

              <option value="prenomDetenteur-asc">
                Prénom — A à Z
              </option>

              <option value="prenomDetenteur-desc">
                Prénom — Z à A
              </option>

              <option value="cinDetenteur-asc">
                CIN — croissant
              </option>

              <option value="cinDetenteur-desc">
                CIN — décroissant
              </option>

              <option value="immatriculeDetenteur-asc">
                Immatricule — A à Z
              </option>

              <option value="immatriculeDetenteur-desc">
                Immatricule — Z à A
              </option>

              <option value="districtDetenteur-asc">
                District — A à Z
              </option>

              <option value="districtDetenteur-desc">
                District — Z à A
              </option>

              <option value="service-asc">
                Service — A à Z
              </option>

              <option value="service-desc">
                Service — Z à A
              </option>

            </select>

          </div>

        </div>

      </div>

      {/*TABLEAU*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Nom
                </th>

                <th className="text-left px-4 py-3">
                  Prénom
                </th>

                <th className="text-left px-4 py-3">
                  CIN
                </th>

                <th className="text-left px-4 py-3">
                  Immatricule
                </th>

                <th className="text-left px-4 py-3">
                  District
                </th>

                <th className="text-left px-4 py-3">
                  Service
                </th>

                <th className="text-left px-4 py-3">
                  Véhicules
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Chargement des détenteurs...
                  </td>

                </tr>

              ) : filtered.length === 0 ? (

                <tr>

                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucun détenteur trouvé.
                  </td>

                </tr>

              ) : (

                filtered.map((detenteur) => (

                  <tr
                    key={detenteur.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    {/* NOM */}

                    <td className="px-4 py-3 font-medium text-haigana-dark">
                      {detenteur.nomDetenteur || "-"}
                    </td>

                    {/* PRENOM */}

                    <td className="px-4 py-3">
                      {detenteur.prenomDetenteur || "-"}
                    </td>

                    {/* CIN */}

                    <td className="px-4 py-3">
                      {detenteur.cinDetenteur || "-"}
                    </td>

                    {/* IMMATRICULE */}

                    <td className="px-4 py-3">
                      {detenteur.immatriculeDetenteur || "-"}
                    </td>

                    {/* DISTRICT */}

                    <td className="px-4 py-3">
                      {detenteur.districtDetenteur || "-"}
                    </td>

                    {/* SERVICE */}

                    <td className="px-4 py-3">

                      {detenteur.service ? (

                        <span className="px-2.5 py-1 rounded-full text-xs bg-haigana-blue/10 text-haigana-blue">

                          {detenteur.service.codeSoa || "SOA"}

                        </span>

                      ) : (

                        <span className="text-gray-400">
                          Non affecté
                        </span>

                      )}

                    </td>

                    {/* VEHICULES */}

                    <td className="px-4 py-3">

                      <button
                        type="button"
                        onClick={() =>
                          openVehicules(detenteur)
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >
                        Voir les véhicules
                      </button>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-3 text-right whitespace-nowrap">

                      {hasRole(
                        "ADMINISTRATEUR",
                        "MODIFICATEUR"
                      ) && (

                        <button
                          onClick={() =>
                            openModifier(detenteur)
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-medium mr-4"
                        >
                          Modifier
                        </button>

                      )}

                      {hasRole("ADMINISTRATEUR") && (

                        <button
                          onClick={() =>
                            setDeleteTarget(detenteur)
                          }
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer
                        </button>

                      )}

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        {!loading && (

          <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">

            {filtered.length} détenteur
            {filtered.length > 1 ? "s" : ""}

          </div>

        )}

      </div>

      {/*MODALE AJOUT / MODIFICATION*/}

      {formOpen && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setFormOpen(false)}
        >

          <form
            onSubmit={handleSubmit}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold text-haigana-dark">
                  {editingId
                    ? "Modifier le détenteur"
                    : "Ajouter un détenteur"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Informations du détenteur
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>

            </div>

            {error && (

              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </div>

            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NOM */}

              <div>

                <label className={labelClass}>
                  Nom *
                </label>

                <input
                  value={form.nomDetenteur}
                  onChange={(e) =>
                    set(
                      "nomDetenteur",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Nom"
                  required
                />

              </div>

              {/* PRENOM */}

              <div>

                <label className={labelClass}>
                  Prénom
                </label>

                <input
                  value={form.prenomDetenteur}
                  onChange={(e) =>
                    set(
                      "prenomDetenteur",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Prénom"
                />

              </div>

              {/* CIN */}

              <div>

                <label className={labelClass}>
                  CIN *
                </label>

                <input
                  value={form.cinDetenteur}
                  onChange={(e) =>
                    set(
                      "cinDetenteur",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Ex : 101 234 567 890"
                  required
                />

              </div>

              {/* IMMATRICULE */}

              <div>

                <label className={labelClass}>
                  Immatricule
                </label>

                <input
                  value={
                    form.immatriculeDetenteur
                  }
                  onChange={(e) =>
                    set(
                      "immatriculeDetenteur",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Ex : ADM-001"
                />

              </div>

              {/* DISTRICT */}

              <div>

                <label className={labelClass}>
                  District
                </label>

                <input
                  value={
                    form.districtDetenteur
                  }
                  onChange={(e) =>
                    set(
                      "districtDetenteur",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="District"
                />

              </div>

              {/* SERVICE */}

              <div>

                <label className={labelClass}>
                  Service / SOA
                </label>

                <select
                  value={form.serviceId}
                  onChange={(e) =>
                    set(
                      "serviceId",
                      e.target.value
                    )
                  }
                  className={`${inputClass} bg-white`}
                >

                  <option value="">
                    -- Aucun service --
                  </option>

                  {soaList.map((soa) => (

                    <option
                      key={soa.id}
                      value={soa.id}
                    >
                      {soa.codeSoa}

                      {soa.region
                        ? ` — ${soa.region.nomRegion}`
                        : ""}

                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* BOUTONS */}

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
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

      {/*MODALE VEHICULES DU DETENTEUR*/}

      {vehiculesOpen &&
        selectedDetenteur && (

          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={closeVehicules}
          >

            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-haigana-dark">
                    Véhicules détenus
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">

                    Détenteur :{" "}

                    <span className="font-semibold text-haigana-dark">

                      {selectedDetenteur.nomDetenteur}{" "}

                      {selectedDetenteur.prenomDetenteur}

                    </span>

                  </p>

                </div>

                <button
                  onClick={closeVehicules}
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>

              </div>

              {/* CONTENU */}

              <div className="p-6 overflow-y-auto max-h-[70vh]">

                {vehiculeError && (

                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {vehiculeError}
                  </div>

                )}

                {loadingVehicules ? (

                  <div className="py-12 text-center text-gray-400">
                    Chargement des véhicules...
                  </div>

                ) : vehiculesDetenteur.length ===
                  0 ? (

                  <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">

                    <p className="text-gray-400">
                      Aucun véhicule détenu par cette personne.
                    </p>

                  </div>

                ) : (

                  <div className="border border-gray-100 rounded-xl overflow-hidden">

                    <table className="w-full text-sm">

                      <thead className="bg-haigana-dark text-white">

                        <tr>

                          <th className="text-left px-4 py-3">
                            Immatricule
                          </th>

                          <th className="text-left px-4 py-3">
                            Marque
                          </th>

                          <th className="text-left px-4 py-3">
                            Lieu de déplacement
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {vehiculesDetenteur.map(
                          (vehicule) => (

                            <tr
                              key={vehicule.id}
                              className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                            >

                              {/* IMMATRICULE */}

                              <td className="px-4 py-3 font-semibold text-haigana-dark">

                                {vehicule.immatricule ||
                                  "-"}

                              </td>

                              {/* MARQUE */}

                              <td className="px-4 py-3">

                                {vehicule.marque?.marqueVehicule ||
                                  "-"}

                              </td>

                              {/* LIEU */}

                              <td className="px-4 py-3">

                                {vehicule.lieuAffectationActuel ||
                                  "-"}

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

              {/* FOOTER */}

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

                <button
                  onClick={closeVehicules}
                  className="px-5 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  Fermer
                </button>

              </div>

            </div>

          </div>

        )}

      {/*MODALE SUPPRESSION*/}

      {deleteTarget && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4"
          onClick={() =>
            setDeleteTarget(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2 className="text-xl font-bold text-red-600 mb-3">
              Supprimer le détenteur ?
            </h2>

            <p className="text-sm text-gray-500 mb-2">
              Voulez-vous vraiment supprimer :
            </p>

            <p className="font-semibold text-haigana-dark mb-4">

              {deleteTarget.nomDetenteur}{" "}

              {deleteTarget.prenomDetenteur}

            </p>

            <p className="text-sm text-gray-500 mb-5">
              Si ce détenteur possède encore un véhicule,
              la suppression sera refusée.
            </p>

            <div className="flex justify-end gap-2">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                Annuler
              </button>

              <button
                type="button"
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
}