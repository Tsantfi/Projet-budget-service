import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  vehiculeId: "",
  dateDeplacement: "",
  lieuDepart: "",
  lieuArrivee: "",
  dateFinParcours: "",
  tableKilometrique: "",
  ordreSortie: "",
};

export default function DeplacementAdmin() {
  // ETATS

  const [deplacements, setDeplacements] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [immatriculationSaisie, setImmatriculationSaisie] = useState("");

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const { hasRole } = useAuth();

  // CHARGEMENT DES VEHICULES

  async function loadVehicules() {
    try {
      console.log("=================================");
      console.log("CHARGEMENT DES VEHICULES");
      console.log("=================================");

      const response = await client.get("/vehicules");

      console.log("STATUS VEHICULES :", response.status);
      console.log("DATA VEHICULES :", response.data);

      if (Array.isArray(response.data)) {
        setVehicules(response.data);

        console.log(
          "Nombre de véhicules :",
          response.data.length
        );
      } else {
        console.error(
          "La réponse /vehicules n'est pas un tableau :",
          response.data
        );

        setVehicules([]);
      }
    } catch (err) {
      console.error(
        "ERREUR CHARGEMENT VEHICULES :",
        err
      );

      console.error(
        "STATUS :",
        err.response?.status
      );

      console.error(
        "DATA :",
        err.response?.data
      );

      setVehicules([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les véhicules."
      );
    }
  }

  // CHARGEMENT DES DEPLACEMENTS

  async function loadDeplacements(vehiculeId) {
    if (!vehiculeId) {
      setDeplacements([]);
      return;
    }

    try {
      console.log(
        "Chargement déplacements du véhicule ID :",
        vehiculeId
      );

      const response = await client.get(
        `/deplacements?vehiculeId=${Number(vehiculeId)}`
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
        "ERREUR CHARGEMENT DEPLACEMENTS :",
        err
      );

      console.error(
        "STATUS :",
        err.response?.status
      );

      console.error(
        "DATA :",
        err.response?.data
      );

      setDeplacements([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les déplacements."
      );
    }
  }

  // INITIALISATION

  useEffect(() => {
    loadVehicules();
  }, []);

  // MODIFICATION D'UN CHAMP

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // SELECTION VEHICULE

  function handleVehiculeChange(e) {
    const vehiculeId = e.target.value;

    console.log(
      "================================="
    );
    console.log(
      "CHANGEMENT VEHICULE"
    );
    console.log(
      "ID sélectionné :",
      vehiculeId
    );
    console.log(
      "================================="
    );

    const vehicule = vehicules.find(
      (v) =>
        String(v.id) === String(vehiculeId)
    );

    console.log(
      "Véhicule trouvé :",
      vehicule
    );

    setForm((current) => ({
      ...current,
      vehiculeId: vehiculeId,
    }));

    setError("");
    setSuccess("");

    loadDeplacements(vehiculeId);
  }

  // CREATION / MODIFICATION

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    console.log(
      "================================="
    );
    console.log(
      "SUBMIT DEPLACEMENT"
    );
    console.log(
      "================================="
    );

    console.log(
      "FORM COMPLETE :",
      form
    );

    
    // VALIDATION VEHICULE
    

    if (!form.vehiculeId) {
      alert(
        "ERREUR : Aucun véhicule sélectionné."
      );

      setError(
        "Le véhicule est obligatoire."
      );

      return;
    }

    
    // VALIDATION DATE
    

    if (!form.dateDeplacement) {
      alert(
        "ERREUR : La date du déplacement est obligatoire."
      );

      setError(
        "La date du déplacement est obligatoire."
      );

      return;
    }

    
    // CONVERSION ID
    

    const vehiculeId = Number(
      form.vehiculeId
    );

    if (!Number.isInteger(vehiculeId) || vehiculeId <= 0) {
      alert(
        "ERREUR : ID véhicule invalide : " +
          form.vehiculeId
      );

      setError(
        "L'identifiant du véhicule est invalide."
      );

      return;
    }

    // VERIFICATION VEHICULE

    const vehiculeSelectionne =
      vehicules.find(
        (v) =>
          Number(v.id) === vehiculeId
      );

    if (!vehiculeSelectionne) {
      alert(
        "ERREUR : Le véhicule avec l'ID " +
          vehiculeId +
          " n'existe pas dans la liste."
      );

      setError(
        "Le véhicule sélectionné est introuvable."
      );

      return;
    }

    // PAYLOAD

    const payload = {
      vehiculeId: Number(form.vehiculeId),

      dateDeplacement:
        form.dateDeplacement || null,

      lieuDepart:
        form.lieuDepart || null,

      lieuArrivee:
        form.lieuArrivee || null,

      dateFinParcours:
        form.dateFinParcours || null,

      tableKilometrique:
        form.tableKilometrique !== ""
          ? Number(form.tableKilometrique)
          : null,

      ordreSortie:
        form.ordreSortie || null,
    };


    // ENVOI

    setSubmitting(true);

    try {
      if (editingId) {
        // MODIFICATION

        console.log(
          "MODIFICATION ID :",
          editingId
        );

        const response =
          await client.put(
            `/deplacements/${editingId}`,
            payload
          );

        console.log(
          "REPONSE MODIFICATION :",
          response.data
        );

        setSuccess(
          "Le déplacement a été modifié avec succès."
        );
      } else {
        // ======================================================
        // CREATION
        // ======================================================

        console.log(
          "CREATION NOUVEAU DEPLACEMENT"
        );

        const response =
          await client.post(
            "/deplacements",
            payload
          );

        console.log(
          "STATUS CREATION :",
          response.status
        );

        console.log(
          "REPONSE CREATION :",
          response.data
        );

        setSuccess(
          "Le déplacement a été enregistré avec succès."
        );
      }

      // RECHARGER LES DEPLACEMENTS

      await loadDeplacements(
        vehiculeId
      );

      // CONSERVER LE VEHICULE SELECTIONNE

      setForm({
        ...emptyForm,
        vehiculeId: String(
          vehiculeId
        ),
      });

      setEditingId(null);
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "ERREUR DEPLACEMENT"
      );

      console.error(
        "================================="
      );

      console.error(
        "ERREUR COMPLETE :",
        err
      );

      console.error(
        "STATUS :",
        err.response?.status
      );

      console.error(
        "DATA :",
        err.response?.data
      );

      console.error(
        "MESSAGE :",
        err.response?.data?.message
      );

      console.error(
        "DETAIL :",
        err.response?.data?.detail
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Erreur lors de l'enregistrement du déplacement.";

      setError(message);

      alert(
        "ERREUR BACKEND :\n\n" +
          message
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ANALYSE ET CHARGEMENT DU MODULE DE DÉPLACEMENT VIA LA SAISIE BRUTE

  function handleImmatriculationSaisie(texteSaisi) {
    setImmatriculationSaisie(texteSaisi);
    setError("");
    setSuccess("");

    // Nettoyage de la chaîne (Majuscules, suppression des espaces blancs)
    const immatCible = texteSaisi.trim().replace(/\s+/g, "").toUpperCase();

    if (!immatCible) {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setDeplacements([]);
      return;
    }

    // Extraction de la correspondance exacte dans le parc
    const vehiculeIdentifie = vehicules.find(
      (v) => (v.immatricule || "").trim().replace(/\s+/g, "").toUpperCase() === immatCible
    );

    if (vehiculeIdentifie) {
      const targetId = String(vehiculeIdentifie.id);
      setForm((prev) => ({ ...prev, vehiculeId: targetId }));
      loadDeplacements(targetId);
    } else {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setDeplacements([]);
    }
  }

  // MODIFICATION

    // MODIFICATION
  function handleEdit(item) {
    console.log("Modification déplacement :", item);

    setEditingId(item.id);

    // Capture de l'immatriculation pour alimenter l'input textuel depuis la liste locale
    const currentVehicule = vehicules.find((v) => String(v.id) === String(form.vehiculeId));
    const immatVehicule = currentVehicule?.immatricule || "";
    setImmatriculationSaisie(immatVehicule);

    setForm({
      vehiculeId: form.vehiculeId || "",
      dateDeplacement: item.dateDeplacement || "",
      lieuDepart: item.lieuDepart || "",
      lieuArrivee: item.lieuArrivee || "",
      dateFinParcours: item.dateFinParcours || "",
      tableKilometrique: item.tableKilometrique ?? "",
      ordreSortie: item.ordreSortie || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ANNULATION
  function cancelEdit() {
    setEditingId(null);
    setImmatriculationSaisie("");
    setForm((current) => ({
      ...emptyForm,
      vehiculeId: "",
    }));
    setDeplacements([]);
    setError("");
    setSuccess("");
  }

  // SUPPRESSION

  async function handleDelete(id) {
    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce déplacement ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      await client.delete(
        `/deplacements/${id}`
      );

      setSuccess(
        "Le déplacement a été supprimé avec succès."
      );

      await loadDeplacements(
        form.vehiculeId
      );
    } catch (err) {
      console.error(
        "Erreur suppression déplacement :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de supprimer le déplacement."
      );
    }
  }

  // RECHERCHE

  const filtered =
    deplacements.filter(
      (item) => {
        const texte = `
          ${item.dateDeplacement || ""}
          ${item.lieuDepart || ""}
          ${item.lieuArrivee || ""}
          ${item.dateFinParcours || ""}
          ${item.tableKilometrique || ""}
          ${item.ordreSortie || ""}
        `.toLowerCase();

        return texte.includes(
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
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // AFFICHAGE

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/*FIL D'ARIANE*/}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/gestion"
          className="hover:text-haigana-blue transition-colors"
        >
          Gestion
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Déplacement
        </span>

      </div>

      {/*TITRE*/}

      <h1 className="text-2xl font-bold text-haigana-dark mb-2">
        Gestion des déplacements
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Gérez les déplacements et parcours des véhicules.
      </p>

      {/*FORMULAIRE*/}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-8 space-y-6 mb-8"
      >

        <div>

          <h2 className="text-lg font-semibold text-haigana-dark mb-4">
            {editingId
              ? "Modifier le déplacement"
              : "Nouveau déplacement"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* VÉHICULE EN SAISIE MANUELLE TEXTUELLE AVEC AUTO-COMPLÉTION */}
            <div className="md:col-span-2">

              <label className={labelClass}>
                Immatriculation du Véhicule *
              </label>

              <input
                type="text"
                required
                list="suggestions-parc-deplacements"
                value={immatriculationSaisie}
                onChange={(e) => handleImmatriculationSaisie(e.target.value)}
                placeholder="Saisir ou choisir l'immatriculation du véhicule..."
                className={`${inputClass} uppercase font-bold text-haigana-dark`}
              />

              {/* Datalist contenant les correspondances du parc automobile */}
              <datalist id="suggestions-parc-deplacements">
                {vehicules.map((v) => (
                  <option key={v.id} value={v.immatricule}>
                    {v.codeSoa?.codeSoa ? `SOA : ${v.codeSoa.codeSoa}` : "Véhicule actif"}
                  </option>
                ))}
              </datalist>

              {form.vehiculeId && (
                <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                  <span>✓</span> Véhicule identifié (ID interne : {form.vehiculeId})
                </p>
              )}
            </div>

            {/*INFORMATIONS VEHICULE*/}

            {selectedVehicule && (

              <div className="md:col-span-2 bg-haigana-bg/60 border border-gray-100 rounded-xl p-4">

                <p className="text-sm font-semibold text-haigana-dark mb-2">
                  Véhicule sélectionné
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">

                  <div>

                    <span className="text-gray-500">
                      ID :
                    </span>{" "}

                    <span className="font-medium">
                      {selectedVehicule.id}
                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      Immatriculation :
                    </span>{" "}

                    <span className="font-medium">
                      {selectedVehicule.immatricule ||
                        "-"}
                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      SOA :
                    </span>{" "}

                    <span className="font-medium">
                      {selectedVehicule.codeSoa?.codeSoa ||
                        "-"}
                    </span>

                  </div>

                  <div>

                    <span className="text-gray-500">
                      Affectation :
                    </span>{" "}

                    <span className="font-medium">
                      {selectedVehicule.lieuAffectationActuel ||
                        "-"}
                    </span>

                  </div>

                </div>

              </div>

            )}

            {/*DATE DEPLACEMENT*/}

            <div>

              <label className={labelClass}>
                Date du déplacement *
              </label>

              <input
                type="date"
                required
                value={
                  form.dateDeplacement
                }
                onChange={(e) =>
                  set(
                    "dateDeplacement",
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </div>

            {/*ORDRE SORTIE*/}

            <div>

              <label className={labelClass}>
                Ordre de sortie
              </label>

              <select
                value={
                  form.ordreSortie
                }
                onChange={(e) =>
                  set(
                    "ordreSortie",
                    e.target.value
                  )
                }
                className={inputClass}
              >

                <option value="">
                  Choisir...
                </option>

                <option value="AFFECTATION">
                  Affectation
                </option>

              </select>

            </div>

            {/*DEPART*/}

            <div>

              <label className={labelClass}>
                Lieu de départ
              </label>

              <input
                type="text"
                value={
                  form.lieuDepart
                }
                onChange={(e) =>
                  set(
                    "lieuDepart",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ex : Mahajanga"
              />

            </div>

            {/*ARRIVEE*/}

            <div>

              <label className={labelClass}>
                Lieu d'arrivée
              </label>

              <input
                type="text"
                value={
                  form.lieuArrivee
                }
                onChange={(e) =>
                  set(
                    "lieuArrivee",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ex : Antananarivo"
              />

            </div>

            {/*DATE FIN*/}

            <div>

              <label className={labelClass}>
                Date de fin du parcours
              </label>

              <input
                type="date"
                value={
                  form.dateFinParcours
                }
                onChange={(e) =>
                  set(
                    "dateFinParcours",
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </div>

            {/*TABLE KILOMETRIQUE*/}

            <div>

              <label className={labelClass}>
                Table kilométrique
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.tableKilometrique
                }
                onChange={(e) =>
                  set(
                    "tableKilometrique",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ex : 125.5"
              />

            </div>

          </div>

        </div>

        {/*  ERREUR */}

        {error && (

          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>

        )}

        {/*  SUCCES */}

        {success && (

          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>

        )}

        {/*  BOUTONS */}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

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
              !form.vehiculeId ||
              !form.dateDeplacement ||
              (!editingId && hasRole("MODIFICATEUR"))
            }
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
          >
            {submitting
              ? "Enregistrement..."
              : !editingId && hasRole("MODIFICATEUR")
              ? "Admin seulement"
              : editingId
              ? "Modifier le déplacement"
              : "Ajouter le déplacement"}
          </button>

        </div>

      </form>

      {/*RECHERCHE*/}

      {form.vehiculeId && (

        <SearchSortBar
          search={search}
          onSearchChange={
            setSearch
          }
          placeholder="Rechercher un déplacement..."
        />

      )}

      {/*LISTE*/}

      {form.vehiculeId && (

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100">

            <h2 className="font-semibold text-haigana-dark">
              Déplacements du véhicule
            </h2>

            <p className="text-sm text-gray-500">

              {selectedVehicule?.immatricule ||
                "-"}

            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-haigana-dark text-white">

                <tr>

                  <th className="text-left px-4 py-3">
                    Date
                  </th>

                  <th className="text-left px-4 py-3">
                    Départ
                  </th>

                  <th className="text-left px-4 py-3">
                    Arrivée
                  </th>

                  <th className="text-left px-4 py-3">
                    Fin parcours
                  </th>

                  <th className="text-right px-4 py-3">
                    Km
                  </th>

                  <th className="text-center px-4 py-3">
                    Ordre
                  </th>

                  <th className="text-center px-4 py-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filtered.map(
                  (item) => 

                    <tr
                      key={item.id}
                      className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                    >

                      <td className="px-4 py-3">
                        {item.dateDeplacement ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.lieuDepart ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.lieuArrivee ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        {item.dateFinParcours ||
                          "-"}
                      </td>

                      <td className="px-4 py-3 text-right">

                        {item.tableKilometrique != null
                          ? Number(
                              item.tableKilometrique
                            ).toLocaleString(
                              "fr-FR"
                            )
                          : "-"}

                      </td>

                      <td className="px-4 py-3 text-center">

                        {item.ordreSortie ? (

                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-haigana-bg text-haigana-dark">
                            {item.ordreSortie}
                          </span>

                        ) : (
                          "-"
                        )}

                      </td>

                      <td className="px-4 py-3">

                        <div className="flex justify-center gap-2">

                        {((hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-haigana-blue hover:bg-haigana-bg transition-colors"
                          >
                            Modifier
                          </button>
                        ))}

                        {(hasRole("ADMINISTRATEUR") && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        ))}

                        </div>

                      </td>

                    </tr>

                  
                )}

                {filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Aucun déplacement enregistré
                      pour ce véhicule.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

      {/*AUCUN VEHICULE SELECTIONNE*/}

      {!form.vehiculeId && (

        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400">

          Sélectionnez un véhicule pour afficher
          ses déplacements.

        </div>

      )}

    </div>
  );
}