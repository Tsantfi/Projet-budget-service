import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function ImportLogementExcel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [classeurData, setClasseurData] = useState({});
  const [listeFeuilles, setListeFeuilles] = useState([]);
  const [feuilleSelectionnee, setFeuilleSelectionnee] = useState("");

  const [blocsMinisteres, setBlocsMinisteres] = useState([]);
  const [configBlocs, setConfigBlocs] = useState({});
  const [paginations, setPaginations] = useState({});
  const [codeSoa, setCodeSoa] = useState("");
  const [anneeExercice, setAnneeExercice] = useState("2023");

  // Métadonnées administratives extraites à la volée depuis l'Excel
  const [headerExtrait, setHeaderExtrait] = useState({
    ministere: "", niveau: "", directionService: "", nomResponsable: "", fonction: "", telephone: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const itemsPerPage = 10;

  const anneeUrl = searchParams.get("annee") || "2023";

  useEffect(() => {
    if (anneeUrl) {
      setAnneeExercice(anneeUrl);
    }
    setBlocsMinisteres([]);
  }, [anneeUrl]);

  const normaliserNomMinistere = (texte) => {
    if (!texte) return "";
    return String(texte)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

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
          structureClasseur[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
        });

        setClasseurData(structureClasseur);
        setListeFeuilles(workbook.SheetNames);
        setFeuilleSelectionnee(workbook.SheetNames[0]);
        extraireEtSegmenterLogements(structureClasseur[workbook.SheetNames[0]]);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFeuilleChange = (e) => {
    const nomFeuille = e.target.value;
    setFeuilleSelectionnee(nomFeuille);
    if (classeurData[nomFeuille]) {
      extraireEtSegmenterLogements(classeurData[nomFeuille]);
    }
  };

  const extraireEtSegmenterLogements = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setBlocsMinisteres([]); setConfigBlocs({}); setPaginations({}); return;
    }

    const mapMinisteres = new Map();
    let ministereCourant = "MINISTERE DE LA SANTE PUBLIQUE";
    let activeTableMode = false;
    let dernierNumeroValide = "";
    let dernierNomBatimentValide = "";
    let adressePointRepereMemo = "—";
    let localHeader = { ministere: "", niveau: "", directionService: "", nomResponsable: "", fonction: "", telephone: "" };

    // FIX : Utilisation de .slice(3) pour sauter et enlever définitivement les 3 premières lignes del'Excel
    rows.slice(3).forEach((row) => {
      if (!row || row.length === 0) return;

      const ligneTexte = row.map(c => c ? String(c).trim() : "").join(" ");
      const ligneTexteLC = ligneTexte.toLowerCase();

      // DÉTECTION UNIVERSELLE DU MINISTÈRE COURANT DANS LE FLUX EXCEL
      if (ligneTexteLC.includes("ministre:") || ligneTexteLC.includes("ministere:") || ligneTexteLC.includes("ministère:")) {
        const nomNettoye = ligneTexte.replace(/ministre:|ministere:|ministère:/i, "").trim().toUpperCase();
        if (nomNettoye) {
          ministereCourant = nomNettoye;
        }
        return;
      }

      if (ligneTexteLC.includes("nom et prénoms:")) {
        const chaineBruteInfo = String(row[0] || row[1] || row[2] || ligneTexte);
        const matchNom = chaineBruteInfo.match(/nom et prénoms:\s*(.*?)\s*fonction:/i);
        const matchFonction = chaineBruteInfo.match(/fonction:\s*(.*?)\s*(tél:|e-mail:|adresse)/i);
        const matchTel = chaineBruteInfo.match(/tél:\s*(.*?)\s*(e-mail:|adresse)/i);
        localHeader.nomResponsable = matchNom ? matchNom[1].trim() : chaineBruteInfo.replace(/nom et prénoms:/i, "").trim();
        localHeader.fonction = matchFonction ? matchFonction[1].trim() : "Dépositaire Comptable";
        localHeader.telephone = matchTel ? matchTel[1].trim() : "—";
      }

      // DÉTECTION UNIVERSELLE TOLÉRANTE DU TABLEAU (BATIMENT, BATIM, ETC.)

      const contientMotNumero = ligneTexteLC.includes("numéro") || ligneTexteLC.includes("numero") || ligneTexteLC.includes("n°");
      const contientMotBatiment = ligneTexteLC.includes("bat") || ligneTexteLC.includes("bât") || ligneTexteLC.includes("proprié") || ligneTexteLC.includes("proprie");

      if (contientMotNumero && contientMotBatiment) {
        activeTableMode = true;
        return;
      }

      // FIX CONDITIONS D'ARRÊT S'ADAPTANT AU BAS DE PAGE SANS S'ARRÊTER SUR LES VÉHICULES DU CDA
      if (ligneTexteLC.includes("signature du responsable") && activeTableMode && mapMinisteres.size > 0) {
        activeTableMode = false;
        return;
      }

      if (ligneTexteLC.includes("signature du responsable") && !activeTableMode) {
        return;
      }

      if (ligneTexteLC.includes("une unité par") || ligneTexteLC.includes("1- bureau")) return;

      if (activeTableMode) {
        const col0 = row[0] !== undefined ? String(row[0]).trim() : "";
        const col1 = row[1] !== undefined ? String(row[1]).trim() : "";
        const col2 = row[2] !== undefined ? String(row[2]).trim() : "";
        const col3 = row[3] !== undefined ? String(row[3]).trim() : "";
        const col4 = row[4] !== undefined ? String(row[4]).trim() : "";
        const col5 = row[5] !== undefined ? String(row[5]).trim() : "";
        const col6 = row[6] !== undefined ? String(row[6]).trim() : "";
        const col7 = row[7] !== undefined ? String(row[7]).trim() : "";

        // Sauvegarde de la mémoire des cellules fusionnées (CHU / CDA / CCI)
        if (col0 !== "" && col0 !== "null") dernierNumeroValide = col0;
        if (col1 !== "" && col1 !== "null") dernierNomBatimentValide = col1;
        if (col7 !== "" && col7 !== "null") adressePointRepereMemo = col7;

        if (col1 || col2 || col3 || col4) {
          const cleMinistere = normaliserNomMinistere(ministereCourant);
          if (!mapMinisteres.has(cleMinistere)) {
            mapMinisteres.set(cleMinistere, {
              id: `bloc-${mapMinisteres.size}-${Date.now()}`,
              nomMinistere: ministereCourant,
              cleMinistere: cleMinistere,
              logements: []
            });
          }

          mapMinisteres.get(cleMinistere).logements.push({
            numero: col0 ? col0 : (dernierNumeroValide || "—"),
            nomBatiment: col1 || dernierNomBatimentValide,
            nature: col2 || "Général",
            entiteUtilisatrice: col3 || "Administration",
            occupant: col4 || "Aucun",
            etatBatisse: col5 || "Moyen",
            localite: col6 || "Mahajanga I",
            adressePointRepere: col7 || adressePointRepereMemo
          });
        }
      }
    });

    const blocsValides = Array.from(mapMinisteres.values()).filter(b => b.logements.length > 0);
    const initialConfig = {}; const initialPages = {};
    blocsValides.forEach((bloc) => {
      initialConfig[bloc.id] = { codeSoa: "", nomRegion: "BOENY", districtMinistere: "MAHAJANGA I" };
      initialPages[bloc.id] = 1;
    });

    setHeaderExtrait(localHeader); setBlocsMinisteres(blocsValides);
    setConfigBlocs(initialConfig); setPaginations(initialPages);
  };

  const handleConfigChange = (blocId, field, value) => {
    setConfigBlocs((prev) => ({ ...prev, [blocId]: { ...prev[blocId], [field]: value } }));
  };

  const handleAjouterLigne = (blocId) => {
    setBlocsMinisteres((prev) => prev.map((bloc) => {
      if (bloc.id !== blocId) return bloc;
      const nouvelleLigneVide = {
        numero: "",
        nomBatiment: "Nouveau Bâtiment",
        nature: "Général",
        entiteUtilisatrice: bloc.logements.length > 0 ? bloc.logements[bloc.logements.length - 1].entiteUtilisatrice : "Service",
        occupant: "—",
        etatBatisse: "Moyen",
        localite: "Mahajanga I",
        adressePointRepere: "—"
      };

      return { ...bloc, logements: [...bloc.logements, nouvelleLigneVide] };
    }));
  };


  const handleItemTableChange = (blocId, originalIndex, field, value) => {
    setBlocsMinisteres(prev => prev.map(bloc => {
      if (bloc.id !== blocId) return bloc;
      const logementsMaj = bloc.logements.map((l, i) => i === originalIndex ? { ...l, [field]: value } : l);
      return { ...bloc, logements: logementsMaj };
    }));
  };

  const handleSupprimerLigne = (blocId, originalIndex) => {
    setBlocsMinisteres(prev => prev.map(bloc => {
      if (bloc.id !== blocId) return bloc;
      return { ...bloc, logements: bloc.logements.filter((_, i) => i !== originalIndex) };
    }));
  };

  const enregistrerTousLesLogements = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const blocSansSoa = blocsMinisteres.find((b) => !configBlocs[b.id]?.codeSoa?.trim());
    if (blocSansSoa) return setError(`Veuillez saisir un code SOA pour le bloc "${blocSansSoa.nomMinistere}".`);

    setLoading(true);
    const targetAnnee = Number(anneeExercice);
    let soaEnregistres = 0;
    try {
      for (const bloc of blocsMinisteres) {
        const config = configBlocs[bloc.id];
        const codeSoaNettoye = config.codeSoa.trim();
        let soaIdGenere = null;

        // 1. RECHERCHE PRÉVENTIVE : On vérifie si le SOA existe déjà en base
        try {
          const resCheck = await client.get(`/soa/code/${encodeURIComponent(codeSoaNettoye)}`, {
            validateStatus: (status) => status === 200 || status === 404
          });
          if (resCheck.status === 200 && resCheck.data?.id) {
            soaIdGenere = resCheck.data.id;
          }
        } catch (checkErr) {
          console.log("Vérification d'existence SOA ignorée.");
        }

        // 2. CRÉATION DU SOA : Si le SOA n'existe pas, on le crée obligatoirement AVANT d'insérer les logements
        if (!soaIdGenere) {
          const payloadNewSoa = {
            codeSoa: codeSoaNettoye, 
            regionId: 1,
            nomMinistere: bloc.nomMinistere.trim(), 
            districtMinistere: config.districtMinistere?.trim() || "MAHAJANGA I",
            vehicules: []
          };
          const resNewSoa = await client.post("/soa", payloadNewSoa);
          soaIdGenere = resNewSoa.data?.id;
        }

        if (!soaIdGenere) {
          throw new Error(`Échec d'initialisation du code SOA parent pour ${codeSoaNettoye}`);
        }

        // 3. BOUCLE DE LOGEMENTS APRÈS LA GARANTIE DE L'ID SOA
        for (const l of bloc.logements) {
          let designationBatiment = l.nomBatiment ? String(l.nomBatiment).trim() : "Bâtiment non spécifié";
          if (designationBatiment.length > 255) designationBatiment = designationBatiment.substring(0, 250) + "...";

          // FIX CRITIQUE : Alignement exact sur la structure du DTO LogementResponse attendu par le contrôleur Java
          const payloadLogement = {
            soa: {
              id: Number(soaIdGenere)
            },
            numero: l.numero && !isNaN(l.numero) ? Number(l.numero) : null,
            nomBatiment: designationBatiment,
            nature: l.nature?.trim() || "Général",
            entiteUtilisatrice: l.entiteUtilisatrice?.trim() || "Service",
            occupant: l.occupant?.trim() || "—",
            etatBatisse: l.etatBatisse?.trim() || "Moyen",
            localite: l.localite?.trim() || "Mahajanga I",
            adressePointRepere: l.adressePointRepere?.trim() || "—",
            etatGeneral: "En service",
            anneeInitiale: targetAnnee,
            actif: true
          };

          // Appel de la route d'insertion directe vers le contrôleur Java (sans .catch pour bloquer en cas d'erreur)
          await client.post("/logements", payloadLogement);
        }
        soaEnregistres++;
      }

      setSuccess(`L'ensemble des fiches immobilières a été intégré. ${soaEnregistres} Codes SOA traités avec succès.`);
      setBlocsMinisteres([]); setConfigBlocs({});
    } catch (err) {
      console.error("Détail de l'erreur interceptée :", err);
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Erreur lors de la création de lot ou de l'insertion des bâtiments.");
    } finally { setLoading(false); }
  };

  const handleComparer = async () => {
    setError(""); setSuccess("");
    if (blocsMinisteres.length === 0) return setError("Veuillez d'abord charger un fichier Excel.");
    if (!codeSoa.trim()) return setError("Veuillez saisir un Code SOA pour la comparaison.");

    try {
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoa.trim())}`);
      const soaData = resSoa.data;
      if (!soaData || !soaData.id) return setError("Code SOA introuvable en base de données.");

      const cleBDD = normaliserNomMinistere(soaData.ministere?.nomMinistere || soaData.nomMinistere);
      const blocsCorrespondants = blocsMinisteres.filter((b) => b.cleMinistere === cleBDD);

      if (blocsCorrespondants.length === 0) return setError(`Le ministère associé à ce SOA n'a pas été localisé dans l'Excel.`);
      navigate("/patrimoine/logement-comparer", { state: { codeSoa: codeSoa.trim(), blocs: blocsCorrespondants, annee: Number(anneeExercice) } });
    } catch (err) {
      setError("Le code SOA saisi n'existe pas en base de données ou le serveur est inaccessible.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6 border-b pb-4"><h1 className="text-2xl font-bold text-gray-800">Importation d'Inventaire des Logements & Bâtiments</h1></div>

        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          <div className="w-full text-left">
            <label className="block text-xs font-bold text-gray-500 mb-1">Fichier d'inventaire Logement (Excel)</label>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="cursor-pointer text-sm w-full text-gray-600" />
          </div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Année d'exercice *</label><input type="number" value={anneeExercice} onChange={(e) => setAnneeExercice(e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold outline-none" required /></div>
          <div><label className="block text-xs font-bold text-gray-600 mb-1">Code SOA à comparer *</label><input type="text" placeholder="Ex: 21010300" value={codeSoa} onChange={(e) => setCodeSoa(e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-gray-300 outline-none" /></div>
          <div className="pt-4 md:pt-0"><button type="button" onClick={handleComparer} className="w-full px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs h-[38px] flex items-center justify-center shadow-sm hover:bg-blue-700 transition">Comparer Logement</button></div>
        </div>

        {listeFeuilles.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
            <label className="text-sm font-bold text-blue-900">📁 Onglet actif :</label>
            <select value={feuilleSelectionnee} onChange={handleFeuilleChange} className="p-2 rounded-xl border bg-white text-sm font-semibold focus:outline-none">{listeFeuilles.map((name) => <option key={name} value={name}>{name}</option>)}</select>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl font-medium text-xs">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl font-medium text-xs">{success}</div>}

        <form id="formLogementMassif" onSubmit={enregistrerTousLesLogements}>
          {blocsMinisteres.map((bloc) => {
            const config = configBlocs[bloc.id] || { codeSoa: "", nomRegion: "", districtMinistere: "" };
            const pageActive = paginations[bloc.id] || 1; const totalPages = Math.ceil(bloc.logements.length / itemsPerPage);
            const debut = (pageActive - 1) * itemsPerPage; const logementsAffiches = bloc.logements.slice(debut, debut + itemsPerPage);

            return (
              <div key={bloc.id} className="mb-10 bg-gray-50 p-5 rounded-3xl border border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Ministère d'affectation</label><input type="text" value={bloc.nomMinistere} readOnly className="p-2 border rounded-xl w-full text-xs font-bold bg-gray-200/60 truncate" title={bloc.nomMinistere} /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Attribuer Code SOA *</label><input type="text" placeholder="Entrer le Code SOA" value={config.codeSoa} onChange={(e) => handleConfigChange(bloc.id, "codeSoa", e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-blue-300" required /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Région</label><input type="text" value={config.nomRegion} readOnly className="p-2 border rounded-xl w-full text-xs bg-gray-200" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">District</label><input type="text" value={config.districtMinistere} onChange={(e) => handleConfigChange(bloc.id, "districtMinistere", e.target.value)} className="p-2 border rounded-xl w-full text-xs" required /></div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-600">
                    Bâtiments lus ({bloc.logements.length})
                  </span>
                  <button 
                    type="button" 
                    onClick={() => handleAjouterLigne(bloc.id)} 
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg shadow-sm transition flex items-center gap-1"
                  >
                    <span>+</span>
                  </button>
                </div>
                <div className="overflow-x-auto border bg-white rounded-2xl mb-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-800 text-white"><tr><th className="p-2.5">N°</th><th className="p-2.5">Nom du Bâtiment / Propriété</th><th className="p-2.5">Nature</th><th className="p-2.5">Utilisateurs</th><th className="p-2.5">Occupant</th><th className="p-2.5">État</th><th className="p-2.5">Localité</th><th className="p-2.5 text-center">Action</th></tr></thead>
                    <tbody className="divide-y">
                      {logementsAffiches.map((l, localIdx) => {
                        const originalIdx = debut + localIdx;
                        return (
                          <tr key={originalIdx} className="hover:bg-gray-50">
                            <td className="p-1"><input type="text" value={l.numero} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "numero", e.target.value)} className="w-14 border p-1 rounded text-center text-xs" /></td>
                            <td className="p-1"><input type="text" value={l.nomBatiment} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "nomBatiment", e.target.value)} className="w-full border p-1 rounded text-xs font-semibold text-gray-800" /></td>
                            <td className="p-1"><input type="text" value={l.nature} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "nature", e.target.value)} className="w-20 border p-1 rounded text-xs" /></td>
                            <td className="p-1"><input type="text" value={l.entiteUtilisatrice} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "entiteUtilisatrice", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1"><input type="text" value={l.occupant} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "occupant", e.target.value)} className="w-24 border p-1 rounded text-xs" /></td>
                            <td className="p-1"><input type="text" value={l.etatBatisse} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "etatBatisse", e.target.value)} className="w-20 border p-1 rounded text-xs" /></td>
                            <td className="p-1"><input type="text" value={l.localite} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "localite", e.target.value)} className="w-24 border p-1 rounded text-xs" /></td>
                            <td className="p-1 text-center"><button type="button" onClick={() => handleSupprimerLigne(bloc.id, originalIdx)} className="w-6 h-6 bg-red-100 text-red-700 rounded-lg font-bold">—</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-white p-2 border rounded-xl text-xs">
                    <button type="button" disabled={pageActive === 1} onClick={() => setPaginations(p => ({ ...p, [bloc.id]: pageActive - 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Précédent</button>
                    <span className="text-gray-500 font-medium">Page {pageActive} sur {totalPages}</span>
                    <button type="button" disabled={pageActive === totalPages} onClick={() => setPaginations(p => ({ ...p, [bloc.id]: pageActive + 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Suivant</button>
                  </div>
                )}
              </div>
            );
          })}
          {/* REMPLACER UNIQUEMENT CETTE LIGNE DANS VOTRE FORMULAIRE : */}
          {blocsMinisteres.length > 0 && <div className="flex justify-end border-t pt-4"><button type="submit" disabled={loading} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl text-sm shadow-sm">{loading ? "Enregistrement en cours..." : "Enregistrer Tous les SOA"}</button></div>}

        </form>
      </div>
    </div>
  );
}
