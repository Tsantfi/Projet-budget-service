import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = {
  description: "",
  lieuEntretien: "",
  dateEntretien: "",
  vehiculeId: "",
  pieceJustificativeUrl: "",
};

export default function EntretienAdmin() {
  const [entretiens, setEntretiens] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  const [form, setForm] = useState(emptyForm);
  // ÉTAT CRITIQUE À AJOUTER POUR LA SAISIE DU MATRICULE
  const [immatriculationSaisie, setImmatriculationSaisie] = useState("");


  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("dateEntretien");
  const [sortDirection, setSortDirection] = useState("desc");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // ROLE UTILISATEUR
  function getUserRoles() {
    try {
      const token = localStorage.getItem("haigana_token");

      if (!token) {
        return [];
      }

      const parts = token.split(".");

      if (parts.length !== 3) {
        return [];
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      let roles = [];

      if (Array.isArray(payload.authorities)) {
        roles = payload.authorities;
      } else if (Array.isArray(payload.roles)) {
        roles = payload.roles;
      } else if (payload.role) {
        roles = [payload.role];
      } else if (payload.authority) {
        roles = [payload.authority];
      }

      return roles.map((role) =>
        String(role)
          .replace("ROLE_", "")
          .toUpperCase()
      );

    } catch (err) {
      console.error(
        "Erreur lecture rôle utilisateur :",
        err
      );

      return [];
    }
  }

  const roles = getUserRoles();

  const isAdministrateur =
    roles.includes("ADMINISTRATEUR");

  const isModificateur =
    roles.includes("MODIFICATEUR");

  const isConsultant =
    roles.includes("CONSULTANT");

  const canCreate =
    isAdministrateur || isModificateur;

  const canEdit =
    isAdministrateur || isModificateur;

  const canDelete =
    isAdministrateur;
  // CHARGEMENT VEHICULES
  async function loadVehicules() {
    try {
      const response =
        await client.get("/vehicules");

      setVehicules(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Erreur chargement véhicules :",
        err
      );

      setError(
        "Impossible de charger les véhicules."
      );
    }
  }
  // CHARGEMENT ENTRETIENS
  async function loadEntretiens(
    vehiculeId = null
  ) {
    try {
      if (!vehiculeId) {
        setEntretiens([]);
        return;
      }

      const response =
        await client.get("/entretiens", {
          params: {
            vehiculeId: vehiculeId,
          },
        });

      setEntretiens(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {
      console.error(
        "Erreur chargement entretiens :",
        err
      );

      setError(
        "Impossible de charger les entretiens."
      );
    }
  }
  // INITIALISATION
  useEffect(() => {
    loadVehicules();
  }, []);
  // CHANGEMENT FORMULAIRE
  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }
  // SELECTION VEHICULE
  function handleVehiculeChange(value) {
    set("vehiculeId", value);

    setError("");
    setSuccess("");
    setSearch("");

    if (value) {
      loadEntretiens(value);
    } else {
      setEntretiens([]);
    }
  }
  // CREATION / MODIFICATION
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!canCreate && !editingId) {
      setError(
        "Vous n'avez pas l'autorisation de créer un entretien."
      );
      return;
    }

    if (editingId && !canEdit) {
      setError(
        "Vous n'avez pas l'autorisation de modifier un entretien."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (!form.vehiculeId) {
        throw new Error(
          "Veuillez sélectionner un véhicule."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "La description de l'entretien est obligatoire."
        );
      }

      if (!form.dateEntretien) {
        throw new Error(
          "La date d'entretien est obligatoire."
        );
      }

      const payload = {
        description:
          form.description.trim(),

        lieuEntretien:
          form.lieuEntretien.trim() || null,

        dateEntretien:
          form.dateEntretien,

        vehicule: {
          id: Number(form.vehiculeId),
        },

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() ||
          null,
      };

      console.log(
        "Payload Entretien :",
        payload
      );

      if (editingId) {
        await client.put(
          `/entretiens/${editingId}`,
          payload
        );

        setSuccess(
          "L'entretien a été modifié avec succès."
        );

      } else {
        await client.post(
          "/entretiens",
          payload
        );

        setSuccess(
          "L'entretien a été enregistré avec succès."
        );
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadEntretiens(
        payload.vehicule.id
      );

    } catch (err) {
      console.error(
        "Erreur enregistrement entretien :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Erreur lors de l'enregistrement."
      );

    } finally {
      setSubmitting(false);
    }
  }

  // DÉTECTION ET CHARGEMENT AUTOMATIQUE VIA LA SAISIE DU MATRICULE

  function handleImmatriculationSaisie(texteTape) {
    setImmatriculationSaisie(texteTape);
    setError("");
    setSuccess("");

    // Normalisation de la saisie (Majuscules, sans espaces)
    const immatRecherchee = texteTape.trim().replace(/\s+/g, "").toUpperCase();

    if (!immatRecherchee) {
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setEntretiens([]);
      return;
    }

    // Recherche du véhicule correspondant dans le parc chargé
    const vehiculeTrouve = vehicules.find(
      (v) => v.immatricule?.trim().replace(/\s+/g, "").toUpperCase() === immatRecherchee
    );

    if (vehiculeTrouve) {
      setForm((prev) => ({ ...prev, vehiculeId: String(vehiculeTrouve.id) }));
      loadEntretiens(vehiculeTrouve.id); // Charge instantanément le tableau
    } else {
      // Si l'utilisateur tape un matricule inconnu ou incomplet
      setForm((prev) => ({ ...prev, vehiculeId: "" }));
      setEntretiens([]);
    }
  }

  // MODIFICATION
  function handleEdit(item) {
    if (!canEdit) {
      setError("Vous n'avez pas l'autorisation de modifier un entretien.");
      return;
    }

    setEditingId(item.id);

    // Récupération de l'immatriculation pour le champ de saisie
    const immatVehicule = item.vehicule?.immatricule || "";
    setImmatriculationSaisie(immatVehicule);

    setForm({
      description: item.description || "",
      lieuEntretien: item.lieuEntretien || "",
      dateEntretien: item.dateEntretien || "",
      vehiculeId: item.vehicule?.id ? String(item.vehicule.id) : "",
      pieceJustificativeUrl: item.pieceJustificativeUrl || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ANNULER MODIFICATION (Ajusté pour vider le matricule saisi)
  function cancelEdit() {
    setEditingId(null);
    setImmatriculationSaisie("");
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  // SUPPRESSION
  async function handleDelete(id) {
    if (!canDelete) {
      setError(
        "Vous n'avez pas l'autorisation de supprimer un entretien."
      );
      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer cet entretien ?"
      );

    if (!confirmation) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await client.delete(
        `/entretiens/${id}`
      );

      setSuccess(
        "L'entretien a été supprimé avec succès."
      );

      if (form.vehiculeId) {
        await loadEntretiens(
          form.vehiculeId
        );
      }

    } catch (err) {
      console.error(
        "Erreur suppression entretien :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de supprimer l'entretien."
      );
    }
  }
  // RECHERCHE + TRI
  const filtered = entretiens
    .filter((item) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        item.description
          ?.toLowerCase()
          .includes(searchText) ||

        item.lieuEntretien
          ?.toLowerCase()
          .includes(searchText) ||

        item.dateEntretien
          ?.toLowerCase()
          .includes(searchText)
      );
    })
    .sort((a, b) => {
      let valueA = "";
      let valueB = "";

      switch (sortField) {
        case "dateEntretien":
          valueA =
            a.dateEntretien || "";
          valueB =
            b.dateEntretien || "";
          break;

        case "description":
          valueA =
            a.description || "";
          valueB =
            b.description || "";
          break;

        case "lieuEntretien":
          valueA =
            a.lieuEntretien || "";
          valueB =
            b.lieuEntretien || "";
          break;

        default:
          valueA = "";
          valueB = "";
      }

      if (sortField === "dateEntretien") {
        valueA = valueA
          ? new Date(valueA).getTime()
          : 0;

        valueB = valueB
          ? new Date(valueB).getTime()
          : 0;

      } else {
        valueA =
          String(valueA).toLowerCase();

        valueB =
          String(valueB).toLowerCase();
      }

      if (valueA < valueB) {
        return sortDirection === "asc"
          ? -1
          : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }
  // STYLE
  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";
  // AFFICHAGE
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* TITRE */}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/gestion"
          className="hover:text-haigana-blue transition-colors"
        >
          Gestion
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Entretien
        </span>

      </div>

      <h1 className="text-2xl font-bold text-haigana-dark mb-2">
        Gestion des entretiens
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Enregistrez et gérez les opérations
        d'entretien effectuées sur les véhicules.
      </p>

      {/*FORMULAIRE*/}

      {canCreate || editingId ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-card p-8 space-y-6 mb-8"
        >

          <h2 className="text-lg font-semibold text-haigana-dark">
            {editingId
              ? "Modifier l'entretien"
              : "Nouvel entretien"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* VEHICULE */}

                        {/* SAISIE DU MATRICULE (REMPLACE LE SELECT) */}
            <div>
              <label className={labelClass}>
                Immatriculation du Véhicule *
              </label>

              <input
                type="text"
                required
                list="liste-vehicules-suggestions"
                value={immatriculationSaisie}
                onChange={(e) => handleImmatriculationSaisie(e.target.value)}
                placeholder="Ex : 1234 TBA (Taper le numéro)"
                className={`${inputClass} uppercase font-bold text-haigana-dark`}
              />

              {/* Liste de suggestions automatique pendant la saisie */}
              <datalist id="liste-vehicules-suggestions">
                {vehicules.map((v) => (
                  <option key={v.id} value={v.immatricule}>
                    {v.codeSoa?.codeSoa ? `SOA : ${v.codeSoa.codeSoa}` : "Véhicule répertorié"}
                  </option>
                ))}
              </datalist>

              {form.vehiculeId && (
                <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                  <span>✓</span> Véhicule identifié avec succès (ID : {form.vehiculeId})
                </p>
              )}
            </div>

            {/* DATE */}

            <div>
              <label className={labelClass}>
                Date d'entretien *
              </label>

              <input
                type="date"
                value={form.dateEntretien}
                onChange={(e) =>
                  set(
                    "dateEntretien",
                    e.target.value
                  )
                }
                className={inputClass}
                required
              />
            </div>

            {/* LIEU */}

            <div>
              <label className={labelClass}>
                Lieu d'entretien
              </label>

              <input
                value={form.lieuEntretien}
                onChange={(e) =>
                  set(
                    "lieuEntretien",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="Ex : Garage central"
              />
            </div>

            {/* PIECE JUSTIFICATIVE */}

            <div>
              <label className={labelClass}>
                Pièce justificative
              </label>

              <input
                value={
                  form.pieceJustificativeUrl
                }
                onChange={(e) =>
                  set(
                    "pieceJustificativeUrl",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="URL du document"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className={labelClass}>
                Description *
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  set(
                    "description",
                    e.target.value
                  )
                }
                className={`${inputClass} min-h-[110px] resize-y`}
                placeholder="Décrivez les travaux d'entretien effectués..."
                required
              />

            </div>

          </div>

          {/* MESSAGES */}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          {/* BOUTONS */}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60"
            >
              {submitting
                ? "Enregistrement..."
                : editingId
                ? "Modifier l'entretien"
                : "Ajouter l'entretien"}
            </button>

          </div>

        </form>

      ) : (

        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <p className="text-sm text-gray-500">
            Mode consultation : vous pouvez consulter
            les entretiens, mais vous ne pouvez pas
            les modifier.
          </p>
        </div>

      )}

      {/*RECHERCHE*/}

      {form.vehiculeId && (
        <>
          <SearchSortBar
            search={search}
            onSearchChange={setSearch}
            placeholder="Rechercher un entretien..."
          />

          {/* TRI */}

          <div className="flex flex-wrap items-center gap-3 mb-5 mt-4">

            <span className="text-sm font-medium text-gray-600">
              Trier par :
            </span>

            <select
              value={sortField}
              onChange={(e) => {
                setSortField(
                  e.target.value
                );
                setSortDirection("asc");
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm
                         focus:border-haigana-blue focus:ring-2
                         focus:ring-haigana-blue/20 outline-none"
            >

              <option value="dateEntretien">
                Date d'entretien
              </option>

              <option value="description">
                Description
              </option>

              <option value="lieuEntretien">
                Lieu
              </option>

            </select>

            <button
              type="button"
              onClick={() =>
                setSortDirection(
                  (current) =>
                    current === "asc"
                      ? "desc"
                      : "asc"
                )
              }
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white
                         text-sm font-medium text-haigana-dark
                         hover:bg-gray-50 transition-colors"
            >
              {sortDirection === "asc"
                ? "↑ Croissant"
                : "↓ Décroissant"}
            </button>

            <span className="text-sm text-gray-400">
              {filtered.length} entretien
              {filtered.length > 1
                ? "s"
                : ""}
            </span>

          </div>

          {/* LISTE */}

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-100">

              <h2 className="font-semibold text-haigana-dark">
                Entretiens du véhicule
              </h2>

              <p className="text-sm text-gray-500 mt-1">

                {vehicules.find(
                  (v) =>
                    String(v.id) ===
                    String(form.vehiculeId)
                )?.immatricule ||
                  "Véhicule sélectionné"}

              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-haigana-dark text-white">

                  <tr>

                    <th className="text-left px-4 py-3">
                      Date
                    </th>

                    <th className="text-left px-4 py-3">
                      Description
                    </th>

                    <th className="text-left px-4 py-3">
                      Lieu
                    </th>

                    <th className="text-center px-4 py-3">
                      Justificatif
                    </th>

                    <th className="text-center px-4 py-3">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                      >

                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.dateEntretien
                            ? new Date(
                                item.dateEntretien
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-3">

                          <div className="max-w-md">
                            {item.description ||
                              "-"}
                          </div>

                        </td>

                        <td className="px-4 py-3">
                          {item.lieuEntretien ||
                            "-"}
                        </td>

                        <td className="px-4 py-3 text-center">

                          {item.pieceJustificativeUrl ? (
                            <a
                              href={
                                item.pieceJustificativeUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-haigana-blue font-semibold hover:underline"
                            >
                              Voir
                            </a>
                          ) : (
                            "-"
                          )}

                        </td>

                        <td className="px-4 py-3">

                          <div className="flex justify-center gap-2">

                            {/* MODIFIER */}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-haigana-blue font-semibold hover:bg-blue-50"
                              >
                                Modifier
                              </button>
                            )}

                            {/* SUPPRIMER */}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-red-600 font-semibold hover:bg-red-50"
                              >
                                Supprimer
                              </button>
                            )}

                            {/* CONSULTANT */}

                            {!canEdit &&
                              !canDelete && (
                                <span className="px-3 py-1.5 text-xs font-medium text-gray-400">
                                  Consultation
                                </span>
                              )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                  {filtered.length === 0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        Aucun entretien enregistré
                        pour ce véhicule.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>
        </>
      )}

      {!form.vehiculeId && (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400">
          Sélectionnez un véhicule pour afficher
          ses entretiens.
        </div>
      )}

    </div>
  );
}
