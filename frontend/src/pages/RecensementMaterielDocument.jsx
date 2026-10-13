import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

const nombreEnLettres = (nombre) => {
  const unite = [
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
  ];

  const dizaines = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
  ];

  if (nombre < 17) {
    return unite[nombre];
  }

  if (nombre < 20) {
    return `dix-${unite[nombre - 10]}`;
  }

  if (nombre < 70) {
    const dizaine = Math.floor(nombre / 10);
    const reste = nombre % 10;

    if (reste === 0) {
      return dizaines[dizaine];
    }

    if (reste === 1) {
      return `${dizaines[dizaine]} et un`;
    }

    return `${dizaines[dizaine]}-${unite[reste]}`;
  }

  if (nombre < 80) {
    if (nombre === 71) {
      return "soixante et onze";
    }

    return `soixante-${nombreEnLettres(nombre - 60)}`;
  }

  if (nombre < 100) {
    if (nombre === 80) {
      return "quatre-vingts";
    }

    return `quatre-vingt-${nombreEnLettres(
      nombre - 80
    )}`;
  }

  if (nombre < 1000) {
    const centaine = Math.floor(nombre / 100);
    const reste = nombre % 100;

    let texte =
      centaine === 1
        ? "cent"
        : `${unite[centaine]} cent`;

    if (reste === 0 && centaine > 1) {
      texte += "s";
    }

    if (reste > 0) {
      texte += ` ${nombreEnLettres(reste)}`;
    }

    return texte;
  }

  if (nombre < 1000000) {
    const milliers = Math.floor(nombre / 1000);
    const reste = nombre % 1000;

    let texte =
      milliers === 1
        ? "mille"
        : `${nombreEnLettres(milliers)} mille`;

    if (reste > 0) {
      texte += ` ${nombreEnLettres(reste)}`;
    }

    return texte;
  }

  const millions = Math.floor(
    nombre / 1000000
  );

  const reste = nombre % 1000000;

  let texte =
    millions === 1
      ? "un million"
      : `${nombreEnLettres(millions)} millions`;

  if (reste > 0) {
    texte += ` ${nombreEnLettres(reste)}`;
  }

  return texte;
};

const montantEnLettres = (montant) => {
  const valeur = Math.round(Number(montant || 0));

  return `${nombreEnLettres(valeur)} Ariary`;
};

