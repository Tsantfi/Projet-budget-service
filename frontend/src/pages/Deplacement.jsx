import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  dateDeplacement: "",
  lieuDepart: "",
  lieuArrivee: "",
  dateFinParcours: "",
  tableKilometrique: "",
  ordreSortie: "AFFECTATION",
};

export default function Deplacement() {

  const { id } = useParams();
  const { hasRole } = useAuth();

  const [vehicule, setVehicule] = useState(null);
  const [deplacements, setDeplacements] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CHARGEMENT VEHICULE

  async function loadVehicule() {

    try {

      const response = await client.get(
        `/vehicules/${id}`
      );

      setVehicule(response.data);

    } catch (err) {

      console.error(err);

      setError(
        "Impossible de charger le véhicule."
      );
    }
  }

  function allerAuKilometrage() {
    navigate(`/patrimoine/vehicule/${id}/kilometrage`);
  }


  // CHARGEMENT DEPLACEMENTS


  async function loadDeplacements() {

    try {

      const response = await client.get(
        `/deplacements?vehiculeId=${id}`
      );

      setDeplacements(response.data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Impossible de charger les déplacements."
      );
    }
  }

  useEffect(() => {

    loadVehicule();
    loadDeplacements();

  }, [id]);


  // FORMULAIRE


  function set(field, value) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAjouter() {

    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setError("");
    setFormOpen(true);
  }

  function openModifier(item) {

    setEditingId(item.id);

    setForm({
      dateDeplacement:
        item.dateDeplacement || "",

      lieuDepart:
        item.lieuDepart || "",

      lieuArrivee:
        item.lieuArrivee || "",

      dateFinParcours:
        item.dateFinParcours || "",

      tableKilometrique:
        item.tableKilometrique ?? "",

      ordreSortie:
        item.ordreSortie || "AFFECTATION",
    });

    setError("");
    setFormOpen(true);
  }


  // ENREGISTREMENT


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {

      const payload = {

        vehicule: {
          id: Number(id),
        },

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
          form.ordreSortie,
      };

      if (editingId) {

        await client.put(
          `/deplacements/${editingId}`,
          payload
        );

      } else {

        await client.post(
          "/deplacements",
          payload
        );
      }

      setFormOpen(false);
      setEditingId(null);
      setForm({
        ...emptyForm,
      });

      await loadDeplacements();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement."
      );

    } finally {

      setSubmitting(false);
    }
  }


  // SUPPRESSION


  async function handleSupprimer(item) {

    const confirmation = window.confirm(
      "Voulez-vous supprimer ce déplacement ?"
    );

    if (!confirmation) {
      return;
    }

    try {

      setError("");

      await client.delete(
        `/deplacements/${item.id}`
      );

      setDeplacements((current) =>
        current.filter(
          (d) => d.id !== item.id
        )
      );

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Impossible de supprimer le déplacement."
      );
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none transition-all";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/*TITRE*/}
      

      {/*TITRE + ACTIONS*/}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        {/* TITRE */}

        <div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Déplacements
          </h1>

          {vehicule && (
            <p className="text-sm text-gray-500 mt-1">
              Véhicule :{" "}
              <span className="font-medium text-haigana-dark">
                {vehicule.immatricule}
              </span>
            </p>
          )}

        </div>

        {/* BOUTONS */}

        <div className="flex flex-wrap items-center gap-3">
          {/* AJOUTER */}

          {hasRole(
            "ADMINISTRATEUR",
            "MODIFICATEUR"
          ) && (

            <button
              type="button"
              onClick={openAjouter}
              className="
                inline-flex
                items-center
                justify-center
                px-5
                py-2.5
                rounded-lg
                bg-haigana-gold
                text-haigana-dark
                font-semibold
                shadow-md
                hover:brightness-95
                transition-all
                cursor-pointer
              "
            >
              Ajouter un déplacement
            </button>

          )}

        </div>

      </div>

      {/* =========================
          ERREUR===== */}

      {error && (

        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>

      )}

      {/* =========================
          TABLEAU===== */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-dark text-white">

              <tr>

                <th className="text-left px-4 py-3">
                  Date départ
                </th>

                <th className="text-left px-4 py-3">
                  Lieu départ
                </th>

                <th className="text-left px-4 py-3">
                  Lieu arrivée
                </th>

                <th className="text-left px-4 py-3">
                  Date fin
                </th>

                <th className="text-right px-4 py-3">
                  Km
                </th>

                <th className="text-left px-4 py-3">
                  Type
                </th>

                <th className="text-right px-4 py-3">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {deplacements.map((item) => (

                <tr
                  key={item.id}
                  className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                >

                  <td className="px-4 py-3">
                    {item.dateDeplacement || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {item.lieuDepart || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {item.lieuArrivee || "-"}
                  </td>

                  <td className="px-4 py-3">
                    {item.dateFinParcours || "-"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {item.tableKilometrique != null
                      ? `${Number(
                          item.tableKilometrique
                        ).toLocaleString("fr-FR")} km`
                      : "-"}
                  </td>

                  <td className="px-4 py-3">

                    <span
                      className={
                        item.ordreSortie === "CONDEMNATION"
                          ? "px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700"
                          : "px-2.5 py-1 rounded-full text-xs bg-haigana-blue/10 text-haigana-blue"
                      }
                    >
                      {item.ordreSortie || "-"}
                    </span>

                  </td>

                  <td className="px-4 py-3 text-right space-x-4">

                    {hasRole(
                      "ADMINISTRATEUR",
                      "MODIFICATEUR"
                    ) && (

                      <button
                        onClick={() =>
                          openModifier(item)
                        }
                        className="text-haigana-blue hover:text-haigana-dark font-medium"
                      >
                        Modifier
                      </button>

                    )}

                    {hasRole("ADMINISTRATEUR") && (

                      <button
                        onClick={() =>
                          handleSupprimer(item)
                        }
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer
                      </button>

                    )}

                  </td>

                </tr>

              ))}

              {deplacements.length === 0 && (

                <tr>

                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Aucun déplacement enregistré pour ce véhicule.
                  </td>

                </tr>

              )}

            </tbody>

            {/* TOTAL */}

            {deplacements.length > 0 && (

              <tfoot>

                <tr className="border-t-2 border-gray-200 bg-haigana-bg/40">

                  <td
                    colSpan={6}
                    className="px-4 py-4 text-right font-semibold text-haigana-dark"
                  >
                    Total des déplacements :
                  </td>

                  <td className="px-4 py-4 text-right font-semibold text-haigana-dark">
                    {deplacements.length}
                  </td>

                </tr>

              </tfoot>

            )}

          </table>

        </div>
      </div>

      {/* =========================
          MODALE===== */}

      {formOpen && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setFormOpen(false)}
        >

          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
          >

            <h3 className="font-semibold text-haigana-dark text-lg mb-5">

              {editingId
                ? "Modifier le déplacement"
                : "Ajouter un déplacement"}

            </h3>

            {/* DATE DEPART */}

            <label className={labelClass}>
              Date de départ
            </label>

            <input
              type="date"
              value={form.dateDeplacement}
              onChange={(e) =>
                set(
                  "dateDeplacement",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
            />

            {/* LIEU DEPART */}

            <label className={labelClass}>
              Lieu de départ
            </label>

            <input
              value={form.lieuDepart}
              onChange={(e) =>
                set(
                  "lieuDepart",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : Mahajanga"
              required
            />

            {/* LIEU ARRIVEE */}

            <label className={labelClass}>
              Lieu d'arrivée
            </label>

            <input
              value={form.lieuArrivee}
              onChange={(e) =>
                set(
                  "lieuArrivee",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : Antananarivo"
              required
            />

            {/* DATE FIN */}

            <label className={labelClass}>
              Date de fin du parcours
            </label>

            <input
              type="date"
              value={form.dateFinParcours}
              onChange={(e) =>
                set(
                  "dateFinParcours",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
            />

            {/* KILOMETRAGE */}

            <label className={labelClass}>
              Table kilométrique
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tableKilometrique}
              onChange={(e) =>
                set(
                  "tableKilometrique",
                  e.target.value
                )
              }
              className={`${inputClass} mb-4`}
              placeholder="Ex : 350"
            />

            {/* TYPE SORTIE */}

            <label className={labelClass}>
              Type de sortie
            </label>

            <select
              value={form.ordreSortie}
              onChange={(e) =>
                set(
                  "ordreSortie",
                  e.target.value
                )
              }
              className={`${inputClass} bg-white`}
            >

              <option value="AFFECTATION">
                Affectation
              </option>

              <option value="CONDAMNATION">
                Condamnation
              </option>

            </select>

            {/* BOUTONS */}

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
                className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-haigana-dark text-white font-semibold disabled:opacity-60"
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

    </div>
  );
}