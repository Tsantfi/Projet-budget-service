import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function EtatAppreciatifMateriel() {

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  const soaId = state.soaId || null;
  const codeSoa = state.codeSoa || "";

  const annee = Number(state.annee);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CHARGEMENT

  useEffect(() => {

    if (!soaId || !annee) {
      setError(
        "Le SOA ou l'année est manquant."
      );
      return;
    }

    const charger = async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await client.get(
            `/etat-appreciatif-materiel/soa/${soaId}/annee/${annee}`
          );

        setData(response.data);

      } catch (err) {

        console.error(
          "Erreur état appréciatif :",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Impossible de charger l'état appréciatif."
        );

      } finally {
        setLoading(false);
      }
    };

    charger();

  }, [soaId, annee]);

  // NOMENCLATURES

  const nomenclatures =
    data?.nomenclatures || [];

  // FORMAT MONTANT

  const formatMontant = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "fr-FR"
    );
  };

  // OBTENIR MOUVEMENT

  const getMouvement = (
    operation,
    numero
  ) => {

    return (
      operation.mouvements?.find(
        (mouvement) =>
          mouvement.numeroNomenclature ===
          numero
      ) || {
        charge: 0,
        decharge: 0,
      }
    );
  };

  // IMPRESSION

  const imprimer = () => {
    window.print();
  };

  // LOADING

  if (loading) {

    return (
      <div className="
        min-h-screen
        bg-gray-50
        flex
        items-center
        justify-center
      ">
        <div className="
          text-gray-500
          font-semibold
        ">
          Chargement de l'état appréciatif...
        </div>
      </div>
    );
  }

  return (
    <div className="
      min-h-screen
      bg-gray-50
      p-4
      md:p-6
      lg:p-8
    ">

      <div className="
        max-w-[1800px]
        mx-auto
      ">

        {/* HEADER APPLICATION */}

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
          mb-6
          print:hidden
        ">

          <div>

            <h1 className="
              text-2xl
              md:text-3xl
              font-bold
              text-haigana-dark
            ">
              État appréciatif
            </h1>

            <p className="
              text-gray-500
              mt-1
            ">
              SOA{" "}
              <strong>
                {data?.codeSoa || codeSoa}
              </strong>
              {" — "}
              Année{" "}
              <strong>
                {data?.annee || annee}
              </strong>
            </p>

          </div>

          <div className="
            flex
            gap-3
          ">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="
                px-5
                py-2.5
                rounded-xl
                border
                border-gray-200
                text-gray-600
                font-semibold
                hover:bg-white
              "
            >
              Retour
            </button>

            <button
              type="button"
              onClick={imprimer}
              className="
                px-5
                py-2.5
                rounded-xl
                bg-haigana-blue
                text-white
                font-semibold
                hover:brightness-95
              "
            >
              Imprimer
            </button>

          </div>

        </div>

        {/* ERREUR */}

        {error && (
          <div className="
            mb-5
            p-4
            rounded-xl
            bg-red-50
            border
            border-red-200
            text-red-700
          ">
            {error}
          </div>
        )}

        {data && (

          <div className="
            bg-white
            p-5
            md:p-8
            shadow-sm
            rounded-2xl
            print:shadow-none
            print:rounded-none
          ">

            {/* TITRE DOCUMENT */}

            <div className="
              text-center
              mb-8
            ">

              <h2 className="
                text-2xl
                font-bold
                text-haigana-dark
                uppercase
              ">
                ÉTAT APPRÉCIATIF
              </h2>

              <p className="
                mt-2
                font-semibold
              ">
                SOA : {data.codeSoa}
              </p>

              <p>
                Exercice : {data.annee}
              </p>

            </div>

            {/*TABLEAU DES MOUVEMENTS*/}

            <div className="
              overflow-x-auto
              mb-12
            ">

              <table className="
                w-full
                border-collapse
                text-xs
              ">

                <thead>

                  <tr>

                    <th
                      rowSpan="2"
                      className="
                        border
                        border-gray-300
                        px-3
                        py-3
                        text-center
                        bg-gray-50
                      "
                    >
                      Date
                    </th>

                    <th
                      rowSpan="2"
                      className="
                        border
                        border-gray-300
                        px-3
                        py-3
                        text-left
                        bg-gray-50
                        min-w-[220px]
                      "
                    >
                      Désignation de l'opération
                    </th>

                    {nomenclatures.map(
                      (numero) => (

                        <th
                          key={numero}
                          colSpan="2"
                          className="
                            border
                            border-gray-300
                            px-3
                            py-2
                            text-center
                            bg-gray-50
                          "
                        >
                          Nomenclature {numero}
                        </th>

                      )
                    )}

                  </tr>

                  <tr>

                    {nomenclatures.map(
                      (numero) => (
                        <React.Fragment
                          key={`sub-${numero}`}
                        >

                          <th
                            className="
                              border
                              border-gray-300
                              px-3
                              py-2
                              text-center
                              bg-gray-50
                            "
                          >
                            Charge
                          </th>

                          <th
                            className="
                              border
                              border-gray-300
                              px-3
                              py-2
                              text-center
                              bg-gray-50
                            "
                          >
                            Décharge
                          </th>

                        </React.Fragment>
                      )
                    )}

                  </tr>

                </thead>

                <tbody>

                  {(data.operations || []).map(
                    (operation, index) => (

                      <tr
                        key={index}
                        className="
                          hover:bg-gray-50
                        "
                      >

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-center
                          whitespace-nowrap
                        ">
                          {operation.date
                            ? new Date(
                                operation.date
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "—"}
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          font-medium
                        ">
                          {operation.designationOperation}
                        </td>

                        {nomenclatures.map(
                          (numero) => {

                            const mouvement =
                              getMouvement(
                                operation,
                                numero
                              );

                            return (
                              <React.Fragment
                                key={`${index}-${numero}`}
                              >

                                <td className="
                                  border
                                  border-gray-300
                                  px-3
                                  py-2
                                  text-right
                                ">
                                  {Number(
                                    mouvement.charge || 0
                                  ) > 0
                                    ? `${formatMontant(
                                        mouvement.charge
                                      )} Ar`
                                    : ""}
                                </td>

                                <td className="
                                  border
                                  border-gray-300
                                  px-3
                                  py-2
                                  text-right
                                ">
                                  {Number(
                                    mouvement.decharge || 0
                                  ) > 0
                                    ? `${formatMontant(
                                        mouvement.decharge
                                      )} Ar`
                                    : ""}
                                </td>

                              </React.Fragment>
                            );
                          }
                        )}

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/*RECAPITULATION*/}

            <div className="
              text-center
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                uppercase
                text-haigana-dark
              ">
                RÉCAPITULATION
              </h2>

            </div>

            <div className="
              overflow-x-auto
            ">

              <table className="
                w-full
                border-collapse
                text-sm
              ">

                <thead>

                  <tr>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-center
                      bg-gray-50
                    ">
                      N°
                      <br />
                      nomenclature
                    </th>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                      bg-gray-50
                    ">
                      Existant au
                      <br />
                      1er janvier {annee}
                      <br />
                      en Ar
                    </th>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                      bg-gray-50
                    ">
                      Entrées pendant
                      <br />
                      l'année {annee}
                      <br />
                      en Ar
                    </th>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                      bg-gray-50
                    ">
                      Total de l'existant
                      <br />
                      et des entrées
                      <br />
                      en Ar
                    </th>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                      bg-gray-50
                    ">
                      Sorties pendant
                      <br />
                      l'année {annee}
                      <br />
                      en Ar
                    </th>

                    <th className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                      bg-gray-50
                    ">
                      Reste au
                      <br />
                      31 décembre {annee}
                      <br />
                      en Ar
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {(data.recapitulatif || []).map(
                    (ligne) => (

                      <tr
                        key={
                          ligne.numeroNomenclature
                        }
                      >

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-center
                          font-semibold
                        ">
                          {ligne.numeroNomenclature}
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-right
                        ">
                          {formatMontant(
                            ligne.existantDebutAnnee
                          )}{" "}
                          Ar
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-right
                        ">
                          {formatMontant(
                            ligne.entreesAnnee
                          )}{" "}
                          Ar
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-right
                          font-semibold
                        ">
                          {formatMontant(
                            ligne.totalExistantEntrees
                          )}{" "}
                          Ar
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-right
                        ">
                          {formatMontant(
                            ligne.sortiesAnnee
                          )}{" "}
                          Ar
                        </td>

                        <td className="
                          border
                          border-gray-300
                          px-3
                          py-2
                          text-right
                          font-semibold
                        ">
                          {formatMontant(
                            ligne.resteFinAnnee
                          )}{" "}
                          Ar
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

                <tfoot>

                  <tr className="
                    font-bold
                    bg-gray-50
                  ">

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                    ">
                      TOTAL
                    </td>

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                    ">
                      {formatMontant(
                        (data.recapitulatif || [])
                          .reduce(
                            (s, x) =>
                              s +
                              Number(
                                x.existantDebutAnnee || 0
                              ),
                            0
                          )
                      )}{" "}
                      Ar
                    </td>

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                    ">
                      {formatMontant(
                        data.sommeEntrees
                      )}{" "}
                      Ar
                    </td>

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                    ">
                      {formatMontant(
                        (data.recapitulatif || [])
                          .reduce(
                            (s, x) =>
                              s +
                              Number(
                                x.totalExistantEntrees || 0
                              ),
                            0
                          )
                      )}{" "}
                      Ar
                    </td>

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                    ">
                      {formatMontant(
                        data.sommeSorties
                      )}{" "}
                      Ar
                    </td>

                    <td className="
                      border
                      border-gray-300
                      px-3
                      py-3
                      text-right
                    ">
                      {formatMontant(
                        data.sommeResteGenerale
                      )}{" "}
                      Ar
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

            {/*ARRETE*/}

            <div className="
              mt-8
              leading-7
              text-justify
            ">

              <p>
                <strong>ARRÊTÉ</strong> à la somme de{" "}
                <strong>
                  {formatMontant(
                    data.sommeEntrees
                  )}{" "}
                  Ar
                </strong>{" "}
                en ce qui concerne les entrées,
                à la somme de{" "}
                <strong>
                  {formatMontant(
                    data.sommeSorties
                  )}{" "}
                  Ar
                </strong>{" "}
                en ce qui concerne les sorties et à la somme de{" "}
                <strong>
                  {formatMontant(
                    data.sommeResteGenerale
                  )}{" "}
                  Ar
                </strong>{" "}
                valeur restant au dernier jour de l'année.
              </p>

            </div>

            {/*SIGNATURES*/}

            <div className="
              mt-12
              grid
              grid-cols-1
              md:grid-cols-2
              gap-16
              text-center
            ">

              <div>

                <p>
                  A Mahajanga, le 31 décembre {annee}
                </p>

                <p className="
                  mt-8
                  font-semibold
                ">
                  Le Dépositaire comptable
                </p>

                <div className="
                  h-24
                " />

                <p>
                  
                </p>

              </div>

              <div>

                <p className="
                  invisible
                ">
                  A Mahajanga
                </p>

                <p className="
                  mt-8
                  font-semibold
                ">
                  Vu par le Chef de service
                </p>

                <div className="
                  h-24
                " />

                <p>
                  
                </p>

              </div>

            </div>

          </div>

        )}

      </div>

      {/*IMPRESSION
      ======================================================== */}

      <style>
        {`
          @media print {

            @page {
              size: A4 landscape;
              margin: 10mm;
            }

            body {
              background: white !important;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            thead {
              display: table-header-group;
            }

            .print\\\\:hidden {
              display: none !important;
            }
          }
        `}
      </style>

    </div>
  );
}