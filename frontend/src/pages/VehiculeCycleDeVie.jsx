import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function VehiculeCycleDeVie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // ROLE
  const isAdmin = hasRole("ADMINISTRATEUR");
  // MODALES

  const [showAffectation, setShowAffectation] = useState(false);
  const [showCondamnation, setShowCondamnation] = useState(false);

  const [openDetail, setOpenDetail] = useState(null);

  // AFFECTATION

  const [lieuAffectation, setLieuAffectation] = useState("");
  const [descriptionAffectation, setDescriptionAffectation] =
    useState("");
  const [dateAffectation, setDateAffectation] = useState("");

  // CONDAMNATION

  const [lieuCondamnation, setLieuCondamnation] = useState("");

  // ACTIONS

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // VEHICULE

  const [vehicule, setVehicule] = useState(null);

  // HISTORIQUE

  const [entretiens, setEntretiens] = useState([]);
  const [reparations, setReparations] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [entree, setEntree] = useState(null);

  // DATE DU JOUR

  function getDateToday() {
    return new Date().toISOString().slice(0, 10);
  }

  // FORMAT DATE

  function formatDate(date) {
    if (!date) return "-";

    const value = String(date);

    if (value.includes("T")) {
      const parsed = new Date(date);

      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("fr-FR");
      }
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    const [annee, mois, jour] = parts;

    return `${jour}/${mois}/${annee}`;
  }

  // CHARGEMENT DES DONNEES

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  async function chargerDonnees() {
    try {
      setActionError("");

      const [
        vehiculeResponse,
        entretiensResponse,
        reparationsResponse,
        sortiesResponse,
        entreesResponse,
      ] = await Promise.all([
        client.get(`/vehicules/${id}`),

        client.get(`/entretiens?vehiculeId=${id}`),

        client.get(`/reparations?vehiculeId=${id}`),

        client.get(`/sorties?vehiculeId=${id}`),

        client.get(`/entrees?vehiculeId=${id}`),
      ]);

      // VEHICULE

      setVehicule(vehiculeResponse.data);

      // ENTRETIENS

      setEntretiens(
        Array.isArray(entretiensResponse.data)
          ? entretiensResponse.data
          : []
      );

      // REPARATIONS

      setReparations(
        Array.isArray(reparationsResponse.data)
          ? reparationsResponse.data
          : []
      );

      // SORTIES

      const sortiesData = Array.isArray(sortiesResponse.data)
        ? sortiesResponse.data
        : [];

      setSorties(sortiesData);

      // ENTREE

      if (Array.isArray(entreesResponse.data)) {
        setEntree(
          entreesResponse.data.length > 0
            ? entreesResponse.data[0]
            : null
        );
      } else {
        setEntree(entreesResponse.data || null);
      }

      // AFFECTATIONS

      const affectationsData = sortiesData
        .filter(
          (sortie) =>
            sortie?.type === "AFFECTATION"
        )
        .map((sortie) => {
          if (sortie?.affectation) {
            return sortie.affectation;
          }

          return {
            ...sortie,
            dateAffectation:
              sortie.dateAffectation ||
              sortie.dateSortie,
          };
        });

      setAffectations(affectationsData);

    } catch (error) {
      console.error(
        "Erreur lors du chargement du cycle de vie :",
        error
      );

      setActionError(
        error.response?.data?.message ||
          "Impossible de charger les données du véhicule."
      );
    }
  }

  // NOMBRE MAXIMUM DE LIGNES

  const maxRows = Math.max(
    1,
    entree ? 1 : 0,
    affectations.length,
    entretiens.length,
    reparations.length,
    sorties.length
  );

  // OUVRIR AFFECTATION

  function ouvrirAffectation() {
    if (!isAdmin) return;

    setActionError("");

    setLieuAffectation(
      vehicule?.lieuAffectationActuel || ""
    );

    setDescriptionAffectation("");

    setDateAffectation(getDateToday());

    setShowAffectation(true);
  }

  // AFFECTER VEHICULE

  async function handleAffecter() {
    if (!isAdmin) return;

    if (!lieuAffectation.trim()) {
      setActionError(
        "Le lieu d'affectation est obligatoire."
      );
      return;
    }

    if (!dateAffectation) {
      setActionError(
        "La date d'affectation est obligatoire."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await client.put(
        `/vehicules/${id}/affecter`,
        {
          lieuAffectation:
            lieuAffectation.trim(),

          description:
            descriptionAffectation.trim() || null,

          dateAffectation:
            dateAffectation,
        }
      );

      setShowAffectation(false);

      setLieuAffectation("");
      setDescriptionAffectation("");
      setDateAffectation("");

      await chargerDonnees();

    } catch (error) {
      console.error(
        "Erreur affectation :",
        error
      );

      setActionError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Impossible d'affecter le véhicule."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // OUVRIR CONDAMNATION

  function ouvrirCondamnation() {
    if (!isAdmin) return;

    setActionError("");
    setLieuCondamnation("");
    setShowCondamnation(true);
  }

  // CONDAMNER VEHICULE

  async function handleCondamner() {
    if (!isAdmin) return;

    if (!lieuCondamnation.trim()) {
      setActionError(
        "Le lieu de condamnation est obligatoire."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await client.delete(
        `/vehicules/${id}/condamner`,
        {
          data: {
            dateCondamnation: getDateToday(),

            lieuCondamnation:
              lieuCondamnation.trim(),

            description:
              "Véhicule condamné",
          },
        }
      );

      setShowCondamnation(false);

      setLieuCondamnation("");

      // LE VEHICULE EST DEFINITIVEMENT SUPPRIME

      navigate("/patrimoine/vehicules");

    } catch (error) {
      console.error(
        "Erreur condamnation :",
        error
      );

      setActionError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "Impossible de condamner le véhicule."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // AFFICHER DETAIL JSON

  function afficherDetail(type, data) {
    setOpenDetail({
      type,
      data,
    });
  }

  // RENDU

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="mb-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>

            <h1 className="text-2xl font-bold text-haigana-dark">
              Cycle de vie
            </h1>

            {vehicule && (
              <p className="text-sm text-gray-500 mt-1">
                Véhicule{" "}
                {vehicule.immatricule ||
                  `#${id}`}
              </p>
            )}

          </div>

        </div>

      </div>

      {/*ERREUR GENERALE*/}

      {actionError && !showAffectation && !showCondamnation && (

        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>

      )}

      {/*INFORMATIONS VEHICULE*/}

      {vehicule && (

        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">

          <div className="px-5 py-4 border-b border-gray-100">

            <h2 className="font-semibold text-haigana-dark">
              Informations du véhicule
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">

            <InfoItem
              label="Immatriculation"
              value={vehicule.immatricule}
            />

            <InfoItem
              label="Marque"
              value={
                vehicule.marque?.marqueVehicule
              }
            />

            <InfoItem
              label="Genre"
              value={
                vehicule.genre?.genreVehicule
              }
            />

            <InfoItem
              label="Type"
              value={
                vehicule.type?.typeDuVehicule
              }
            />

            <InfoItem
              label="Carburant"
              value={
                vehicule.carburant?.libelle
              }
            />

            <InfoItem
              label="Code SOA"
              value={
                vehicule.codeSoa?.codeSoa
              }
            />

            <InfoItem
              label="Lieu d'affectation actuel"
              value={
                vehicule.lieuAffectationActuel
              }
            />

            <InfoItem
              label="Date de circulation"
              value={formatDate(
                vehicule.dateCirculation
              )}
            />

            <InfoItem
              label="Prix du véhicule"
              value={
                vehicule.prixVehicule != null
                  ? `${Number(
                      vehicule.prixVehicule
                    ).toLocaleString(
                      "fr-FR"
                    )} Ar`
                  : "-"
              }
            />

          </div>

        </div>

      )}

      {/*HISTORIQUE*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">

        <div className="px-5 py-4 border-b border-gray-100">

          <h2 className="font-semibold text-haigana-dark">
            Historique du véhicule
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Cliquez sur une date pour afficher
            les informations détaillées au format JSON.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Prise en charge
                </th>

                <th className="text-left px-4 py-3">
                  Affectation
                </th>

                <th className="text-left px-4 py-3">
                  Entretien
                </th>

                <th className="text-left px-4 py-3">
                  Réparation
                </th>

                <th className="text-left px-4 py-3">
                  Sortie
                </th>

              </tr>

            </thead>

            <tbody>

              {Array.from({
                length: maxRows,
              }).map((_, i) => (

                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  {/*PRISE EN CHARGE*/}

                  <td className="px-4 py-3">

                    {i === 0 && entree ? (

                      <button
                        onClick={() =>
                          afficherDetail(
                            "Prise en charge",
                            entree
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >

                        {formatDate(
                          entree.dateEntree
                        )}

                      </button>

                    ) : (
                      ""
                    )}

                  </td>

                  {/*AFFECTATION*/}

                  <td className="px-4 py-3">

                    {affectations[i] ? (

                      <button
                        onClick={() =>
                          afficherDetail(
                            "Affectation",
                            affectations[i]
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >

                        {formatDate(
                          affectations[i]
                            .dateAffectation ||
                            affectations[i]
                              .dateSortie
                        )}

                      </button>

                    ) : (
                      ""
                    )}

                  </td>

                  {/*ENTRETIEN*/}

                  <td className="px-4 py-3">

                    {entretiens[i] ? (

                      <button
                        onClick={() =>
                          afficherDetail(
                            "Entretien",
                            entretiens[i]
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >

                        {formatDate(
                          entretiens[i]
                            .dateEntretien
                        )}

                      </button>

                    ) : (
                      ""
                    )}

                  </td>

                  {/*REPARATION*/}

                  <td className="px-4 py-3">

                    {reparations[i] ? (

                      <button
                        onClick={() =>
                          afficherDetail(
                            "Réparation",
                            reparations[i]
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >

                        {formatDate(
                          reparations[i]
                            .dateReparation
                        )}

                      </button>

                    ) : (
                      ""
                    )}

                  </td>

                  {/*SORTIE*/}

                  <td className="px-4 py-3">

                    {sorties[i] ? (

                      <button
                        onClick={() =>
                          afficherDetail(
                            "Sortie",
                            sorties[i]
                          )
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >

                        {formatDate(
                          sorties[i]
                            .dateSortie
                        )}

                      </button>

                    ) : (
                      ""
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/*  ACTIONS ADMIN */}

        {isAdmin && (

          <div className="p-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">

            <div className="flex flex-wrap gap-3">

              {/* AFFECTER */}

              <button
                onClick={ouvrirAffectation}
                className="px-5 py-2.5 rounded-lg bg-haigana-blue text-white font-medium hover:bg-haigana-dark transition-colors"
              >
                Affecter
              </button>

              {/* CONDAMNER */}

              <button
                onClick={ouvrirCondamnation}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Condamner
              </button>

            </div>

            {/* DEPLACEMENT */}

            <button
              onClick={() =>
                navigate(
                  `/patrimoine/vehicule/${id}/deplacement`
                )
              }
              className="px-5 py-2.5 rounded-lg bg-haigana-blue text-white font-medium hover:bg-haigana-dark transition-colors"
            >
              Déplacement et mouvement
            </button>

          </div>

        )}

        {/*  MODE CONSULTATION */}

        {!isAdmin && (

          <div className="px-5 py-4 border-t border-gray-100">

            <p className="text-xs text-gray-400">

              Vous êtes en mode consultation.
              Les actions d'affectation et de
              condamnation sont réservées à
              l'administrateur.

            </p>

          </div>

        )}

      </div>

      {/*MODALE AFFECTATION*/}

      {showAffectation && isAdmin && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() =>
            !actionLoading &&
            setShowAffectation(false)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h3 className="text-lg font-semibold text-haigana-dark mb-5">
              Affecter le véhicule
            </h3>

            {/* DATE */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'affectation *
            </label>

            <input
              type="date"
              value={dateAffectation}
              onChange={(e) =>
                setDateAffectation(
                  e.target.value
                )
              }
              disabled={actionLoading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-haigana-blue"
            />

            {/* LIEU */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu d'affectation *
            </label>

            <input
              type="text"
              value={lieuAffectation}
              onChange={(e) =>
                setLieuAffectation(
                  e.target.value
                )
              }
              placeholder="Ex : Antananarivo"
              disabled={actionLoading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-haigana-blue"
            />

            {/* DESCRIPTION */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>

            <textarea
              value={descriptionAffectation}
              onChange={(e) =>
                setDescriptionAffectation(
                  e.target.value
                )
              }
              placeholder="Description facultative"
              rows={3}
              disabled={actionLoading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-haigana-blue"
            />

            {/* ERREUR */}

            {actionError && (

              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {actionError}
              </div>

            )}

            {/* BOUTONS */}

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowAffectation(false)
                }
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
                disabled={actionLoading}
              >
                Annuler
              </button>

              <button
                onClick={handleAffecter}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-haigana-blue text-white font-medium hover:bg-haigana-dark disabled:opacity-60"
              >

                {actionLoading
                  ? "Affectation..."
                  : "Affecter"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/*MODALE CONDAMNATION*/}

      {showCondamnation && isAdmin && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() =>
            !actionLoading &&
            setShowCondamnation(false)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >

                  <path
                    d="M12 3 2.5 20h19L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M12 9v5M12 17h.01"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <h3 className="text-lg font-semibold text-red-600">
                Condamner le véhicule
              </h3>

            </div>

            {/* AVERTISSEMENT */}

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">

              <p className="text-sm text-red-700 leading-6">

                Cette action est{" "}
                <strong>irréversible</strong>.

                <br />
                <br />

                Le véhicule sera{" "}
                <strong>
                  définitivement supprimé
                </strong>{" "}
                du parc automobile ainsi que
                ses données associées.

                <br />
                <br />

                La condamnation sera toutefois
                conservée dans l'historique
                afin d'être prise en compte
                dans les statistiques.

                <br />
                <br />

                Date de condamnation :{" "}

                <strong>
                  {formatDate(getDateToday())}
                </strong>

              </p>

            </div>

            {/* LIEU */}

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu de condamnation *
            </label>

            <input
              type="text"
              value={lieuCondamnation}
              onChange={(e) =>
                setLieuCondamnation(
                  e.target.value
                )
              }
              placeholder="Ex : Antananarivo"
              disabled={actionLoading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {/* ERREUR */}

            {actionError && (

              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {actionError}
              </div>

            )}

            {/* BOUTONS */}

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowCondamnation(false)
                }
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
                disabled={actionLoading}
              >
                Annuler
              </button>

              <button
                onClick={handleCondamner}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
              >

                {actionLoading
                  ? "Condamnation..."
                  : "Oui, condamner"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/*MODALE DETAIL JSON*/}

      {openDetail && (

        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() =>
            setOpenDetail(null)
          }
        >

          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-haigana-dark">
                  {openDetail.type}
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Détails de l'étape
                </p>

              </div>

              <button
                onClick={() =>
                  setOpenDetail(null)
                }
                className="w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Fermer"
              >

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mx-auto"
                >

                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                </svg>

              </button>

            </div>

            {/* JSON */}

            <div className="p-6 overflow-auto">

              <pre className="text-xs leading-5 bg-haigana-bg rounded-xl p-5 overflow-auto whitespace-pre-wrap break-words">

                {JSON.stringify(
                  openDetail.data || {},
                  null,
                  2
                )}

              </pre>

            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

              <button
                onClick={() =>
                  setOpenDetail(null)
                }
                className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:bg-haigana-blue transition-colors"
              >
                Fermer
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// COMPOSANT INFORMATION

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="bg-haigana-bg/40 rounded-xl p-4">

      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-medium text-haigana-dark break-words">
        {value || "-"}
      </p>

    </div>
  );
}