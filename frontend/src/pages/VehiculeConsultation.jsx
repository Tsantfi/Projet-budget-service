import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function VehiculeConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicule, setVehicule] = useState(null);
  const [entree, setEntree] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [etats, setEtats] = useState([]);

  // MODE MODIFICATION
  const [modeModification, setModeModification] = useState(false);

  // FORMULAIRE

  const [form, setForm] = useState({
    immatricule: "",
    prixVehicule: "",
    dateCirculation: "",

    localiteTexte: "",
    localiteLatitude: "",
    localiteLongitude: "",

    lieuAffectation: "",
    dateDepart: "",

    genre: "",
    marque: "",
    type: "",

    etatId: "",
    carburantId: "",
    soaId: "",
    ministereId: "",

    categorie: "",
    carteGriseDisponible: "",

    // DETENTEUR
    nomDetenteur: "",
    prenomDetenteur: "",
    immatriculeDetenteur: "",
    cinDetenteur: "",
    districtDetenteur: "",

    // CHAUFFEUR
    nomChauffeur: "",
    immatriculeChauffeur: "",
    cinChauffeur: "",

    // VEHICULE
    pieceJustificativeUrl: "",

    // ENTREE / PRISE EN CHARGE
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
  });

  //Chargement d'etats
  useEffect(() => {
  const chargerEtats = async () => {
    try {
      const response = await client.get("/reference/etats");
      setEtats(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des états :", error);
      setEtats([]);
    }
  };

    chargerEtats();
  }, []);

  // CHARGEMENT DU VEHICULE ET DE L'ENTREE

  useEffect(() => {
    async function loadVehicule() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        // --------------------------------------------------------
        // 1. VEHICULE
        // --------------------------------------------------------

        const resVehicule = await client.get(`/vehicules/${id}`);

        console.log(
          "Véhicule reçu :",
          resVehicule.data
        );

        const vehiculeData = resVehicule.data;

        setVehicule(vehiculeData);

        // --------------------------------------------------------
        // 2. ENTREE LIEE AU VEHICULE
        // --------------------------------------------------------

        let entreeData = null;

        try {
          const resEntree = await client.get(
            `/entrees/vehicule/${id}`
          );

          console.log(
            "Entrée reçue :",
            resEntree.data
          );

          entreeData = resEntree.data;

          setEntree(entreeData);

        } catch (errEntree) {
          console.warn(
            "Aucune entrée trouvée ou erreur sur l'entrée :",
            errEntree
          );

          setEntree(null);
        }

        // --------------------------------------------------------
        // 3. REMPLISSAGE DU FORMULAIRE
        // --------------------------------------------------------

        remplirFormulaire(
          vehiculeData,
          entreeData
        );

      } catch (err) {
        console.error(
          "=== ERREUR CONSULTATION VEHICULE ==="
        );

        console.error(
          "Status :",
          err.response?.status
        );

        console.error(
          "Data :",
          err.response?.data
        );

        console.error(
          "Erreur :",
          err
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Impossible de charger le véhicule."
        );

      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVehicule();
    }
  }, [id]);

  // REMPLIR LE FORMULAIRE

  function remplirFormulaire(v, e) {
    setForm({
      // VEHICULE

      immatricule:
        v?.immatricule || "",

      prixVehicule:
        v?.prixVehicule !== null &&
        v?.prixVehicule !== undefined
          ? v.prixVehicule
          : "",

      dateCirculation:
        v?.dateCirculation || "",

      // LOCALITE

      localiteTexte:
        v?.localiteTexte || "",

      localiteLatitude:
        v?.localiteLatitude !== null &&
        v?.localiteLatitude !== undefined
          ? v.localiteLatitude
          : "",

      localiteLongitude:
        v?.localiteLongitude !== null &&
        v?.localiteLongitude !== undefined
          ? v.localiteLongitude
          : "",

      // REFERENCES

      genre:
        v?.genre?.genreVehicule || "",

      marque:
        v?.marque?.marqueVehicule || "",

      type:
        v?.type?.typeDuVehicule || "",

      etatId:
        v?.etat?.id || "",

      carburantId:
        v?.carburant?.id || "",

      soaId:
        v?.codeSoa?.id || "",

      ministereId:
        v?.ministere?.id || "",

      categorie:
        v?.categorie || "",

      carteGriseDisponible:
        v?.carteGriseDisponible === true
          ? "Oui"
          : v?.carteGriseDisponible === false
            ? "Non"
            : "",

      // DETENTEUR

      nomDetenteur:
        v?.detenteur?.nomDetenteur || "",

      prenomDetenteur:
        v?.detenteur?.prenomDetenteur || "",

      immatriculeDetenteur:
        v?.detenteur?.immatriculeDetenteur || "",

      cinDetenteur:
        v?.detenteur?.cinDetenteur || "",

      districtDetenteur:
        v?.detenteur?.districtDetenteur || "",

      // CHAUFFEUR

      nomChauffeur:
        v?.chauffeur?.nomChauffeur || "",

      immatriculeChauffeur:
        v?.chauffeur?.immatriculeChauffeur || "",

      cinChauffeur:
        v?.chauffeur?.cinChauffeur || "",

      // PIECE VEHICULE

      pieceJustificativeUrl:
        v?.pieceJustificativeUrl || "",

      // PRISE EN CHARGE / ENTREE

      typePriseEnCharge:
        e?.type || "",

      ordreEntree:
        e?.ordreEntree || "",

      facture:
        e?.facture || "",

      pvEvaluation:
        e?.pvEvaluation || "",

      nomPersonneSortie:
        e?.nomPersonneSortie || "",

      cinPersonneSortie:
        e?.cinPersonneSortie || "",

      serviceSortie:
        e?.serviceSortie || "",

      nomPersonneEntree:
        e?.nomPersonneEntree || "",

      cinPersonneEntree:
        e?.cinPersonneEntree || "",

      serviceEntree:
        e?.serviceEntree || "",

      dateDepart: e?.dateDepart || "",

      lieuAffectation: e?.lieuAffectation || "",
    });
  }

  // MODIFICATION DU FORMULAIRE

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "localiteTexte" ? { lieuAffectationActuel: value } : {}),
    }));
  }

  // ANNULER LA MODIFICATION

  function annulerModification() {
    if (vehicule) {
      remplirFormulaire(
        vehicule,
        entree
      );
    }

    setModeModification(false);
    setError("");
    setSuccess("");
  }

  // ENREGISTRER LES MODIFICATIONS

  async function enregistrerModifications() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // VALIDATIONS VEHICULE

      if (!form.immatricule.trim()) {
        setError(
          "L'immatriculation est obligatoire."
        );
        return;
      }

      if (!form.genre.trim()) {
        setError(
          "Le genre est obligatoire."
        );
        return;
      }

      if (!form.marque.trim()) {
        setError(
          "La marque est obligatoire."
        );
        return;
      }

      if (!form.type.trim()) {
        setError(
          "Le type de véhicule est obligatoire."
        );
        return;
      }

      // VALIDATIONS DETENTEUR

      if (!form.nomDetenteur.trim()) {
        setError(
          "Le nom du détenteur est obligatoire."
        );
        return;
      }

      if (!form.prenomDetenteur.trim()) {
        setError(
          "Le prénom du détenteur est obligatoire."
        );
        return;
      }

      if (!form.immatriculeDetenteur.trim()) {
        setError(
          "Le matricule du détenteur est obligatoire."
        );
        return;
      }

      if (!form.cinDetenteur.trim()) {
        setError(
          "Le CIN du détenteur est obligatoire."
        );
        return;
      }

      if (!form.districtDetenteur.trim()) {
        setError(
          "Le district du détenteur est obligatoire."
        );
        return;
      }

      // VALIDATIONS CHAUFFEUR

      if (!form.nomChauffeur.trim()) {
        setError(
          "Le nom du chauffeur est obligatoire."
        );
        return;
      }

      if (!form.immatriculeChauffeur.trim()) {
        setError(
          "Le matricule du chauffeur est obligatoire."
        );
        return;
      }

      if (!form.cinChauffeur.trim()) {
        setError(
          "Le CIN du chauffeur est obligatoire."
        );
        return;
      }

      // PAYLOAD VEHICULE

      const payloadVehicule = {
        immatricule:
          form.immatricule.trim(),

        prixVehicule:
          form.prixVehicule !== ""
            ? Number(form.prixVehicule)
            : null,

        dateCirculation:
          form.dateCirculation || null,

        localiteTexte:
          form.localiteTexte.trim() || null,

        localiteLatitude:
          form.localiteLatitude !== ""
            ? Number(form.localiteLatitude)
            : null,

        localiteLongitude:
          form.localiteLongitude !== ""
            ? Number(form.localiteLongitude)
            : null,

        lieuParcoursDepart: null,

        lieuParcoursArrivee: null,

        lieuAffectationActuel:
          form.localiteTexte.trim() || "Non spécifié",

        // REFERENCES
        genre:
          form.genre.trim(),

        marque:
          form.marque.trim(),

        type:
          form.type.trim(),

        etatId:
          form.etatId
            ? Number(form.etatId)
            : null,

        carburantId:
          form.carburantId
            ? Number(form.carburantId)
            : null,

        soaId:
          form.soaId
            ? Number(form.soaId)
            : null,

        ministereId:
          form.ministereId
            ? Number(form.ministereId)
            : null,

        // --------------------------------------------------------
        // DETENTEUR
        // --------------------------------------------------------

        nomDetenteur:
          form.nomDetenteur.trim(),

        prenomDetenteur:
          form.prenomDetenteur.trim(),

        immatriculeDetenteur:
          form.immatriculeDetenteur.trim(),

        cinDetenteur:
          form.cinDetenteur.trim(),

        districtDetenteur:
          form.districtDetenteur.trim(),

        // --------------------------------------------------------
        // CHAUFFEUR
        // --------------------------------------------------------

        nomChauffeur:
          form.nomChauffeur.trim(),

        immatriculeChauffeur:
          form.immatriculeChauffeur.trim(),

        cinChauffeur:
          form.cinChauffeur.trim(),

        categorie:
          form.categorie || null,

        carteGriseDisponible:
          form.carteGriseDisponible === "Oui"
            ? true
            : form.carteGriseDisponible === "Non"
              ? false
              : null,

        // --------------------------------------------------------
        // PIECE VEHICULE
        // --------------------------------------------------------

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() ||
          null,
      };

      console.log(
        "Modification véhicule :",
        payloadVehicule
      );


      // 1. MODIFICATION VEHICULE

      const resVehicule =
        await client.put(
          `/vehicules/${id}`,
          payloadVehicule
        );

      const vehiculeMisAJour =
        resVehicule.data;

      // 2. MODIFICATION ENTREE

      let entreeMiseAJour = entree;

      if (entree && entree.id) {

        const typePriseEnCharge =
          form.typePriseEnCharge.trim().toUpperCase();

        if (!typePriseEnCharge) {
          setError(
            "Le type de prise en charge est obligatoire."
          );
          return;
        }

        if (!["ACHAT", "DON", "AFFECTATION"].includes(typePriseEnCharge)) {
          setError(
            "Le type de prise en charge est invalide."
          );
          return;
        }

        // ----------------------------------------------------
        // VALIDATION DES PIECES
        // ----------------------------------------------------

        if (typePriseEnCharge === "ACHAT") {
          if (!form.ordreEntree.trim()) {
            setError(
              "L'ordre d'entrée est obligatoire pour un achat."
            );
            return;
          }

          if (!form.facture.trim()) {
            setError(
              "La facture est obligatoire pour un achat."
            );
            return;
          }
        }

        if (typePriseEnCharge === "DON") {
          if (!form.ordreEntree.trim()) {
            setError(
              "L'ordre d'entrée est obligatoire pour un don."
            );
            return;
          }

          if (!form.facture.trim()) {
            setError(
              "La facture est obligatoire pour un don."
            );
            return;
          }

          if (!form.pvEvaluation.trim()) {
            setError(
              "Le PV d'évaluation est obligatoire pour un don."
            );
            return;
          }
        }

        if (typePriseEnCharge === "AFFECTATION") {
          const champsAffectation = [
            [form.nomPersonneSortie, "Le nom de la personne qui fait l'ordre de sortie"],
            [form.cinPersonneSortie, "La CIN de la personne qui fait l'ordre de sortie"],
            [form.serviceSortie, "Le service qui fait l'ordre de sortie"],
            [form.nomPersonneEntree, "Le nom de la personne qui fait l'ordre d'entrée"],
            [form.cinPersonneEntree, "La CIN de la personne qui fait l'ordre d'entrée"],
            [form.serviceEntree, "Le service qui fait l'ordre d'entrée"],
          ];

          const champVide = champsAffectation.find(
            ([valeur]) => !valeur?.trim()
          );

          if (champVide) {
            setError(`${champVide[1]} est obligatoire.`);
            return;
          }
        }

        const payloadEntree = {
          reference:
            entree.reference || null,

          dateEntree:
            entree.dateEntree || null,

          type: typePriseEnCharge,

          vehiculeId: Number(id),

          pieceJustificativeUrl:
            entree.pieceJustificativeUrl || null,

          // ACHAT / DON
          ordreEntree:
            form.ordreEntree.trim() || null,

          facture:
            form.facture.trim() || null,

          pvEvaluation:
            form.pvEvaluation.trim() || null,

          // AFFECTATION
          nomPersonneSortie:
            form.nomPersonneSortie.trim() || null,

          cinPersonneSortie:
            form.cinPersonneSortie.trim() || null,

          serviceSortie:
            form.serviceSortie.trim() || null,

          nomPersonneEntree:
            form.nomPersonneEntree.trim() || null,

          cinPersonneEntree:
            form.cinPersonneEntree.trim() || null,

          serviceEntree:
            form.serviceEntree.trim() || null,

          dateDepart: form.dateDepart.trim() || null,

          lieuAffectation: form.lieuAffectation.trim()
        };

        console.log(
          "Modification entrée :",
          payloadEntree
        );

        const resEntree =
          await client.put(
            `/entrees/${entree.id}`,
            payloadEntree
          );

        entreeMiseAJour =
          resEntree.data;
      }

      // 3. MISE A JOUR ETAT REACT

      setVehicule(
        vehiculeMisAJour
      );

      setEntree(
        entreeMiseAJour
      );

      remplirFormulaire(
        vehiculeMisAJour,
        entreeMiseAJour
      );

      setModeModification(false);

      setSuccess(
        "Les informations du véhicule et de l'entrée ont été mises à jour avec succès."
      );

    } catch (err) {

      console.error(
        "=== ERREUR MODIFICATION ==="
      );

      console.error(
        "Status :",
        err.response?.status
      );

      console.error(
        "Data :",
        err.response?.data
      );

      console.error(
        "Erreur :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de faire la mise à jour."
      );

    } finally {
      setSaving(false);
    }
  }

  // RETOUR VEHICULES SOA

  function retournerVersVehicules() {

    const codeSoa =
      vehicule?.codeSoa?.codeSoa ||
      vehicule?.codeSoa?.code ||
      "";

    navigate(
      "/patrimoine/vehicule",
      {
        state: {
          retourSoa: {
            codeSoa,
          },
        },
      }
    );
  }

  // ALLER VERS SITUATION

  function allerVersSituation() {

    navigate(
      `/patrimoine/vehicule/${id}/situation`
    );
  }

  // DONNEES AFFICHAGE

  const detenteur =
    vehicule?.detenteur || null;

  const chauffeur =
    vehicule?.chauffeur || null;

  const detenteurNom = detenteur
    ? `${detenteur.nomDetenteur || ""} ${
        detenteur.prenomDetenteur || ""
      }`.trim()
    : "-";

  // CHARGEMENT

  

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-8
            text-center
            text-gray-400
          "
        >
          Chargement du véhicule...
        </div>

      </div>
    );
  }

  // ERREUR CHARGEMENT

  if (error && !vehicule) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div
          className="
            bg-red-50
            border
            border-red-100
            text-red-600
            rounded-xl
            p-5
          "
        >
          {error ||
            "Véhicule introuvable."}
        </div>

        <div className="mt-5">

          <button
            type="button"
            onClick={
              retournerVersVehicules
            }
            className="
              inline-flex
              px-5
              py-2.5
              rounded-lg
              bg-haigana-dark
              text-white
              font-semibold
              hover:bg-haigana-blue
              transition-colors
            "
          >
            Retour
          </button>

        </div>

      </div>
    );
  }
  

  // AFFICHAGE PRINCIPAL

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/*EN-TETE*/}

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
              font-bold
              text-haigana-dark
            "
          >
            Caneva de recensement
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Informations détaillées du véhicule
          </p>

        </div>

        <div
          className="
            text-sm
            text-gray-500
          "
        >

          Immatricule :

          <span
            className="
              ml-1
              font-semibold
              text-haigana-dark
            "
          >
            {vehicule?.immatricule ||
              "-"}
          </span>

        </div>

      </div>

      {/*MESSAGES*/}

      {error && (
        <div
          className="
            mb-6
            bg-red-50
            border
            border-red-100
            text-red-600
            rounded-xl
            p-4
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="
            mb-6
            bg-green-50
            border
            border-green-100
            text-green-600
            rounded-xl
            p-4
          "
        >
          {success}
        </div>
      )}

      {/*PRISE EN CHARGE*/}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
          mb-6
        "
      >

        <div
          className="
            px-5
            py-4
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
            Prise en charge
          </h2>
        </div>

        <div className="p-5 space-y-4">

          {/* TYPE */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label
              htmlFor="typePriseEnCharge"
              className="block text-xs text-gray-500 mb-1 font-normal"
            >
              Type de prise en charge
            </label>

            {modeModification ? (
              <select
                id="typePriseEnCharge"
                name="typePriseEnCharge"
                value={form.typePriseEnCharge}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    typePriseEnCharge: value,
                    ...(value === "ACHAT"
                      ? {
                          pvEvaluation: "",
                          nomPersonneSortie: "",
                          cinPersonneSortie: "",
                          serviceSortie: "",
                          nomPersonneEntree: "",
                          cinPersonneEntree: "",
                          serviceEntree: "",
                        }
                      : value === "DON"
                        ? {
                            nomPersonneSortie: "",
                            cinPersonneSortie: "",
                            serviceSortie: "",
                            nomPersonneEntree: "",
                            cinPersonneEntree: "",
                            serviceEntree: "",
                          }
                        : value === "AFFECTATION"
                          ? {
                              ordreEntree: "",
                              facture: "",
                              pvEvaluation: "",
                            }
                          : {}),
                  }));
                }}
                className="
                  w-full
                  bg-white
                  border
                  border-gray-300
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-haigana-dark
                  focus:outline-none
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                "
              >
                <option value="">Sélectionner le type</option>
                <option value="ACHAT">ACHAT</option>
                <option value="DON">DON</option>
                <option value="AFFECTATION">AFFECTATION</option>
              </select>
            ) : (
              <p className="font-semibold text-haigana-dark">
                {entree?.type || "-"}
              </p>
            )}
          </div>

          {/* ACHAT / DON : PIECES */}
          {form.typePriseEnCharge !== "AFFECTATION" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-gray-50 rounded-xl p-4">
                <label
                  htmlFor="ordreEntree"
                  className="block text-xs text-gray-500 mb-1 font-normal"
                >
                  Ordre d'entrée
                </label>

                {modeModification ? (
                  <input
                    type="text"
                    id="ordreEntree"
                    name="ordreEntree"
                    value={form.ordreEntree}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
                    placeholder="Référence de l'ordre d'entrée"
                  />
                ) : (
                  <p className="font-semibold text-haigana-dark break-words">
                    {entree?.ordreEntree || "-"}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label
                  htmlFor="facture"
                  className="block text-xs text-gray-500 mb-1 font-normal"
                >
                  Facture
                </label>

                {modeModification ? (
                  <input
                    type="text"
                    id="facture"
                    name="facture"
                    value={form.facture}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
                    placeholder="Référence de la facture"
                  />
                ) : (
                  <p className="font-semibold text-haigana-dark break-words">
                    {entree?.facture || "-"}
                  </p>
                )}
              </div>

              {form.typePriseEnCharge === "DON" && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <label
                    htmlFor="pvEvaluation"
                    className="block text-xs text-gray-500 mb-1 font-normal"
                  >
                    PV d'évaluation
                  </label>

                  {modeModification ? (
                    <input
                      type="text"
                      id="pvEvaluation"
                      name="pvEvaluation"
                      value={form.pvEvaluation}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
                      placeholder="Référence du PV d'évaluation"
                    />
                  ) : (
                    <p className="font-semibold text-haigana-dark break-words">
                      {entree?.pvEvaluation || "-"}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AFFECTATION : PERSONNES */}
          {form.typePriseEnCharge === "AFFECTATION" && (
            <div className="space-y-4">

              <div>
                <h3 className="text-sm font-semibold text-haigana-dark mb-3">
                  Personne qui fait l'ordre de sortie
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ["nomPersonneSortie", "Nom", "Nom de la personne"],
                    ["cinPersonneSortie", "CIN", "CIN de la personne"],
                    ["serviceSortie", "Service", "Service"],
                  ].map(([name, label, placeholder]) => (
                    <div key={name} className="bg-gray-50 rounded-xl p-4">
                      <label
                        htmlFor={name}
                        className="block text-xs text-gray-500 mb-1 font-normal"
                      >
                        {label}
                      </label>

                      {modeModification ? (
                        <input
                          type="text"
                          id={name}
                          name={name}
                          value={form[name]}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
                          placeholder={placeholder}
                        />
                      ) : (
                        <p className="font-semibold text-haigana-dark break-words">
                          {entree?.[name] || "-"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-haigana-dark mb-3">
                  Personne qui fait l'ordre d'entrée
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    ["nomPersonneEntree", "Nom", "Nom de la personne"],
                    ["cinPersonneEntree", "CIN", "CIN de la personne"],
                    ["serviceEntree", "Service", "Service"],
                  ].map(([name, label, placeholder]) => (
                    <div key={name} className="bg-gray-50 rounded-xl p-4">
                      <label
                        htmlFor={name}
                        className="block text-xs text-gray-500 mb-1 font-normal"
                      >
                        {label}
                      </label>

                      {modeModification ? (
                        <input
                          type="text"
                          id={name}
                          name={name}
                          value={form[name]}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
                          placeholder={placeholder}
                        />
                      ) : (
                        <p className="font-semibold text-haigana-dark break-words">
                          {entree?.[name] || "-"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* PIECE JUSTIFICATIVE GENERALE */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">
              Pièce justificative générale
            </p>

            {entree?.pieceJustificativeUrl ? (
              <p className="font-semibold text-haigana-dark break-all">
                {entree.pieceJustificativeUrl}
              </p>
            ) : (
              <p className="font-semibold text-gray-400">
                Aucune pièce justificative
              </p>
            )}
          </div>

        </div>
      </div>

      {/*INFORMATIONS GENERALES*/}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
          mb-6
        "
      >

        <div
          className="
            px-5
            py-4
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
            Informations générales
          </h2>

        </div>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            p-5
          "
        >

          {/* GENRE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Genre
            </p>

            {modeModification ? (

              <input
                type="text"
                name="genre"
                value={form.genre}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {vehicule?.genre?.genreVehicule ||
                  "-"}
              </p>

            )}

          </div>

          <div
          className="
            bg-gray-50
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-gray-500
              mb-1
            "
          >
            État
          </p>

          {modeModification ? (

            <select
              name="etatId"
              value={form.etatId || ""}
              onChange={handleChange}
              className="
                w-full
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                bg-white
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            >
              <option value="">
                Sélectionner un état
              </option>

              {etats.map((etat) => (
                <option
                  key={etat.id}
                  value={etat.id}
                >
                  {etat.etatVehicule}
                </option>
              ))}
            </select>

          ) : (

            <p
              className="
                font-semibold
                text-haigana-dark
              "
            >
              {vehicule?.etat?.etatVehicule || "-"}
            </p>

          )}

        </div>

          {/* MARQUE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Marque
            </p>

            {modeModification ? (

              <input
                type="text"
                name="marque"
                value={form.marque}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {vehicule?.marque?.marqueVehicule ||
                  "-"}
              </p>

            )}

          </div>

          {/* PRIX DU VEHICULE */}

          <div className="bg-gray-50 rounded-xl p-4">
            <label htmlFor="prixVehicule" className="block text-xs text-gray-500 mb-1 font-normal">
              Prix du véhicule (Ariary)
            </label>
            {modeModification ? (
              <input
                type="number"
                id="prixVehicule"
                name="prixVehicule"
                value={form.prixVehicule}
                onChange={handleChange}
                placeholder="Ex: 25000000"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-haigana-dark focus:outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20"
              />
            ) : (
              <p className="font-semibold text-haigana-dark">
                {vehicule?.prixVehicule !== null && vehicule?.prixVehicule !== undefined
                  ? `${Number(vehicule.prixVehicule).toLocaleString('fr-FR')} Ar`
                  : "-"}
              </p>
            )}
          </div>

          {/* DATE CIRCULATION */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Date de circulation
            </p>

            {modeModification ? (

              <input
                type="date"
                name="dateCirculation"
                value={form.dateCirculation}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {vehicule?.dateCirculation ||
                  "Non renseignée"}
              </p>

            )}

          </div>

          {/* LOCALITE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Localité
            </p>

            {modeModification ? (

              <input
                type="text"
                name="localiteTexte"
                value={form.localiteTexte}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {vehicule?.localiteTexte ||
                  "-"}
              </p>

            )}

          </div>


          {/* CATEGORIE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >
            <p className="text-xs text-gray-500 mb-1">
              Catégorie
            </p>

            {modeModification ? (
              <select
                name="categorie"
                value={form.categorie}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="REPRESENTATION">REPRESENTATION</option>
                <option value="FONCTION">FONCTION</option>
                <option value="SERVICE">SERVICE</option>
              </select>
            ) : (
              <p className="font-semibold text-haigana-dark">
                {vehicule?.categorie || "-"}
              </p>
            )}
          </div>

          {/* CARTE GRISE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >
            <p className="text-xs text-gray-500 mb-1">
              Carte grise
            </p>

            {modeModification ? (
              <select
                name="carteGriseDisponible"
                value={form.carteGriseDisponible}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none"
              >
                <option value="">Sélectionner</option>
                <option value="Oui">Oui</option>
                <option value="Non">Non</option>
              </select>
            ) : (
              <p className="font-semibold text-haigana-dark">
                {vehicule?.carteGriseDisponible === true
                  ? "Oui"
                  : vehicule?.carteGriseDisponible === false
                    ? "Non"
                    : "-"}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* DETENTEUR */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
          mb-6
        "
      >

        <div
          className="
            px-5
            py-4
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
            Détenteur
          </h2>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
            p-5
          "
        >

          {/* NOM */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Nom
            </p>

            {modeModification ? (

              <input
                type="text"
                name="nomDetenteur"
                value={form.nomDetenteur}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {detenteurNom}
              </p>

            )}

          </div>

          {/* PRENOM */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Prénom
            </p>

            {modeModification ? (

              <input
                type="text"
                name="prenomDetenteur"
                value={form.prenomDetenteur}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {detenteur?.prenomDetenteur ||
                  "-"}
              </p>

            )}

          </div>

          {/* MATRICULE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Matricule
            </p>

            {modeModification ? (

              <input
                type="text"
                name="immatriculeDetenteur"
                value={
                  form.immatriculeDetenteur
                }
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {detenteur?.immatriculeDetenteur ||
                  "-"}
              </p>

            )}

          </div>

          {/* CIN */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              CIN
            </p>

            {modeModification ? (

              <input
                type="text"
                name="cinDetenteur"
                value={form.cinDetenteur}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {detenteur?.cinDetenteur ||
                  "-"}
              </p>

            )}

          </div>

          {/* DISTRICT */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              District
            </p>

            {modeModification ? (

              <input
                type="text"
                name="districtDetenteur"
                value={
                  form.districtDetenteur
                }
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {detenteur?.districtDetenteur ||
                  "-"}
              </p>

            )}

          </div>

        </div>

      </div>

      {/*CHAUFFEUR*/}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
          mb-6
        "
      >

        <div
          className="
            px-5
            py-4
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
            Chauffeur
          </h2>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Chauffeur affecté à la conduite de ce véhicule
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
            p-5
          "
        >

          {/* NOM */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Nom
            </p>

            {modeModification ? (

              <input
                type="text"
                name="nomChauffeur"
                value={form.nomChauffeur}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {chauffeur?.nomChauffeur ||
                  "-"}
              </p>

            )}

          </div>

          {/* MATRICULE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              Matricule
            </p>

            {modeModification ? (

              <input
                type="text"
                name="immatriculeChauffeur"
                value={
                  form.immatriculeChauffeur
                }
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {chauffeur?.immatriculeChauffeur ||
                  "-"}
              </p>

            )}

          </div>

          {/* CIN */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p
              className="
                text-xs
                text-gray-500
                mb-1
              "
            >
              CIN
            </p>

            {modeModification ? (

              <input
                type="text"
                name="cinChauffeur"
                value={form.cinChauffeur}
                onChange={handleChange}
                className="
                  w-full
                  px-3
                  py-2
                  rounded-lg
                  border
                  border-gray-200
                  focus:border-haigana-blue
                  focus:ring-2
                  focus:ring-haigana-blue/20
                  outline-none
                "
              />

            ) : (

              <p
                className="
                  font-semibold
                  text-haigana-dark
                "
              >
                {chauffeur?.cinChauffeur ||
                  "-"}
              </p>

            )}

          </div>

        </div>

      </div>

      {/*BOUTONS*/}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:justify-end
          gap-3
        "
      >

        {/*  RETOUR / ANNULER
            ====================================================== */}

        <button
          type="button"
          onClick={
            modeModification
              ? annulerModification
              : retournerVersVehicules
          }
          disabled={saving}
          className="
            px-5
            py-2.5
            rounded-lg
            border
            border-gray-200
            text-gray-600
            font-medium
            hover:bg-gray-50
            transition-all
            disabled:opacity-50
          "
        >
          {modeModification
            ? "Annuler"
            : "Retour"}
        </button>

        {/*  MODIFIER
            ====================================================== */}

        {!modeModification && (

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setModeModification(true);
            }}
            className="
              px-6
              py-2.5
              rounded-lg
              bg-haigana-dark
              text-white
              font-semibold
              hover:bg-haigana-blue
              transition-all
            "
          >
            Modifier
          </button>

        )}

        {/*  ENREGISTRER
            ====================================================== */}

        {modeModification && (

          <button
            type="button"
            onClick={
              enregistrerModifications
            }
            disabled={saving}
            className="
              px-6
              py-2.5
              rounded-lg
              bg-haigana-blue
              text-white
              font-semibold
              hover:brightness-95
              transition-all
              disabled:opacity-50
            "
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer"}
          </button>

        )}

        {/*VALIDER → SITUATION*/}

        {!modeModification && (

          <button
            type="button"
            onClick={
              allerVersSituation
            }
            className="
              px-6
              py-2.5
              rounded-lg
              bg-haigana-gold
              text-haigana-dark
              font-semibold
              hover:brightness-95
              transition-all
            "
          >
            Valider
          </button>

        )}
      </div>
    </div>
  );
}