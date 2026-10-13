import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

// FORMULAIRE VIDE

const emptyForm = {
  deplacementId: "",
  dateControle: "",
  description: "",
  pieceJustificativeUrl: "",
};

export default function VehiculeControle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // DONNEES

  const [deplacements, setDeplacements] = useState([]);
  const [statutsDeplacements, setStatutsDeplacements] =
    useState({});
  const [controles, setControles] = useState([]);

  const [deplacementsControles, setDeplacementsControles] =
    useState(new Set());

  // FORMULAIRE

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // SUPPRESSION

  const [deleteTarget, setDeleteTarget] = useState(null);

  // CHARGEMENT

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // RECHERCHE

  const [searchDeplacement, setSearchDeplacement] =
    useState("");

  const [searchControle, setSearchControle] =
    useState("");

  // TRI

  const [sortField, setSortField] =
    useState("dateDeplacement");

  const [sortDirection, setSortDirection] =
    useState("desc");

  // CHARGER LES STATUTS DES DEPLACEMENTS

  async function loadStatutsDeplacements(
    deplacementsData
  ) {
    const result = {};

    await Promise.all(
      deplacementsData.map(
        async (deplacement) => {
          try {
            const response =
              await client.get(
                `/controles/deplacement/${deplacement.id}/statut`
              );

            result[deplacement.id] =
              response.data;
          } catch (err) {
            console.error(
              `Erreur statut déplacement ${deplacement.id}:`,
              err
            );

            result[deplacement.id] =
              "NON_CONTROLE";
          }
        }
      )
    );

    setStatutsDeplacements(result);

    return result;
  }

  // CHARGER LES DEPLACEMENTS

  async function loadDeplacements() {
    const response =
      await client.get(
        `/deplacements?vehiculeId=${id}`
      );

    const data =
      Array.isArray(response.data)
        ? response.data
        : [];

    setDeplacements(data);

    return data;
  }

  // CHARGER LES CONTROLES

  async function loadControles() {
    try {
      const response =
        await client.get(
          `/controles?vehiculeId=${id}`
        );

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setControles(data);

      const controlesSet = new Set();

      for (const controle of data) {
        console.log(
          "CONTROLE :",
          controle
        );

        if (
          !Array.isArray(
            controle?.deplacements
          )
        ) {
          continue;
        }

        for (
          const relation
          of controle.deplacements
        ) {
          console.log(
            "RELATION CONTROLE/DEPLACEMENT :",
            relation
          );

          const deplacementId =
            relation?.deplacement?.id ??
            relation?.deplacementId;

          if (
            relation?.statut ===
              "CONTROLE" &&
            deplacementId !== null &&
            deplacementId !== undefined
          ) {
            controlesSet.add(
              Number(deplacementId)
            );
          }
        }
      }

      console.log(
        "DEPLACEMENTS CONTROLES :",
        [...controlesSet]
      );

      setDeplacementsControles(
        controlesSet
      );

      return data;
    } catch (err) {
      console.error(
        "ERREUR GET CONTROLES :",
        err
      );

      console.error(
        "STATUS :",
        err.response?.status
      );

      console.error(
        "DATA SERVEUR :",
        err.response?.data
      );

      throw err;
    }
  }

  // CHARGEMENT GLOBAL

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        deplacementsData,
      ] = await Promise.all([
        loadDeplacements(),
        loadControles(),
      ]);

      await loadStatutsDeplacements(
        deplacementsData
      );
    } catch (err) {
      console.error(
        "Erreur chargement contrôle :",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Impossible de charger les données du contrôle."
      );
    } finally {
      setLoading(false);
    }
  }

  // CHARGEMENT INITIAL

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // VERIFIER SI DEPLACEMENT DEJA CONTROLE

  function isDeplacementDejaControle(
    deplacementId
  ) {
    return deplacementsControles.has(
      Number(deplacementId)
    );
  }

  // RECUPERER LES RELATIONS

  function getControleRelations(
    controle
  ) {
    if (
      !controle ||
      !Array.isArray(
        controle.deplacements
      )
    ) {
      return [];
    }

    return controle.deplacements;
  }

  // TROUVER UNE RELATION

  function getRelationForDeplacement(
    deplacementId
  ) {
    const idRecherche =
      Number(deplacementId);

    if (!idRecherche) {
      return null;
    }

    for (const controle of controles) {
      const relations =
        getControleRelations(
          controle
        );

      const relation =
        relations.find(
          (item) => {
            const relationDeplacementId =
              item?.deplacement?.id ??
              item?.deplacementId;

            return (
              Number(
                relationDeplacementId
              ) === idRecherche
            );
          }
        );

      if (relation) {
        return relation;
      }
    }

    return null;
  }

  // TROUVER LE CONTROLE D'UN DEPLACEMENT

  function getControleForDeplacement(
    deplacementId
  ) {
    const idRecherche =
      Number(deplacementId);

    if (!idRecherche) {
      return null;
    }

    for (const controle of controles) {
      const relations =
        getControleRelations(
          controle
        );

      const relation =
        relations.find(
          (item) => {
            const relationDeplacementId =
              item?.deplacement?.id ??
              item?.deplacementId;

            return (
              Number(
                relationDeplacementId
              ) === idRecherche
            );
          }
        );

      if (relation) {
        return controle;
      }
    }

    return null;
  }

  // STATUT DEPLACEMENT

  function getStatutDeplacement(
    deplacement
  ) {
    if (!deplacement?.id) {
      return "NON_CONTROLE";
    }

    return (
      statutsDeplacements[
        deplacement.id
      ] || "NON_CONTROLE"
    );
  }

  // VERIFIER SI CONTROLE

  function isDeplacementControle(
    deplacement
  ) {
    return (
      getStatutDeplacement(
        deplacement
      ) === "CONTROLE"
    );
  }

  // RECHERCHE + TRI

  const filteredAndSorted =
    useMemo(() => {
      const searchDep =
        searchDeplacement
          .trim()
          .toLowerCase();

      const searchCtrl =
        searchControle
          .trim()
          .toLowerCase();

      let result =
        [...deplacements];

      // RECHERCHE DEPLACEMENT

      if (searchDep) {
        result =
          result.filter(
            (deplacement) => {
              const values = [
                deplacement.id,
                deplacement.dateDeplacement,
                deplacement.lieuDepart,
                deplacement.lieuArrivee,
                deplacement.dateFinParcours,
                deplacement.tableKilometrique,
                deplacement.ordreSortie,
              ];

              return values.some(
                (value) =>
                  String(
                    value ?? ""
                  )
                    .toLowerCase()
                    .includes(
                      searchDep
                    )
              );
            }
          );
      }

      // RECHERCHE CONTROLE

      if (searchCtrl) {
        result =
          result.filter(
            (deplacement) => {
              const controle =
                getControleForDeplacement(
                  deplacement.id
                );

              const statut =
                getStatutDeplacement(
                  deplacement
                );

              const values = [
                statut,
                controle?.id,
                controle?.dateControle,
                controle?.description,
                controle?.pieceJustificativeUrl,
              ];

              return values.some(
                (value) =>
                  String(
                    value ?? ""
                  )
                    .toLowerCase()
                    .includes(
                      searchCtrl
                    )
              );
            }
          );
      }

      // TRI

      result.sort(
        (a, b) => {
          let valueA;
          let valueB;

          // DATE DEPLACEMENT
          if (
            sortField ===
            "dateDeplacement"
          ) {
            valueA =
              a.dateDeplacement
                ? new Date(
                    a.dateDeplacement
                  ).getTime()
                : 0;

            valueB =
              b.dateDeplacement
                ? new Date(
                    b.dateDeplacement
                  ).getTime()
                : 0;

            return sortDirection ===
              "asc"
              ? valueA - valueB
              : valueB - valueA;
          }

          // DATE FIN
          if (
            sortField ===
            "dateFinParcours"
          ) {
            valueA =
              a.dateFinParcours
                ? new Date(
                    a.dateFinParcours
                  ).getTime()
                : 0;

            valueB =
              b.dateFinParcours
                ? new Date(
                    b.dateFinParcours
                  ).getTime()
                : 0;

            return sortDirection ===
              "asc"
              ? valueA - valueB
              : valueB - valueA;
          }

          // KILOMETRAGE
          if (
            sortField ===
            "tableKilometrique"
          ) {
            valueA = Number(
              a.tableKilometrique ??
                0
            );

            valueB = Number(
              b.tableKilometrique ??
                0
            );

            return sortDirection ===
              "asc"
              ? valueA - valueB
              : valueB - valueA;
          }

          // STATUT
          if (
            sortField === "statut"
          ) {
            valueA =
              getStatutDeplacement(
                a
              );

            valueB =
              getStatutDeplacement(
                b
              );
          }

          // DEPART
          if (
            sortField ===
            "lieuDepart"
          ) {
            valueA =
              a.lieuDepart || "";

            valueB =
              b.lieuDepart || "";
          }

          // ARRIVEE
          if (
            sortField ===
            "lieuArrivee"
          ) {
            valueA =
              a.lieuArrivee || "";

            valueB =
              b.lieuArrivee || "";
          }

          // ORDRE DE SORTIE
          if (
            sortField ===
            "ordreSortie"
          ) {
            valueA =
              a.ordreSortie || "";

            valueB =
              b.ordreSortie || "";
          }

          const comparison =
            String(
              valueA ?? ""
            )
              .toLowerCase()
              .localeCompare(
                String(
                  valueB ?? ""
                ).toLowerCase(),
                "fr",
                {
                  sensitivity:
                    "base",
                  numeric: true,
                }
              );

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        }
      );

      return result;
    }, [
      deplacements,
      controles,
      deplacementsControles,
      statutsDeplacements,
      searchDeplacement,
      searchControle,
      sortField,
      sortDirection,
    ]);

  // TRI

  function handleSort(field) {
    if (
      sortField === field
    ) {
      setSortDirection(
        (direction) =>
          direction === "asc"
            ? "desc"
            : "asc"
      );

      return;
    }

    setSortField(field);

    if (
      field ===
        "dateDeplacement" ||
      field ===
        "dateFinParcours" ||
      field ===
        "tableKilometrique"
    ) {
      setSortDirection("desc");
    } else {
      setSortDirection("asc");
    }
  }

  // ICONE TRI

  function sortIcon(field) {
    if (
      sortField !== field
    ) {
      return "↕";
    }

    return sortDirection ===
      "asc"
      ? "↑"
      : "↓";
  }

  // FORMULAIRE

  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  // OUVRIR AJOUT

  function openAjouter(
    deplacementId = ""
  ) {
    setEditingId(null);

    setForm({
      ...emptyForm,

      deplacementId:
        deplacementId
          ? String(
              deplacementId
            )
          : "",

      dateControle:
        new Date()
          .toISOString()
          .split("T")[0],
    });

    setError("");
    setFormOpen(true);
  }

  // OUVRIR MODIFICATION

  function openModifier(
    controle
  ) {
    const relations =
      getControleRelations(
        controle
      );

    const relation =
      relations.find(
        (item) =>
          item?.statut ===
          "CONTROLE"
      ) ||
      relations[0] ||
      null;

    const deplacementId =
      relation?.deplacement
        ?.id ??
      relation?.deplacementId ??
      "";

    setEditingId(
      controle?.id ?? null
    );

    setForm({
      deplacementId:
        deplacementId
          ? String(
              deplacementId
            )
          : "",

      dateControle:
        controle?.dateControle ||
        "",

      description:
        controle?.description ||
        "",

      pieceJustificativeUrl:
        controle?.pieceJustificativeUrl ||
        "",
    });

    setError("");
    setFormOpen(true);
  }

  // FORMAT DEPLACEMENT

  function formatDeplacement(
    deplacement
  ) {
    if (!deplacement) {
      return "-";
    }

    const date =
      deplacement.dateDeplacement ||
      "-";

    const depart =
      deplacement.lieuDepart ||
      "-";

    const arrivee =
      deplacement.lieuArrivee ||
      "-";

    return `${date} — ${depart} → ${arrivee}`;
  }

  // ENREGISTREMENT

  async function handleSubmit(e) {
    e.preventDefault();

    console.log(
      "ID véhicule :",
      id
    );

    console.log(
      "ID déplacement sélectionné :",
      form.deplacementId
    );

    setError("");

    // =======================================================
    // VALIDATION
    // =======================================================

    if (!form.deplacementId) {
      setError(
        "Le déplacement est obligatoire."
      );
      return;
    }

    if (!form.dateControle) {
      setError(
        "La date du contrôle est obligatoire."
      );
      return;
    }

    const deplacementSelectionne =
      deplacements.find(
        (item) =>
          Number(item.id) ===
          Number(
            form.deplacementId
          )
      );

    if (
      !deplacementSelectionne
    ) {
      setError(
        "Le déplacement sélectionné est introuvable."
      );
      return;
    }

    // =======================================================
    // VERIFIER SI DEJA CONTROLE
    // =======================================================

    const relationExistante =
      getRelationForDeplacement(
        form.deplacementId
      );

    const controleExistant =
      getControleForDeplacement(
        form.deplacementId
      );

    const dejaControle =
      isDeplacementDejaControle(
        form.deplacementId
      ) ||
      relationExistante?.statut ===
        "CONTROLE";

    const controleActuel =
      editingId &&
      controleExistant?.id ===
        Number(editingId);

    if (
      dejaControle &&
      !controleActuel
    ) {
      setError(
        "Ce déplacement est déjà contrôlé."
      );
      return;
    }

    setSubmitting(true);

    try {
      // PAYLOAD

      const payload = {
        vehiculeId:
          Number(id),

        description:
          form.description
            ?.trim() ||
          null,

        dateControle:
          form.dateControle,

        pieceJustificativeUrl:
          form
            .pieceJustificativeUrl
            ?.trim() ||
          null,

        deplacements: [
          {
            deplacementId:
              Number(
                form.deplacementId
              ),

            statut:
              "CONTROLE",
          },
        ],
      };

      console.log(
        "Enregistrement contrôle :",
        payload
      );

      // CREATION

      if (!editingId) {
        await client.post(
          "/controles",
          payload
        );
      }

      // MODIFICATION

      else {
        await client.put(
          `/controles/${editingId}`,
          payload
        );
      }

      // FERMER

      setFormOpen(false);
      setEditingId(null);

      setForm({
        ...emptyForm,
      });

      // RECHARGER

      await loadData();
    } catch (err) {
      console.error(
        "Erreur enregistrement contrôle :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Erreur lors de l'enregistrement du contrôle."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // SUPPRESSION

  async function handleSupprimer() {
    if (!deleteTarget) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await client.delete(
        `/controles/${deleteTarget}`
      );

      setDeleteTarget(null);

      await loadData();
    } catch (err) {
      console.error(
        "Erreur suppression contrôle :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Erreur lors de la suppression du contrôle."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // VOIR PV

  async function voirPV(
    controle
  ) {
    if (!controle?.id) {
      return;
    }

    try {
      setError("");

      console.log(
        "Recherche de la constatation du contrôle :",
        controle.id
      );

      const response =
        await client.get(
          `/constatations?controleId=${controle.id}`
        );

      console.log(
        "Constatations reçues :",
        response.data
      );

      const constatations =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      if (
        constatations.length ===
        0
      ) {
        setError(
          "Aucune constatation n'est enregistrée pour ce contrôle."
        );
        return;
      }

      const constatation =
        constatations[0];

      if (!constatation?.id) {
        setError(
          "Identifiant de la constatation introuvable."
        );
        return;
      }

      console.log(
        "ID de la constatation :",
        constatation.id
      );

      navigate(
        `/patrimoine/vehicule/${id}/constatation/${constatation.id}/pv`
      );
    } catch (err) {
      console.error(
        "Erreur récupération constatation :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Impossible de récupérer la constatation."
      );
    }
  }

  // VOIR / AJOUTER LA CONSTATATION
  function voirConstatation(controle) {
    if (!controle?.id) {
      return;
    }

    navigate(
      `/patrimoine/vehicule/${id}/controle/${controle.id}/constatations`
    );
  }

  // CLASSES

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // STATISTIQUES

  const nombreControles =
    deplacements.filter(
      (deplacement) =>
        isDeplacementControle(
          deplacement
        )
    ).length;

  const nombreNonControles =
    deplacements.length -
    nombreControles;

  // CHARGEMENT

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-8
            text-center
            text-gray-400
          "
        >
          Chargement des contrôles...
        </div>
      </div>
    );
  }

  // AFFICHAGE

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*   RETOUR*/}

      <div className="flex justify-start mb-6">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/patrimoine/vehicule/${id}/situation`
            )
          }
          className="
            px-5
            py-2.5
            rounded-lg
            border
            border-gray-200
            text-gray-600
            font-semibold
            hover:bg-gray-100
            transition-colors
          "
        >
          Retour
        </button>
      </div>

      {/*   EN-TETE*/}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
          mb-6
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-bold
              text-haigana-dark
            "
          >
            Contrôle
          </h1>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Contrôle des déplacements du véhicule
          </p>
        </div>

        {hasRole(
          "ADMINISTRATEUR"
        ) && (
          <button
            type="button"
            onClick={() =>
              openAjouter()
            }
            className="
              px-5
              py-2.5
              rounded-lg
              bg-haigana-dark
              text-white
              font-medium
              hover:bg-haigana-blue
              transition-colors
            "
          >
            Ajouter un contrôle
          </button>
        )}
      </div>

      {/*   RECHERCHE*/}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          p-5
          mb-6
        "
      >
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-4
          "
        >

          {/*RECHERCHE DEPLACEMENT*/}

          <div>
            <label
              className={labelClass}
            >
              Rechercher un déplacement
            </label>

            <input
              type="text"
              value={
                searchDeplacement
              }
              onChange={(e) =>
                setSearchDeplacement(
                  e.target.value
                )
              }
              placeholder="Date, départ, arrivée, kilométrage, ordre de sortie..."
              className={inputClass}
            />

            <p
              className="
                text-xs
                text-gray-400
                mt-1
              "
            >
              Recherche dans les informations du déplacement.
            </p>
          </div>

          {/*RECHERCHE CONTROLE*/}

          <div>
            <label
              className={labelClass}
            >
              Rechercher un contrôle
            </label>

            <input
              type="text"
              value={
                searchControle
              }
              onChange={(e) =>
                setSearchControle(
                  e.target.value
                )
              }
              placeholder="Statut, ID, date, description, PV..."
              className={inputClass}
            />

            <p
              className="
                text-xs
                text-gray-400
                mt-1
              "
            >
              Recherche dans les informations du contrôle.
            </p>
          </div>

        </div>

        {/* ===================================================
            TRI */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-4
            mt-5
          "
        >

          <div className="flex-1">
            <label
              className={labelClass}
            >
              Trier par
            </label>

            <select
              value={sortField}
              onChange={(e) => {
                const field =
                  e.target.value;

                setSortField(field);

                if (
                  field ===
                    "dateDeplacement" ||
                  field ===
                    "dateFinParcours" ||
                  field ===
                    "tableKilometrique"
                ) {
                  setSortDirection(
                    "desc"
                  );
                } else {
                  setSortDirection(
                    "asc"
                  );
                }
              }}
              className="
                w-full
                px-4
                py-2.5
                rounded-lg
                border
                border-gray-200
                bg-white
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            >
              <option value="dateDeplacement">
                Date déplacement
              </option>

              <option value="dateFinParcours">
                Date fin
              </option>

              <option value="lieuDepart">
                Lieu de départ
              </option>

              <option value="lieuArrivee">
                Lieu d'arrivée
              </option>

              <option value="tableKilometrique">
                Kilométrage
              </option>

              <option value="ordreSortie">
                Ordre de sortie
              </option>

              <option value="statut">
                Statut du contrôle
              </option>
            </select>
          </div>

          <div className="sm:w-48">
            <label
              className={labelClass}
            >
              Ordre
            </label>

            <button
              type="button"
              onClick={() =>
                setSortDirection(
                  (direction) =>
                    direction ===
                    "asc"
                      ? "desc"
                      : "asc"
                )
              }
              className="
                w-full
                px-4
                py-2.5
                rounded-lg
                border
                border-gray-200
                bg-white
                hover:bg-gray-50
                transition-colors
                text-haigana-dark
                font-medium
              "
            >
              {sortDirection ===
              "asc"
                ? "↑ Croissant"
                : "↓ Décroissant"}
            </button>
          </div>

        </div>

        {/* ===================================================
            RESULTATS + EFFACER */}

        <div
          className="
            mt-4
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-2
            text-sm
            text-gray-500
          "
        >
          <span>
            {filteredAndSorted.length} déplacement
            {filteredAndSorted.length >
            1
              ? "s"
              : ""}
          </span>

          {(searchDeplacement ||
            searchControle) && (
            <button
              type="button"
              onClick={() => {
                setSearchDeplacement(
                  ""
                );
                setSearchControle(
                  ""
                );
              }}
              className="
                text-haigana-blue
                hover:text-haigana-dark
                font-medium
                text-left
                sm:text-right
              "
            >
              Effacer les recherches
            </button>
          )}
        </div>
      </div>

      {/*   ERREUR*/}

      {error && (
        <div
          className="
            mb-5
            text-sm
            text-red-600
            bg-red-50
            border
            border-red-100
            rounded-lg
            px-4
            py-3
          "
        >
          {error}
        </div>
      )}

      {/*   RESUME*/}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
          mb-6
        "
      >

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-5
          "
        >
          <p
            className="
              text-xs
              text-gray-500
              uppercase
              tracking-wide
            "
          >
            Déplacements
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-haigana-dark
            "
          >
            {deplacements.length}
          </p>
        </div>

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-5
          "
        >
          <p
            className="
              text-xs
              text-gray-500
              uppercase
              tracking-wide
            "
          >
            Déplacements contrôlés
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-green-600
            "
          >
            {nombreControles}
          </p>
        </div>

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-5
          "
        >
          <p
            className="
              text-xs
              text-gray-500
              uppercase
              tracking-wide
            "
          >
            Non contrôlés
          </p>

          <p
            className="
              mt-1
              text-2xl
              font-bold
              text-red-600
            "
          >
            {nombreNonControles}
          </p>
        </div>

      </div>

      {/*   TABLEAU*/}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        "
      >

        <div
          className="
            px-5
            py-4
            border-b
            border-gray-100
          "
        >
          <h2
            className="
              text-lg
              font-semibold
              text-haigana-dark
            "
          >
            Déplacements et contrôles
          </h2>

          <p
            className="
              text-sm
              text-gray-500
              mt-1
            "
          >
            Chaque déplacement doit être contrôlé individuellement.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead
              className="
                bg-haigana-dark
                text-white
              "
            >
              <tr>

                <th
                  onClick={() =>
                    handleSort(
                      "dateDeplacement"
                    )
                  }
                  className="
                    text-left
                    px-4
                    py-3
                    cursor-pointer
                    select-none
                    hover:bg-black/10
                    whitespace-nowrap
                  "
                >
                  <div className="flex items-center gap-2">
                    Date déplacement
                    <span className="text-xs opacity-70">
                      {sortIcon(
                        "dateDeplacement"
                      )}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "lieuDepart"
                    )
                  }
                  className="
                    text-left
                    px-4
                    py-3
                    cursor-pointer
                    select-none
                    hover:bg-black/10
                    whitespace-nowrap
                  "
                >
                  <div className="flex items-center gap-2">
                    Départ
                    <span className="text-xs opacity-70">
                      {sortIcon(
                        "lieuDepart"
                      )}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "lieuArrivee"
                    )
                  }
                  className="
                    text-left
                    px-4
                    py-3
                    cursor-pointer
                    select-none
                    hover:bg-black/10
                    whitespace-nowrap
                  "
                >
                  <div className="flex items-center gap-2">
                    Arrivée
                    <span className="text-xs opacity-70">
                      {sortIcon(
                        "lieuArrivee"
                      )}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "tableKilometrique"
                    )
                  }
                  className="
                    text-right
                    px-4
                    py-3
                    cursor-pointer
                    select-none
                    hover:bg-black/10
                    whitespace-nowrap
                  "
                >
                  <div className="flex items-center justify-end gap-2">
                    Kilométrage
                    <span className="text-xs opacity-70">
                      {sortIcon(
                        "tableKilometrique"
                      )}
                    </span>
                  </div>
                </th>

                <th
                  onClick={() =>
                    handleSort(
                      "statut"
                    )
                  }
                  className="
                    text-left
                    px-4
                    py-3
                    cursor-pointer
                    select-none
                    hover:bg-black/10
                    whitespace-nowrap
                  "
                >
                  <div className="flex items-center gap-2">
                    Statut
                    <span className="text-xs opacity-70">
                      {sortIcon(
                        "statut"
                      )}
                    </span>
                  </div>
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    whitespace-nowrap
                  "
                >
                  Date contrôle
                </th>

                <th
                  className="
                    text-left
                    px-4
                    py-3
                    whitespace-nowrap
                  "
                >
                  Constatation
                </th>

                <th
                  className="
                    text-right
                    px-4
                    py-3
                    whitespace-nowrap
                  "
                >
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredAndSorted.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="
                      px-4
                      py-10
                      text-center
                      text-gray-400
                    "
                  >
                    {searchDeplacement ||
                    searchControle
                      ? "Aucun résultat pour les critères de recherche."
                      : "Aucun déplacement enregistré pour ce véhicule."}
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map(
                  (
                    deplacement
                  ) => {
                    const controle =
                      getControleForDeplacement(
                        deplacement.id
                      );

                    const relation =
                      getRelationForDeplacement(
                        deplacement.id
                      );

                    const controleExiste =
                      relation?.statut ===
                      "CONTROLE";

                    return (
                      <tr
                        key={
                          deplacement.id
                        }
                        className="
                          border-t
                          border-gray-100
                          hover:bg-gray-50
                          transition-colors
                        "
                      >

                        {/* DATE */}

                        <td
                          className="
                            px-4
                            py-3
                            font-medium
                            text-haigana-dark
                            whitespace-nowrap
                          "
                        >
                          {deplacement.dateDeplacement ||
                            "-"}
                        </td>

                        {/* DEPART */}

                        <td
                          className="
                            px-4
                            py-3
                            text-gray-600
                          "
                        >
                          {deplacement.lieuDepart ||
                            "-"}
                        </td>

                        {/* ARRIVEE */}

                        <td
                          className="
                            px-4
                            py-3
                            text-gray-600
                          "
                        >
                          {deplacement.lieuArrivee ||
                            "-"}
                        </td>

                        {/* KILOMETRAGE */}

                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-semibold
                            text-haigana-blue
                            whitespace-nowrap
                          "
                        >
                          {deplacement.tableKilometrique !==
                            null &&
                          deplacement.tableKilometrique !==
                            undefined
                            ? `${Number(
                                deplacement.tableKilometrique
                              ).toLocaleString(
                                "fr-FR"
                              )} km`
                            : "-"}
                        </td>

                        {/* STATUT */}

                        <td className="px-4 py-3">

                          {controleExiste ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                px-2.5
                                py-1
                                rounded-full
                                bg-green-100
                                text-green-700
                                font-semibold
                                text-xs
                              "
                            >
                              Contrôlé
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                px-2.5
                                py-1
                                rounded-full
                                bg-red-100
                                text-red-600
                                font-semibold
                                text-xs
                              "
                            >
                              Non contrôlé
                            </span>
                          )}

                        </td>

                        {/* DATE CONTROLE */}

                        <td
                          className="
                            px-4
                            py-3
                            whitespace-nowrap
                          "
                        >
                          {controleExiste
                            ? controle?.dateControle ||
                              "-"
                            : "-"}
                        </td>

                        {/* CONSTATATION */}

                        <td className="px-4 py-3">

                          {controleExiste ? (
                            <button
                              type="button"
                              onClick={() => voirConstatation(controle)}
                              className="
                                text-haigana-blue
                                hover:text-haigana-dark
                                font-medium
                              "
                            >
                              Constatation
                            </button>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            whitespace-nowrap
                          "
                        >

                          {/* CONTROLLER */}

                          {!isDeplacementControle(
                            deplacement
                          ) &&
                            hasRole(
                              "ADMINISTRATEUR"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openAjouter(
                                    deplacement.id
                                  )
                                }
                                className="
                                  text-haigana-blue
                                  hover:text-haigana-dark
                                  font-medium
                                "
                              >
                                Contrôler
                              </button>
                            )}

                          {/* MODIFIER */}

                          {isDeplacementControle(
                            deplacement
                          ) &&
                            controle &&
                            hasRole(
                              "ADMINISTRATEUR",
                              "MODIFICATEUR"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openModifier(
                                    controle
                                  )
                                }
                                className="
                                  text-haigana-blue
                                  hover:text-haigana-dark
                                  font-medium
                                  mr-3
                                "
                              >
                                Modifier
                              </button>
                            )}

                          {/* SUPPRIMER */}

                          {isDeplacementControle(
                            deplacement
                          ) &&
                            controle &&
                            hasRole(
                              "ADMINISTRATEUR"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget(
                                    controle.id
                                  )
                                }
                                className="
                                  text-red-600
                                  hover:text-red-800
                                  font-medium
                                "
                              >
                                Supprimer
                              </button>
                            )}

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/*   MODALE AJOUT / MODIFICATION*/}

      {formOpen && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
          onClick={() =>
            setFormOpen(false)
          }
        >

          <form
            onSubmit={
              handleSubmit
            }
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
              max-w-lg
              w-full
              max-h-[90vh]
              overflow-y-auto
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2
              className="
                text-lg
                font-semibold
                text-haigana-dark
                mb-5
              "
            >
              {editingId
                ? "Modifier le contrôle"
                : "Ajouter un contrôle"}
            </h2>

            {/* DEPLACEMENT */}

            <label
              className={
                labelClass
              }
            >
              Déplacement
            </label>

            <select
              name="deplacementId"
              value={
                form.deplacementId
              }
              onChange={
                handleChange
              }
              disabled={
                Boolean(
                  editingId
                )
              }
              className={`
                ${inputClass}
                mb-4
                bg-white
                disabled:bg-gray-100
                disabled:text-gray-500
              `}
              required
            >

              <option value="">
                Sélectionner un déplacement
              </option>

              {deplacements.map(
                (
                  deplacement
                ) => {
                  const dejaControle =
                    isDeplacementDejaControle(
                      deplacement.id
                    );

                  const controleActuel =
                    editingId &&
                    getControleForDeplacement(
                      deplacement.id
                    )?.id ===
                      Number(
                        editingId
                      );

                  const autreControle =
                    dejaControle &&
                    !controleActuel;

                  return (
                    <option
                      key={
                        deplacement.id
                      }
                      value={
                        deplacement.id
                      }
                      disabled={
                        autreControle
                      }
                    >
                      {formatDeplacement(
                        deplacement
                      )}

                      {autreControle
                        ? " — déjà contrôlé"
                        : ""}
                    </option>
                  );
                }
              )}

            </select>

            {/* DATE */}

            <label
              className={
                labelClass
              }
            >
              Date du contrôle
            </label>

            <input
              type="date"
              name="dateControle"
              value={
                form.dateControle
              }
              onChange={
                handleChange
              }
              className={`${inputClass} mb-4`}
              required
            />

            {/* DESCRIPTION */}

            <label
              className={
                labelClass
              }
            >
              Description

              <span
                className="
                  text-gray-400
                  font-normal
                "
              >
                {" "}
                (optionnelle)
              </span>
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              rows={4}
              className={`${inputClass} mb-4`}
              placeholder="Description du contrôle..."
            />

            {/* PV */}

            <label
              className={
                labelClass
              }
            >
              PV du contrôle
            </label>

            <input
              type="text"
              name="pieceJustificativeUrl"
              value={
                form.pieceJustificativeUrl
              }
              onChange={
                handleChange
              }
              className={`${inputClass} mb-5`}
              placeholder="Chemin ou URL du PV..."
            />

            {/* ERREUR */}

            {error && (
              <div
                className="
                  mb-4
                  text-sm
                  text-red-600
                  bg-red-50
                  border
                  border-red-100
                  rounded-lg
                  px-4
                  py-3
                "
              >
                {error}
              </div>
            )}

            {/* BOUTONS */}

            <div
              className="
                flex
                justify-end
                gap-2
              "
            >

              <button
                type="button"
                onClick={() =>
                  setFormOpen(
                    false
                  )
                }
                disabled={
                  submitting
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="
                  px-5
                  py-2
                  rounded-lg
                  bg-haigana-dark
                  text-white
                  font-semibold
                  hover:bg-haigana-blue
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Enregistrement..."
                  : editingId
                  ? "Modifier"
                  : "Enregistrer"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* MODALE SUPPRESSION */}

      {deleteTarget && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
            p-4
          "
          onClick={() =>
            setDeleteTarget(
              null
            )
          }
        >

          <div
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              p-6
              max-w-md
              w-full
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2
              className="
                font-semibold
                text-red-600
                mb-3
              "
            >
              Supprimer ce contrôle ?
            </h2>

            <p
              className="
                text-sm
                text-gray-500
                mb-5
              "
            >
              Le déplacement redeviendra automatiquement
              « Non contrôlé ». Cette action est irréversible.
            </p>

            <div
              className="
                flex
                justify-end
                gap-2
              "
            >

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                disabled={
                  submitting
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  handleSupprimer
                }
                disabled={
                  submitting
                }
                className="
                  px-5
                  py-2
                  rounded-lg
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-60
                "
              >
                {submitting
                  ? "Suppression..."
                  : "Confirmer"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}