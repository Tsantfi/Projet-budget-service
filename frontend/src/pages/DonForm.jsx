import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const isEdit = Boolean(id);

  const [entrees, setEntrees] = useState([]);

  const [form, setForm] = useState({
    dateDon: "",
    sommeRenverser: "",
    entreeId: "",
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
      const entreesResponse =
        await client.get("/entrees");

      setEntrees(entreesResponse.data);

      if (isEdit) {
        const donResponse =
          await client.get(`/dons/${id}`);

        const don = donResponse.data;

        setForm({
          dateDon: don.dateDon || "",
          sommeRenverser:
            don.sommeRenverser ?? "",
          entreeId:
            don.entreeId || "",
        });
      } else {
        const entreeId =
          searchParams.get("entreeId");

        setForm((prev) => ({
          ...prev,
          entreeId: entreeId || "",
          dateDon: new Date()
            .toISOString()
            .split("T")[0],
        }));
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les données."
      );
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

    if (!form.entreeId) {
      setError(
        "Veuillez sélectionner une entrée."
      );
      return;
    }

    if (!form.dateDon) {
      setError(
        "La date du don est obligatoire."
      );
      return;
    }

    if (
      form.sommeRenverser === "" ||
      Number(form.sommeRenverser) < 0
    ) {
      setError(
        "Veuillez saisir une somme valide."
      );
      return;
    }

    setLoading(true);

    const payload = {
      dateDon: form.dateDon,
      sommeRenverser: Number(
        form.sommeRenverser
      ),
      entree: {
        id: Number(form.entreeId),
      },
    };

    try {
      if (isEdit) {
        await client.put(
          `/dons/${id}`,
          payload
        );
      } else {
        await client.post(
          "/dons",
          payload
        );
      }

      navigate("/patrimoine/dons");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible d'enregistrer le don."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatMontant(value) {
    return `${Number(
      value || 0
    ).toLocaleString("fr-FR")} Ar`;
  }

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-400">
        Chargement...
      </div>
    );
  }

  if (
    !hasRole(
      "ADMINISTRATEUR",
      "MODIFICATEUR"
    )
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">

        <div className="bg-red-50 text-red-600 rounded-lg p-4">
          Vous n'avez pas l'autorisation de gérer les dons.
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* TITRE */}

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        {isEdit
          ? "Modifier le don"
          : "Nouveau don"}
      </h1>

      {/* ERREUR */}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-6 space-y-5"
      >

        {/* ENTREE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Entrée *
          </label>

          <select
            name="entreeId"
            value={form.entreeId}
            onChange={handleChange}
            required
            disabled={isEdit}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              Sélectionner une entrée
            </option>

            {entrees.map((entree) => (
              <option
                key={entree.id}
                value={entree.id}
              >
                {entree.reference
                  ? entree.reference
                  : `Entrée #${entree.id}`}

                {entree.vehicule?.immatricule
                  ? ` — ${entree.vehicule.immatricule}`
                  : ""}
              </option>
            ))}
          </select>

          {isEdit && (
            <p className="mt-1 text-xs text-gray-400">
              L'entrée ne peut pas être modifiée.
            </p>
          )}
        </div>

        {/* DATE */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Date du don *
          </label>

          <input
            type="date"
            name="dateDon"
            value={form.dateDon}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />
        </div>

        {/* SOMME */}

        <div>
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Somme reversée (Ar) *
          </label>

          <input
            type="number"
            name="sommeRenverser"
            value={form.sommeRenverser}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="Ex : 150000000"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />

          {form.sommeRenverser !== "" && (
            <p className="mt-1 text-xs text-gray-500">
              {formatMontant(
                form.sommeRenverser
              )}
            </p>
          )}
        </div>

        {/* RESUME */}

        <div className="rounded-lg bg-haigana-bg/50 p-4">

          <p className="text-sm text-gray-500">
            Somme reversée
          </p>

          <p className="text-xl font-bold text-haigana-dark mt-1">
            {formatMontant(
              form.sommeRenverser
            )}
          </p>

        </div>

        {/* BOUTONS */}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

          <button
            type="button"
            onClick={() =>
              navigate("/patrimoine/dons")
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
                : "Créer le don"}
          </button>

        </div>

      </form>
    </div>
  );
}
