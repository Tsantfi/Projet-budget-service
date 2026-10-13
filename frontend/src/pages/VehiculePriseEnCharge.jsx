import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";
import AlertModal from "../components/AlertModal";
import MapPicker from "../components/MapPicker";

function useReference(path) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    client
      .get(path)
      .then((res) => {
        setItems(
          Array.isArray(res.data)
            ? res.data
            : []
        );
      })
      .catch((err) => {
        console.error(
          `Erreur chargement ${path} :`,
          err
        );

        setItems([]);
      });
  }, [path]);

  return items;
}

export default function VehiculePriseEnCharge() {

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const soaId = params.get("soaId");

  // REFERENCES

  const etats = useReference(
    "/reference/etats"
  );

  const carburants = useReference(
    "/reference/carburants"
  );

  // DONNEES

  const [soaList, setSoaList] =
    useState([]);

  // FORMULAIRE

  const [form, setForm] = useState({

    // VEHICULE
    immatricule: "",
    etatId: "",
    genre: "",
    marque: "",
    type: "",
    categorie: "",
    carteGriseDisponible: "",
    carburantId: "",
    regionId: "",
    localiteTexte: "",
    localiteLatitude: "",
    localiteLongitude: "",
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

    prixVehicule: "",
    dateCirculation: "",

    // PRISE EN CHARGE
    motif: "",

    // PIECES
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

  // ETATS

  const [useMap, setUseMap] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [duplicateAlert, setDuplicateAlert] =
    useState(false);

  // CHARGEMENT DETENTEUR / CHAUFFEUR / SOA

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    try {

      const soaResponse =
        await client.get("/soa");

      setSoaList(
        Array.isArray(soaResponse.data)
          ? soaResponse.data
          : []
      );

    } catch (err) {

      console.error(
        "Erreur lors du chargement des SOA :",
        err
      );

      setSoaList([]);

    }
  }

  // MODIFICATION FORMULAIRE
  function set(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  // ENREGISTREMENT

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {

      // VERIFICATION SOA

      if (!soaId) {

        setError(
          "Aucun code SOA n'a été sélectionné."
        );

        setSubmitting(false);

        return;
      }

      // =====================================================
      // VERIFICATION MOTIF
      // =====================================================

      if (!form.motif) {
        setError("Le motif de la prise en charge est obligatoire.");
        setSubmitting(false);
        return;
      }

      // VERIFICATION DES INFORMATIONS SELON LE MOTIF

      if (form.motif === "ACHAT") {

        if (
          !form.ordreEntree.trim() ||
          !form.facture.trim()
        ) {
          setError(
            "Pour un achat, l'Ordre d'entrée et la Facture sont obligatoires."
          );

          setSubmitting(false);
          return;
        }
      }

      if (form.motif === "DON") {

        if (
          !form.ordreEntree.trim() ||
          !form.facture.trim() ||
          !form.pvEvaluation.trim()
        ) {
          setError(
            "Pour un don, l'Ordre d'entrée, la Facture et le PV d'évaluation sont obligatoires."
          );

          setSubmitting(false);
          return;
        }
      }

      if (form.motif === "AFFECTATION") {

        if (
          !form.nomPersonneSortie.trim() ||
          !form.cinPersonneSortie.trim() ||
          !form.serviceSortie.trim() ||
          !form.nomPersonneEntree.trim() ||
          !form.cinPersonneEntree.trim() ||
          !form.serviceEntree.trim()
        ) {
          setError(
            "Toutes les informations de l'affectation sont obligatoires."
          );

          setSubmitting(false);
          return;
        }
      }

      // VERIFICATION DETENTEUR

      if (
        !form.nomDetenteur.trim() ||
        !form.prenomDetenteur.trim() ||
        !form.immatriculeDetenteur.trim() ||
        !form.cinDetenteur.trim() ||
        !form.districtDetenteur.trim()
      ) {
        setError(
          "Toutes les informations du détenteur sont obligatoires."
        );

        setSubmitting(false);
        return;
      }

      // VERIFICATION CHAUFFEUR

      if (
        !form.nomChauffeur.trim() ||
        !form.immatriculeChauffeur.trim() ||
        !form.cinChauffeur.trim()
      ) {
        setError(
          "Toutes les informations du chauffeur sont obligatoires."
        );

        setSubmitting(false);
        return;
      }

      // DONNEES VEHICULE

      const data = {

        immatricule:
          form.immatricule
            .replace(/\s+/g, "")
            .trim()
            .toUpperCase(),

        prixVehicule:
          form.prixVehicule
            ? Number(form.prixVehicule)
            : null,

        dateCirculation:
          form.dateCirculation || null,

        localiteTexte:
          form.localiteTexte || null,

        localiteLatitude:
          form.localiteLatitude
            ? Number(form.localiteLatitude)
            : null,

        localiteLongitude:
          form.localiteLongitude
            ? Number(form.localiteLongitude)
            : null,

        genre:
          form.genre.trim() || null,

        marque:
          form.marque.trim() || null,

        type:
          form.type.trim() || null,

        // RELATIONS
        etatId:
          form.etatId
            ? Number(form.etatId)
            : null,

        carburantId:
          form.carburantId
            ? Number(form.carburantId)
            : null,

        //catégorie et carte
        categorie:
          form.categorie || null,

        carteGriseDisponible:
          form.carteGriseDisponible === ""
            ? null
            : form.carteGriseDisponible === "true",

        // DETENTEUR

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

        // CHAUFFEUR

        nomChauffeur:
          form.nomChauffeur.trim(),

        immatriculeChauffeur:
          form.immatriculeChauffeur.trim(),

        cinChauffeur:
          form.cinChauffeur.trim(),

        soaId:
          soaId
            ? Number(soaId)
            : null,
      };

      console.log(
        "Données véhicule envoyées :",
        data
      );

      // 1. CREATION VEHICULE

      const vehiculeResponse =
        await client.post(
          "/vehicules",
          data
        );

      console.log(
        "Réponse création véhicule :",
        vehiculeResponse.data
      );

      const vehicule =
        vehiculeResponse.data;

      // =====================================================
      // RECUPERATION ID VEHICULE
      // =====================================================

      const vehiculeId =
        vehicule?.id ||
        vehicule?.vehiculeId;

      if (!vehiculeId) {

        throw new Error(
          "Le véhicule a été créé mais son identifiant n'a pas été retourné par le serveur."
        );
      }

      // 2. CREATION AUTOMATIQUE DE L'ENTREE

      const entreeData = {

      reference:
        `PRISE-${data.immatricule}`,

      dateEntree:
        new Date()
          .toISOString()
          .split("T")[0],

      vehiculeId:
        Number(vehiculeId),

      type:
        form.motif,

      // ==========================================
      // PIECES
      // ==========================================

      ordreEntree:
        form.motif === "ACHAT" ||
        form.motif === "DON"
          ? form.ordreEntree.trim()
          : null,

      facture:
        form.motif === "ACHAT" ||
        form.motif === "DON"
          ? form.facture.trim()
          : null,

      pvEvaluation:
        form.motif === "DON"
          ? form.pvEvaluation.trim()
          : null,

      // ==========================================
      // AFFECTATION
      // ==========================================

      nomPersonneSortie:
        form.motif === "AFFECTATION"
          ? form.nomPersonneSortie.trim()
          : null,

      cinPersonneSortie:
        form.motif === "AFFECTATION"
          ? form.cinPersonneSortie.trim()
          : null,

      serviceSortie:
        form.motif === "AFFECTATION"
          ? form.serviceSortie.trim()
          : null,

      nomPersonneEntree:
        form.motif === "AFFECTATION"
          ? form.nomPersonneEntree.trim()
          : null,

      cinPersonneEntree:
        form.motif === "AFFECTATION"
          ? form.cinPersonneEntree.trim()
          : null,

      serviceEntree:
        form.motif === "AFFECTATION"
          ? form.serviceEntree.trim()
          : null
    };

      console.log(
        "Données entrée envoyées :",
        entreeData
      );

      await client.post(
        "/entrees/prise-en-charge",
        entreeData
      );

      // =====================================================
      // SUCCES
      // =====================================================

      alert(
        "Le véhicule et sa prise en charge ont été enregistrés avec succès."
      );

      const soaSelectionne = soaList.find(
        (s) => Number(s.id) === Number(soaId)
      );

      navigate("/patrimoine/vehicule", {
        state: {
          retourSoa: {
            codeSoa:
              soaSelectionne?.codeSoa ||
              soaSelectionne?.code ||
              ""
          }
        }
      });

    } catch (err) {

      console.error(
        "Erreur lors de la prise en charge :",
        err
      );

      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "";

      if (
        detail
          .toLowerCase()
          .includes("existe deja") ||
        detail
          .toLowerCase()
          .includes("existe déjà")
      ) {

        setDuplicateAlert(true);

      } else {

        setError(
          detail ||
          "Erreur lors de l'enregistrement."
        );
      }

    } finally {

      setSubmitting(false);
    }
  }

  // CLASSES

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // RENDU

  return (

    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* TITRE */}

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        Prise en charge d'un véhicule
      </h1>

      {/* FORMULAIRE */}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-8 space-y-6"
      >

        {/*INFORMATIONS VEHICULE*/}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* IMMATRICULATION */}

          <div>

            <label className={labelClass}>
              Immatriculation du véhicule
            </label>

            <input
              required
              value={form.immatricule}
              onChange={(e) =>
                set(
                  "immatricule",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : 6574 ME"
            />

          </div>

          {/* ETAT */}

          <div>

            <label className={labelClass}>
              État
            </label>

            <select
              required
              value={form.etatId}
              onChange={(e) =>
                set(
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

          {/* MARQUE */}

          <div>

            <label className={labelClass}>
              Marque
            </label>

            <input
              required
              type="text"
              value={form.marque}
              onChange={(e) =>
                set(
                  "marque",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Toyota"
            />

          </div>

          {/* TYPE */}

          <div>

            <label className={labelClass}>
              Type
            </label>

            <input
              required
              type="text"
              value={form.type}
              onChange={(e) =>
                set(
                  "type",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Véhicule particulier"
            />

          </div>

          {/* GENRE */}

          <div>

            <label className={labelClass}>
              Genre
            </label>

            <input
              required
              type="text"
              value={form.genre}
              onChange={(e) =>
                set(
                  "genre",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Berline"
            />

          </div>

          {/* CARBURANT */}

          <div>

            <label className={labelClass}>
              Carburant
            </label>

            <select
              required
              value={form.carburantId}
              onChange={(e) =>
                set(
                  "carburantId",
                  e.target.value
                )
              }
              className={inputClass}
            >

              <option value="">
                Choisir...
              </option>

              {carburants.map((c) => (

                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.libelle}
                </option>

              ))}

            </select>

          </div>

          {/* PRIX */}

          <div>

            <label className={labelClass}>
              Valeur du véhicule (Ar)
            </label>

            <input
              type="number"
              min="0"
              value={form.prixVehicule}
              onChange={(e) =>
                set(
                  "prixVehicule",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : 85000000"
            />

          </div>

          {/* CATEGORIE */}

          <div>

            <label className={labelClass}>
              Catégorie
            </label>

            <select
              required
              value={form.categorie}
              onChange={(e) =>
                set("categorie", e.target.value)
              }
              className={inputClass}
            >

              <option value="">
                Choisir...
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
              Carte grise
            </label>

            <select
              required
              value={form.carteGriseDisponible}
              onChange={(e) =>
                set(
                  "carteGriseDisponible",
                  e.target.value
                )
              }
              className={inputClass}
            >

              <option value="">
                Choisir...
              </option>

              <option value="true">
                Oui
              </option>

              <option value="false">
                Non
              </option>

            </select>

          </div>

          {/*DETENTEUR*/}

          <div className="sm:col-span-2">

            <h3 className="text-base font-semibold text-haigana-dark mb-3">
              Informations du détenteur
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* NOM */}

              <div>

                <label className={labelClass}>
                  Nom <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.nomDetenteur}
                  onChange={(e) =>
                    set("nomDetenteur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Nom du détenteur"
                />

              </div>

              {/* PRENOM */}

              <div>

                <label className={labelClass}>
                  Prénom <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.prenomDetenteur}
                  onChange={(e) =>
                    set("prenomDetenteur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Prénom du détenteur"
                />

              </div>

              {/* MATRICULE */}

              <div>

                <label className={labelClass}>
                  Matricule <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.immatriculeDetenteur}
                  onChange={(e) =>
                    set("immatriculeDetenteur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Matricule du détenteur"
                />

              </div>

              {/* CIN */}

              <div>

                <label className={labelClass}>
                  CIN <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.cinDetenteur}
                  onChange={(e) =>
                    set("cinDetenteur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="CIN du détenteur"
                />

              </div>

              {/* DISTRICT */}

              <div className="sm:col-span-2">

                <label className={labelClass}>
                  Département <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.districtDetenteur}
                  onChange={(e) =>
                    set("districtDetenteur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="District du détenteur"
                />
              </div>
            </div>

          </div>

          {/*CHAUFFEUR*/}

          <div className="sm:col-span-2 border-t border-gray-100 pt-5">

            <h3 className="text-base font-semibold text-haigana-dark mb-3">
              Informations du chauffeur
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* NOM */}

              <div>

                <label className={labelClass}>
                  Nom <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.nomChauffeur}
                  onChange={(e) =>
                    set("nomChauffeur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Nom du chauffeur"
                />

              </div>

              {/* MATRICULE */}

              <div>

                <label className={labelClass}>
                  Matricule <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.immatriculeChauffeur}
                  onChange={(e) =>
                    set("immatriculeChauffeur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Matricule du chauffeur"
                />

              </div>

              {/* CIN */}

              <div>

                <label className={labelClass}>
                  CIN <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  type="text"
                  value={form.cinChauffeur}
                  onChange={(e) =>
                    set("cinChauffeur", e.target.value)
                  }
                  className={inputClass}
                  placeholder="CIN du chauffeur"
                />

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
          PRISE EN CHARGE*/}

      <div className="border-t border-gray-100 pt-5">

        <h2 className="text-lg font-semibold text-haigana-dark mb-4">
          Informations de prise en charge
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* MOTIF */}

          <div>
            <label className={labelClass}>
              Motif
            </label>

            <select
              required
              value={form.motif}
              onChange={(e) =>
                set("motif", e.target.value)
              }
              className={inputClass}
            >

              <option value="">
                Choisir un motif...
              </option>

              <option value="ACHAT">
                ACHAT
              </option>

              <option value="DON">
                DON
              </option>

              <option value="AFFECTATION">
                AFFECTATION
              </option>

            </select>
          </div>

          {/* DATE */}

          <div>
            <label className={labelClass}>
              Date
            </label>

            <input
              type="date"
              value={form.dateCirculation}
              onChange={(e) =>
                set(
                  "dateCirculation",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </div>

        </div>


        {/* =================================================
            ACHAT
            ================================================= */}

        {form.motif === "ACHAT" && (

          <div className="mt-5">

            <h3 className="text-base font-semibold text-haigana-dark mb-3">
              Pièces justificatives — Achat
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* ORDRE ENTREE */}

              <div>

                <label className={labelClass}>
                  Ordre d'entrée
                </label>

                <input
                  required
                  type="text"
                  value={form.ordreEntree}
                  onChange={(e) =>
                    set(
                      "ordreEntree",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Référence de l'ordre d'entrée"
                />

              </div>

              {/* FACTURE */}

              <div>

                <label className={labelClass}>
                  Facture
                </label>

                <input
                  required
                  type="text"
                  value={form.facture}
                  onChange={(e) =>
                    set(
                      "facture",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Référence de la facture"
                />

              </div>

            </div>

          </div>

        )}


        {/* =================================================
            DON
            ================================================= */}

        {form.motif === "DON" && (

          <div className="mt-5">

            <h3 className="text-base font-semibold text-haigana-dark mb-3">
              Pièces justificatives — Don
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* ORDRE ENTREE */}

              <div>

                <label className={labelClass}>
                  Ordre d'entrée
                </label>

                <input
                  required
                  type="text"
                  value={form.ordreEntree}
                  onChange={(e) =>
                    set(
                      "ordreEntree",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Référence de l'ordre d'entrée"
                />

              </div>

              {/* FACTURE */}

              <div>

                <label className={labelClass}>
                  Facture
                </label>

                <input
                  required
                  type="text"
                  value={form.facture}
                  onChange={(e) =>
                    set(
                      "facture",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Référence de la facture"
                />

              </div>

              {/* PV EVALUATION */}

              <div className="sm:col-span-2">

                <label className={labelClass}>
                  PV d'évaluation
                </label>

                <input
                  required
                  type="text"
                  value={form.pvEvaluation}
                  onChange={(e) =>
                    set(
                      "pvEvaluation",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Référence du PV d'évaluation"
                />

              </div>

            </div>

          </div>

        )}


        {/* =================================================
            AFFECTATION
            ================================================= */}

        {form.motif === "AFFECTATION" && (

          <div className="mt-5">

            <h3 className="text-base font-semibold text-haigana-dark mb-3">
              Informations de l'affectation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* PERSONNE SORTIE */}

              <div className="sm:col-span-2">

                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Personne qui fait l'ordre de sortie
                </h4>

              </div>

              {/* NOM SORTIE */}

              <div>

                <label className={labelClass}>
                  Nom
                </label>

                <input
                  required
                  type="text"
                  value={form.nomPersonneSortie}
                  onChange={(e) =>
                    set(
                      "nomPersonneSortie",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Nom"
                />

              </div>

              {/* CIN SORTIE */}

              <div>

                <label className={labelClass}>
                  CIN
                </label>

                <input
                  required
                  type="text"
                  value={form.cinPersonneSortie}
                  onChange={(e) =>
                    set(
                      "cinPersonneSortie",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="CIN"
                />

              </div>

              {/* SERVICE SORTIE */}

              <div className="sm:col-span-2">

                <label className={labelClass}>
                  Service
                </label>

                <input
                  required
                  type="text"
                  value={form.serviceSortie}
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


              {/* SEPARATION */}

              <div className="sm:col-span-2 border-t border-gray-100 pt-5">

                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Personne qui fait l'ordre d'entrée
                </h4>

              </div>


              {/* NOM ENTREE */}

              <div>

                <label className={labelClass}>
                  Nom
                </label>

                <input
                  required
                  type="text"
                  value={form.nomPersonneEntree}
                  onChange={(e) =>
                    set(
                      "nomPersonneEntree",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="Nom"
                />

              </div>

              {/* CIN ENTREE */}

              <div>

                <label className={labelClass}>
                  CIN
                </label>

                <input
                  required
                  type="text"
                  value={form.cinPersonneEntree}
                  onChange={(e) =>
                    set(
                      "cinPersonneEntree",
                      e.target.value
                    )
                  }
                  className={inputClass}
                  placeholder="CIN"
                />

              </div>


              {/* SERVICE ENTREE */}

              <div className="sm:col-span-2">

                <label className={labelClass}>
                  Service
                </label>

                <input
                  required
                  type="text"
                  value={form.serviceEntree}
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

        )}

      </div>

        {/*LOCALISATION
            =================================================== */}

        <div className="border-t border-gray-100 pt-5">

          <div className="flex items-center justify-between mb-3">

            <label className={labelClass}>
              Localité
            </label>

            <div className="flex gap-2 text-xs">

              <button
                type="button"
                onClick={() =>
                  setUseMap(false)
                }
                className={`px-3 py-1 rounded-full ${
                  !useMap
                    ? "bg-haigana-dark text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Saisie manuelle
              </button>

              <button
                type="button"
                onClick={() =>
                  setUseMap(true)
                }
                className={`px-3 py-1 rounded-full ${
                  useMap
                    ? "bg-haigana-dark text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Position par carte
              </button>

            </div>

          </div>

          {!useMap ? (

            <input
              value={form.localiteTexte}
              onChange={(e) =>
                set(
                  "localiteTexte",
                  e.target.value
                )
              }
              className={inputClass}
              placeholder="Ex : Mahajanga"
            />

          ) : (

            <MapPicker
              latitude={
                form.localiteLatitude
              }
              longitude={
                form.localiteLongitude
              }
              onChange={({
                latitude,
                longitude,
              }) => {

                set(
                  "localiteLatitude",
                  latitude
                );

                set(
                  "localiteLongitude",
                  longitude
                );

              }}
            />

          )}

        </div>

        {/* ===================================================
            ERREUR
            =================================================== */}

        {error && (

          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>

        )}

        {/* ===================================================
            BOUTONS
            =================================================== */}

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="px-5 py-2.5 rounded-lg text-haigana-dark hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
          >

            {submitting
              ? "Enregistrement..."
              : "Enregistrer"}

          </button>

        </div>

      </form>

      {/*ALERTE DOUBLON*/}

      {duplicateAlert && (

        <AlertModal
          message="Ce véhicule existe déjà"
          onClose={() =>
            setDuplicateAlert(false)
          }
        />

      )}

    </div>
  );
}