import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function ImportMaterielExcel() {
  const navigate = useNavigate();

  const [classeurData, setClasseurData] = useState({});
  const [listeFeuilles, setListeFeuilles] = useState([]);
  const [feuilleSelectionnee, setFeuilleSelectionnee] = useState("");
  
  const [blocsMinisteres, setBlocsMinisteres] = useState([]); 
  const [configBlocs, setConfigBlocs] = useState({});
  const [paginations, setPaginations] = useState({});
  
  const [codeSoaAComparer, setCodeSoaAComparer] = useState("");
  const [anneeInventaire, setAnneeInventaire] = useState("2023");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setError(""); setSuccess("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const structureClasseur = {};

        workbook.SheetNames.forEach(sheetName => {
          structureClasseur[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        });

        setClasseurData(structureClasseur);
        setListeFeuilles(workbook.SheetNames);
        setFeuilleSelectionnee(workbook.SheetNames[0]);
        analyserSectionInventaireSpecifique(structureClasseur[workbook.SheetNames[0]]);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier Excel d'inventaire.");
      }
    };
    reader.readAsBinaryString(file);
  };

    const handleFeuilleChange = (e) => {
    const nomFeuille = e.target.value;
    setFeuilleSelectionnee(nomFeuille);
    if (classeurData[nomFeuille]) {
      analyserSectionInventaireSpecifique(classeurData[nomFeuille]);
    }
  };

  const analyserSectionInventaireSpecifique = (rows) => {
    if (!rows || rows.length === 0) return;
    
    const listeMaterielsExtraits = [];
    let nomenclatureActive = "3"; 

    rows.forEach((row) => {
      if (!row || row.length === 0) return;

      const ligneBruteText = row.map(cell => cell ? String(cell).toLowerCase().trim() : "").join(" ");

      if (ligneBruteText.includes("nomenclature")) {
        if (ligneBruteText.includes("3")) nomenclatureActive = "3";
        else if (ligneBruteText.includes("5")) nomenclatureActive = "5";
        else if (ligneBruteText.includes("10")) nomenclatureActive = "10";
        return;
      }

      if (ligneBruteText.includes("sommaire") || ligneBruteText.includes("designation du matériel") || 
          ligneBruteText.includes("existants au") || ligneBruteText.includes("reporter") || 
          ligneBruteText.includes("report") || ligneBruteText.includes("total") || 
          ligneBruteText.includes("arrete à la") || ligneBruteText.includes("fait en double") || 
          ligneBruteText.includes("comptable") || ligneBruteText.includes("recenseur") || 
          ligneBruteText.includes("repoblikan") || ligneBruteText.includes("tanindrazana") ||
          ligneBruteText.includes("chapitre") || ligneBruteText.includes("immobilisations")) {
        return;
      }

      const designationMateriel = row[1] ? String(row[1]).trim() : "";
      const especeUnite        = row[2] ? String(row[2]).trim() : "";

      if (!designationMateriel || designationMateriel === "" || designationMateriel.toLowerCase() === "désignation du matériel" || designationMateriel.startsWith("Totaux")) {
        return;
      }

      const prixUnitaire       = Number(row[3]) || 0;
      const existantDebutAnnee = Number(row[4]) || 0;
      const entreesAnnee       = Number(row[5]) || 0;
      const sortiesAnnee       = Number(row[6]) || 0;
      const resteFinAnnee      = Number(row[7]) || 0;
      const decompteFinancier  = Number(row[8]) || (prixUnitaire * resteFinAnnee);
      const observation        = row[9] ? String(row[9]).trim() : "En service";

      listeMaterielsExtraits.push({
        nomMinistere: "MINISTERE DE L'ECONOMIE ET DES FINANCES",
        nomenclatureNumero: nomenclatureActive,
        designation: designationMateriel,
        especeUnite: especeUnite,
        prixUnitaire: prixUnitaire,
        existantDebutAnnee: existantDebutAnnee,
        entreesAnnee: entreesAnnee,
        sortiesAnnee: sortiesAnnee,
        resteFinAnnee: resteFinAnnee,
        decompte: decompteFinancier,
        // On lie dynamiquement l'observation à l'année choisie par l'utilisateur :
        etatGeneral: observation || `En service — Exercice ${anneeCalculee}`
      });

    });

    const blocUnique = {
      nomMinistere: "MINISTERE DE L'ECONOMIE ET DES FINANCES",
      materiels: listeMaterielsExtraits
    };

    setBlocsMinisteres([blocUnique]);
    const initialConfig = {};
    initialConfig["MINISTERE DE L'ECONOMIE ET DES FINANCES"] = { codeSoa: "", nomRegion: "BOENY", districtMinistere: "MAHAJANGA I" };
    setConfigBlocs(initialConfig);
    setPaginations({ "MINISTERE DE L'ECONOMIE ET DES FINANCES": 1 });
  };

    const handleAnneeInventaireChange = (e) => {
    const value = e.target.value;
    setAnneeInventaire(value);
    
    // Si un fichier Excel est déjà en mémoire, on force sa ré-analyse avec la nouvelle année
    if (feuilleSelectionnee && classeurData[feuilleSelectionnee]) {
      analyserSectionInventaireSpecifique(classeurData[feuilleSelectionnee], value);
    }
  };

    const handleConfigChange = (nomMinistere, field, value) => {
    setConfigBlocs(prev => ({ ...prev, [nomMinistere]: { ...prev[nomMinistere], [field]: value } }));
  };

  const handleItemTableChange = (nomMinistere, originalIndex, field, value) => {
    setBlocsMinisteres(prev => prev.map(bloc => {
      if (bloc.nomMinistere !== nomMinistere) return bloc;
      const materielsMaj = bloc.materiels.map((m, i) => i === originalIndex ? { ...m, [field]: value } : m);
      return { ...bloc, materiels: materielsMaj };
    }));
  };

  const handleAjouterLigne = (nomMinistere) => {
    setBlocsMinisteres(prev => prev.map(bloc => {
      if (bloc.nomMinistere !== nomMinistere) return bloc;
      const nouvelleLigne = {
        nomenclatureNumero: "3", designation: "", especeUnite: "N", prixUnitaire: 0,
        existantDebutAnnee: 0, entreesAnnee: 0, sortiesAnnee: 0, resteFinAnnee: 0, decompte: 0, etatGeneral: "En service"
      };
      return { ...bloc, materiels: [...bloc.materiels, nouvelleLigne] };
    }));
  };

  const handleSupprimerLigne = (nomMinistere, originalIndex) => {
    setBlocsMinisteres(prev => prev.map(bloc => {
      if (bloc.nomMinistere !== nomMinistere) return bloc;
      return { ...bloc, materiels: bloc.materiels.filter((_, i) => i !== originalIndex) };
    }));
  };

  const enregistrerTousLesMateriels = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const configGlobal = configBlocs["MINISTERE DE L'ECONOMIE ET DES FINANCES"];
    if (!configGlobal?.codeSoa?.trim()) {
      setError("Veuillez renseigner le code SOA avant de lancer l'enregistrement.");
      return;
    }
    setLoading(true);
    const codeSoaNettoie = configGlobal.codeSoa.trim();
    const targetAnnee = Number(anneeInventaire);

    try {
      const resNomenclatures = await client.get("/materiels/nomenclatures");
      const listeNomenclaturesBDD = resNomenclatures.data || [];

      let soaId = null;
      try {
        const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoaNettoie)}`);
        soaId = resSoa.data?.id;
      } catch (errSearch) {
        const payloadNewSoa = {
          codeSoa: codeSoaNettoie,
          regionId: configGlobal.nomRegion?.trim().toUpperCase() === "BOENY" ? 1 : null,
          nomMinistere: "MINISTERE DE L'ECONOMIE ET DES FINANCES",
          districtMinistere: configGlobal.districtMinistere.trim() || "MAHAJANGA I",
          vehicules: []
        };
        const resNewSoa = await client.post("/soa", payloadNewSoa);
        soaId = resNewSoa.data?.id;
      }

      if (!soaId) throw new Error("Impossible de lier ou de créer le code SOA.");

      const targetBloc = blocsMinisteres[0];
      for (const m of targetBloc.materiels) {
        const pu = Number(m.prixUnitaire) || 0;
        const qteMouvement = Number(m.entreesAnnee) || Number(m.resteFinAnnee) || 0;

        const nomenCorrespondante = listeNomenclaturesBDD.find(n => 
          String(n.numero).trim() === String(m.nomenclatureNumero).trim()
        );
        const nomenclatureIdTechnique = nomenCorrespondante ? nomenCorrespondante.id : 1;

        // FIX EXCEL-01 : Tronquage obligatoire à 255 caractères (limite VARCHAR de vos entités)
        let designationPropre = m.designation ? String(m.designation).trim() : "Matériel non spécifié";
        if (designationPropre.length > 255) {
          designationPropre = designationPropre.substring(0, 250) + "...";
        }

        let uniteSecurisee = m.especeUnite ? String(m.especeUnite).trim() : "N";
        if (uniteSecurisee === "" || uniteSecurisee === "null") {
          uniteSecurisee = "N";
        }

        const payloadEntree = {
          soaId: Number(soaId),
          nomenclatureId: Number(nomenclatureIdTechnique),
          designation: designationPropre,
          especeUnite: uniteSecurisee,
          prixUnitaire: pu,
          quantite: qteMouvement,
          dateEntree: `${targetAnnee}-01-01`,
          annee: targetAnnee,
          observation: `Importation Inventaire Excel ${targetAnnee}`
        };

        const resEntree = await client.post("/materiels/entrees", payloadEntree);
        const realInventaireId = resEntree.data?.id;

        if (realInventaireId && m.etatGeneral) {
          let obsPropre = String(m.etatGeneral).trim();
          if (obsPropre.length > 500) obsPropre = obsPropre.substring(0, 490) + "...";

          await client.put(`/materiels/inventaires/${realInventaireId}`, {
            observation: obsPropre
          }).catch((e) => console.warn("Avertissement observation ignoré :", e));
        }
      }

      setSuccess(`L'inventaire complet de matériel pour l'année ${targetAnnee} a été enregistré avec succès pour le SOA ${codeSoaNettoie} !`);
      setBlocsMinisteres([targetBloc]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement réseau.");
    } finally { setLoading(false); }
  };

  const itemsPerPage = 10;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6 border-b pb-4"><h1 className="text-2xl font-bold text-gray-800">Importation d'Inventaire du Mobilier & Matériel</h1></div>

        {/* ZONE EN-TÊTE : FICHIER + ANNÉE + CODE SOA + COMPARER SÉCURISÉ */}
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-500 mb-1">Fichier d'inventaire Mobilier (Excel)</label>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="cursor-pointer text-sm w-full text-gray-600" />
          </div>
          <div className="w-full">
            <label htmlFor="anneeInventaireInput" className="block text-xs font-bold text-gray-600 mb-1">Année d'exercice *</label>
            <input 
              id="anneeInventaireInput" 
              type="number" 
              min="2000" 
              max="2100" 
              value={anneeInventaire} 
              onChange={handleAnneeInventaireChange} // <-- RECOPIER STRICTEMENT CETTE LIGNE PROPRE
              className="p-2 border rounded-xl w-full text-xs font-bold border-gray-300 outline-none" 
              required 
            />
          </div>
          <div className="w-full">
            <label htmlFor="codeSoaComparer" className="block text-xs font-bold text-gray-600 mb-1">Code SOA à manipuler *</label>
            <input id="codeSoaComparer" type="text" placeholder="Ex: 21010300" value={codeSoaAComparer} onChange={(e) => setCodeSoaAComparer(e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-gray-300 outline-none" required />
          </div>
            <div className="w-full pt-4 md:pt-0">
            {/* FIX ANNÉE EXERCICE : Transfert de l'année sélectionnée dans l'état de routage */}
            <button 
              type="button" 
              disabled={loading} 
              onClick={async () => {
                if (blocsMinisteres.length === 0) { setError("Veuillez d'abord charger un fichier Excel."); return; }
                if (!codeSoaAComparer.trim()) { setError("Veuillez saisir un Code SOA pour lancer la comparaison."); return; }
                if (!anneeInventaire) { setError("Veuillez renseigner l'année d'exercice à comparer."); return; }
                
                let ministereNomTrouve = "MINISTERE DE L'ECONOMIE ET DES FINANCES";
                setError("");

                try {
                  const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoaAComparer.trim())}`, {
                    validateStatus: (status) => status === 200 || status === 404
                  });

                  if (resSoa.status === 200 && resSoa.data?.ministere?.nomMinistere) {
                    ministereNomTrouve = resSoa.data.ministere.nomMinistere;
                  }
                } catch (e) {
                  console.log("Erreur de pré-vérification du SOA.");
                }

                const normaliserNom = (t) => t ? t.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").trim() : "";
                const blocFiltre = blocsMinisteres.find(b => normaliserNom(b.nomMinistere).includes(normaliserNom(ministereNomTrouve)));
                
                // CRITIQUE : Navigation en figeant l'année saisie de manière dynamique
                navigate("/patrimoine/materiel-comparer", { 
                  state: { 
                    codeSoa: codeSoaAComparer.trim(), 
                    blocs: blocFiltre ? [blocFiltre] : blocsMinisteres, 
                    annee: Number(anneeInventaire) // <-- Transmet l'année exacte saisie dans l'input
                  } 
                });
              }} 
              className="w-full px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs h-[38px] flex items-center justify-center shadow-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Veuillez patienter..." : "Comparer Matériel"}
            </button>
          </div>
        </div>

        {/* LIAISON DE L'ONGLET SÉLECTIONNÉ */}
        {listeFeuilles.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
            <label className="text-sm font-bold text-blue-900">📁 Onglet actif :</label>
            <select value={feuilleSelectionnee} onChange={handleFeuilleChange} className="p-2 rounded-xl border bg-white text-sm font-semibold focus:outline-none">
              {listeFeuilles.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl font-medium text-xs">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl font-medium text-xs">{success}</div>}



                <form onSubmit={enregistrerTousLesMateriels}>
          {blocsMinisteres.map((bloc) => {
            const nomMin = bloc.nomMinistere; const config = configBlocs[nomMin] || { codeSoa: "", nomRegion: "", districtMinistere: "" };
            const pageActive = paginations[nomMin] || 1; const totalPages = Math.ceil(bloc.materiels.length / itemsPerPage);
            const debut = (pageActive - 1) * itemsPerPage; const materielsAffiches = bloc.materiels.slice(debut, debut + itemsPerPage);

            return (
              <div key={nomMin} className="mb-10 bg-gray-50 p-5 rounded-3xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Ministère d'affectation</label><input type="text" value={nomMin} readOnly className="p-2 border rounded-xl w-full text-xs font-bold bg-gray-200/60 truncate" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Code SOA *</label><input type="text" placeholder="Saisir Code SOA *" value={config.codeSoa} onChange={(e) => handleConfigChange(nomMin, "codeSoa", e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-blue-300" required /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Région</label><input type="text" value={config.nomRegion} onChange={(e) => handleConfigChange(nomMin, "nomRegion", e.target.value)} className="p-2 border rounded-xl w-full text-xs" required /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">District</label><input type="text" value={config.districtMinistere} onChange={(e) => handleConfigChange(nomMin, "districtMinistere", e.target.value)} className="p-2 border rounded-xl w-full text-xs" required /></div>
                </div>

                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-600">Lignes d'Inventaire Extraites ({bloc.materiels.length})</span><button type="button" onClick={() => handleAjouterLigne(nomMin)} className="px-3 py-1 bg-green-600 text-white font-semibold text-xs rounded-lg flex items-center shadow-sm">+</button></div>

                <div className="overflow-x-auto border bg-white rounded-2xl mb-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-blue-900 text-white"><tr><th className="p-2.5">Nom.</th><th className="p-2.5">Désignation Matériel</th><th className="p-2.5">Unité</th><th className="p-2.5">P.U (Ar)</th><th className="p-2.5">Existant</th><th className="p-2.5">Entrées</th><th className="p-2.5">Sorties</th><th className="p-2.5">Reste</th><th className="p-2.5">Action</th></tr></thead>
                    <tbody className="divide-y">
                      {materielsAffiches.map((m, localIdx) => {
                        const originalIdx = debut + localIdx;
                        return (
                          <tr key={originalIdx} className="hover:bg-gray-50">
                            <td className="p-1"><input type="text" value={m.nomenclatureNumero} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "nomenclatureNumero", e.target.value)} className="w-12 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="text" value={m.designation} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "designation", e.target.value)} className="w-full border p-1 rounded text-xs font-medium" /></td>
                            <td className="p-1"><input type="text" value={m.especeUnite} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "especeUnite", e.target.value)} className="w-14 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="number" value={m.prixUnitaire} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "prixUnitaire", e.target.value)} className="w-20 border p-1 rounded text-right text-xs" /></td>
                            <td className="p-1"><input type="number" value={m.existantDebutAnnee} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "existantDebutAnnee", e.target.value)} className="w-14 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="number" value={m.entreesAnnee} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "entreesAnnee", e.target.value)} className="w-14 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="number" value={m.sortiesAnnee} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "sortiesAnnee", e.target.value)} className="w-14 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="number" value={m.resteFinAnnee} onChange={(e) => handleItemTableChange(nomMin, originalIdx, "resteFinAnnee", e.target.value)} className="w-14 border p-1 rounded text-center text-xs font-bold" /></td>
                            <td className="p-1 text-center"><button type="button" onClick={() => handleSupprimerLigne(nomMin, originalIdx)} className="w-6 h-6 bg-red-100 text-red-700 rounded font-bold">—</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-white p-2 border rounded-xl text-xs">
                    <button type="button" disabled={pageActive === 1} onClick={() => setPaginations(p => ({ ...p, [nomMin]: pageActive - 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Précédent</button>
                    <span className="text-gray-500 font-medium">Page {pageActive} sur {totalPages}</span>
                    <button type="button" disabled={pageActive === totalPages} onClick={() => setPaginations(p => ({ ...p, [nomMin]: pageActive + 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Suivant</button>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* FIX BLOCAGE : Bouton désactivé et libellé mis à jour pendant le chargement réseau des 228 lignes */}
          {blocsMinisteres.length > 0 && (
            <div className="flex justify-end border-t pt-4">
              <button type="submit" disabled={loading} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl text-sm hover:bg-gray-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Enregistrement du lot en cours..." : "Enregistrer Tous les Matériels"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
