import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const EMPTY_HEADER = {
  ministere: "",
  niveau: "",
  directionService: "",
  objet: "",
  nom: "",
  prenom: "",
  fonction: "",
  telephone: "",
  email: "",
  objetTitreFoncier: "",
};

const STATUT_CONFIG = {
  IDENTIQUE: {
    label: "Identique",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  MODIFIE: {
    label: "Modifié",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  NOUVEAU: {
    label: "Nouveau",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  ABSENT: {
    label: "Absent",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};

function HeaderField({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200
                  focus:outline-none focus:ring-2
                  focus:ring-haigana-blue/20
                  focus:border-haigana-blue transition"
      />
    </div>
  );
}

function valeur(value) {
  return value === null ||
    value === undefined ||
    String(value).trim() === ""
    ? "—"
    : value;
}

export default function RecensementLogement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { hasRole } = useAuth();

  const canModify = hasRole(
    "ADMINISTRATEUR",
    "MODIFICATEUR"
  );

  const soaInitial =
    searchParams.get("soaId") || "";

  const codeSoaInitial =
    searchParams.get("codeSoa") || "";

  const anneeInitiale =
    searchParams.get("annee") || "";

  const [codeSoa, setCodeSoa] =
    useState(codeSoaInitial);

  const [soaId, setSoaId] =
    useState(soaInitial);

  const [annee, setAnnee] =
    useState(anneeInitiale);

  const [header, setHeader] = useState(
    EMPTY_HEADER
  );

  const [recensement, setRecensement] =
    useState(null);

  const [lignes, setLignes] = useState([]);

  const [phase, setPhase] = useState(
    soaInitial && anneeInitiale
      ? "formulaire"
      : "selection"
  );

  const [loading, setLoading] = useState(false);
  const [loadingExistant, setLoadingExistant] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  // NOUVEAU : États réactifs pour piloter le tri dynamique du tableau
  const [sortField, setSortField] = useState("numero");
  const [sortOrder, setSortOrder] = useState("asc");

    async function handleSynchroniserTout() {
    const lignesASynchroniser = lignes.filter(l => l.statut === "MODIFIE" || l.statut === "NOUVEAU");
    if (lignesASynchroniser.length === 0) {
      setSuccess("Toutes les fiches immobilières sont déjà synchronisées et identiques.");
      return;
    }

    setSaving(true); setError(""); setSuccess("");
    try {
      // Exécution synchrone en boucle pour garantir l'ordre de traitement des clés
      for (const ligne of lignesASynchroniser) {
        if (ligne.statut === "MODIFIE" && ligne.id) {
          const payloadMiseAJour = {
            id: ligne.id, logementId: ligne.logementId, numero: ligne.numero, nomBatiment: ligne.nomBatiment,
            nature: ligne.nature, entiteUtilisatrice: ligne.entiteUtilisatrice, occupant: ligne.occupant,
            etatBatisse: ligne.etatBatisse, localite: ligne.localite, adressePointRepere: ligne.adressePointRepere,
            etatGeneral: ligne.etatGeneral, statut: "IDENTIQUE"
          };
          await client.put(`/recensements-logements/lignes/${ligne.id}`, payloadMiseAJour);
        }
      }
      setSuccess("L'ensemble des fiches immobilières a été synchronisé de masse avec succès.");
      await chargerParSoa(); // Rafraîchissement complet du tableau
    } catch (err) {
      console.error("Erreur de synchronisation de masse :", err);
      setError(err.response?.data?.message || "Erreur lors de la synchronisation globale des bâtiments.");
    } finally {
      setSaving(false);
    }
  }


  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  async function chargerParSoa() {
    if (!codeSoa.trim()) {
      setError("Veuillez saisir un Code SOA.");
      return;
    }

    if (!annee) {
      setError("Veuillez saisir une année.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const soaResponse = await client.get(
        `/soa/code/${encodeURIComponent(
          codeSoa.trim()
        )}`
      );

      const soa = soaResponse.data;

      if (!soa?.id) {
        setError("Code SOA introuvable.");
        return;
      }

      setSoaId(soa.id);

      try {
        const recensementResponse =
          await client.get(
            `/recensements-logements/soa/${soa.id}/annee/${annee}`
          );

        const data =
          recensementResponse.data;

        setRecensement(data);

        setHeader({
          ministere:
            data?.ministere || "",
          niveau:
            data?.niveau || "",
          directionService:
            data?.directionService || "",
          objet:
            data?.objet || "",
          nom:
            data?.nom || "",
          prenom:
            data?.prenom || "",
          objetTitreFoncier: 
            data?.objetTitreFoncier || "",
          fonction:
            data?.fonction || "",
          telephone:
            data?.telephone || "",
          email:
            data?.email || "",
        });

        setLignes(
          data?.logements ||
          data?.lignes ||
          []
        );

        setPhase("formulaire");
        return;
      } catch (errExistant) {
        if (
          errExistant.response?.status !== 404
        ) {
          throw errExistant;
        }
      }

      // REMPLACER À LA FIN DE CHARGERPARSOA :
      setRecensement(null);
      setHeader({
        ...EMPTY_HEADER,
        ministere: soa.ministere?.nomMinistere || soa.nomMinistere || "",
        directionService: soa.ministere?.districtMinistere || "MAHAJANGA I"
      });
      setLignes([]);
      setPhase("formulaire");

    } catch (err) {
      console.error(
        "Erreur chargement recensement logement :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de charger le recensement."
      );
    } finally {
      setLoading(false);
    }
  }

    async function handleAccorderQuitus() {
    if (!recensement?.id) return;

    setSaving(true); setError(""); setSuccess("");
    try {
      const response = await client.put(`/recensements-logements/${recensement.id}/quitus`);
      const dataAjustee = response.data;
      setRecensement(dataAjustee);
      setSuccess("Quitus accordé. Redirection vers le document officiel...");

      // REDIRECTION PHYSIQUE VERS L'ÉCRAN REPRÉSENTANT LE QUITUS SÉLECTIONNÉ
      navigate("/quitus/logement-document", {
        state: {
          recensement: dataAjustee,
          soaId: Number(soaId)
        }
      });
    } catch (err) {
      console.error("Erreur quitus :", err);
      setError(err.response?.data?.message || "Impossible de générer le quitus.");
    } finally {
      setSaving(false);
    }
  }


  function handleHeaderChange(e) {
    const { name, value } = e.target;

    setHeader((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleDeleteRecensement() {
    if (!recensement?.id) return;

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer l'intégralité du recensement pour le Code SOA "${codeSoa}" pour l'année ${annee} ?\n\nCette opération est irréversible.`
    );

    if (!confirmation) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Appel de la route DELETE sur votre API Spring Boot
      await client.delete(`/recensements-logements/${recensement.id}`);

      setSuccess("Le recensement a été supprimé avec succès.");

      // Reset complet de l'état pour faire revenir l'utilisateur à l'écran de sélection
      setRecensement(null);
      setHeader(EMPTY_HEADER);
      setLignes([]);
      setPhase("selection");
    } catch (err) {
      console.error("Erreur suppression recensement :", err);
      setError(
        err.response?.data?.message ||
        "Les logements doit être aligné avant sa suppréssion"
      );
    } finally {
      setSaving(false);
    }
  }


  async function preparerRecensement() {
    if (!soaId) {
      setError(
        "Veuillez d'abord sélectionner un Code SOA."
      );
      return;
    }

    if (!annee) {
      setError("Veuillez saisir une année.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        soaId: Number(soaId),
        annee: Number(annee),

        ministere:
          header.ministere.trim() || null,

        niveau:
          header.niveau.trim() || null,

        directionService:
          header.directionService.trim() ||
          null,

        objet:
          header.objet.trim() || null,

        nom:
          header.nom.trim() || null,

        prenom:
          header.prenom.trim() || null,

        objetTitreFoncier:
          header.objetTitreFoncier.trim() || null,

        fonction:
          header.fonction.trim() || null,

        telephone:
          header.telephone.trim() || null,

        email:
          header.email.trim() || null,
      };

      const response =
        await client.post(
          "/recensements-logements/preparer",
          payload
        );

      const data = response.data;

      setRecensement(data);

      setHeader({
        ministere:
          data?.ministere ??
          payload.ministere ??
          "",
        niveau:
          data?.niveau ??
          payload.niveau ??
          "",
        directionService:
          data?.directionService ??
          payload.directionService ??
          "",
        objet:
          data?.objet ??
          payload.objet ??
          "",
        nom:
          data?.nom ??
          payload.nom ??
          "",

        prenom:
          data?.prenom ??
          payload.prenom ??
          "",

        fonction:
          data?.fonction ??
          payload.fonction ??
          "",

        telephone:
          data?.telephone ??
          payload.telephone ??
          "",

        email:
          data?.email ??
          payload.email ??
          "",

        objetTitreFoncier: 
          data?.objetTitreFoncier ?? 
          payload.objetTitreFoncier ??
          "",

      });

      setLignes(
        data?.logements ||
        data?.lignes ||
        []
      );

      setSuccess(
        "Recensement préparé avec succès."
      );
    } catch (err) {
      console.error(
        "Erreur préparation recensement :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de préparer le recensement."
      );
    } finally {
      setSaving(false);
    }
  }

  const statistiques = useMemo(() => {
    return {
      total: lignes.length,

      identiques: lignes.filter(
        (ligne) =>
          ligne.statut === "IDENTIQUE"
      ).length,

      modifies: lignes.filter(
        (ligne) =>
          ligne.statut === "MODIFIE"
      ).length,

      nouveaux: lignes.filter(
        (ligne) =>
          ligne.statut === "NOUVEAU"
      ).length,

      absents: lignes.filter(
        (ligne) =>
          ligne.statut === "ABSENT"
      ).length,
    };
  }, [lignes]);

    const lignesFiltrees = useMemo(() => {
    const terme = search.trim().toLowerCase();

    // 1. Filtrage initial par recherche textuelle et par badge de statut
    const effectif = lignes.filter((ligne) => {
      const correspondRecherche = !terme || [
        ligne.numero, ligne.nomBatiment, ligne.nature, ligne.entiteUtilisatrice,
        ligne.occupant, ligne.etatBatisse, ligne.localite, ligne.adressePointRepere, ligne.etatGeneral,
      ].map((v) => String(v ?? "").toLowerCase()).some((v) => v.includes(terme));

      const correspondStatut = filterStatut === "TOUS" || ligne.statut === filterStatut;
      return correspondRecherche && correspondStatut;
    });

    // 2. Tri dynamique avant renvoi (Garantit l'absence d'altération du tableau d'origine)
    return [...effectif].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Tri spécifique aux entiers pour le Numéro de Bâtiment
      if (sortField === "numero") {
        return sortOrder === "asc" 
          ? (Number(valA || 0) - Number(valB || 0)) 
          : (Number(valB || 0) - Number(valA || 0));
      }

      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [lignes, search, filterStatut, sortField, sortOrder]);

  const estChampModifie = (
    ligne,
    nomChamp
  ) => {
    return (
      ligne?.statut === "MODIFIE" &&
      Array.isArray(ligne?.champsModifies) &&
      ligne.champsModifies.includes(
        nomChamp
      )
    );
  };

  useEffect(() => {
    if (
      !soaInitial ||
      !anneeInitiale
    ) {
      return;
    }

    async function initialLoad() {
      setLoadingExistant(true);
      setError("");

      try {
        try {
          const response =
            await client.get(
              `/recensements-logements/soa/${soaInitial}/annee/${anneeInitiale}`
            );

          const data = response.data;

          setRecensement(data);

          setHeader({
            ministere:
              data?.ministere || "",
            niveau:
              data?.niveau || "",
            directionService:
              data?.directionService || "",
            objet:
              data?.objet || "",
            nom:
              data?.nom || "",
            prenom:
              data?.prenom || "",
            objetTitreFoncier:
              data?.objetTitreFoncier || "",
            fonction:
              data?.fonction || "",
            telephone:
              data?.telephone || "",
            email:
              data?.email || "",
          });

          setLignes(
            data?.logements ||
            data?.lignes ||
            []
          );
        } catch (err) {
          if (
            err.response?.status !== 404
          ) {
            throw err;
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger le recensement."
        );
      } finally {
        setLoadingExistant(false);
      }
    }

    initialLoad();
  }, [soaInitial, anneeInitiale]);

  // CORRECTIF : Fonction de persistance manquante raccordée à votre contrôleur Spring Boot
  async function validerModificationLogement(ligne) {
     if (!ligne?.id) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payloadMiseAJour = {
        id: ligne.id,
        logementId: ligne.logementId,
        numero: ligne.numero,
        nomBatiment: ligne.nomBatiment,
        nature: ligne.nature,
        entiteUtilisatrice: ligne.entiteUtilisatrice,
        occupant: ligne.occupant,
        etatBatisse: ligne.etatBatisse,
        localite: ligne.localite,
        adressePointRepere: ligne.adressePointRepere,
        etatGeneral: ligne.etatGeneral,
        statut: "IDENTIQUE"
      };

      // Appel de la route PUT active sur le backend
      await client.put(`/recensements-logements/lignes/${ligne.id}`, payloadMiseAJour);
      setSuccess(`Le bâtiment N° ${ligne.numero} a été synchronisé. Statut mis à jour.`);
      // Rechargement immédiat de la base de données pour basculer le badge au vert IDENTIQUE
      await chargerParSoa();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Impossible d'enregistrer la modification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-haigana-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="bg-gradient-to-br from-haigana-dark to-haigana-blue rounded-3xl p-7 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-white/70 text-sm">
                PATRIMOINE / LOGEMENT
              </p>

              <h1 className="text-3xl font-bold">
                Recensement des logements
              </h1>

              <p className="text-white/80 mt-2">
                Recensement annuel des bâtiments
                rattachés au Code SOA.
              </p>
            </div>

            <Link
              to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
                codeSoa
              )}&annee=${annee}`}
              className="px-5 py-3 rounded-xl bg-white/10
                        hover:bg-white/20 transition font-medium"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {/* SELECTION SOA / ANNEE */}
        {phase === "selection" && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code SOA
                </label>

                <input
                  value={codeSoa}
                  onChange={(e) =>
                    setCodeSoa(e.target.value)
                  }
                  placeholder="Ex : SOA-ANT-001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200                    focus:outline-none focus:ring-2
                  focus:ring-haigana-blue/20
                  focus:border-haigana-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Année
                </label>

                <input
                  type="number"
                  value={annee}
                  onChange={(e) =>
                    setAnnee(e.target.value)
                  }
                  placeholder="2026"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200
                            focus:outline-none focus:ring-2
                            focus:ring-haigana-blue/20
                            focus:border-haigana-blue"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={chargerParSoa}
                  disabled={loading}
                  className="w-full px-5 py-3 rounded-xl
                            bg-haigana-dark text-white font-medium
                            hover:bg-haigana-blue transition
                            disabled:opacity-50"
                >
                  {loading
                    ? "Recherche..."
                    : "Rechercher"}
                </button>
              </div>

            </div>
          </div>
        )}

        {(loadingExistant || loading) && (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-500">
            Chargement...
          </div>
        )}

        {/* FORMULAIRE ENTETE */}
        {phase === "formulaire" && (
          <>
            <div className="bg-white rounded-2xl shadow-card p-6">

              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

                <div>
                  <h2 className="text-xl font-semibold text-haigana-dark">
                    Informations du recensement
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    SOA :{" "}
                    <strong>{codeSoa}</strong>{" "}
                    — Année :{" "}
                    <strong>{annee}</strong>
                  </p>
                </div>
                {recensement && hasRole("ADMINISTRATEUR") && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleDeleteRecensement}
                    className="px-4 py-2.5 rounded-xl border border-red-200
                    bg-red-50 text-red-700 text-xs font-bold
                    hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {saving ? "Suppression..." : "Supprimer"}
                  </button>
                )}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <HeaderField
                  label="Ministère"
                  name="ministere"
                  value={header.ministere}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Niveau"
                  name="niveau"
                  value={header.niveau}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Direction / Service"
                  name="directionService"
                  value={header.directionService}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Objet"
                  name="objet"
                  value={header.objet}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Nom"
                  name="nom"
                  value={header.nom}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Prénom"
                  name="prenom"
                  value={header.prenom}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Fonction"
                  name="fonction"
                  value={header.fonction}
                  onChange={handleHeaderChange}
                />

                <HeaderField
                  label="Téléphone"
                  name="telephone"
                  value={header.telephone}
                  onChange={handleHeaderChange}
                  type="tel"
                />

                <div className="md:col-span-2">
                  <HeaderField
                    label="Email"
                    name="email"
                    value={header.email}
                    onChange={handleHeaderChange}
                    type="email"
                  />
                </div>

                <div className="md:col-span-2">
                  <HeaderField
                    label="Objet pour titre foncier (Propriété du Quitus)"
                    name="objetTitreFoncier"
                    value={header.objetTitreFoncier}
                    onChange={handleHeaderChange}
                    placeholder="Ex : « LA RESIDENCE », Titre n°1122-BR sise à La Corniche Mahajanga Ville..."
                  />
                </div>


              </div>
            </div>

            {/* ACTION FORMULAIRE */}
              <div className="bg-white rounded-2xl shadow-card p-6 flex justify-end gap-4">

                {/* BOUTON 1 : MISE A JOUR DE LA GRILLE COMMERCIALE */}
                {hasRole("ADMINISTRATEUR") && (
                <button
                  type="button"
                  onClick={preparerRecensement}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition disabled:opacity-50"
                >
                  {saving ? "Préparation..." : "Afficher le recensement"}
                </button>
                )}

                {/* BOUTON 2 : NOUVELLE OUVERTURE DE LA FICHE PAPIER PORTRAIT */}
                {recensement && (hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
                  <button
                    type="button"
                    onClick={() => navigate("/logement-recensement-document", { state: { recensement, soaId: Number(soaId) } })}
                    className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap"
                  >
                    Imprimer Fiche
                  </button>
                )}

                {/* BOUTON 3 : VALIDATION COMPTABLE DE FIN D'EXERCICE */}
                {(hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleAccorderQuitus}
                  className="px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition disabled:opacity-50"
                >
                  {saving ? "Génération..." : "Quitus"}
                </button>
                )}

                {lignes.some(l => l.statut === "MODIFIE" || l.statut === "NOUVEAU") && hasRole("ADMINISTRATEUR") && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSynchroniserTout}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                    >
                      {saving ? "Synchronisation..." : "Synchroniser Tout"}
                    </button>
                )}

              </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

              <button
                type="button"
                onClick={() => setFilterStatut("TOUS")}
                className="bg-white rounded-2xl shadow-card p-5 text-left"
              >
                <p className="text-sm text-gray-500">
                  Total
                </p>

                <p className="text-2xl font-bold text-haigana-dark mt-1">
                  {statistiques.total}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilterStatut("IDENTIQUE")
                }
                className="bg-green-50 rounded-2xl border border-green-200 p-5 text-left"
              >
                <p className="text-sm text-green-700">
                  Identiques
                </p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {statistiques.identiques}
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilterStatut("MODIFIE")
                }
                className="bg-orange-50 rounded-2xl border border-orange-200 p-5 text-left"
              >
                <p className="text-sm text-orange-700">
                  Modifiés
                </p>

                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {statistiques.modifies}
                </p>
              </button>


              <button
                type="button"
                onClick={() =>
                  setFilterStatut("NOUVEAU")
                }
                className="bg-blue-50 rounded-2xl border border-blue-200 p-5 text-left"
              >
                <p className="text-sm text-blue-700">
                  Nouveaux
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {statistiques.nouveaux}
                </p>
              </button>
              

              <button
                type="button"
                onClick={() =>
                  setFilterStatut("ABSENT")
                }
                className="bg-red-50 rounded-2xl border border-red-200 p-5 text-left"
              >
                <p className="text-sm text-red-700">
                  Absents
                </p>

                <p className="text-2xl font-bold text-red-700 mt-1">
                  {statistiques.absents}
                </p>
              </button>

            </div>

            {/* RECHERCHE TABLEAU */}
            <div className="bg-white rounded-2xl shadow-card p-6">

              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">

                <div>
                  <h2 className="text-xl font-semibold text-haigana-dark">
                    TABLEAU BATIMENT
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {lignesFiltrees.length} bâtiment(s)
                  </p>
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Rechercher..."
                  className="w-full md:w-80 px-4 py-3 rounded-xl
                            border border-gray-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-haigana-blue/20
                            focus:border-haigana-blue"
                />
              </div>

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>
                    <tr className="bg-haigana-dark text-white select-none">
                      <th onClick={() => handleSort("numero")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        N° {sortField === "numero" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("nomBatiment")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        Nom du bâtiment {sortField === "nomBatiment" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("nature")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        Nature {sortField === "nature" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("entiteUtilisatrice")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        Utilisateurs {sortField === "entiteUtilisatrice" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>

                      <th onClick={() => handleSort("etatBatisse")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        État bâtisse {sortField === "etatBatisse" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("localite")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        Localité {sortField === "localite" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Adresse / repère</th>
                      <th onClick={() => handleSort("etatGeneral")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        État général {sortField === "etatGeneral" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th onClick={() => handleSort("statut")} className="px-5 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700 transition">
                        Statut {sortField === "statut" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {lignesFiltrees.length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          Aucun bâtiment trouvé.
                        </td>
                      </tr>
                    ) : (
                      lignesFiltrees.map((ligne, index) => {

                        const statut =
                          ligne?.statut || "IDENTIQUE";

                        const statutConfig =
                          STATUT_CONFIG[statut] ||
                          STATUT_CONFIG.IDENTIQUE;

                        return (
                          <tr
                            key={ligne.id || `rec-ligne-${index}`}
                            className="hover:bg-haigana-bg/60 transition"
                          >

                            {/* N° */}
                            <td className="px-5 py-4 font-medium text-haigana-dark">
                              {valeur(ligne.numero)}
                            </td>

                            {/* NOM */}
                            <td
                              className={`px-5 py-4 font-medium ${estChampModifie(
                                ligne,
                                "nomBatiment"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-800"
                                }`}
                            >
                              {valeur(ligne.nomBatiment)}
                            </td>

                            {/* NATURE */}
                            <td
                              className={`px-5 py-4 ${estChampModifie(
                                ligne,
                                "nature"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                                }`}
                            >
                              {valeur(ligne.nature)}
                            </td>

                            {/* UTILISATEUR */}
                            <td
                              className={`px-5 py-4 ${
                                estChampModifie(ligne, "entiteUtilisatrice")
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >
                              {valeur(ligne.entiteUtilisatrice)}
                            </td>


                            {/* ETAT BATISSE */}
                            <td
                              className={`px-5 py-4 ${estChampModifie(
                                ligne,
                                "etatBatisse"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                                }`}
                            >
                              {valeur(ligne.etatBatisse)}
                            </td>

                            {/* LOCALITE */}
                            <td
                              className={`px-5 py-4 ${estChampModifie(
                                ligne,
                                "localite"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                                }`}
                            >
                              {valeur(ligne.localite)}
                            </td>

                            {/* ADRESSE */}
                            <td
                              className={`px-5 py-4 ${estChampModifie(
                                ligne,
                                "adressePointRepere"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                                }`}
                            >
                              {valeur(
                                ligne.adressePointRepere
                              )}
                            </td>

                            {/* ETAT GENERAL */}
                            <td
                              className={`px-5 py-4 ${estChampModifie(
                                ligne,
                                "etatGeneral"
                              )
                                  ? "bg-green-50 text-green-700 font-semibold"
                                  : "text-gray-600"
                                }`}
                            >
                              {valeur(ligne.etatGeneral)}
                            </td>

                            {/* =========================
                                STATUT
                            ========================= */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center
                                px-3 py-1.5 rounded-full
                                border text-xs font-semibold
                                whitespace-nowrap
                                ${statutConfig.className}`}
                              >
                                {statutConfig.label}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">

                                {statut === "NOUVEAU" &&
                                  hasRole("ADMINISTRATEUR") && (
                                    <button
                                      type="button"
                                      onClick={() => validerModificationLogement(ligne)}
                                      disabled={saving}
                                      className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition font-medium text-xs"
                                    >
                                      Ajouter
                                    </button>
                                  )}

                                {statut === "MODIFIE" &&
                                  canModify && (
                                    <button
                                      type="button"
                                      onClick={() => validerModificationLogement(ligne)}
                                      disabled={saving}
                                      className="px-3 py-2 rounded-lg
                                                bg-orange-50 text-orange-700
                                                border border-orange-200
                                                hover:bg-orange-100 transition font-medium text-xs"
                                    >
                                      Modifier
                                    </button>
                                  )}

                                {statut === "ABSENT" && (
                                  <span
                                    className="px-3 py-2 rounded-lg
                                              bg-red-50 text-red-700
                                              border border-red-200
                                              text-xs font-medium"
                                  >
                                    Supprimé
                                  </span>
                                )}

                                {statut === "IDENTIQUE" && (
                                  <span className="text-gray-400 text-xs font-medium">
                                    —
                                  </span>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}

                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="px-5 py-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
                {success}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/patrimoine/logement?codeSoa=${encodeURIComponent(
                      codeSoa
                    )}&annee=${annee}`
                  )
                }
                className="px-6 py-3 rounded-xl border border-gray-200
                text-gray-700 font-medium
                hover:bg-gray-50 transition"
              >
                Retour aux logements
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}