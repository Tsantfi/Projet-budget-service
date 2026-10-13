import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// VEHICULE VIDE

const emptyVehicule = {
  id: null,

  // PRISE EN CHARGE
  typePriseEnCharge: "",
  ordreEntree: "",
  facture: "",
  pvEvaluation: "",

  // AFFECTATION
  nomPersonneSortie: "",
  cinPersonneSortie: "",
  serviceSortie: "",
  nomPersonneEntree: "",
  cinPersonneEntree: "",
  serviceEntree: "",

  immatricule: "",
  prixVehicule: "",
  dateCirculation: "",

  localiteTexte: "",
  localiteLatitude: "",
  localiteLongitude: "",

  lieuParcoursDepart: "",
  lieuParcoursArrivee: "",

  lieuAffectationActuel: "",

  // SAISIE MANUELLE
  genre: "",
  marque: "",
  type: "",

  categorie: "",
  carteGriseDisponible: "",

  // REFERENCES
  etatId: "",
  carburantId: "",

  // SAISIE MANUELLE DETENTEUR
  nomDetenteur: "",
  prenomDetenteur: "",
  immatriculeDetenteur: "",
  cinDetenteur: "",
  districtDetenteur: "",

  // SAISIE MANUELLE CHAUFFEUR
  nomChauffeur: "",
  immatriculeChauffeur: "",
  cinChauffeur: "",

  dateDepart: "",
  lieuAffectation: "",
  pieceJustificativeUrl: "",
};

// FORMULAIRE SOA VIDE

const emptyForm = {
  codeSoa: "",
  regionId: "",
  nomMinistere: "",
  districtMinistere: "",
  vehicules: [],
  materiels: [],
  logements: [],
};

// ==================================================
// COMPOSANT PRINCIPAL
// ==================================================

