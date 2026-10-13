import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = {
  description: "",
  dateControle: "",
  pieceJustificativeUrl: "",
};

export default function ControleAdmin() {

  // ETATS

  const [vehicules, setVehicules] = useState([]);
  const [controles, setControles] = useState([]);
  const [deplacements, setDeplacements] = useState([]);

    const [form, setForm] = useState(emptyForm);

  const [selectedVehiculeId, setSelectedVehiculeId] = useState("");

  // ÉTAT CRITIQUE À AJOUTER POUR LA SAISIE DU MATRICULE
  const [immatriculationSaisie, setImmatriculationSaisie] = useState("");

  const [selectedDeplacementId, setSelectedDeplacementId] =
    useState("");


  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [role, setRole] = useState("");

  const [loadingDeplacements, setLoadingDeplacements] =
    useState(false);

  // ROLES===

  useEffect(() => {
    loadRole();
    loadVehicules();
  }, []);


  function loadRole() {

    try {

      const token =
        localStorage.getItem("haigana_token");

      if (!token) {
        setRole("");
        return;
      }

      const payload =
        JSON.parse(
          atob(token.split(".")[1])
        );

      const authorities =
        payload.authorities ||
        payload.roles ||
        payload.authority ||
        [];

      let roles = [];

      if (Array.isArray(authorities)) {

        roles = authorities;

      } else if (
        typeof authorities === "string"
      ) {

        roles = [authorities];

      }

      console.log(
        "Authorities JWT :",
        authorities
      );

      console.log(
        "Rôles utilisateur :",
        roles
      );

      if (
        roles.includes(
          "ROLE_ADMINISTRATEUR"
        )
      ) {

        setRole(
          "ROLE_ADMINISTRATEUR"
        );

      } else if (
        roles.includes(
          "ROLE_MODIFICATEUR"
        )
      ) {

        setRole(
          "ROLE_MODIFICATEUR"
        );

      } else if (
        roles.includes(
          "ROLE_CONSULTANT"
        )
      ) {

        setRole(
          "ROLE_CONSULTANT"
        );

      } else {

        setRole("");

      }

    } catch (err) {

      console.error(
        "Erreur lecture rôle :",
        err
      );

      setRole("");

    }
  }


  const isAdmin =
    role === "ROLE_ADMINISTRATEUR";

  const isModificateur =
    role === "ROLE_MODIFICATEUR";

  const isConsultant =
    role === "ROLE_CONSULTANT";


  // CHARGEMENT DES VEHICULES

  async function loadVehicules() {

    try {

      const response =
        await client.get(
          "/vehicules"
        );

      setVehicules(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur chargement véhicules :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Impossible de charger les véhicules."
      );

    }
  }


  // CHARGEMENT DES DEPLACEMENTS

  async function loadDeplacements(
    vehiculeId
  ) {

    if (!vehiculeId) {

      setDeplacements([]);
      return;

    }

    try {

      setLoadingDeplacements(true);
      setError("");

      const id =
        Number(vehiculeId);

      if (
        !Number.isInteger(id)
      ) {

        throw new Error(
          "Identifiant du véhicule invalide."
        );

      }

      const response =
        await client.get(
          "/deplacements",
          {
            params: {
              vehiculeId: id,
            },
          }
        );

      console.log(
        "Déplacements reçus :",
        response.data
      );

      setDeplacements(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur chargement déplacements :",
        err
      );

      setDeplacements([]);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Impossible de charger les déplacements."
      );

    } finally {

      setLoadingDeplacements(false);

    }
  }


  // CHARGEMENT DES CONTROLES

  async function loadControles(
    vehiculeId
  ) {

    if (!vehiculeId) {

      setControles([]);
      return;

    }

    try {

      setError("");

      const id =
        Number(vehiculeId);

      if (
        !Number.isInteger(id)
      ) {

        throw new Error(
          "Identifiant du véhicule invalide."
        );

      }

      const response =
        await client.get(
          "/controles",
          {
            params: {
              vehiculeId: id,
            },
          }
        );

      console.log(
        "Contrôles reçus :",
        response.data
      );

      setControles(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur chargement contrôles :",
        err
      );

      setControles([]);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Impossible de charger les contrôles."
      );

    }
  }

  // VERIFIER SI UN DEPLACEMENT EST DEJA CONTROLE

  function isDeplacementControle(
    deplacementId
  ) {

    if (!deplacementId) {
      return false;
    }

    const id =
      Number(deplacementId);

    return controles.some(
      (controle) => {

        if (
          !Array.isArray(
            controle.deplacements
          )
        ) {

          return false;

        }

        return controle.deplacements.some(
          (relation) => {

            const relationId =
              relation.deplacement?.id ??
              relation.deplacementId ??
              relation.idDeplacement;

            const statut =
              relation.statut;

            return (
              Number(relationId) === id &&
              statut === "CONTROLE"
            );

          }
        );

      }
    );
  }


  // OBTENIR LE DEPLACEMENT D'UN CONTROLE

  function getDeplacementIdFromControle(
    controle
  ) {

    if (
      !controle ||
      !Array.isArray(
        controle.deplacements
      )
    ) {

      return "";

    }

    const relation =
      controle.deplacements.find(
        (item) =>
          item?.deplacement?.id ||
          item?.deplacementId ||
          item?.idDeplacement
      );

    if (!relation) {
      return "";
    }

    return String(
      relation.deplacement?.id ??
      relation.deplacementId ??
      relation.idDeplacement ??
      ""
    );
  }

  // FORMULAIRE===

  function set(field, value) {

    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

  }

  // RESET===

  function resetForm() {

    setForm({
      ...emptyForm,
    });

    setEditingId(null);

    setSelectedDeplacementId("");

    setError("");
    setSuccess("");

  }

  // CHANGEMENT VEHICULE===

  async function handleVehiculeChange(e) {

    const id =
      e.target.value;

    console.log(
      "VÉHICULE CHOISI =",
      id
    );

    setSelectedVehiculeId(id);

    setSelectedDeplacementId("");

    setForm({
      ...emptyForm,
    });

    setEditingId(null);

    setSearch("");

    setError("");
    setSuccess("");

    setDeplacements([]);
    setControles([]);

    if (id) {

      await loadControles(id);

      await loadDeplacements(id);

    }

  }

  // CHANGEMENT DEPLACEMENT===

  function handleDeplacementChange(e) {

    const id =
      e.target.value;

    console.log(
      "DÉPLACEMENT CHOISI =",
      id
    );

    setSelectedDeplacementId(id);

    setError("");
    setSuccess("");

  }

  // FORMATAGE DATE===

  function formatDate(
    date
  ) {

    if (!date) {
      return "-";
    }

    const value =
      String(date);

    if (
      value.length >= 10
    ) {

      return value.substring(
        0,
        10
      );

    }

    return value;

  }

  // AFFICHAGE DEPLACEMENT===

  function formatDeplacement(
    deplacement
  ) {

    if (!deplacement) {
      return "Déplacement";
    }

    const date =
      formatDate(
        deplacement.dateDeplacement
      );

    const depart =
      deplacement.lieuDepart ||
      "Lieu de départ non renseigné";

    const arrivee =
      deplacement.lieuArrivee ||
      "Lieu d'arrivée non renseigné";

    return `${date} — ${depart} → ${arrivee}`;

  }

  // AJOUT / MODIFICATION===

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {

      // VEHICULE

      if (
        !selectedVehiculeId
      ) {

        alert(
          "Le véhicule est obligatoire."
        );

        setSubmitting(false);
        return;

      }

      const vehiculeId =
        Number(
          selectedVehiculeId
        );

      if (
        !Number.isInteger(
          vehiculeId
        ) ||
        vehiculeId <= 0
      ) {

        alert(
          "Identifiant du véhicule invalide."
        );

        setSubmitting(false);
        return;

      }


      // DEPLACEMENT

      if (
        !selectedDeplacementId
      ) {

        alert(
          "Veuillez sélectionner un déplacement."
        );

        setSubmitting(false);
        return;

      }

      const deplacementId =
        Number(
          selectedDeplacementId
        );

      if (
        !Number.isInteger(
          deplacementId
        ) ||
        deplacementId <= 0
      ) {

        alert(
          "Identifiant du déplacement invalide."
        );

        setSubmitting(false);
        return;

      }


      // VERIFIER DEPLACEMENT DEJA CONTROLE

      if (
        !editingId &&
        isDeplacementControle(
          deplacementId
        )
      ) {

        alert(
          "Ce déplacement a déjà été contrôlé."
        );

        setSubmitting(false);
        return;

      }


      // DATE

      if (
        !form.dateControle
      ) {

        alert(
          "La date du contrôle est obligatoire."
        );

        setSubmitting(false);
        return;

      }


      // PAYLOAD

      const payload = {

        vehiculeId:

          vehiculeId,

        description:
          form.description?.trim() ||
          null,

        dateControle:
          form.dateControle,

        pieceJustificativeUrl:
          form.pieceJustificativeUrl?.trim() ||
          null,

        deplacements: [

          {
            deplacementId:
              deplacementId,

            statut:
              "CONTROLE",

          },

        ],

      };


      console.log(
        "========== CONTROLE =========="
      );

      console.log(
        "Véhicule :",
        vehiculeId
      );

      console.log(
        "Déplacement :",
        deplacementId
      );

      console.log(
        "Payload envoyé :",
        payload
      );

      console.log(
        "JSON envoyé :",
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      // MODIFICATION

      if (
        editingId !== null
      ) {

        console.log(
          "PUT : /controles/" +
          editingId
        );

        await client.put(
          `/controles/${editingId}`,
          payload
        );

        alert(
          "Le contrôle a été modifié avec succès."
        );

      }


      // AJOUT

      else {

        if (!isAdmin) {

          alert(
            "Vous n'avez pas l'autorisation d'ajouter un contrôle."
          );

          setSubmitting(false);
          return;

        }

        console.log(
          "POST : /controles"
        );

        await client.post(
          "/controles",
          payload
        );

        alert(
          "Le contrôle a été ajouté avec succès."
        );

      }


      // RECHARGEMENT

      await loadControles(
        selectedVehiculeId
      );

      await loadDeplacements(
        selectedVehiculeId
      );


      // RESET

      setForm({
        ...emptyForm,
      });

      setSelectedDeplacementId("");

      setEditingId(null);

    } catch (err) {

      console.error(
        "========== ERREUR CONTROLE =========="
      );

      console.error(err);

      console.error(
        "Status :",
        err.response?.status
      );

      console.error(
        "Réponse backend :",
        err.response?.data
      );

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur interne."
      );

    } finally {

      setSubmitting(false);

    }

  }

  // INJECTION ET SÉCURISATION VIA LA SAISIE BRUTE DE L'IMMATRICULATION

  async function handleImmatriculationSaisie(texteSaisi) {
    setImmatriculationSaisie(texteSaisi);
    setSelectedVehiculeId("");
    setSelectedDeplacementId("");
    setForm(emptyForm);
    setEditingId(null);
    setSearch("");
    setError("");
    setSuccess("");
    setDeplacements([]);
    setControles([]);

    // Normalisation de la chaîne de caractères (Majuscules sans espaces blancs)
    const immatCible = texteSaisi.trim().replace(/\s+/g, "").toUpperCase();

    if (!immatCible) return;

    // Localiser le véhicule correspondant dans la liste BDD
    const vehiculeIdentifie = vehicules.find(
      (v) => (v.immatricule || "").trim().replace(/\s+/g, "").toUpperCase() === immatCible
    );

    if (vehiculeIdentifie) {
      const targetId = String(vehiculeIdentifie.id);
      setSelectedVehiculeId(targetId);
      await loadControles(targetId);
      await loadDeplacements(targetId);
    }
  }

  // REINITIALISATION DU FORMULAIRE
  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setSelectedDeplacementId("");
    setError("");
    setSuccess("");
  }

  // EDITEUR DE CONTRÔLE
  function handleEdit(controle) {
    if (!isAdmin && !isModificateur) return;
    if (!selectedVehiculeId) {
      alert("Veuillez sélectionner un véhicule valide.");
      return;
    }

    setError("");
    setSuccess("");
    setEditingId(controle.id);

    const deplacementId = getDeplacementIdFromControle(controle);
    setSelectedDeplacementId(deplacementId);

    setForm({
      description: controle.description || "",
      dateControle: controle.dateControle || "",
      pieceJustificativeUrl: controle.pieceJustificativeUrl || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // SUPPRESSION===

  async function handleDelete(
    id
  ) {

    if (!isAdmin) {
      return;
    }

    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce contrôle ?"
      )
    ) {

      return;

    }

    setError("");
    setSuccess("");

    try {

      await client.delete(
        `/controles/${id}`
      );

      setSuccess(
        "Le contrôle a été supprimé avec succès."
      );

      await loadControles(
        selectedVehiculeId
      );

      await loadDeplacements(
        selectedVehiculeId
      );

    } catch (err) {

      console.error(
        "Erreur suppression contrôle :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer le contrôle."
      );

    }

  }

  // RECHERCHE===

  const filtered =
    controles.filter(
      (controle) => {

        const text = `

          ${controle.description || ""}

          ${controle.dateControle || ""}

        `.toLowerCase();

        return text.includes(
          search.toLowerCase()
        );

      }
    );

  // STYLES===

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "bg-white text-haigana-dark placeholder-slate-400 " +
    "focus:outline-none focus:border-haigana-blue " +
    "focus:ring-2 focus:ring-haigana-blue/10 " +
    "transition-all " +
    "disabled:bg-slate-100 disabled:text-slate-400 " +
    "disabled:cursor-not-allowed";

  const labelClass =
    "block text-sm font-semibold text-haigana-dark mb-2";

  // AFFICHAGE===

  return (

    <div className="min-h-screen bg-slate-50">


      {/*EN-TETE
      ======================================================== */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


          {/* FIL D'ARIANE */}

          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

            <Link
              to="/gestion"
              className="hover:text-haigana-blue transition-colors"
            >
              Gestion
            </Link>

            <span>/</span>

            <span className="text-haigana-dark font-medium">
              Contrôles
            </span>

          </div>


          {/* TITRE */}

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <h1 className="text-3xl md:text-4xl font-bold text-haigana-dark tracking-tight">
                Gestion des contrôles
              </h1>

              <p className="mt-3 text-slate-500 max-w-2xl leading-relaxed">
                Consultez et gérez les contrôles effectués
                sur les véhicules.
              </p>

            </div>


            {/* COMPTEUR */}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-w-[170px]">

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Contrôles enregistrés
              </p>

              <p className="text-3xl font-bold text-haigana-dark mt-1">
                {controles.length}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/*CONTENU
      ======================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


                {/*  SELECTION VEHICULE PAR TEXTE + DEPLACEMENT DEPENDANT */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* SAISIE DE L'IMMATRICULATION AUTOMATISÉE */}
            <div>
              <label className={labelClass}>
                Immatriculation du Véhicule *
              </label>

              <input
                type="text"
                list="suggestions-parc-controles"
                value={immatriculationSaisie}
                onChange={(e) => handleImmatriculationSaisie(e.target.value)}
                placeholder="Taper l'immatriculation du véhicule..."
                className={`${inputClass} uppercase font-bold text-haigana-dark`}
              />

              {/* Datalist contenant les correspondances du parc automobile */}
              <datalist id="suggestions-parc-controles">
                {vehicules.map((v) => (
                  <option key={v.id} value={v.immatricule}>
                    {v.codeSoa?.codeSoa ? `SOA : ${v.codeSoa.codeSoa}` : "Véhicule actif"}
                  </option>
                ))}
              </datalist>

              {selectedVehiculeId && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <span>✓</span> Véhicule identifié (ID interne : {selectedVehiculeId})
                </p>
              )}
            </div>

            {/* DEPLACEMENT SELECTIONNABLE (RESTE INCHANGÉ MAIS DÉPEND DE LA SAISIE CI-DESSUS) */}
            <div>
              <label className={labelClass}>
                Déplacement *
              </label>

              <select
                value={
                  selectedDeplacementId
                }
                onChange={
                  handleDeplacementChange
                }
                disabled={
                  !selectedVehiculeId ||
                  loadingDeplacements
                }
                className={
                  inputClass
                }
              >

                <option value="">

                  {!selectedVehiculeId

                    ? "Sélectionnez d'abord un véhicule..."

                    : loadingDeplacements

                    ? "Chargement des déplacements..."

                    : deplacements.length === 0

                    ? "Aucun déplacement disponible"

                    : "Sélectionner un déplacement..."
                  }

                </option>


                {deplacements.map(
                  (deplacement) => {

                    const dejaControle =
                      isDeplacementControle(
                        deplacement.id
                      );

                    return (

                      <option
                        key={
                          deplacement.id
                        }
                        value={
                          deplacement.id
                        }
                        disabled={
                          dejaControle &&
                          editingId === null
                        }
                      >

                        {formatDeplacement(
                          deplacement
                        )}

                        {dejaControle
                          ? " — Déjà contrôlé"
                          : " — Non contrôlé"}

                      </option>

                    );

                  }
                )}

              </select>


              {/* INFORMATION */}

              {selectedVehiculeId &&
                !loadingDeplacements &&
                deplacements.length === 0 && (

                  <p className="mt-2 text-sm text-slate-400">

                    Aucun déplacement enregistré
                    pour ce véhicule.

                  </p>

                )}


              {selectedDeplacementId && (

                <div className="mt-3">

                  {isDeplacementControle(
                    selectedDeplacementId
                  ) && !editingId ? (

                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">

                      <p className="text-sm font-semibold text-red-700">
                        Ce déplacement est déjà contrôlé.
                      </p>

                      <p className="text-xs text-red-600 mt-1">
                        Vous ne pouvez pas ajouter un nouveau
                        contrôle pour ce déplacement.
                      </p>

                    </div>

                  ) : (

                    <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">

                      <p className="text-sm font-semibold text-green-700">
                        Ce déplacement n'est pas encore contrôlé.
                      </p>

                      <p className="text-xs text-green-600 mt-1">
                        Vous pouvez enregistrer le contrôle.
                      </p>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>

        </section>


        {/*  FORMULAIRE */}

        {(isAdmin ||
          isModificateur) && (

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">


            {/* EN-TETE */}

            <div className="px-6 md:px-8 py-5 border-b border-slate-100">

              <h2 className="text-lg font-bold text-haigana-dark">

                {editingId
                  ? "Modifier le contrôle"
                  : "Nouveau contrôle"}

              </h2>

              <p className="text-sm text-slate-500 mt-1">

                {editingId

                  ? "Modifiez les informations du contrôle sélectionné."

                  : isAdmin

                  ? "Enregistrez un nouveau contrôle pour le déplacement sélectionné."

                  : "Le modificateur peut uniquement modifier un contrôle existant."

                }

              </p>

            </div>


            {/* FORMULAIRE */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 md:p-8"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                {/* DATE */}

                <div>

                  <label
                    className={
                      labelClass
                    }
                  >

                    Date du contrôle

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>

                  <input
                    type="date"
                    required
                    value={
                      form.dateControle
                    }
                    onChange={(e) =>
                      set(
                        "dateControle",
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedVehiculeId ||
                      !selectedDeplacementId
                    }
                    className={
                      inputClass
                    }
                  />

                </div>


                {/* PIECE */}

                <div>

                  <label
                    className={
                      labelClass
                    }
                  >
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
                    disabled={
                      !selectedVehiculeId ||
                      !selectedDeplacementId
                    }
                    className={
                      inputClass
                    }
                    placeholder="URL de la pièce justificative"
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label
                    className={
                      labelClass
                    }
                  >
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      set(
                        "description",
                        e.target.value
                      )
                    }
                    disabled={
                      !selectedVehiculeId ||
                      !selectedDeplacementId
                    }
                    className={`${inputClass} min-h-[120px] resize-y`}
                    placeholder="Décrivez le contrôle effectué..."
                  />

                </div>

              </div>


              {/*MESSAGES*/}

              {error && (

                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

                  {error}

                </div>

              )}

              {success && (

                <div className="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">

                  {success}

                </div>

              )}


              {/*ACTIONS*/}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-6 border-t border-slate-100">


                {/* ANNULER */}

                {editingId && (

                  <button
                    type="button"
                    onClick={
                      resetForm
                    }
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>

                )}


                {/*      AJOUT
                ================================================= */}

                {!editingId &&
                  isAdmin && (

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !selectedVehiculeId ||
                        !selectedDeplacementId ||
                        isDeplacementControle(
                          selectedDeplacementId
                        )
                      }
                      className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {submitting

                        ? "Enregistrement..."

                        : isDeplacementControle(
                            selectedDeplacementId
                          )

                        ? "Déplacement déjà contrôlé"

                        : "Ajouter le contrôle"

                      }

                    </button>

                  )}


                {/*      MODIFICATION
                ================================================= */}

                {editingId &&
                  (isAdmin ||
                    isModificateur) && (

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !selectedVehiculeId ||
                        !selectedDeplacementId
                      }
                      className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >

                      {submitting

                        ? "Modification..."

                        : "Modifier le contrôle"

                      }

                    </button>

                  )}

              </div>

            </form>

          </section>

        )}


        {/*  CONSULTANT */}

        {isConsultant &&
          error && (

            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

            </div>

          )}


        {/*  RECHERCHE */}

        <section className="mb-5">

          <SearchSortBar
            search={
              search
            }
            onSearchChange={
              setSearch
            }
            placeholder="Rechercher un contrôle..."
          />

        </section>


        {/*  TABLEAU */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">


          {/* EN-TETE */}

          <div className="px-6 py-5 border-b border-slate-100">

            <h2 className="text-lg font-bold text-haigana-dark">
              Historique des contrôles
            </h2>

            <p className="text-sm text-slate-500 mt-1">

              {selectedVehiculeId

                ? `${filtered.length} résultat${
                    filtered.length !== 1
                      ? "s"
                      : ""
                  } affiché${
                    filtered.length !== 1
                      ? "s"
                      : ""
                  }.`

                : "Sélectionnez un véhicule pour afficher ses contrôles."

              }

            </p>

          </div>


          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-sm">


              {/* THEAD */}

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Déplacement
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Pièce justificative
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              {/* TBODY */}

              <tbody>

                {filtered.map(
                  (controle) => {

                    const controleDeplacementId =
                      getDeplacementIdFromControle(
                        controle
                      );

                    const controleDeplacement =
                      deplacements.find(
                        (item) =>
                          Number(item.id) ===
                          Number(
                            controleDeplacementId
                          )
                      );

                    return (

                      <tr
                        key={
                          controle.id
                        }
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                      >


                        {/* DATE */}

                        <td className="px-6 py-4 align-top">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-haigana-dark font-semibold">

                            {controle.dateControle ||
                              "-"}

                          </span>

                        </td>


                        {/* DEPLACEMENT */}

                        <td className="px-6 py-4 align-top">

                          {controleDeplacement ? (

                            <div>

                              <p className="font-semibold text-haigana-dark">

                                {
                                  formatDeplacement(
                                    controleDeplacement
                                  )
                                }

                              </p>

                              <span className="inline-flex mt-2 items-center px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">

                                Contrôlé

                              </span>

                            </div>

                          ) : (

                            <span className="text-slate-400">
                              Déplacement non trouvé
                            </span>

                          )}

                        </td>


                        {/* DESCRIPTION */}

                        <td className="px-6 py-4 align-top text-slate-600 max-w-md">

                          <p className="leading-relaxed">

                            {controle.description ||
                              "Aucune description"}

                          </p>

                        </td>


                        {/* PIECE */}

                        <td className="px-6 py-4 align-top">

                          {controle.pieceJustificativeUrl ? (

                            <a
                              href={
                                controle.pieceJustificativeUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-haigana-blue font-semibold hover:underline"
                            >

                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                              >

                                <path
                                  d="M14 4h6v6M20 4l-8 8"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                <path
                                  d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"
                                  stroke="currentColor"
                                  strokeWidth="1.7"
                                  strokeLinecap="round"
                                />

                              </svg>

                              Voir la pièce

                            </a>

                          ) : (

                            <span className="text-slate-400">
                              Aucune pièce
                            </span>

                          )}

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-4 align-top">

                          <div className="flex justify-end gap-2">


                            {/* MODIFIER */}

                            {(isAdmin ||
                              isModificateur) && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    controle
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-haigana-blue hover:bg-haigana-blue/10 transition-colors"
                              >

                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >

                                  <path
                                    d="m14 6 4 4M5 19l3.5-.8L19 7.7a2.1 2.1 0 0 0-3-3L5.5 15.2 5 19Z"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />

                                </svg>

                                Modifier

                              </button>

                            )}


                            {/* SUPPRIMER */}

                            {isAdmin && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    controle.id
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              >

                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >

                                  <path
                                    d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />

                                </svg>

                                Supprimer

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )}


                {/* AUCUN RESULTAT */}

                {filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-14 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">

                          <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                          >

                            <path
                              d="M6 4h12v16H6V4Z"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M9 8h6M9 12h6M9 16h4"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                            />

                          </svg>

                        </div>


                        <p className="font-semibold text-haigana-dark">

                          {selectedVehiculeId

                            ? "Aucun contrôle trouvé"

                            : "Aucun véhicule sélectionné"

                          }

                        </p>


                        <p className="text-sm text-slate-400 mt-1">

                          {selectedVehiculeId

                            ? "Aucun contrôle ne correspond à votre recherche."

                            : "Sélectionnez un véhicule ci-dessus pour afficher ses contrôles."

                          }

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>

  );

}