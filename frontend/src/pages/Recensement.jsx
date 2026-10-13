import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

const STATUT_CONFIG = {
  IDENTIQUE: {
    label: "Identique",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  MODIFIE: {
    label: "Modifié",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  NOUVEAU: {
    label: "Nouveau",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ABSENT: {
    label: "Absent",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const emptyVehicule = {
  id: null,
  vehiculeId: null,
  codeSoa: "",
  immatriculation: "",
  marque: "",
  type: "",
  genre: "",
  sourceEnergie: "",
  categorie: "",
  anneeMiseCirculation: "",
  etatGeneral: "",
  carteGriseDisponible: "",
  detenteurEffectif: "",
  actif: true,
  statut: "NOUVEAU",
  champsModifies: [],
};

export default function Recensement() {
  const location = useLocation();
  const navigate = useNavigate();

  const recensementInitial = location.state?.recensement;
  const soaIdInitial = location.state?.soaId;

  const [recensement, setRecensement] = useState(
    recensementInitial || null
  );

  const [soaId, setSoaId] = useState(
    soaIdInitial || null
  );

  const [annees, setAnnees] = useState([]);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState("");
  const [formAvant, setFormAvant] = useState(emptyVehicule);

  const [recensementsAnnee, setRecensementsAnnee] = useState([]);
  const [selectionMode, setSelectionMode] = useState(
    !recensementInitial
  );

  const [loadingAnnees, setLoadingAnnees] = useState(false);
  const [loadingRecensements, setLoadingRecensements] = useState(false);
  const [vehicules, setVehicules] = useState(
    recensementInitial?.vehicules || []
  );

  const [showModal, setShowModal] = useState(false);
  const [modeModal, setModeModal] = useState("ajouter");
  const [selectedVehicule, setSelectedVehicule] = useState(null);

  const [form, setForm] = useState(emptyVehicule);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  const chargerAnnees = async () => {
  setLoadingAnnees(true);
  setError("");

  //comparaison des champs

  try {
    const response = await client.get("/recensements/annees");

    setAnnees(response.data || []);

  } catch (err) {
    console.error(
      "Erreur chargement années :",
      err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible de charger les années de recensement."
    );
  } finally {
    setLoadingAnnees(false);
  }
  };

  const chargerRecensementsAnnee = async (annee) => {
  if (!annee) {
    setRecensementsAnnee([]);
    return;
  }

  setLoadingRecensements(true);
  setError("");

  try {
    const response = await client.get(
      `/recensements/annee/${annee}`
    );
    setRecensementsAnnee(response.data || []);

  } catch (err) {
    console.error(
      "Erreur chargement recensements :",
      err
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible de charger les recensements de cette année."
    );
  } finally {
    setLoadingRecensements(false);
  }
  };

  const handleAnneeChange = async (e) => {
  const annee = e.target.value;

  setAnneeSelectionnee(annee);
  setRecensementsAnnee([]);

  if (annee) {
    await chargerRecensementsAnnee(annee);
  }
  };

  // CONFIGURATION ET OUVERTURE DU RECENSEMENT ANNUEL AVEC HISTORIQUE FORCE

  const ouvrirRecensement = async (
    recensementSelectionne,
    lancerComparaison = true
  ) => {
    if (!recensementSelectionne) return;


    const idTarget = recensementSelectionne.id;
    const anneeTarget = recensementSelectionne.annee;
    const soaTarget =
      recensementSelectionne.soaId ||
      recensementSelectionne.soa?.id;

    if (!anneeTarget || !soaTarget) {
      console.error("Données manquantes pour l'ouverture :", recensementSelectionne);
      alert("Erreur de données locales :\nAnnée ou SOA ID manquant.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let currentId = idTarget;

      if (!currentId) {
        const response = await client.get(`/recensements/annee/${anneeTarget}/soa/${soaTarget}`);
        if (response.data?.id) {
          currentId = response.data.id;
        } else {
          throw new Error("L'API n'a renvoyé aucun ID valide.");
        }
      }

      let dataFinale;

      if (lancerComparaison) {
        const responseSync = await client.post(
          `/recensements/${currentId}/comparaison?annee=${anneeTarget}&soaId=${soaTarget}`
        );
        dataFinale = responseSync.data;
      } else {
        const response = await client.get(`/recensements/annee/${anneeTarget}/soa/${soaTarget}`);
        dataFinale = response.data;
      }
      setRecensement(dataFinale);
      setSoaId(dataFinale.soaId || soaTarget);
      setSelectionMode(false);
      setVehicules(dataFinale.vehicules || []);

    } catch (err) {
      console.error("Erreur ouverture recensement :", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Impossible de charger le recensement."
      );

    } finally {
      setLoading(false);
    }
  };

  // CORRECTION CRITIQUE : DÉCLENCHEMENT DE LA COMPARAISON EN TEMPS RÉEL

  useEffect(() => {
    // Si on arrive depuis SortieQuitus avec un recensement pré-initialisé
    if (recensementInitial) {
      console.log("Recensement initial détecté. Lancement automatique de la comparaison...");
      // On force l'exécution de la méthode réseau avec le paramètre lancerComparaison = true
      ouvrirRecensement(recensementInitial, true);
      return;
    }

    // Sinon, mode autonome : chargement de l'arbre des années historiques
    chargerAnnees();
  }, [recensementInitial, soaIdInitial]);


  // AJOUT DIRECT D'UN VÉHICULE NOUVEAU SANS MODAL

  const ajouterNouveauDirect = async (vehicule) => {
  if (!vehicule || !recensement?.id) {
    return;
  }

  setLoading(true);
  setError("");
  setMessage("");

  try {
    const payload = {
      id: vehicule.id || null,
      vehiculeId: vehicule.vehiculeId || null,

      codeSoa:
        vehicule.codeSoa ||
        recensement?.codeSoa ||
        "",

      immatriculation:
        vehicule.immatriculation
          ?.replace(/\s+/g, "")
          .trim()
          .toUpperCase(),

      marque:
        vehicule.marque?.trim() || null,

      type:
        vehicule.type?.trim() || null,

      genre:
        vehicule.genre?.trim() || null,

      sourceEnergie:
        vehicule.sourceEnergie?.trim() || null,

      categorie:
        vehicule.categorie?.trim() || null,

      anneeMiseCirculation:
        vehicule.anneeMiseCirculation
          ? Number(vehicule.anneeMiseCirculation)
          : null,

      etatGeneral:
        vehicule.etatGeneral?.trim() || null,

      carteGriseDisponible:
        vehicule.carteGriseDisponible === true ||
        vehicule.carteGriseDisponible === "Oui",

      detenteurEffectif:
        vehicule.detenteurEffectif?.trim() || null,

      actif: true,

      /*
       * Le backend détermine le statut.
       */
      statut: null,
    };

    /*
     * Si le snapshot existe déjà, on le met à jour.
     * Sinon, on le crée.
     */
    let response;

    if (vehicule.id) {
      response = await client.put(
        `/recensements/${recensement.id}/vehicules/${vehicule.id}`,
        payload
      );
    } else {
      response = await client.post(
        `/recensements/${recensement.id}/vehicules`,
        payload
      );
    }

    const nouvelleRecensement = response.data;

    /*
     * Le backend renvoie le nouveau statut.
     */
    setRecensement(nouvelleRecensement);

    setVehicules(
      nouvelleRecensement.vehicules || []
    );

    setMessage(
      `Le véhicule ${vehicule.immatriculation} a été intégré au recensement.`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);

  } catch (err) {

    console.error(
      "Erreur intégration du véhicule :",
      err
    );

    console.error(
      "Status HTTP :",
      err.response?.status
    );

    console.error(
      "Réponse backend :",
      err.response?.data
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Impossible d'intégrer le véhicule."
    );

  } finally {
    setLoading(false);
  }
  };

  const champEstModifie = (vehicule, champ) => {
  return (
    vehicule.statut === "MODIFIE" &&
    Array.isArray(vehicule.champsModifies) &&
    vehicule.champsModifies.includes(champ)
  );
  };

  const revenirSelectionAnnees = () => {
  setRecensement(null);
  setSoaId(null);
  setSelectionMode(true);

  setAnneeSelectionnee("");
  setRecensementsAnnee([]);
  setVehicules([]);

  setError("");
  setMessage("");
  };

  /** Statistiques*/
  const statistiques = useMemo(() => {
    return {
      total: vehicules.length,

      identiques: vehicules.filter(
        (v) => v.statut === "IDENTIQUE"
      ).length,

      modifies: vehicules.filter(
        (v) => v.statut === "MODIFIE"
      ).length,

      nouveaux: vehicules.filter(
        (v) => v.statut === "NOUVEAU"
      ).length,

      absents: vehicules.filter(
        (v) => v.statut === "ABSENT"
      ).length,
    };
  }, [vehicules]);

  /** Filtrage*/
  const vehiculesFiltres = useMemo(() => {
    const recherche = search.trim().toLowerCase();

    return vehicules.filter((v) => {
      const correspondRecherche =
        !recherche ||
        v.immatriculation?.toLowerCase().includes(recherche) ||
        v.marque?.toLowerCase().includes(recherche) ||
        v.type?.toLowerCase().includes(recherche) ||
        v.genre?.toLowerCase().includes(recherche) ||
        v.categorie?.toLowerCase().includes(recherche) ||
        v.detenteurEffectif?.toLowerCase().includes(recherche);

      const correspondStatut =
        filterStatut === "TOUS" ||
        v.statut === filterStatut;

      return correspondRecherche && correspondStatut;
    });
  }, [vehicules, search, filterStatut]);

  /** Ouverture modal Ajouter*/
  const ouvrirAjout = () => {

  setModeModal("ajouter");
  setSelectedVehicule(null);

  const codeSoa =
    vehicules.find(
      (v) => v.codeSoa
    )?.codeSoa || "";

  setForm({
    ...emptyVehicule,
    codeSoa,
    statut: "NOUVEAU",
  });

  setError("");
  setMessage("");
  setShowModal(true);
  };

  // DETECTION DES CHAMPS MODIFIÉS PAR RAPPORT À LA BDD

  const estChampModifie = (nomChamp) => {
  if (
    !showModal ||
    modeModal !== "modifier"
  ) {
    return false;
  }

  return (
    form.statut === "MODIFIE" &&
    Array.isArray(form.champsModifies) &&
    form.champsModifies.includes(nomChamp)
  );
  };


  // OUVERTURE DE LA MODAL DE MODIFICATION
  const ouvrirModification = async (vehicule) => {
  if (!vehicule) return;

  try {
    setLoading(true);
    setError("");

    setModeModal("modifier");
    setSelectedVehicule(vehicule);

    // 1. CONSERVER LES VALEURS DU RECENSEMENT

    setFormAvant({
      ...vehicule,
      champsModifies: Array.isArray(vehicule.champsModifies)
        ? [...vehicule.champsModifies]
        : [],
    });

    // 2. RÉCUPÉRER LE VÉHICULE ACTUEL

    let reference = null;

    if (vehicule.vehiculeId) {
      try {
        const response = await client.get(
          `/vehicules/${vehicule.vehiculeId}`
        );

        reference = response.data;

        console.log(
          "Véhicule de référence récupéré :",
          reference
        );

      } catch (referenceError) {

        console.warn(
          "Impossible de récupérer le véhicule actuel :",
          referenceError
        );
      }
    }

    // 3. CONSTRUIRE LES VALEURS MODIFIABLES
    //    À PARTIR DU VÉHICULE ACTUEL

    const valeursReference = reference
      ? {
          immatriculation:
            reference.immatricule || "",

          marque:
            reference.marque?.marqueVehicule || "",

          type:
            reference.type?.typeDuVehicule || "",

          genre:
            reference.genre?.genreVehicule || "",

          sourceEnergie:
            reference.carburant?.libelle || "",

          categorie:
            reference.categorie || "",

          anneeMiseCirculation:
            reference.dateCirculation
              ? new Date(reference.dateCirculation)
                  .getFullYear()
              : "",

          etatGeneral:
            reference.etat?.etatVehicule || "",

          carteGriseDisponible:
            reference.carteGriseDisponible === true
              ? "Oui"
              : reference.carteGriseDisponible === false
                ? "Non"
                : "",

          detenteurEffectif:
            construireDetenteurFrontend(reference),
        }
      : {
          /*
           * Si le véhicule a été supprimé et qu'on ne peut plus
           * récupérer la référence, on conserve les valeurs
           * du snapshot.
           */
          immatriculation:
            vehicule.immatriculation || "",

          marque:
            vehicule.marque || "",

          type:
            vehicule.type || "",

          genre:
            vehicule.genre || "",

          sourceEnergie:
            vehicule.sourceEnergie || "",

          categorie:
            vehicule.categorie || "",

          anneeMiseCirculation:
            vehicule.anneeMiseCirculation ?? "",

          etatGeneral:
            vehicule.etatGeneral || "",

          carteGriseDisponible:
            vehicule.carteGriseDisponible === true
              ? "Oui"
              : vehicule.carteGriseDisponible === false
                ? "Non"
                : "",

          detenteurEffectif:
            vehicule.detenteurEffectif || "",
        };

    // 4. REMPLIR LE FORMULAIRE AVEC LA RÉFÉRENCE ACTUELLE

    setForm({
      id: vehicule.id || null,

      vehiculeId:
        vehicule.vehiculeId || null,

      codeSoa:
        reference?.codeSoa?.codeSoa ||
        vehicule.codeSoa ||
        "",

      ...valeursReference,

      actif:
        vehicule.actif !== false,

      /*
       * On conserve le statut et les champs modifiés
       * du snapshot pour l'affichage.
       */
      statut:
        vehicule.statut || "IDENTIQUE",

      champsModifies:
        Array.isArray(vehicule.champsModifies)
          ? [...vehicule.champsModifies]
          : [],
    });

    setMessage("");
    setShowModal(true);

  } catch (error) {

    console.error(
      "Erreur ouverture modification :",
      error
    );

    setError(
      "Impossible de charger les valeurs actuelles du véhicule."
    );

  } finally {
    setLoading(false);
  }
  };

  const construireDetenteurFrontend = (vehicule) => {
  if (!vehicule?.detenteur) {
    return "";
  }

  const detenteur = vehicule.detenteur;

  return [
    detenteur.nomDetenteur,
    detenteur.prenomDetenteur,
  ]
    .filter(Boolean)
    .join(" ");
  };

  const valeurAvant = (champ) => {
  if (!formAvant) return "—";

  if (champ === "carteGriseDisponible") {
    if (formAvant.carteGriseDisponible === true) {
      return "Oui";
    }

    if (formAvant.carteGriseDisponible === false) {
      return "Non";
    }

    return "—";
  }

  return formAvant[champ] ?? "—";
  };


  /** Fermeture modal*/
  const fermerModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedVehicule(null);
    setForm(emptyVehicule);
    setError("");
  };

  /** Gestion formulaire*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** Validation formulaire*/
  const validerFormulaire = () => {
    if (!form.immatriculation.trim()) {
      setError("L'immatriculation est obligatoire.");
      return false;
    }

    if (!form.marque.trim()) {
      setError("La marque est obligatoire.");
      return false;
    }

    if (!form.type.trim()) {
      setError("Le type est obligatoire.");
      return false;
    }

    if (!form.genre.trim()) {
      setError("Le genre est obligatoire.");
      return false;
    }

    if (!form.categorie.trim()) {
      setError("La catégorie est obligatoire.");
      return false;
    }

    if (!form.etatGeneral.trim()) {
      setError("L'état général est obligatoire.");
      return false;
    }

    if (
      form.carteGriseDisponible !== "Oui" &&
      form.carteGriseDisponible !== "Non"
    ) {
      setError(
        "Veuillez préciser si la carte grise est disponible."
      );
      return false;
    }

    return true;
  };

  const enregistrerVehicule = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  if (!validerFormulaire()) {
    return;
  }

  if (!recensement?.id) {
    setError("Recensement introuvable.");
    return;
  }

  setSaving(true);

  try {
    const payload = {
      id: form.id,
      vehiculeId: form.vehiculeId || null,

      codeSoa:
        form.codeSoa ||
        recensement?.codeSoa ||
        "",

      immatriculation:
        form.immatriculation
          .replace(/\s+/g, "")
          .trim()
          .toUpperCase(),

      marque: form.marque.trim(),

      type: form.type.trim(),

      genre: form.genre.trim(),

      sourceEnergie:
        form.sourceEnergie?.trim() || null,

      categorie:
        form.categorie?.trim() || null,

      anneeMiseCirculation:
        form.anneeMiseCirculation
          ? Number(form.anneeMiseCirculation)
          : null,

      etatGeneral:
        form.etatGeneral.trim(),

      carteGriseDisponible:
      form.carteGriseDisponible === "Oui"
        ? true
        : form.carteGriseDisponible === "Non"
          ? false
          : null,

      detenteurEffectif:
        form.detenteurEffectif?.trim() || null,

      actif:
        form.actif !== false,

      /*
       * Le statut envoyé par le frontend n'est PAS utilisé
       * pour déterminer MODIFIE / IDENTIQUE.
       *
       * Le backend le recalcule à partir du Vehicule BDD.
       */
      statut: null
    };

    let response;

    if (modeModal === "ajouter") {
      response = await client.post(
        `/recensements/${recensement.id}/vehicules`,
        payload
      );
    } else {
      response = await client.put(
        `/recensements/${recensement.id}/vehicules/${form.id}`,
        payload
      );
    }

    const nouvelleRecensement = response.data;

    setRecensement(nouvelleRecensement);

    setVehicules(
      Array.isArray(nouvelleRecensement?.vehicules)
        ? nouvelleRecensement.vehicules
        : []
    );

    fermerModal();

  }
  catch (err) {

    console.error(
      "Erreur enregistrement véhicule :",
      err
    );

    console.error(
      "Status HTTP :",
      err.response?.status
    );

    console.error(
      "Réponse backend :",
      err.response?.data
    );

    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.response?.data ||
      err.message ||
      "Une erreur est survenue lors de l'enregistrement."
    );

  } finally {
    setSaving(false);
  }
  };

  /*
   * Suppression
   */
  const supprimerVehicule = async (vehicule) => {
  if (!vehicule) return;

  const confirme = window.confirm(
    `Voulez-vous supprimer "${vehicule.immatriculation}" du recensement ?`
  );

  if (!confirme) return;

  try {
    let response;

    // ABSENT = véhicule virtuel sans vehiculeId
    if (vehicule.statut === "ABSENT" && vehicule.id) {
      response = await client.delete(
        `/recensements/${recensement.id}/vehicules/${vehicule.id}`
      );

      setMessage(
        `Le véhicule ${vehicule.immatriculation} absent a été retiré du recensement.`
      );
    }

    // Nouveau véhicule virtuel sans ID de snapshot
    else if (!vehicule.id) {
      setVehicules((prev) =>
        prev.filter((v) => v !== vehicule)
      );

      setMessage(
        `Le véhicule ${vehicule.immatriculation} a été retiré du recensement.`
      );

      return;
    }

    // Véhicule normal
    else {
      response = await client.delete(
        `/recensements/${recensement.id}/vehicules/${vehicule.id}`
      );

      setMessage(
        `Le véhicule ${vehicule.immatriculation} a été supprimé du recensement.`
      );
    }

    if (response?.data) {
      setRecensement(response.data);
      setVehicules(response.data.vehicules || []);
    }
  } catch (error) {
    console.error("Erreur suppression véhicule :", error);

    setMessage(
      error.response?.data?.message ||
      "Impossible de supprimer le véhicule."
    );
  }
  };

    const validerRecensement = async () => {
    if (vehicules.length === 0) {
      setError(
        "Le recensement doit contenir au moins un véhicule."
      );
      return;
    }

    // Si le recensement est déjà validé, on saute l'étape de validation API 
    // et on redirige directement vers l'impression du document
    if (recensement?.valide) {
      navigate("/quitus/recensement-document", {
        state: {
          recensement: recensement,
          soaId: soaId,
        },
      });
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous générer et sortir le document officiel de ce recensement ?\n\nAprès cette action, les véhicules de cette année seront figés pour l'édition du quitus."
    );

    if (!confirmation) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await client.put(
        `/recensements/${recensement.id}/valider`
      );

      const recensementValide = response.data;

      setRecensement(recensementValide);
      setVehicules(recensementValide.vehicules || []);

      setMessage("Recensement validé. Génération du document en cours...");

      // Redirection immédiate vers l'écran d'impression du document / quitus
      setTimeout(() => {
        navigate(
          "/quitus/recensement-document",
          {
            state: {
              recensement: recensementValide,
              soaId: soaId,
            },
          }
        );
      }, 800);

    } catch (err) {
      console.error(
        "Erreur lors de la sortie du document :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de générer le document de recensement."
      );

    } finally {
      setLoading(false);
    }
  };


  /** Retour*/
  const retourner = () => {
    navigate("/quitus/sortie", {
      state: {
        soaId,
        ministere: recensement?.ministere || "",
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">

      {/*EN-TÊTE*/}
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>
            <button
              onClick={retourner}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-haigana-blue transition mb-3"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>

              Retour
            </button>

            <h1 className="text-3xl font-bold text-gray-800">
              Recensement annuel
            </h1>

            <p className="text-gray-500 mt-1">
              Vérification et mise à jour du parc automobile
            </p>
          </div>

          <button
            onClick={ouvrirAjout}
            disabled={recensement?.valide}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-haigana-dark text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>

            Ajouter un véhicule
          </button>

        </div>


        {/*  INFORMATIONS DU RECENSEMENT */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-12 h-12 rounded-2xl bg-haigana-blue/10 flex items-center justify-center text-haigana-blue">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Informations du recensement
              </h2>

              <p className="text-sm text-gray-500">
                Données administratives de l'année
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <InfoItem
              label="Année"
              value={recensement.annee}
            />

            <InfoItem
              label="Ministère"
              value={recensement.ministere}
            />

            <InfoItem
              label="Niveau"
              value={recensement.niveau}
            />

            <InfoItem
              label="Direction / Service"
              value={recensement.directionService}
            />

            <InfoItem
              label="Responsable"
              value={recensement.nomPrenomResponsable}
            />

            <InfoItem
              label="Fonction"
              value={recensement.fonctionResponsable}
            />

            <InfoItem
              label="Téléphone"
              value={recensement.telephoneResponsable}
            />

            <InfoItem
              label="E-mail"
              value={recensement.emailResponsable}
            />

          </div>

        </div>


        {/*  STATISTIQUES  */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

          <StatCard
            title="Total"
            value={statistiques.total}
            icon="total"
          />

          <StatCard
            title="Identiques"
            value={statistiques.identiques}
            icon="identique"
          />

          <StatCard
            title="Modifiés"
            value={statistiques.modifies}
            icon="modifie"
          />

          <StatCard
            title="Nouveaux"
            value={statistiques.nouveaux}
            icon="nouveau"
          />

          <StatCard
            title="Absents"
            value={statistiques.absents}
            icon="absent"
          />

        </div>


        {/*  MESSAGE */}
        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-center gap-3">

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>

            {message}

          </div>
        )}


        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-3">

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

            {error}

          </div>
        )}


        {/* RECHERCHE + FILTRE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-5">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="relative flex-1">

              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par immatriculation, marque, type..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-haigana-blue/20 focus:border-haigana-blue"
              />

            </div>


            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="lg:w-56 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-haigana-blue/20 focus:border-haigana-blue"
            >
              <option value="TOUS">
                Tous les statuts
              </option>

              <option value="IDENTIQUE">
                Identiques
              </option>

              <option value="MODIFIE">
                Modifiés
              </option>

              <option value="NOUVEAU">
                Nouveaux
              </option>

              <option value="ABSENT">
                Absents
              </option>
            </select>

          </div>
        </div>

        {/*  TABLEAU */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-bold text-gray-800">
              Véhicules recensés
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {vehiculesFiltres.length} véhicule(s) affiché(s)
            </p>

          </div>


          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <Th>Immatriculation</Th>
                  <Th>Marque</Th>
                  <Th>Type</Th>
                  <Th>Genre</Th>
                  <Th>Énergie</Th>
                  <Th>Catégorie</Th>
                  <Th>Année</Th>
                  <Th>État</Th>
                  <Th>Carte grise</Th>
                  <Th>Détenteur</Th>
                  <Th>Statut</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>

              {/* CORPS DU TABLEAU AVEC COLORATION ALERTE VERTE DE MODIFICATION */}
              <tbody className="divide-y divide-gray-100">
                {vehiculesFiltres.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-16 text-center">
                      <p className="font-semibold text-gray-700">Aucun véhicule trouvé</p>
                    </td>
                  </tr>
                ) : (
                  vehiculesFiltres.map((vehicule, idx) => (
                    <tr key={vehicule.id || `virtuel-${idx}`} className="hover:bg-gray-50 transition">

                      {/* IMMATRICULATION */}
                      <td className={`px-5 py-4 font-semibold transition-colors ${champEstModifie(vehicule, "immatriculation") ? "bg-green-50 text-green-700 font-bold border-l-2 border-l-green-500" : "text-gray-800"}`}>
                        {vehicule.immatriculation || "—"}
                      </td>

                      {/* MARQUE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "marque") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.marque || "—"}
                      </td>

                      {/* TYPE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "type") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.type || "—"}
                      </td>

                      {/* GENRE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "genre") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.genre || "—"}
                      </td>

                      {/* ÉNERGIE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "sourceEnergie") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.sourceEnergie || "—"}
                      </td>

                      {/* CATÉGORIE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "categorie") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.categorie || "—"}
                      </td>

                      {/* ANNÉE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "anneeMiseCirculation") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.anneeMiseCirculation || "—"}
                      </td>

                      {/* ÉTAT */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "etatGeneral") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.etatGeneral || "—"}
                      </td>

                      {/* CARTE GRISE */}
                      <td className={`px-5 py-4 transition-colors ${champEstModifie(vehicule, "carteGriseDisponible") ? "bg-green-50 text-green-700 font-bold" : ""}`}>
                        {vehicule.carteGriseDisponible === true ? "Oui" : vehicule.carteGriseDisponible === false ? "Non" : "—"}
                      </td>

                      {/* DÉTENTEUR */}
                      <td className={`px-5 py-4 max-w-[180px] truncate transition-colors ${champEstModifie(vehicule, "detenteurEffectif") ? "bg-green-50 text-green-700 font-bold" : "text-gray-600"}`}>
                        {vehicule.detenteurEffectif || "—"}
                      </td>

                      {/* BADGE STATUT */}
                      <td className="px-5 py-4">
                        <StatutBadge statut={vehicule.statut} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {vehicule.statut === "NOUVEAU" ? (
                            <button type="button" onClick={() => ajouterNouveauDirect(vehicule)} className="w-9 h-9 rounded-lg flex items-center justify-center transition text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-bold text-lg" title="Intégrer directement">+</button>
                          ) : (
                            <button type="button" onClick={() => ouvrirModification(vehicule)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${vehicule.statut === "MODIFIE" ? "text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 font-bold" : "text-gray-500 hover:text-haigana-blue hover:bg-haigana-blue/10"}`} title="Modifier">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>
                            </button>
                          )}
                          <button type="button" onClick={() => supprimerVehicule(vehicule)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition" title="Supprimer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>


            </table>
          </div>

        </div>


        {/*  RESPONSABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-11 h-11 rounded-xl bg-haigana-gold/10 flex items-center justify-center text-haigana-gold">

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>

            </div>

            <div>
              <h3 className="font-bold text-gray-800">
                Responsable du recensement
              </h3>

              <p className="text-sm text-gray-500">
                Coordonnées enregistrées
              </p>
            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <InfoItem
              label="Nom et prénom"
              value={recensement.nomPrenomResponsable}
            />

            <InfoItem
              label="Fonction"
              value={recensement.fonctionResponsable}
            />

            <InfoItem
              label="Téléphone"
              value={recensement.telephoneResponsable}
            />

            <InfoItem
              label="E-mail"
              value={recensement.emailResponsable}
            />

          </div>

        </div>

        {/*  ACTIONS FINALES */}
        <div className="flex flex-col sm:flex-row sm:justify-end items-center gap-3 mt-8">

          <button
            type="button"
            onClick={retourner}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Retour
          </button>

          {/* S'IL Y A DES VÉHICULES NOUVEAUX DÉTECTÉS DANS LE TABLEAU */}
          {!recensement?.valide && statistiques.nouveaux > 0 && (
            <button
              type="button"
              disabled={loading}
              onClick={async () => {

                const nouveaux = vehicules.filter(
                  (v) => v.statut === "NOUVEAU"
                );

                if (nouveaux.length === 0) {
                  return;
                }

                setLoading(true);
                setError("");
                setMessage("");

                try {

                  for (const vehiculeNouveau of nouveaux) {

                    await ajouterNouveauDirect(
                      vehiculeNouveau
                    );
                  }

                  setMessage(
                    `${nouveaux.length} véhicule(s) nouveau(x) `
                    + `ont été intégré(s) au recensement.`
                  );

                } catch (error) {

                  console.error(
                    "Erreur intégration des nouveaux véhicules :",
                    error
                  );

                  setError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Impossible d'intégrer les nouveaux véhicules."
                  );

                } finally {

                  setLoading(false);
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>

              {loading
                ? "Intégration..."
                : `Intégrer les nouveaux (${statistiques.nouveaux})`
              }
            </button>
            )}

          {/* S'IL Y A DES VÉHICULES ABSENTS DÉTECTÉS DANS LE TABLEAU */}
          {!recensement?.valide && statistiques.absents > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={async () => {

              const absents = vehicules.filter(
                (v) => v.statut === "ABSENT"
              );

              if (absents.length === 0) {
                return;
              }

              const confirmation = window.confirm(
                `Voulez-vous supprimer ${absents.length} véhicule(s) absent(s) de ce recensement ?\n\n`
                + `Cette action supprimera uniquement leur ligne du recensement. `
                + `L'historique des autres années ne sera pas modifié.`
              );

              if (!confirmation) {
                return;
              }

              setLoading(true);
              setError("");
              setMessage("");

              try {

                for (const vehiculeAbsent of absents) {

                  if (!vehiculeAbsent.id) {
                    continue;
                  }

                  await client.delete(
                    `/recensements/${recensement.id}/vehicules/${vehiculeAbsent.id}`
                  );
                }

                /*
                * Recharger le recensement après suppression
                */
                const response = await client.get(
                  `/recensements/annee/${recensement.annee}/soa/${soaId}`
                );

                const nouveauRecensement = response.data;

                setRecensement(nouveauRecensement);

                setVehicules(
                  nouveauRecensement.vehicules || []
                );

                setMessage(
                  `${absents.length} véhicule(s) absent(s) `
                  + `ont été supprimé(s) du recensement.`
                );

              } catch (err) {

                console.error(
                  "Erreur suppression des véhicules absents :",
                  err
                );

                setError(
                  err.response?.data?.message ||
                  err.response?.data?.error ||
                  "Impossible de supprimer les véhicules absents."
                );

              } finally {

                setLoading(false);
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white font-semibold shadow-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>

            {loading
              ? "Suppression..."
              : `Supprimer les absents (${statistiques.absents})`
            }
          </button>
        )}

          {/* BOUTON D'ÉDITION DU DOCUMENT (SORTIR LE RECENSEMENT) */}
          <button
            type="button"
            onClick={validerRecensement}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-haigana-dark text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" className="opacity-30" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Préparation du document...
              </>
            ) : (
              <>
                {/* Icône de document / imprimante */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Sortir le recensement
              </>
            )}
          </button>

        </div>

      </div>


      {/*MODAL AJOUT / MODIFICATION*/}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={fermerModal}
          />

          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            {/* Header */}

            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modeModal === "ajouter"
                    ? "Ajouter un véhicule"
                    : "Modifier le véhicule"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Informations du véhicule recensé
                </p>
              </div>

              <button
                onClick={fermerModal}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>

            </div>


            {/* Formulaire */}

            <form
              onSubmit={enregistrerVehicule}
              className="p-6"
            >

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {modeModal === "modifier" && (
                <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">

                  <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-800">
                      Valeurs avant modification
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Valeurs actuellement enregistrées dans le recensement
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <ReadonlyField
                      label="Immatriculation"
                      value={valeurAvant("immatriculation")}
                    />

                    <ReadonlyField
                      label="Marque"
                      value={valeurAvant("marque")}
                    />

                    <ReadonlyField
                      label="Type"
                      value={valeurAvant("type")}
                    />

                    <ReadonlyField
                      label="Genre"
                      value={valeurAvant("genre")}
                    />

                    <ReadonlyField
                      label="Source d'énergie"
                      value={valeurAvant("sourceEnergie")}
                    />

                    <ReadonlyField
                      label="Catégorie"
                      value={valeurAvant("categorie")}
                    />

                    <ReadonlyField
                      label="Année"
                      value={valeurAvant("anneeMiseCirculation")}
                    />

                    <ReadonlyField
                      label="État général"
                      value={valeurAvant("etatGeneral")}
                    />

                    <ReadonlyField
                      label="Carte grise"
                      value={valeurAvant("carteGriseDisponible")}
                    />

                    <ReadonlyField
                      label="Détenteur"
                      value={valeurAvant("detenteurEffectif")}
                    />

                  </div>
                </div>
              )}
              <div>
                {modeModal === "modifier" && (
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-gray-800">
                      Valeurs modifiées
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Corrigez les informations qui doivent correspondre
                      au véhicule actuel.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InputField
                    label="Immatriculation"
                    name="immatriculation"
                    value={form.immatriculation}
                    onChange={handleChange}
                    required
                    estModifie={estChampModifie("immatriculation")}
                  />

                  <InputField
                    label="Marque"
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    required
                    estModifie={estChampModifie("marque")}
                  />

                  <InputField
                    label="Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    estModifie={estChampModifie("type")}
                  />

                  <InputField
                    label="Genre"
                    name="genre"
                    value={form.genre}
                    onChange={handleChange}
                    required
                    estModifie={estChampModifie("genre")}
                  />

                  <SelectField
                    label="Source d'énergie"
                    name="sourceEnergie"
                    value={form.sourceEnergie}
                    onChange={handleChange}
                    options={["Gasoil", "Essence", "Diesel"]}
                    estModifie={estChampModifie("sourceEnergie")}
                  />

                  <SelectField
                    label="Catégorie"
                    name="categorie"
                    value={form.categorie}
                    onChange={handleChange}
                    required
                    options={[
                      "REPRESENTATION",
                      "FONCTION",
                      "SERVICE"
                    ]}
                    estModifie={estChampModifie("categorie")}
                  />

                  <InputField
                    label="Année de mise en circulation"
                    name="anneeMiseCirculation"
                    type="number"
                    value={form.anneeMiseCirculation}
                    onChange={handleChange}
                    estModifie={estChampModifie(
                      "anneeMiseCirculation"
                    )}
                  />

                  <SelectField
                    label="État général"
                    name="etatGeneral"
                    value={form.etatGeneral}
                    onChange={handleChange}
                    required
                    options={[
                      "En marche",
                      "En panne",
                      "Sur calle",
                      "Epave",
                    ]}
                    estModifie={estChampModifie("etatGeneral")}
                  />

                  <SelectField
                    label="Carte grise disponible"
                    name="carteGriseDisponible"
                    value={form.carteGriseDisponible}
                    onChange={handleChange}
                    required
                    options={["Oui", "Non"]}
                    estModifie={estChampModifie(
                      "carteGriseDisponible"
                    )}
                  />

                  <InputField
                    label="Détenteur effectif"
                    name="detenteurEffectif"
                    value={form.detenteurEffectif}
                    onChange={handleChange}
                    estModifie={estChampModifie(
                      "detenteurEffectif"
                    )}
                  />

                </div>
              </div>

            </div>


              <div className="flex justify-end items-center gap-3 mt-8 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-haigana-dark text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


/* COMPOSANTS */

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-700 break-words">
        {value || "—"}
      </p>
    </div>
  );
}


function Th({ children, align }) {
  return (
    <th
      className={`px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}


function StatutBadge({ statut }) {
  const config =
    STATUT_CONFIG[statut] ||
    STATUT_CONFIG.IDENTIQUE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}


function StatCard({ title, value, icon }) {
  const iconClass = {
    total: "bg-gray-100 text-gray-600",
    identique: "bg-green-50 text-green-600",
    modifie: "bg-orange-50 text-orange-600",
    nouveau: "bg-blue-50 text-blue-600",
    absent: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

      <div className="flex items-center gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass[icon]}`}
        >
          {icon === "total" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
              />
            </svg>
          )}

          {icon === "identique" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}

          {icon === "modifie" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
            </svg>
          )}

          {icon === "nouveau" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          )}

          {icon === "absent" && (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500">
            {title}
          </p>

          <p className="text-xl font-bold text-gray-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  estModifie = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border transition focus:outline-none focus:ring-2 ${
          estModifie
            ? "bg-green-50 border-green-400 !text-green-900 focus:ring-green-200 focus:border-green-500 font-bold"
            : "bg-white border-gray-200 text-gray-700 focus:ring-haigana-blue/20 focus:border-haigana-blue"
        }`}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  estModifie = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border transition focus:outline-none focus:ring-2 ${
          estModifie 
            ? "bg-green-50 border-green-400 !text-green-900 focus:ring-green-200 focus:border-green-500 font-bold" 
            : "bg-white border-gray-200 text-gray-700 focus:ring-haigana-blue/20 focus:border-haigana-blue"
        }`}
      >
        <option value="" className="text-gray-700">Sélectionner</option>
        {options.map((option) => (
          <option 
            key={option} 
            value={option} 
            className={estModifie ? "text-green-900 bg-green-50" : "text-gray-700"}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadonlyField({
  label,
  value,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
        {label}
      </label>

      <div className="px-4 py-3 rounded-xl border bg-white border-gray-200 text-gray-700">
        {value || "—"}
      </div>
    </div>
  );
}
