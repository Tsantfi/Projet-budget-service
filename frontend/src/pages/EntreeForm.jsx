import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function EntreeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const isEdit = Boolean(id);

  const [vehicules, setVehicules] = useState([]);
  const [form, setForm] = useState({
    reference: "",
    dateEntree: "",
    type: "",
    vehiculeId: "",
    pieceJustificativeUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoadingData(true);
    setError("");

    try {
      const vehiculesResponse = await client.get("/vehicules");
      setVehicules(vehiculesResponse.data);

      if (isEdit) {
        const entreeResponse = await client.get(`/entrees/${id}`);
        const entree = entreeResponse.data;

        setForm({
          reference: entree.reference || "",
          dateEntree: entree.dateEntree || "",
          type: entree.type || "",
          vehiculeId: entree.vehicule?.id || "",
          pieceJustificativeUrl:
            entree.pieceJustificativeUrl || "",
        });
      } else {
        const vehiculeId = searchParams.get("vehiculeId");

        setForm((prev) => ({
          ...prev,
          vehiculeId: vehiculeId || "",
          dateEntree: new Date()
            .toISOString()
            .split("T")[0],
        }));
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoadingData(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.vehiculeId) {
      setError("Veuillez sélectionner un véhicule.");
      return;
    }

    if (!form.dateEntree) {
      setError("La date d'entrée est obligatoire.");
      return;
    }

    if (!form.type) {
      setError("Le type de prise en charge est obligatoire.");
      return;
    }

    setLoading(true);

    const payload = {
      reference: form.reference || null,
      dateEntree: form.dateEntree,
      type: form.type,
      vehicule: {
        id: Number(form.vehiculeId),
      },
      pieceJustificativeUrl:
        form.pieceJustificativeUrl || null,
    };

    try {
      if (isEdit) {
        await client.put(`/entrees/${id}`, payload);
      } else {
        await client.post("/entrees", payload);
      }

      navigate("/patrimoine/entrees");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible d'enregistrer l'entrée."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-400">
        Chargement...
      </div>
    );
  }

  if (
    !hasRole("ADMINISTRATEUR", "MODIFICATEUR")
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-50 text-red-600 rounded-lg p-4">
          Vous n'avez pas l'autorisation de modifier les entrées.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        {isEdit ? "Modifier l'entrée" : "Nouvelle entrée"}
      </h1>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-6 space-y-5"
      >

        {/* REFERENCE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Référence
          </label>

          <input
            type="text"
            name="reference"
            value={form.reference}
            onChange={handleChange}
            placeholder="Ex : ENT-2026-001"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />
        </div>

        {/* DATE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Date d'entrée *
          </label>

          <input
            type="date"
            name="dateEntree"
            value={form.dateEntree}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />
        </div>

        {/* TYPE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Type de prise en charge *
          </label>

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none bg-white"
          >
            <option value="">
              Sélectionner un type
            </option>

            <option value="ACHAT">
              Achat
            </option>

            <option value="DON">
              Don
            </option>

            <option value="AFFECTATION">
              Affectation
            </option>
          </select>
        </div>

        {/* VEHICULE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Véhicule *
          </label>

          <select
            name="vehiculeId"
            value={form.vehiculeId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none bg-white"
          >
            <option value="">
              Sélectionner un véhicule
            </option>

            {vehicules.map((vehicule) => (
              <option
                key={vehicule.id}
                value={vehicule.id}
              >
                {vehicule.immatricule || `Véhicule #${vehicule.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* PIECE JUSTIFICATIVE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Pièce justificative
          </label>

          <input
            type="text"
            name="pieceJustificativeUrl"
            value={form.pieceJustificativeUrl}
            onChange={handleChange}
            placeholder="URL de la pièce justificative"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />
        </div>

        {/* BOUTONS */}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

          <button
            type="button"
            onClick={() =>
              navigate("/patrimoine/entrees")
            }
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all disabled:opacity-50"
          >
            {loading
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer l'entrée"}
          </button>

        </div>

      </form>
    </div>
  );
}
