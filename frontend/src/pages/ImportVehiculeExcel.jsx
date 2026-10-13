import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function ImportVehiculeExcel() {
  const navigate = useNavigate();

  const [classeurData, setClasseurData] = useState({});
  const [listeFeuilles, setListeFeuilles] = useState([]);
  const [feuilleSelectionnee, setFeuilleSelectionnee] = useState("");

  const [codeSoaAComparer, setCodeSoaAComparer] = useState("");
  const [blocsMinisteres, setBlocsMinisteres] = useState([]);
  const [configBlocs, setConfigBlocs] = useState({});
  const [paginations, setPaginations] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const itemsPerPage = 10;

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
    const file = e.target.files?.[0];
    if (!file) return;

    setError(""); setSuccess("");
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const structureClasseur = {};

        workbook.SheetNames.forEach((sheetName) => {
          structureClasseur[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
        });

        setClasseurData(structureClasseur);
        setListeFeuilles(workbook.SheetNames);
        setFeuilleSelectionnee(workbook.SheetNames[0]);
        extraireEtSegmenterMinisteres(structureClasseur[workbook.SheetNames[0]]);
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
      extraireEtSegmenterMinisteres(classeurData[nomFeuille]);
    }
  };

  const extraireEtSegmenterMinisteres = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      setBlocsMinisteres([]); setConfigBlocs({}); setPaginations({}); return;
    }

    const mapMinisteres = new Map();
    let ministereCourant = null;
    let detenteurCourant = "Non spécifié";
    let regionExcel = "BOENY";

    if (rows.length > 1 && rows[1]) {
      regionExcel = rows[1][2] ? String(rows[1][2]).trim() : "BOENY";
    }

    rows.slice(3).forEach((row) => {
      if (!row || row.length === 0) return;

      const colMinistere = row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : "";
      const colImmatriculation = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : "";
      const colMarque = row[2] !== undefined && row[2] !== null ? String(row[2]).trim() : "";
      const colType = row[3] !== undefined && row[3] !== null ? String(row[3]).trim() : "";
      const colGenre = row[4] !== undefined && row[4] !== null ? String(row[4]).trim() : "";
      const colEtat = row[5] !== undefined && row[5] !== null ? String(row[5]).trim() : "";
      const colDetenteur = row[6] !== undefined && row[6] !== null ? String(row[6]).trim() : "";

      // FIX INTERCEPTION : Ignore l'en-tête même s'il est répété au milieu de la feuille Excel
      const estEntete =
        colImmatriculation.toLowerCase().includes("immatriculation") ||
        colImmatriculation.toLowerCase().includes("numéro") ||
        colMarque.toLowerCase() === "marque" ||
        colType.toLowerCase() === "type" ||
        colGenre.toLowerCase() === "genre";

      if (estEntete) return;

      const ministerePossible = normaliserNomMinistere(colMinistere);
      const estMinistere = ministerePossible.startsWith("ministere") || ministerePossible.startsWith("presidence") || ministerePossible.startsWith("transports") || ministerePossible.startsWith("tourisme") || ministerePossible.startsWith("industrialisation");

      if (colMinistere && estMinistere) {
        const cleMinistere = normaliserNomMinistere(colMinistere);
        ministereCourant = cleMinistere;

        if (!mapMinisteres.has(cleMinistere)) {
          mapMinisteres.set(cleMinistere, {
            id: `min-${mapMinisteres.size}-${Date.now()}`,
            nomMinistere: colMinistere.toUpperCase(),
            cleMinistere: cleMinistere,
            vehicules: []
          });
        }
        detenteurCourant = "Non spécifié";
      }

      if (!ministereCourant || !mapMinisteres.has(ministereCourant)) return;

      const blocCourant = mapMinisteres.get(ministereCourant);

      if (colDetenteur && colDetenteur.toLowerCase() !== "null" && colDetenteur.toLowerCase() !== "undefined") {
        detenteurCourant = colDetenteur;
      }

      const contientVehicule = !!colImmatriculation || !!colMarque || !!colType || !!colGenre || !!colEtat;
      
      // FIX LIGNES TECHNIQUES : On ignore les lignes d'outillages orphelines (ex: charrues) sans marque ni plaque
      if (!contientVehicule || colImmatriculation.toLowerCase().includes("charrue") || colImmatriculation.toLowerCase().includes("pulveris")) {
        return;
      }

      blocCourant.vehicules.push({
        nomMinistere: blocCourant.nomMinistere,
        immatricule: colImmatriculation,
        marque: colMarque || "NON-SPECIFIE",
        type: colType || "NON-SPECIFIE",
        genre: colGenre || "MOTO",
        etatGeneral: colEtat,
        nomDetenteur: detenteurCourant
      });
    });

    const blocsValides = Array.from(mapMinisteres.values()).filter((bloc) => bloc.vehicules.length > 0);
    const initialConfig = {};
    const initialPages = {};

    blocsValides.forEach((bloc) => {
      initialConfig[bloc.id] = { codeSoa: "", nomRegion: regionExcel, districtMinistere: "MAHAJANGA I" };
      initialPages[bloc.id] = 1;
    });

    setBlocsMinisteres(blocsValides);
    setConfigBlocs(initialConfig);
    setPaginations(initialPages);
  };

    const handleConfigChange = (blocId, field, value) => {
    setConfigBlocs((prev) => ({ ...prev, [blocId]: { ...prev[blocId], [field]: value } }));
  };

  const handleItemTableChange = (blocId, originalIndex, field, value) => {
    setBlocsMinisteres((prev) => prev.map((bloc) => {
      if (bloc.id !== blocId) return bloc;
      const vehiculesMaj = bloc.vehicules.map((v, i) => i === originalIndex ? { ...v, [field]: value } : v);
      return { ...bloc, vehicules: vehiculesMaj };
    }));
  };

  const handleAjouterLigne = (blocId) => {
    setBlocsMinisteres((prev) => prev.map((bloc) => {
      if (bloc.id !== blocId) return bloc;
      const nouvelleLigne = {
        nomMinistere: bloc.nomMinistere, immatricule: "", marque: "NON-SPECIFIE", type: "NON-SPECIFIE", genre: "MOTO", etatGeneral: "En marche",
        nomDetenteur: bloc.vehicules.length > 0 ? bloc.vehicules[bloc.vehicules.length - 1].nomDetenteur : "Non spécifié"
      };
      return { ...bloc, vehicules: [...bloc.vehicules, nouvelleLigne] };
    }));
  };

  const handleSupprimerLigne = (blocId, originalIndex) => {
    setBlocsMinisteres((prev) => prev.map((bloc) => {
      if (bloc.id !== blocId) return bloc;
      return { ...bloc, vehicules: bloc.vehicules.filter((_, i) => i !== originalIndex) };
    }));
  };

    const normaliserImmatriculation = (immatricule) => {
      return String(immatricule || "")
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
    };

    const enregistrerTousLesSOA = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  
  // VERIFIER QU'IL Y A DES BLOCS
  

  if (blocsMinisteres.length === 0) {
    setError(
      "Aucun ministère à enregistrer."
    );
    return;
  }

  
  // VERIFIER LES CODES SOA
  

  const blocSansSoa =
    blocsMinisteres.find(
      (bloc) =>
        !configBlocs[bloc.id]?.codeSoa?.trim()
    );

  if (blocSansSoa) {
    setError(
      `Veuillez saisir un code SOA pour le bloc "${blocSansSoa.nomMinistere}".`
    );
    return;
  }

  
  // VERIFIER LES CODES SOA EN DOUBLE DANS L'EXCEL
  

  const codesSoa = new Map();

  for (const bloc of blocsMinisteres) {
    const codeSoa =
      configBlocs[bloc.id]
        ?.codeSoa
        ?.trim()
        .toUpperCase();

    if (!codeSoa) {
      continue;
    }

    if (codesSoa.has(codeSoa)) {
      const autreBloc =
        codesSoa.get(codeSoa);

      setError(
        `Le code SOA "${codeSoa}" est utilisé plusieurs fois : "${autreBloc}" et "${bloc.nomMinistere}".`
      );

      return;
    }

    codesSoa.set(
      codeSoa,
      bloc.nomMinistere
    );
  }

  
  // VERIFIER LES IMMATRICULATIONS EN DOUBLE
  // DANS L'ENSEMBLE DU FICHIER
  

  const immatriculationsGlobales =
    new Map();

  for (const bloc of blocsMinisteres) {

    for (
      let index = 0;
      index < bloc.vehicules.length;
      index++
    ) {

      const vehicule =
        bloc.vehicules[index];

      const immatriculation =
        normaliserImmatriculation(
          vehicule.immatricule
        );

      // Les véhicules sans plaque
      // recevront une référence temporaire.
      if (!immatriculation) {
        continue;
      }

      if (
        immatriculationsGlobales.has(
          immatriculation
        )
      ) {

        const precedent =
          immatriculationsGlobales.get(
            immatriculation
          );

        setError(
          `L'immatriculation "${immatriculation}" est en double. ` +
          `Elle apparaît dans "${precedent.ministere}" ` +
          `et "${bloc.nomMinistere}".`
        );

        return;
      }

      immatriculationsGlobales.set(
        immatriculation,
        {
          ministere:
            bloc.nomMinistere,
          index,
        }
      );
    }
  }

  
  // PREPARATION
  

  setLoading(true);

  try {

    const dateAujourdhuiIso =
      new Date()
        .toISOString()
        .split("T")[0];

    let dossiersSauves = 0;
    
    // ENREGISTRER CHAQUE BLOC

    for (const bloc of blocsMinisteres) {

      const config =
        configBlocs[bloc.id];

      if (!config) {
        throw new Error(
          `Configuration introuvable pour "${bloc.nomMinistere}".`
        );
      }

      const codeSoa =
        config.codeSoa
          ?.trim()
          .toUpperCase();

      if (!codeSoa) {
        throw new Error(
          `Le code SOA est obligatoire pour "${bloc.nomMinistere}".`
        );
      }

      // ========================================================
      // PREPARER LES VEHICULES
      // ========================================================

      const vehicules =
        bloc.vehicules.map(
          (v, idx) => {

            // --------------------------------------------------
            // IMMATRICULATION
            // --------------------------------------------------

            let immVehicule =
              normaliserImmatriculation(
                v.immatricule
              );

            // --------------------------------------------------
            // SI PAS D'IMMATRICULATION
            // CREER UNE REFERENCE TEMPORAIRE UNIQUE
            // --------------------------------------------------

            if (!immVehicule) {

              immVehicule =
                `TMP${bloc.id.replace(
                  /[^a-zA-Z0-9]/g,
                  ""
                )}${idx}${Date.now()}`;

              immVehicule =
                normaliserImmatriculation(
                  immVehicule
                );
            }

            // --------------------------------------------------
            // ETAT
            // --------------------------------------------------

            let resolvedEtatId = 1;

            const stringEtat =
              String(
                v.etatGeneral || ""
              ).toLowerCase();

            if (
              stringEtat.includes("pann")
            ) {
              resolvedEtatId = 2;

            } else if (
              stringEtat.includes("call") ||
              stringEtat.includes("cal")
            ) {
              resolvedEtatId = 3;

            } else if (
              stringEtat.includes("epav")
            ) {
              resolvedEtatId = 4;
            }

            // --------------------------------------------------
            // DETENTEUR
            // --------------------------------------------------

            let detenteurPropre =
              v.nomDetenteur
                ?.trim() ||
              "Non spécifié";

            if (
              detenteurPropre.length > 255
            ) {
              detenteurPropre =
                detenteurPropre.substring(
                  0,
                  250
                ) + "...";
            }

            // --------------------------------------------------
            // GENERER DES REFERENCES UNIQUES
            // --------------------------------------------------

            const suffixe =
              `${bloc.id}_${idx}_${Date.now()}`
                .replace(
                  /[^a-zA-Z0-9]/g,
                  ""
                );

            return {

              immatricule:
                immVehicule,

              prixVehicule:
                0.0,

              dateCirculation:
                dateAujourdhuiIso,

              categorie:
                "SERVICE",

              carteGriseDisponible:
                true,

              genre:
                v.genre?.trim() ||
                "MOTO",

              marque:
                v.marque?.trim() ||
                "NON-SPECIFIE",

              type:
                v.type?.trim() ||
                "NON-SPECIFIE",

              nomDetenteur:
                detenteurPropre,

              prenomDetenteur:
                "Non specifie",

              immatriculeDetenteur:
                `DET${suffixe}`,

              cinDetenteur:
                "000000000000",

              districtDetenteur:
                config.districtMinistere
                  ?.trim() ||
                "MAHAJANGA I",

              nomChauffeur:
                "Non specifie",

              immatriculeChauffeur:
                `CHF${suffixe}`,

              cinChauffeur:
                "000000000000",

              etatId:
                resolvedEtatId
            };
          }
        );

      // PAYLOAD SOA

      const payload = {

        codeSoa:
          codeSoa,

        regionId:
          config.nomRegion
            ?.trim()
            .toUpperCase() ===
          "BOENY"
            ? 1
            : null,

        nomMinistere:
          bloc.nomMinistere
            .trim(),

        districtMinistere:
          config.districtMinistere
            ?.trim() ||
          "MAHAJANGA I",

        vehicules:
          vehicules
      };

      // ========================================================
      // ENVOI AU BACKEND
      // ========================================================

      try {

        await client.post(
          "/soa",
          payload
        );

        dossiersSauves++;

      } catch (errBloc) {

        console.error(
          `Erreur pour le bloc ${bloc.nomMinistere}:`,
          errBloc
        );

        const messageBackend =
          errBloc.response?.data
            ?.message ||
          errBloc.response?.data
            ?.error ||
          errBloc.response?.data
            ?.detail;

        throw new Error(
          messageBackend
            ? `Erreur lors de l'enregistrement de "${bloc.nomMinistere}" : ${messageBackend}`
            : `Erreur lors de l'enregistrement de "${bloc.nomMinistere}".`
        );
      }
    }

    
    // SUCCES
    

    setSuccess(
      `Succès complet ! Les ${dossiersSauves} dossiers multi-SOA ont été enregistrés avec succès.`
    );

    setBlocsMinisteres([]);
    setListeFeuilles([]);
    setClasseurData({});
    setFeuilleSelectionnee("");
    setCodeSoaAComparer("");

  } catch (err) {

    console.error(
      "Détail de l'erreur interceptée :",
      err
    );

    setError(
      err.message ||
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Erreur lors de l'enregistrement des SOA."
    );

  } finally {

    setLoading(false);
  }
  };

    const handleComparer = async () => {
    setError(""); setSuccess("");
    if (blocsMinisteres.length === 0) return setError("Veuillez d'abord charger un fichier Excel.");
    if (!codeSoaAComparer.trim()) return setError("Veuillez saisir un Code SOA pour la comparaison.");

    try {
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoaAComparer.trim())}`);
      const soaData = resSoa.data;
      if (!soaData || !soaData.id) return setError("Code SOA introuvable en base de données.");
      if (!soaData.ministere?.nomMinistere) return setError("Ce code SOA existe mais aucun ministère ne lui est associé.");

      const cleBDD = normaliserNomMinistere(soaData.ministere.nomMinistere);
      const blocsCorrespondants = blocsMinisteres.filter((bloc) => (bloc.cleMinistere || normaliserNomMinistere(bloc.nomMinistere)) === cleBDD);

      if (blocsCorrespondants.length === 0) return setError(`Le ministère "${soaData.ministere.nomMinistere}" n'a pas été localisé dans l'Excel.`);
      navigate("/patrimoine/recensement-comparer", { state: { codeSoa: codeSoaAComparer.trim(), blocs: blocsCorrespondants } });
    } catch (err) {
      setError(err.response?.data?.message || "Le code SOA saisi n'existe pas ou le serveur est inaccessible.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="mb-6 border-b pb-4"><h1 className="text-2xl font-bold text-gray-800">Importation & Comparaison Multi-SOA (Excel)</h1></div>

        <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-dashed flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full text-left">
            <label className="block text-xs font-bold text-gray-500 mb-1">Fichier d'inventaire Excel</label>
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="cursor-pointer text-sm w-full text-gray-600" />
          </div>
          <div className="w-full lg:w-64">
            <label htmlFor="codeSoaComparer" className="block text-xs font-bold text-gray-600 mb-1">Code SOA à comparer</label>
            <input id="codeSoaComparer" type="text" placeholder="Entrer le code" value={codeSoaAComparer} onChange={(e) => setCodeSoaAComparer(e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-gray-300 outline-none" />
          </div>
          <div className="w-full lg:w-auto pt-4 lg:pt-0"><button type="button" onClick={handleComparer} className="w-full lg:w-auto px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs h-[38px] flex items-center justify-center">Comparer</button></div>
        </div>

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

        <form onSubmit={enregistrerTousLesSOA}>
          {blocsMinisteres.map((bloc) => {
            const config = configBlocs[bloc.id] || { codeSoa: "", nomRegion: "", districtMinistere: "" };
            const pageActive = paginations[bloc.id] || 1; const totalPages = Math.ceil(bloc.vehicules.length / itemsPerPage);
            const debut = (pageActive - 1) * itemsPerPage; const vehiculesAffiches = bloc.vehicules.slice(debut, debut + itemsPerPage);

            return (
              <div key={bloc.id} className="mb-10 bg-gray-50 p-5 rounded-3xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Ministère</label><input type="text" value={bloc.nomMinistere} readOnly className="p-2 border rounded-xl w-full text-xs font-bold bg-gray-200/60 truncate" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Code SOA *</label><input type="text" placeholder="Code SOA *" value={config.codeSoa} onChange={(e) => handleConfigChange(bloc.id, "codeSoa", e.target.value)} className="p-2 border rounded-xl w-full text-xs font-bold border-blue-300" required /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">Région</label><input type="text" value={config.nomRegion} onChange={(e) => handleConfigChange(bloc.id, "nomRegion", e.target.value)} className="p-2 border rounded-xl w-full text-xs" required /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1">District</label><input type="text" value={config.districtMinistere} onChange={(e) => handleConfigChange(bloc.id, "districtMinistere", e.target.value)} className="p-2 border rounded-xl w-full text-xs" required /></div>
                </div>

                <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-gray-600">Véhicules ({bloc.vehicules.length})</span><button type="button" onClick={() => handleAjouterLigne(bloc.id)} className="px-3 py-1 bg-green-600 text-white font-semibold text-xs rounded-lg">+</button></div>

                <div className="overflow-x-auto border bg-white rounded-2xl mb-3">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-800 text-white"><tr><th className="p-2.5">Immatriculation</th><th className="p-2.5">Marque</th><th className="p-2.5">Type</th><th className="p-2.5">Genre</th><th className="p-2.5">État</th><th className="p-2.5">Détenteur</th><th className="p-2.5 text-center">Action</th></tr></thead>
                    <tbody className="divide-y">
                      {vehiculesAffiches.map((v, localIdx) => {
                        const originalIdx = debut + localIdx;
                        return (
                          <tr key={`${bloc.id}-${originalIdx}`} className="hover:bg-gray-50">
                            <td className="p-1.5"><input type="text" value={v.immatricule} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "immatricule", e.target.value)} className="w-full border p-1 rounded font-semibold text-xs" /></td>
                            <td className="p-1.5"><input type="text" value={v.marque} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "marque", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1.5"><input type="text" value={v.type} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "type", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1.5"><input type="text" value={v.genre} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "genre", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1.5"><input type="text" value={v.etatGeneral} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "etatGeneral", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1.5"><input type="text" value={v.nomDetenteur} onChange={(e) => handleItemTableChange(bloc.id, originalIdx, "nomDetenteur", e.target.value)} className="w-full border p-1 rounded text-xs" /></td>
                            <td className="p-1.5 text-center"><button type="button" onClick={() => handleSupprimerLigne(bloc.id, originalIdx)} className="w-6 h-6 bg-red-100 text-red-700 rounded-lg font-bold">—</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-white p-2 border rounded-xl text-xs">
                    <button type="button" disabled={pageActive === 1} onClick={() => setPaginations((p) => ({ ...p, [bloc.id]: pageActive - 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Précédent</button>
                    <span className="text-gray-500 font-medium">Page {pageActive} sur {totalPages}</span>
                    <button type="button" disabled={pageActive === totalPages} onClick={() => setPaginations((p) => ({ ...p, [bloc.id]: pageActive + 1 }))} className="px-2.5 py-1 border rounded disabled:opacity-40 font-semibold">Suivant</button>
                  </div>
                )}
              </div>
            );
          })}

          {blocsMinisteres.length > 0 && (
            <div className="flex justify-end border-t pt-4">
              <button type="submit" disabled={loading} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl text-sm shadow-sm">{loading ? "Enregistrement..." : "Enregistrer Tous les SOA"}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}