import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QuitusMaterielDocument = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // DONNÉES DU RECENSEMENT

  const recensement = location.state?.recensement;
  const codeSoaState = location.state?.codeSoa || "";

  // SI LE RECENSEMENT N'EXISTE PAS

  if (!recensement) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">

          <h1 className="text-xl font-bold text-gray-800 mb-3">
            Quitus introuvable
          </h1>

          <p className="text-gray-500 mb-6">
            Les données du recensement matériel ne sont pas disponibles.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
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

  // DONNÉES

  const codeSoa =
    recensement.codeSoa ||
    codeSoaState ||
    "";

  const annee =
    recensement.annee || "";

  const lignes =
    recensement.lignes || [];

  // REGROUPEMENT PAR NOMENCLATURE

  const recapNomenclatures = useMemo(() => {

    const map = new Map();

    lignes.forEach((ligne) => {

      const numero =
        ligne.nomenclatureNumero;

      if (
        numero === null ||
        numero === undefined
      ) {
        return;
      }

      const montant =
        Number(
          ligne.valeurArticle ||
          (
            Number(ligne.constateRecensement || 0) *
            Number(ligne.prixUnitaire || 0)
          ) ||
          0
        );

      if (!map.has(numero)) {

        map.set(numero, {
          numero,
          montantTotal: 0,
        });

      }

      map.get(numero).montantTotal += montant;
    });

    return Array.from(map.values())
      .sort((a, b) => a.numero - b.numero);

  }, [lignes]);

  // TOTAL GÉNÉRAL

  const totalGeneral =
    recapNomenclatures.reduce(
      (total, ligne) =>
        total + Number(ligne.montantTotal || 0),
      0
    );

  // FORMAT MONTANT

  const formatMontant = (value) => {
    return Number(
      value || 0
    ).toLocaleString(
      "fr-FR",
      {
        maximumFractionDigits: 0,
      }
    );
  };

  // NOMBRE EN LETTRES

  const nombreEnLettres = (nombre) => {

    nombre = Math.round(Number(nombre || 0));

    if (nombre === 0) {
      return "zéro";
    }

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

    const deuxDizaines = [
      "",
      "",
      "vingt",
      "trente",
      "quarante",
      "cinquante",
      "soixante",
      "soixante",
      "quatre-vingt",
      "quatre-vingt",
    ];

    const moinsDeCent = (n) => {

      if (n < 20) {
        return unites[n];
      }

      if (n < 70) {

        const dizaine =
          Math.floor(n / 10);

        const unite =
          n % 10;

        if (unite === 0) {
          return deuxDizaines[dizaine];
        }

        if (unite === 1) {
          return `${deuxDizaines[dizaine]} et un`;
        }

        return `${deuxDizaines[dizaine]}-${unites[unite]}`;
      }

      if (n < 80) {

        if (n === 71) {
          return "soixante et onze";
        }

        return `soixante-${moinsDeCent(n - 60)}`;
      }

      if (n === 80) {
        return "quatre-vingts";
      }

      return `quatre-vingt-${unites[n - 80]}`;
    };

    const moinsDeMille = (n) => {

      if (n < 100) {
        return moinsDeCent(n);
      }

      const centaine =
        Math.floor(n / 100);

      const reste =
        n % 100;

      let texte =
        centaine === 1
          ? "cent"
          : `${unites[centaine]} cent`;

      if (reste === 0 && centaine > 1) {
        texte += "s";
      }

      if (reste > 0) {
        texte += ` ${moinsDeCent(reste)}`;
      }

      return texte;
    };

    const convertir = (n) => {

      if (n < 1000) {
        return moinsDeMille(n);
      }

      if (n < 1_000_000) {

        const milliers =
          Math.floor(n / 1000);

        const reste =
          n % 1000;

        let texte =
          milliers === 1
            ? "mille"
            : `${convertir(milliers)} mille`;

        if (reste > 0) {
          texte += ` ${convertir(reste)}`;
        }

        return texte;
      }

      if (n < 1_000_000_000) {

        const millions =
          Math.floor(n / 1_000_000);

        const reste =
          n % 1_000_000;

        let texte =
          `${convertir(millions)} million`;

        if (millions > 1) {
          texte += "s";
        }

        if (reste > 0) {
          texte += ` ${convertir(reste)}`;
        }

        return texte;
      }

      if (n < 1_000_000_000_000) {

        const milliards =
          Math.floor(n / 1_000_000_000);

        const reste =
          n % 1_000_000_000;

        let texte =
          `${convertir(milliards)} milliard`;

        if (milliards > 1) {
          texte += "s";
        }

        if (reste > 0) {
          texte += ` ${convertir(reste)}`;
        }

        return texte;
      }

      return n.toLocaleString("fr-FR");
    };

    return convertir(nombre);
  };

  const totalGeneralTexte =
    nombreEnLettres(totalGeneral);

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
            onClick={() => navigate(-1)}
            className="
              px-5 py-2.5
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
              px-6 py-2.5
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
                  DIRECTION GÉNÉRALE DU BUDGET ET DES FINANCES
                </div>

                <div>
                  DIRECTION DU PATRIMOINE DE L'ETAT
                </div>

                <div className="admin-space">
                  SERVICE REGIONALE DU BUDGET BOENY
                </div>

                <div className="admin-space">
                  SERVICE RÉGIONAL DU BUDGET BOENY
                </div>

                <div className="admin-space">
                  Division du Patrimoine de l'Etat
                </div>

              </div>

            </div>

          </div>

          {/*DATE EN HAUT À DROITE*/}

          <div className="date-haut-droite">

            <span>
              Mahajanga, le
            </span>

            

          </div>

          {/*NUMÉRO DU QUITUS*/}

          <div className="numero-quitus">

            <span className="numero-label">
              N°
            </span>

            <span>
              
            </span>

            <span className="numero-reference">
              /MEF/SG/DGBF/DPE/SRB/B/Div-pat
            </span>

          </div>

          {/*OBJET / RÉFÉRENCE*/}

          <div className="objet-reference">

            <div className="ligne-objet">

              <strong>
                Objet :
              </strong>

              <span className="zone-texte">
                Compte matière du Service Régional du Budget Boeny
              </span>

            </div>

            <div className="ligne-reference">

              <strong>
                Référence :
              </strong>

            </div>

          </div>

          {/*TITRE*/}

          <h1 className="titre-quitus">
            QUITUS DU COMPTE MATIÈRE
          </h1>

          {/*CORPS DU QUITUS*/}

          <div className="corps-quitus">

            <p>
              J'ai l'honneur de vous faire connaître que le compte
              matière du Service Régional du Budget Boeny.
            </p>

            <div className="infos-compte">

              <div>
                <strong>
                  SOA :
                </strong>

                <span>
                  {codeSoa}
                </span>
              </div>

              <div>
                <strong>
                  EXERCICE :
                </strong>

                <span>
                  {annee}
                </span>
              </div>

              <div>
                <strong>
                  BUDGET :
                </strong>

                <span>
                  GENERAL
                </span>
              </div>

            </div>

            <p>
              Relatif au matériel en service a été approuvé.
            </p>

            <p>
              Ce Compte accuse au 31 décembre{" "}
              <strong>
                {annee}
              </strong>{" "}
              un existant de :{" "}
              <strong>
                {totalGeneralTexte}
              </strong>{" "}
              (
              <strong>
                {formatMontant(totalGeneral)}
              </strong>
              ) Ar.
            </p>

            <p className="detail-introduction">
              Ainsi détaillé :
            </p>

          </div>

          {/*TABLEAU DES NOMENCLATURES*/}

          <div className="table-matiere">

            <table>

              <thead>

                <tr>

                  <th>
                    NOMENCLATURE
                  </th>

                  <th>
                    MONTANT
                  </th>

                  <th>
                    OBSERVATION
                  </th>

                </tr>

              </thead>

                <tbody>

                {recapNomenclatures.length > 0 ? (

                    recapNomenclatures.map((ligne, index) => (

                    <tr key={ligne.numero}>

                        <td>
                        {ligne.numero}
                        </td>

                        <td className="montant-cell">
                        {formatMontant(
                            ligne.montantTotal
                        )}{" "}
                        Ar
                        </td>

                        {index === 0 && (
                        <td
                            rowSpan={recapNomenclatures.length}
                            className="observation-cell"
                        >
                            Approuvé par
                        </td>
                        )}

                    </tr>

                    ))

                ) : (

                    <tr>

                    <td
                        colSpan="3"
                        className="empty-cell"
                    >
                        Aucun matériel recensé.
                    </td>

                    </tr>

                )}

                </tbody>

                <tfoot>
                <tr>
                    <td>
                    TOTAL
                    </td>

                    <td className="montant-cell">
                    {formatMontant(totalGeneral)} Ar
                    </td>

                    <td>
                    </td>
                </tr>
                </tfoot>


            </table>

          </div>

          {/*SIGNATURES*/}

          <div className="signatures">

            <div className="signature-bloc">

              <p className="signature-titre">
                LE CHEF DE DIVISION DU BUDGET BOENY
              </p>

              <div className="signature-espace" />

            </div>

            <div className="signature-bloc">

              <p className="signature-titre">
                Madame LE CHEF DU SERVICE REGIONAL DU BUDGET BOENY
              </p>

              <div className="signature-espace" />

            </div>

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
          height: 69mm;
          margin-top: -12mm;
          margin-left: -18mm;

          position: relative;
        }


        .administration-bloc {
          width: 105mm;

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

          font-size: 11.5px;

          line-height: 1.4;

          font-weight: bold;
        }


        .admin-space {
          margin-top: 2mm;
        }


        /* DATE HAUT À DROITE */

        .date-haut-droite {
          position: absolute;

          top: 78mm;

          right: 60mm;

          display: flex;

          align-items: center;

          font-size: 15px;
        }


        .zone-date-haut {
          display: inline-block;

          width: 42mm;

          height: 7mm;

          margin-left: 3mm;

          border-bottom:
            1px
            solid
            #333;
        }


        /* NUMÉRO */

        .numero-quitus {
          display: flex;

          align-items: center;

          margin-left: 9mm;

          margin-top: 14mm;

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
          position: relative;
          left: 40px;
        }


        /* OBJET / RÉFÉRENCE */

        .objet-reference {
          margin-top: 8mm;

          padding: 0 9mm;

          font-size: 14px;

          line-height: 1.8;
        }


        .ligne-objet,
        .ligne-reference {
          display: flex;

          align-items: flex-end;

          gap: 4mm;
        }


        .zone-texte,
        .zone-reference {
          flex: 1;

          min-height: 6mm;

          border-bottom:
            1px
            solid
            #555;
        }


        .zone-texte {
          border-bottom: none;
        }


        /* TITRE */

        .titre-quitus {
          margin-top: 8mm;

          margin-bottom: 0;

          text-align: center;

          font-size: 17px;

          line-height: 1.4;

          font-weight: bold;

          text-decoration: underline;
        }


        /* CORPS */

        .corps-quitus {
          margin-top: 9mm;

          padding:
            0
            9mm;

          font-size: 16px;

          line-height: 1.65;
        }


        .corps-quitus p {
          margin: 0 0 5mm 0;
        }


        .infos-compte {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 8mm;

          margin:
            5mm
            0;

          font-size: 15px;
        }


        .infos-compte > div {
          display: flex;

          gap: 2mm;

          white-space: nowrap;
        }


        .detail-introduction {
          margin-top: 5mm !important;

          margin-bottom: 3mm !important;
        }


        /* TABLEAU MATIÈRE */

        .table-matiere {
          margin:
            5mm
            9mm
            0;
        }


        .table-matiere table {
          width: 100%;

          border-collapse: collapse;

          font-size: 14px;
        }


        .table-matiere th,
        .table-matiere td {
          border:
            1px
            solid
            #333;

          padding:
            3mm
            2mm;

          text-align: center;

          vertical-align: middle;
        }


        .table-matiere th {
          font-weight: bold;

          text-transform: uppercase;
        }


        .table-matiere .montant-cell {
          text-align: right;

          white-space: nowrap;
        }


        .table-matiere .empty-cell {
          height: 12mm;
        }


        .table-matiere tfoot td {
          font-weight: bold;
        }


        /* TAMPON ROUGE */

        .tampon-rouge {
          width: 45mm;

          height: 25mm;

          margin-top: 7mm;

          margin-left: auto;

          border:
            2px
            solid
            #a00;

          color: #a00;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 13px;

          font-weight: bold;

          text-transform: uppercase;

          transform: rotate(-5deg);
        }


        /* SIGNATURES */

        .signatures {
          margin-top: 14mm;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 20mm;

          text-align: center;
        }


        .signature-bloc {
          min-height: 50mm;
        }


        .signature-titre {
          font-size: 14px;

          line-height: 1.5;

          font-weight: bold;

          text-transform: uppercase;

          margin: 0;
        }


        .signature-espace {
          height: 25mm;
        }


        .signature-ligne {
          font-size: 13px;

          margin: 0;
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

export default QuitusMaterielDocument;