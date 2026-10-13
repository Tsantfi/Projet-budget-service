import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NomenclatureGestion() {
  const { hasRole } = useAuth();

  const [nomenclatures, setNomenclatures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("ajouter");

  // NOVI CHIP : Autorisation partagée pour administrateur et modificateur
  const canModify = hasRole("ADMINISTRATEUR", "MODIFICATEUR");

  const [selectedNomenclature, setSelectedNomenclature] =
    useState(null);

  const [form, setForm] = useState({
    numero: "",
    designation: "",
  });

  // CHARGEMENT

  useEffect(() => {
    chargerNomenclatures();
  }, []);

  const chargerNomenclatures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get(
        "/materiels/nomenclatures/admin"
      );

      setNomenclatures(response.data || []);

    } catch (err) {
      console.error(
        "Erreur chargement nomenclatures :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de charger les nomenclatures."
      );
    } finally {
      setLoading(false);
    }
  };

  // FORMULAIRE

  const ouvrirAjout = () => {
    setMode("ajouter");
    setSelectedNomenclature(null);

    setForm({
      numero: "",
      designation: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const ouvrirModification = (nomenclature) => {
    setMode("modifier");
    setSelectedNomenclature(nomenclature);

    setForm({
      numero: nomenclature.numero ?? "",
      designation: nomenclature.designation || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ENREGISTREMENT

  const enregistrer = async () => {
    setError("");
    setSuccess("");

    const numero = Number(form.numero);
    const designation = form.designation.trim();

    if (!Number.isInteger(numero) || numero <= 0) {
      setError(
        "Le numéro de nomenclature doit être un nombre entier supérieur à zéro."
      );
      return;
    }

    if (!designation) {
      setError(
        "La désignation est obligatoire."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        numero,
        designation,
      };

      if (mode === "ajouter") {
        await client.post(
          "/materiels/nomenclatures",
          payload
        );

        setSuccess(
          "La nomenclature a été créée avec succès."
        );
      } else {
        await client.put(
          `/materiels/nomenclatures/${selectedNomenclature.id}`,
          payload
        );

        setSuccess(
          "La nomenclature a été modifiée avec succès."
        );
      }

      setShowModal(false);

      await chargerNomenclatures();

    } catch (err) {
      console.error(
        "Erreur nomenclature :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible d'enregistrer la nomenclature."
      );
    } finally {
      setSaving(false);
    }
  };

  // ACTIVATION / DESACTIVATION

  const changerStatut = async (nomenclature) => {
    const action =
      nomenclature.actif
        ? "désactiver"
        : "réactiver";

    const confirmation = window.confirm(
      `Voulez-vous ${action} la nomenclature "${nomenclature.numero} - ${nomenclature.designation}" ?`
    );

    if (!confirmation) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (nomenclature.actif) {
        await client.delete(
          `/materiels/nomenclatures/${nomenclature.id}`
        );
      } else {
        await client.put(
          `/materiels/nomenclatures/${nomenclature.id}/activer`
        );
      }

      setSuccess(
        `La nomenclature a été ${action === "désactiver" ? "désactivée" : "réactivée"} avec succès.`
      );

      await chargerNomenclatures();

    } catch (err) {
      console.error(
        "Erreur changement statut :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de modifier le statut."
      );
    } finally {
      setSaving(false);
    }
  };

  // FILTRE

  const nomenclaturesFiltrees = useMemo(() => {
    const terme =
      search.trim().toLowerCase();

    if (!terme) {
      return nomenclatures;
    }

    return nomenclatures.filter(
      (nomenclature) =>
        String(
          nomenclature.numero
        )
          .toLowerCase()
          .includes(terme) ||
        nomenclature.designation
          ?.toLowerCase()
          .includes(terme)
    );
  }, [nomenclatures, search]);

  // RENDU

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="max-w-6xl mx-auto">

        {/*  BREADCRUMB */}

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>

          <span>/</span>

          <span className="text-haigana-dark font-medium">
            Nomenclatures
          </span>

        </div>

        {/*  TITRE */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-6
          "
        >

          <div>

            <h1
              className="
                text-2xl
                md:text-3xl
                font-bold
                text-haigana-dark
              "
            >
              Gestion des nomenclatures
            </h1>

            <p
              className="
                text-sm
                text-gray-500
                mt-1
              "
            >
              Référentiel utilisé pour classer les matériels.
            </p>

          </div>

          {hasRole("ADMINISTRATEUR") && (
            <button
              type="button"
              onClick={ouvrirAjout}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                bg-haigana-blue
                text-white
                font-semibold
                hover:brightness-95
                transition
              "
            >
              <span className="text-lg">
                +
              </span>

              Ajouter une nomenclature
            </button>
          )}

        </div>

        {/*  MESSAGES */}

        {error && (
          <div
            className="
              mb-4
              p-4
              rounded-xl
              bg-red-50
              border
              border-red-200
              text-red-700
              text-sm
              font-medium
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              mb-4
              p-4
              rounded-xl
              bg-green-50
              border
              border-green-200
              text-green-700
              text-sm
              font-medium
            "
          >
            {success}
          </div>
        )}

        {/*  RECHERCHE */}

        <div
          className="
            bg-white
            p-5
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            mb-6
          "
        >

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher par numéro ou désignation..."
            className="
              w-full
              px-4
              py-3
              rounded-xl
              bg-gray-50
              border
              border-gray-200
              outline-none
              focus:border-haigana-blue
              focus:ring-2
              focus:ring-haigana-blue/20
            "
          />

        </div>

        {/*  TABLEAU */}

        <div
          className="
            bg-white
            rounded-2xl
            border
            border-gray-100
            shadow-sm
            overflow-hidden
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left">

              <thead
                className="
                  bg-gray-50
                  border-b
                  border-gray-200
                  text-gray-500
                  font-bold
                  uppercase
                  text-xs
                "
              >

                <tr>

                  <th className="px-6 py-4">
                    Numéro
                  </th>

                  <th className="px-6 py-4">
                    Désignation
                  </th>

                  <th className="px-6 py-4 text-center">
                    Statut
                  </th>

                  {canModify && (
                    <th className="px-6 py-4 text-right">
                      Actions
                    </th>
                  )}

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan={
                        hasRole("ADMINISTRATEUR")
                          ? 4
                          : 3
                      }
                      className="
                        px-6
                        py-14
                        text-center
                        text-gray-400
                      "
                    >
                      Chargement des nomenclatures...
                    </td>

                  </tr>

                ) : nomenclaturesFiltrees.length === 0 ? (

                  <tr>

                    <td
                      colSpan={
                        hasRole("ADMINISTRATEUR")
                          ? 4
                          : 3
                      }
                      className="
                        px-6
                        py-14
                        text-center
                        text-gray-400
                      "
                    >
                      Aucune nomenclature trouvée.
                    </td>

                  </tr>

                ) : (

                  nomenclaturesFiltrees.map(
                    (nomenclature) => (

                      <tr
                        key={nomenclature.id}
                        className="
                          hover:bg-gray-50/60
                          transition
                        "
                      >

                        <td
                          className="
                            px-6
                            py-4
                            font-bold
                            text-haigana-dark
                          "
                        >
                          {nomenclature.numero}
                        </td>

                        <td
                          className="
                            px-6
                            py-4
                            font-medium
                            text-gray-700
                          "
                        >
                          {nomenclature.designation}
                        </td>

                        <td className="px-6 py-4 text-center">

                          <span
                            className={`
                              inline-flex
                              px-2.5
                              py-1
                              rounded-lg
                              border
                              text-xs
                              font-bold
                              ${
                                nomenclature.actif
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-500 border-gray-200"
                              }
                            `}
                          >
                            {nomenclature.actif
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                          <td
                            className="
                              px-6
                              py-4
                              text-right
                            "
                          >

                            <div
                              className="
                                flex
                                justify-end
                                gap-2
                              "
                            >
                            {canModify && (
                              <button
                                type="button"
                                onClick={() =>
                                  ouvrirModification(
                                    nomenclature
                                  )
                                }
                                className="
                                  px-3
                                  py-2
                                  rounded-lg
                                  bg-gray-50
                                  text-gray-600
                                  border
                                  border-gray-200
                                  text-xs
                                  font-semibold
                                  hover:bg-gray-100
                                "
                              >
                                Modifier
                              </button>
                            )}

                            {(hasRole("ADMINISTRATEUR") && (
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  changerStatut(
                                    nomenclature
                                  )
                                }
                                className={`
                                  px-3
                                  py-2
                                  rounded-lg
                                  text-xs
                                  font-semibold
                                  border
                                  ${
                                    nomenclature.actif
                                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  }
                                `}
                              >
                                {nomenclature.actif
                                  ? "Désactiver"
                                  : "Réactiver"}
                              </button>
                              ))}
                            </div>
                          </td>

                      </tr>
                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/*  MODALE */}

        {showModal && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/40
              flex
              items-center
              justify-center
              p-4
            "
          >

            <div
              className="
                bg-white
                w-full
                max-w-lg
                rounded-2xl
                shadow-2xl
                overflow-hidden
              "
            >

              <div
                className="
                  px-6
                  py-4
                  border-b
                  border-gray-100
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                      text-xl
                      font-bold
                      text-haigana-dark
                    "
                  >
                    {mode === "ajouter"
                      ? "Ajouter une nomenclature"
                      : "Modifier la nomenclature"}
                  </h2>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                    "
                  >
                    Référence du matériel
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="
                    text-gray-400
                    hover:text-gray-700
                    text-xl
                  "
                >
                  ×
                </button>

              </div>

              <div className="p-6 space-y-4">

                <div
                  className="
                    bg-gray-50
                    rounded-xl
                    p-4
                  "
                >

                  <label
                    className="
                      block
                      text-xs
                      text-gray-500
                      mb-2
                    "
                  >
                    Numéro de nomenclature *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.numero}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        numero: e.target.value,
                      }))
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      outline-none
                      focus:border-haigana-blue
                      focus:ring-2
                      focus:ring-haigana-blue/20
                    "
                    placeholder="Ex : 3"
                  />

                </div>

                <div
                  className="
                    bg-gray-50
                    rounded-xl
                    p-4
                  "
                >

                  <label
                    className="
                      block
                      text-xs
                      text-gray-500
                      mb-2
                    "
                  >
                    Désignation *
                  </label>

                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        designation:
                          e.target.value,
                      }))
                    }
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      outline-none
                      focus:border-haigana-blue
                      focus:ring-2
                      focus:ring-haigana-blue/20
                    "
                    placeholder="Ex : Matériel informatique"
                  />

                </div>

              </div>

              <div
                className="
                  px-6
                  py-4
                  border-t
                  border-gray-100
                  flex
                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-gray-200
                    text-gray-600
                    font-semibold
                    hover:bg-gray-50
                  "
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={enregistrer}
                  disabled={saving}
                  className="
                    px-6
                    py-2.5
                    rounded-xl
                    bg-haigana-blue
                    text-white
                    font-semibold
                    hover:brightness-95
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Enregistrement..."
                    : mode === "ajouter"
                      ? "Ajouter"
                      : "Enregistrer"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}