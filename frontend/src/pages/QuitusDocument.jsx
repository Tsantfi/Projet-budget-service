import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QuitusDocument = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // DONNÉES DU RECENSEMENT VALIDÉ

  const recensement = location.state?.recensement;

  // SI LE RECENSEMENT N'EXISTE PAS

  if (!recensement) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">

          <h1 className="text-xl font-bold text-gray-800 mb-3">
            Quitus introuvable
          </h1>

          <p className="text-gray-500 mb-6">
            Les données du recensement ne sont pas disponibles.
          </p>

          <button
            type="button"
            onClick={() => navigate("/quitus/sortie")}
            className="
              px-6 py-3
              rounded-xl
              bg-haigana-blue
              text-white
              font-semibold
              hover:brightness-95
              transition
            "
          >
            Retour
          </button>

        </div>
      </div>
    );
  }

  // DONNÉES DU RECENSEMENT

  const directionService =
    recensement.directionService || "";

  const annee =
    recensement.annee || "";

  /*
   * Le backend retourne normalement nombreVehicules.
   * On utilise également vehicules comme sécurité.
   */
  const vehiculesQuittus = (recensement.vehicules || []).filter(
  (v) =>
    v.actif !== false &&
    v.statut !== "ABSENT"
  );

  const nombreVehicules = vehiculesQuittus.length;

  // NOMBRE EN LETTRES

  const nombreEnLettres = (nombre) => {
    const unites = [
      "zéro",
      "un",
      "deux",
      "trois",
      "quatre",
      "cinq",
      "six",
      "sept",
      "huit",
      "neuf",
      "dix",
      "onze",
      "douze",
      "treize",
      "quatorze",
      "quinze",
      "seize",
      "dix-sept",
      "dix-huit",
      "dix-neuf",
    ];

    if (nombre < 20) {
      return unites[nombre];
    }

    if (nombre < 70) {
      const dizaines = [
        "",
        "",
        "vingt",
        "trente",
        "quarante",
        "cinquante",
        "soixante",
      ];

      const dizaine = Math.floor(nombre / 10);
      const unite = nombre % 10;

      if (unite === 0) {
        return dizaines[dizaine];
      }

      if (unite === 1) {
        return `${dizaines[dizaine]} et un`;
      }

      return `${dizaines[dizaine]}-${unites[unite]}`;
    }

    if (nombre < 80) {
      const reste = nombre - 60;

      if (reste === 0) {
        return "soixante";
      }

      if (reste < 20) {
        if (reste === 1) {
          return "soixante et onze";
        }

        return `soixante-${unites[reste]}`;
      }
    }

    if (nombre < 100) {
      const reste = nombre - 80;

      if (reste === 0) {
        return "quatre-vingts";
      }

      return `quatre-vingt-${unites[reste]}`;
    }

    if (nombre === 100) {
      return "cent";
    }

    return nombre.toString();
  };

  const nombreVehiculesTexte =
    nombreEnLettres(nombreVehicules);

  // IMPRESSION

  const handlePrint = () => {
    window.print();
  };

  // DOCUMENT

  return (
    <>
      {/*BARRE DE CONTRÔLE*/}

      <div className="print:hidden quitus-controls">

        <div className="controls-inner">

          <button
            type="button"
            onClick={() => navigate("/quitus/sortie")}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-gray-200
              text-gray-700
              font-semibold
              hover:bg-gray-300
              transition
            "
          >
            Retour
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="
              px-6
              py-2.5
              rounded-xl
              bg-haigana-blue
              text-white
              font-semibold
              shadow-md
              hover:brightness-95
              transition
            "
          >
            Imprimer
          </button>

        </div>

      </div>

      {/*FEUILLE A4*/}

      <div className="quitus-page">

        <div className="quitus-document">

          {/*RÉPUBLIQUE DE MADAGASCAR*/}

          <div className="republique">

            <div className="embleme-container">

              <img
                src="/devises_de_la_République.png"
                alt="Emblème de la République de Madagascar"
                className="embleme"
              />

            </div>

            <div className="republique-nom">
              REPOBLIKAN'I MADAGASIKARA
            </div>

            <div className="republique-devise">
              Fitiavana-Tanindrazana-Fandrosoana
            </div>

            <div className="republique-trait" />

          </div>

          {/*EN-TÊTE ADMINISTRATIF*/}

          <div className="administration">

            <div className="administration-bloc">

              {/* LOGO */}

              <div className="dgbf-logo-container">

                <img
                  src="/dgbf.png"
                  alt="DGBF"
                  className="dgbf-logo"
                />

              </div>

              {/* TEXTES ADMINISTRATIFS */}

              <div className="administration-text">

                <div>
                  MINISTÈRE DE L'ÉCONOMIE ET DES FINANCES
                </div>

                <div className="admin-space">
                  SECRÉTARIAT GÉNÉRAL
                </div>

                <div className="admin-space">
                  DIRECTION GÉNÉRALE DU BUDGET
                </div>

                <div>
                  ET DES FINANCES
                </div>

                <div className="admin-space">
                  DIRECTION DU BUDGET
                </div>

                <div className="admin-space">
                  SERVICE RÉGIONAL DU BUDGET BOENY
                </div>

              </div>

            </div>

          </div>

          {/*NUMÉRO DU QUITUS*/}

          <div className="numero-quitus">

            <span className="numero-label">
              N°
            </span>

            {/* NUMÉRO À ÉCRIRE MANUELLEMENT */}

            <span className="numero-manuel">
              &nbsp;
            </span>

            <span className="numero-reference">
              /MEF/SG/DGBF/DB/SRB/B
            </span>

          </div>

          {/*TITRE*/}

          <h1 className="titre-quitus">
            QUITUS DE RECENSEMENT DES VEHICULES ADMINISTRATIFS
          </h1>

          {/*CORPS DU QUITUS*/}

          <div className="corps-quitus">

            <p>
              Le Chef de Service Régional du Budget-Boeny atteste
              par le présent que la{" "}
              <strong>
                {directionService}
              </strong>{" "}
              a déposé les dossiers de recensement des véhicules
              administratifs à sa disposition, pour l'année{" "}
              <strong>{annee}</strong>.
            </p>

            <p className="nombre-vehicules">

              Les véhicules administratifs déclarés sont arrêtés
              au nombre de{" "}

              <strong>
                {nombreVehiculesTexte}
              </strong>{" "}

              (
              <strong>
                {nombreVehicules}
              </strong>
              ).

            </p>

          </div>

          {/*DATE / TAMPON*/}

          <div className="fait-a">

            <span>
              Fait à Mahajanga, le
            </span>

            {/* DATE À REMPLIR MANUELLEMENT */}

            <span className="zone-date">
              &nbsp;
            </span>

          </div>

        </div>

      </div>

      {/*STYLE*/}

      <style>{`

        /* CONTROLES */

        .quitus-controls {
          width: 100%;
          background: #f3f4f6;
          padding: 24px;
        }

        .controls-inner {
          width: 210mm;
          margin: 0 auto;

          display: flex;
          justify-content: space-between;
          align-items: center;
        }


        /* PAGE */

        .quitus-page {
          width: 100%;
          min-height: 100vh;

          background: #e5e7eb;

          padding: 30px 0;
        }


        /* DOCUMENT A4 */

        .quitus-document {
          width: 210mm;
          min-height: 297mm;

          margin: 0 auto;

          background: white;

          box-sizing: border-box;

          padding:
            10mm
            15mm
            15mm
            15mm;

          color: #222;

          font-family:
            "Times New Roman",
            Times,
            serif;

          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.15);

          position: relative;
        }


        /* RÉPUBLIQUE */

        .republique {
          position: relative;
          height: 40mm;
          top: -12mm;

          text-align: center;
        }


        .embleme-container {
          width: 38mm;
          height: 30mm;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        .embleme {
          max-width: 100%;
          max-height: 100%;

          object-fit: contain;
        }


        .republique-nom {
          margin-top: -5mm;

          font-size: 14px;

          font-weight: normal;

          letter-spacing: 0.2px;
        }


        .republique-devise {
          margin-top: 2mm;

          font-size: 12px;

          font-style: italic;
        }


        .republique-trait {
          width: 35mm;

          margin:
            3mm
            auto
            0;

          border-top:
            1px
            solid
            #555;
        }


        /* ADMINISTRATION */

        .administration {
          height: 65mm;
          margin-top: -12mm;
          margin-left: -18mm;

          position: relative;
        }


        .administration-bloc {
          width: 100mm;

          margin-left: 7mm;

          text-align: center;
        }


        .dgbf-logo-container {
          width: 100%;

          height: 32mm;

          display: flex;

          justify-content: center;

          align-items: center;
        }


        .dgbf-logo {
          width: 35mm;

          height: auto;

          object-fit: contain;
        }


        .administration-text {
          margin-top: 1mm;

          font-size: 12px;

          line-height: 1.45;

          font-weight: bold;
        }


        .admin-space {
          margin-top: 2mm;
        }


        /* NUMÉRO */

        .numero-quitus {
          display: flex;

          align-items: center;

          margin-left: 9mm;

          margin-top: 25mm;

          font-size: 15px;
        }


        .numero-label {
          margin-right: 3mm;
        }


        .numero-manuel {
          display: inline-block;

          width: 13mm;

          height: 6mm;

          border-bottom:
            1px
            solid
            #333;

          margin-right: 3mm;
        }


        .numero-reference {
          white-space: nowrap;
        }


        /* TITRE */

        .titre-quitus {
          margin-top: 7mm;

          margin-bottom: 0;

          text-align: center;

          font-size: 16px;

          line-height: 1.4;

          font-weight: bold;

          text-decoration: underline;
        }


        /* CORPS */

        .corps-quitus {
          margin-top: 13mm;

          padding:
            0
            9mm;

          font-size: 17px;

          line-height: 1.75;
        }


        .corps-quitus p {
          margin: 0;
        }


        .nombre-vehicules {
          margin-top: 13mm !important;

          text-align: center;
        }


        .nombre-vehicules strong {
          font-weight: bold;
        }


        /* DATE */

        .fait-a {
          position: absolute;

          right: 18mm;

          bottom: 75mm;

          display: flex;

          align-items: center;

          font-size: 17px;
        }


        .zone-date {
          display: inline-block;

          width: 43mm;

          height: 8mm;

          margin-left: 3mm;

          border-bottom:
            1px
            solid
            #333;
        }


        /* IMPRESSION */

        @media print {

          @page {
            size: A4;
            margin: 0;
          }


          html,
          body {
            margin: 0 !important;
            padding: 0 !important;

            background: white !important;
          }


          .quitus-controls {
            display: none !important;
          }


          .quitus-page {
            width: 210mm;

            min-height: 297mm;

            padding: 0 !important;

            margin: 0 !important;

            background: white !important;
          }


          .quitus-document {
            width: 210mm !important;

            height: 297mm !important;

            min-height: 297mm !important;

            margin: 0 !important;

            padding:
              10mm
              15mm
              15mm
              15mm;

            box-shadow: none !important;
          }


          .quitus-document {
            page-break-after: always;
          }

        }

      `}</style>
    </>
  );
};

export default QuitusDocument;