import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = {
  vehiculeId: "",
  mecanicienId: "",
  description: "",
  dateReparation: "",
  pieceJustificativeUrl: "",
};

export default function ReparationAdmin() {
  const [reparations, setReparations] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [mecaniciens, setMecaniciens] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // ÉTAT VISUEL POUR LA SAISIE BRUTE DE L'IMMATRICULATION
  const [immatriculationSaisie, setImmatriculationSaisie] = useState("");


  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // ROLE UTILISATEUR
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("haigana_token");

    if (!token) {
      setRole("");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      console.log("JWT payload :", payload);

      /*
       * Ton backend utilise :
       * ROLE_ADMINISTRATEUR
       * ROLE_MODIFICATEUR
       * ROLE_CONSULTANT
       */

      let authorities = [];

      if (Array.isArray(payload.authorities)) {
        authorities = payload.authorities;
      } else if (Array.isArray(payload.roles)) {
        authorities = payload.roles;
      } else if (Array.isArray(payload.authority)) {
        authorities = payload.authority;
      }

      console.log("Authorities React :", authorities);

      if (authorities.includes("ROLE_ADMINISTRATEUR")) {
        setRole("ADMINISTRATEUR");
      } else if (
        authorities.includes("ROLE_MODIFICATEUR")
      ) {
        setRole("MODIFICATEUR");
      } else if (
        authorities.includes("ROLE_CONSULTANT")
      ) {
        setRole("CONSULTANT");
      } else {
        setRole("");
      }

    } catch (err) {
      console.error(
        "Erreur lecture du rôle depuis le JWT :",
        err
      );

      setRole("");
    }
  }, []);
  // PERMISSIONS
  const isAdministrateur =
    role === "ADMINISTRATEUR";

  const isModificateur =
    role === "MODIFICATEUR";

  const isConsultant =
    role === "CONSULTANT";

  const canAdd =
    isAdministrateur;

  const canEdit =
    isAdministrateur ||
    isModificateur;

  const canDelete =
    isAdministrateur;
  // CHARGEMENT DES VEHICULES ET MECANICIENS
  useEffect(() => {
    loadVehicules();
    loadMecaniciens();
  }, []);

  async function loadVehicules() {
    try {
      const response =
        await client.get("/vehicules");

      setVehicules(response.data);

    } catch (err) {
      console.error(
        "Erreur chargement véhicules :",
        err
      );

      setError(
        "Impossible de charger les véhicules."
      );
    }
  }

  async function loadMecaniciens() {
    try {
      const response =
        await client.get("/mecaniciens");

      setMecaniciens(response.data);

    } catch (err) {
      console.error(
        "Erreur chargement mécaniciens :",
        err
      );

      setError(
        "Impossible de charger les mécaniciens."
      );
    }
  }
  // CHARGEMENT DES REPARATIONS
  async function loadReparations(vehiculeId) {

    if (!vehiculeId) {
      setReparations([]);
      return;
    }

    try {
      setError("");

      const response =
        await client.get("/reparations", {
          params: {
            vehiculeId: Number(vehiculeId),
          },
        });

      setReparations(response.data);

    } catch (err) {
      console.error(
        "Erreur chargement réparations :",
        err
      );

      setError(
        "Impossible de charger les réparations."
      );
    }
  }
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
  }
  // CHANGEMENT VEHICULE
  function handleVehiculeChange(value) {

    set("vehiculeId", value);

    setError("");
    setSuccess("");

    /*
     * Lorsqu'un véhicule est sélectionné,
     * on charge automatiquement ses réparations.
     */
    if (value) {
      loadReparations(value);
    } else {
      setReparations([]);
    }
  }
  // ENREGISTREMENT
  async function handleSubmit(e) {

    e.preventDefault();

    /*
     * Sécurité supplémentaire côté interface.
     * Seul l'administrateur peut ajouter.
     */
    if (!canAdd && !editingId) {
      setError(
        "Vous n'avez pas l'autorisation d'ajouter une réparation."
      );

      return;
    }

    /*
     * Seuls administrateur et modificateur
     * peuvent modifier.
     */
    if (editingId && !canEdit) {
      setError(
        "Vous n'avez pas l'autorisation de modifier une réparation."
      );

      return;
    }

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {

      if (!form.vehiculeId) {
        throw new Error(
          "Le véhicule est obligatoire."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "La description de la réparation est obligatoire."
        );
      }

      if (!form.dateReparation) {
        throw new Error(
          "La date de réparation est obligatoire."
        );
      }

      const selectedVehicule =
        vehicules.find(
          (v) =>
            Number(v.id) ===
            Number(form.vehiculeId)
        );

      if (!selectedVehicule) {
        throw new Error(
          "Véhicule introuvable."
        );
      }

      const payload = {

        description:
          form.description.trim(),

        dateReparation:
          form.dateReparation,

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() ||
          null,

        vehicule: {
          id: Number(form.vehiculeId),
        },

        mecanicien:
          form.mecanicienId
            ? {
                id: Number(
                  form.mecanicienId
                ),
              }
            : null,
      };

      console.log(
        "Payload réparation :",
        payload
      );

      if (editingId) {

        await client.put(
          `/reparations/${editingId}`,
          payload
        );

        setSuccess(
          "La réparation a été modifiée avec succès."
        );

      } else {

        await client.post(
          "/reparations",
          payload
        );

        setSuccess(
          "La réparation a été enregistrée avec succès."
        );
      }

      /*
       * Recharge la liste du véhicule.
       */
      await loadReparations(
        form.vehiculeId
      );

      /*
       * En modification, on conserve le véhicule
       * pour continuer à afficher sa liste.
       */
      if (editingId) {

        setForm((current) => ({
          ...current,
          mecanicienId: "",
          description: "",
          dateReparation: "",
          pieceJustificativeUrl: "",
        }));

        setEditingId(null);

      } else {

        setForm(emptyForm);
      }

    } catch (err) {

      console.error(
        "Erreur réparation :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Erreur lors de l'enregistrement de la réparation."
      );

    } finally {

      setSubmitting(false);
    }
  }

  // ANALYSE ET CHARGEMENT DU MODULO DE RÉPARATION VIA LA SAISIE BRUTE

  function handleImmatriculationSaisie(texteSaisi) {
    setImmatriculationSaisie(texteSaisi);
    setError("");
    setSuccess("");

    // Nettoyage de la chaîne (Majuscules, suppression des espaces blancs accidentels)
    const immatCible = texteSaisi.trim().replace(/\s+/g, "").toUpperCase();

    if (!immatCible) {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setReparations([]);
      return;
    }

    // Extraction de la correspondance exacte dans le parc
    const vehiculeIdentifie = vehicules.find(
      (v) => (v.immatricule || "").trim().replace(/\s+/g, "").toUpperCase() === immatCible
    );

    if (vehiculeIdentifie) {
      setForm((prev) => ({ ...prev, vehiculeId: String(vehiculeIdentifie.id) }));
      loadReparations(vehiculeIdentifie.id);
    } else {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setReparations([]);
    }
  }


  // MODIFICATION
    // RÉINITIALISATION DU FORMULAIRE
  function resetForm() {
    setForm(emptyForm);
    setImmatriculationSaisie("");
    setEditingId(null);
  }

  // OUVERTURE DU MODE MODIFICATION
  function handleEdit(reparation) {
    if (!canEdit) {
      setError("Vous n'avez pas l'autorisation de modifier une réparation.");
      return;
    }

    setError("");
    setSuccess("");
    setEditingId(reparation.id);

    // Capture de l'immatriculation pour alimenter l'input textuel
    const immatVehicule = reparation.vehicule?.immatricule || "";
    setImmatriculationSaisie(immatVehicule);

    setForm({
      vehiculeId: reparation.vehicule?.id ? String(reparation.vehicule.id) : "",
      mecanicienId: reparation.mecanicien?.id ? String(reparation.mecanicien.id) : "",
      description: reparation.description || "",
      dateReparation: reparation.dateReparation || "",
      pieceJustificativeUrl: reparation.pieceJustificativeUrl || "",
    });

    if (reparation.vehicule?.id) {
      loadReparations(reparation.vehicule.id);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // SUPPRESSION
  async function handleDelete(id) {

    if (!canDelete) {
      setError(
        "Vous n'avez pas l'autorisation de supprimer une réparation."
      );

      return;
    }

    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer cette réparation ?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {

      await client.delete(
        `/reparations/${id}`
      );

      setSuccess(
        "La réparation a été supprimée avec succès."
      );

      /*
       * Recharge la liste du véhicule.
       */
      if (form.vehiculeId) {
        await loadReparations(
          form.vehiculeId
        );
      }

    } catch (err) {

      console.error(
        "Erreur suppression :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer la réparation."
      );
    }
  }
  // RECHERCHE
  const filtered =
    reparations.filter((r) => {

      const texte = `
        ${r.description || ""}
        ${r.mecanicien?.nomMecanicien || ""}
        ${r.vehicule?.immatricule || ""}
        ${r.dateReparation || ""}
      `.toLowerCase();

      return texte.includes(
        search.toLowerCase()
      );
    });
  // STYLES
  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";
  // AFFICHAGE
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

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
          Reparation
        </span>

      </div>

      <h1 className="text-2xl font-bold text-haigana-dark mb-2">
        Gestion des réparations
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Enregistrez et gérez les réparations effectuées
        sur les véhicules.
      </p>

      {/*FORMULAIRE
          ADMINISTRATEUR UNIQUEMENT
          ===================================================== */}

      {canAdd && (

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-card p-8 space-y-6 mb-8"
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-haigana-dark">

                {editingId
                  ? "Modifier la réparation"
                  : "Nouvelle réparation"}

              </h2>

              <p className="text-sm text-gray-500">
                Les champs marqués d'un * sont obligatoires.
              </p>

            </div>

            {editingId && (

              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-haigana-dark"
              >
                Annuler la modification
              </button>

            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* ZONE DE SAISIE DE L'IMMATRICULATION AUTOMATISÉE */}
            <div>
              <label className={labelClass}>
                Immatriculation du Véhicule *
              </label>

              <input
                type="text"
                required
                list="suggestions-parc-reparation"
                value={immatriculationSaisie}
                onChange={(e) => handleImmatriculationSaisie(e.target.value)}
                placeholder="Saisir ou choisir l'immatriculation..."
                className={`${inputClass} uppercase font-bold text-haigana-dark`}
              />

              {/* Datalist dynamique alimenté par les véhicules de la base */}
              <datalist id="suggestions-parc-reparation">
                {vehicules.map((v) => (
                  <option key={v.id} value={v.immatricule}>
                    {v.codeSoa?.codeSoa ? `SOA : ${v.codeSoa.codeSoa}` : "Véhicule actif"}
                  </option>
                ))}
              </datalist>

              {form.vehiculeId && (
                <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                  <span>✓</span> Véhicule identifié (ID interne : {form.vehiculeId})
                </p>
              )}
            </div>


            {/* MECANICIEN */}

            <div>

              <label className={labelClass}>
                Mécanicien
              </label>

              <select
                value={form.mecanicienId}
                onChange={(e) =>
                  set(
                    "mecanicienId",
                    e.target.value
                  )
                }
                className={inputClass}
              >

                <option value="">
                  Aucun mécanicien
                </option>

                {mecaniciens.map((m) => (

                  <option
                    key={m.id}
                    value={m.id}
                  >

                    {m.nomMecanicien}

                    {m.districtMecanicien
                      ? ` - ${m.districtMecanicien}`
                      : ""}

                  </option>

                ))}

              </select>

            </div>

            {/* DATE */}

            <div>

              <label className={labelClass}>
                Date de réparation *
              </label>

              <input
                type="date"
                required
                value={
                  form.dateReparation
                }
                onChange={(e) =>
                  set(
                    "dateReparation",
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2 lg:col-span-3">

              <label className={labelClass}>
                Description *
              </label>

              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  set(
                    "description",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Décrivez les travaux effectués sur le véhicule..."
              />

            </div>

            {/* PIECE JUSTIFICATIVE */}

            <div className="md:col-span-2 lg:col-span-3">

              <label className={labelClass}>
                Pièce justificative
              </label>

              <input
                type="text"
                value={
                  form.pieceJustificativeUrl
                }
                onChange={(e) =>
                  set(
                    "pieceJustificativeUrl",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="URL de la pièce justificative"
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
                ? "Modifier la réparation"
                : "Enregistrer la réparation"}

            </button>

          </div>

        </form>

      )}

      {/* SELECTION VEHICULE */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <label className={labelClass}>
          Recherche par immatriculation de véhicule *
        </label>
        <input
          type="text"
          list="suggestions-parc-reparation"
          value={immatriculationSaisie}
          onChange={(e) => handleImmatriculationSaisie(e.target.value)}
          placeholder="Taper l'immatriculation pour charger les réparations associées..."
          className={`${inputClass} uppercase font-bold text-haigana-dark`}
        />
        {!form.vehiculeId && (
          <p className="text-xs text-gray-400 mt-2">
            Veuillez saisir une immatriculation complète pour charger l'historique mécanique.
          </p>
        )}
      </div>


      {/*RECHERCHE
          TOUS LES ROLES
          ===================================================== */}

      {form.vehiculeId && (

        <SearchSortBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Rechercher une réparation..."
        />

      )}

      {/*LISTE
          ===================================================== */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100">

          <h2 className="font-semibold text-haigana-dark">
            Réparations du véhicule
          </h2>

          <p className="text-sm text-gray-500 mt-1">

            {vehicules.find(
              (v) =>
                String(v.id) ===
                String(form.vehiculeId)
            )?.immatricule ||
              "Sélectionnez un véhicule"}

          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Véhicule
                </th>

                <th className="text-left px-4 py-3">
                  Date
                </th>

                <th className="text-left px-4 py-3">
                  Description
                </th>

                <th className="text-left px-4 py-3">
                  Mécanicien
                </th>

                <th className="text-center px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.map((r) => (

                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3 font-medium text-haigana-dark">
                    {r.vehicule?.immatricule ||
                      "-"}
                  </td>

                  <td className="px-4 py-3">
                    {r.dateReparation ||
                      "-"}
                  </td>

                  <td className="px-4 py-3 max-w-md">

                    <div className="truncate">
                      {r.description ||
                        "-"}
                    </div>

                  </td>

                  <td className="px-4 py-3">
                    {r.mecanicien
                      ?.nomMecanicien ||
                      "-"}
                  </td>

                  <td className="px-4 py-3">

                    <div className="flex justify-center gap-2">

                      {/* MODIFIER :
                          ADMINISTRATEUR + MODIFICATEUR */}

                      {canEdit && (

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(r)
                          }
                          className="px-3 py-1.5 rounded-lg bg-haigana-blue text-white text-xs font-semibold hover:opacity-90"
                        >
                          Modifier
                        </button>

                      )}

                      {/* SUPPRIMER :
                          ADMINISTRATEUR UNIQUEMENT */}

                      {canDelete && (

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(r.id)
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                        >
                          Supprimer
                        </button>

                      )}

                      {/* CONSULTANT :
                          AUCUN BOUTON */}

                      {!canEdit &&
                        !canDelete && (

                          <span className="text-xs text-gray-400">
                            Consultation
                          </span>

                        )}

                    </div>

                  </td>

                </tr>

              ))}

              {filtered.length === 0 && (

                <tr>

                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >

                    {form.vehiculeId
                      ? "Aucune réparation enregistrée pour ce véhicule."
                      : "Sélectionnez un véhicule pour afficher ses réparations."}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
