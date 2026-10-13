import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const currentYear = new Date().getFullYear();

const emptyGestionForm = {
  description: "",
  prixTotal: "",
  dateBon: "",
  annee: String(currentYear),
};

export default function VehiculeBonCommande() {
  const { hasRole } = useAuth();
  const [params] = useSearchParams();

  const soaIdFromUrl = params.get("soaId");

  // SOA

  const [soaList, setSoaList] = useState([]);
  const [selectedSoaId, setSelectedSoaId] = useState(
    soaIdFromUrl || ""
  );

  // BONS NON PAYÉS

  const [bons, setBons] = useState([]);

  const [fondsVehicule, setFondsVehicule] = useState(null);

  // TOUS LES BONS

  const [tousLesBons, setTousLesBons] = useState([]);

  // GESTION

  const [selectedBonId, setSelectedBonId] = useState("");
  const [gestionForm, setGestionForm] = useState(
    emptyGestionForm
  );

  // MESSAGES

  const [error, setError] = useState("");

  const [gestionError, setGestionError] = useState("");

  const [gestionMessage, setGestionMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // SUPPRESSION

  const [confirmDelete, setConfirmDelete] = useState(false);

  // OBSERVATION

  const [observationOpen, setObservationOpen] = useState(null);

  const [observationText, setObservationText] = useState("");

  // RECHERCHE

  const [search, setSearch] = useState("");

  // TRI

  const [sortField, setSortField] = useState("annee");

  const [sortDirection, setSortDirection] = useState("desc");

  // CHARGEMENT SOA

  useEffect(() => {
    async function loadSoa() {
      try {
        const response = await client.get("/soa");

        const data = response.data || [];

        setSoaList(data);

        if (!selectedSoaId && data.length > 0) {
          setSelectedSoaId(String(data[0].id));
        }
      } catch (err) {
        console.error(
          "Erreur chargement SOA :",
          err
        );

        alert(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Impossible de charger les codes SOA."
        );
      }
    }

    loadSoa();
  }, []);

  // CHARGEMENT DES BONS

  async function loadBons() {
    if (!selectedSoaId) {
      setBons([]);
      setTousLesBons([]);
      return;
    }

    try {
      setError("");

      const [nonPayesResponse, tousResponse] =
        await Promise.all([
          client.get("/bons-commande", {
            params: {
              soaId: Number(selectedSoaId),
            },
          }),

          client.get("/bons-commande/tous", {
            params: {
              soaId: Number(selectedSoaId),
            },
          }),
        ]);

      setBons(nonPayesResponse.data || []);

      setTousLesBons(tousResponse.data || []);
    } catch (err) {
      console.error(
        "Erreur chargement bons :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger les bons de commande."
      );

      setBons([]);
      setTousLesBons([]);
    }
  }

  useEffect(() => {
    if (!selectedSoaId) {
      return;
    }

    setSelectedBonId("");

    setGestionForm({
      ...emptyGestionForm,
      annee: String(currentYear),
    });

    loadBons();
    loadFondsVehicule();
  }, [selectedSoaId]);

  // BON SÉLECTIONNÉ

  useEffect(() => {
    if (!selectedBonId) {
      setGestionForm({
        ...emptyGestionForm,
        annee: String(currentYear),
      });

      return;
    }

    const bon = tousLesBons.find(
      (item) =>
        item.id === Number(selectedBonId)
    );

    if (!bon) {
      return;
    }

    setGestionForm({
      description: bon.description || "",

      prixTotal:
        bon.prixTotal ?? "",

      dateBon:
        bon.dateBon || "",

      annee:
        bon.annee != null
          ? String(bon.annee)
          : String(currentYear),
    });
  }, [selectedBonId, tousLesBons]);

  // CHANGEMENT DE SOA

  function handleSoaChange(e) {
    setSelectedSoaId(e.target.value);
    setError("");
    setGestionError("");
    setGestionMessage("");
    setSearch("");
  }

  // CHARGEMENT DU FONDS PUBLIC VÉHICULE

  async function loadFondsVehicule() {
    try {
      const response = await client.get(
        "/argent-public-vehicule"
      );

      const data = response.data;

      console.log(
        "FONDS PUBLIC VÉHICULE REÇU :",
        data
      );

      if (Array.isArray(data) && data.length > 0) {

        const fonds = data[0];

        const montantTotal =
          Number(fonds.montantTotal) || 0;

        const montantUtilise =
          Number(fonds.montantUtilise) || 0;

        const montantDisponible =
          montantTotal - montantUtilise;

        setFondsVehicule({
          ...fonds,
          montantTotal,
          montantUtilise,
          montantDisponible
        });

      } else if (data) {

        const montantTotal =
          Number(data.montantTotal) || 0;

        const montantUtilise =
          Number(data.montantUtilise) || 0;

        const montantDisponible =
          montantTotal - montantUtilise;

        setFondsVehicule({
          ...data,
          montantTotal,
          montantUtilise,
          montantDisponible
        });

      } else {

        setFondsVehicule(null);
      }

    } catch (err) {

      console.error(
        "Erreur chargement fonds public véhicule :",
        err
      );

      setFondsVehicule(null);
    }
  }

  // CHANGEMENT FORMULAIRE

  function setGestionField(field, value) {
    setGestionForm((current) => ({
      ...current,
      [field]: value,
    }));

    setGestionError("");
    setGestionMessage("");
  }

  // PAIEMENT

  async function payer(bonId) {
    const bon = tousLesBons.find(
      (item) => item.id === Number(bonId)
    );

    if (!bon) {
      return;
    }

    if (bon.statut === "PAYE") {
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment payer le bon BON-${bonId}${
        bon.annee
          ? ` de l'année ${bon.annee}`
          : ""
      } ?`
    );

    if (!confirmation) {
      return;
    }

    setError("");

    try{
      await client.put(
        `/bons-commande/${bonId}/payer`
      );

      alert(
        `Le bon BON-${bonId} a été payé avec succès.`
      );

      await loadBons();
      await loadFondsVehicule();

    } catch (err) {
      console.error(
        "Erreur paiement :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Impossible de payer ce bon de commande.";

      setError(message);

      alert(message);

      // Ouvre l'observation uniquement
      // en cas d'échec du paiement.
      setObservationOpen(bonId);
    }
  }

  // OBSERVATION

  async function enregistrerObservation() {
    if (!observationOpen) {
      return;
    }

    if (!observationText.trim()) {
      alert(
        "Veuillez saisir une observation."
      );

      return;
    }

    try {
      await client.post(
        "/observations",
        {
          bonCommande: {
            id: observationOpen,
          },

          descriptionObservation:
            observationText.trim(),

          dateObservation:
            new Date()
              .toISOString()
              .slice(0, 10),
        }
      );

      alert(
        "Observation enregistrée avec succès."
      );

      setObservationOpen(null);

      setObservationText("");
    } catch (err) {
      console.error(
        "Erreur observation :",
        err
      );

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible d'enregistrer l'observation."
      );
    }
  }
  // AJOUT

  async function handleAjouterBon() {
    setGestionError("");
    setGestionMessage("");

    if (!selectedSoaId) {
      alert(
        "Veuillez sélectionner un code SOA."
      );

      return;
    }

    if (!gestionForm.description.trim()) {
      alert(
        "La description du bon est obligatoire."
      );

      return;
    }

    if (!gestionForm.prixTotal) {
      alert(
        "Le prix total du bon est obligatoire."
      );

      return;
    }

    const prix = Number(
      gestionForm.prixTotal
    );

    if (Number.isNaN(prix) || prix <= 0) {
      alert(
        "Le prix total doit être supérieur à zéro."
      );

      return;
    }

    if (!gestionForm.annee) {
      alert(
        "L'année du bon est obligatoire."
      );

      return;
    }

    const annee = Number(
      gestionForm.annee
    );

    if (
      Number.isNaN(annee) ||
      annee < 2000 ||
      annee > 2100
    ) {
      alert(
        "Veuillez saisir une année valide."
      );

      return;
    }

    setSubmitting(true);

    try {
      await client.post(
        "/bons-commande",
        {
          description:
            gestionForm.description.trim(),

          prixTotal: prix,

          dateBon:
            gestionForm.dateBon || null,

          annee: annee,

          codeSoa: {
            id: Number(selectedSoaId),
          },
        }
      );

      alert(
        `Bon de commande ajouté pour l'année ${annee}.`
      );

      setGestionMessage(
        "Bon de commande ajouté avec succès."
      );

      setGestionForm({
        ...emptyGestionForm,
        annee: String(currentYear),
      });

      setSelectedBonId("");

      await loadBons();
    } catch (err) {
      console.error(
        "Erreur ajout bon :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de l'ajout du bon.";

      setGestionError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  // MODIFICATION

  async function handleModifierBon() {
    if (!selectedBonId) {
      alert(
        "Veuillez sélectionner un bon de commande."
      );

      return;
    }

    if (!gestionForm.description.trim()) {
      alert(
        "La description du bon est obligatoire."
      );

      return;
    }

    if (!gestionForm.prixTotal) {
      alert(
        "Le prix total du bon est obligatoire."
      );

      return;
    }

    const prix = Number(
      gestionForm.prixTotal
    );

    if (Number.isNaN(prix) || prix <= 0) {
      alert(
        "Le prix total doit être supérieur à zéro."
      );

      return;
    }

    setGestionError("");
    setGestionMessage("");
    setSubmitting(true);

    try {
      await client.put(
        `/bons-commande/${selectedBonId}`,
        {
          description:
            gestionForm.description.trim(),

          prixTotal: prix,

          dateBon:
            gestionForm.dateBon || null,
        }
      );

      alert(
        "Bon de commande modifié avec succès."
      );

      setGestionMessage(
        "Bon de commande modifié."
      );

      await loadBons();
    } catch (err) {
      console.error(
        "Erreur modification bon :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de la modification.";

      setGestionError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  // SUPPRESSION

  async function handleSupprimerBon() {
    if (!selectedBonId) {
      return;
    }
    setGestionError("");
    setSubmitting(true);

    try {
      await client.delete(
        `/bons-commande/${selectedBonId}`
      );

      alert(
        "Bon de commande supprimé avec succès."
      );

      setConfirmDelete(false);
      setSelectedBonId("");
      setGestionForm({
        ...emptyGestionForm,
        annee: String(currentYear),
      });

      await loadBons();
    } catch (err) {
      console.error(
        "Erreur suppression bon :",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de la suppression.";

      setGestionError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  // RECHERCHE

  const bonsFiltres = useMemo(() => {
    const terme =
      search.trim().toLowerCase();

    let resultat =
      [...tousLesBons];

    if (terme) {
      resultat = resultat.filter(
        (bon) => {
          const reference =
            `BON-${bon.id}`.toLowerCase();

          const description =
            (
              bon.description || ""
            ).toLowerCase();

          const annee =
            String(
              bon.annee || ""
            );

          const statut =
            bon.statut === "PAYE"
              ? "paye"
              : "non paye";

          return (
            reference.includes(terme) ||
            description.includes(terme) ||
            annee.includes(terme) ||
            statut.includes(terme)
          );
        }
      );
    }

    // ==============================
    // TRI
    // ==============================

    resultat.sort((a, b) => {
      let valeurA;
      let valeurB;

      switch (sortField) {
        case "id":
          valeurA = a.id || 0;
          valeurB = b.id || 0;
          break;

        case "description":
          valeurA =
            (
              a.description || ""
            ).toLowerCase();

          valeurB =
            (
              b.description || ""
            ).toLowerCase();

          break;

        case "annee":
          valeurA = a.annee || 0;
          valeurB = b.annee || 0;
          break;

        case "prix":
          valeurA = a.prixTotal || 0;
          valeurB = b.prixTotal || 0;
          break;

        case "statut":
          valeurA =
            a.statut === "PAYE"
              ? 1
              : 0;

          valeurB =
            b.statut === "PAYE"
              ? 1
              : 0;

          break;

        case "date":
          valeurA =
            a.dateBon || "";

          valeurB =
            b.dateBon || "";

          break;

        default:
          valeurA = a.id || 0;
          valeurB = b.id || 0;
      }

      if (
        typeof valeurA === "string" &&
        typeof valeurB === "string"
      ) {
        return (
          valeurA.localeCompare(
            valeurB,
            "fr"
          ) *
          (sortDirection === "asc"
            ? 1
            : -1)
        );
      }

      return (
        (valeurA > valeurB
          ? 1
          : valeurA < valeurB
          ? -1
          : 0) *
        (sortDirection === "asc"
          ? 1
          : -1)
      );
    });

    return resultat;
  }, [
    tousLesBons,
    search,
    sortField,
    sortDirection,
  ]);

  // CHANGEMENT TRI

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  // ICÔNE TRI

  function SortIcon({ field }) {
    if (sortField !== field) {
      return (
        <span className="text-white/40">
          ↕
        </span>
      );
    }

    return sortDirection === "asc" ? (
      <span>↑</span>
    ) : (
      <span>↓</span>
    );
  }

  // TOTAL

  const totalNonPayes = bons.reduce(
    (sum, bon) =>
      sum + (Number(bon.prixTotal) || 0),
    0
  );

  const totalTous = tousLesBons.reduce(
    (sum, bon) =>
      sum + (Number(bon.prixTotal) || 0),
    0
  );

    // ARGENT UTILISÉ DU CODE SOA SÉLECTIONNÉ
    // Somme des bons de commande déjà payés

    const totalUtilise = tousLesBons.reduce(
      (sum, bon) =>
        bon.statut === "PAYE"
          ? sum + (Number(bon.prixTotal) || 0)
          : sum,
      0
    );

    // SOA COURANT

    const soaCourant =
      soaList.find(
        (soa) =>
          soa.id ===
          Number(selectedSoaId)
      );

    // BON SÉLECTIONNÉ

    const bonSelectionne =
      tousLesBons.find(
        (bon) =>
          bon.id ===
          Number(selectedBonId)
      );

  // AFFICHAGE

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

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
            Bon de commande
          </span>

        </div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Bons de commande
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion, paiement et suivi des bons de commande.
          </p>
        </div>

        <select
          value={selectedSoaId}
          onChange={handleSoaChange}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue"
        >
          <option value="">
            Choisir un code SOA...
          </option>

          {soaList.map((soa) => (
            <option
              key={soa.id}
              value={soa.id}
            >
              {soa.codeSoa}
            </option>
          ))}
        </select>

      </div>

      {/*INFORMATIONS SOA*/}

      {selectedSoaId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

          {/* CODE SOA */}

          <div className="bg-white rounded-2xl shadow-card p-6">

            <p className="text-sm text-gray-500">
              Code SOA
            </p>

            <p className="text-xl font-bold text-haigana-dark mt-1">
              {soaCourant?.codeSoa || "-"}
            </p>

            {soaCourant?.region && (
              <p className="text-sm text-gray-400 mt-1">
                Région :{" "}
                {soaCourant.region.nomRegion}
              </p>
            )}

          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">

            <p className="text-sm text-gray-500">
              Argent disponible pour les véhicules
            </p>

            <p className="text-xl font-bold text-haigana-dark mt-1">
              {Number(
                fondsVehicule?.montantDisponible || 0
              ).toLocaleString("fr-FR")}{" "}
              Ar
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Fonds public dédié aux véhicules
            </p>

          </div>

          {/* BONS NON PAYÉS */}

          <div className="bg-white rounded-2xl shadow-card p-6">

            <p className="text-sm text-gray-500">
              Bons non payés
            </p>

            <p className="text-xl font-bold text-haigana-dark mt-1">
              {bons.length}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Montant non payé :{" "}
              {totalNonPayes.toLocaleString(
                "fr-FR"
              )}{" "}
              Ar
            </p>

          </div>

          {/* ARGENT UTILISÉ */}

          <div className="bg-white rounded-2xl shadow-card p-6">

            <p className="text-sm text-gray-500">
              Argent utilisé du Code SOA
            </p>

            <p className="text-xl font-bold text-haigana-dark mt-1">
              {totalUtilise.toLocaleString("fr-FR")} Ar
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Bons de commande payés
            </p>

          </div>
        </div>
      )}

      {/*ERREUR*/}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/*GESTION DU BON*/}

      {selectedSoaId && (
        <div className="bg-white rounded-2xl shadow-card p-8 space-y-6 mb-8">

          <div>
            <h2 className="text-lg font-semibold text-haigana-dark">
              Gestion du bon de commande
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Ajoutez ou modifiez un bon de commande.
            </p>
          </div>

          {/* SÉLECTION BON */}

          <div>
            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Bon de commande à gérer
            </label>

            <select
              value={selectedBonId}
              onChange={(e) =>
                setSelectedBonId(
                  e.target.value
                )
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none bg-white"
            >
              <option value="">
                — Nouveau bon —
              </option>

              {tousLesBons.map((bon) => (
                <option
                  key={bon.id}
                  value={bon.id}
                >
                  BON-{bon.id} —{" "}
                  {bon.description || "Sans description"}{" "}
                  (
                  {bon.annee || "-"}{" "}
                  -{" "}
                  {bon.statut === "PAYE"
                    ? "payé"
                    : "non payé"}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* FORMULAIRE */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Description *
              </label>

              <input
                type="text"
                value={
                  gestionForm.description
                }
                onChange={(e) =>
                  setGestionField(
                    "description",
                    e.target.value
                  )
                }
                disabled={
                  Boolean(
                    bonSelectionne &&
                    bonSelectionne.statut ===
                      "PAYE"
                  )
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none disabled:bg-gray-100"
                placeholder="Description du bon..."
              />

            </div>

            {/* PRIX */}

            <div>

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Prix total (Ar) *
              </label>

              <input
                type="number"
                min="1"
                value={
                  gestionForm.prixTotal
                }
                onChange={(e) =>
                  setGestionField(
                    "prixTotal",
                    e.target.value
                  )
                }
                disabled={
                  Boolean(
                    bonSelectionne &&
                    bonSelectionne.statut ===
                      "PAYE"
                  )
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none disabled:bg-gray-100"
              />

            </div>

            {/* ANNÉE */}

            <div>

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Année *
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={
                  gestionForm.annee
                }
                onChange={(e) =>
                  setGestionField(
                    "annee",
                    e.target.value
                  )
                }
                disabled={
                  Boolean(selectedBonId)
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none disabled:bg-gray-100"
              />

              {selectedBonId && (
                <p className="text-xs text-gray-400 mt-1">
                  L'année d'un bon existant ne peut
                  pas être modifiée.
                </p>
              )}

            </div>

            {/* DATE */}

            <div>

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Date du bon
              </label>

              <input
                type="date"
                value={
                  gestionForm.dateBon
                }
                onChange={(e) =>
                  setGestionField(
                    "dateBon",
                    e.target.value
                  )
                }
                disabled={
                  Boolean(
                    bonSelectionne &&
                    bonSelectionne.statut ===
                      "PAYE"
                  )
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none disabled:bg-gray-100"
              />

            </div>

          </div>

          {/* MESSAGES */}

          {gestionMessage && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {gestionMessage}
            </p>
          )}

          {gestionError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {gestionError}
            </p>
          )}

          {/* BOUTONS */}

          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">

            {/* AJOUT */}

            {!selectedBonId &&
              hasRole("ADMINISTRATEUR") && (
                <button
                  type="button"
                  onClick={
                    handleAjouterBon
                  }
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? "Ajout..."
                    : "Ajouter"}
                </button>
              )}

            {/* MODIFICATION / SUPPRESSION */}

            {selectedBonId && (
              <>
                {hasRole(
                  "ADMINISTRATEUR"
                ) && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDelete(
                        true
                      )
                    }
                    disabled={
                      submitting ||
                      bonSelectionne?.statut ===
                        "PAYE"
                    }
                    className="px-6 py-2.5 rounded-lg border border-red-400 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                )}

                {hasRole(
                  "ADMINISTRATEUR",
                  "MODIFICATEUR"
                ) && (
                  <button
                    type="button"
                    onClick={
                      handleModifierBon
                    }
                    disabled={
                      submitting ||
                      bonSelectionne?.statut ===
                        "PAYE"
                    }
                    className="px-6 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    {submitting
                      ? "Modification..."
                      : "Modifier"}
                  </button>
                )}
              </>
            )}

          </div>

        </div>
      )}

      {/*LIEN LIVRET*/}

      <div className="flex justify-end mb-8">

        <Link
          to="/patrimoine/vehicule/livret"
          className="px-6 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
        >
          Livret de véhicule
        </Link>

      </div>

      {/*TABLEAU*/}

      {selectedSoaId && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">

          {/* EN-TÊTE */}

          <div className="p-6 border-b border-gray-100">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold text-haigana-dark">
                  Historique des bons de commande
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Tous les bons du code SOA sélectionné.
                </p>

              </div>

              {/* RECHERCHE */}

              <div className="w-full lg:w-80">

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Rechercher un bon..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none"
                />

              </div>

            </div>

          </div>

          {/* RÉSUMÉ */}

          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-100">

            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total des bons
              </p>

              <p className="text-xl font-bold text-haigana-dark mt-1">
                {tousLesBons.length}
              </p>

            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-gray-100">

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total non payé
              </p>

              <p className="text-xl font-bold text-haigana-dark mt-1">
                {totalNonPayes.toLocaleString(
                  "fr-FR"
                )}{" "}
                Ar
              </p>

            </div>

            <div className="p-5">

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Total général
              </p>

              <p className="text-xl font-bold text-haigana-dark mt-1">
                {totalTous.toLocaleString(
                  "fr-FR"
                )}{" "}
                Ar
              </p>

            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-haigana-dark text-white">

                <tr>

                  <th
                    onClick={() =>
                      handleSort("id")
                    }
                    className="text-left px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      Référence
                      <SortIcon field="id" />
                    </div>
                  </th>

                  <th
                    onClick={() =>
                      handleSort(
                        "description"
                      )
                    }
                    className="text-left px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <SortIcon
                        field="description"
                      />
                    </div>
                  </th>

                  <th
                    onClick={() =>
                      handleSort("annee")
                    }
                    className="text-center px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-center gap-2">
                      Année
                      <SortIcon field="annee" />
                    </div>
                  </th>

                  <th
                    onClick={() =>
                      handleSort("date")
                    }
                    className="text-left px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>

                  <th
                    onClick={() =>
                      handleSort("prix")
                    }
                    className="text-right px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Prix
                      <SortIcon field="prix" />
                    </div>
                  </th>

                  <th
                    onClick={() =>
                      handleSort("statut")
                    }
                    className="text-center px-4 py-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center justify-center gap-2">
                      Statut
                      <SortIcon
                        field="statut"
                      />
                    </div>
                  </th>

                  <th className="text-right px-4 py-3">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {bonsFiltres.map((bon) => (

                  <tr
                    key={bon.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    {/* RÉFÉRENCE */}

                    <td className="px-4 py-3 font-medium text-haigana-dark">
                      BON-{bon.id}
                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-4 py-3">
                      {bon.description || "-"}
                    </td>

                    {/* ANNÉE */}

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {bon.annee || "-"}
                      </span>
                    </td>

                    {/* DATE */}

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {bon.dateBon
                        ? new Date(
                            bon.dateBon
                          ).toLocaleDateString(
                            "fr-FR"
                          )
                        : "-"}
                    </td>

                    {/* PRIX */}

                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(
                        bon.prixTotal || 0
                      ).toLocaleString(
                        "fr-FR"
                      )}{" "}
                      Ar
                    </td>

                    {/* STATUT */}

                    <td className="px-4 py-3 text-center">

                      {bon.statut ===
                      "PAYE" ? (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          Payé
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                          Non payé
                        </span>
                      )}

                    </td>

                    {/* ACTION */}

                    <td className="px-4 py-3 text-right">

                      {bon.statut !==
                        "PAYE" && (
                        <button
                          type="button"
                          onClick={() =>
                            payer(
                              bon.id
                            )
                          }
                          className="text-haigana-blue hover:text-haigana-dark font-semibold"
                        >
                          Payer
                        </button>
                      )}

                      {bon.statut ===
                        "PAYE" && (
                        <span className="text-gray-400 text-xs">
                          Payé
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

                {bonsFiltres.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      {search
                        ? "Aucun bon ne correspond à votre recherche."
                        : "Aucun bon de commande enregistré."}
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/*AUCUN SOA*/}

      {!selectedSoaId && (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400">

          <p className="font-medium">
            Sélectionnez un code SOA
          </p>

          <p className="text-sm mt-1">
            Sélectionnez un code SOA pour gérer ses bons
            de commande.
          </p>

        </div>
      )}

      {/*MODALE SUPPRESSION*/}

      {confirmDelete && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setConfirmDelete(false)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="font-semibold text-red-600 mb-3">
              Supprimer ce bon de commande ?
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              Cette action est irréversible.
            </p>

            <div className="flex justify-end gap-2">

              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(false)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  handleSupprimerBon
                }
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-60"
              >
                {submitting
                  ? "Suppression..."
                  : "Confirmer"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/*MODALE OBSERVATION*/}

      {observationOpen && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setObservationOpen(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="font-semibold text-haigana-dark mb-3">
              Observation
            </h3>

            <p className="text-sm text-gray-500 mb-3">
              Le paiement n'a pas pu être effectué.
              Vous pouvez enregistrer la raison.
            </p>

            <textarea
              value={observationText}
              onChange={(e) =>
                setObservationText(
                  e.target.value
                )
              }
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-haigana-blue"
              placeholder="Raison du non-paiement..."
            />

            <div className="flex justify-end gap-2 mt-4">

              <button
                type="button"
                onClick={() => {
                  setObservationOpen(null);
                  setObservationText("");
                }}
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  enregistrerObservation
                }
                className="px-4 py-2 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue"
              >
                Enregistrer
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}