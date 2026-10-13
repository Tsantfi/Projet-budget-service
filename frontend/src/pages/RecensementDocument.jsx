import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RecensementDocument() {
  const location = useLocation();
  const navigate = useNavigate();

  const recensement = location.state?.recensement;
  const soaId = location.state?.soaId;

  /** PROTECTION*/

  useEffect(() => {
    if (!recensement) {
      navigate("/quitus/sortie", {
        replace: true,
      });
    }
  }, [recensement, navigate]);

  if (!recensement) {
    return null;
  }

  /** DONNÉES*/

  const vehicules =
    recensement.vehicules?.filter(
      (v) => v.actif !== false
    ) || [];

  const annee = recensement.annee || "";
  const ministere = recensement.ministere || "";
  const niveau = recensement.niveau || "Boeny";
  const directionService =
    recensement.directionServiceRecensement || "";

  const nomPrenomResponsable =
    recensement.nomPrenomResponsable || "";

  const fonctionResponsable =
    recensement.fonctionResponsable || "";

  const telephoneResponsable =
    recensement.telephoneResponsable || "";

  const emailResponsable =
    recensement.emailResponsable || "";

  /*
   * Objet
   */
  const objet =
    recensement.objet ||
    "COORDONNEES DU RESPONSABLE DES BIENS (MEUBLES ET IMMEUBLES) DE LA DIRECTION OU SERVICE";

  /** IMPRESSION*/

  const imprimerRecensement = () => {
    window.print();
  };

  /*
   * PASSAGE AU QUITUS
   */

  const continuerVersQuitus = () => {
    navigate("/quitus/document", {
      state: {
        recensement,
        soaId,
      },
    });
  };

  /*
   * FORMAT CATÉGORIE
   */

  const afficherCategorie = (categorie) => {
    if (!categorie) return "—";

    switch (categorie.toUpperCase()) {
      case "REPRESENTATION":
        return "1-Représentation";

      case "FONCTION":
        return "2-Fonction";

      case "SERVICE":
        return "3-Service";

      default:
        return categorie;
    }
  };

  /** FORMAT ÉTAT*/

  const afficherEtat = (etat) => {
    if (!etat) return "—";

    const valeur = etat.toUpperCase();

    if (
      valeur.includes("MARCHE") ||
      valeur.includes("EN MARCHE")
    ) {
      return "1-En marche";
    }

    if (valeur.includes("PANNE")) {
      return "2-En panne";
    }

    if (
      valeur.includes("CALLE") ||
      valeur.includes("CALE")
    ) {
      return "3-Sur calle";
    }

    if (valeur.includes("EPAVE") ||
      valeur.includes("ÉPAVE")) {
      return "4-Épave";
    }

    return etat;
  };

  /** ANNÉE DE CIRCULATION*/

  const afficherDateCirculation = (annee) => {
    if (!annee) return "—";

    return annee;
  };

  return (
    <>
      {/*ZONE NON IMPRIMÉE*/}

      <div className="no-print min-h-screen bg-gray-100 px-6 py-8">

        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Recensement des véhicules administratifs
              </h1>

              <p className="text-gray-500 mt-1">
                Document annuel validé — {annee}
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  navigate("/quitus/recensement", {
                    state: {
                      recensement,
                      soaId,
                    },
                  })
                }
                className="px-5 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              >
                Retour
              </button>

              <button
                onClick={imprimerRecensement}
                className="px-6 py-3 rounded-xl bg-haigana-dark text-white font-semibold shadow-lg hover:shadow-xl transition"
              >
                Imprimer le recensement
              </button>

              <button
                onClick={continuerVersQuitus}
                className="px-6 py-3 rounded-xl bg-haigana-blue text-white font-semibold shadow-lg hover:shadow-xl transition"
              >
                Continuer vers le quitus
              </button>

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">

            <p className="text-sm text-gray-500">
              Le recensement est validé. Imprimez ce document
              avant de continuer vers le quitus.
            </p>

          </div>

        </div>
      </div>


      {/*DOCUMENT À IMPRIMER*/}

      <div className="print-document">

        <div className="document-page">

          {/*TITRE*/}

          <h1 className="document-title">
            FICHE DE RECENSEMENT DES VEHICULES ADMINISTRATIFS
          </h1>


          {/*INFORMATIONS ADMINISTRATIVES*/}

          <div className="administratif">

            <div>
              <span className="label">
                MINISTERE :
              </span>{" "}
              {ministere}
            </div>

            <div>
              <span className="label">
                NIVEAU :
              </span>{" "}
              {niveau}
            </div>

            <div>
              <span className="label">
                DIRECTION/SERVICE :
              </span>{" "}
              {directionService}
            </div>

          </div>


          {/* -------------------------------------------------
              OBJET*/}

          <div className="objet">

            <div className="objet-title">
              {objet}
            </div>

          </div>


          {/* -------------------------------------------------
              RESPONSABLE*/}

          <div className="responsable">

            <div className="responsable-item">

              <span className="label">
                Nom et Prénom :
              </span>{" "}
              {nomPrenomResponsable}

            </div>

            <div className="responsable-item">

              <span className="label">
                Fonction :
              </span>{" "}
              {fonctionResponsable}

            </div>

            <div className="responsable-item">

              <span className="label">
                Tél :
              </span>{" "}
              {telephoneResponsable}

            </div>

            <div className="responsable-item">

              <span className="label">
                E-mail :
              </span>{" "}
              {emailResponsable}

            </div>

          </div>


          {/* -------------------------------------------------
              TABLEAU*/}

          <table className="recensement-table">

            <thead>

              <tr>

                <th rowSpan="2">
                  CODE SOA
                </th>

                <th rowSpan="2">
                  IMMATRICULA<br />
                  TION
                </th>

                <th rowSpan="2">
                  MARQUE
                </th>

                <th rowSpan="2">
                  TYPE
                </th>

                <th rowSpan="2">
                  GENRE
                </th>

                <th rowSpan="2">
                  SOURCE<br />
                  D'ÉNERGIE
                </th>

                <th rowSpan="2">
                  CATEGORIE
                  <br />
                  <span className="small">
                    1-Représentation
                    <br />
                    2-Fonction
                    <br />
                    3-Service
                  </span>
                </th>

                <th rowSpan="2">
                  ANNEE DE<br />
                  MISE EN<br />
                  CIRCULATION
                </th>

                <th rowSpan="2">
                  ETAT GENERAL
                  <br />
                  <span className="small">
                    1-En marche
                    <br />
                    2-En panne
                    <br />
                    3-Sur calle
                    <br />
                    4-Epave
                  </span>
                </th>

                <th colSpan="2">
                  DISPONIBILITE DE LA
                  <br />
                  CARTE GRISE
                </th>

                <th rowSpan="2">
                  DETENTEUR
                  <br />
                  EFFECTIF
                </th>

              </tr>

              <tr>

                <th>
                  Oui (*)
                </th>

                <th>
                  Non
                </th>

              </tr>

            </thead>


            <tbody>

              {vehicules.map((vehicule, index) => (

                <tr key={vehicule.id || index}>

                  <td>
                    {vehicule.codeSoa || "—"}
                  </td>

                  <td>
                    {vehicule.immatriculation || "—"}
                  </td>

                  <td>
                    {vehicule.marque || "—"}
                  </td>

                  <td>
                    {vehicule.type || "—"}
                  </td>

                  <td>
                    {vehicule.genre || "—"}
                  </td>

                  <td>
                    {vehicule.sourceEnergie || "—"}
                  </td>

                  <td>
                    {afficherCategorie(
                      vehicule.categorie
                    )}
                  </td>

                  <td>
                    {afficherDateCirculation(
                      vehicule.anneeMiseCirculation
                    )}
                  </td>

                  <td>
                    {afficherEtat(
                      vehicule.etatGeneral
                    )}
                  </td>

                  <td className="center">

                    {vehicule.carteGriseDisponible === true
                      ? "Oui"
                      : ""}

                  </td>

                  <td className="center">

                    {vehicule.carteGriseDisponible === false
                      ? "Non"
                      : ""}

                  </td>

                  <td>
                    {vehicule.detenteurEffectif || "—"}
                  </td>

                </tr>

              ))}

              {vehicules.length === 0 && (

                <tr>

                  <td
                    colSpan="12"
                    className="empty"
                  >
                    Aucun véhicule recensé.
                  </td>

                </tr>

              )}

            </tbody>

          </table>


          {/* -------------------------------------------------
              SIGNATURE*/}

          <div className="signature">

            Le Dépositaire Comptable Matière

          </div>

        </div>

      </div>


      {/*STYLE D'IMPRESSION*/}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .print-document {
          background: white;
          min-height: 100vh;
        }

        .document-page {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 45px 35px 50px;
          background: white;
          font-family: "Times New Roman", Times, serif;
          color: #111;
        }

        .document-title {
          text-align: center;
          font-size: 21px;
          font-weight: bold;
          margin: 15px 0 30px;
          text-transform: uppercase;
        }

        .administratif {
          font-size: 17px;
          line-height: 1.55;
          font-weight: bold;
          margin-bottom: 25px;
        }

        .administratif .label,
        .responsable .label {
          text-transform: uppercase;
          text-decoration: underline;
        }

        .objet {
          margin-top: 20px;
          margin-bottom: 30px;
        }

        .objet-title {
          font-size: 15px;
          font-weight: bold;
          text-transform: uppercase;
          text-decoration: underline;
        }

        .responsable {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 15px;
          align-items: center;
          font-size: 15px;
          margin-bottom: 5px;
        }

        .responsable-item {
          white-space: nowrap;
        }

        .recensement-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 11px;
        }

        .recensement-table th,
        .recensement-table td {
          border: 1px solid #555;
          padding: 6px 5px;
          text-align: center;
          vertical-align: middle;
          word-wrap: break-word;
        }

        .recensement-table th {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10px;
        }

        .recensement-table td {
          font-size: 10px;
        }

        .recensement-table .small {
          font-size: 8px;
          font-weight: normal;
          text-transform: none;
        }

        .recensement-table .center {
          text-align: center;
        }

        .recensement-table .empty {
          padding: 20px;
          font-style: italic;
        }

        .signature {
          margin-top: 65px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
        }

        @media screen {
          .print-document {
            padding: 20px;
            background: #f3f4f6;
          }

          .document-page {
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.12);
          }
        }

        @media print {

          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-document {
            display: block;
            width: 100%;
            min-height: auto;
            background: white;
          }

          .document-page {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 5mm 4mm;
            box-shadow: none;
          }

          .document-title {
            font-size: 16px;
            margin-top: 3mm;
            margin-bottom: 7mm;
          }

          .administratif {
            font-size: 13px;
            line-height: 1.35;
            margin-bottom: 5mm;
          }

          .objet {
            margin-top: 4mm;
            margin-bottom: 6mm;
          }

          .objet-title {
            font-size: 11px;
          }

          .responsable {
            font-size: 10px;
            gap: 7px;
            margin-bottom: 1mm;
          }

          .recensement-table {
            font-size: 8px;
          }

          .recensement-table th,
          .recensement-table td {
            padding: 3px 2px;
            font-size: 7.5px;
          }

          .recensement-table th {
            font-size: 7.5px;
          }

          .recensement-table .small {
            font-size: 6px;
          }

          .signature {
            margin-top: 18mm;
            font-size: 11px;
          }

          tr {
            page-break-inside: avoid;
          }

        }

      `}</style>
    </>
  );
}