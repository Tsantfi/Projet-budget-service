import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RecensementDocument() {
  const location = useLocation();
  const navigate = useNavigate();

  const recensement = location.state?.recensement;
  const soaId = location.state?.soaId;

  // Redirection de sécurité
  useEffect(() => {
    if (!recensement) {
      navigate("/quitus/sortie", { replace: true });
    }
  }, [recensement, navigate]);

  if (!recensement) return null;

  const logements =
    recensement.logements ||
    recensement.lignes ||
    [];

  const annee =
    recensement.annee ||
    "2025";

  const niveau =
    recensement.niveau ||
    "Région Boeny";

  const imprimerRecensement = () => {
    window.print();
  };

  const proprieteDescription =
    recensement.objetTitreFoncier ||
    recensement.proprieteDescription ||
    "« LA RESIDENCE », Titre n°1122-BR sise à La Corniche Mahajanga Ville, Commune Mahajanga I.";

  const lignesTableau =
    logements.length > 0
      ? logements
      : [
          {
            id: "default-1",
            entiteUtilisatrice: "Région Boeny",
            nature: "Résidence",
          },
        ];

  return (
    <>
      {/* =========================================================
          ZONE ÉCRAN
      ========================================================= */}
      <div className="no-print min-h-screen bg-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Quitus de recensement
              </h1>

              <p className="text-gray-500 text-xs mt-1">
                Génération du document officiel — Exercice {annee}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-xs font-bold border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition"
              >
                Retour
              </button>

              <button
                type="button"
                onClick={imprimerRecensement}
                className="px-4 py-2 text-xs font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-700 transition shadow-sm"
              >
                Imprimer le Quitus
              </button>

            </div>
          </div>

        </div>
      </div>


      {/* =========================================================
          DOCUMENT PHYSIQUE
      ========================================================= */}
      <div className="print-document">

        <div className="document-page">


          {/* =====================================================
              LOGO RÉPUBLIQUE
          ===================================================== */}
          <div className="republique-container">

            <img
              src="/devises_de_la_République.png"
              alt="République de Madagascar"
              className="logo-republique"
            />

            {/* Devise sous le logo */}
            <div className="republique-text">

              <div className="nom-republique">
                REPOBLIKAN'I MADAGASIKARA
              </div>

              <div className="devise-republique">
                Fitiavana - Tanindrazana - Fandrosoana
              </div>

            </div>

          </div>


          {/* =====================================================
              LOGO DGBF + MINISTÈRE EN DESSOUS
          ===================================================== */}
          <div className="header-administratif">

            {/* LOGO DGBF */}
            <img
              src="/dgbf.png"
              alt="Direction Générale du Budget et des Finances"
              className="logo-dgbf"
            />


            {/* MINISTÈRE SOUS LE LOGO DGBF */}
            <div className="institution-labels">

              <div>
                MINISTERE DE L’ECONOMIE ET DES FINANCES
              </div>

              <div>
                SECRETAIRE GENERAL
              </div>

              <div>
                DIRECTION GENERALE DU BUDGET ET DES FINANCES
              </div>

              <div>
                DIRECTION DU PATRIMOINE DE L’ETAT
              </div>

              <div>
                SERVICE REGIONAL DU BUDGET BOENY
              </div>

            </div>

          </div>


          {/* =====================================================
              NUMÉRO DE COURRIER
          ===================================================== */}
          <div className="numero-courrier">
            N°______ /MEF/SG/DGBF/DPE/SRB/B/Div-pat
          </div>


          {/* =====================================================
              TITRE
          ===================================================== */}
          <div className="document-title">

            <div>
              QUITUS DE RECENSEMENT DES LOGEMENTS ET BATIMENTS
            </div>

            <div>
              ADMINISTRATIFS
            </div>

          </div>


          {/* =====================================================
              SOUS-TITRE
          ===================================================== */}
          <div className="document-subtitle">

            Attestant la réception de dossier de recensement des
            Logements et Bâtiments Administratifs

          </div>


          {/* =====================================================
              ANNÉE
          ===================================================== */}
          <div className="annee">
            Année : {annee}
          </div>


          {/* =====================================================
              TEXTE D'ATTESTATION
          ===================================================== */}
          <div className="attestation">

            Le Chef de Service Régional du Budget Boeny,
            atteste que la {niveau} a déposé le dossier de
            recensement des logements et bâtiments administratifs
            pour l’année {annee} relevant de la propriété citée
            comme suit :

          </div>


          {/* =====================================================
              DESCRIPTION DE LA PROPRIÉTÉ
          ===================================================== */}
          <div className="propriete-description">
            - {proprieteDescription}
          </div>


          {/* =====================================================
              TABLEAU
          ===================================================== */}
          <table className="recensement-table">

            <thead>
              <tr>

                <th>
                  UTILISATEURS
                </th>

                <th>
                  NATURE
                </th>

              </tr>
            </thead>

            <tbody>

              {lignesTableau.map((logement, index) => {

                const utilisateur =
                  logement.entiteUtilisatrice ||
                  logement.entite ||
                  logement.utilisateur ||
                  logement.occupant ||
                  "—";

                const nature =
                  logement.nature ||
                  "Bureaux";

                return (
                  <tr
                    key={
                      logement.id ||
                      logement.logementId ||
                      index
                    }
                  >

                    <td className="cell-utilisateur">
                      {utilisateur}
                    </td>

                    <td className="cell-nature">
                      {nature}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>


          {/* =====================================================
              REMARQUE
          ===================================================== */}
          <div className="remarque">

            Les Bâtiments nécessitant des entretiens sont figurés
            dans le dossier de recensement ci-dessus.

          </div>


          {/* =====================================================
              LIEU ET DATE
          ===================================================== */}
          <div className="lieu-date">
            Fait à Mahajanga, le
          </div>


          {/* =====================================================
              SIGNATURES
          ===================================================== */}
          <div className="signature-section">

            <div className="signature">
              préparé par
            </div>

            <div className="signature">
              présenté par
            </div>

            <div className="signature">
              validé par
            </div>

          </div>

        </div>
      </div>


      {/* =========================================================
          STYLE DU DOCUMENT
      ========================================================= */}
      <style>{`

        /* =======================================================
           DOCUMENT GLOBAL
        ======================================================= */

        .print-document {
          width: 100%;
          min-height: 100vh;

          background: #e5e7eb;

          display: flex;
          justify-content: center;
          align-items: flex-start;

          padding: 20px;
        }

        .document-page {
          width: 210mm;
          min-height: 297mm;

          box-sizing: border-box;

          background: #ffffff;

          padding-top: 5mm;
          padding-bottom: 10mm;
          padding-left: 10mm;
          padding-right: 10mm;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          color: #000000;

          line-height: 1.35;

          position: relative;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }


        /* =======================================================
           RÉPUBLIQUE DE MADAGASCAR
        ======================================================= */

        .republique-container {
          width: 100%;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: center;

          margin-top: 0;
          margin-bottom: 3mm;
        }

        .logo-republique {
          width: 62mm;
          height: auto;

          max-height: 25mm;

          object-fit: contain;

          display: block;
        }

        .republique-text {
          text-align: center;

          margin-top: 0;

          font-family:
            "Times New Roman",
            Times,
            serif;

          line-height: 1.05;

          color: #000000;
        }

        .nom-republique {
          font-size: 9pt;

          font-weight: bold;

          text-transform: uppercase;
        }

        .devise-republique {
          font-size: 8pt;

          font-style: italic;

          margin-top: 1mm;
        }


        /* =======================================================
           LOGO DGBF + MINISTÈRE
        ======================================================= */

        .header-administratif {
          width: 100%;

          display: flex;

          flex-direction: column;

          align-items: flex-start;

          justify-content: flex-start;

          text-align: left;

          margin-top: 2mm;

          margin-bottom: 7mm;
        }

        .logo-dgbf {
          width: 30mm;
          height: 30mm;

          object-fit: contain;

          display: block;

          position: relative;
          left: 40mm;
          top: 3mm;

          margin-bottom: 3mm;
        }

        .institution-labels {
          width: 100%;

          text-align: center;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 10pt;

          font-weight: bold;

          line-height: 1.5;

          color: #000000;

          text-transform: uppercase;
        }

        .institution-labels div {
          margin: 0;
          padding: 0;
          position: relative;
          right: 40mm;
        }


        /* =======================================================
           NUMÉRO
        ======================================================= */

        .numero-courrier {
          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 10pt;

          font-weight: bold;

          margin-left: 15mm;

          margin-top: 2mm;

          margin-bottom: 11mm;

          white-space: nowrap;
        }


        /* =======================================================
           TITRE
        ======================================================= */

        .document-title {
          text-align: center;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          line-height: 1.25;

          font-weight: bold;

          text-decoration: underline;

          margin: 0 15mm 8mm 15mm;

          text-transform: uppercase;
        }


        /* =======================================================
           SOUS-TITRE
        ======================================================= */

        .document-subtitle {
          text-align: center;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          font-weight: normal;

          margin-bottom: 8mm;

          line-height: 1.35;
        }


        /* =======================================================
           ANNÉE
        ======================================================= */

        .annee {
          text-align: center;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          font-weight: bold;

          margin-bottom: 8mm;
        }


        /* =======================================================
           ATTESTATION
        ======================================================= */

        .attestation {
          width: 100%;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          text-align: justify;

          line-height: 1.45;

          margin-bottom: 7mm;
        }


        /* =======================================================
           PROPRIÉTÉ
        ======================================================= */

        .propriete-description {
          width: 100%;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          text-align: justify;

          line-height: 1.4;

          margin-bottom: 8mm;
        }


        /* =======================================================
           TABLEAU
        ======================================================= */

        .recensement-table {
          width: 147.5mm;

          margin-left: auto;
          margin-right: auto;

          border-collapse: collapse;

          table-layout: fixed;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          color: #000000;

          margin-bottom: 7mm;
        }

        .recensement-table th,
        .recensement-table td {
          border: 1px solid #000000;

          padding-top: 1.5mm;
          padding-bottom: 1.5mm;

          padding-left: 2mm;
          padding-right: 2mm;

          vertical-align: top;

          color: #000000;

          background: #ffffff;
        }

        .recensement-table th {
          text-align: center;

          font-weight: normal;

          height: 7mm;
        }

        .recensement-table th:first-child,
        .recensement-table td:first-child {
          width: 100mm;
        }

        .recensement-table th:last-child,
        .recensement-table td:last-child {
          width: 47.5mm;
        }

        .cell-utilisateur {
          text-align: left;

          word-wrap: break-word;

          overflow-wrap: break-word;
        }

        .cell-nature {
          text-align: left;

          word-wrap: break-word;

          overflow-wrap: break-word;

          padding-left: 10mm !important;
        }


        /* =======================================================
           REMARQUE
        ======================================================= */

        .remarque {
          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          text-align: justify;

          line-height: 1.4;

          margin-bottom: 5mm;
          margin-left: 14mm;
        }


        /* =======================================================
           LIEU / DATE
        ======================================================= */

        .lieu-date {
          width: 100%;

          text-align: right;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          margin-top: 1mm;

          margin-right: 12mm;
          margin-left: -40mm;


        }


        /* =======================================================
           SIGNATURES
        ======================================================= */

        .signature-section {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          column-gap: 20mm;

          margin-top: 7mm;

          font-family:
            "Times New Roman",
            Times,
            serif;

          font-size: 12pt;

          text-align: center;
        }

        .signature {
          min-height: 30mm;

          text-align: center;

          white-space: nowrap;
        }


        /* =======================================================
           ÉCRAN
        ======================================================= */

        @media screen {

          .document-page {
            box-shadow:
              0 4px 20px rgba(0, 0, 0, 0.15);
          }

        }


        /* =======================================================
           IMPRESSION
        ======================================================= */

        @media print {

        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        html,
        body {
          width: auto;
          height: auto;

          margin: 0 !important;
          padding: 0 !important;

          background: #ffffff !important;
        }

        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .no-print {
          display: none !important;
        }

        .print-document {
          width: 100% !important;
          min-height: auto !important;

          margin: 0 !important;
          padding: 0 !important;

          background: #ffffff !important;

          display: block !important;
        }

        .document-page {
          width: 100% !important;

          /* Très important :
            ne pas imposer une hauteur de 297mm */
          min-height: auto !important;
          height: auto !important;

          margin: 0 !important;
          padding: 0 !important;

          box-shadow: none !important;

          background: #ffffff !important;

          /* Permet au contenu de continuer
            naturellement sur la page suivante */
          overflow: visible !important;
        }

        /* Évite qu'une ligne du tableau
          soit coupée entre deux pages */
        .recensement-table tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Le tableau peut continuer sur la page suivante */
        .recensement-table {
          page-break-inside: auto;
          break-inside: auto;
        }

        .recensement-table thead {
          display: table-header-group;
        }

        .recensement-table tbody {
          display: table-row-group;
        }

        /* Évite de couper les blocs importants */
        .attestation,
        .propriete-description,
        .remarque,
        .signature-section {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }

      `}</style>
    </>
  );
}