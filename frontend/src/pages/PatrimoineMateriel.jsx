import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PatrimoineMateriel() {
  const [codeSoa, setCodeSoa] = useState("");
  const [annee, setAnnee] = useState(String(new Date().getFullYear()));

  const [soaId, setSoaId] = useState(null);
  const [inventaire, setInventaire] = useState([]);
  const [nomenclatures, setNomenclatures] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("nomenclatureNumero");
  const [sortDirection, setSortDirection] = useState("asc");

  const [showEntreeModal, setShowEntreeModal] = useState(false);
  const navigate = useNavigate();

  const [formEntree, setFormEntree] = useState({
    nomenclatureId: "", designation: "", especeUnite: "N", prixUnitaire: "", quantite: "", dateEntree: "", observation: ""
  });

  const [showSortieModal, setShowSortieModal] = useState(false);
  const [materielSelectionne, setMaterielSelectionne] = useState(null);
  const [pageNomenclature, setPageNomenclature] = useState(0);

  const [formSortie, setFormSortie] = useState({ quantite: "", dateSortie: "", observation: "" });
  const { hasRole } = useAuth();
  const tableauAffiche = inventaire.length > 0;

  useEffect(() => {
    chargerNomenclatures();
  }, []);

  const chargerNomenclatures = async () => {
    try {
      const response = await client.get("/materiels/nomenclatures");
      setNomenclatures(response.data || []);
    } catch (err) {
      console.error("Erreur chargement nomenclatures :", err);
      setNomenclatures([]);
      setError(err.response?.data?.message || "Impossible de charger les nomenclatures.");
    }
  };

    const supprimerMateriel = async (ligne) => {
    if (!ligne?.materielId) return;
    const confirmation = window.confirm(`Voulez-vous vraiment supprimer le matériel "${ligne.designation}" ?`);
    if (!confirmation) return;

    try {
      setSaving(true); setError(""); setSuccess("");
      await client.delete(`/materiels/${ligne.materielId}`);
      setSuccess(`Le matériel "${ligne.designation}" a été supprimé de l'inventaire actif.`);
      await chargerInventaire(soaId);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Impossible de supprimer.");
    } finally { setSaving(false); }
  };

  // CORRECTIF 01 : Moteur de Recherche combiné à l'algorithme de Tri Dynamique
  const inventaireFiltreEtTrie = useMemo(() => {
    const terme = search.trim().toLowerCase();
    
    // Étape A : Filtrage par mots-clés
    let res = inventaire.filter((ligne) => {
      if (!terme) return true;
      const nomenclature = `${ligne.nomenclatureNumero || ""} ${ligne.nomenclatureDesignation || ""}`.toLowerCase();
      return nomenclature.includes(terme) || (ligne.designation || "").toLowerCase().includes(terme) || (ligne.especeUnite || "").toLowerCase().includes(terme);
    });

    // Étape B : Tri effectif des lignes avant le groupement
    return res.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [inventaire, search, sortField, sortDirection]);

  const changerTri = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderFleche = (field) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-haigana-blue font-bold ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  // CORRECTIF 02 : Groupement structuré basé sur les lignes filtrées et triées
  const groupesNomenclature = useMemo(() => {
    const groupes = new Map();

    inventaireFiltreEtTrie.forEach((ligne) => {
      const numero = ligne.nomenclatureNumero ?? 0;
      const designation = ligne.nomenclatureDesignation || "Sans désignation";
      const cle = `${numero}-${designation}`;

      if (!groupes.has(cle)) {
        groupes.set(cle, { numero, designation, lignes: [] });
      }
      groupes.get(cle).lignes.push(ligne);
    });

    return Array.from(groupes.values()).sort((a, b) => a.numero - b.numero);
  }, [inventaireFiltreEtTrie]);

  const nomenclatureActuelle = groupesNomenclature[pageNomenclature] || null;
  
  // FIX CRITIQUE : Seules les lignes de la nomenclature active doivent être rendues à l'écran
  const lignesNomenclature = nomenclatureActuelle?.lignes || [];

  const totalDecompte = useMemo(() => {
    return lignesNomenclature.reduce((total, ligne) => total + Number(ligne.decompte || 0), 0);
  }, [lignesNomenclature]);

    const chargerInventaire = async (soaIdRecherche = soaId) => {
    if (!soaIdRecherche) return;
    try {
      setLoading(true); setError("");
      const response = await client.get(`/materiels/soa/${soaIdRecherche}/annee/${annee}`);
      setInventaire(response.data || []);
    } catch (err) {
      setInventaire([]);
      setError(err.response?.data?.message || err.response?.data?.error || "Impossible de charger.");
    } finally { setLoading(false); }
  };

  const rechercherInventaire = async (e) => {
    e?.preventDefault(); setError(""); setSuccess(""); setInventaire([]);
    if (!codeSoa.trim()) return setError("Veuillez saisir un code SOA.");
    if (!annee) return setError("Veuillez saisir une année.");

    try {
      setLoading(true);
      const responseSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoa.trim())}`);
      const idSoa = responseSoa.data?.id;
      if (!idSoa) throw new Error("Identifiant du code SOA introuvable.");
      setSoaId(idSoa);

      const responseInventaire = await client.get(`/materiels/soa/${idSoa}/annee/${annee}`);
      setInventaire(responseInventaire.data || [] );
      setPageNomenclature(0);
      setSuccess(`Inventaire ${annee} du SOA "${codeSoa.trim()}" chargé avec succès.`);
    } catch (err) {
      setError(err.response?.status === 404 ? `Le code SOA "${codeSoa.trim()}" est introuvable.` : "Erreur.");
    } finally { setLoading(false); }
  };

  const handleAnneeChange = (e) => {
    const nouvelleAnnee = e.target.value; setAnnee(nouvelleAnnee);
    setFormEntree(prev => ({ ...prev, dateEntree: nouvelleAnnee ? `${nouvelleAnnee}-01-01` : "" }));
    setFormSortie(prev => ({ ...prev, dateSortie: nouvelleAnnee ? `${nouvelleAnnee}-01-01` : "" }));
  };

  const handleEntreeChange = (e) => {
    const { name, value } = e.target;
    setFormEntree(prev => ({ ...prev, [name]: value }));
  };

  const ouvrirEntree = () => {
    if (!soaId) return setError("Veuillez d'abord rechercher un code SOA.");
    setFormEntree({ nomenclatureId: "", designation: "", especeUnite: "N", prixUnitaire: "", quantite: "", dateEntree: `${annee}-01-01`, observation: "" });
    setShowEntreeModal(true);
  };

  const enregistrerEntree = async () => {
    if (!formEntree.nomenclatureId || !formEntree.designation.trim() || Number(formEntree.prixUnitaire) < 0 || Number(formEntree.quantite) <= 0) {
      setError("Veuillez remplir correctement les champs obligatoires."); return;
    }
    try {
      setSaving(true);
      const payload = { soaId: Number(soaId), nomenclatureId: Number(formEntree.nomenclatureId), designation: formEntree.designation.trim(), especeUnite: formEntree.especeUnite.trim(), prixUnitaire: Number(formEntree.prixUnitaire), quantite: Number(formEntree.quantite), dateEntree: formEntree.dateEntree, annee: Number(annee), observation: formEntree.observation.trim() || null };
      await client.post("/materiels/entrees", payload);
      setShowEntreeModal(false); setSuccess("Enregistré avec succès."); await chargerInventaire(soaId);
    } catch (err) { setError("Erreur."); } finally { setSaving(false); }
  };

    const ouvrirSortie = (materiel) => {
    setMaterielSelectionne(materiel);
    setFormSortie({ quantite: "", dateSortie: `${annee}-01-01`, observation: "" });
    setShowSortieModal(true);
  };

  const handleSortieChange = (e) => {
    const { name, value } = e.target;
    setFormSortie(prev => ({ ...prev, [name]: value }));
  };

  const enregistrerSortie = async () => {
    if (!materielSelectionne || Number(formSortie.quantite) <= 0) return;
    try {
      setSaving(true);
      const payload = { materielId: Number(materielSelectionne.materielId), quantite: Number(formSortie.quantite), dateSortie: formSortie.dateSortie, annee: Number(annee), observation: formSortie.observation.trim() || null };
      await client.post("/materiels/sorties", payload);
      setShowSortieModal(false); setSuccess("Sortie effectuée."); await chargerInventaire(soaId);
    } catch (err) { setError("Erreur."); } finally { setSaving(false); }
  };

  const modifierLigne = (id, champ, valeur) => {
    setInventaire(prev => prev.map(l => l.id === id ? { ...l, [champ]: valeur } : l));
  };

  const enregistrerInventaire = async (ligne) => {
    try {
      setSaving(true);
      await client.put(`/materiels/inventaires/${ligne.id}`, { decompte: Number(ligne.decompte) || 0, observation: ligne.observation?.trim() || null });
      setSuccess("Mis à jour."); await chargerInventaire(soaId);
    } catch (err) { setError("Erreur."); } finally { setSaving(false); }
  };

  const formatMontant = (m) => m === null || m === undefined ? "—" : Number(m).toLocaleString("fr-FR");

  return (
    <div className={`bg-gray-50 p-4 md:p-6 lg:p-8 ${tableauAffiche ? "min-h-screen" : "min-h-0"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6"><h1 className="text-2xl font-bold text-haigana-dark">Inventaire des matériels</h1></div>

        <form onSubmit={rechercherInventaire} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row items-end gap-4 mb-6">
          <div className="w-full md:flex-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Code SOA</label><input type="text" value={codeSoa} onChange={(e) => setCodeSoa(e.target.value)} placeholder="Entrer le code" className="w-full px-4 py-2.5 rounded-xl border uppercase outline-none" /></div>
          <div className="w-full md:w-44"><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Année</label><input type="number" value={annee} onChange={handleAnneeChange} className="w-full px-4 py-2.5 rounded-xl border outline-none" /></div>
          <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-haigana-dark text-white font-semibold">{loading ? "..." : "Rechercher"}</button>
          {hasRole("ADMINISTRATEUR") && <button type="button" onClick={() => navigate("/patrimoine/materiels/import")} className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-green-700 text-white font-semibold shadow-sm text-sm h-[46px] flex items-center justify-center gap-2">Importer Excel</button>}
        </form>

        {error && <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium">{error}</div>}
        {success && <div className="mb-4 p-4 rounded-xl bg-green-50 text-green-700 text-sm font-medium">{success}</div>}

        {soaId && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div><h2 className="text-xl font-bold text-haigana-dark">{codeSoa.toUpperCase()}</h2><p className="text-sm text-gray-500 mt-1">Année {annee}</p></div>
              <div className="flex gap-2">
                {hasRole("ADMINISTRATEUR") && <button type="button" onClick={ouvrirEntree} className="px-5 py-3 rounded-xl bg-haigana-blue text-white font-semibold">+ Entrée</button>}
                {hasRole("ADMINISTRATEUR") && <button type="button" onClick={() => navigate("/patrimoine/materiel/recensement", { state: { soaId, codeSoa: codeSoa.toUpperCase(), annee: Number(annee) } })} className="px-5 py-3 rounded-xl bg-haigana-gold text-haigana-dark font-semibold">Recensement</button>}
                <button type="button" onClick={() => navigate("/patrimoine/materiel/etat-appreciatif", { state: { soaId, codeSoa, annee: Number(annee) } })} className="px-5 py-2.5 rounded-xl bg-haigana-blue text-white font-semibold">État appréciatif</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un matériel..." className="w-full md:max-w-md pl-4 pr-4 py-2.5 rounded-xl bg-gray-50 border text-sm outline-none" />
                <p className="text-sm text-gray-500">{lignesNomenclature.length} ligne(s) dans cette nomenclature</p>
              </div>

              {groupesNomenclature.length > 0 && (
                <div className="bg-white px-5 py-4 flex items-center justify-between border-b">
                  <button type="button" disabled={pageNomenclature === 0} onClick={() => setPageNomenclature(prev => Math.max(prev - 1, 0))} className="w-10 h-10 rounded-xl border text-gray-600 font-bold disabled:opacity-30">←</button>
                  <div className="text-center"><p className="text-xs uppercase text-gray-400 font-bold">Nomenclature</p><p className="text-lg font-bold text-haigana-dark">{nomenclatureActuelle?.numero} - {nomenclatureActuelle?.designation}</p><p className="text-xs text-gray-400 mt-1">{pageNomenclature + 1} / {groupesNomenclature.length}</p></div>
                  <button type="button" disabled={pageNomenclature >= groupesNomenclature.length - 1} onClick={() => setPageNomenclature(prev => Math.min(prev + 1, groupesNomenclature.length - 1))} className="w-10 h-10 rounded-xl border text-gray-600 font-bold disabled:opacity-30">→</button>
                </div>
              )}

                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b text-gray-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-5 py-4">N°</th>
                      <th className="px-5 py-4 cursor-pointer" onClick={() => changerTri("nomenclatureNumero")}>Nomenclature {renderFleche("nomenclatureNumero")}</th>
                      <th className="px-5 py-4 cursor-pointer" onClick={() => changerTri("designation")}>Désignation {renderFleche("designation")}</th>
                      <th className="px-5 py-4">Unité</th>
                      <th className="px-5 py-4 text-right cursor-pointer" onClick={() => changerTri("prixUnitaire")}>P.U {renderFleche("prixUnitaire")}</th>
                      <th className="px-5 py-4 text-center cursor-pointer" onClick={() => changerTri("existantDebutAnnee")}>Existant {renderFleche("existantDebutAnnee")}</th>
                      <th className="px-5 py-4 text-center">Entrées</th>
                      <th className="px-5 py-4 text-center">Sorties</th>
                      <th className="px-5 py-4 text-center">Reste</th>
                      <th className="px-5 py-4 text-center">Décompte</th>
                      <th className="px-5 py-4">Observation</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {lignesNomenclature.length === 0 ? (
                      <tr><td colSpan="12" className="px-6 py-16 text-center text-gray-400">Aucun matériel dans ce chapitre.</td></tr>
                    ) : (
                      lignesNomenclature.map((ligne, index) => (
                        <tr key={ligne.id || ligne.materielId} className="hover:bg-gray-50/60 transition">
                          <td className="px-5 py-4 font-semibold text-gray-500">{index + 1}</td>
                          <td className="px-5 py-4 font-bold text-haigana-dark">{ligne.nomenclatureNumero}</td>
                          <td className="px-5 py-4 font-semibold text-haigana-dark">{ligne.designation}</td>
                          <td className="px-5 py-4">{ligne.especeUnite}</td>
                          <td className="px-5 py-4 text-right">{formatMontant(ligne.prixUnitaire)} Ar</td>
                          <td className="px-5 py-4 text-center">{ligne.existantDebutAnnee ?? 0}</td>
                          <td className="px-5 py-4 text-center"><span className={`px-2 py-1 rounded-lg border font-bold ${Number(ligne.entreesAnnee) > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400"}`}>{ligne.entreesAnnee ?? 0}</span></td>
                          <td className="px-5 py-4 text-center"><span className={`px-2 py-1 rounded-lg border font-bold ${Number(ligne.sortiesAnnee) > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-400"}`}>{ligne.sortiesAnnee ?? 0}</span></td>
                          <td className="px-5 py-4 text-center font-bold">{ligne.resteFinAnnee ?? 0}</td>
                          <td className="px-5 py-4 text-center font-semibold">{formatMontant(ligne.decompte)} Ar</td>
                          <td className="px-5 py-4">
                            <input type="text" value={ligne.observation || ""} onChange={(e) => modifierLigne(ligne.id, "observation", e.target.value)} className="w-full border px-3 py-2 rounded-lg outline-none" />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              {/* BUTTON 1 : SORTIE */}
                              {hasRole("ADMINISTRATEUR") && (
                                <button type="button" onClick={() => ouvrirSortie(ligne)} disabled={Number(ligne.resteFinAnnee) <= 0} className="px-2 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-40">Sortie</button>
                              )}
                              {/* BUTTON 2 : MODIFIER (RÉINSÉRÉ) */}
                              {(hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
                                <button type="button" onClick={() => navigate(`/patrimoine/materiel/${ligne.materielId}/modifier`)} className="px-2 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">Modifier</button>
                              )}
                              {/* BUTTON 3 : SUPPRIMER (RÉINSÉRÉ) */}
                              {hasRole("ADMINISTRATEUR") && (
                                <button type="button" onClick={() => supprimerMateriel(ligne)} disabled={saving} className="px-2 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-40">Supprimer</button>
                              )}
                              {/* BUTTON 4 : ENREGISTRER */}
                              {(hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
                                <button type="button" onClick={() => enregistrerInventaire(ligne)} disabled={saving} className="px-2 py-1.5 bg-haigana-dark text-white rounded-lg text-xs font-semibold hover:bg-haigana-blue transition">Enregistrer</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 font-bold"><td colSpan="9" className="px-5 py-4 text-right text-xs uppercase">Total de la nomenclature</td><td className="px-5 py-4 text-center whitespace-nowrap">{formatMontant(totalDecompte)} Ar</td><td colSpan="2"></td></tr>
                  </tfoot>
                                </table>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            MODALE ENTRÉE (RACCORDÉE AUX COMPTEURS RÉELS) */}
        {showEntreeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <div><h2 className="text-xl font-bold text-haigana-dark">Entrée de matériel</h2><p className="text-sm text-gray-500 mt-1">SOA : <span className="font-semibold">{codeSoa.toUpperCase()}</span></p></div>
                <button type="button" onClick={() => setShowEntreeModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-2">Nomenclature *</label><select name="nomenclatureId" value={formEntree.nomenclatureId} onChange={handleEntreeChange} className="w-full px-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-haigana-blue/20"><option value="">Sélectionner une nomenclature</option>{nomenclatures.map((n) => <option key={n.id} value={n.id}>{n.numero} - {n.designation}</option>)}</select></div>
                <div><label className="block text-xs text-gray-500 mb-2">Désignation *</label><input type="text" name="designation" value={formEntree.designation} onChange={handleEntreeChange} className="w-full px-4 py-3 rounded-xl border outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-2">Espèce des unités *</label><input type="text" name="especeUnite" value={formEntree.especeUnite} onChange={handleEntreeChange} className="w-full px-4 py-3 rounded-xl border outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-2">Prix unitaire *</label><input type="number" min="0" name="prixUnitaire" value={formEntree.prixUnitaire} onChange={handleEntreeChange} className="w-full px-4 py-3 rounded-xl border outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-2">Quantité *</label><input type="number" min="1" name="quantite" value={formEntree.quantite} onChange={handleEntreeChange} className="w-full px-4 py-3 rounded-xl border outline-none" /></div>
                <div className="md:col-span-2"><label className="block text-xs text-gray-500 mb-2">Observation</label><textarea name="observation" value={formEntree.observation} onChange={handleEntreeChange} rows="2" className="w-full px-4 py-3 rounded-xl border outline-none resize-none" /></div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3"><button type="button" onClick={() => setShowEntreeModal(false)} className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold">Annuler</button><button type="button" onClick={enregistrerEntree} disabled={saving} className="px-6 py-2.5 rounded-xl bg-haigana-blue text-white font-semibold">{saving ? "Enregistrement..." : "Enregistrer"}</button></div>
            </div>
          </div>
        )}


        {/* =====================================================
        MODALE SORTIE (SÉCURISÉE SUR LE BON ÉTAT MATÉRIEL) */}
        {showSortieModal && materielSelectionne && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-bold text-haigana-dark">Sortie de matériel</h2>
                <p className="text-sm text-gray-500 mt-1 font-semibold text-haigana-blue">{materielSelectionne.designation}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-bold uppercase">Stock disponible actuel</p>
                  <p className="mt-1 text-2xl font-bold text-haigana-dark">{materielSelectionne.resteFinAnnee ?? 0}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-bold">Quantité à sortir *</label>
                  <input type="number" min="1" max={materielSelectionne.resteFinAnnee} name="quantite" value={formSortie.quantite} onChange={handleSortieChange} className="w-full px-4 py-3 rounded-xl border outline-none focus:border-red-400 focus:ring-2" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-bold">Date de sortie *</label>
                  <input type="date" name="dateSortie" value={formSortie.dateSortie} onChange={handleSortieChange} className="w-full px-4 py-3 rounded-xl border" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-bold">Motif / Observation</label>
                  <textarea name="observation" value={formSortie.observation} onChange={handleSortieChange} rows="2" placeholder="Raison de la sortie..." className="w-full px-4 py-3 rounded-xl border resize-none" />
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setShowSortieModal(false)} className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold">Annuler</button>
                <button type="button" onClick={enregistrerSortie} disabled={saving} className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold">{saving ? "Traitement..." : "Confirmer la sortie"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
