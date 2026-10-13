import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RecensementMateriel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const state = location.state || {};

  const soaId = state.soaId || null;
  const codeSoa = state.codeSoa || "";
  const annee = String(
    state.annee || new Date().getFullYear() - 1
  );

  const [lignes, setLignes] = useState([]);
  const [step, setStep] = useState(1);

  const [recensement, setRecensement] = useState(null);

  const [formAgents, setFormAgents] = useState({
    fonctionnaireRecenseurNom: "",
    fonctionnaireRecenseurQualite: "",
    comptableNom: "",
    comptableQualite: "",
  });

  const [loadingRecensement, setLoadingRecensement] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pageNomenclature, setPageNomenclature] =
    useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [comparaison, setComparaison] = useState({
    nouveaux: [],
    modifies: [],
    absents: [],
  });

  const [showNouveauxModal, setShowNouveauxModal] =
      useState(false);

  const [showModificationsModal, setShowModificationsModal] =
      useState(false);
  const [showAbsentsModal, setShowAbsentsModal] =
      useState(false);

  const chargerComparaison = async (recensementId) => {
    if (!recensementId) return;

    try {
        const response = await client.get(
            `/recensements-materiel/${recensementId}/comparaison`
        );

        setComparaison(
            response.data || {
                nouveaux: [],
                modifies: [],
                absents: [],
            }
        );

    } catch (err) {
        console.error(
            "Erreur comparaison :",
            err
        );
    }
  };

    const gererSuppressionRecensement = async () => {
    if (!recensement?.id) return;

    const confirmation = window.confirm(
      `ATTENTION : Voulez-vous vraiment SUPPRIMER ENTIÈREMENT ce recensement matériel de l'année ${annee} ?\n\nCette action est irréversible et effacera toutes les lignes constatées.`
    );

    if (!confirmation) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await client.delete(`/recensements-materiel/${recensement.id}`);

      setSuccess("Le recensement a été supprimé avec succès.");
      setRecensement(null);
      setLignes([]);
      setComparaison({ nouveaux: [], modifies: [], absents: [] });
      setStep(1); // Retour à l'écran initial de configuration

    } catch (err) {
      console.error("Erreur suppression recensement :", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de supprimer le recensement."
      );
    } finally {
      setSaving(false);
    }
  };


  // CHARGEMENT DU RECENSEMENT

  const rechargerRecensementEtCalcul = async (recensementId) => {
      if (!recensementId) return;

      try {
          setLoadingRecensement(true);
          setError("");

          // 1. Charger le recensement propre à cette année
          const recensementResponse = await client.get(
              `/recensements-materiel/${recensementId}`
          );

          const recensementData = recensementResponse.data;

          setRecensement(recensementData);
          setLignes(recensementData?.lignes || []);

          // 2. Calculer la comparaison avec l'inventaire
          //    de l'année du recensement
          const comparaisonResponse = await client.get(
              `/recensements-materiel/${recensementId}/comparaison`
          );

          setComparaison(
              comparaisonResponse.data || {
                  nouveaux: [],
                  modifies: [],
                  absents: [],
              }
          );

          setPageNomenclature(0);

      } catch (err) {
          console.error(
              "Erreur chargement/calcul recensement :",
              err
          );

          setError(
              err.response?.data?.message ||
              err.response?.data?.error ||
              "Impossible de calculer le recensement."
          );
      } finally {
          setLoadingRecensement(false);
      }
  };

  useEffect(() => {
  if (!soaId || !annee) {
    setError("Le SOA ou l'année est manquant.");
    return;
  }

  const chargerRecensement = async () => {
    setLoadingRecensement(true);
    setError("");
    setSuccess("");

    try {
      const response = await client.get(
        `/recensements-materiel/soa/${soaId}/annee/${annee}`
      );

      const data = response.data;

      setRecensement(data);

      setFormAgents({
        fonctionnaireRecenseurNom:
          data.fonctionnaireRecenseurNom || "",

        fonctionnaireRecenseurQualite:
          data.fonctionnaireRecenseurQualite || "",

        comptableNom:
          data.comptableNom || "",

        comptableQualite:
          data.comptableQualite || "",
      });

      setLignes(data?.lignes || []);

      setPageNomenclature(0);

      // Calcul/comparaison de CE recensement
      await chargerComparaison(data.id);

      setStep(1);

    } catch (err) {

      if (err.response?.status === 404) {

        // Aucun recensement existant
        setRecensement(null);

        setFormAgents({
          fonctionnaireRecenseurNom: "",
          fonctionnaireRecenseurQualite: "",
          comptableNom: "",
          comptableQualite: "",
        });

        setLignes([]);

        setComparaison({
          nouveaux: [],
          modifies: [],
          absents: [],
        });

        setPageNomenclature(0);
        setStep(1);

        // IMPORTANT :
        // ne pas appeler rechargerRecensementEtCalcul ici

      } else {

        console.error(
          "Erreur chargement recensement :",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Impossible de charger le recensement."
        );
      }

    } finally {
      setLoadingRecensement(false);
    }
  };

    chargerRecensement();
  }, [soaId, annee]);

  // CHANGEMENT FORMULAIRE

  const handleAgentChange = (e) => {
    const { name, value } = e.target;

    setFormAgents((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // PASSER AU RECENSEMENT

    const passerAuRecensement = async () => {
    setError("");
    setSuccess("");

    if (!formAgents.fonctionnaireRecenseurNom.trim()) {
      setError(
        "Le nom du fonctionnaire recenseur est obligatoire."
      );
      return;
    }

    if (!formAgents.fonctionnaireRecenseurQualite.trim()) {
      setError(
        "La qualité du fonctionnaire recenseur est obligatoire."
      );
      return;
    }

    if (!formAgents.comptableNom.trim()) {
      setError(
        "Le nom du comptable est obligatoire."
      );
      return;
    }

    if (!formAgents.comptableQualite.trim()) {
      setError(
        "La qualité du comptable est obligatoire."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        soaId,
        annee: Number(annee),

        fonctionnaireRecenseurNom:
          formAgents.fonctionnaireRecenseurNom.trim(),

        fonctionnaireRecenseurQualite:
          formAgents.fonctionnaireRecenseurQualite.trim(),

        comptableNom:
          formAgents.comptableNom.trim(),

        comptableQualite:
          formAgents.comptableQualite.trim(),
      };

      let response;

      if (recensement?.id) {
        response = await client.put(
          `/recensements-materiel/${recensement.id}`,
          payload
        );
      } else {
        response = await client.post(
          `/recensements-materiel`,
          payload
        );
      }

      const data = response.data;

      setRecensement(data);
      setLignes(data?.lignes || []);
      setPageNomenclature(0);

      // Recalculer uniquement CE recensement
      await chargerComparaison(data.id);

      setStep(2);

    } catch (err) {
      console.error(
        "Erreur enregistrement recensement :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Impossible d'enregistrer le recensement (HTTP ${
          err.response?.status || "inconnu"
        }).`
      );

    } finally {
      setLoading(false);
    }
  };

  const supprimerMaterielAbsent = async (ligneId) => {
  if (!recensement?.id || !ligneId) {
    return;
  }

  const confirmation = window.confirm(
    "Voulez-vous supprimer ce matériel absent du recensement ?\n\nCette action ne supprime pas le matériel de l'inventaire."
  );

  if (!confirmation) {
    return;
  }

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    await client.delete(
      `/recensements-materiel/${recensement.id}/lignes/${ligneId}`
    );

    await rechargerRecensementEtCalcul(
      recensement.id
    );

    setSuccess(
      "Le matériel absent a été supprimé du recensement."
    );

  } catch (err) {
    console.error(
      "Erreur suppression ligne absente :",
      err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible de supprimer ce matériel du recensement."
    );
  } finally {
    setSaving(false);
  }
  };

  const ajouterNouveauMateriel = async (materielId) => {
  if (!recensement?.id) return;

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    await client.post(
      `/recensements-materiel/${recensement.id}/nouveaux/${materielId}`
    );

    await rechargerRecensementEtCalcul(
      recensement.id
    );

    setShowNouveauxModal(false);

    setSuccess(
      "Le nouveau matériel a été ajouté au recensement."
    );

  } catch (err) {
    console.error(
      "Erreur ajout nouveau matériel :",
      err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible d'ajouter le matériel."
    );

  } finally {
    setSaving(false);
  }
  };

  const appliquerModification = async (ligneId) => {
  if (!recensement?.id) return;

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    await client.put(
      `/recensements-materiel/${recensement.id}/lignes/${ligneId}/appliquer-modification`
    );

    await rechargerRecensementEtCalcul(
      recensement.id
    );

    setShowModificationsModal(false);

    setSuccess(
      "La modification du matériel a été appliquée au recensement."
    );

  } catch (err) {
    console.error(
      "Erreur application modification :",
      err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible d'appliquer la modification."
    );

  } finally {
    setSaving(false);
  }
  };

  const materielsAbsents = useMemo(() => {
    return new Set(
        comparaison.absents.map(
            (item) => item.ligneId
        )
    );
  }, [comparaison.absents]);

  // GROUPEMENT PAR NOMENCLATURE

  const groupesNomenclature = useMemo(() => {
    const groupes = new Map();

    lignes.forEach((ligne) => {
      const numero =
        ligne.nomenclatureNumero ?? 0;

      const designation =
        ligne.nomenclatureDesignation ||
        "Sans désignation";

      const cle =
        `${numero}-${designation}`;

      if (!groupes.has(cle)) {
        groupes.set(cle, {
          numero,
          designation,
          lignes: [],
        });
      }

      groupes
        .get(cle)
        .lignes
        .push(ligne);
    });

    return Array.from(groupes.values()).sort(
      (a, b) => a.numero - b.numero
    );
  }, [lignes]);

  const nomenclatureActuelle =
    groupesNomenclature[pageNomenclature] || null;

  const lignesNomenclature =
    nomenclatureActuelle?.lignes || [];

  // TOTAUX NOMENCLATURE

  const totalNomenclature = useMemo(() => {
    return lignesNomenclature.reduce(
      (total, ligne) => ({
        existant:
          total.existant +
          Number(ligne.existantEcriture || 0),

        constate:
          total.constate +
          Number(ligne.constateRecensement || 0),

        excedent:
          total.excedent +
          Number(ligne.excedent || 0),

        deficit:
          total.deficit +
          Number(ligne.deficit || 0),

        valeurExcedent:
          total.valeurExcedent +
          Number(ligne.valeurExcedentArticle || 0),

        valeurDeficit:
          total.valeurDeficit +
          Number(ligne.valeurDeficitArticle || 0),

        valeur:
          total.valeur +
          Number(ligne.valeurArticle || 0),
      }),
      {
        existant: 0,
        constate: 0,
        excedent: 0,
        deficit: 0,
        valeurExcedent: 0,
        valeurDeficit: 0,
        valeur: 0,
      }
    );
  }, [lignesNomenclature]);

  // MODIFICATION LOCALE D'UNE LIGNE

  const modifierLigneLocalement = (
    ligneId,
    champ,
    valeur
  ) => {
    setLignes((prev) =>
      prev.map((ligne) =>
        ligne.id === ligneId
          ? {
              ...ligne,
              [champ]: valeur,
            }
          : ligne
      )
    );
  };

  // ENREGISTRER UNE LIGNE

  const enregistrerLigne = async (ligne) => {
    if (!recensement?.id || !ligne?.id) {
      return;
    }

    const constate =
      Number(ligne.constateRecensement);

    if (
      !Number.isInteger(constate) ||
      constate < 0
    ) {
      setError(
        "La quantité constatée doit être un nombre entier positif ou zéro."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await client.put(
        `/recensements-materiel/${recensement.id}/lignes/${ligne.id}`,
        {
          constateRecensement: constate,
          observation:
            ligne.observation?.trim() || null,
        }
      );

      const data = response.data;

      setRecensement(data);
      setLignes(data?.lignes || []);
      await chargerComparaison(recensement.id);

      /*
       * Recalculs renvoyés par le backend.
       */
      setPageNomenclature((prev) =>
        Math.min(
          prev,
          Math.max(
            (data?.lignes || []).length - 1,
            0
          )
        )
      );

      setSuccess(
        "La ligne du recensement a été enregistrée."
      );

    } catch (err) {
      console.error(
        "Erreur modification ligne :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Impossible d'enregistrer cette ligne."
      );
    } finally {
      setSaving(false);
    }
  };

  // FORMATAGE

  const formatMontant = (valeur) => {
    return Number(valeur || 0).toLocaleString(
      "fr-FR"
    );
  };

  // ETAPE 1

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

        <div className="max-w-3xl mx-auto">

          {/* HEADER */}

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-haigana-dark">
              Recensement du matériel
            </h2>

            <p className="text-gray-600 mt-1">
              SOA : <strong>{codeSoa}</strong>
              {" — "}
              Année : <strong>{annee}</strong>
            </p>

            {loadingRecensement && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50 text-gray-600">
                Vérification du recensement existant...
              </div>
            )}

            {!loadingRecensement && recensement && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 text-blue-700">
                Un recensement existe déjà pour cette année.

              </div>
            )}

            {!loadingRecensement && !recensement && (
              <div className="mt-3 p-3 rounded-xl bg-green-50 text-green-700">
                Aucun recensement n'existe encore pour cette année.
                Veuillez renseigner les informations ci-dessous.
              </div>
            )}

          </div>

          {/* ERREUR */}

          {error && (
            <div
              className="
                mb-5
                p-4
                bg-red-50
                border
                border-red-200
                text-red-700
                rounded-xl
              "
            >
              {error}
            </div>
          )}

          {/* CARD */}

          <div
            className="
              bg-white
              rounded-2xl
              shadow-card
              overflow-hidden
            "
          >

            {/* CARD HEADER */}

            <div
              className="
                px-6
                py-5
                border-b
                border-gray-100
              "
            >

              <h2
                className="
                  text-lg
                  font-semibold
                  text-haigana-dark
                "
              >
                Informations du recensement
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Renseignez les responsables avant de
                commencer le recensement.
              </p>

            </div>

            {/* FORMULAIRE */}

            <div
              className="
                p-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >

              {/* ANNEE */}

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                  md:col-span-2
                "
              >

                <label className="block text-xs text-gray-500 mb-2">
                  Année du recensement
                </label>

                <input
                  type="number"
                  value={annee}
                  disabled
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-100
                    text-gray-600
                    outline-none
                  "
                />

              </div>

              {/* RECENSEUR */}

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                "
              >

                <label className="block text-xs text-gray-500 mb-2">
                  Nom du fonctionnaire recenseur *
                </label>

                <input
                  type="text"
                  name="fonctionnaireRecenseurNom"
                  value={
                    formAgents.fonctionnaireRecenseurNom
                  }
                  onChange={handleAgentChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    outline-none
                    focus:border-haigana-blue
                    focus:ring-2
                    focus:ring-haigana-blue/20
                    disabled:bg-gray-100
                  "
                />

              </div>

              {/* QUALITE RECENSEUR */}

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                "
              >

                <label className="block text-xs text-gray-500 mb-2">
                  Qualité du fonctionnaire recenseur *
                </label>

                <input
                  type="text"
                  name="fonctionnaireRecenseurQualite"
                  value={
                    formAgents.fonctionnaireRecenseurQualite
                  }
                  onChange={handleAgentChange}
                  placeholder="Ex : IM : 321 166"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    outline-none
                    focus:border-haigana-blue
                    focus:ring-2
                    focus:ring-haigana-blue/20
                    disabled:bg-gray-100
                  "
                />

              </div>

              {/* COMPTABLE */}

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                "
              >

                <label className="block text-xs text-gray-500 mb-2">
                  Nom du comptable *
                </label>

                <input
                  type="text"
                  name="comptableNom"
                  value={
                    formAgents.comptableNom
                  }
                  onChange={handleAgentChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    outline-none
                    focus:border-haigana-blue
                    focus:ring-2
                    focus:ring-haigana-blue/20
                    disabled:bg-gray-100
                  "
                />

              </div>

              {/* QUALITE COMPTABLE */}

              <div
                className="
                  bg-gray-50
                  rounded-xl
                  p-4
                "
              >

                <label className="block text-xs text-gray-500 mb-2">
                  Qualité du comptable *
                </label>

                <input
                  type="text"
                  name="comptableQualite"
                  value={
                    formAgents.comptableQualite
                  }
                  onChange={handleAgentChange}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    outline-none
                    focus:border-haigana-blue
                    focus:ring-2
                    focus:ring-haigana-blue/20
                    disabled:bg-gray-100
                  "
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div
              className="
                px-6
                py-4
                border-t
                border-gray-100
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading || loadingRecensement}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-gray-200
                  text-gray-600
                  font-semibold
                  hover:bg-gray-50
                  disabled:opacity-40
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={passerAuRecensement}
                disabled={
                    loading ||
                    loadingRecensement ||
                    saving
                }
                className="
                    px-6
                    py-3
                    rounded-xl
                    bg-haigana-dark
                    text-white
                    font-semibold
                    hover:bg-haigana-blue
                    disabled:opacity-40
                "
            >
                {loading
                    ? "Enregistrement..."
                    : recensement
                        ? "Mettre à jour et passer au recensement"
                        : "Passer au recensement"}
            </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ETAPE 2

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="max-w-[1600px] mx-auto">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          "
        >

          <div>

            <h1
              className="
                text-2xl
                md:text-3xl
                font-bold
                text-haigana-dark
              "
            >
              Recensement du matériel
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              SOA{" "}
              <span className="font-semibold">
                {recensement?.codeSoa || codeSoa}
              </span>
              {" — "}
              Année{" "}
              <span className="font-semibold">
                {recensement?.annee || annee}
              </span>
            </p>

          </div>

          {/* BOUTON DE SUPPRESSION COMPLÈTE DU RECENSEMENT */}
          {hasRole("ADMINISTRATEUR") && recensement?.id && (
            <button
              type="button"
              disabled={saving}
              onClick={gererSuppressionRecensement}
              className="
                px-5
                py-2.5
                rounded-xl
                bg-red-600
                text-white
                font-semibold
                hover:bg-red-700
                transition
                disabled:opacity-50
                inline-flex
                items-center
                gap-2
                shadow-sm
              "
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
              </svg>
              Supprimer le recensement
            </button>
          )}

        </div>

        {/* MESSAGES */}

        {error && (
          <div
            className="
              mb-5
              p-4
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-xl
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              mb-5
              p-4
              bg-green-50
              border
              border-green-200
              text-green-700
              rounded-xl
            "
          >
            {success}
          </div>
        )}

        {/* INFORMATIONS */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            p-5
            mb-5
          "
        >

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-4
              gap-4
            "
          >

            <div>
              <p className="text-xs text-gray-400 uppercase">
                Recenseur
              </p>

              <p className="font-semibold text-haigana-dark mt-1">
                {recensement?.fonctionnaireRecenseurNom || "—"}
              </p>

              <p className="text-xs text-gray-500">
                {recensement?.fonctionnaireRecenseurQualite || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">
                Comptable
              </p>

              <p className="font-semibold text-haigana-dark mt-1">
                {recensement?.comptableNom || "—"}
              </p>

              <p className="text-xs text-gray-500">
                {recensement?.comptableQualite || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">
                Articles
              </p>

              <p className="font-semibold text-haigana-dark mt-1">
                {recensement?.nombreArticles ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">
                Valeur constatée
              </p>

              <p className="font-semibold text-haigana-dark mt-1">
                {formatMontant(
                  recensement?.totalValeurExistante
                )}{" "}
                Ar
              </p>
            </div>

          </div>

        </div>

        {/* PAGINATION NOMENCLATURE */}

        {groupesNomenclature.length > 0 && (
          <div
            className="
              bg-white
              rounded-2xl
              border
              border-gray-100
              shadow-sm
              px-5
              py-4
              mb-5
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <button
              type="button"
              disabled={
                pageNomenclature === 0
              }
              onClick={() =>
                setPageNomenclature(
                  (prev) =>
                    Math.max(prev - 1, 0)
                )
              }
              className="
                w-10
                h-10
                rounded-xl
                border
                border-gray-200
                text-gray-600
                font-semibold
                hover:bg-gray-50
                disabled:opacity-30
              "
            >
              ←
            </button>

            <div className="text-center">

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Nomenclature
              </p>

              <p
                className="
                  text-lg
                  font-bold
                  text-haigana-dark
                "
              >
                {nomenclatureActuelle?.numero}
                {" - "}
                {nomenclatureActuelle?.designation}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {pageNomenclature + 1}
                {" / "}
                {groupesNomenclature.length}
              </p>

            </div>

            <button
              type="button"
              disabled={
                pageNomenclature >=
                groupesNomenclature.length - 1
              }
              onClick={() =>
                setPageNomenclature(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      groupesNomenclature.length - 1
                    )
                )
              }
              className="
                w-10
                h-10
                rounded-xl
                border
                border-gray-200
                text-gray-600
                font-semibold
                hover:bg-gray-50
                disabled:opacity-30
              "
            >
              →
            </button>

          </div>
        )}

        {hasRole("ADMINISTRATEUR") && (
          <div className="flex flex-wrap gap-3 mb-5">

              {comparaison.nouveaux.length > 0 && (
                  <button
                      type="button"
                      onClick={() => setShowNouveauxModal(true)}
                      className="
                          px-5
                          py-2.5
                          rounded-xl
                          bg-blue-600
                          text-white
                          font-semibold
                          hover:bg-blue-700
                      "
                  >
                      Nouveaux matériels
                      {" "}
                      ({comparaison.nouveaux.length})
                  </button>
              )}

              {comparaison.modifies.length > 0 && (
                  <button
                      type="button"
                      onClick={() =>
                          setShowModificationsModal(true)
                      }
                      className="
                          px-5
                          py-2.5
                          rounded-xl
                          bg-orange-500
                          text-white
                          font-semibold
                          hover:bg-orange-600
                      "
                  >
                      Modifications
                      {" "}
                      ({comparaison.modifies.length})
                  </button>
              )}

              {comparaison.absents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAbsentsModal(true)}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    font-semibold
                    hover:bg-red-100
                  "
                >
                  Absents ({comparaison.absents.length})
                </button>
              )}
          </div>
        )}

        {/* TABLEAU */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead
                className="
                  bg-gray-50
                  border-b
                  border-gray-200
                  text-gray-500
                  font-bold
                  uppercase
                  text-xs
                "
              >

                <tr>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-left"
                  >
                    Nomenclature
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-left"
                  >
                    Espèce des unités
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-right"
                  >
                    Prix unitaire
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-center"
                  >
                    Existant
                    <br />
                    d'après écritures
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-center"
                  >
                    Constaté
                    <br />
                    par recensement
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-center"
                  >
                    Excédent
                    <br />
                    par article
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-center"
                  >
                    Déficit
                    <br />
                    par article
                  </th>

                  <th
                    colSpan="2"
                    className="
                      px-4
                      py-3
                      text-center
                      border-l
                      border-gray-200
                    "
                  >
                    Valeur des excédents
                  </th>

                  <th
                    colSpan="2"
                    className="
                      px-4
                      py-3
                      text-center
                      border-l
                      border-gray-200
                    "
                  >
                    Valeur des déficits
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-center"
                  >
                    Valeur
                    <br />
                    de l'article
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-left"
                  >
                    Observation
                  </th>

                  <th
                    rowSpan="2"
                    className="px-4 py-4 text-right"
                  >

                  </th>

                </tr>

                <tr>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                      border-l
                      border-gray-200
                    "
                  >
                    Par article
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Par nomenclature
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                      border-l
                      border-gray-200
                    "
                  >
                    Par article
                  </th>

                  <th
                    className="
                      px-4
                      py-3
                      text-center
                    "
                  >
                    Par nomenclature
                  </th>
                </tr>

              </thead>

              <tbody
                className="
                  divide-y
                  divide-gray-100
                "
              >
                {lignesNomenclature.length === 0 ? (

                  <tr>
                    <td
                      colSpan="14"
                      className="
                        px-6
                        py-14
                        text-center
                        text-gray-400
                      "
                    >
                      Aucun article dans cette nomenclature.
                    </td>
                  </tr>

                ) : (

                  lignesNomenclature.map((ligne) => {

                    const estAbsent =
                      materielsAbsents.has(ligne.id);

                    return (
                      <tr
                        key={ligne.id}
                        className="
                          hover:bg-gray-50/60
                          transition
                        "
                      >

                        {/* NOMENCLATURE */}

                        <td
                          className="
                            px-4
                            py-4
                            font-semibold
                            text-haigana-dark
                          "
                        >
                          <div className="flex items-center gap-2">

                            <span>
                              {ligne.nomenclatureNumero}
                              {" - "}
                              {ligne.nomenclatureDesignation}
                            </span>

                            {estAbsent && (
                              <span
                                className="
                                  inline-flex
                                  px-2
                                  py-1
                                  rounded-lg
                                  bg-red-50
                                  border
                                  border-red-200
                                  text-red-700
                                  text-[10px]
                                  font-bold
                                "
                              >
                                ABSENT
                              </span>
                            )}

                          </div>
                        </td>

                        {/* ESPECE */}

                        <td className="px-4 py-4">
                          {ligne.especeUnite || "—"}
                        </td>

                        {/* PRIX */}

                        <td className="px-4 py-4 text-right font-semibold">
                          {formatMontant(
                            ligne.prixUnitaire
                          )}{" "}
                          Ar
                        </td>

                        {/* EXISTANT */}

                        <td
                          className="
                            px-4
                            py-4
                            text-center
                            font-semibold
                          "
                        >
                          {ligne.existantEcriture ?? 0}
                        </td>

                        {/* CONSTATE */}

                        <td className="px-4 py-4">

                          {estAbsent ? (

                            <div
                              className="
                                text-center
                                font-bold
                                text-red-600
                              "
                            >
                              0
                            </div>

                          ) : (

                            <input
                              type="number"
                              min="0"
                              value={
                                ligne.constateRecensement ?? 0
                              }
                              onChange={(e) =>
                                modifierLigneLocalement(
                                  ligne.id,
                                  "constateRecensement",
                                  e.target.value
                                )
                              }
                              className="
                                w-24
                                mx-auto
                                block
                                px-3
                                py-2
                                rounded-lg
                                border
                                border-gray-200
                                text-center
                                outline-none
                                focus:border-haigana-blue
                                focus:ring-2
                                focus:ring-haigana-blue/20
                              "
                            />

                          )}

                        </td>

                        {/* EXCEDENT */}

                        <td
                          className={`
                            px-4
                            py-4
                            text-center
                            font-bold
                            ${
                              Number(
                                ligne.excedent || 0
                              ) > 0
                                ? "bg-green-50 text-green-700"
                                : "text-gray-400"
                            }
                          `}
                        >
                          {ligne.excedent ?? 0}
                        </td>

                        {/* DEFICIT */}

                        <td
                          className={`
                            px-4
                            py-4
                            text-center
                            font-bold
                            ${
                              Number(
                                ligne.deficit || 0
                              ) > 0
                                ? "bg-red-50 text-red-700"
                                : "text-gray-400"
                            }
                          `}
                        >
                          {ligne.deficit ?? 0}
                        </td>

                        {/* VALEUR EXCEDENT PAR ARTICLE */}

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-green-700
                          "
                        >
                          {formatMontant(
                            ligne.valeurExcedentArticle
                          )}{" "}
                          Ar
                        </td>

                        {/* VALEUR EXCEDENT PAR NOMENCLATURE */}

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-green-700
                          "
                        >
                          {ligne.id ===
                          lignesNomenclature[0]?.id
                            ? `${formatMontant(
                                totalNomenclature.valeurExcedent
                              )} Ar`
                            : "—"}
                        </td>

                        {/* VALEUR DEFICIT PAR ARTICLE */}

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-red-700
                          "
                        >
                          {formatMontant(
                            ligne.valeurDeficitArticle
                          )}{" "}
                          Ar
                        </td>

                        {/* VALEUR DEFICIT PAR NOMENCLATURE */}

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-red-700
                          "
                        >
                          {ligne.id ===
                          lignesNomenclature[0]?.id
                            ? `${formatMontant(
                                totalNomenclature.valeurDeficit
                              )} Ar`
                            : "—"}
                        </td>

                        {/* VALEUR ARTICLE */}

                        <td
                          className="
                            px-4
                            py-4
                            text-right
                            font-semibold
                            text-haigana-dark
                          "
                        >
                          {formatMontant(
                            ligne.valeurArticle
                          )}{" "}
                          Ar
                        </td>

                        {/* OBSERVATION */}

                        <td className="px-4 py-4">

                          <input
                            type="text"
                            value={
                              ligne.observation || ""
                            }

                            onChange={(e) =>
                              modifierLigneLocalement(
                                ligne.id,
                                "observation",
                                e.target.value
                              )
                            }
                            className="
                              w-full
                              min-w-[180px]
                              px-3
                              py-2
                              rounded-lg
                              border
                              border-gray-200
                              outline-none
                              focus:border-haigana-blue
                              focus:ring-2
                              focus:ring-haigana-blue/20
                              disabled:bg-gray-100
                            "
                          />

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4">

                          {hasRole("ADMINISTRATEUR") && (

                              <button
                                type="button"
                                onClick={() =>
                                  enregistrerLigne(ligne)
                                }
                                disabled={
                                  saving || estAbsent
                                }
                                className="
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-haigana-dark
                                  text-white
                                  text-xs
                                  font-semibold
                                  hover:bg-haigana-blue
                                  disabled:opacity-40
                                "
                              >
                                {saving
                                  ? "..."
                                  : "Enregistrer"}
                              </button>

                            )}

                        </td>

                      </tr>
                    );
                  })

                )}
              </tbody>

              {lignesNomenclature.length > 0 && (
                <tfoot>

                  <tr
                    className="
                      bg-gray-50
                      border-t-2
                      border-gray-200
                      font-bold
                    "
                  >

                    <td
                      colSpan="4"
                      className="
                        px-4
                        py-4
                        text-right
                        text-haigana-dark
                        uppercase
                        text-xs
                      "
                    >
                      Total nomenclature
                    </td>

                    <td className="px-4 py-4 text-center">
                      {totalNomenclature.constate}
                    </td>

                    <td className="px-4 py-4 text-center text-green-700">
                      {totalNomenclature.excedent}
                    </td>

                    <td className="px-4 py-4 text-center text-red-700">
                      {totalNomenclature.deficit}
                    </td>

                    <td
                      colSpan="2"
                      className="
                        px-4
                        py-4
                        text-right
                        text-green-700
                      "
                    >
                      {formatMontant(
                        totalNomenclature.valeurExcedent
                      )}{" "}
                      Ar
                    </td>

                    <td
                      colSpan="2"
                      className="
                        px-4
                        py-4
                        text-right
                        text-red-700
                      "
                    >
                      {formatMontant(
                        totalNomenclature.valeurDeficit
                      )}{" "}
                      Ar
                    </td>

                    <td
                      className="
                        px-4
                        py-4
                        text-right
                        text-haigana-dark
                      "
                    >
                      {formatMontant(
                        totalNomenclature.valeur
                      )}{" "}
                      Ar
                    </td>

                    <td colSpan="2"></td>

                  </tr>

                </tfoot>
              )}

            </table>

          </div>

        </div>

        {/* ACTIONS FINALES */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            justify-end
            gap-3
            mt-6
          "
        >

          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={saving}
            className="
              px-5
              py-2.5
              rounded-xl
              border
              border-gray-200
              text-gray-600
              font-semibold
              hover:bg-gray-50
              disabled:opacity-40
            "
          >
            Retour
          </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/patrimoine/materiel/recensement/${recensement.id}/document`,
                  {
                    state: {
                      recensement,
                    },
                  }
                )
              }
              className="
                px-6
                py-2.5
                rounded-xl
                bg-haigana-blue
                text-white
                font-semibold
              "
            >
              Voir le procès-verbal
          </button>

          <button
              type="button"
              onClick={() =>
                navigate("/quitus/materiel-document", {
                  state: {
                    recensement,
                    soaId,
                    codeSoa,
                    annee
                  }
                })
              }
              className="
                px-5
                py-2.5
                rounded-xl
                bg-haigana-blue
                text-white
                font-semibold
                hover:brightness-95
                transition
              "
            >
              Aller vers quitus
            </button>

        </div>

      </div>

      {showNouveauxModal && (
        <div className="
            fixed inset-0
            z-50
            bg-black/50
            flex items-center justify-center
            p-4
        ">

            <div className="
                bg-white
                rounded-2xl
                shadow-2xl
                w-full
                max-w-5xl
                max-h-[85vh]
                overflow-hidden
            ">

                <div className="
                    px-6
                    py-5
                    border-b
                    flex
                    justify-between
                    items-center
                ">
                    <div>
                        <h2 className="
                            text-xl
                            font-bold
                            text-haigana-dark
                        ">
                            Nouveaux matériels
                        </h2>

                        <p className="
                            text-sm
                            text-gray-500
                            mt-1
                        ">
                            Ces matériels sont présents dans
                            l'inventaire mais pas encore dans
                            le recensement.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setShowNouveauxModal(false)
                        }
                        className="
                            text-gray-500
                            text-xl
                        "
                    >
                        ×
                    </button>
                </div>

                <div className="
                    p-6
                    overflow-y-auto
                    max-h-[65vh]
                    space-y-4
                ">

                    {comparaison.nouveaux.map((materiel) => (

                        <div
                            key={materiel.materielId}
                            className="
                                border
                                border-blue-100
                                rounded-xl
                                p-4
                                bg-blue-50/50
                            "
                        >

                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-5
                                gap-4
                                items-center
                            ">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Nomenclature
                                    </p>

                                    <p className="font-semibold">
                                        {materiel.nomenclatureNumero}
                                        {" - "}
                                        {materiel.nomenclatureDesignation}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Matériel
                                    </p>

                                    <p className="font-semibold">
                                        {materiel.designation}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Espèce
                                    </p>

                                    <p>
                                        {materiel.especeUnite}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Prix unitaire
                                    </p>

                                    <p className="font-semibold">
                                        {formatMontant(
                                            materiel.prixUnitaire
                                        )}{" "}
                                        Ar
                                    </p>
                                </div>

                                <div className="text-right">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            ajouterNouveauMateriel(
                                                materiel.materielId
                                            )
                                        }
                                        className="
                                            px-4
                                            py-2
                                            rounded-lg
                                            bg-haigana-dark
                                            text-white
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Ajouter au recensement
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>
        </div>
    )}

    {showModificationsModal && (
    <div className="
        fixed inset-0
        z-50
        bg-black/50
        flex items-center justify-center
        p-4
    ">

        <div className="
            bg-white
            rounded-2xl
            shadow-2xl
            w-full
            max-w-6xl
            max-h-[90vh]
            overflow-hidden
        ">

            <div className="
                px-6
                py-5
                border-b
                flex
                justify-between
                items-center
            ">

                <div>
                    <h2 className="
                        text-xl
                        font-bold
                        text-haigana-dark
                    ">
                        Modifications détectées
                    </h2>

                    <p className="
                        text-sm
                        text-gray-500
                        mt-1
                    ">
                        Comparez les anciennes et nouvelles
                        valeurs avant de les appliquer.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowModificationsModal(false)
                    }
                    className="
                        text-gray-500
                        text-xl
                    "
                >
                    ×
                </button>

            </div>

            <div className="
                p-6
                overflow-y-auto
                max-h-[75vh]
                space-y-6
            ">

                {comparaison.modifies.map((modification) => (

                    <div
                        key={modification.ligneId}
                        className="
                            border
                            border-orange-100
                            rounded-2xl
                            overflow-hidden
                        "
                    >

                        <div className="
                            px-5
                            py-3
                            bg-orange-50
                            text-orange-700
                            font-semibold
                        ">
                            Matériel #{modification.materielId}
                        </div>

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                        ">

                            {/* AVANT */}

                            <div className="
                                p-5
                                border-b
                                md:border-b-0
                                md:border-r
                                border-gray-200
                            ">

                                <h3 className="
                                    font-bold
                                    text-gray-700
                                    mb-4
                                ">
                                    Anciennes valeurs
                                </h3>

                                <div className="space-y-3">

                                    <p>
                                        <span className="text-gray-500">
                                            Nomenclature :
                                        </span>{" "}
                                        <strong>
                                            {modification.ancien.nomenclatureNumero}
                                            {" - "}
                                            {modification.ancien.nomenclatureDesignation}
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Espèce :
                                        </span>{" "}
                                        <strong>
                                            {modification.ancien.especeUnite}
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Prix :
                                        </span>{" "}
                                        <strong>
                                            {formatMontant(
                                                modification.ancien.prixUnitaire
                                            )}{" "}
                                            Ar
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Existant :
                                        </span>{" "}
                                        <strong>
                                            {modification.ancien.existantEcriture}
                                        </strong>
                                    </p>

                                </div>

                            </div>

                            {/* APRES */}

                            <div className="
                                p-5
                                bg-orange-50/30
                            ">

                                <h3 className="
                                    font-bold
                                    text-orange-700
                                    mb-4
                                ">
                                    Nouvelles valeurs
                                </h3>

                                <div className="space-y-3">

                                    <p>
                                        <span className="text-gray-500">
                                            Nomenclature :
                                        </span>{" "}
                                        <strong>
                                            {modification.nouveau.nomenclatureNumero}
                                            {" - "}
                                            {modification.nouveau.nomenclatureDesignation}
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Matériel :
                                        </span>{" "}
                                        <strong>
                                            {modification.nouveau.designation}
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Espèce :
                                        </span>{" "}
                                        <strong>
                                            {modification.nouveau.especeUnite}
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Prix :
                                        </span>{" "}
                                        <strong>
                                            {formatMontant(
                                                modification.nouveau.prixUnitaire
                                            )}{" "}
                                            Ar
                                        </strong>
                                    </p>

                                    <p>
                                        <span className="text-gray-500">
                                            Existant :
                                        </span>{" "}
                                        <strong>
                                            {modification.nouveau.existantEcriture}
                                        </strong>
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="
                            px-5
                            py-4
                            border-t
                            flex
                            justify-end
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    appliquerModification(
                                        modification.ligneId
                                    )
                                }
                                className="
                                    px-5
                                    py-2.5
                                    rounded-xl
                                    bg-orange-500
                                    text-white
                                    font-semibold
                                "
                            >
                                Appliquer la modification
                            </button>

                              </div>

                          </div>

                      ))}

                  </div>

              </div>
          </div>
      )}

      {showAbsentsModal && (
        <div
          className="
            fixed inset-0
            z-50
            bg-black/50
            flex items-center justify-center
            p-4
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              w-full
              max-w-5xl
              max-h-[85vh]
              overflow-hidden
            "
          >

            {/* HEADER */}

            <div
              className="
                px-6
                py-5
                border-b
                flex
                justify-between
                items-center
              "
            >

              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-haigana-dark
                  "
                >
                  Matériels absents
                </h2>

                <p
                  className="
                    text-sm
                    text-gray-500
                    mt-1
                  "
                >
                  Ces matériels figurent dans le recensement
                  mais ne sont plus présents dans l'inventaire
                  de l'année {annee}.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAbsentsModal(false)
                }
                className="
                  text-gray-500
                  text-xl
                "
              >
                ×
              </button>

            </div>

            {/* CONTENU */}

            <div
              className="
                p-6
                overflow-y-auto
                max-h-[65vh]
                space-y-4
              "
            >

              {comparaison.absents.map((materiel) => (

                <div
                  key={materiel.ligneId}
                  className="
                    border
                    border-red-100
                    rounded-xl
                    p-4
                    bg-red-50/40
                  "
                >

                  <div
                    className="
                      grid
                      grid-cols-1
                      md:grid-cols-5
                      gap-4
                      items-center
                    "
                  >

                    <div>
                      <p className="text-xs text-gray-500">
                        Nomenclature
                      </p>

                      <p className="font-semibold">
                        {materiel.nomenclatureNumero}
                        {" - "}
                        {materiel.nomenclatureDesignation}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Espèce
                      </p>

                      <p className="font-semibold">
                        {materiel.especeUnite || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Existant
                      </p>

                      <p className="
                        font-bold
                        text-red-700
                      ">
                        {materiel.existantEcriture ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Prix unitaire
                      </p>

                      <p className="font-semibold">
                        {formatMontant(
                          materiel.prixUnitaire
                        )}{" "}
                        Ar
                      </p>
                    </div>

                    <div className="text-right">

                      <button
                        type="button"
                        onClick={() =>
                          supprimerMaterielAbsent(
                            materiel.ligneId
                          )
                        }
                        disabled={saving}
                        className="
                          px-4
                          py-2
                          rounded-lg
                          bg-red-600
                          text-white
                          text-sm
                          font-semibold
                          hover:bg-red-700
                          disabled:opacity-40
                        "
                      >
                        {saving
                          ? "Suppression..."
                          : "Supprimer"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}