export default function RecensementMaterielDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [recensement, setRecensement] =
    useState(location.state?.recensement || null);

  const [loading, setLoading] = useState(
    !location.state?.recensement
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (recensement || !id) {
      return;
    }

    const charger = async () => {
      try {
        setLoading(true);

        const response = await client.get(
          `/recensements-materiel/${id}`
        );

        setRecensement(response.data);
      } catch (err) {
        console.error(
          "Erreur chargement procès-verbal :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de charger le procès-verbal."
        );
      } finally {
        setLoading(false);
      }
    };

    charger();
  }, [id, recensement]);

  const groupesNomenclature = useMemo(() => {
    const groupes = new Map();

    (recensement?.lignes || []).forEach(
      (ligne) => {
        const numero =
          ligne.nomenclatureNumero ?? 0;

        const designation =
          ligne.nomenclatureDesignation ||
          "Sans désignation";

        const cle =
          `${numero}-${designation}`;

        if (!groupes.has(cle)) {
          groupes.set(cle, {
            numero,
            designation,
            lignes: [],
          });
        }

        groupes.get(cle).lignes.push(ligne);
      }
    );

    return Array.from(
      groupes.values()
    ).sort(
      (a, b) => a.numero - b.numero
    );
  }, [recensement]);

  const formatMontant = (valeur) =>
    Number(valeur || 0).toLocaleString(
      "fr-FR"
    );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Chargement du procès-verbal...
      </div>
    );
  }

  if (error || !recensement) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-6">
          {error || "Procès-verbal introuvable."}
        </div>
      </div>
    );
  }

  const nombreExcedent =
    recensement.nombreArticlesExcedent || 0;

  const nombreDeficit =
    recensement.nombreArticlesDeficit || 0;

  const nombreArticles =
    recensement.nombreArticles || 0;

  const totalExcedent =
    recensement.totalValeurExcedent || 0;

  const totalDeficit =
    recensement.totalValeurDeficit || 0;

  const totalExistant =
    recensement.totalValeurExistante || 0;

  return (
    <>
      {/*CONTROLES*/}

      <div className="print:hidden pv-controls">

        <div className="pv-controls-inner">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-gray-200
              text-gray-700
              font-semibold
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
            "
          >
            Imprimer
          </button>

        </div>

      </div>

      {/*PAGE A4*/}

      <div className="pv-page">

        <div className="pv-document">

          <div className="pv-header">

            <div>
              REPOBLIKAN'I MADAGASIKARA
            </div>

            <div>
              Fitiavana-Tanindrazana-Fandrosoana
            </div>

            <div className="mt-3">
              MINISTÈRE DE L'ÉCONOMIE ET DES FINANCES
            </div>

            <div>
              DIRECTION GÉNÉRALE DU BUDGET ET DES FINANCES
            </div>

            <div>
              SERVICE RÉGIONAL DU BUDGET BOENY
            </div>

          </div>

          <div className="pv-identification">

            <div>
              <strong>Code SOA :</strong>{" "}
              {recensement.codeSoa}
            </div>

            <div>
              <strong>Année :</strong>{" "}
              {recensement.annee}
            </div>

          </div>

          <h1 className="pv-title">
            PROCÈS-VERBAL DE RECENSEMENT
            <br />
            DES MATÉRIELS
          </h1>

          <p className="pv-introduction">

            Le présent procès-verbal constate le recensement
            physique des matériels inscrits dans les écritures
            du code SOA{" "}
            <strong>
              {recensement.codeSoa}
            </strong>{" "}
            au titre de l'année{" "}
            <strong>
              {recensement.annee}
            </strong>
            .

          </p>

          <div className="pv-agents">

            <div>
              <strong>
                Fonctionnaire recenseur :
              </strong>

              {" "}
              {recensement.fonctionnaireRecenseurNom}
              {" — "}
              {recensement.fonctionnaireRecenseurQualite}
            </div>

            <div>
              <strong>
                Dépositaire comptable :
              </strong>

              {" "}
              {recensement.comptableNom}
              {" — "}
              {recensement.comptableQualite}
            </div>

          </div>

          {/*TABLEAU*/}

          <table className="pv-table">

            <thead>

              <tr>

                <th
                  rowSpan="2"
                >
                  Nomenclature
                </th>

                <th
                  rowSpan="2"
                >
                  Espèce
                </th>

                <th
                  rowSpan="2"
                >
                  Prix unitaire
                </th>

                <th
                  rowSpan="2"
                >
                  Existant<br />
                  écritures
                </th>

                <th
                  rowSpan="2"
                >
                  Constaté<br />
                  recensement
                </th>

                <th
                  rowSpan="2"
                >
                  Excédent<br />
                  article
                </th>

                <th
                  rowSpan="2"
                >
                  Déficit<br />
                  article
                </th>

                <th colSpan="2">
                  Valeur des excédents
                </th>

                <th colSpan="2">
                  Valeur des déficits
                </th>

                <th rowSpan="2">
                  Valeur<br />
                  article
                </th>

                <th rowSpan="2">
                  Observation
                </th>

              </tr>

              <tr>

                <th>
                  Article
                </th>

                <th>
                  Nomenclature
                </th>

                <th>
                  Article
                </th>

                <th>
                  Nomenclature
                </th>

              </tr>

            </thead>

            <tbody>

              {groupesNomenclature.map(
                (groupe) => {

                  const totalExc =
                    groupe.lignes.reduce(
                      (somme, ligne) =>
                        somme +
                        Number(
                          ligne.valeurExcedentArticle ||
                            0
                        ),
                      0
                    );

                  const totalDef =
                    groupe.lignes.reduce(
                      (somme, ligne) =>
                        somme +
                        Number(
                          ligne.valeurDeficitArticle ||
                            0
                        ),
                      0
                    );

                  return groupe.lignes.map(
                    (ligne, index) => (

                      <tr key={ligne.id}>

                        <td>
                          {index === 0
                            ? `${groupe.numero} - ${groupe.designation}`
                            : ""}
                        </td>

                        <td>
                          {ligne.especeUnite}
                        </td>

                        <td className="money">
                          {formatMontant(
                            ligne.prixUnitaire
                          )}
                        </td>

                        <td className="number">
                          {ligne.existantEcriture}
                        </td>

                        <td className="number">
                          {ligne.constateRecensement}
                        </td>

                        <td className="number green-cell">
                          {ligne.excedent}
                        </td>

                        <td className="number red-cell">
                          {ligne.deficit}
                        </td>

                        <td className="money green-cell">
                          {formatMontant(
                            ligne.valeurExcedentArticle
                          )}
                        </td>

                        <td className="money green-cell">
                          {index === 0
                            ? formatMontant(totalExc)
                            : ""}
                        </td>

                        <td className="money red-cell">
                          {formatMontant(
                            ligne.valeurDeficitArticle
                          )}
                        </td>

                        <td className="money red-cell">
                          {index === 0
                            ? formatMontant(totalDef)
                            : ""}
                        </td>

                        <td className="money">
                          {formatMontant(
                            ligne.valeurArticle
                          )}
                        </td>

                        <td>
                          {ligne.observation || ""}
                        </td>

                      </tr>

                    )
                  );
                }
              )}

            </tbody>

            {/*TOTAL GENERAL
            =================================================== */}

            <tfoot>

              <tr>

                <td
                  colSpan="5"
                  className="total-label"
                >
                  TOTAL GÉNÉRAL
                </td>

                <td className="number green-cell">
                  {recensement.lignes
                    ?.reduce(
                      (s, l) =>
                        s +
                        Number(
                          l.excedent || 0
                        ),
                      0
                    ) || 0}
                </td>

                <td className="number red-cell">
                  {recensement.lignes
                    ?.reduce(
                      (s, l) =>
                        s +
                        Number(
                          l.deficit || 0
                        ),
                      0
                    ) || 0}
                </td>

                <td
                  colSpan="2"
                  className="money green-cell"
                >
                  {formatMontant(
                    totalExcedent
                  )}
                </td>

                <td
                  colSpan="2"
                  className="money red-cell"
                >
                  {formatMontant(
                    totalDeficit
                  )}
                </td>

                <td className="money">
                  {formatMontant(
                    totalExistant
                  )}
                </td>

                <td></td>

              </tr>

            </tfoot>

          </table>

          {/*TEXTE OFFICIEL*/}

          <div className="pv-text-final">

            <p>
              Arrêté le présent procès-verbal à{" "}
              <strong>
                {nombreEnLettres(nombreExcedent)}
              </strong>{" "}
              (
              <strong>
                {nombreExcedent}
              </strong>
              ) articles comportant des excédents
              représentant une valeur de{" "}
              <strong>
                {montantEnLettres(totalExcedent)}
              </strong>{" "}
              (
              <strong>
                {formatMontant(totalExcedent)} Ar
              </strong>
              ) et{" "}
              <strong>
                {nombreEnLettres(nombreDeficit)}
              </strong>{" "}
              (
              <strong>
                {nombreDeficit}
              </strong>
              ) articles comportant des déficits
              représentant une valeur de{" "}
              <strong>
                {montantEnLettres(totalDeficit)}
              </strong>{" "}
              (
              <strong>
                {formatMontant(totalDeficit)} Ar
              </strong>
              ).
            </p>

            <p>
              Arrêté le présent procès-verbal à{" "}
              <strong>
                {nombreEnLettres(nombreArticles)}
              </strong>{" "}
              (
              <strong>
                {nombreArticles}
              </strong>
              ) articles comportant des existants
              représentant une valeur de{" "}
              <strong>
                {montantEnLettres(totalExistant)}
              </strong>{" "}
              (
              <strong>
                {formatMontant(totalExistant)} Ar
              </strong>
              ).
            </p>

          </div>

          {/*SIGNATURES*/}

          <div className="pv-date">
            A Mahajanga, le 31 décembre{" "}
            {recensement.annee}
          </div>

          <div className="pv-signatures">

            <div>
              <strong>
                Le dépositaire comptable
              </strong>

              <div className="signature-space"></div>

              <div>
              </div>

              <div>
              </div>
            </div>

            <div>
              <strong>
                Le Fonctionnaire recenseur
              </strong>

              <div className="signature-space"></div>

              <div>
              </div>

              <div>

              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`

        .pv-controls {
          width: 100%;
          background: #f3f4f6;
          padding: 24px;
        }

        .pv-controls-inner {
          width: 297mm;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pv-page {
          width: 100%;
          min-height: 100vh;
          background: #e5e7eb;
          padding: 30px 0;
        }

        .pv-document {
          width: 297mm;
          min-height: 210mm;
          margin: 0 auto;
          background: white;
          padding: 12mm;
          box-sizing: border-box;
          font-family:
            "Times New Roman",
            Times,
            serif;
          color: #222;
          box-shadow:
            0 4px 20px rgba(0,0,0,.15);
        }

        .pv-header {
          text-align: center;
          font-size: 12px;
          line-height: 1.5;
          font-weight: bold;
        }

        .pv-identification {
          margin-top: 8mm;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .pv-title {
          margin-top: 8mm;
          text-align: center;
          font-size: 17px;
          font-weight: bold;
          text-decoration: underline;
          line-height: 1.5;
        }

        .pv-introduction {
          margin-top: 6mm;
          font-size: 13px;
          line-height: 1.6;
          text-align: justify;
        }

        .pv-agents {
          margin-top: 5mm;
          font-size: 12px;
          line-height: 1.6;
        }

        .pv-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 7mm;
          font-size: 9px;
        }

        .pv-table th,
        .pv-table td {
          border: 1px solid #555;
          padding: 3px;
          vertical-align: middle;
        }

        .pv-table th {
          text-align: center;
          font-weight: bold;
        }

        .pv-table td {
          text-align: left;
        }

        .pv-table .number {
          text-align: center;
        }

        .pv-table .money {
          text-align: right;
          white-space: nowrap;
        }

        .green-cell {
          background: #ecfdf5;
          color: #166534;
        }

        .red-cell {
          background: #fef2f2;
          color: #b91c1c;
        }

        .total-label {
          text-align: right !important;
        }

        .pv-text-final {
          margin-top: 8mm;
          font-size: 13px;
          line-height: 1.7;
          text-align: justify;
        }

        .pv-date {
          margin-top: 10mm;
          text-align: right;
          font-size: 13px;
        }

        .pv-signatures {
          margin-top: 15mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          text-align: center;
          font-size: 13px;
          gap: 20mm;
        }

        .signature-space {
          height: 22mm;
        }

        @media print {

          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .pv-controls {
            display: none !important;
          }

          .pv-page {
            width: 297mm;
            min-height: 210mm;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .pv-document {
            width: 297mm !important;
            min-height: 210mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

        }

      `}</style>
    </>
  );
}