import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = {
  vehiculeId: "",
  reference: "",
  dateEntree: "",
  type: "",
  pieceJustificativeUrl: "",

  nomPersonneSortie: "",
  cinPersonneSortie: "",
  serviceSortie: "",

  nomPersonneEntree: "",
  cinPersonneEntree: "",
  serviceEntree: "",

  // ACHAT
  dateAchat: "",
  sommePayer: "",

  // DON
  dateDon: "",
  sommeRenverser: "",

  // AFFECTATION
  description: "",
  lieuAffectation: "",
  dateDepart: "",
  dateFin: "",
};

export default function EntreeAdmin() {
  const [entrees, setEntrees] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  const [form, setForm] = useState({ ...emptyForm });

  const [search, setSearch] = useState("");
  const [selectedEntree, setSelectedEntree] = useState(null);
  const [consultedEntree, setConsultedEntree] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // CHARGEMENT
  async function loadEntrees() {
    try {
      setLoading(true);
      setError("");

      const [entreesResponse, vehiculesResponse] =
        await Promise.all([
          client.get("/entrees"),
          client.get("/vehicules"),
        ]);

      setEntrees(
        Array.isArray(entreesResponse.data)
          ? entreesResponse.data
          : []
      );

      setVehicules(
        Array.isArray(vehiculesResponse.data)
          ? vehiculesResponse.data
          : []
      );
    } catch (err) {
      console.error("Erreur chargement entrées :", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          "Impossible de charger les entrées."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntrees();
  }, []);
  // FORMULAIRE
  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreate() {
    setSelectedEntree(null);
    setForm({ ...emptyForm });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

function openConsult(entree) {
  setConsultedEntree(entree);
  setError("");
  setSuccess("");
}

function closeConsult() {
  setConsultedEntree(null);
}

function openEdit(entree) {
  setSelectedEntree(entree);
  const vehiculeId =
    entree.vehiculeId ??
    entree.vehicule?.id ??
    "";

  setForm({

    // VEHICULE


    vehiculeId:
      vehiculeId !== null &&
      vehiculeId !== undefined
        ? String(vehiculeId)
        : "",


    // INFORMATIONS GENERALES


    reference:
      entree.reference || "",

    dateEntree:
      entree.dateEntree || "",

    type:
      entree.type || "",

    pieceJustificativeUrl:
      entree.pieceJustificativeUrl || "",


    // ORDRE DE SORTIE


    nomPersonneSortie:
      entree.nomPersonneSortie || "",

    cinPersonneSortie:
      entree.cinPersonneSortie || "",

    serviceSortie:
      entree.serviceSortie || "",


    // ORDRE D'ENTREE


    nomPersonneEntree:
      entree.nomPersonneEntree || "",

    cinPersonneEntree:
      entree.cinPersonneEntree || "",

    serviceEntree:
      entree.serviceEntree || "",


    // ACHAT

    dateAchat:
      entree.dateAchat || "",

    sommePayer:
      entree.sommePayer ??
      "",

    // DON

    dateDon:
      entree.dateDon || "",

    sommeRenverser:
      entree.sommeRenverser ??
      "",

    // AFFECTATION

    descriptionAffectation:
      entree.descriptionAffectation || "",

    lieuAffectation:
      entree.lieuAffectation || "",

    dateDepart:
      entree.dateDepart || "",

    dateFin:
      entree.dateFin || "",
  });

  setError("");
  setSuccess("");
  setShowForm(true);
}


  function closeForm() {
    setSelectedEntree(null);
    setShowForm(false);
    setForm({ ...emptyForm });
    setError("");
  }
  // CHANGEMENT DU TYPE
  function handleTypeChange(type) {
    setForm((current) => ({
      ...current,

      type,

      /*
       * Si ACHAT est choisi :
       * on conserve uniquement les champs ACHAT.
       */
      dateAchat:
        type === "ACHAT"
          ? current.dateAchat
          : "",

      sommePayer:
        type === "ACHAT"
          ? current.sommePayer
          : "",

      /*
       * Si DON est choisi :
       * on conserve uniquement les champs DON.
       */
      dateDon:
        type === "DON"
          ? current.dateDon
          : "",

      sommeRenverser:
        type === "DON"
          ? current.sommeRenverser
          : "",

      /*
       * Si AFFECTATION est choisie :
       * on conserve uniquement les champs AFFECTATION.
       */
      description:
        type === "AFFECTATION"
          ? current.description
          : "",

      lieuAffectation:
        type === "AFFECTATION"
          ? current.lieuAffectation
          : "",

      dateDepart:
        type === "AFFECTATION"
          ? current.dateDepart
          : "",

      dateFin:
        type === "AFFECTATION"
          ? current.dateFin
          : "",
    }));

    setError("");
  }
  // VALIDATION
  function validateForm() {
    if (!form.vehiculeId) {
      return "Le véhicule est obligatoire.";
    }

    if (!form.type) {
      return "Le type de prise en charge est obligatoire.";
    }


    // ORDRE DE SORTIE


    if (!form.nomPersonneSortie.trim()) {
      return (
        "Le nom de la personne qui fait " +
        "l'ordre de sortie est obligatoire."
      );
    }

    if (!form.cinPersonneSortie.trim()) {
      return (
        "La CIN de la personne qui fait " +
        "l'ordre de sortie est obligatoire."
      );
    }

    if (!form.serviceSortie.trim()) {
      return (
        "Le service qui fait " +
        "l'ordre de sortie est obligatoire."
      );
    }


    // ORDRE D'ENTREE


    if (!form.nomPersonneEntree.trim()) {
      return (
        "Le nom de la personne qui fait " +
        "l'ordre d'entrée est obligatoire."
      );
    }

    if (!form.cinPersonneEntree.trim()) {
      return (
        "La CIN de la personne qui fait " +
        "l'ordre d'entrée est obligatoire."
      );
    }

    if (!form.serviceEntree.trim()) {
      return (
        "Le service qui fait " +
        "l'ordre d'entrée est obligatoire."
      );
    }


    // ACHAT


    if (form.type === "ACHAT") {
      if (
        form.sommePayer === "" ||
        form.sommePayer === null ||
        form.sommePayer === undefined ||
        Number.isNaN(Number(form.sommePayer)) ||
        Number(form.sommePayer) < 0
      ) {
        return (
          "La somme payée est obligatoire " +
          "pour une entrée de type ACHAT."
        );
      }
    }


    // DON


    if (form.type === "DON") {
      if (
        form.sommeRenverser === "" ||
        form.sommeRenverser === null ||
        form.sommeRenverser === undefined ||
        Number.isNaN(Number(form.sommeRenverser)) ||
        Number(form.sommeRenverser) < 0
      ) {
        return (
          "La somme reversée est obligatoire " +
          "pour une entrée de type DON."
        );
      }
    }


    // AFFECTATION


    if (form.type === "AFFECTATION") {
      if (!form.lieuAffectation.trim()) {
        return (
          "Le lieu d'affectation est obligatoire " +
          "pour une affectation."
        );
      }

      if (!form.dateDepart) {
        return (
          "La date d'affectation est obligatoire " +
          "pour une affectation."
        );
      }
    }

    return null;
  }
  // ENREGISTREMENT
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      /*
       * PAYLOAD COMMUN A L'ENTREE
       */
      const payload = {
        vehiculeId: Number(form.vehiculeId),

        reference:
          form.reference.trim() || null,

        dateEntree:
          form.dateEntree || null,

        type: form.type,

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() || null,

        nomPersonneSortie:
          form.nomPersonneSortie.trim(),

        cinPersonneSortie:
          form.cinPersonneSortie.trim(),

        serviceSortie:
          form.serviceSortie.trim(),

        nomPersonneEntree:
          form.nomPersonneEntree.trim(),

        cinPersonneEntree:
          form.cinPersonneEntree.trim(),

        serviceEntree:
          form.serviceEntree.trim(),
      };

      /*
       * ACHAT
       */
      if (form.type === "ACHAT") {
        payload.dateAchat =
          form.dateAchat || null;

        payload.sommePayer =
          Number(form.sommePayer);
      }

      /*
       * DON
       */
      if (form.type === "DON") {
        payload.dateDon =
          form.dateDon || null;

        payload.sommeRenverser =
          Number(form.sommeRenverser);
      }

      /*
       * AFFECTATION
       */
      if (form.type === "AFFECTATION") {
        payload.descriptionAffectation =
          form.description.trim() || null;

        payload.lieuAffectation =
          form.lieuAffectation.trim();

        payload.dateDepart =
          form.dateDepart;

        payload.dateFin =
          form.dateFin || null;
      }

      console.log(
        "=== PAYLOAD ENVOYÉ ==="
      );

      console.log(payload);


      // MODIFICATION


      if (selectedEntree) {
        await client.put(
          `/entrees/${selectedEntree.id}`,
          payload
        );

        setSuccess(
          "L'entrée a été modifiée avec succès."
        );
      }


      // CREATION


      else {
        await client.post(
          "/entrees",
          payload
        );

        setSuccess(
          "L'entrée du véhicule a été enregistrée avec succès."
        );
      }

      closeForm();

      await loadEntrees();
    } catch (err) {
      console.error(
        "Erreur enregistrement entrée :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }
  // SUPPRESSION
  async function handleDelete(id) {
    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer cette entrée ?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await client.delete(
        `/entrees/${id}`
      );

      setSuccess(
        "L'entrée a été supprimée avec succès."
      );

      await loadEntrees();
    } catch (err) {
      console.error(
        "Erreur suppression entrée :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Erreur lors de la suppression."
      );
    }
  }
  // RECHERCHE
  const filtered = entrees.filter((entree) => {

  const recherche = search.toLowerCase().trim();

  if (!recherche) {
    return true;
  }

  return (
    (entree.immatricule || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.codeSoa || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.reference || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.type || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.nomPersonneSortie || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.nomPersonneEntree || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.serviceSortie || "")
      .toLowerCase()
      .includes(recherche) ||

    (entree.serviceEntree || "")
      .toLowerCase()
      .includes(recherche)
  );
});
  // STYLES
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "bg-white text-haigana-dark placeholder-slate-400 " +
    "focus:outline-none focus:border-haigana-blue " +
    "focus:ring-2 focus:ring-haigana-blue/10 " +
    "transition-all";

  const labelClass =
    "block text-sm font-semibold text-haigana-dark mb-2";

  const sectionClass =
    "border border-slate-200 rounded-2xl p-5 bg-slate-50/70";
  // AFFICHAGE
  return (
    <div className="min-h-screen bg-slate-50">

      {/*EN-TÊTE*/}

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

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
                  Entrée
                </span>

              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-haigana-dark tracking-tight">
                Gestion des entrées
              </h1>

              <p className="mt-3 max-w-2xl text-slate-500 leading-relaxed">
                Gérez les prises en charge des véhicules,
                leurs opérations d'achat, de don et
                d'affectation.
              </p>

            </div>

            {/* STATISTIQUE */}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 min-w-[190px]">

              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Entrées enregistrées
              </p>

              <div className="flex items-end gap-2 mt-1">

                <span className="text-3xl font-bold text-haigana-dark">
                  {entrees.length}
                </span>

                <span className="text-sm text-slate-500 mb-1">
                  entrées
                </span>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/*CONTENU*/}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-0.5 shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.7"
              />

              <path
                d="M12 8v5M12 16h.01"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>

            <span>{error}</span>

          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="mt-0.5 shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.7"
              />

              <path
                d="m8 12 2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>{success}</span>

          </div>
        )}

        {/* BARRE D'ACTIONS */}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-haigana-dark">
                Registre des entrées
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Consultez et gérez les opérations enregistrées.
              </p>

            </div>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              Nouvelle entrée

            </button>

          </div>

        </section>

        {/* RECHERCHE */}

        <div className="mb-5">

          <SearchSortBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Rechercher par immatriculation, SOA, référence, personne ou service..."
          />

        </div>

        {/* TABLEAU */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-100">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>

                <h2 className="text-lg font-bold text-haigana-dark">
                  Liste des entrées
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {filtered.length} résultat
                  {filtered.length !== 1 ? "s" : ""}
                </p>

              </div>

            </div>

          </div>

          {loading ? (

            <div className="px-6 py-16 text-center">

              <div className="w-10 h-10 border-4 border-slate-200 border-t-haigana-blue rounded-full animate-spin mx-auto" />

              <p className="text-sm text-slate-400 mt-4">
                Chargement des entrées...
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-50 border-b border-slate-200">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Véhicule
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Code SOA
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Référence
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>
                {filtered.map((entree) => (
                  <tr
                    key={entree.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition-colors"
                  >

                    {/* VÉHICULE */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-haigana-dark">
                        {entree.immatricule || "-"}
                      </div>
                    </td>

                    {/* CODE SOA */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {entree.codeSoa || "-"}
                      </span>
                    </td>

                    {/* RÉFÉRENCE */}
                    <td className="px-6 py-4 text-slate-600">
                      {entree.reference || "-"}
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-slate-600">
                      {entree.dateEntree
                        ? new Date(entree.dateEntree).toLocaleDateString("fr-FR")
                        : "-"}
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          entree.type === "ACHAT"
                            ? "bg-slate-100 text-slate-700"
                            : entree.type === "DON"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {entree.type || "-"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openConsult(entree)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                        </svg>

                        Consulter
                      </button>

                        <button
                          type="button"
                          onClick={() => openEdit(entree)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-haigana-blue hover:bg-haigana-blue/10 transition-colors"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(entree.id)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Supprimer
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/*MODAL*/}

      {showForm && (

        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">

          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl">

            {/* HEADER */}

            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
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

                <div>

                  <h2 className="text-xl font-bold text-haigana-dark">

                    {selectedEntree
                      ? "Modifier l'entrée"
                      : "Nouvelle entrée"}

                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Renseignez les informations de prise en charge.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center"
                aria-label="Fermer"
              >

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

              </button>

            </div>

            {/* CORPS */}

            <div className="overflow-y-auto max-h-[calc(92vh-90px)] p-6 md:p-8">

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/*        INFORMATIONS GENERALES
                ================================================== */}

                <div className={sectionClass}>

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-9 h-9 rounded-lg bg-white text-haigana-blue flex items-center justify-center border border-slate-200">

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />

                        <path
                          d="M12 11v5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                        <circle
                          cx="12"
                          cy="8"
                          r="1"
                          fill="currentColor"
                        />

                      </svg>

                    </div>

                    <div>

                      <h3 className="font-bold text-haigana-dark">
                        Informations générales
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Identifiez le véhicule et le type de prise en charge.
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* VEHICULE */}

                    <div className="md:col-span-2">

                      <label className={labelClass}>
                        Véhicule *
                      </label>

                      <select
                        required
                        value={form.vehiculeId}
                        onChange={(e) =>
                          set(
                            "vehiculeId",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >

                        <option value="">
                          Choisir un véhicule...
                        </option>

                        {vehicules.map(
                          (vehicule) => (

                            <option
                              key={vehicule.id}
                              value={vehicule.id}
                            >

                              {vehicule.immatricule}

                              {" — "}

                              {vehicule.codeSoa?.codeSoa ||
                                "Sans code SOA"}

                            </option>

                          )
                        )}

                      </select>

                    </div>

                    {/* REFERENCE */}

                    <div>

                      <label className={labelClass}>
                        Référence
                      </label>

                      <input
                        type="text"
                        value={form.reference}
                        onChange={(e) =>
                          set(
                            "reference",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Référence de l'ordre"
                      />

                    </div>

                    {/* DATE ENTREE */}

                    <div>

                      <label className={labelClass}>
                        Date d'entrée
                      </label>

                      <input
                        type="date"
                        value={form.dateEntree}
                        onChange={(e) =>
                          set(
                            "dateEntree",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </div>

                    {/* TYPE */}

                    <div className="md:col-span-2">

                      <label className={labelClass}>
                        Type de prise en charge *
                      </label>

                      <select
                        required
                        value={form.type}
                        onChange={(e) =>
                          handleTypeChange(
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >

                        <option value="">
                          Choisir un type...
                        </option>

                        <option value="ACHAT">
                          Achat
                        </option>

                        <option value="DON">
                          Don
                        </option>

                        <option value="AFFECTATION">
                          Affectation
                        </option>

                      </select>

                      <p className="text-xs text-slate-400 mt-2">
                        Une entrée doit être de type Achat, Don ou Affectation.
                      </p>

                    </div>

                  </div>

                </div>

                {/*        ORDRE DE SORTIE
                ================================================== */}

                <div className={sectionClass}>

                  <h3 className="font-bold text-haigana-dark">
                    Personne qui fait l'ordre de sortie
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-5">
                    Informations relatives au service ou à la personne qui remet le véhicule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>

                      <label className={labelClass}>
                        Nom *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.nomPersonneSortie
                        }
                        onChange={(e) =>
                          set(
                            "nomPersonneSortie",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Nom complet"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        CIN *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.cinPersonneSortie
                        }
                        onChange={(e) =>
                          set(
                            "cinPersonneSortie",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Numéro CIN"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        Service *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.serviceSortie
                        }
                        onChange={(e) =>
                          set(
                            "serviceSortie",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Service"
                      />

                    </div>

                  </div>

                </div>

                {/*        ORDRE D'ENTREE
                ================================================== */}

                <div className={sectionClass}>

                  <h3 className="font-bold text-haigana-dark">
                    Personne qui fait l'ordre d'entrée
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-5">
                    Informations relatives au service ou à la personne qui reçoit le véhicule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>

                      <label className={labelClass}>
                        Nom *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.nomPersonneEntree
                        }
                        onChange={(e) =>
                          set(
                            "nomPersonneEntree",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Nom complet"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        CIN *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.cinPersonneEntree
                        }
                        onChange={(e) =>
                          set(
                            "cinPersonneEntree",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Numéro CIN"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        Service *
                      </label>

                      <input
                        type="text"
                        required
                        value={
                          form.serviceEntree
                        }
                        onChange={(e) =>
                          set(
                            "serviceEntree",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Service"
                      />

                    </div>

                  </div>

                </div>

                {/*        ACHAT
                ================================================== */}

                {form.type === "ACHAT" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations de l'achat
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <label className={labelClass}>
                          Date d'achat
                        </label>

                        <input
                          type="date"
                          value={form.dateAchat}
                          onChange={(e) =>
                            set(
                              "dateAchat",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                      </div>

                      <div>

                        <label className={labelClass}>
                          Somme payée *
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={form.sommePayer}
                          onChange={(e) =>
                            set(
                              "sommePayer",
                              e.target.value
                            )
                          }
                          className={inputClass}
                          placeholder="0.00"
                        />

                      </div>

                    </div>

                  </div>

                )}

                {/*        DON
                ================================================== */}

                {form.type === "DON" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations du don
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <label className={labelClass}>
                          Date du don
                        </label>

                        <input
                          type="date"
                          value={form.dateDon}
                          onChange={(e) =>
                            set(
                              "dateDon",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                      </div>

                      <div>

                        <label className={labelClass}>
                          Somme reversée *
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={
                            form.sommeRenverser
                          }
                          onChange={(e) =>
                            set(
                              "sommeRenverser",
                              e.target.value
                            )
                          }
                          className={inputClass}
                          placeholder="0.00"
                        />

                      </div>

                    </div>

                  </div>

                )}

                {/*        AFFECTATION
                ================================================== */}

                {form.type === "AFFECTATION" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations de l'affectation
                    </h3>

                    <div className="space-y-5">

                      {/* LIEU */}

                      <div>

                        <label className={labelClass}>
                          Lieu d'affectation *
                        </label>

                        <input
                          type="text"
                          required
                          value={
                            form.lieuAffectation
                          }
                          onChange={(e) =>
                            set(
                              "lieuAffectation",
                              e.target.value
                            )
                          }
                          className={inputClass}
                          placeholder="Service ou lieu d'affectation"
                        />

                      </div>

                      {/* DATE DEPART */}

                      <div>

                        <label className={labelClass}>
                          Date d'affectation *
                        </label>

                        <input
                          type="date"
                          required
                          value={form.dateDepart}
                          onChange={(e) =>
                            set(
                              "dateDepart",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                      </div>

                      {/* DATE FIN */}

                      <div>

                        <label className={labelClass}>
                          Date de fin
                        </label>

                        <input
                          type="date"
                          value={form.dateFin}
                          onChange={(e) =>
                            set(
                              "dateFin",
                              e.target.value
                            )
                          }
                          className={inputClass}
                        />

                      </div>

                      {/* DESCRIPTION */}

                      <div>

                        <label className={labelClass}>
                          Description
                        </label>

                        <textarea
                          rows={3}
                          value={form.description}
                          onChange={(e) =>
                            set(
                              "description",
                              e.target.value
                            )
                          }
                          className={inputClass}
                          placeholder="Description de l'affectation..."
                        />

                      </div>

                    </div>

                  </div>

                )}

                {/*        PIECE JUSTIFICATIVE
                ================================================== */}

                <div>

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

                {/* MESSAGE */}

                {error && (

                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">

                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mt-0.5 shrink-0"
                    >

                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M12 8v5M12 16h.01"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />

                    </svg>

                    <span>{error}</span>

                  </div>

                )}

                {/*        ACTIONS
                ================================================== */}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-6">

                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    {saving
                      ? "Enregistrement..."
                      : selectedEntree
                      ? "Enregistrer les modifications"
                      : "Créer l'entrée"}

                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/*       MODAL CONSULTATION
      ========================================================= */}

      {consultedEntree && (

        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center px-4 py-6">

          <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl">

            {/*      HEADER
            ====================================================== */}

            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-haigana-blue/10 text-haigana-blue flex items-center justify-center">

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                  </svg>

                </div>

                <div>

                  <h2 className="text-xl font-bold text-haigana-dark">
                    Consultation de l'entrée
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Détails complets de la prise en charge du véhicule.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeConsult}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center justify-center"
                aria-label="Fermer"
              >

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                </svg>

              </button>

            </div>

            {/*      CORPS
            ====================================================== */}

            <div className="overflow-y-auto max-h-[calc(92vh-90px)] p-6 md:p-8">

              <div className="space-y-6">

                {/*        INFORMATIONS GENERALES
                ================================================== */}

                <div className={sectionClass}>

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-9 h-9 rounded-lg bg-white text-haigana-blue flex items-center justify-center border border-slate-200">

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="8"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />

                        <path
                          d="M12 11v5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                        <circle
                          cx="12"
                          cy="8"
                          r="1"
                          fill="currentColor"
                        />

                      </svg>

                    </div>

                    <div>

                      <h3 className="font-bold text-haigana-dark">
                        Informations générales
                      </h3>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Informations principales de l'entrée.
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Véhicule
                      </p>

                      <p className="mt-1 font-semibold text-haigana-dark">
                        {consultedEntree.immatricule || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Code SOA
                      </p>

                      <p className="mt-1 font-semibold text-haigana-dark">
                        {consultedEntree.codeSoa || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Référence
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.reference || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Date d'entrée
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.dateEntree
                          ? new Date(
                              consultedEntree.dateEntree
                            ).toLocaleDateString("fr-FR")
                          : "-"}
                      </p>
                    </div>

                    <div className="md:col-span-2">

                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Type de prise en charge
                      </p>

                      <div className="mt-2">

                        <span
                          className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            consultedEntree.type === "ACHAT"
                              ? "bg-slate-100 text-slate-700"
                              : consultedEntree.type === "DON"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {consultedEntree.type || "-"}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>


                {/*        ORDRE DE SORTIE
                ================================================== */}

                <div className={sectionClass}>

                  <h3 className="font-bold text-haigana-dark">
                    Personne qui fait l'ordre de sortie
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-5">
                    Informations relatives à la personne ou au service
                    qui remet le véhicule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Nom
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.nomPersonneSortie || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        CIN
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.cinPersonneSortie || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Service
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.serviceSortie || "-"}
                      </p>
                    </div>

                  </div>

                </div>


                {/*        ORDRE D'ENTREE
                ================================================== */}

                <div className={sectionClass}>

                  <h3 className="font-bold text-haigana-dark">
                    Personne qui fait l'ordre d'entrée
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 mb-5">
                    Informations relatives à la personne ou au service
                    qui reçoit le véhicule.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Nom
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.nomPersonneEntree || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        CIN
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.cinPersonneEntree || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Service
                      </p>

                      <p className="mt-1 text-slate-700">
                        {consultedEntree.serviceEntree || "-"}
                      </p>
                    </div>

                  </div>

                </div>


                {/*        ACHAT
                ================================================== */}

                {consultedEntree.type === "ACHAT" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations de l'achat
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Date d'achat
                        </p>

                        <p className="mt-1 text-slate-700">
                          {consultedEntree.dateAchat
                            ? new Date(
                                consultedEntree.dateAchat
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Somme payée
                        </p>

                        <p className="mt-1 font-semibold text-haigana-dark">

                          {consultedEntree.sommePayer !== null &&
                          consultedEntree.sommePayer !== undefined
                            ? Number(
                                consultedEntree.sommePayer
                              ).toLocaleString(
                                "fr-FR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              ) + " Ar"
                            : "-"}

                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {/*        DON
                ================================================== */}

                {consultedEntree.type === "DON" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations du don
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Date du don
                        </p>

                        <p className="mt-1 text-slate-700">
                          {consultedEntree.dateDon
                            ? new Date(
                                consultedEntree.dateDon
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Somme reversée
                        </p>

                        <p className="mt-1 font-semibold text-haigana-dark">

                          {consultedEntree.sommeRenverser !== null &&
                          consultedEntree.sommeRenverser !== undefined
                            ? Number(
                                consultedEntree.sommeRenverser
                              ).toLocaleString(
                                "fr-FR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              ) + " Ar"
                            : "-"}

                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {/*        AFFECTATION
                ================================================== */}

                {consultedEntree.type === "AFFECTATION" && (

                  <div className={sectionClass}>

                    <h3 className="font-bold text-haigana-dark mb-5">
                      Informations de l'affectation
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Lieu d'affectation
                        </p>

                        <p className="mt-1 text-slate-700">
                          {consultedEntree.lieuAffectation || "-"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Date d'affectation
                        </p>

                        <p className="mt-1 text-slate-700">
                          {consultedEntree.dateDepart
                            ? new Date(
                                consultedEntree.dateDepart
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Date de fin
                        </p>

                        <p className="mt-1 text-slate-700">
                          {consultedEntree.dateFin
                            ? new Date(
                                consultedEntree.dateFin
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </p>

                      </div>

                      <div className="md:col-span-2">

                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Description
                        </p>

                        <p className="mt-1 text-slate-700 whitespace-pre-wrap">
                          {consultedEntree.descriptionAffectation || "-"}
                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {/*        PIECE JUSTIFICATIVE
                ================================================== */}

                <div className={sectionClass}>

                  <h3 className="font-bold text-haigana-dark mb-4">
                    Pièce justificative
                  </h3>

                  {consultedEntree.pieceJustificativeUrl ? (

                    <a
                      href={consultedEntree.pieceJustificativeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-haigana-blue/10 text-haigana-blue font-semibold hover:bg-haigana-blue/20 transition-colors"
                    >

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >

                        <path
                          d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M14 3v6h6M8 13h8M8 17h5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                      </svg>

                      Consulter la pièce justificative

                    </a>

                  ) : (

                    <p className="text-sm text-slate-500">
                      Aucune pièce justificative enregistrée.
                    </p>

                  )}

                </div>


                {/*        ACTIONS
                ================================================== */}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100 pt-6">

                  <button
                    type="button"
                    onClick={closeConsult}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Fermer
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const entree = consultedEntree;

                      closeConsult();
                      openEdit(entree);
                    }}
                    className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
                  >
                    Modifier
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
