import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function RecensementComparer() {
  const location = useLocation();
  const navigate = useNavigate();

  const codeSoaCible = location.state?.codeSoa || "";
  const blocsExcel = Array.isArray(location.state?.blocs)
    ? location.state.blocs
    : location.state?.bloc
      ? [location.state.bloc]
      : [];

  const [soaId, setSoaId] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [nomMinistereCible, setNomMinistereCible] = useState("");
  const [districtMinistere, setDistrictMinistere] = useState("MAHAJANGA I");
  const [vehiculesBDD, setVehiculesBDD] = useState([]);
  const [vehiculesCompares, setVehiculesCompares] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("TOUT");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("IMMATRICULE");

  const normaliserTexte = (valeur) => {
    if (valeur === null || valeur === undefined) return "";
    return String(valeur).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  };

  const normaliserImmatriculation = (valeur) => {
    if (valeur === null || valeur === undefined) return "";
    return String(valeur).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  };

  const getValeurBDD = (vehicule, champ) => {
    if (!vehicule) return "";
    switch (champ) {
      case "marque": return vehicule.marque?.marqueVehicule || vehicule.marque || "";
      case "type": return vehicule.type?.typeDuVehicule || vehicule.type || "";
      case "genre": return vehicule.genre?.genreVehicule || vehicule.genre || "";
      case "etatGeneral": return vehicule.etat?.etatVehicule || vehicule.etatGeneral || "";
      case "nomDetenteur": return vehicule.detenteur?.nomDetenteur || vehicule.nomDetenteur || "";
      default: return "";
    }
  };

  const comparerValeurs = (excel, bdd) => {
    const valeurExcel = normaliserTexte(excel);
    const valeurBDD = normaliserTexte(bdd);
    if (!valeurExcel) return true;
    return valeurExcel === valeurBDD;
  };

    useEffect(() => {
    if (!codeSoaCible) {
      setError("Aucun Code SOA n'a été fourni.");
      return;
    }
    chargerDonneesEtComparer();
  }, [codeSoaCible]);

  const chargerDonneesEtComparer = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoaCible.trim())}`);
      const soa = resSoa.data;
      if (!soa || !soa.id) throw new Error("Code SOA introuvable en base de données.");

      setSoaId(soa.id);
      setRegionId(soa.region?.id || null);
      const nomModelMin = soa.ministere?.nomMinistere || "";
      setNomMinistereCible(nomModelMin);
      setDistrictMinistere(soa.ministere?.districtMinistere || "MAHAJANGA I");

      const resVehicules = await client.get(`/vehicules?soaId=${soa.id}`);
      const listeBDD = Array.isArray(resVehicules.data) ? resVehicules.data : [];
      setVehiculesBDD(listeBDD);

      executerComparaison(listeBDD, nomModelMin, soa.id);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Impossible de charger les véhicules.");
    } finally { setLoading(false); }
  };

  const executerComparaison = (listeBDD, ministereBDD, idSoa) => {
    if (!ministereBDD) {
      setError("Le Code SOA n'est associé à aucun ministère.");
      setVehiculesCompares([]);
      return;
    }

    const cleMinistereBDD = normaliserTexte(ministereBDD);
    const blocsDuMinistere = blocsExcel.filter(b => b && b.nomMinistere && normaliserTexte(b.nomMinistere) === cleMinistereBDD);

    if (blocsDuMinistere.length === 0) {
      setError(`Le ministère "${ministereBDD}" n'a pas été trouvé dans Excel.`);
      setVehiculesCompares([]);
      return;
    }

    const itemsExcel = blocsDuMinistere.flatMap(b => Array.isArray(b.vehicules) ? b.vehicules : []);
    const vehiculesBDDTries = [...listeBDD].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

    const resultats = [];
    const maxLines = Math.max(itemsExcel.length, vehiculesBDDTries.length);

    for (let i = 0; i < maxLines; i++) {
      const excel = itemsExcel[i] || null;
      const bdd = vehiculesBDDTries[i] || null;

      if (excel && !bdd) {
        resultats.push({
          ...excel, indexBoucle: i + 1, statut: "NOUVEAU", idBDD: null, originalValue: null, champsModifies: []
        });
      } else if (!excel && bdd) {
        resultats.push({
          immatricule: bdd.immatricule, indexBoucle: i + 1, idBDD: bdd.id, statut: "ABSENT", originalValue: bdd, champsModifies: [],
          marque: getValeurBDD(bdd, "marque") || "NON-SPECIFIE", type: getValeurBDD(bdd, "type") || "NON-SPECIFIE",
          genre: getValeurBDD(bdd, "genre") || "MOTO", etatGeneral: getValeurBDD(bdd, "etatGeneral") || "En marche",
          nomDetenteur: getValeurBDD(bdd, "nomDetenteur") || "Non spécifié"
        });
      } else if (excel && bdd) {
        const champsModifies = [];
        
        // ---------------------------------------------------------------------
        // FIX LIGNES SANS PLAQUES : PROTECTION DES CODES "TMP" GÉNÉRÉS EN BDD
        // ---------------------------------------------------------------------
        const immExcelUnie = normaliserImmatriculation(excel.immatricule);
        const immBDDUnie   = normaliserImmatriculation(bdd.immatricule);

        // Une modification d'immatriculation n'est levée QUE si la cellule Excel
        // possède une plaque réelle différente de la base de données
        if (immExcelUnie && immExcelUnie !== immBDDUnie && !immBDDUnie.startsWith("TMP")) {
          champsModifies.push("immatricule");
        }
        
        if (!comparerValeurs(excel.marque, getValeurBDD(bdd, "marque"))) champsModifies.push("marque");
        if (!comparerValeurs(excel.type, getValeurBDD(bdd, "type"))) champsModifies.push("type");
        if (!comparerValeurs(excel.genre, getValeurBDD(bdd, "genre"))) champsModifies.push("genre");
        if (!comparerValeurs(excel.etatGeneral, getValeurBDD(bdd, "etatGeneral"))) champsModifies.push("etatGeneral");
        if (!comparerValeurs(excel.nomDetenteur, getValeurBDD(bdd, "nomDetenteur"))) champsModifies.push("nomDetenteur");

        resultats.push({
          ...excel,

          // Conserver la valeur Excel pour la synchronisation
          immatricule: excel.immatricule || bdd.immatricule,

          // Garder également les deux valeurs pour le diagnostic
          immatriculeExcel: excel.immatricule || "",
          immatriculeBDD: bdd.immatricule || "",

          indexBoucle: i + 1,
          idBDD: bdd.id,
          originalValue: bdd,
          champsModifies,

          statut: champsModifies.length > 0 ? "MODIFIE" : "OK"
        });
      }
    }
    setVehiculesCompares(resultats);
  };

    const ajouterVehiculeBDD = async (vehiculeExcel) => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const immatricule = normaliserImmatriculation(vehiculeExcel.immatricule);
      if (!immatricule) throw new Error("L'immatriculation est obligatoire.");
      if (!soaId) throw new Error("Le SOA est introuvable.");

      const etatNormalise = normaliserTexte(vehiculeExcel.etatGeneral);
      let etatId = 1;
      if (etatNormalise.includes("PANNE")) etatId = 2;
      else if (etatNormalise.includes("CAL") || etatNormalise.includes("IMMOBIL")) etatId = 3;
      else if (etatNormalise.includes("EPAV")) etatId = 4;

      const payload = {
        immatricule, prixVehicule: 0, dateCirculation: new Date().toISOString().split("T")[0],
        categorie: "SERVICE", carteGriseDisponible: true, genre: vehiculeExcel.genre?.trim() || "MOTO",
        marque: vehiculeExcel.marque?.trim() || "NON-SPECIFIE", type: vehiculeExcel.type?.trim() || "NON-SPECIFIE",
        etatId, carburantId: null, soaId: Number(soaId), ministereId: null,
        nomDetenteur: vehiculeExcel.nomDetenteur?.trim() || "Non spécifié", prenomDetenteur: "Non spécifié",
        immatriculeDetenteur: `DET-${immatricule}`, cinDetenteur: "000000000000", districtDetenteur: districtMinistere,
        nomChauffeur: "Non spécifié", immatriculeChauffeur: `CHF-${immatricule}`, cinChauffeur: "000000000000",
        localiteTexte: districtMinistere, localiteLatitude: null, localiteLongitude: null, lieuParcoursDepart: null, lieuParcoursArrivee: null, pieceJustificativeUrl: null
      };

      await client.post("/vehicules/import-excel", payload);
      setSuccess(`Le véhicule ${immatricule} a été ajouté avec succès.`);
      await chargerDonneesEtComparer();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur d'ajout.");
    } finally { setLoading(false); }
  };

    // =====================================================================
  // FIX DEFINITIF : FORCER LA SYNCHRONISATION VIA LES ID CLÉS PRIMAIRES
  // =====================================================================
  const synchroniserVehicule = async (vehiculeCompare) => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const original = vehiculeCompare.originalValue;
      if (!original?.id) throw new Error("Véhicule BDD introuvable.");

      const etatTexte = normaliserTexte(vehiculeCompare.etatGeneral);
      let resolvedEtatId = original.etat?.id || 1;
      if (etatTexte.includes("PANNE")) resolvedEtatId = 2;
      else if (etatTexte.includes("CAL") || etatTexte.includes("IMMOBIL")) resolvedEtatId = 3;
      else if (etatTexte.includes("EPAV")) resolvedEtatId = 4;

      // Normalisation stricte de la plaque sans aucun espace (Ex: 3889TAK)
      const immatriculeNettoyee = normaliserImmatriculation(vehiculeCompare.immatricule);

      // Constitution du payload calqué à 100% sur VehiculeRequest.java du backend
      const payload = {
        immatricule: immatriculeNettoyee,
        prixVehicule: original.prixVehicule || 0,
        dateCirculation: original.dateCirculation || new Date().toISOString().split("T")[0],
        categorie: original.categorie || "SERVICE", 
        carteGriseDisponible: original.carteGriseDisponible ?? true,
        
        // Données textuelles lues depuis l'Excel
        genre: vehiculeCompare.genre?.trim() || "MOTO",
        marque: vehiculeCompare.marque?.trim() || "NON-SPECIFIE",
        type: vehiculeCompare.type?.trim() || "NON-SPECIFIE",
        
        // Alignement des identifiants techniques unitaires
        etatId: Number(resolvedEtatId), 
        carburantId: original.carburant?.id || null, 
        soaId: Number(soaId),

        // Détenteur : Transmission des IDs primaires existants pour interdire le conflit Hibernate
        nomDetenteur: vehiculeCompare.nomDetenteur?.trim() || "Non spécifié",
        prenomDetenteur: original.detenteur?.prenomDetenteur || "Non spécifié",
        immatriculeDetenteur: original.detenteur?.immatriculeDetenteur || `DET-${immatriculeNettoyee}`,
        cinDetenteur: original.detenteur?.cinDetenteur || "000000000000", 
        districtDetenteur: original.detenteur?.districtDetenteur || districtMinistere,
        detenteurId: original.detenteur?.id || null, // <-- CRITIQUE : Bloque l'erreur 500

        // Chauffeur : Transmission des IDs primaires existants
        nomChauffeur: original.chauffeur?.nomChauffeur || "Non spécifié",
        immatriculeChauffeur: original.chauffeur?.immatriculeChauffeur || `CHF-${immatriculeNettoyee}`,
        cinChauffeur: original.chauffeur?.cinChauffeur || "000000000000",
        chauffeurId: original.chauffeur?.id || null, // <-- CRITIQUE : Bloque l'erreur 500

        // Localisation
        localiteTexte: original.localiteTexte || districtMinistere,
        localiteLatitude: original.localiteLatitude || null,
        localiteLongitude: original.localiteLongitude || null,
        lieuParcoursDepart: original.lieuParcoursDepart || null,
        lieuParcoursArrivee: original.lieuParcoursArrivee || null,
        pieceJustificativeUrl: original.pieceJustificativeUrl || null,
        lieuAffectationActuel: original.lieuAffectationActuel || "Non spécifié"
      };

      // Appel de la modification sur l'URL gérée par le VehiculeController
      await client.put(`/vehicules/${original.id}`, payload);
      
      setSuccess(`Le véhicule ${immatriculeNettoyee} a été entièrement synchronisé avec succès.`);
      await chargerDonneesEtComparer(); // Rafraîchissement automatique de la matrice
    } catch (err) {
      console.error("Détail échec synchro :", err);
      setError(err.response?.data?.message || err.message || "Impossible de synchroniser le véhicule.");
    } finally {
      setLoading(false);
    }
  };

    const itemsFiltresEtTries = useMemo(() => {
    const recherche = searchTerm.toLowerCase().trim();
    const resultat = vehiculesCompares.filter((v) => {
      const matchStatus = filterStatus === "TOUT" || v.statut === filterStatus;
      const matchRecherche = !recherche || [v.immatricule, v.marque, v.type, v.genre, v.nomDetenteur].map(f => String(f ?? "").toLowerCase()).some(f => f.includes(recherche));
      return matchStatus && matchRecherche;
    });

    return [...resultat].sort((a, b) => {
      if (sortBy === "IMMATRICULE") return (a.immatricule || "").localeCompare(b.immatricule || "");
      if (sortBy === "MARQUE") return (a.marque || "").localeCompare(b.marque || "");
      if (sortBy === "STATUT") return (a.statut || "").localeCompare(b.statut || "");
      return 0;
    });
  }, [vehiculesCompares, filterStatus, searchTerm, sortBy]);

  const statistiques = useMemo(() => {
    return {
      total: vehiculesCompares.length,
      ok: vehiculesCompares.filter(v => v.statut === "OK").length,
      modifie: Math.max(0, vehiculesCompares.filter(v => v.statut === "MODIFIE").length),
      nouveau: vehiculesCompares.filter(v => v.statut === "NOUVEAU").length,
      absent: vehiculesCompares.filter(v => v.statut === "ABSENT").length
    };
  }, [vehiculesCompares]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Comparaison Analytique des Véhicules</h1>
            <p className="text-xs text-gray-500 mt-1">SOA : <span className="font-bold text-blue-600">{codeSoaCible}</span> {nomMinistereCible && `— ${nomMinistereCible}`}</p>
          </div>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50">Retour</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{success}</div>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[["TOTAL", statistiques.total, "bg-gray-50 text-gray-800"], ["OK", statistiques.ok, "bg-green-50 text-green-800 border-green-100"], ["MODIFIÉ", statistiques.modifie, "bg-amber-50 text-amber-800 border-amber-100"], ["NOUVEAU", statistiques.nouveau, "bg-blue-50 text-blue-800 border-blue-100"], ["ABSENT", statistiques.absent, "bg-red-50 text-red-800 border-red-100"]].map(([lbl, val, cls]) => (
            <div key={lbl} className={`border rounded-xl p-3 ${cls}`}><div className="text-[10px] font-bold opacity-60">{lbl}</div><div className="text-lg font-bold mt-1">{val}</div></div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-50 p-3 rounded-2xl border">
          <div className="flex flex-wrap gap-2">
            {["TOUT", "OK", "NOUVEAU", "MODIFIE", "ABSENT"].map(st => (
              <button key={st} type="button" onClick={() => setFilterStatus(st)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterStatus === st ? "bg-gray-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200/50"}`}>{st}</button>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600 px-2 py-1 bg-white rounded-lg border">{itemsFiltresEtTries.length} affiché(s) sur {vehiculesCompares.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input type="text" placeholder="Filtrer la grille..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-2 px-4 py-2.5 rounded-xl border text-xs font-medium outline-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl border text-xs font-bold bg-white text-gray-700 outline-none">
            <option value="IMMATRICULE">Trier par Immatriculation</option>
            <option value="MARQUE">Trier par Marque</option>
            <option value="STATUT">Trier par Statut</option>
          </select>
        </div>

        <div className="overflow-x-auto border rounded-2xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3 w-14 text-center">Index</th>
                <th className="p-3">Immatriculation</th>
                <th className="p-3">Marque</th>
                <th className="p-3">Type</th>
                <th className="p-3">Genre</th>
                <th className="p-3">État</th>
                <th className="p-3">Détenteur</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {itemsFiltresEtTries.map((v) => {
                let badgeClass = v.statut === "NOUVEAU" ? "bg-blue-100 text-blue-800" : v.statut === "MODIFIE" ? "bg-amber-100 text-amber-800" : v.statut === "ABSENT" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
                const cellMod = (c) => v.statut === "MODIFIE" && v.champsModifies?.includes(c) ? "bg-amber-100 text-amber-900 font-bold" : "";

                return (
                  <tr key={v.indexBoucle} className={`hover:bg-gray-50/50 ${v.statut === "ABSENT" ? "bg-red-50/5" : ""}`}>
                    <td className="p-3 text-center font-bold text-gray-400 bg-gray-50/30 border-r">{v.indexBoucle}</td>
                    <td className={`p-3 font-bold text-gray-800 ${cellMod("immatricule")}`}>{v.immatricule?.startsWith("SANS-PLAQUE-") ? "—" : v.immatricule}</td>
                    <td className={`p-3 ${cellMod("marque")}`}>{v.marque || "—"}</td>
                    <td className={`p-3 ${cellMod("type")}`}>{v.type || "—"}</td>
                    <td className={`p-3 ${cellMod("genre")}`}>{v.genre || "—"}</td>
                    <td className={`p-3 ${cellMod("etatGeneral")}`}>{v.etatGeneral || "—"}</td>
                    <td className={`p-3 ${cellMod("nomDetenteur")}`}>{v.nomDetenteur || "—"}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${badgeClass}`}>{v.statut}</span>
                      {v.statut === "MODIFIE" && v.champsModifies?.length > 0 && <div className="mt-1 text-[9px] text-amber-700 font-semibold">{v.champsModifies.join(", ")}</div>}
                    </td>
                    <td className="p-3 text-center">
                      {v.statut === "NOUVEAU" ? (
                        <button type="button" disabled={loading} onClick={() => ajouterVehiculeBDD(v)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px]">Ajouter</button>
                      ) : v.statut === "MODIFIE" ? (
                        <button type="button" disabled={loading} onClick={() => synchroniserVehicule(v)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold text-[11px]">Synchroniser</button>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
