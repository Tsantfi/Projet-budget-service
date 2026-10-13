import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import SearchSortBar from "../components/SearchSortBar";

// FORMULAIRE VIDE

const emptyForm = {
  descriptionConstat: "",
  dateConstat: "",
  dateDepart: "",
  dateArrivee: "",
  degat: "",
  raisonDeplacement: "",
};

export default function VehiculeConstatation() {
  const { id, controleId } = useParams();
  const { hasRole } = useAuth();

  // DONNEES

  const [constatations, setConstatations] = useState([]);
  const [controle, setControle] = useState(null);

  // Déplacement lié au contrôle
  const [deplacement, setDeplacement] = useState(null);

  // FORMULAIRE

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // SUPPRESSION

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ETATS

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // RECHERCHE ET TRI

  const [search, setSearch] = useState("");

  const [sortField, setSortField] =
    useState("dateConstat");

  const [sortDirection, setSortDirection] =
    useState("desc");

  // CHARGEMENT

  async function loadData() {
    setError("");

    try {
      // CHARGER CONSTATATIONS + CONTROLE

      const [
        constatationsResponse,
        controleResponse,
      ] = await Promise.all([
        client.get(
          `/constatations?controleId=${controleId}`
        ),

        client.get(
          `/controles/${controleId}`
        ),
      ]);

      // CONSTATATIONS

      const constatationsData =
        Array.isArray(
          constatationsResponse.data
        )
          ? constatationsResponse.data
          : [];

      setConstatations(
        constatationsData
      );

      // CONTROLE

      const controleData =
        controleResponse.data ||
        null;

      setControle(
        controleData
      );

      console.log(
        "CONTROLE CHARGE :",
        controleData
      );

      // RECUPERER LE DEPLACEMENT
      // LIE AU CONTROLE

      let deplacementData = null;

      if (
        Array.isArray(
          controleData?.deplacements
        )
      ) {
        // Chercher d'abord une relation CONTROLE
        const relationControle =
          controleData.deplacements.find(
            (relation) =>
              relation?.statut ===
              "CONTROLE"
          );

        const relation =
          relationControle ||
          controleData.deplacements[0];

        deplacementData =
          relation?.deplacement ||
          null;
      }

      setDeplacement(
        deplacementData
      );

      console.log(
        "DEPLACEMENT LIE AU CONTROLE :",
        deplacementData
      );

      // AFFICHER LES DATES RECUPEREES

      if (deplacementData) {
        console.log(
          "DATE DEPART :",
          deplacementData.dateDeplacement
        );

        console.log(
          "DATE ARRIVEE :",
          deplacementData.dateFinParcours
        );
      }

    } catch (err) {
      console.error(
        "Erreur chargement constatations :",
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
          "Impossible de charger les constatations."
      );
    }
  }

  // CHARGEMENT INITIAL

  useEffect(() => {
    if (!controleId) {
      return;
    }

    loadData();
  }, [controleId]);

  // RECHERCHE + TRI

  const filteredAndSortedConstatations =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      let result =
        constatations.filter(
          (constatation) => {
            if (!term) {
              return true;
            }

            return (
              String(
                constatation.descriptionConstat ||
                  ""
              )
                .toLowerCase()
                .includes(term) ||

              String(
                constatation.degat ||
                  ""
              )
                .toLowerCase()
                .includes(term) ||

              String(
                constatation.raisonDeplacement ||
                  ""
              )
                .toLowerCase()
                .includes(term) ||

              String(
                constatation.dateConstat ||
                  ""
              )
                .toLowerCase()
                .includes(term) ||

              String(
                constatation.dateDepart ||
                  ""
              )
                .toLowerCase()
                .includes(term) ||

              String(
                constatation.dateArrivee ||
                  ""
              )
                .toLowerCase()
                .includes(term)
            );
          }
        );

      // TRI

      result.sort(
        (a, b) => {
          let valueA =
            a[sortField] ?? "";

          let valueB =
            b[sortField] ?? "";

          if (
            sortField === "id"
          ) {
            valueA =
              Number(valueA);

            valueB =
              Number(valueB);
          } else {
            valueA =
              String(
                valueA
              ).toLowerCase();

            valueB =
              String(
                valueB
              ).toLowerCase();
          }

          if (
            valueA < valueB
          ) {
            return sortDirection ===
              "asc"
              ? -1
              : 1;
          }

          if (
            valueA > valueB
          ) {
            return sortDirection ===
              "asc"
              ? 1
              : -1;
          }

          return 0;
        }
      );

      return result;
    }, [
      constatations,
      search,
      sortField,
      sortDirection,
    ]);

  // TRI

  function handleSortChange(e) {
    setSortField(
      e.target.value
    );
  }

  function toggleSortDirection() {
    setSortDirection(
      (current) =>
        current === "asc"
          ? "desc"
          : "asc"
    );
  }

  // FORMULAIRE

  function set(field, value) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  // AJOUTER

  function openAjouter() {
    setEditingId(null);
    setError("");

    // LES DATES VIENNENT DU DEPLACEMENT

    setForm({
      ...emptyForm,

      dateDepart:
        deplacement?.dateDeplacement ||
        "",

      dateArrivee:
        deplacement?.dateFinParcours ||
        "",
    });

    console.log(
      "Nouvelle constatation"
    );

    console.log(
      "Date départ :",
      deplacement?.dateDeplacement
    );

    console.log(
      "Date arrivée :",
      deplacement?.dateFinParcours
    );

    setFormOpen(true);
  }

  // MODIFIER

  function openModifier(
    constatation
  ) {
    setEditingId(
      constatation.id
    );

    setError("");

    setForm({
      descriptionConstat:
        constatation.descriptionConstat ||
        "",

      dateConstat:
        constatation.dateConstat ||
        "",

      // PRIORITE AUX DATES DU DEPLACEMENT

      dateDepart:
        deplacement?.dateDeplacement ||
        constatation.dateDepart ||
        "",

      dateArrivee:
        deplacement?.dateFinParcours ||
        constatation.dateArrivee ||
        "",

      degat:
        constatation.degat ||
        "",

      raisonDeplacement:
        constatation.raisonDeplacement ||
        "",
    });

    setFormOpen(true);
  }

  // AJOUT / MODIFICATION

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      // DATES DU DEPLACEMENT

      const dateDepart =
        deplacement?.dateDeplacement ||
        form.dateDepart ||
        null;

      const dateArrivee =
        deplacement?.dateFinParcours ||
        form.dateArrivee ||
        null;

      // PAYLOAD

      const payload = {
        controleId:
          Number(controleId),

        descriptionConstat:
          form.descriptionConstat
            ?.trim() ||
          null,

        dateConstat:
          form.dateConstat ||
          null,

        // ===================================================
        // DATES LIEES AU DEPLACEMENT
        // ===================================================

        dateDepart:
          dateDepart,

        dateArrivee:
          dateArrivee,

        degat:
          form.degat
            ?.trim() ||
          null,

        raisonDeplacement:
          form.raisonDeplacement
            ?.trim() ||
          null,
      };

      console.log(
        "ENREGISTREMENT CONSTATATION :",
        payload
      );

      // CREATION

      if (!editingId) {
        await client.post(
          "/constatations",
          payload
        );
      }

      // MODIFICATION

      else {
        await client.put(
          `/constatations/${editingId}`,
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
        "Erreur enregistrement constatation :",
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
          "Erreur lors de l'enregistrement de la constatation."
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
        `/constatations/${deleteTarget}`
      );

      setDeleteTarget(null);

      await loadData();

    } catch (err) {
      console.error(
        "Erreur suppression constatation :",
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
          "Erreur lors de la suppression."
      );

    } finally {
      setSubmitting(false);
    }
  }

  // CLASSES

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const readOnlyInputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "bg-gray-100 text-gray-600 cursor-not-allowed outline-none";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  // AFFICHAGE

  return (
    <div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/*  EN-TETE */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
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
              Constatations
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Constatations du contrôle #{controleId}
            </p>

          </div>

          {hasRole(
            "ADMINISTRATEUR"
          ) && (
            <button
              type="button"
              onClick={
                openAjouter
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
              Ajouter une constatation
            </button>
          )}

        </div>

        {/*  INFORMATIONS CONTROLE */}

        {controle && (
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
                md:grid-cols-4
                gap-4
              "
            >

              {/* CONTROLE */}

              <div>

                <p className="text-xs text-gray-400">
                  Contrôle
                </p>

                <p
                  className="
                    font-semibold
                    text-haigana-dark
                  "
                >
                  #{controle.id}
                </p>

              </div>

              {/* DATE CONTROLE */}

              <div>

                <p className="text-xs text-gray-400">
                  Date du contrôle
                </p>

                <p
                  className="
                    font-medium
                    text-gray-700
                  "
                >
                  {controle.dateControle ||
                    "-"}
                </p>

              </div>

              {/* DEPART */}

              <div>

                <p className="text-xs text-gray-400">
                  Départ du déplacement
                </p>

                <p
                  className="
                    font-medium
                    text-gray-700
                  "
                >
                  {deplacement?.dateDeplacement ||
                    "-"}
                </p>

              </div>

              {/* ARRIVEE */}

              <div>

                <p className="text-xs text-gray-400">
                  Arrivée du déplacement
                </p>

                <p
                  className="
                    font-medium
                    text-gray-700
                  "
                >
                  {deplacement?.dateFinParcours ||
                    "-"}
                </p>

              </div>

            </div>

            {/* DESCRIPTION CONTROLE */}

            <div className="mt-4">

              <p className="text-xs text-gray-400">
                Description du contrôle
              </p>

              <p
                className="
                  font-medium
                  text-gray-700
                "
              >
                {controle.description ||
                  "-"}
              </p>

            </div>

          </div>
        )}

        {/*  INFORMATIONS DEPLACEMENT */}

        {deplacement && (
          <div
            className="
              bg-gray-50
              border
              border-gray-100
              rounded-2xl
              p-5
              mb-6
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    text-gray-400
                    uppercase
                    tracking-wide
                  "
                >
                  Déplacement lié
                </p>

                <p
                  className="
                    font-semibold
                    text-haigana-dark
                    mt-1
                  "
                >
                  {deplacement.lieuDepart ||
                    "-"}
                  {" → "}
                  {deplacement.lieuArrivee ||
                    "-"}
                </p>

              </div>

              <div
                className="
                  flex
                  flex-wrap
                  gap-4
                  text-sm
                "
              >

                <div>

                  <span className="text-gray-400">
                    Départ :
                  </span>{" "}

                  <span
                    className="
                      font-medium
                      text-haigana-dark
                    "
                  >
                    {deplacement.dateDeplacement ||
                      "-"}
                  </span>

                </div>

                <div>

                  <span className="text-gray-400">
                    Arrivée :
                  </span>{" "}

                  <span
                    className="
                      font-medium
                      text-haigana-dark
                    "
                  >
                    {deplacement.dateFinParcours ||
                      "-"}
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

        {/*  ERREUR */}

        {error && (
          <p
            className="
              text-sm
              text-red-600
              bg-red-50
              border
              border-red-100
              rounded-lg
              px-3
              py-2
              mb-4
            "
          >
            {error}
          </p>
        )}

        {/*  RECHERCHE + TRI */}

        <div className="mb-5">

          <SearchSortBar
            search={search}
            onSearchChange={
              setSearch
            }
            placeholder="Rechercher une constatation..."
          />

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-end
              gap-3
              mt-3
            "
          >

            <label
              className="
                text-sm
                text-gray-500
              "
            >
              Trier par :
            </label>

            <select
              value={sortField}
              onChange={
                handleSortChange
              }
              className="
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                bg-white
                text-sm
                outline-none
                focus:border-haigana-blue
              "
            >

              <option value="dateConstat">
                Date de constat
              </option>

              <option value="dateDepart">
                Date de départ
              </option>

              <option value="dateArrivee">
                Date d'arrivée
              </option>

              <option value="descriptionConstat">
                Description
              </option>

              <option value="degat">
                Dégât
              </option>

              <option value="id">
                ID
              </option>

            </select>

            <button
              type="button"
              onClick={
                toggleSortDirection
              }
              className="
                px-4
                py-2
                rounded-lg
                border
                border-gray-200
                bg-white
                text-sm
                font-medium
                text-haigana-dark
                hover:bg-haigana-bg
                transition-colors
              "
            >
              {sortDirection ===
              "asc"
                ? "↑ Croissant"
                : "↓ Décroissant"}
            </button>

          </div>

        </div>

        {/*  LISTE */}

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            overflow-hidden
          "
        >

          <div className="overflow-x-auto">

            <table
              className="
                w-full
                text-sm
              "
            >

              <thead
                className="
                  bg-haigana-dark
                  text-white
                "
              >

                <tr>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                      whitespace-nowrap
                    "
                  >
                    Date constat
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                      whitespace-nowrap
                    "
                  >
                    Date départ
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                      whitespace-nowrap
                    "
                  >
                    Date arrivée
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Description
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Dégât
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Déplacement
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

                {filteredAndSortedConstatations.map(
                  (constatation) => (

                    <tr
                      key={
                        constatation.id
                      }
                      className="
                        border-t
                        border-gray-100
                        hover:bg-haigana-bg/60
                        transition-colors
                      "
                    >

                      {/* DATE CONSTAT */}

                      <td
                        className="
                          px-4
                          py-3
                          whitespace-nowrap
                        "
                      >
                        {constatation.dateConstat ||
                          "-"}
                      </td>

                      {/* DATE DEPART */}

                      <td
                        className="
                          px-4
                          py-3
                          whitespace-nowrap
                        "
                      >
                        {constatation.dateDepart ||
                          deplacement?.dateDeplacement ||
                          "-"}
                      </td>

                      {/* DATE ARRIVEE */}

                      <td
                        className="
                          px-4
                          py-3
                          whitespace-nowrap
                        "
                      >
                        {constatation.dateArrivee ||
                          deplacement?.dateFinParcours ||
                          "-"}
                      </td>

                      {/* DESCRIPTION */}

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        {constatation.descriptionConstat ||
                          "-"}
                      </td>

                      {/* DEGAT */}

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >
                        {constatation.degat ||
                          "-"}
                      </td>

                      {/* DEPLACEMENT */}

                      <td
                        className="
                          px-4
                          py-3
                        "
                      >

                        <div>

                          <span>
                            {constatation.raisonDeplacement ||
                              "-"}
                          </span>

                          <div
                            className="
                              text-xs
                              text-gray-400
                              mt-1
                            "
                          >

                            {deplacement?.lieuDepart ||
                              "-"}

                            {" → "}

                            {deplacement?.lieuArrivee ||
                              "-"}

                          </div>

                        </div>

                      </td>

                      {/* ACTIONS */}

                      <td
                        className="
                          px-4
                          py-3
                          text-right
                        "
                      >

                        <div
                          className="
                            flex
                            justify-end
                            items-center
                            gap-3
                          "
                        >

                          {/* PV */}

                          <Link
                            to={`/patrimoine/vehicule/${id}/constatation/${constatation.id}/pv`}
                            className="
                              text-haigana-blue
                              font-medium
                              hover:text-haigana-dark
                            "
                          >
                            Procès-verbal
                          </Link>

                          {/* MODIFIER */}

                          {hasRole(
                            "ADMINISTRATEUR",
                            "MODIFICATEUR"
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                openModifier(
                                  constatation
                                )
                              }
                              className="
                                text-haigana-blue
                                hover:text-haigana-dark
                                font-medium
                              "
                            >
                              Modifier
                            </button>
                          )}

                          {/* SUPPRIMER */}

                          {hasRole(
                            "ADMINISTRATEUR"
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  constatation.id
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

                        </div>

                      </td>

                    </tr>

                  )
                )}

                {filteredAndSortedConstatations.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan={7}
                      className="
                        px-4
                        py-10
                        text-center
                        text-gray-400
                      "
                    >
                      {search
                        ? "Aucune constatation ne correspond à la recherche."
                        : "Aucune constatation n'est enregistrée pour ce contrôle."}
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/*  FORMULAIRE */}

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
                max-w-2xl
                w-full
                max-h-[90vh]
                overflow-y-auto
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h3
                className="
                  font-semibold
                  text-haigana-dark
                  text-lg
                  mb-5
                "
              >
                {editingId
                  ? "Modifier la constatation"
                  : "Ajouter une constatation"}
              </h3>

              {/*    INFORMATIONS DU DEPLACEMENT*/}

              <div
                className="
                  mb-5
                  p-4
                  rounded-xl
                  bg-gray-50
                  border
                  border-gray-100
                "
              >

                <p
                  className="
                    text-xs
                    text-gray-400
                    uppercase
                    tracking-wide
                    mb-2
                  "
                >
                  Déplacement contrôlé
                </p>

                <p
                  className="
                    font-semibold
                    text-haigana-dark
                  "
                >
                  {deplacement?.lieuDepart ||
                    "-"}
                  {" → "}
                  {deplacement?.lieuArrivee ||
                    "-"}
                </p>

              </div>

              {/*    DESCRIPTION*/}

              <label
                className={labelClass}
              >
                Description du constat
              </label>

              <textarea
                value={
                  form.descriptionConstat
                }
                onChange={(e) =>
                  set(
                    "descriptionConstat",
                    e.target.value
                  )
                }
                rows={3}
                className={`${inputClass} mb-4`}
                placeholder="Description du constat..."
              />

              {/*    DATE CONSTAT*/}

              <label
                className={labelClass}
              >
                Date du constat
              </label>

              <input
                type="date"
                value={
                  form.dateConstat
                }
                onChange={(e) =>
                  set(
                    "dateConstat",
                    e.target.value
                  )
                }
                className={`${inputClass} mb-4`}
              />

              {/*    DATES DU DEPLACEMENT*/}

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >

                {/* DATE DEPART */}

                <div>

                  <label
                    className={labelClass}
                  >
                    Date de départ
                  </label>

                  <input
                    type="date"
                    value={
                      form.dateDepart
                    }
                    readOnly
                    className={
                      readOnlyInputClass
                    }
                  />

                  <p
                    className="
                      text-xs
                      text-gray-400
                      mt-1
                    "
                  >
                    Récupérée automatiquement du déplacement.
                  </p>

                </div>

                {/* DATE ARRIVEE */}

                <div>

                  <label
                    className={labelClass}
                  >
                    Date d'arrivée
                  </label>

                  <input
                    type="date"
                    value={
                      form.dateArrivee
                    }
                    readOnly
                    className={
                      readOnlyInputClass
                    }
                  />

                  <p
                    className="
                      text-xs
                      text-gray-400
                      mt-1
                    "
                  >
                    Récupérée automatiquement du déplacement.
                  </p>

                </div>

              </div>

              {/*    DEGAT*/}

              <div className="mt-4">

                <label
                  className={labelClass}
                >
                  Dégât
                </label>

                <textarea
                  value={
                    form.degat
                  }
                  onChange={(e) =>
                    set(
                      "degat",
                      e.target.value
                    )
                  }
                  rows={3}
                  className={
                    inputClass
                  }
                  placeholder="Décrire les dégâts éventuels..."
                />

              </div>

              {/*    RAISON DEPLACEMENT*/}

              <div className="mt-4">

                <label
                  className={labelClass}
                >
                  Raison du déplacement
                </label>

                <textarea
                  value={
                    form.raisonDeplacement
                  }
                  onChange={(e) =>
                    set(
                      "raisonDeplacement",
                      e.target.value
                    )
                  }
                  rows={3}
                  className={
                    inputClass
                  }
                  placeholder="Exemple : Déplacement vers atelier"
                />

              </div>

              {/*    ERREUR*/}

              {error && (
                <div
                  className="
                    mt-4
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

              {/*    BOUTONS*/}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  mt-6
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setFormOpen(false)
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

        {/*  CONFIRMATION SUPPRESSION */}

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
              setDeleteTarget(null)
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

              <h3
                className="
                  font-semibold
                  text-red-600
                  mb-3
                "
              >
                Supprimer cette constatation ?
              </h3>

              <p
                className="
                  text-sm
                  text-gray-500
                  mb-5
                "
              >
                Cette action supprimera également
                les éléments associés à cette
                constatation.
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
                    setDeleteTarget(null)
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

    </div>
  );
}