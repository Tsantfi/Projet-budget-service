import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import {Link } from "react-router-dom";

const emptyForm = {
  vehiculeId: "",
  description: "",
  dateSuivi: "",
  pieceJustificativeUrl: "",
};

export default function SuiviAdmin() {

  // ETATS

  const [vehicules, setVehicules] = useState([]);
  const [suivis, setSuivis] = useState([]);

  const [form, setForm] = useState(emptyForm);

  // ÉTAT CRITIQUE À AJOUTER POUR LA SAISIE DU MATRICULE
  const [immatriculationSaisie, setImmatriculationSaisie] = useState("");

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingVehicules, setLoadingVehicules] = useState(true);
  const [loadingSuivis, setLoadingSuivis] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [role, setRole] = useState("");

  // ROLES

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

      const payload = JSON.parse(
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



  // CHARGEMENT VEHICULES


  async function loadVehicules() {

    try {

      setLoadingVehicules(true);
      setError("");

      const response =
        await client.get("/vehicules");

      console.log(
        "Véhicules reçus :",
        response.data
      );

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setVehicules(data);

    } catch (err) {

      console.error(
        "Erreur chargement véhicules :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de charger les véhicules.";

      setError(message);

    } finally {

      setLoadingVehicules(false);

    }
  }



  // CHARGEMENT SUIVIS


  async function loadSuivis(
    vehiculeId
  ) {

    if (!vehiculeId) {

      setSuivis([]);

      return;

    }

    try {

      setLoadingSuivis(true);
      setError("");

      const id =
        Number(vehiculeId);

      if (!id || id <= 0) {

        setSuivis([]);

        return;

      }

      console.log(
        "Chargement suivis véhicule :",
        id
      );

      const response =
        await client.get(
          "/suivis",
          {
            params: {
              vehiculeId: id,
            },
          }
        );

      console.log(
        "Suivis reçus :",
        response.data
      );

      setSuivis(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur chargement suivis :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de charger les suivis du véhicule.";

      setError(message);

      setSuivis([]);

    } finally {

      setLoadingSuivis(false);

    }
  }



  // FORMULAIRE


  function set(field, value) {

    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

  }



  // RESET FORMULAIRE


  function resetForm() {

    setForm(
      (current) => ({
        ...emptyForm,

        // On conserve le véhicule sélectionné
        vehiculeId:
          current.vehiculeId,
      })
    );

    setEditingId(null);

    setError("");
    setSuccess("");

  }



  // CHANGEMENT VEHICULE


  function handleVehiculeChange(e) {

    const vehiculeId =
      e.target.value;

    console.log(
      "Véhicule sélectionné :",
      vehiculeId
    );

    setForm(
      (current) => ({
        ...current,

        vehiculeId,

        description: "",
        dateSuivi: "",
        pieceJustificativeUrl: "",
      })
    );

    setEditingId(null);

    setSearch("");

    setError("");
    setSuccess("");

    if (vehiculeId) {

      loadSuivis(
        vehiculeId
      );

    } else {

      setSuivis([]);

    }
  }



  // AJOUT / MODIFICATION


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {


      // VEHICULE


      const vehiculeId =
        Number(form.vehiculeId);

      console.log(
        "vehiculeId formulaire :",
        form.vehiculeId
      );

      console.log(
        "vehiculeId numérique :",
        vehiculeId
      );

      if (
        !form.vehiculeId ||
        !vehiculeId ||
        vehiculeId <= 0
      ) {

        alert(
          "Veuillez sélectionner un véhicule."
        );

        throw new Error(
          "Le véhicule est obligatoire."
        );

      }



      // DESCRIPTION


      const description =
        form.description?.trim() || "";

      if (!description) {

        alert(
          "La description du suivi est obligatoire."
        );

        throw new Error(
          "La description du suivi est obligatoire."
        );

      }



      // PAYLOAD


      const payload = {

        vehiculeId: vehiculeId,

        description:
          description,

        dateSuivi:
          form.dateSuivi || null,

        pieceJustificativeUrl:
          form.pieceJustificativeUrl?.trim() ||
          null,

      };


      console.log(
        "========== PAYLOAD SUIVI =========="
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );



      // MODIFICATION


      if (editingId) {

        if (
          !isAdmin &&
          !isModificateur
        ) {

          throw new Error(
            "Vous n'avez pas l'autorisation de modifier ce suivi."
          );

        }

        console.log(
          "Modification suivi ID :",
          editingId
        );

        await client.put(
          `/suivis/${editingId}`,
          payload
        );

        setSuccess(
          "Le suivi a été modifié avec succès."
        );


      }


      // AJOUT


      else {

        if (!isAdmin) {

          throw new Error(
            "Seul un administrateur peut ajouter un suivi."
          );

        }

        console.log(
          "Ajout nouveau suivi"
        );

        await client.post(
          "/suivis",
          payload
        );

        setSuccess(
          "Le suivi a été enregistré avec succès."
        );


      }



      // RECHARGEMENT


      await loadSuivis(
        vehiculeId
      );



      // RESET


      setForm(
        (current) => ({
          ...emptyForm,

          vehiculeId:
            current.vehiculeId,
        })
      );

      setEditingId(null);

    } catch (err) {

      console.error(
        "Erreur enregistrement suivi :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de l'enregistrement du suivi.";

      setError(message);

      if (
        !err.response
      ) {
        alert(message);
      }

    } finally {

      setLoading(false);

    }
  }
  // ANALYSE ET CHARGEMENT DU MODULE DE SUIVI VIA LA SAISIE BRUTE

  function handleImmatriculationSaisie(texteSaisi) {
    setImmatriculationSaisie(texteSaisi);
    setError("");
    setSuccess("");

    // Nettoyage de la chaîne (Majuscules, suppression des espaces blancs)
    const immatCible = texteSaisi.trim().replace(/\s+/g, "").toUpperCase();

    if (!immatCible) {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setSuivis([]);
      return;
    }

    // Extraction de la correspondance exacte dans le parc
    const vehiculeIdentifie = vehicules.find(
      (v) => (v.immatricule || "").trim().replace(/\s+/g, "").toUpperCase() === immatCible
    );

    if (vehiculeIdentifie) {
      setForm((prev) => ({ ...prev, vehiculeId: String(vehiculeIdentifie.id) }));
      loadSuivis(vehiculeIdentifie.id);
    } else {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setSuivis([]);
    }
  }

  // MODIFICATION


    // RESET FORMULAIRE
  function resetForm() {
    setForm((current) => ({
      ...emptyForm,
      vehiculeId: current.vehiculeId,
    }));
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  // MODIFICATION
  function handleEdit(suivi) {
    if (!isAdmin && !isModificateur) {
      alert("Vous n'avez pas l'autorisation de modifier ce suivi.");
      return;
    }

    setError("");
    setSuccess("");
    setEditingId(suivi.id);

    // Capture de l'immatriculation pour alimenter l'input textuel depuis l'objet véhicule du suivi
    const immatVehicule = suivi.vehicule?.immatricule || selectedVehicule?.immatricule || "";
    setImmatriculationSaisie(immatVehicule);

    setForm((current) => ({
      vehiculeId: current.vehiculeId,
      description: suivi.description || "",
      dateSuivi: suivi.dateSuivi || "",
      pieceJustificativeUrl: suivi.pieceJustificativeUrl || "",
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // SUPPRESSION

  async function handleDelete(
    id
  ) {

    if (!isAdmin) {

      alert(
        "Seul un administrateur peut supprimer un suivi."
      );

      return;

    }


    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce suivi ?"
      );


    if (!confirmation) {

      return;

    }


    setError("");
    setSuccess("");


    try {

      await client.delete(
        `/suivis/${id}`
      );


      setSuccess(
        "Le suivi a été supprimé avec succès."
      );



      await loadSuivis(
        form.vehiculeId
      );

    } catch (err) {

      console.error(
        "Erreur suppression suivi :",
        err
      );


      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer le suivi.";


      setError(message);

      alert(message);

    }
  }



  // RECHERCHE


  const filtered =
    suivis.filter(
      (suivi) => {

        const text = `

          ${suivi.description || ""}

          ${suivi.dateSuivi || ""}

          ${suivi.pieceJustificativeUrl || ""}

        `.toLowerCase();


        return text.includes(
          search.toLowerCase()
        );

      }
    );



  // VEHICULE SELECTIONNE


  const selectedVehicule =
    vehicules.find(
      (v) =>
        String(v.id) ===
        String(form.vehiculeId)
    );



  // STYLES


  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "bg-white text-haigana-dark placeholder-slate-400 " +
    "focus:outline-none focus:border-haigana-blue " +
    "focus:ring-2 focus:ring-haigana-blue/10 " +
    "transition-all disabled:bg-slate-100 disabled:cursor-not-allowed";


  const labelClass =
    "block text-sm font-semibold text-haigana-dark mb-2";



  // AFFICHAGE


  return (

    <div className="min-h-screen bg-slate-50">


      {/*EN-TETE*/}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>

          <span>/</span>

          <span className="text-haigana-dark font-medium">
            Suivie
          </span>

          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-haigana-dark">

            Gestion des suivis

          </h1>


          <p className="mt-3 text-slate-500 max-w-2xl">

            Consultez et gérez les suivis
            effectués sur les véhicules.

          </p>

        </div>

      </section>


      {/*CONTENU*/}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


        {/*  SELECTION VEHICULE*/}

                {/*  SELECTION VEHICULE PAR SAISIE MANUELLE TEXTUELLE */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="max-w-xl">
            <label className={labelClass}>
              Immatriculation du Véhicule *
            </label>

            <input
              type="text"
              list="suggestions-parc-suivis"
              value={immatriculationSaisie}
              onChange={(e) => handleImmatriculationSaisie(e.target.value)}
              placeholder="Saisir ou choisir l'immatriculation..."
              className={`${inputClass} uppercase font-bold text-haigana-dark`}
              disabled={loadingVehicules}
            />

            {/* Datalist dynamique alimenté par les véhicules de la base */}
            <datalist id="suggestions-parc-suivis">
              {vehicules.map((v) => (
                <option key={v.id} value={v.immatricule}>
                  {v.codeSoa?.codeSoa ? `SOA : ${v.codeSoa.codeSoa}` : "Véhicule actif"}
                </option>
              ))}
            </datalist>

            {form.vehiculeId && (
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                <span>✓</span> Véhicule identifié (ID interne : {form.vehiculeId})
              </p>
            )}

            {!loadingVehicules && vehicules.length === 0 && (
              <p className="mt-2 text-sm text-red-500">Aucun véhicule disponible.</p>
            )}
          </div>
        </section>

        {/*  FORMULAIRE*/}

        {(isAdmin ||
          isModificateur) && (

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">


            <div className="px-6 md:px-8 py-5 border-b border-slate-100">

              <h2 className="text-lg font-bold text-haigana-dark">

                {editingId
                  ? "Modifier le suivi"
                  : "Nouveau suivi"}

              </h2>


              <p className="text-sm text-slate-500 mt-1">

                {editingId

                  ? "Modifiez les informations du suivi sélectionné."

                  : isAdmin

                  ? "Enregistrez un nouveau suivi pour le véhicule sélectionné."

                  : "Le modificateur peut modifier un suivi existant."}

              </p>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="p-6 md:p-8"
            >


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                {/*DATE*/}

                <div>

                  <label
                    className={
                      labelClass
                    }
                  >

                    Date du suivi

                  </label>


                  <input

                    type="date"

                    value={
                      form.dateSuivi
                    }

                    onChange={
                      (e) =>
                        set(
                          "dateSuivi",
                          e.target.value
                        )
                    }

                    disabled={
                      !form.vehiculeId
                    }

                    className={
                      inputClass
                    }

                  />

                </div>


                {/*PIECE*/}

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

                    onChange={
                      (e) =>
                        set(
                          "pieceJustificativeUrl",
                          e.target.value
                        )
                    }

                    disabled={
                      !form.vehiculeId
                    }

                    className={
                      inputClass
                    }

                    placeholder="https://..."

                  />

                </div>


                {/*DESCRIPTION*/}

                <div className="md:col-span-2">

                  <label
                    className={
                      labelClass
                    }
                  >

                    Description

                    <span className="text-red-500 ml-1">
                      *
                    </span>

                  </label>


                  <textarea

                    rows="5"

                    value={
                      form.description
                    }

                    onChange={
                      (e) =>
                        set(
                          "description",
                          e.target.value
                        )
                    }

                    disabled={
                      !form.vehiculeId
                    }

                    required

                    className={
                      `${inputClass} resize-y`
                    }

                    placeholder="Décrivez le suivi effectué sur le véhicule..."

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


              {/*        ACTIONS*/}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7 pt-6 border-t border-slate-100">


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


                {/* AJOUT */}

                {!editingId &&
                  isAdmin && (

                    <button

                      type="submit"

                      disabled={
                        loading ||
                        !form.vehiculeId
                      }

                      className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"

                    >

                      {loading
                        ? "Enregistrement..."
                        : "Enregistrer le suivi"}

                    </button>

                  )}


                {/* MODIFICATION */}

                {editingId &&
                  (isAdmin ||
                    isModificateur) && (

                    <button

                      type="submit"

                      disabled={
                        loading ||
                        !form.vehiculeId
                      }

                      className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"

                    >

                      {loading
                        ? "Modification..."
                        : "Modifier le suivi"}

                    </button>

                  )}

              </div>

            </form>

          </section>

        )}


        {/*  HISTORIQUE*/}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">


          <div className="px-6 py-5 border-b border-slate-100">

            <h2 className="text-lg font-bold text-haigana-dark">

              Historique des suivis

            </h2>


            <p className="text-sm text-slate-500 mt-1">

              {form.vehiculeId

                ? `Véhicule sélectionné : ${
                    selectedVehicule?.immatricule ||
                    "-"
                  }`

                : "Sélectionnez un véhicule pour afficher ses suivis."}

            </p>

          </div>


          {/* RECHERCHE */}

          {form.vehiculeId && (

            <div className="p-6 border-b border-slate-100">

              <SearchSortBar

                search={
                  search
                }

                onSearchChange={
                  setSearch
                }

                placeholder="Rechercher un suivi..."

              />

            </div>

          )}


          {/* TABLEAU */}

          <div className="overflow-x-auto">

            <table className="w-full text-sm">


              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">

                    Date

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


              <tbody>


                {loadingSuivis && (

                  <tr>

                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-slate-400"
                    >

                      Chargement des suivis...

                    </td>

                  </tr>

                )}


                {!loadingSuivis &&
                  filtered.map(
                    (suivi) => (

                      <tr

                        key={
                          suivi.id
                        }

                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"

                      >


                        {/* DATE */}

                        <td className="px-6 py-4 align-top">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-haigana-dark font-semibold">

                            {suivi.dateSuivi
                              ? new Date(
                                  `${suivi.dateSuivi}T00:00:00`
                                ).toLocaleDateString(
                                  "fr-FR"
                                )
                              : "-"}

                          </span>

                        </td>


                        {/* DESCRIPTION */}

                        <td className="px-6 py-4 align-top text-slate-600 max-w-md">

                          <p className="leading-relaxed">

                            {suivi.description ||
                              "Aucune description"}

                          </p>

                        </td>


                        {/* PIECE */}

                        <td className="px-6 py-4 align-top">

                          {suivi.pieceJustificativeUrl ? (

                            <a

                              href={
                                suivi.pieceJustificativeUrl
                              }

                              target="_blank"

                              rel="noopener noreferrer"

                              className="text-haigana-blue font-semibold hover:underline"

                            >

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
                                    suivi
                                  )
                                }

                                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-haigana-blue hover:bg-haigana-blue/10 transition-colors"

                              >

                                Modifier

                              </button>

                            )}


                            {/* SUPPRIMER */}

                            {isAdmin && (

                              <button

                                type="button"

                                onClick={() =>
                                  handleDelete(
                                    suivi.id
                                  )
                                }

                                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"

                              >

                                Supprimer

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}


                {/* AUCUN RESULTAT */}

                {!loadingSuivis &&
                  form.vehiculeId &&
                  filtered.length === 0 && (

                    <tr>

                      <td

                        colSpan={4}

                        className="px-6 py-14 text-center"

                      >

                        <p className="font-semibold text-haigana-dark">

                          Aucun suivi trouvé

                        </p>

                        <p className="text-sm text-slate-400 mt-1">

                          Aucun suivi ne correspond à votre recherche.

                        </p>

                      </td>

                    </tr>

                  )}


                {/* AUCUN VEHICULE */}

                {!form.vehiculeId && (

                  <tr>

                    <td

                      colSpan={4}

                      className="px-6 py-14 text-center"

                    >

                      <p className="font-semibold text-haigana-dark">

                        Aucun véhicule sélectionné

                      </p>

                      <p className="text-sm text-slate-400 mt-1">

                        Sélectionnez un véhicule ci-dessus pour afficher son historique.

                      </p>

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