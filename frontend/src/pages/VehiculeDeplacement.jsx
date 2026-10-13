import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  dateDeplacement: "",
  lieuDepart: "",
  lieuArrivee: "",
  dateFinParcours: "",
  tableKilometrique: "",
  ordreSortie: "AFFECTATION",
};

export default function VehiculeDeplacement() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { hasRole } = useAuth();

  const [vehicule, setVehicule] = useState(null);
  const [deplacements, setDeplacements] = useState([]);

  const [soaId, setSoaId] = useState(
    params.get("soaId") || ""
  );

  const [search, setSearch] = useState("");

  // TRI

  const [sortField, setSortField] =
    useState("dateDeplacement");

  const [sortDirection, setSortDirection] =
    useState("desc");

  // CHARGEMENT

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FORMULAIRE

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [submitting, setSubmitting] = useState(false);

  // CHARGEMENT DES DONNEES

  async function chargerDonnees() {
    try {
      setLoading(true);
      setError("");

      const [
        deplacementsResponse,
        vehiculeResponse,
      ] = await Promise.all([
        client.get(
          `/deplacements?vehiculeId=${id}`
        ),

        client.get(
          `/vehicules/${id}`
        ),
      ]);

      setDeplacements(
        deplacementsResponse.data || []
      );

      setVehicule(
        vehiculeResponse.data || null
      );

      setSoaId(
        vehiculeResponse.data?.codeSoa?.id || ""
      );

    } catch (err) {
      console.error(
        "Erreur chargement déplacements :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de charger les déplacements."
      );

      setDeplacements([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  // CHANGEMENT FORMULAIRE

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // OUVRIR AJOUT

  function ouvrirAjouter() {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
    setFormOpen(true);
  }

  // OUVRIR MODIFICATION

  function ouvrirModifier(deplacement) {
    setEditingId(deplacement.id);

    setForm({
      dateDeplacement:
        deplacement.dateDeplacement || "",

      lieuDepart:
        deplacement.lieuDepart || "",

      lieuArrivee:
        deplacement.lieuArrivee || "",

      dateFinParcours:
        deplacement.dateFinParcours || "",

      tableKilometrique:
        deplacement.tableKilometrique ?? "",

      ordreSortie:
        deplacement.ordreSortie ||
        "AFFECTATION",
    });

    setError("");
    setFormOpen(true);
  }

  // FERMER MODALE

  function fermerFormulaire() {
    if (submitting) {
      return;
    }

    setFormOpen(false);
    setEditingId(null);

    setForm({
      ...emptyForm,
    });
  }

  // ENREGISTREMENT

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // Validation
    if (!form.dateDeplacement) {
      setError(
        "La date du déplacement est obligatoire."
      );
      return;
    }

    if (!form.lieuDepart.trim()) {
      setError(
        "Le lieu de départ est obligatoire."
      );
      return;
    }

    if (!form.lieuArrivee.trim()) {
      setError(
        "Le lieu d'arrivée est obligatoire."
      );
      return;
    }

    setSubmitting(true);

    try {
      // PAYLOAD
      // Le backend attend vehiculeId

      const payload = {
        vehiculeId: Number(id),

        dateDeplacement:
          form.dateDeplacement || null,

        lieuDepart:
          form.lieuDepart.trim(),

        lieuArrivee:
          form.lieuArrivee.trim(),

        dateFinParcours:
          form.dateFinParcours || null,

        tableKilometrique:
          form.tableKilometrique === ""
            ? null
            : Number(form.tableKilometrique),

        ordreSortie:
          form.ordreSortie || null,
      };

      // MODIFICATION

      if (editingId) {
        await client.put(
          `/deplacements/${editingId}`,
          payload
        );
      }

      // AJOUT

      else {
        await client.post(
          "/deplacements",
          payload
        );
      }

      // Fermer le formulaire
      setFormOpen(false);
      setEditingId(null);

      setForm({
        ...emptyForm,
      });

      // Recharger la liste
      await chargerDonnees();

    } catch (err) {
      console.error(
        "Erreur enregistrement déplacement :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Erreur lors de l'enregistrement du déplacement."
      );

    } finally {
      setSubmitting(false);
    }
  }

  // SUPPRESSION

  async function supprimerDeplacement(
    deplacement
  ) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce déplacement ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setError("");

      await client.delete(
        `/deplacements/${deplacement.id}`
      );

      setDeplacements((current) =>
        current.filter(
          (d) => d.id !== deplacement.id
        )
      );

    } catch (err) {
      console.error(
        "Erreur suppression déplacement :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de supprimer le déplacement."
      );
    }
  }

  // RECHERCHE + TRI

  const filtered = useMemo(() => {
    const terme =
      search.trim().toLowerCase();

    let resultat =
      deplacements.filter((d) => {

        if (!terme) {
          return true;
        }

        return (
          String(d.lieuDepart || "")
            .toLowerCase()
            .includes(terme) ||

          String(d.lieuArrivee || "")
            .toLowerCase()
            .includes(terme) ||

          String(d.ordreSortie || "")
            .toLowerCase()
            .includes(terme) ||

          String(d.dateDeplacement || "")
            .toLowerCase()
            .includes(terme) ||

          String(d.dateFinParcours || "")
            .toLowerCase()
            .includes(terme) ||

          String(d.tableKilometrique ?? "")
            .toLowerCase()
            .includes(terme)
        );
      });

    resultat.sort((a, b) => {

      let valeurA =
        a?.[sortField];

      let valeurB =
        b?.[sortField];

      // VALEURS VIDES A LA FIN

      if (
        valeurA === null ||
        valeurA === undefined ||
        valeurA === ""
      ) {
        return 1;
      }

      if (
        valeurB === null ||
        valeurB === undefined ||
        valeurB === ""
      ) {
        return -1;
      }

      // TRI NUMERIQUE

      if (
        sortField ===
        "tableKilometrique"
      ) {
        valeurA =
          Number(valeurA) || 0;

        valeurB =
          Number(valeurB) || 0;

        return sortDirection === "asc"
          ? valeurA - valeurB
          : valeurB - valeurA;
      }

      // TRI DATE

      if (
        sortField ===
        "dateDeplacement" ||
        sortField ===
        "dateFinParcours"
      ) {
        const dateA =
          new Date(valeurA).getTime();

        const dateB =
          new Date(valeurB).getTime();

        if (
          !Number.isNaN(dateA) &&
          !Number.isNaN(dateB)
        ) {
          return sortDirection === "asc"
            ? dateA - dateB
            : dateB - dateA;
        }
      }

      // TRI TEXTE

      const comparaison =
        String(valeurA).localeCompare(
          String(valeurB),
          "fr",
          {
            sensitivity: "base",
            numeric: true,
          }
        );

      return sortDirection === "asc"
        ? comparaison
        : -comparaison;
    });

    return resultat;

  }, [
    deplacements,
    search,
    sortField,
    sortDirection,
  ]);

  // CHANGEMENT DU TRI

  function handleSortChange(e) {
    setSortField(e.target.value);
  }

  function handleDirectionChange(e) {
    setSortDirection(e.target.value);
  }

  // FORMAT DATE

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "fr-FR"
    );
  }

  // AFFICHAGE

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="mb-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>

            <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

              <Link
                to={`/patrimoine/vehicule/${id}/situation`}
                className="hover:text-haigana-blue transition-colors"
              >
                Situation
              </Link>

              <span>/</span>

              <span className="text-haigana-dark font-medium">
                Suivi
              </span>
            </div>

            <h1 className="text-2xl font-bold text-haigana-dark">
              Déplacement et mouvement
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Historique des déplacements effectués par le véhicule.
            </p>

            {vehicule && (
              <p className="text-sm text-haigana-blue font-medium mt-2">
                Véhicule :{" "}
                {vehicule.immatricule || "-"}
              </p>
            )}

          </div>

          {/*BOUTON AJOUTER
          ================================================== */}
          <div className="flex flex-col items-center justify-center gap-2 md:inline-flex md:flex-row">
            {hasRole(
              "ADMINISTRATEUR",
              "MODIFICATEUR"
            ) && (
                <button
                  type="button"
                  onClick={ouvrirAjouter}
                  className="inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl bg-haigana-dark text-white font-medium shadow-sm hover:opacity-90 transition-all"
                >

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 5v14"
                      strokeLinecap="round"
                    />

                    <path
                      d="M5 12h14"
                      strokeLinecap="round"
                    />
                  </svg>

                  Ajouter un déplacement

                </button>
              )}

            <Link
              to={`/patrimoine/vehicule/${id}/kilometrage`}
              className="
                px-9
                py-2.5
                rounded-lg
                bg-haigana-blue
                text-white
                font-semibold
                hover:brightness-95
                transition-all
                inline-flex
                items-center justify-center
              "
            >
              Kilométrage mensuel
            </Link>

          </div>
        </div>

      </div>

      {/*ERREUR*/}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/*RECHERCHE*/}

      <div className="mb-5">

        <SearchSortBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Rechercher par départ, arrivée, date ou ordre de sortie..."
        />

      </div>

      {/*TRI*/}

      <div className="bg-white rounded-2xl shadow-card p-4 mb-6">

        <div className="flex flex-col md:flex-row md:items-center gap-4">

          {/* CHAMP */}

          <div className="flex-1">

            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Trier par
            </label>

            <select
              value={sortField}
              onChange={handleSortChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
            >

              <option value="dateDeplacement">
                Date de déplacement
              </option>

              <option value="lieuDepart">
                Lieu de départ
              </option>

              <option value="lieuArrivee">
                Lieu d'arrivée
              </option>

              <option value="dateFinParcours">
                Fin de parcours
              </option>

              <option value="tableKilometrique">
                Table kilométrique
              </option>

              <option value="ordreSortie">
                Ordre de sortie
              </option>

            </select>

          </div>

          {/* ORDRE */}

          <div className="w-full md:w-56">

            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Ordre
            </label>

            <select
              value={sortDirection}
              onChange={handleDirectionChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
            >

              <option value="asc">
                Croissant
              </option>

              <option value="desc">
                Décroissant
              </option>

            </select>

          </div>

        </div>

      </div>

      {/*TABLEAU*/}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        {loading ? (

          <div className="px-6 py-10 text-center text-gray-400">
            Chargement des déplacements...
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-haigana-dark text-white">

                <tr>

                  <th className="text-left px-4 py-3">
                    Date
                  </th>

                  <th className="text-left px-4 py-3">
                    Départ
                  </th>

                  <th className="text-left px-4 py-3">
                    Arrivée
                  </th>

                  <th className="text-left px-4 py-3">
                    Fin parcours
                  </th>

                  <th className="text-right px-4 py-3">
                    Table km
                  </th>

                  <th className="text-left px-4 py-3">
                    Ordre de sortie
                  </th>

                  {/* ACTIONS */}

                  {hasRole(
                    "ADMINISTRATEUR",
                    "MODIFICATEUR"
                  ) && (
                      <th className="text-center px-4 py-3">
                        Actions
                      </th>
                    )}

                </tr>

              </thead>

              <tbody>

                {filtered.map((d) => (

                  <tr
                    key={d.id}
                    className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                  >

                    {/* DATE */}

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(
                        d.dateDeplacement
                      )}
                    </td>

                    {/* DEPART */}

                    <td className="px-4 py-3">
                      {d.lieuDepart || "-"}
                    </td>

                    {/* ARRIVEE */}

                    <td className="px-4 py-3">
                      {d.lieuArrivee || "-"}
                    </td>

                    {/* FIN PARCOURS */}

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(
                        d.dateFinParcours
                      )}
                    </td>

                    {/* TABLE KM */}

                    <td className="px-4 py-3 text-right">
                      {d.tableKilometrique ??
                        "-"}
                    </td>

                    {/* ORDRE SORTIE */}

                    <td className="px-4 py-3">

                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs bg-haigana-gold/20 text-haigana-dark">
                        {d.ordreSortie || "-"}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    {hasRole(
                      "ADMINISTRATEUR",
                      "MODIFICATEUR"
                    ) && (

                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center gap-2">

                            {/* MODIFIER */}

                            <button
                              type="button"
                              onClick={() =>
                                ouvrirModifier(d)
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-haigana-dark hover:border-haigana-blue hover:text-haigana-blue transition-colors"
                              title="Modifier"
                            >

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  d="M12 20h9"
                                />

                                <path
                                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
                                />
                              </svg>

                              Modifier

                            </button>

                            {/* SUPPRIMER */}

                            {hasRole(
                              "ADMINISTRATEUR"
                            ) && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    supprimerDeplacement(
                                      d
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                  title="Supprimer"
                                >

                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path
                                      d="M3 6h18"
                                    />

                                    <path
                                      d="M8 6V4h8v2"
                                    />

                                    <path
                                      d="M19 6l-1 14H6L5 6"
                                    />

                                    <path
                                      d="M10 11v5"
                                    />

                                    <path
                                      d="M14 11v5"
                                    />
                                  </svg>

                                  Supprimer

                                </button>

                              )}

                          </div>

                        </td>

                      )}

                  </tr>

                ))}

                {/* AUCUN RESULTAT */}

                {filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={
                        hasRole(
                          "ADMINISTRATEUR",
                          "MODIFICATEUR"
                        )
                          ? 7
                          : 6
                      }
                      className="px-4 py-10 text-center text-gray-400"
                    >

                      {search
                        ? "Aucun déplacement ne correspond à votre recherche."
                        : "Aucun déplacement enregistré."}

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/*RESULTAT*/}

      {!loading &&
        filtered.length > 0 && (

          <p className="text-xs text-gray-400 mt-3">

            {filtered.length} déplacement
            {filtered.length > 1
              ? "s"
              : ""}{" "}
            affiché
            {filtered.length > 1
              ? "s"
              : ""}.

          </p>

        )}



      {/*MODALE AJOUT / MODIFICATION*/}

      {formOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* FOND */}

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={fermerFormulaire}
          />

          {/* MODALE */}

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* EN-TETE */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

              <div>

                <h2 className="text-xl font-bold text-haigana-dark">

                  {editingId
                    ? "Modifier le déplacement"
                    : "Ajouter un déplacement"}

                </h2>

                <p className="text-sm text-gray-500 mt-1">

                  Véhicule :{" "}

                  <span className="font-medium text-haigana-dark">
                    {vehicule?.immatricule ||
                      "-"}
                  </span>

                </p>

              </div>

              <button
                type="button"
                onClick={fermerFormulaire}
                disabled={submitting}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Fermer"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M18 6 6 18"
                    strokeLinecap="round"
                  />

                  <path
                    d="m6 6 12 12"
                    strokeLinecap="round"
                  />
                </svg>

              </button>

            </div>

            {/* FORMULAIRE */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* DATE DEPLACEMENT */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Date de déplacement
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    name="dateDeplacement"
                    value={
                      form.dateDeplacement
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                    required
                  />

                </div>

                {/* DATE FIN */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Date fin parcours
                  </label>

                  <input
                    type="date"
                    name="dateFinParcours"
                    value={
                      form.dateFinParcours
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                  />

                </div>

                {/* LIEU DEPART */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Lieu de départ
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="lieuDepart"
                    value={
                      form.lieuDepart
                    }
                    onChange={handleChange}
                    placeholder="Ex : Mahajanga"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                    required
                  />

                </div>

                {/* LIEU ARRIVEE */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Lieu d'arrivée
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="lieuArrivee"
                    value={
                      form.lieuArrivee
                    }
                    onChange={handleChange}
                    placeholder="Ex : Antananarivo"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                    required
                  />

                </div>

                {/* TABLE KILOMETRIQUE */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Table kilométrique
                  </label>

                  <input
                    type="number"
                    name="tableKilometrique"
                    value={
                      form.tableKilometrique
                    }
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Ex : 125"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                  />

                </div>

                {/* ORDRE DE SORTIE */}

                <div>

                  <label className="block text-sm font-medium text-haigana-dark mb-1.5">
                    Ordre de sortie
                  </label>

                  <select
                    name="ordreSortie"
                    value={
                      form.ordreSortie
                    }
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 transition-all"
                  >

                    <option value="AFFECTATION">
                      Affectation
                    </option>

                  </select>

                </div>

              </div>

              {/* ERREUR DANS MODALE */}

              {error && (

                <div className="mt-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>

              )}

              {/* BOUTONS */}

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">

                <button
                  type="button"
                  onClick={fermerFormulaire}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-medium hover:opacity-90 transition-all disabled:opacity-60"
                >

                  {submitting ? (

                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Enregistrement...

                    </>

                  ) : (

                    editingId
                      ? "Enregistrer les modifications"
                      : "Ajouter le déplacement"

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}