import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function LogementComparer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Récupération sécurisée du lot de données issues de l'import Excel
  const { codeSoa, blocs, annee } = location.state || { codeSoa: "", blocs: [], annee: 2026 };

  const [logementsBDD, setLogementsBDD] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [soaId, setSoaId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("indexBoucle");
  const [sortOrder, setSortOrder] = useState("asc");

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  // Consolidation séquentielle globale de toutes les fiches de l'Excel (Indexation 1 à N d'origine)
  const logementsExcel = useMemo(() => {
    return (blocs || []).reduce((acc, current) => acc.concat(current.logements || []), []);
  }, [blocs]);

  useEffect(() => {
    if (!codeSoa) {
      setError("Aucun Code SOA fourni pour la confrontation analytique.");
      setLoading(false);
      return;
    }
    chargerDonneesBDD();
  }, [codeSoa]);

  const chargerDonneesBDD = async () => {
    try {
      setLoading(true); setError("");
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoa.trim())}`);
      const soaData = resSoa.data;

      if (soaData && soaData.id) {
        setSoaId(soaData.id);
        // APPEL TRÈS PRÉCIS : L'API renvoie les logements triés par Numero Asc et Id Asc
        const resLogements = await client.get(`/logements?soaId=${soaData.id}&annee=${Number(annee)}`);
        setLogementsBDD(Array.isArray(resLogements.data) ? resLogements.data : []);
      } else {
        setError("Identifiant technique du Code SOA introuvable sur le serveur.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de liaison lors de la récupération des données de confrontation.");
    } finally {
      setLoading(false);
    }
  };

    const normaliser = (v) => (v === null || v === undefined ? "" : String(v).trim().replaceAll(/\s+/g, " ").toLowerCase());

  // MOTEUR UNIFIÉ DE SÉLECTION PAR NUMÉRO DE BOUCLE CROISÉE
  const confrontationMatricielle = useMemo(() => {
    const lignesCalculees = [];
    const maxIndex = Math.max(logementsExcel.length, logementsBDD.length);

    // Bouclage de 0 à Max (1 à N) pour aligner les index physiques
    for (let i = 0; i < maxIndex; i++) {
      const itemExcel = logementsExcel[i] || null;
      const itemBdd = logementsBDD[i] || null;

      if (itemExcel && !itemBdd) {
        // CAS : Plus d'éléments dans l'Excel qu'en BDD pour cet index -> NOUVEAU
        lignesCalculees.push({
          idVirtuel: `xl-${i}`, indexBoucle: i + 1, numero: itemExcel.numero,
          excel: itemExcel, bdd: null, statut: "NOUVEAU", ecarts: []
        });
      } else if (!itemExcel && itemBdd) {
        // CAS : Plus d'éléments en BDD que dans l'Excel pour cet index -> SUPPRIME (Orphelin)
        lignesCalculees.push({
          idVirtuel: `bdd-${itemBdd.id}`, indexBoucle: i + 1, numero: itemBdd.numero,
          excel: null, bdd: itemBdd, statut: "SUPPRIME", ecarts: []
        });
      } else if (itemExcel && itemBdd) {
        // CAS UNIQUE : Les deux existent au même numéro de boucle, on compare les propriétés via l'ID de création
        const ecarts = [];
        if (normaliser(itemExcel.nomBatiment) !== normaliser(itemBdd.nomBatiment)) ecarts.push("nomBatiment");
        if (normaliser(itemExcel.nature) !== normaliser(itemBdd.nature)) ecarts.push("nature");
        if (normaliser(itemExcel.entiteUtilisatrice) !== normaliser(itemBdd.entiteUtilisatrice)) ecarts.push("entiteUtilisatrice");
        if (normaliser(itemExcel.occupant) !== normaliser(itemBdd.occupant)) ecarts.push("occupant");
        if (normaliser(itemExcel.etatBatisse) !== normaliser(itemBdd.etatBatisse)) ecarts.push("etatBatisse");
        if (normaliser(itemExcel.localite) !== normaliser(itemBdd.localite)) ecarts.push("localite");
        if (normaliser(itemExcel.adressePointRepere) !== normaliser(itemBdd.adressePointRepere)) ecarts.push("adressePointRepere");

        lignesCalculees.push({
          idVirtuel: `mix-${itemBdd.id}`, indexBoucle: i + 1, numero: itemExcel.numero,
          excel: itemExcel, bdd: itemBdd,
          statut: ecarts.length > 0 ? "MODIFIE" : "IDENTIQUE", ecarts
        });
      }
    }

    // Filtrage dynamique par le champ de recherche textuelle
    const terme = search.trim().toLowerCase();
    const lignesFiltrees = lignesCalculees.filter((l) => {
      if (!terme) return true;
      const ObjCible = l.excel || l.bdd || {};
      return [
        l.numero, l.indexBoucle, ObjCible.nomBatiment, ObjCible.nature, 
        ObjCible.entiteUtilisatrice, ObjCible.occupant, ObjCible.localite
      ].map((v) => String(v ?? "").toLowerCase()).some((v) => v.includes(terme));
    });

    // Tri dynamique multicritère
    return [...lignesFiltrees].sort((a, b) => {
      let valA = a.excel ? a.excel[sortField] : (a.bdd ? a.bdd[sortField] : "");
      let valB = b.excel ? b.excel[sortField] : (b.bdd ? b.bdd[sortField] : "");

      if (sortField === "indexBoucle" || sortField === "numero") {
        return sortOrder === "asc" ? (Number(valA || 0) - Number(valB || 0)) : (Number(valB || 0) - Number(valA || 0));
      }

      const strA = String(valA ?? "").toLowerCase();
      const strB = String(valB ?? "").toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [logementsExcel, logementsBDD, search, sortField, sortOrder]);

    const synchroniserLigne = async (ligne) => {
    setProcessingId(ligne.idVirtuel); setError(""); setSuccess("");
    try {
      if (ligne.statut === "MODIFIE" && ligne.bdd?.id) {
        const payloadPut = {
          numero: ligne.excel.numero ? Number(ligne.excel.numero) : null,
          nomBatiment: ligne.excel.nomBatiment?.trim(), nature: ligne.excel.nature?.trim(),
          entiteUtilisatrice: ligne.excel.entiteUtilisatrice?.trim(), occupant: ligne.excel.occupant?.trim() || "—",
          etatBatisse: ligne.excel.etatBatisse?.trim(), localite: ligne.excel.localite?.trim(),
          adressePointRepere: ligne.excel.adressePointRepere?.trim(), etatGeneral: ligne.bdd.etatGeneral || "En service"
        };
        await client.put(`/logements/${ligne.bdd.id}`, payloadPut);
        setSuccess(`Le bâtiment en boucle N° ${ligne.indexBoucle} a été synchronisé.`);
      } else if (ligne.statut === "NOUVEAU" && soaId) {
        const payloadPost = {
          soa: { id: Number(soaId) }, numero: ligne.excel.numero ? Number(ligne.excel.numero) : null,
          nomBatiment: ligne.excel.nomBatiment?.trim(), nature: ligne.excel.nature?.trim(),
          entiteUtilisatrice: ligne.excel.entiteUtilisatrice?.trim(), occupant: ligne.excel.occupant?.trim() || "—",
          etatBatisse: ligne.excel.etatBatisse?.trim(), localite: ligne.excel.localite?.trim(),
          adressePointRepere: ligne.excel.adressePointRepere?.trim(), etatGeneral: "En service",
          anneeInitiale: Number(annee), actif: true
        };
        await client.post("/logements", payloadPost);
        setSuccess(`Le nouveau bâtiment de la boucle N° ${ligne.indexBoucle} a été créé.`);
      }
      await chargerDonneesBDD();
    } catch (err) {
      console.error(err);
      setError("Erreur de traitement lors de la synchronisation unitaire.");
    } finally { setProcessingId(null); }
  };

  const renderCelluleConfrontee = (ligne, champ, valExcel, valBdd) => {
    const enEcart = ligne.ecarts.includes(champ);
    if (ligne.statut === "SUPPRIME") {
      return <td className="p-2.5 text-red-700 bg-red-50/20 font-medium line-through border-r">{valBdd || "—"}</td>;
    }
    if (ligne.statut === "NOUVEAU") {
      return <td className="p-2.5 text-blue-700 font-semibold bg-blue-50/10 border-r">{valExcel || "—"}</td>;
    }
    return (
      <td className={`p-2.5 border-r text-[11px] ${enEcart ? "bg-orange-50 border-orange-200" : ""}`}>
        <div className="font-semibold text-gray-800">{valExcel || "—"}</div>
        {enEcart && <div className="text-[10px] text-red-600 font-medium mt-0.5 border-t border-red-100 pt-0.5">BDD: {valBdd || "—"}</div>}
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Confrontation Analytique par Numéro de Boucle Excel</h1>
            <p className="text-xs font-semibold text-gray-500 mt-1">SOA : <span className="text-blue-600 font-bold">{codeSoa}</span> — Exercice : {annee}</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="px-4 py-2 border rounded-xl text-xs font-medium w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-100 transition" />
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-xl font-bold text-xs bg-white hover:bg-gray-50 transition shadow-sm">← Retour</button>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl font-medium text-xs border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl font-medium text-xs border border-green-100">{success}</div>}

        <div className="overflow-x-auto border bg-white rounded-2xl shadow-sm">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-gray-800 text-white select-none">
              <tr className="divide-x divide-gray-700">
                <th onClick={() => handleSort("indexBoucle")} className="p-3 text-center w-14 cursor-pointer hover:bg-gray-700">Ligne i {sortField === "indexBoucle" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("numero")} className="p-3 text-center w-12 cursor-pointer hover:bg-gray-700">N° {sortField === "numero" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("nomBatiment")} className="p-3 cursor-pointer hover:bg-gray-700">Nom du Bâtiment / Propriété {sortField === "nomBatiment" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("nature")} className="p-3 cursor-pointer hover:bg-gray-700">Nature {sortField === "nature" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
                <th onClick={() => handleSort("entiteUtilisatrice")} className="p-3 cursor-pointer hover:bg-gray-700">Entité Utilisatrice</th>
                <th className="p-3">Occupant</th>
                <th className="p-3">État Bâtisse</th>
                <th className="p-3">Localité</th>
                <th className="p-3">Adresse / Point Repère</th>
                <th className="p-3 text-center w-24">Statut</th>
                <th className="p-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">

                          {confrontationMatricielle.map((l) => {
                const s = l.statut;
                const badges = {
                  IDENTIQUE: "bg-green-50 text-green-700 border-green-200",
                  MODIFIE: "bg-orange-50 text-orange-700 border-orange-200",
                  NOUVEAU: "bg-blue-50 text-blue-700 border-blue-200",
                  SUPPRIME: "bg-red-50 text-red-700 border-red-200"
                };

                return (
                  <tr key={l.idVirtuel} className={`hover:bg-gray-50/40 ${s === "SUPPRIME" ? "bg-red-50/10" : s === "NOUVEAU" ? "bg-blue-50/10" : ""}`}>
                    {/* Index Physique de Boucle Croisée */}
                    <td className="p-2.5 text-center font-bold text-gray-400 bg-gray-50/50 border-r">{l.indexBoucle}</td>
                    <td className="p-2.5 text-center font-bold text-gray-700 border-r">{l.numero || "—"}</td>

                    {/* Confrontation des propriétés physiques */}
                    {renderCelluleConfrontee(l, "nomBatiment", l.excel?.nomBatiment, l.bdd?.nomBatiment)}
                    {renderCelluleConfrontee(l, "nature", l.excel?.nature, l.bdd?.nature)}
                    {renderCelluleConfrontee(l, "entiteUtilisatrice", l.excel?.entiteUtilisatrice, l.bdd?.entiteUtilisatrice)}
                    {renderCelluleConfrontee(l, "occupant", l.excel?.occupant, l.bdd?.occupant)}
                    {renderCelluleConfrontee(l, "etatBatisse", l.excel?.etatBatisse, l.bdd?.etatBatisse)}
                    {renderCelluleConfrontee(l, "localite", l.excel?.localite, l.bdd?.localite)}
                    {renderCelluleConfrontee(l, "adressePointRepere", l.excel?.adressePointRepere, l.bdd?.adressePointRepere)}

                    {/* Statut Écart */}
                    <td className="p-2.5 text-center border-r">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${badges[s]}`}>{s}</span>
                    </td>

                    {/* Action unitaire liée à l'ID de création de la BDD */}
                    <td className="p-2.5 text-center">
                      {s === "MODIFIE" || s === "NOUVEAU" ? (
                        <button type="button" disabled={processingId !== null} onClick={() => synchroniserLigne(l)} className={`w-full py-1 rounded-md text-white font-bold text-[10px] shadow-sm transition disabled:opacity-40 ${s === "NOUVEAU" ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                          {processingId === l.idVirtuel ? "..." : s === "NOUVEAU" ? "+" : "Sync"}
                        </button>
                      ) : s === "SUPPRIME" ? (
                        <span className="text-red-500 font-medium italic text-[10px]">Orphelin</span>
                      ) : (
                        <span className="text-green-600 font-bold text-sm">✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {confrontationMatricielle.length === 0 && <div className="p-10 text-center text-gray-400 italic text-xs">Aucun écart détecté sur ce Code SOA.</div>}
      </div>
    </div>
  );
}
