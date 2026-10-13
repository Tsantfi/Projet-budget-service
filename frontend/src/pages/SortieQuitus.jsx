import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import client from "../api/client";

export default function SortieQuitus() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    annee: "",
    codeSoa: "",
    ministere: location.state?.ministere || "",
    niveau: "Boeny",

    // Direction normale utilisée pour le QUITUS
    directionService: "",

    // Direction utilisée uniquement pour le RECENSEMENT
    directionServiceRecensement: "",

    objet:
      "COORDONNEES DU RESPONSABLE DES BIENS (MEUBLES ET IMMEUBLES) DE LA DIRECTION OU SERVICE",

    nomPrenomResponsable: "",
    fonctionResponsable: "",
    telephoneResponsable: "",
    emailResponsable: "",
    detenteurEffectif: "",
  });

  const [soa, setSoa] = useState(null);
  const [chargementSoa, setChargementSoa] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  // Préremplir le code SOA si SortieQuitus a été ouvert
  // depuis une autre page

  useEffect(() => {
    const soaDepuisNavigation = location.state?.soa;

    if (soaDepuisNavigation) {
      setSoa(soaDepuisNavigation);

      setForm((prev) => ({
        ...prev,
        codeSoa:
          soaDepuisNavigation.codeSoa ||
          soaDepuisNavigation.code ||
          "",
        ministere:
          location.state?.ministere ||
          soaDepuisNavigation.ministere?.nomMinistere ||
          prev.ministere,
      }));
    }
  }, [location.state]);

  // GESTION DES CHAMPS (Réinitialise si l'année ou le SOA change)

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si on modifie les critères clés, on réinitialise l'état chargé
    if (name === "codeSoa" || name === "annee") {
      setSoa(null);
      setMessage("");
      setErreur("");
    }
  };

  // RECHERCHER LE SOA + REMPLISSAGE AUTOMATIQUE DES CHAMPS (VERSION CORRIGÉE)
  const rechercherSoa = async () => {
    setErreur("");
    setMessage("");
    setSoa(null);

    const code = form.codeSoa.trim();
    const anneeSelectionnee = form.annee;

    if (!code) {
      setErreur("Veuillez saisir le code SOA.");
      return;
    }

    if (!anneeSelectionnee) {
      setErreur("Veuillez d'abord saisir une année pour la recherche.");
      return;
    }

    try {
      setChargementSoa(true);

      // 1. RECHERCHE DU SOA

      const responseSoa = await client.get(
        `/soa/code/${encodeURIComponent(code)}`
      );

      const soaTrouve = responseSoa.data;

      console.log("SOA trouvé :", soaTrouve);

      setSoa(soaTrouve);

      // Récupération robuste de l'ID
      const soaId =
        soaTrouve?.id ??
        soaTrouve?.soaId ??
        soaTrouve?.idSoa;

      console.log("ID SOA :", soaId);

      if (!soaId) {
        setErreur(
          "Le SOA a été trouvé mais son identifiant unique est absent de la réponse."
        );
        return;
      }

      // 2. RECHERCHE DU RECENSEMENT DE L'ANNÉE

      try {
        console.log(
          `Recherche recensement : année=${anneeSelectionnee}, soaId=${soaId}`
        );

        const responseRecensement = await client.get(
          `/recensements/annee/${anneeSelectionnee}/soa/${soaId}`
        );

        const recExistant = responseRecensement.data;

        console.log("Recensement trouvé :", recExistant);

        // 3. PRÉREMPLISSAGE DU FORMULAIRE

        setForm((prev) => ({
          ...prev,

          annee: anneeSelectionnee,

          codeSoa:
            soaTrouve?.codeSoa ??
            soaTrouve?.code ??
            prev.codeSoa,

          ministere:
            recExistant?.ministere ??
            soaTrouve?.ministere?.nomMinistere ??
            soaTrouve?.ministere ??
            prev.ministere,

          niveau:
            recExistant?.niveau ??
            prev.niveau,

          directionService:
            recExistant?.directionService ??
            prev.directionService,

          directionServiceRecensement:
            recExistant?.directionServiceRecensement ??
            prev.directionServiceRecensement,

          objet:
            recExistant?.objet ??
            prev.objet,

          nomPrenomResponsable:
            recExistant?.nomPrenomResponsable ??
            prev.nomPrenomResponsable,

          fonctionResponsable:
            recExistant?.fonctionResponsable ??
            prev.fonctionResponsable,

          telephoneResponsable:
            recExistant?.telephoneResponsable ??
            prev.telephoneResponsable,

          emailResponsable:
            recExistant?.emailResponsable ??
            prev.emailResponsable,

          detenteurEffectif:
            recExistant?.detenteurEffectif ??
            prev.detenteurEffectif,
        }));

        setMessage(
          `SOA ${code} trouvé. Le recensement ${anneeSelectionnee} a été chargé et synchronisé.`
        );

      } catch (errRec) {

        console.error(
          "Erreur chargement recensement :",
          errRec
        );

        console.error(
          "Status :",
          errRec?.response?.status
        );

        console.error(
          "Data :",
          errRec?.response?.data
        );

        // RECENSEMENT INEXISTANT

        if (errRec?.response?.status === 404) {

          setForm((prev) => ({
            ...prev,

            annee: anneeSelectionnee,

            codeSoa:
              soaTrouve?.codeSoa ??
              soaTrouve?.code ??
              prev.codeSoa,

            ministere:
              soaTrouve?.ministere?.nomMinistere ??
              soaTrouve?.ministere ??
              prev.ministere,
          }));

          setMessage(
            `SOA ${code} trouvé. Aucun recensement n'existe encore pour ${anneeSelectionnee}.`
          );

          return;
        }

        // ERREUR SERVEUR

        const msgBackend =
          errRec?.response?.data?.message ||
          errRec?.response?.data?.error ||
          errRec?.message;

        if (msgBackend) {
          setErreur(
            `Erreur lors du chargement du recensement : ${msgBackend}`
          );
        } else {
          setErreur(
            "Impossible de communiquer avec le serveur lors du chargement du recensement."
          );
        }

        // On conserve quand même les informations du SOA
        setForm((prev) => ({
          ...prev,

          annee: anneeSelectionnee,

          codeSoa:
            soaTrouve?.codeSoa ??
            soaTrouve?.code ??
            prev.codeSoa,

          ministere:
            soaTrouve?.ministere?.nomMinistere ??
            soaTrouve?.ministere ??
            prev.ministere,
        }));
      }

    } catch (error) {

      console.error(
        "Erreur recherche SOA :",
        error
      );

      console.error(
        "Status :",
        error?.response?.status
      );

      console.error(
        "Data :",
        error?.response?.data
      );

      // SOA INTROUVABLE
      if (error?.response?.status === 404) {

        setMessage(
          `Le SOA ${code} n'existe pas encore dans le système.`
        );

        return;
      }

      // ERREUR SERVEUR=
      const msgGeneral =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      if (msgGeneral) {
        setErreur(msgGeneral);
      } else {
        setErreur(
          "Erreur de communication avec le serveur. Vérifiez que le backend Spring Boot est démarré."
        );
      }

      setSoa(null);

    } finally {
      setChargementSoa(false);
    }
  };

  // CRÉER LE SOA

  const creerSoa = async () => {
    setErreur("");
    setMessage("");

    if (!form.codeSoa.trim()) {
      setErreur("Veuillez saisir le code SOA.");
      return null;
    }

    try {
      /*
       * ATTENTION :
       * adapte les champs ci-dessous à ton SoaRequest actuel.
       */
      const response = await client.post("/soa", {
        codeSoa: form.codeSoa.trim(),
        ministere: form.ministere.trim() || null,
      });

      const nouveauSoa = response.data;

      setSoa(nouveauSoa);

      setMessage(
        `Le SOA ${form.codeSoa.trim()} a été créé avec succès.`
      );

      return nouveauSoa;
    } catch (error) {
      console.error("Erreur création SOA :", error);

      setErreur(
        error.response?.data?.message ||
        "Impossible de créer le SOA."
      );

      return null;
    }
  };

  //Fonction de retour

    // À INSÉRER JUSTE AVANT LE RETURN DU COMPOSANT SOURTIEQUITUS
  const handleRetourVehiculeSoa = () => {
    navigate("/patrimoine/vehicule", {
      state: {
        retourSoa: {
          // On renvoie le code brut du formulaire pour le recharger automatiquement
          codeSoa: form.codeSoa || soa?.codeSoa || ""
        }
      }
    });
  };

  // PRÉPARER LE RECENSEMENT
  const preparerRecensement = async (soaId) => {
    const payload = {
      annee: Number(form.annee),

      ministere: form.ministere.trim(),
      niveau: form.niveau.trim(),

      // Direction normale → QUITUS
      directionService: form.directionService.trim(),

      // Direction spécifique → RECENSEMENT
      directionServiceRecensement:
        form.directionServiceRecensement.trim(),

      objet: form.objet.trim(),

      nomPrenomResponsable:
        form.nomPrenomResponsable.trim(),

      fonctionResponsable:
        form.fonctionResponsable.trim(),

      telephoneResponsable:
        form.telephoneResponsable.trim(),

      emailResponsable:
        form.emailResponsable.trim(),

      detenteurEffectif:
        form.detenteurEffectif.trim(),

      soaId: soaId,
    };

    console.log("Payload recensement :", payload);

    const response = await client.post(
      "/recensements/preparer",
      payload
    );

    return response.data;
  };


  // METTRE À JOUR LES INFOS ET CONTINUER VERS LE RECENSEMENT

  const handleCreer = async (e) => {
    e.preventDefault();
    setErreur("");
    setMessage("");

    // Validations obligatoires
    if (!form.annee) return setErreur("Veuillez renseigner l'année.");
    if (!form.codeSoa.trim()) return setErreur("Veuillez saisir le code SOA.");
    if (!form.nomPrenomResponsable.trim()) return setErreur("Le nom du responsable est obligatoire.");
    if (!form.fonctionResponsable.trim()) return setErreur("La fonction du responsable est obligatoire.");

    try {
      setChargement(true);
      let soaFinal = soa;

      // 1. Récupération ou création automatique du SOA
      if (!soaFinal) {
        try {
          const response = await client.get(`/soa/code/${encodeURIComponent(form.codeSoa.trim())}`);
          soaFinal = response.data;
          setSoa(soaFinal);
        } catch (error) {
          if (error.response?.status === 404) {
            soaFinal = await creerSoa();
            if (!soaFinal) return;
          } else {
            throw error;
          }
        }
      }

      const soaId = soaFinal?.id || soaFinal?.soaId;
      if (!soaId) throw new Error("L'identifiant du SOA est introuvable.");

      // Préparation de la structure du payload pour le backend
      const payloadModification = {
        ministere: String(form.ministere || "").trim(),
        niveau: String(form.niveau || "").trim(),
        directionService: String(form.directionService || "").trim(),
        directionServiceRecensement: String(form.directionServiceRecensement || "").trim(),
        nomPrenomResponsable: String(form.nomPrenomResponsable || "").trim(),
        fonctionResponsable: String(form.fonctionResponsable || "").trim(), // Prend la nouvelle valeur saisie
        telephoneResponsable: String(form.telephoneResponsable || "").trim(),
        emailResponsable: String(form.emailResponsable || "").trim(),
        objet: String(form.objet || "").trim(),
        detenteurEffectif: String(form.detenteurEffectif || "").trim()
      };

      let recensement;

      // 2. Routage transactionnel vers le contrôleur Spring Boot
      try {
        const checkResponse = await client.get(`/recensements/annee/${form.annee}/soa/${soaId}`);
        const existant = checkResponse.data;

        // la mise à jour si il y a changement
        const updateResponse = await client.put(`/recensements/${existant.id}/infos`, payloadModification);
        recensement = updateResponse.data;
        console.log("Mise à jour des informations administratives réussie.");

      } catch (error) {
        if (error.response?.status === 404) {
          // Initialisation si le recensement n'existe pas encore pour cette année
          const payloadCreation = { ...payloadModification, soaId: Number(soaId), annee: Number(form.annee) };
          const createResponse = await client.post("/recensements/preparer", payloadCreation);
          recensement = createResponse.data;
          console.log("Nouveau recensement créé pour l'année sélectionnée.");
        } else {
          throw error;
        }
      }

      // 3. Mise à jour de la mémoire locale React
      setForm((prev) => ({
        ...prev,
        ministere: recensement.ministere || prev.ministere,
        niveau: recensement.niveau || prev.niveau,
        directionService: recensement.directionService || prev.directionService,
        directionServiceRecensement: recensement.directionServiceRecensement || prev.directionServiceRecensement,
        nomPrenomResponsable: recensement.nomPrenomResponsable || prev.nomPrenomResponsable,
        fonctionResponsable: recensement.fonctionResponsable || prev.fonctionResponsable,
        telephoneResponsable: recensement.telephoneResponsable || prev.telephoneResponsable,
        emailResponsable: recensement.emailResponsable || prev.emailResponsable,
        objet: recensement.objet || prev.objet,
        detenteurEffectif: recensement.detenteurEffectif || prev.detenteurEffectif,
      }));

      // 4. Redirection vers l'affichage des lignes du recensement
      navigate("/quitus/recensement", {
        state: {
          recensement,
          soaId,
          soa: soaFinal,
        },
      });

    } catch (error) {
      console.error("Erreur lors de l'enregistrement continu :", error);
      setErreur(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Une erreur est survenue lors de la mise à jour des données."
      );
    } finally {
      setChargement(false);
    }
  };

  // RENDU

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/patrimoine/vehicule"
          className="hover:text-haigana-blue transition-colors"
        >
          Véhicule
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Récensement
        </span>

      </div>

        {/* TITRE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-haigana-dark">
            Recensement
          </h1>

          <p className="text-gray-500 mt-2">
            Sélectionnez l'année et le code SOA afin de
            préparer le recensement des véhicules.
          </p>
        </div>

        {/* MESSAGE ERREUR */}
        {erreur && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {erreur}
          </div>
        )}

        {/* MESSAGE */}
        {message && !erreur && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleCreer}
          className="bg-white rounded-3xl shadow-lg p-8"
        >

          {/* ANNÉE + SOA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

            {/* ANNÉE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Année du recensement *
              </label>

              <input
                type="number"
                name="annee"
                min="2000"
                max="2050"
                value={form.annee}
                onChange={handleChange}
                placeholder="Ex : 2026"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-haigana-blue focus:border-haigana-blue outline-none"
              />
            </div>

            {/* CODE SOA */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code SOA *
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  name="codeSoa"
                  value={form.codeSoa}
                  onChange={handleChange}
                  placeholder="Entrer le code"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 uppercase focus:ring-2 focus:ring-haigana-blue focus:border-haigana-blue outline-none"
                />

                <button
                  type="button"
                  onClick={rechercherSoa}
                  disabled={
                    chargementSoa ||
                    !form.codeSoa.trim()
                  }
                  className="px-5 py-3 rounded-xl bg-haigana-blue text-white font-semibold disabled:opacity-50"
                >
                  {chargementSoa
                    ? "..."
                    : "Rechercher"}
                </button>
              </div>
            </div>
          </div>

          {/* ÉTAT DU SOA */}
          {soa && (
            <div className="mb-8 p-5 rounded-2xl bg-green-50 border border-green-200">
              <p className="font-semibold text-green-800">
                SOA trouvé
              </p>

              <p className="text-green-700 mt-1">
                Code :{" "}
                <strong>
                  {soa.codeSoa ||
                    soa.code ||
                    form.codeSoa}
                </strong>
              </p>

              {soa.id && (
                <p className="text-sm text-green-600 mt-1">
                  Identifiant : {soa.id}
                </p>
              )}
            </div>
          )}

          {/* INFORMATIONS ADMINISTRATIVES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MINISTÈRE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ministère *
              </label>

              <input
                type="text"
                name="ministere"
                value={form.ministere}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* NIVEAU */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niveau *
              </label>

              <input
                type="text"
                name="niveau"
                value={form.niveau}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* DIRECTION QUITUS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Direction / Service du quitus *
              </label>

              <input
                type="text"
                name="directionService"
                value={form.directionService}
                onChange={handleChange}
                placeholder="Direction / Service"
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* DIRECTION RECENSEMENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Direction / Service du recensement *
              </label>

              <input
                type="text"
                name="directionServiceRecensement"
                value={form.directionServiceRecensement}
                onChange={handleChange}
                placeholder="Direction / Service de recensement"
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* RESPONSABLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom et prénom du responsable *
              </label>

              <input
                type="text"
                name="nomPrenomResponsable"
                value={form.nomPrenomResponsable}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* FONCTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fonction du responsable *
              </label>

              <input
                type="text"
                name="fonctionResponsable"
                value={form.fonctionResponsable}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* TÉLÉPHONE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone *
              </label>

              <input
                type="text"
                name="telephoneResponsable"
                value={form.telephoneResponsable}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>

              <input
                type="email"
                name="emailResponsable"
                value={form.emailResponsable}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* DÉTENTEUR */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Détenteur effectif *
              </label>

              <input
                type="text"
                name="detenteurEffectif"
                value={form.detenteurEffectif}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>

            {/* OBJET */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Objet
              </label>

              <textarea
                name="objet"
                value={form.objet}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300"
              />
            </div>
          </div>

          {/* BOUTON */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={chargement}
              className="px-8 py-3 rounded-xl bg-haigana-gold text-white font-bold shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {chargement
                ? "Préparation..."
                : "Continuer vers le recensement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}