export default function SoaAdmin() {

  // SOA

  const [soaList, setSoaList] = useState([]);

  // REFERENCES

  const [regions, setRegions] = useState([]);
  const [etats, setEtats] = useState([]);
  const [carburants, setCarburants] = useState([]);

  // FORMULAIRE

  const [form, setForm] = useState(emptyForm);

  // RECHERCHE

  const [search, setSearch] = useState("");

  // MESSAGES

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CHARGEMENT

  const [submitting, setSubmitting] = useState(false);

  // MODIFICATION

  const [editingId, setEditingId] = useState(null);

  const { hasRole } = useAuth();

  const canModify = hasRole(
    "ADMINISTRATEUR",
    "MODIFICATEUR"
  );

  // DETAIL

  const [selectedSoa, setSelectedSoa] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  // LISTE DES IDS DU VEHICULE INITIAL AVANT SUPPRESSION

  const [originalVehiculeIds, setOriginalVehiculeIds] = useState([]);

  // SÉCURISÉ : Chargement adaptatif des compteurs immobiliers et mobiliers
  async function loadSoa() {
    try {
      setError("");
      const response = await client.get("/soa");
      const listeBrute = response.data;

      const listeAjustee = await Promise.all(
        listeBrute.map(async (soa) => {
          let mCount = 0;
          let lCount = 0;

          // Essai de chargement du compteur Matériels
          try {
            const resMat = await client.get(`/materiels/count/soa/${soa.id}`);
            mCount = Number(resMat.data) || 0;
          } catch {
            try {
              const resMatAlt = await client.get(`/api/materiels/count/soa/${soa.id}`);
              mCount = Number(resMatAlt.data) || 0;
            } catch { }
          }

          // Essai de chargement du compteur Logements
          try {
            const resLog = await client.get(`/logements/count/soa/${soa.id}`);
            lCount = Number(resLog.data) || 0;
          } catch {
            try {
              const resLogAlt = await client.get(`/api/logements/count/soa/${soa.id}`);
              lCount = Number(resLogAlt.data) || 0;
            } catch { }
          }

          return {
            ...soa,
            materielsCount: mCount,
            logementsCount: lCount
          };
        })
      );

      // Forcer le rafraîchissement d'état visuel du tableau
      setSoaList([...listeAjustee]);
    } catch (err) {
      console.error("Erreur globale de chargement des SOA :", err);
      setError("Impossible de charger les compteurs d'inventaires.");
    }
  }


  // CHARGEMENT DES REFERENCES

  async function loadReferences() {
    try {
      const [
        regionsRes,
        etatsRes,
        carburantsRes,
      ] = await Promise.all([
        client.get("/reference/regions"),
        client.get("/reference/etats"),
        client.get("/reference/carburants"),
      ]);

      setRegions(regionsRes.data);
      setEtats(etatsRes.data);
      setCarburants(carburantsRes.data);

    } catch (err) {
      console.error(
        "Erreur chargement références :",
        err
      );

      setError(
        "Impossible de charger les données de référence."
      );
    }
  }

  // CHARGEMENT INITIAL

  useEffect(() => {
    loadSoa();
    loadReferences();
  }, []);

  // MODIFICATION FORMULAIRE SOA

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // AJOUT VEHICULE

  function addVehicule() {
    setForm((current) => ({
      ...current,
      vehicules: [
        ...current.vehicules,
        {
          ...emptyVehicule,
        },
      ],
    }));
  }

  // MODIFICATION D'UN VEHICULE

  function setVehicule(index, field, value) {
    setForm((current) => ({
      ...current,
      vehicules: current.vehicules.map(
        (vehicule, i) =>
          i === index
            ? {
              ...vehicule,
              [field]: value,
            }
            : vehicule
      ),
    }));
  }

  // CONVERSION VEHICULE
  // IMPORTANT :

  function convertVehicule(v) {

    const genre =
      typeof v.genre === "object"
        ? v.genre?.genreVehicule
        : v.genre;

    const marque =
      typeof v.marque === "object"
        ? v.marque?.marqueVehicule
        : v.marque;

    const type =
      typeof v.type === "object"
        ? v.type?.typeDuVehicule
        : v.type;

    const payload = {

      // ID uniquement pour modification
      ...(v.id ? { id: v.id } : {}),

      // INFORMATIONS VEHICULE

      immatricule:
        v.immatricule
          ?.replace(/\s+/g, "")
          .trim()
          .toUpperCase() || "",

      prixVehicule:
        v.prixVehicule !== null &&
          v.prixVehicule !== undefined &&
          v.prixVehicule !== ""
          ? Number(v.prixVehicule)
          : null,

      dateCirculation:
        v.dateCirculation || null,

      // ==================================================
      // LOCALISATION
      // ==================================================

      localiteTexte:
        v.localiteTexte?.trim() || null,

      localiteLatitude:
        v.localiteLatitude !== null &&
          v.localiteLatitude !== undefined &&
          v.localiteLatitude !== ""
          ? Number(v.localiteLatitude)
          : null,

      localiteLongitude:
        v.localiteLongitude !== null &&
          v.localiteLongitude !== undefined &&
          v.localiteLongitude !== ""
          ? Number(v.localiteLongitude)
          : null,

      // ==================================================
      // PARCOURS
      // ==================================================

      lieuParcoursDepart:
        v.lieuParcoursDepart?.trim() || null,

      lieuParcoursArrivee:
        v.lieuParcoursArrivee?.trim() || null,

      // ==================================================
      // AFFECTATION
      // ==================================================

      lieuAffectationActuel:
        v.lieuAffectationActuel?.trim() || null,

      // ==================================================
      // GENRE / MARQUE / TYPE
      // ==================================================

      genre:
        typeof genre === "string"
          ? genre.trim() || null
          : null,

      marque:
        typeof marque === "string"
          ? marque.trim() || null
          : null,

      type:
        typeof type === "string"
          ? type.trim() || null
          : null,

      // ==================================================
      // REFERENCES
      // ==================================================

      etatId:
        v.etatId
          ? Number(v.etatId)
          : null,

      carburantId:
        v.carburantId
          ? Number(v.carburantId)
          : null,

      // DETENTEUR

      nomDetenteur:
        v.nomDetenteur?.trim() || null,

      prenomDetenteur:
        v.prenomDetenteur?.trim() || null,

      immatriculeDetenteur:
        v.immatriculeDetenteur
          ?.replace(/\s+/g, "")
          .trim()
          .toUpperCase() || null,

      cinDetenteur:
        v.cinDetenteur?.trim() || null,

      districtDetenteur:
        v.districtDetenteur?.trim() || null,

      // ==================================================
      // CHAUFFEUR
      // ==================================================

      nomChauffeur:
        v.nomChauffeur?.trim() || null,

      immatriculeChauffeur:
        v.immatriculeChauffeur
          ?.replace(/\s+/g, "")
          .trim()
          .toUpperCase() || null,

      cinChauffeur:
        v.cinChauffeur?.trim() || null,

      // ==================================================
      // PIECE JUSTIFICATIVE VEHICULE
      // ==================================================

      pieceJustificativeUrl:
        v.pieceJustificativeUrl?.trim() || null,

      categorie:
        v.categorie
          ? String(v.categorie).trim().toUpperCase()
          : null,

      carteGriseDisponible:
        v.carteGriseDisponible === true ||
          v.carteGriseDisponible === "true"
          ? true
          : v.carteGriseDisponible === false ||
            v.carteGriseDisponible === "false"
            ? false
            : null,

    };

    console.log(
      "Véhicule préparé :",
      payload
    );

    return payload;
  }

  // CREATION PAYLOAD SOA

  function createPayload() {
    return {
      codeSoa:
        form.codeSoa.trim(),

      regionId:
        form.regionId
          ? Number(form.regionId)
          : null,

      nomMinistere:
        form.nomMinistere.trim() || null,

      districtMinistere:
        form.districtMinistere.trim() || null,

      vehicules:
        form.vehicules.map(convertVehicule),
    };
  }

  // VALIDATION

  function validateForm() {

    if (!form.codeSoa.trim()) {
      throw new Error(
        "Le code SOA est obligatoire."
      );
    }

    if (!form.nomMinistere.trim()) {
      throw new Error(
        "Le nom du ministère est obligatoire."
      );
    }

    if (!form.districtMinistere.trim()) {
      throw new Error(
        "Le district du ministère est obligatoire."
      );
    }

    if (form.vehicules.length === 0) {
      throw new Error(
        "Ajoutez au moins un véhicule au code SOA."
      );
    }

    for (
      let i = 0;
      i < form.vehicules.length;
      i++
    ) {

      const vehicule =
        form.vehicules[i];

      if (!vehicule.categorie) {
        throw new Error(
          `La catégorie du véhicule ${i + 1} est obligatoire.`
        );
      }

      if (
        vehicule.carteGriseDisponible !== true &&
        vehicule.carteGriseDisponible !== false &&
        vehicule.carteGriseDisponible !== "true" &&
        vehicule.carteGriseDisponible !== "false"
      ) {
        throw new Error(
          `La disponibilité de la carte grise du véhicule ${i + 1} est obligatoire.`
        );
      }

      if (
        !vehicule.immatricule ||
        !vehicule.immatricule.trim()
      ) {
        throw new Error(
          `L'immatriculation du véhicule ${i + 1
          } est obligatoire.`
        );
      }

      // TYPE DE PRISE EN CHARGE
      if (!vehicule.typePriseEnCharge) {
        throw new Error(
          `Le type de prise en charge du véhicule ${i + 1} est obligatoire.`
        );
      }

      if (vehicule.typePriseEnCharge === "ACHAT") {
        if (!vehicule.ordreEntree?.trim()) {
          throw new Error(`L'ordre d'entrée du véhicule ${i + 1} est obligatoire.`);
        }
        if (!vehicule.facture?.trim()) {
          throw new Error(`La facture du véhicule ${i + 1} est obligatoire.`);
        }
      }

      if (vehicule.typePriseEnCharge === "DON") {
        if (!vehicule.ordreEntree?.trim()) {
          throw new Error(`L'ordre d'entrée du véhicule ${i + 1} est obligatoire.`);
        }
        if (!vehicule.facture?.trim()) {
          throw new Error(`La facture du véhicule ${i + 1} est obligatoire.`);
        }
        if (!vehicule.pvEvaluation?.trim()) {
          throw new Error(`Le PV d'évaluation du véhicule ${i + 1} est obligatoire.`);
        }
      }

      if (vehicule.typePriseEnCharge === "AFFECTATION") {
        const affectationFields = [
          ["nomPersonneSortie", "Le nom de la personne sortie"],
          ["cinPersonneSortie", "Le CIN de la personne sortie"],
          ["serviceSortie", "Le service de sortie"],
          ["nomPersonneEntree", "Le nom de la personne entrée"],
          ["cinPersonneEntree", "Le CIN de la personne entrée"],
          ["serviceEntree", "Le service d'entrée"],
        ];

        for (const [field, label] of affectationFields) {
          if (!vehicule[field]?.trim()) {
            throw new Error(`${label} du véhicule ${i + 1} est obligatoire.`);
          }
        }
      }
    }
  }

  // CREER ENTREE

  async function creerEntree(
    vehiculeId,
    vehiculeForm,
    codeSoa,
    index
  ) {

    if (!vehiculeId) {
      throw new Error(
        "Impossible de créer l'entrée : ID du véhicule manquant."
      );
    }

    const aujourdHui =
      new Date()
        .toISOString()
        .split("T")[0];

    const payload = {
      vehiculeId: vehiculeId,

      // Générés automatiquement
      reference:
        `PRISE-${codeSoa}-${index + 1}`,

      dateEntree:
        aujourdHui,

      // TYPE DE PRISE EN CHARGE
      type:
        vehiculeForm.typePriseEnCharge,

      ordreEntree:
        vehiculeForm.ordreEntree?.trim() || null,

      facture:
        vehiculeForm.facture?.trim() || null,

      pvEvaluation:
        vehiculeForm.pvEvaluation?.trim() || null,

      // AFFECTATION
      nomPersonneSortie:
        vehiculeForm.nomPersonneSortie?.trim() || null,

      cinPersonneSortie:
        vehiculeForm.cinPersonneSortie?.trim() || null,

      serviceSortie:
        vehiculeForm.serviceSortie?.trim() || null,

      nomPersonneEntree:
        vehiculeForm.nomPersonneEntree?.trim() || null,

      cinPersonneEntree:
        vehiculeForm.cinPersonneEntree?.trim() || null,

      serviceEntree:
        vehiculeForm.serviceEntree?.trim() || null,

    };

    console.log(
      "Création ENTREE :",
      payload
    );

    await client.post(
      "/entrees/prise-en-charge",
      payload
    );
  }

  // MODIFIER ENTREE : ADAPTATION SELON LE TYPE DE PRISE EN CHARGE

  async function modifierEntree(
    vehiculeId,
    vehiculeForm,
    codeSoa,
    index
  ) {
    if (!vehiculeId) return;

    try {
      // Chercher l'entrée existante
      const response = await client.get(`/entrees/vehicule/${vehiculeId}`);
      const entree = response.data;

      if (entree?.id) {
        // Initialisation par défaut
        let lieuAff = null;
        let dateDep = null;

        // CONDITION : On gère le lieu et la date UNIQUEMENT pour l'AFFECTATION
        if (vehiculeForm.typePriseEnCharge === "AFFECTATION") {
          lieuAff = vehiculeForm.lieuAffectation && String(vehiculeForm.lieuAffectation).trim() !== ""
            ? String(vehiculeForm.lieuAffectation).trim()
            : (vehiculeForm.localiteTexte ? String(vehiculeForm.localiteTexte).trim() : "Mahajanga"); // Secours

          dateDep = vehiculeForm.dateDepart && String(vehiculeForm.dateDepart).trim() !== ""
            ? String(vehiculeForm.dateDepart).trim()
            : new Date().toISOString().split("T")[0]; // Secours
        }

        // Envoi de la mise à jour au backend
        await client.put(
          `/entrees/${entree.id}`,
          {
            reference: entree.reference || null,
            dateEntree: entree.dateEntree || null,
            type: vehiculeForm.typePriseEnCharge,
            vehiculeId: vehiculeId,
            pieceJustificativeUrl: entree.pieceJustificativeUrl || null,

            // ACHAT / DON
            ordreEntree: vehiculeForm.ordreEntree ? String(vehiculeForm.ordreEntree).trim() : null,
            facture: vehiculeForm.facture ? String(vehiculeForm.facture).trim() : null,
            pvEvaluation: vehiculeForm.pvEvaluation ? String(vehiculeForm.pvEvaluation).trim() : null,

            // AFFECTATION (PERSONNES)
            nomPersonneSortie: vehiculeForm.nomPersonneSortie ? String(vehiculeForm.nomPersonneSortie).trim() : null,
            cinPersonneSortie: vehiculeForm.cinPersonneSortie ? String(vehiculeForm.cinPersonneSortie).trim() : null,
            serviceSortie: vehiculeForm.serviceSortie ? String(vehiculeForm.serviceSortie).trim() : null,
            nomPersonneEntree: vehiculeForm.nomPersonneEntree ? String(vehiculeForm.nomPersonneEntree).trim() : null,
            cinPersonneEntree: vehiculeForm.cinPersonneEntree ? String(vehiculeForm.cinPersonneEntree).trim() : null,
            serviceEntree: vehiculeForm.serviceEntree ? String(vehiculeForm.serviceEntree).trim() : null,

            // CHAMPS CONDITIONNELS
            dateDepart: dateDep,
            lieuAffectation: lieuAff
          }
        );

        console.log(`Entrée ID ${entree.id} synchronisée selon le type ${vehiculeForm.typePriseEnCharge}.`);

      } else {
        await creerEntree(vehiculeId, vehiculeForm, codeSoa, index);
      }

    } catch (err) {
      if (err.response?.status === 404) {
        await creerEntree(vehiculeId, vehiculeForm, codeSoa, index);
        return;
      }
      throw err;
    }
  }

  // RECUPERER LE SOA COMPLET APRES CREATION

  async function recupererSoaCree(
    response,
    codeSoa
  ) {

    // Si POST /soa retourne directement l'objet
    if (
      response?.data?.id &&
      response?.data?.vehicules
    ) {
      return response.data;
    }

    // Si POST /soa retourne seulement un ID
    if (response?.data?.id) {

      const detail =
        await client.get(
          `/soa/${response.data.id}`
        );

      return detail.data;
    }

    // Dernière solution :
    // rechercher le SOA dans la liste
    const liste =
      await client.get("/soa");

    const soaTrouve =
      liste.data.find(
        (s) =>
          s.codeSoa === codeSoa
      );

    if (!soaTrouve) {
      throw new Error(
        "Le SOA a été créé mais impossible de récupérer ses véhicules."
      );
    }

    const detail =
      await client.get(
        `/soa/${soaTrouve.id}`
      );

    return detail.data;
  }

  // CREATION / MODIFICATION

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {

      validateForm();

      const payload =
        createPayload();

      console.log(
        "Payload SOA envoyé au backend :",
        payload
      );

      // ==================================================
      // MODIFICATION SOA
      // ==================================================

      if (editingId) {

        const currentVehiculeIds = form.vehicules.map(v => v.id).filter(id => id !== null);
        const deletedVehiculeIds = originalVehiculeIds.filter(id => !currentVehiculeIds.includes(id));

        for (const idToDelete of deletedVehiculeIds) {
          try {
            // On appelle l'endpoint DELETE configuré dans VehiculeController.java
            await client.delete(`/vehicules/${idToDelete}`);
            console.log(`Véhicule orphelin ID ${idToDelete} supprimé avec succès.`);
          } catch (deleteError) {
            console.error(`Erreur lors de la suppression du véhicule orphelin ${idToDelete}:`, deleteError);
            // Optionnel : tu peux lever une erreur si la suppression échoue à cause de contraintes d'intégrité
          }
        }

        await client.put(
          `/soa/${editingId}`,
          payload
        );

        const detailResponse =
          await client.get(
            `/soa/${editingId}`
          );

        const soaModifie =
          detailResponse.data;

        for (
          let i = 0;
          i < form.vehicules.length;
          i++
        ) {

          const vehiculeForm =
            form.vehicules[i];

          /*
           * On cherche le véhicule par ID
           * lorsque celui-ci existe.
           */

          let vehiculeBackend =
            null;

          if (vehiculeForm.id) {

            vehiculeBackend =
              soaModifie.vehicules?.find(
                (v) =>
                  v.id === vehiculeForm.id
              );
          }

          /*
           * Pour un nouveau véhicule,
           * on cherche par immatriculation.
           */

          if (!vehiculeBackend) {

            const immatriculation =
              vehiculeForm.immatricule
                ?.replace(/\s+/g, "")
                .trim()
                .toUpperCase();

            vehiculeBackend =
              soaModifie.vehicules?.find(
                (v) =>
                  v.immatricule
                    ?.replace(/\s+/g, "")
                    .trim()
                    .toUpperCase() ===
                  immatriculation
              );
          }

          if (
            !vehiculeBackend?.id
          ) {
            console.warn(
              "Impossible de trouver l'ID du véhicule :",
              vehiculeForm
            );

            continue;
          }

          await modifierEntree(
            vehiculeBackend.id,
            vehiculeForm,
            form.codeSoa,
            i
          );
        }

        setSuccess(
          "Le code SOA, ses véhicules et les prises en charge ont été modifiés avec succès."
        );
      }

      // ==================================================
      // CREATION SOA
      // ==================================================

      else {

        const response =
          await client.post(
            "/soa",
            payload
          );

        console.log(
          "Réponse création SOA :",
          response.data
        );

        /*
         * Récupérer le SOA complet
         * avec les IDs des véhicules.
         */

        const soaCree =
          await recupererSoaCree(
            response,
            form.codeSoa.trim()
          );

        console.log(
          "SOA créé avec véhicules :",
          soaCree
        );

        /*
         * Création d'une Entree
         * pour chaque véhicule.
         */

        for (
          let i = 0;
          i < form.vehicules.length;
          i++
        ) {

          const vehiculeForm =
            form.vehicules[i];

          const vehiculeCree =
            soaCree.vehicules?.find(
              (v) =>
                v.immatricule
                  ?.replace(/\s+/g, "")
                  .trim()
                  .toUpperCase() ===
                vehiculeForm.immatricule
                  ?.replace(/\s+/g, "")
                  .trim()
                  .toUpperCase()
            );

          if (
            !vehiculeCree?.id
          ) {
            throw new Error(
              `Impossible de récupérer l'ID du véhicule ${i + 1} après création.`
            );
          }

          await creerEntree(
            vehiculeCree.id,
            vehiculeForm,
            form.codeSoa.trim(),
            i
          );
        }

        setSuccess(
          "Le code SOA, ses véhicules et leurs prises en charge ont été enregistrés avec succès."
        );
      }

      // ==================================================
      // RESET
      // ==================================================

      cancelEdit();
      await loadSoa();

    } catch (err) {

      console.error(
        "Erreur création/modification SOA :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de l'opération."
      );

    } finally {

      setSubmitting(false);
    }
  }

  // MODIFIER SOA

  async function handleEdit(soa) {

    try {

      setError("");
      setSuccess("");

      let data = soa;

      // ==================================================
      // CHARGEMENT DETAIL SOA
      // ==================================================

      try {


        const response =
          await client.get(
            `/soa/${soa.id}`
          );

        data = response.data;


      } catch (detailError) {

        console.warn(
          "Impossible de récupérer le détail du SOA, utilisation des données de la liste.",
          detailError
        );
      }

      // ==================================================
      // CHARGEMENT DES ENTREES
      // ==================================================

      const vehiculesAvecEntree =
        await Promise.all(
          (data.vehicules || []).map(
            async (v) => {

              let entree = null;

              try {

                const response =
                  await client.get(
                    `/entrees/vehicule/${v.id}`
                  );

                entree =
                  response.data;

              } catch (err) {

                if (
                  err.response?.status !== 404
                ) {
                  console.warn(
                    `Erreur chargement entrée du véhicule ${v.id}`,
                    err
                  );
                }
              }

              return {
                ...emptyVehicule,

                id:
                  v.id || null,

                immatricule:
                  v.immatricule || "",

                // PRISE EN CHARGE DEPUIS ENTREE

                typePriseEnCharge:
                  entree?.type || "",

                ordreEntree:
                  entree?.ordreEntree || "",

                facture:
                  entree?.facture || "",

                pvEvaluation:
                  entree?.pvEvaluation || "",

                nomPersonneSortie:
                  entree?.nomPersonneSortie || "",

                cinPersonneSortie:
                  entree?.cinPersonneSortie || "",

                serviceSortie:
                  entree?.serviceSortie || "",

                nomPersonneEntree:
                  entree?.nomPersonneEntree || "",

                cinPersonneEntree:
                  entree?.cinPersonneEntree || "",

                serviceEntree:
                  entree?.serviceEntree || "",


                // VEHICULE
                // ==================================================

                prixVehicule:
                  v.prixVehicule ?? "",

                dateCirculation:
                  v.dateCirculation || "",

                localiteTexte:
                  v.localiteTexte || "",

                localiteLatitude:
                  v.localiteLatitude ?? "",

                localiteLongitude:
                  v.localiteLongitude ?? "",

                lieuParcoursDepart:
                  v.lieuParcoursDepart || "",

                lieuParcoursArrivee:
                  v.lieuParcoursArrivee || "",

                lieuAffectationActuel:
                  v.lieuAffectationActuel || "",

                // GENRE

                genre:
                  typeof v.genre === "object"
                    ? v.genre?.genreVehicule || ""
                    : v.genre || "",

                // MARQUE

                marque:
                  typeof v.marque === "object"
                    ? v.marque?.marqueVehicule || ""
                    : v.marque || "",

                // TYPE

                type:
                  typeof v.type === "object"
                    ? v.type?.typeDuVehicule || ""
                    : v.type || "",

                categorie:
                  v.categorie
                    ? String(v.categorie).toUpperCase()
                    : "",

                carteGriseDisponible:
                  v.carteGriseDisponible === true
                    ? "true"
                    : v.carteGriseDisponible === false
                      ? "false"
                      : "",
                // REFERENCES
                etatId:
                  v.etat?.id
                    ? String(v.etat.id)
                    : v.etatId
                      ? String(v.etatId)
                      : "",

                carburantId:
                  v.carburant?.id
                    ? String(v.carburant.id)
                    : v.carburantId
                      ? String(v.carburantId)
                      : "",

                // DETENTEUR

                nomDetenteur:
                  v.detenteur?.nomDetenteur ||
                  v.nomDetenteur ||
                  "",

                prenomDetenteur:
                  v.detenteur?.prenomDetenteur ||
                  v.prenomDetenteur ||
                  "",

                immatriculeDetenteur:
                  v.detenteur?.immatriculeDetenteur ||
                  v.immatriculeDetenteur ||
                  "",

                cinDetenteur:
                  v.detenteur?.cinDetenteur ||
                  v.cinDetenteur ||
                  "",

                districtDetenteur:
                  v.detenteur?.districtDetenteur ||
                  v.districtDetenteur ||
                  "",

                // CHAUFFEUR

                nomChauffeur:
                  v.chauffeur?.nomChauffeur ||
                  v.nomChauffeur ||
                  "",

                immatriculeChauffeur:
                  v.chauffeur?.immatriculeChauffeur ||
                  v.immatriculeChauffeur ||
                  "",

                cinChauffeur:
                  v.chauffeur?.cinChauffeur ||
                  v.cinChauffeur ||
                  "",

                // PIECE JUSTIFICATIVE VEHICULE

                pieceJustificativeUrl:
                  v.pieceJustificativeUrl ||
                  "",
              };
            }
          )
        );

      const initialIds = (data.vehicules || []).map(v => v.id).filter(id => id !== null);
      setOriginalVehiculeIds(initialIds);

      // ID SOA

      setEditingId(
        data.id
      );

      // FORMULAIRE

      setForm({

        codeSoa:
          data.codeSoa || "",

        regionId:
          data.region?.id
            ? String(data.region.id)
            : data.regionId
              ? String(data.regionId)
              : "",

        nomMinistere:
          data.ministere?.nomMinistere ||
          data.nomMinistere ||
          "",

        districtMinistere:
          data.ministere?.districtMinistere ||
          data.districtMinistere ||
          "",

        vehicules:
          vehiculesAvecEntree,
      });

      // ==================================================
      // SCROLL FORMULAIRE
      // ==================================================

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (err) {

      console.error(
        "Erreur modification SOA :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de charger le SOA."
      );
    }
  }

  // ANNULER MODIFICATION

  function cancelEdit() {

    setEditingId(null);
    setOriginalVehiculeIds([]);
    setForm({
      ...emptyForm,
      vehicules: [],
    });
  }

  // DETAIL SOA

  async function handleDetail(soa) {

    try {

      setError("");

      const response =
        await client.get(
          `/soa/${soa.id}`
        );

      const data =
        response.data;

      // CHARGER LES ENTREES POUR LE DETAIL

      const vehiculesAvecEntree =
        await Promise.all(
          (data.vehicules || []).map(
            async (v) => {

              try {

                const entreeResponse =
                  await client.get(
                    `/entrees/vehicule/${v.id}`
                  );

                return {
                  ...v,
                  entree:
                    entreeResponse.data,
                };

              } catch (err) {

                return {
                  ...v,
                  entree: null,
                };
              }
            }
          )
        );

      setSelectedSoa({
        ...data,
        vehicules:
          vehiculesAvecEntree,
      });

      setShowDetail(true);

    } catch (err) {

      console.error(
        "Erreur détail SOA :",
        err
      );

      setSelectedSoa(soa);
      setShowDetail(true);
    }
  }

  // SUPPRIMER SOA

  async function handleDelete(soa) {

    const confirmation =
      window.confirm(
        `Voulez-vous vraiment supprimer le code SOA "${soa.codeSoa}" ?\n\nCette opération supprime tout ce qui est dans ce code ainsi que ses liaisons.`
      );

    if (!confirmation) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await client.delete(
        `/soa/${soa.id}`
      );

      setSuccess(
        `Le code SOA "${soa.codeSoa}" a été supprimé avec succès.`
      );

      // SI SOA EN MODIFICATION
      if (
        editingId === soa.id
      ) {
        cancelEdit();
      }

      // SI DETAIL OUVERT
      if (
        selectedSoa &&
        selectedSoa.id === soa.id
      ) {
        setSelectedSoa(null);
        setShowDetail(false);
      }

      await loadSoa();

    } catch (err) {

      console.error(
        "Erreur suppression SOA :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer ce code SOA."
      );
    }
  }

  // RECHERCHE

  const filtered =
    soaList.filter(
      (s) =>
        s.codeSoa
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // STYLES

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";


  // RENDER

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="mb-6">

        <div className="flex items-center justify-between">

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
                SOA
              </span>

            </div>

            <h1 className="text-2xl font-bold text-haigana-dark">
              Gestion des codes SOA
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Créez, consultez, modifiez et
              supprimez les codes SOA et leurs
              véhicules.
            </p>

          </div>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Annuler la modification
            </button>
          )}

        </div>

      </div>

      {/*FORMULAIRE*/}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-8 space-y-8 mb-8"
      >

        {/* TITRE FORMULAIRE */}

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-haigana-dark">
              {editingId
                ? "Modifier le code SOA"
                : "Nouveau code SOA"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {editingId
                ? "Modifiez les informations du code SOA et de ses véhicules."
                : "Créez un code SOA et ajoutez un ou plusieurs véhicules."}
            </p>

          </div>

          {editingId && (
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
              Mode modification
            </span>
          )}

        </div>

        {/*  INFORMATIONS SOA */}

        <div>

          <h2 className="text-lg font-semibold text-haigana-dark mb-4">
            Informations du code SOA
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* CODE SOA */}

            <div>

              <label className={labelClass}>
                Code SOA *
              </label>

              <input
                required
                value={form.codeSoa}
                onChange={(e) =>
                  set(
                    "codeSoa",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ex : SOA-BOENY-02"
              />

            </div>

            {/* REGION */}

            <div>

              <label className={labelClass}>
                Région
              </label>

              <select
                value={form.regionId}
                onChange={(e) =>
                  set(
                    "regionId",
                    e.target.value
                  )
                }
                className={inputClass}
              >

                <option value="">
                  Choisir...
                </option>

                {regions.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.nomRegion}
                  </option>
                ))}

              </select>

            </div>

            {/* MINISTERE */}

            <div>

              <label className="block text-sm font-medium mb-2">
                Nom du ministère
              </label>

              <input
                type="text"
                value={form.nomMinistere}
                required
                onChange={(e) =>
                  set(
                    "nomMinistere",
                    e.target.value
                  )
                }
                placeholder="Saisir le nom du ministère"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />

            </div>

            {/* DISTRICT */}

            <div>

              <label className="block text-sm font-medium mb-2">
                District
              </label>

              <input
                type="text"
                value={form.districtMinistere}
                onChange={(e) =>
                  set(
                    "districtMinistere",
                    e.target.value
                  )
                }
                placeholder="Saisir le district"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />

            </div>

          </div>

        </div>

        {/*  VEHICULES */}

        <div className="border-t border-gray-100 pt-6">

                    {/* EN-TÊTE DE SECTION VÉHICULES AVEC DROITS ADAPTATIFS */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-haigana-dark">
                Véhicules du code SOA
              </h2>
              <p className="text-sm text-gray-500">
                Ajoutez un ou plusieurs véhicules.
              </p>
            </div>

            <button
              type="button"
              onClick={addVehicule}
              disabled={!editingId && hasRole("MODIFICATEUR")}
              className="px-4 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-50"
            >
              {!editingId && hasRole("MODIFICATEUR") 
                ? "Admin seulement" 
                : "+ Ajouter un véhicule"}
            </button>
          </div>


          {/* AUCUN VEHICULE */}

          {form.vehicules.length === 0 && (

            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">

              Aucun véhicule ajouté.

              <br />

              <button
                type="button"
                onClick={addVehicule}
                className="mt-3 text-haigana-blue font-semibold hover:underline"
              >
                + Ajouter le premier véhicule
              </button>

            </div>

          )}

          {/* LISTE VEHICULES */}

          <div className="space-y-6">

            {form.vehicules.map(
              (vehicule, index) => (

                <div
                  key={
                    vehicule.id ||
                    `new-${index}`
                  }
                  className="border border-gray-200 rounded-2xl p-6 bg-gray-50"
                >

                  {/* EN-TETE VEHICULE */}

                  <div className="flex justify-between items-center mb-5">

                    <h3 className="font-semibold text-haigana-dark">
                      Véhicule {index + 1}
                    </h3>

                  </div>

                  {/* CHAMPS VEHICULE */}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* IMMATRICULATION */}

                    <div>

                      <label className={labelClass}>
                        Immatriculation *
                      </label>

                      <input
                        required
                        value={
                          vehicule.immatricule
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "immatricule",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : 1234 TBA"
                      />

                    </div>

                    {/* PRISE EN CHARGE */}

                    <div className="md:col-span-2 lg:col-span-3">

                      <h4 className="text-sm font-semibold text-haigana-dark mb-3">
                        Prise en charge du véhicule
                      </h4>

                    </div>

                    {/* TYPE DE PRISE EN CHARGE */}

                    <div className="md:col-span-2 lg:col-span-3">

                      <label className={labelClass}>
                        Type de prise en charge *
                      </label>

                      <select
                        required
                        value={vehicule.typePriseEnCharge || ""}
                        onChange={(e) =>
                          setVehicule(index, "typePriseEnCharge", e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">Choisir...</option>
                        <option value="ACHAT">Achat</option>
                        <option value="DON">Don</option>
                        <option value="AFFECTATION">Affectation</option>
                      </select>

                    </div>

                    {/* ACHAT */}

                    {(vehicule.typePriseEnCharge === "ACHAT" ||
                      vehicule.typePriseEnCharge === "DON") && (
                        <>
                          <div>
                            <label className={labelClass}>
                              Ordre d'entrée *
                            </label>
                            <input
                              type="text"
                              required
                              value={vehicule.ordreEntree || ""}
                              onChange={(e) =>
                                setVehicule(index, "ordreEntree", e.target.value)
                              }
                              className={inputClass}
                              placeholder="Référence de l'ordre d'entrée"
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Facture *
                            </label>
                            <input
                              type="text"
                              required
                              value={vehicule.facture || ""}
                              onChange={(e) =>
                                setVehicule(index, "facture", e.target.value)
                              }
                              className={inputClass}
                              placeholder="Référence de la facture"
                            />
                          </div>
                        </>
                      )}

                    {/* PV EVALUATION */}

                    {vehicule.typePriseEnCharge === "DON" && (
                      <div>
                        <label className={labelClass}>
                          PV d'évaluation *
                        </label>
                        <input
                          type="text"
                          required
                          value={vehicule.pvEvaluation || ""}
                          onChange={(e) =>
                            setVehicule(index, "pvEvaluation", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Référence du PV d'évaluation"
                        />
                      </div>
                    )}

                    {/* AFFECTATION */}

                    {vehicule.typePriseEnCharge === "AFFECTATION" && (
                      <>
                        <div className="md:col-span-2 lg:col-span-3">
                          <h5 className="text-sm font-semibold text-haigana-dark">
                            Personne sortie
                          </h5>
                        </div>

                        <div>
                          <label className={labelClass}>Nom *</label>
                          <input
                            required
                            value={vehicule.nomPersonneSortie || ""}
                            onChange={(e) => setVehicule(index, "nomPersonneSortie", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>CIN *</label>
                          <input
                            required
                            value={vehicule.cinPersonneSortie || ""}
                            onChange={(e) => setVehicule(index, "cinPersonneSortie", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Service *</label>
                          <input
                            required
                            value={vehicule.serviceSortie || ""}
                            onChange={(e) => setVehicule(index, "serviceSortie", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                          <h5 className="text-sm font-semibold text-haigana-dark">
                            Personne entrée
                          </h5>
                        </div>

                        <div>
                          <label className={labelClass}>Nom *</label>
                          <input
                            required
                            value={vehicule.nomPersonneEntree || ""}
                            onChange={(e) => setVehicule(index, "nomPersonneEntree", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>CIN *</label>
                          <input
                            required
                            value={vehicule.cinPersonneEntree || ""}
                            onChange={(e) => setVehicule(index, "cinPersonneEntree", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Service *</label>
                          <input
                            required
                            value={vehicule.serviceEntree || ""}
                            onChange={(e) => setVehicule(index, "serviceEntree", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </>
                    )}

                    {/* PRIX */}

                    <div>

                      <label className={labelClass}>
                        Prix du véhicule (Ar)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          vehicule.prixVehicule
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "prixVehicule",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </div>

                    {/* DATE */}

                    <div>

                      <label className={labelClass}>
                        Date de circulation
                      </label>

                      <input
                        type="date"
                        value={
                          vehicule.dateCirculation
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "dateCirculation",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />

                    </div>

                    {/* LOCALITE */}

                    <div>

                      <label className={labelClass}>
                        Localité
                      </label>

                      <input
                        value={
                          vehicule.localiteTexte
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "localiteTexte",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : Mahajanga"
                      />

                    </div>

                    {/* ETAT */}

                    <div>

                      <label className={labelClass}>
                        État
                      </label>

                      <select
                        value={
                          vehicule.etatId
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "etatId",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >

                        <option value="">
                          Choisir...
                        </option>

                        {etats.map((e) => (
                          <option
                            key={e.id}
                            value={e.id}
                          >
                            {e.etatVehicule}
                          </option>
                        ))}

                      </select>

                    </div>

                    {/* GENRE */}

                    <div>

                      <label className={labelClass}>
                        Genre
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.genre
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "genre",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : CTTE"
                      />

                    </div>

                    {/* MARQUE */}

                    <div>

                      <label className={labelClass}>
                        Marque
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.marque
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "marque",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : Toyota"
                      />

                    </div>
                    {/* CATÉGORIE */}

                    <div>
                      <label className={labelClass}>
                        Catégorie
                      </label>

                      <select
                        value={vehicule.categorie || ""}
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "categorie",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >
                        <option value="">
                          Sélectionner...
                        </option>

                        <option value="REPRESENTATION">
                          Représentation
                        </option>

                        <option value="FONCTION">
                          Fonction
                        </option>

                        <option value="SERVICE">
                          Service
                        </option>
                      </select>
                    </div>

                    {/* CARTE GRISE */}

                    <div>
                      <label className={labelClass}>
                        Disponibilité de la carte grise
                      </label>

                      <select
                        value={
                          vehicule.carteGriseDisponible === true ||
                            vehicule.carteGriseDisponible === "true"
                            ? "true"
                            : vehicule.carteGriseDisponible === false ||
                              vehicule.carteGriseDisponible === "false"
                              ? "false"
                              : ""
                        }
                        onChange={(e) =>
                          setVehicule(index, "carteGriseDisponible", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">
                          Sélectionner...
                        </option>

                        <option value="true">
                          Oui
                        </option>

                        <option value="false">
                          Non
                        </option>
                      </select>
                    </div>

                    {/* TYPE */}

                    <div>
                      <label className={labelClass}>
                        Type de véhicule
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.type
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : CTTE"
                      />

                    </div>
                    {/* CARBURANT */}

                    <div>

                      <label className={labelClass}>
                        Carburant
                      </label>

                      <select
                        value={
                          vehicule.carburantId
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "carburantId",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      >

                        <option value="">
                          Choisir...
                        </option>

                        {carburants.map(
                          (c) => (
                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.libelle}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* DETENTEUR */}

                    <div>

                      <label className={labelClass}>
                        Nom du détenteur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.nomDetenteur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "nomDetenteur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Nom du détenteur"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        Prénom du détenteur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.prenomDetenteur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "prenomDetenteur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Prénom du détenteur"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        Immatricule du détenteur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.immatriculeDetenteur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "immatriculeDetenteur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : DET-001"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        CIN du détenteur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.cinDetenteur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "cinDetenteur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="CIN du détenteur"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        District du détenteur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.districtDetenteur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "districtDetenteur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : Mahajanga I"
                      />

                    </div>

                    {/* CHAUFFEUR */}

                    <div>

                      <label className={labelClass}>
                        Nom du chauffeur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.nomChauffeur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "nomChauffeur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Nom du chauffeur"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        Immatricule du chauffeur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.immatriculeChauffeur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "immatriculeChauffeur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Ex : CHAUF-001"
                      />

                    </div>

                    <div>

                      <label className={labelClass}>
                        CIN du chauffeur
                      </label>

                      <input
                        type="text"
                        value={
                          vehicule.cinChauffeur
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "cinChauffeur",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="CIN du chauffeur"
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
                          vehicule.pieceJustificativeUrl
                        }
                        onChange={(e) =>
                          setVehicule(
                            index,
                            "pieceJustificativeUrl",
                            e.target.value
                          )
                        }
                        className={inputClass}
                        placeholder="Lien ou référence de la pièce justificative"
                      />

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/*  MESSAGES */}

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

        {/* BOUTONS */}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              form.vehicules.length === 0 ||
              (!editingId && hasRole("MODIFICATEUR"))
            }
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
          >
            {submitting
              ? editingId
                ? "Modification..."
                : "Enregistrement..."
              : !editingId && hasRole("MODIFICATEUR")
              ? "Ajout non autorisé"
              : editingId
                ? "Enregistrer les modifications"
                : `Enregistrer le SOA (${form.vehicules.length} véhicule${form.vehicules.length > 1 ? "s" : ""})`}
          </button>

        </div>

      </form>

      {/*RECHERCHE*/}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Rechercher un code SOA..."
      />

      {/*LISTE SOA*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-4">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">
              <tr>
                <th className="text-left px-4 py-3">Code SOA</th>
                <th className="text-left px-4 py-3">Région</th>
                <th className="text-left px-4 py-3">Ministère</th>
                <th className="text-center px-4 py-3">Véhicules</th>
                <th className="text-center px-4 py-3">Matériels</th>
                <th className="text-center px-4 py-3">Logements</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>


            <tbody>

              {filtered.map((s) => (

                <tr
                  key={s.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3 font-medium text-haigana-dark">
                    {s.codeSoa}
                  </td>

                  <td className="px-4 py-3">
                    {s.region?.nomRegion ||
                      "-"}
                  </td>

                  <td className="px-4 py-3">
                    {s.ministere?.nomMinistere ||
                      "-"}
                  </td>

                  <td className="px-4 py-3 text-center">

                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-haigana-blue/10 text-haigana-blue font-semibold">
                      {s.vehicules?.length ||
                        0}
                    </span>

                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-semibold">
                      {s.materielsCount || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-green-600/10 text-green-600 font-semibold">
                      {s.logementsCount || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center items-center gap-2">

                      {/* DETAIL */}

                      <button
                        type="button"
                        title="Voir le détail"
                        onClick={() =>
                          handleDetail(s)
                        }
                        className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition flex items-center justify-center"
                      >

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                        >

                          <path
                            d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />

                        </svg>

                      </button>

                      {/* MODIFIER */}
                      <button
                        type="button"
                        title="Modifier"
                        onClick={() => handleEdit(s)}
                        className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      {/* SUPPRIMER : Accessible uniquement pour le rôle administrateur principal */}
                      {hasRole("ADMINISTRATEUR") && (
                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => handleDelete(s)}
                          className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                            <path d="M10 10v6M14 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
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
                    Aucun code SOA enregistré.
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>

      {/*MODAL DETAIL*/}

      {showDetail &&
        selectedSoa && (

          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() =>
              setShowDetail(false)
            }
          >

            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-haigana-dark">
                    Détail du code SOA
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedSoa.codeSoa}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetail(false)
                  }
                  className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center"
                >

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >

                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                  </svg>

                </button>

              </div>

              {/* CONTENU */}

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">

                {/* INFORMATIONS SOA */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Code SOA
                    </p>

                    <p className="font-semibold text-haigana-dark">
                      {selectedSoa.codeSoa ||
                        "-"}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Région
                    </p>

                    <p className="font-semibold text-haigana-dark">
                      {selectedSoa.region
                        ?.nomRegion ||
                        "-"}
                    </p>

                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 mb-1">
                      Ministère
                    </p>

                    <p className="font-semibold text-haigana-dark">
                      {selectedSoa.ministere
                        ?.nomMinistere ||
                        "-"}
                    </p>

                  </div>

                </div>

                {/* VEHICULES */}

                <div>

                  <div className="flex items-center justify-between mb-4">

                    <h3 className="text-lg font-semibold text-haigana-dark">
                      Véhicules
                    </h3>

                    <span className="px-3 py-1 rounded-full bg-haigana-blue/10 text-haigana-blue text-sm font-semibold">
                      {
                        selectedSoa
                          .vehicules
                          ?.length || 0
                      }
                    </span>

                  </div>

                  {selectedSoa.vehicules
                    ?.length > 0 ? (

                    <div className="space-y-4">

                      {selectedSoa.vehicules.map(
                        (v, index) => (

                          <div
                            key={
                              v.id ||
                              index
                            }
                            className="border border-gray-200 rounded-xl p-5"
                          >

                            {/* HEADER VEHICULE */}

                            <div className="flex items-center justify-between mb-4">

                              <h4 className="font-semibold text-haigana-dark">
                                Véhicule{" "}
                                {index + 1}
                              </h4>

                              <span className="font-semibold text-haigana-blue">
                                {v.immatricule ||
                                  "-"}
                              </span>

                            </div>

                            {/* DETAILS */}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

                              <DetailItem
                                label="Immatriculation"
                                value={
                                  v.immatricule
                                }
                              />

                              <DetailItem
                                label="Prix"
                                value={
                                  v.prixVehicule !==
                                    null &&
                                    v.prixVehicule !==
                                    undefined
                                    ? `${Number(
                                      v.prixVehicule
                                    ).toLocaleString(
                                      "fr-FR"
                                    )} Ar`
                                    : "-"
                                }
                              />

                              <DetailItem
                                label="Date de circulation"
                                value={
                                  v.dateCirculation
                                }
                              />

                              <DetailItem
                                label="Genre"
                                value={
                                  v.genre
                                    ?.genreVehicule ||
                                  v.genre
                                }
                              />

                              <DetailItem
                                label="Marque"
                                value={
                                  v.marque
                                    ?.marqueVehicule ||
                                  v.marque
                                }
                              />

                              <DetailItem
                                label="Type"
                                value={
                                  v.type
                                    ?.typeDuVehicule ||
                                  v.type
                                }
                              />

                              <DetailItem
                                label="État"
                                value={
                                  v.etat
                                    ?.etatVehicule
                                }
                              />

                              <DetailItem
                                label="Carburant"
                                value={
                                  v.carburant
                                    ?.libelle
                                }
                              />

                              <DetailItem
                                label="Détenteur"
                                value={
                                  v.detenteur
                                    ? `${v.detenteur.nomDetenteur || ""} ${v.detenteur.prenomDetenteur || ""}`.trim()
                                    : "-"
                                }
                              />

                              <DetailItem
                                label="Chauffeur"
                                value={
                                  v.chauffeur
                                    ? `${v.chauffeur.nomChauffeur || ""}${v.chauffeur
                                      .immatriculeChauffeur
                                      ? ` — ${v.chauffeur.immatriculeChauffeur}`
                                      : ""
                                    }`
                                    : "-"
                                }
                              />

                              {/* PRISE EN CHARGE */}

                              <DetailItem
                                label="Type de prise en charge"
                                value={v.entree?.type}
                              />

                              {(v.entree?.type === "ACHAT" ||
                                v.entree?.type === "DON") && (
                                  <>
                                    <DetailItem
                                      label="Ordre d'entrée"
                                      value={v.entree?.ordreEntree}
                                    />
                                    <DetailItem
                                      label="Facture"
                                      value={v.entree?.facture}
                                    />
                                  </>
                                )}

                              {v.entree?.type === "DON" && (
                                <DetailItem
                                  label="PV d'évaluation"
                                  value={v.entree?.pvEvaluation}
                                />
                              )}

                              {v.entree?.type === "AFFECTATION" && (
                                <>
                                  <DetailItem
                                    label="Personne sortie"
                                    value={v.entree?.nomPersonneSortie}
                                  />
                                  <DetailItem
                                    label="CIN sortie"
                                    value={v.entree?.cinPersonneSortie}
                                  />
                                  <DetailItem
                                    label="Service sortie"
                                    value={v.entree?.serviceSortie}
                                  />
                                  <DetailItem
                                    label="Personne entrée"
                                    value={v.entree?.nomPersonneEntree}
                                  />
                                  <DetailItem
                                    label="CIN entrée"
                                    value={v.entree?.cinPersonneEntree}
                                  />
                                  <DetailItem
                                    label="Service entrée"
                                    value={v.entree?.serviceEntree}
                                  />
                                </>
                              )}

                              {/* PIECE JUSTIFICATIVE */}

                              <DetailItem
                                label="Pièce justificative"
                                value={
                                  v.pieceJustificativeUrl
                                }
                              />

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                      Aucun véhicule associé à ce code SOA.
                    </div>

                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowDetail(false);
                    handleEdit(
                      selectedSoa
                    );
                  }}
                  className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition"
                >
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetail(false)
                  }
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Fermer
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

// DETAIL ITEM

function DetailItem({
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-medium text-gray-800 break-words">
        {value || "-"}
      </p>

    </div>
  );
}