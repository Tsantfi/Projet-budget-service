import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LogementRecensementDocument() {
  const location = useLocation();
  const navigate = useNavigate();

  const recensement = location.state?.recensement;
  const soaId = location.state?.soaId;

  // ROUTINE DE SÉCURITÉ : Redirection si l'état de session est absent
  useEffect(() => {
    if (!recensement) {
      navigate(-1);
    }
  }, [recensement, navigate]);

  if (!recensement) return null;

  const logements = recensement.logements || recensement.lignes || [];
  const annee = recensement.annee || "2025";
  
  // EXTRACTION DES SÉRIALISATIONS ISSUES DE L'EXCEL
  const ministere = recensement.ministere || "Ministère de l'Industrie, du Commerce et de l'Artisanat";
  const niveau = recensement.niveau || "Région BOENY";
  const directionService = recensement.directionService || "CHAMBRE DE COMMERCE ET D'INDUSTRIE DE MAHAJANGA";
  
  const nomResponsable = recensement.nom || recensement.nomPrenomResponsable || "ANDRE Pierrot";
  const fonctionResponsable = recensement.fonction || recensement.fonctionResponsable || "Directeur Général";
  const telephoneResponsable = recensement.telephone || recensement.telephoneResponsable || "034 14 560 07";
  const emailResponsable = recensement.email || recensement.emailResponsable || "cci.mjn@moov.mg";
  
  const objetRecensement = recensement.objet || "COORDONNEES DU RESPONSABLE DES BIENS (MEUBLES ET IMMEUBLES) DE LA DIRECTION OU SERVICE :";

  const imprimerFiche = () => {
    window.print();
  };

  return (
    <>
      {/* ZONE COMMANDE ÉCRAN : Masquée à l'impression */}
      <div className="no-print min-h-screen bg-gray-100 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fiche de Recensement Papier (Format Paysage)</h1>
              <p className="text-gray-500 text-xs mt-1">Génération de la grille d'inventaire élargie — Exercice {annee}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition">Retour</button>
              <button type="button" onClick={imprimerFiche} className="px-4 py-2 text-xs font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-700 transition shadow-sm">Imprimer la Fiche</button>
            </div>
          </div>
        </div>
      </div>

            {/* ZONE PHYSIQUE D'IMPRESSION (A4 Paysage) */}
      <div className="print-document">
        <div className="document-page">

          {/* TITRE DE LA FICHE COMPTABLE */}
          <h1 className="excel-main-title">
            FICHE DE RECENSEMENT DES LOGEMENTS ET BATIMENTS ADMINISTRATIFS
          </h1>

          {/* INFRASTRUCTURES ADMINISTRATIVES */}
          <div className="metadata-excel-section">
            <div className="meta-row">
              <span className="meta-label">MINISTERE :</span>
              <span className="meta-value">{ministere}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">NIVEAU :</span>
              <span className="meta-value">{niveau}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">DIRECTION / SERVICE :</span>
              <span className="meta-value">{directionService}</span>
            </div>
          </div>

          {/* UTILISATION DYNAMIQUE DU CHAMP OBJET POUR LES COORDONNÉES */}
          <div className="responsable-title-bar">
            {objetRecensement}
          </div>

          {/* CARTUCHE COORDONNÉES DU RESPONSABLE EXTENSIBLE */}
          <div className="responsable-excel-block">
            <div className="res-cell"><span className="bold-lbl">Nom et Prénoms :</span> {nomResponsable}</div>
            <div className="res-cell"><span className="bold-lbl">Fonction :</span> {fonctionResponsable}</div>
            <div className="res-cell"><span className="bold-lbl">Tél :</span> {telephoneResponsable}</div>
            <div className="res-cell"><span className="bold-lbl">E-mail :</span> {emailResponsable}</div>
          </div>

                    {/* GRILLE COMPTABLE HORIZONTALE ADAPTÉE AU PAYSAGE */}
          <table className="excel-logement-table">
            <thead>
              <tr>
                <th rowSpan="2" className="w-14">NUMERO<br/><span className="sub-lbl">Une unité par fondation</span></th>
                <th rowSpan="2" className="w-64">NOM DU BATIMENT ET/OU DE LA PROPRIETE</th>
                <th rowSpan="2" className="w-32">NATURE<br/><span className="sub-lbl">1- Bureau, 2- Logement...</span></th>
                <th colSpan="2">UTILISATEURS</th>
                <th rowSpan="2" className="w-32">ETAT DE LA BATISSE<br/><span className="sub-lbl">1- Bon, 2- Moyen...</span></th>
                <th rowSpan="2" className="w-48">LOCALITE<br/><span className="sub-lbl">(District-Commune-Fkt)</span></th>
                <th rowSpan="2">ADRESSE ET POINT DE REPERE</th>
              </tr>
              <tr>
                <th className="w-44">Entité <span className="sub-lbl">(si bâtiment)</span></th>
                <th className="w-44">Occupant <span className="sub-lbl">(Si logement)</span></th>
              </tr>
            </thead>
            <tbody>
              {logements.map((l, index) => (
                <tr key={l.id || index}>
                  <td className="center">{l.numero ? Number(l.numero).toFixed(1) : `${(index + 1).toFixed(1)}`}</td>
                  <td className="left font-bold text-gray-900">{l.nomBatiment || "—"}</td>
                  <td className="center">{l.nature || "—"}</td>
                  <td className="left">{l.entiteUtilisatrice || "—"}</td>
                  <td className="left">{l.occupant || "—"}</td>
                  <td className="center uppercase">{l.etatBatisse || "MOYEN"}</td>
                  <td className="left">{l.localite || "—"}</td>
                  <td className="left">{l.adressePointRepere || "—"}</td>
                </tr>
              ))}
              {logements.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-cell">Aucun bâtiment administratif répertorié pour ce Code SOA.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* SIGNATURE BAS DE PAGE SANS ÉMOJI */}
          <div className="excel-signature-block">
            <div className="title-sig">Le {fonctionResponsable}</div>
            <div className="name-sig">{nomResponsable}</div>
          </div>

        </div>
      </div>

            <style>{`
        /* CONTEXTE ÉCRAN : Simulation de feuille A4 Paysage blanche étalée */
        .print-document { background: #e5e7eb !important; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 20px; }
        .document-page { width: 297mm; min-height: 210mm; box-sizing: border-box; background: #ffffff !important; padding: 12mm 15mm; font-family: "Times New Roman", Times, serif; color: #000000; line-height: 1.35; }
        
        .excel-main-title { text-align: left; font-size: 14pt; font-weight: bold; text-decoration: underline; margin-bottom: 20px; font-family: Arial, sans-serif; }
        .metadata-excel-section { margin-bottom: 15px; font-size: 11pt; }
        .meta-row { margin-bottom: 4px; }
        .meta-label { font-weight: bold; display: inline-block; width: 180px; }
        
        .responsable-title-bar { font-size: 10pt; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 8px; font-family: Arial, sans-serif; }
        .responsable-excel-block { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border: 1px solid #000; padding: 8px; font-size: 10pt; margin-bottom: 20px; }
        .bold-lbl { font-weight: bold; }
        
        .excel-logement-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-top: 15px; table-layout: fixed; }
        .excel-logement-table th, .excel-logement-table td { border: 1px solid #000000 !important; padding: 6px 8px; vertical-align: middle; word-wrap: break-word; color: #000 !important; background: transparent !important; }
        .excel-logement-table th { font-weight: bold; text-align: center; font-size: 9.5pt; background-color: #f2f2f2 !important; }
        .excel-logement-table th .sub-lbl { font-size: 7.5pt; font-weight: normal; font-style: italic; text-transform: none; display: block; }
        .excel-logement-table .center { text-align: center; }
        .excel-logement-table .left { text-align: left; }
        .excel-logement-table .empty-cell { text-align: center; padding: 25px; font-style: italic; color: #666; }
        
        .excel-signature-block { margin-top: 40px; float: right; text-align: center; width: 250px; font-size: 11pt; }
        .excel-signature-block .title-sig { font-weight: bold; text-decoration: underline; margin-bottom: 50px; }
        .excel-signature-block .name-sig { font-weight: bold; }
        
        @media screen {
          .document-page { box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        }
        
        /* IMPRESSION ET SAUT DE PAGE MULTIPLE AUTOMATIQUE EN MODE PAYSAGE */
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body, .print-document, .document-page { background: #ffffff !important; background-color: #ffffff !important; color: #000000 !important; padding: 0 !important; margin: 0 !important; width: 297mm !important; max-width: 297mm !important; box-shadow: none !important; }
          .document-page { height: auto !important; min-height: 210mm !important; overflow: visible !important; padding: 10mm 15mm !important; }
          .no-print { display: none !important; }
          .excel-logement-table { page-break-inside: auto; }
          .excel-logement-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
          .excel-logement-table thead { display: table-header-group; }
          .excel-signature-block { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </>
  );
}
