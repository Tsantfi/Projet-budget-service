import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function RecensementMaterielComparer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraction de l'année d'exercice saisie passée dynamiquement par l'écran d'importation
  const { codeSoa, blocs, annee } = location.state || { codeSoa: "", blocs: [], annee: 2023 };
  const anneeCible = annee || 2023;

  const [soaId, setSoaId] = useState(null);
  const [nomMinistereCible, setNomMinistereCible] = useState("");
  const [materielsBDD, setMaterielsBDD] = useState([]);
  const [materielsCompares, setMaterielsCompares] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("TOUT");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("indexBoucle");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (!codeSoa) {
      setError("Aucun Code SOA n'a été fourni pour la comparaison matériel.");
      return;
    }
    chargerDonneesEtComparer();
  }, [codeSoa, anneeCible]);

  const chargerDonneesBDD = async () => {
    try {
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoa.trim())}`);
      const soaData = resSoa.data;
      if (soaData && soaData.id) {
        setSoaId(soaData.id);
        setNomMinistereCible(soaData.ministere?.nomMinistere || "MINISTERE DE L'ECONOMIE ET DES FINANCES");

        const resInventaire = await client.get(`/materiels/soa/${soaData.id}/annee/${Number(anneeCible)}`);
        const listBDD = resInventaire.data || [];

        // Tri déterministe absolu (Nomenclature puis Libellé Alphabétique) pour l'alignement 1 à N
        return [...listBDD].sort((a, b) => {
          const compNomen = String(a.nomenclatureNumero || "").localeCompare(String(b.nomenclatureNumero || ""));
          if (compNomen !== 0) return compNomen;
          return String(a.designation || "").trim().toLowerCase()
            .localeCompare(String(b.designation || "").trim().toLowerCase());
        });
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const chargerDonneesEtComparer = async () => {
    setLoading(true);
    setError("");
    const bddTriee = await chargerDonneesBDD();
    setMaterielsBDD(bddTriee);
    executerComparaisonSequentielle(bddTriee);
  };

    const normaliser = (v) => (v === null || v === undefined ? "" : String(v).trim().replaceAll(/\s+/g, " ").toLowerCase());

  const executerComparaisonSequentielle = (listeBDDValide) => {
    // 1. Récupération globale aplatie de tous les matériels du fichier Excel importé
    const itemsExcelBruts = (blocs || []).reduce((acc, current) => acc.concat(current.materiels || []), []);

    // 2. Tri déterministe absolu de la liste Excel pour correspondre parfaitement au tri de l'année BDD
    const itemsExcel = [...itemsExcelBruts].sort((a, b) => {
      const compNomen = String(a.nomenclatureNumero || "").localeCompare(String(b.nomenclatureNumero || ""));
      if (compNomen !== 0) return compNomen;
      return String(a.designation || "").trim().toLowerCase()
        .localeCompare(String(b.designation || "").trim().toLowerCase());
    });

    const resultatCroisement = [];
    const maxLines = Math.max(itemsExcel.length, listeBDDValide.length);

    // 3. Bouclage croisé géométrique index par index (de 1 à N) pour l'année courante
    for (let i = 0; i < maxLines; i++) {
      const mExcel = itemsExcel[i] || null;
      const mBDD = listeBDDValide[i] || null;

      if (mExcel && !mBDD) {
        const designationPropre = mExcel.designation ? String(mExcel.designation).trim() : "Matériel non spécifié";
        const designationTronquee = designationPropre.length > 255 ? designationPropre.substring(0, 250) + "..." : designationPropre;

        resultatCroisement.push({
          ...mExcel, designation: designationTronquee, indexBoucle: i + 1, idInventaireBDD: null, statut: "NOUVEAU", ecarts: {}
        });
      } else if (!mExcel && mBDD) {
        resultatCroisement.push({
          nomenclatureNumero: mBDD.nomenclatureNumero || "3", designation: mBDD.designation || "Matériel orphelin",
          especeUnite: mBDD.especeUnite || "N", prixUnitaire: mBDD.prixUnitaire || 0,
          existantDebutAnnee: mBDD.existantDebutAnnee || 0, entreesAnnee: mBDD.entreesAnnee || 0,
          sortiesAnnee: mBDD.sortiesAnnee || 0, resteFinAnnee: mBDD.resteFinAnnee || 0,
          decompte: mBDD.decompte || 0, etatGeneral: mBDD.observation || "En service",
          indexBoucle: i + 1, idInventaireBDD: mBDD.id, statut: "ABSENT", ecarts: {}
        });
      } else if (mExcel && mBDD) {
        const designationPropre = mExcel.designation ? String(mExcel.designation).trim() : "Matériel non spécifié";
        const designationTronquee = designationPropre.length > 255 ? designationPropre.substring(0, 250) + "..." : designationPropre;

        const diffNomen = normaliser(mExcel.nomenclatureNumero) !== normaliser(mBDD.nomenclatureNumero);
        const diffPrix = Number(mExcel.prixUnitaire) !== Number(mBDD.prixUnitaire);
        const diffExistant = Number(mExcel.existantDebutAnnee) !== Number(mBDD.existantDebutAnnee);
        const diffEntrees = Number(mExcel.entreesAnnee) !== Number(mBDD.entreesAnnee);
        const diffSorties = Number(mExcel.sortiesAnnee) !== Number(mBDD.sortiesAnnee);
        const diffReste = Number(mExcel.resteFinAnnee) !== Number(mBDD.resteFinAnnee);

        const estModifie = diffNomen || diffPrix || diffExistant || diffEntrees || diffSorties || diffReste;

        resultatCroisement.push({
          ...mExcel, designation: designationTronquee, indexBoucle: i + 1, idInventaireBDD: mBDD.id,
          statut: estModifie ? "MODIFIE" : "OK", originalValue: mBDD,
          ecarts: { diffNomen, diffPrix, diffExistant, diffEntrees, diffSorties, diffReste }
        });
      }
    }

    setMaterielsCompares(resultatCroisement);
    setLoading(false);
  };

    const gererEnregistrementMaterielUnitaire = async (itemCible) => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      let designationPropre = itemCible.designation ? String(itemCible.designation).trim() : "Matériel non spécifié";
      if (designationPropre.length > 255) designationPropre = designationPropre.substring(0, 250) + "...";

      const pu = Number(itemCible.prixUnitaire) || 0;
      const obsPropre = itemCible.etatGeneral ? String(itemCible.etatGeneral).substring(0, 490) : "En service";
      const chapitreText = String(itemCible.nomenclatureNumero).trim();
      const nomenclatureIdTechnique = chapitreText === "3" ? 1 : chapitreText === "5" ? 2 : chapitreText === "10" ? 3 : 1;

      const payloadUnifie = {
        soaId: Number(soaId), nomenclatureId: Number(nomenclatureIdTechnique), designation: designationPropre,
        especeUnite: itemCible.especeUnite || "N", prixUnitaire: pu,
        quantite: Number(itemCible.resteFinAnnee) || Number(itemCible.entreesAnnee) || 0,
        dateEntree: `${anneeCible}-01-01`, annee: Number(anneeCible), observation: obsPropre
      };

      if (itemCible.statut === "NOUVEAU") {
        await client.post("/materiels/inventaires", payloadUnifie);
        setSuccess(`Le matériel de la ligne ${itemCible.indexBoucle} a été créé.`);
      } else if (itemCible.statut === "MODIFIE") {
        await client.put(`/materiels/inventaires/${itemCible.idInventaireBDD}`, payloadUnifie);
        setSuccess(`Le matériel de la ligne ${itemCible.indexBoucle} a été mis à jour.`);
      }

      await chargerDonneesEtComparer();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la synchronisation de l'article.");
      setLoading(false);
    }
  };

  const handlePurgerLigneAbsente = async (inventaireId, indexLigne) => {
    const confirmation = window.confirm("Voulez-vous supprimer cette ligne d'inventaire annuel orpheline ?");
    if (!confirmation) return;

    setError(""); setSuccess(""); setLoading(true);
    try {
      await client.delete(`/materiels/inventaires/${inventaireId}`);
      setSuccess(`La ligne d'inventaire numéro ${indexLigne} a été purgée.`);
      await chargerDonneesEtComparer();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la suppression de la ligne.");
      setLoading(false);
    }
  };

    const itemsFiltresEtTries = useMemo(() => {
    let resultat = materielsCompares || [];
    resultat = resultat.filter(m => {
      const matchStatus = filterStatus === "TOUT" || m.statut === filterStatus;
      const texte = searchTerm.toLowerCase().trim();
      return matchStatus && (!texte || (m.designation || "").toLowerCase().includes(texte) || (String(m.nomenclatureNumero || "")).includes(texte));
    });

    return [...resultat].sort((a, b) => {
      let valA = a[sortBy === "NOMENCLATURE" ? "nomenclatureNumero" : sortBy === "STATUT" ? "statut" : "indexBoucle"];
      let valB = b[sortBy === "NOMENCLATURE" ? "nomenclatureNumero" : sortBy === "STATUT" ? "statut" : "indexBoucle"];

      if (sortBy === "indexBoucle") {
        return sortOrder === "asc" ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
      }
      return String(valA || "").localeCompare(String(valB || ""));
    });
  }, [materielsCompares, filterStatus, searchTerm, sortBy, sortOrder]);

  const renderCelluleConfrontee = (ligne, champ, valExcel, valBdd) => {
    const enEcart = ligne.ecarts && ligne.ecarts[champ];
    if (ligne.statut === "ABSENT") return <td className="p-2.5 text-red-700 bg-red-50/20 font-medium line-through border-r">{valBdd || "—"}</td>;
    if (ligne.statut === "NOUVEAU") return <td className="p-2.5 text-blue-700 font-semibold bg-blue-50/10 border-r">{valExcel || "—"}</td>;
    return (
      <td className={`p-2.5 border-r text-[11px] ${enEcart ? "bg-orange-50 font-medium border-orange-200" : ""}`}>
        <div className="font-semibold text-gray-800">{valExcel || "—"}</div>
        {enEcart && <div className="text-[10px] text-red-600 font-bold mt-0.5 border-t border-red-100 pt-0.5">BDD: {valBdd || "—"}</div>}
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Confrontation Analytique par Ligne d'Inventaire Matériel</h1>
            <p className="text-xs text-gray-500 mt-1">Analyse différentielle — SOA: {codeSoa} — Exercice Cible : <span className="text-blue-600 font-bold">{anneeCible}</span></p>
          </div>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50">Retour</button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs font-medium">{success}</div>}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-50 p-3 rounded-2xl border">
          <div className="flex flex-wrap gap-2">
            {["TOUT", "OK", "NOUVEAU", "MODIFIE", "ABSENT"].map(st => (
              <button key={st} type="button" onClick={() => setFilterStatus(st)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filterStatus === st ? "bg-gray-800 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200/50"}`}>{st}</button>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-600 px-2 py-1 bg-white rounded-lg border">{itemsFiltresEtTries.length} affiché(s) sur {materielsCompares.length} ligne(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input type="text" placeholder="Filtrer par désignation..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-2 px-4 py-2.5 rounded-xl border text-xs font-medium outline-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl border text-xs font-bold bg-white text-gray-700 focus:outline-none">
            <option value="indexBoucle">Trier par Ligne de Boucle</option>
            <option value="NOMENCLATURE">Trier par Nomenclature</option>
            <option value="STATUT">Trier par Statut</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500 font-medium">Comparaison Analytique des Véhicules en cours</div>
        ) : (
          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-2.5 text-center w-14">Ligne i</th>
                  <th className="p-2.5 w-14">Nomen.</th>
                  <th className="p-2.5">Désignation Matériel / Mobilier</th>
                  <th className="p-2.5 text-right">P.U (Ar)</th>
                  <th className="p-2.5 text-center">Existant (01/01)</th>
                  <th className="p-2.5 text-center">Entrées</th>
                  <th className="p-2.5 text-center">Sorties</th>
                  <th className="p-2.5 text-center">Reste (31/12)</th>
                  <th className="p-2.5 text-right">Décompte</th>
                  <th className="p-2.5 text-center">Statut</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemsFiltresEtTries.map((m, i) => {
                  const s = m.statut; const orig = m.originalValue || {};
                  let badgeClass = s === "NOUVEAU" ? "bg-blue-100 text-blue-800" : s === "MODIFIE" ? "bg-orange-100 text-orange-800" : s === "ABSENT" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";

                  return (
                    <tr key={m.indexBoucle || i} className={`hover:bg-gray-50/60 transition ${s === "ABSENT" ? "bg-red-50/10" : ""}`}>
                      <td className="p-2.5 text-center font-bold text-gray-400 bg-gray-50/50 border-r">{m.indexBoucle}</td>
                      {renderCelluleConfrontee(m, "diffNomen", m.nomenclatureNumero, orig.nomenclatureNumero)}
                      <td className="p-2.5 font-semibold text-gray-800 border-r">{m.designation}</td>
                      {renderCelluleConfrontee(m, "diffPrix", `${Number(m.prixUnitaire).toLocaleString("fr-FR")} Ar`, `${Number(orig.prixUnitaire).toLocaleString("fr-FR")} Ar`)}
                      {renderCelluleConfrontee(m, "diffExistant", m.existantDebutAnnee, orig.existantDebutAnnee)}
                      {renderCelluleConfrontee(m, "diffEntrees", m.entreesAnnee, orig.entreesAnnee)}
                      {renderCelluleConfrontee(m, "diffSorties", m.sortiesAnnee, orig.sortiesAnnee)}
                      {renderCelluleConfrontee(m, "diffReste", m.resteFinAnnee, orig.resteFinAnnee)}
                      <td className="p-2.5 text-right font-semibold border-r">{Number(m.decompte).toLocaleString("fr-FR")} Ar</td>
                      <td className="p-2.5 text-center border-r"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badgeClass}`}>{s}</span></td>
                      <td className="p-2.5 text-center">
                        {(s === "NOUVEAU" || s === "MODIFIE") ? (
                          <button type="button" onClick={() => gererEnregistrementMaterielUnitaire(m)} className="px-2.5 py-1 bg-gray-800 text-white rounded font-bold text-[10px] shadow-sm">Sync</button>
                        ) : s === "ABSENT" ? (
                          <button type="button" onClick={() => handlePurgerLigneAbsente(m.idInventaireBDD, m.indexBoucle)} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[10px] shadow-sm">Suppr</button>
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
        )}
      </div>
    </div>
  );
}
