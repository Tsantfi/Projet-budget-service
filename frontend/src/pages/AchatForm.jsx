import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AchatForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const isEdit = Boolean(id);

  const [entrees, setEntrees] = useState([]);

  const [form, setForm] = useState({
    dateAchat: "",
    sommePayer: "",
    entreeId: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  // CHARGEMENT
  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoadingData(true);
    setError("");

    try {
      const entreesResponse =
        await client.get("/entrees");

      setEntrees(
        Array.isArray(entreesResponse.data)
          ? entreesResponse.data
          : []
      );


      // MODIFICATION


      if (isEdit) {
        const achatResponse =
          await client.get(`/achats/${id}`);

        const achat = achatResponse.data;

        setForm({
          dateAchat:
            achat.dateAchat || "",

          sommePayer:
            achat.sommePayer ?? "",

          // IMPORTANT :
          // AchatResponse utilise entreeId
          entreeId:
            achat.entreeId ??
            "",
        });

      }


      // CREATION


      else {
        const entreeId =
          searchParams.get("entreeId");

        setForm((prev) => ({
          ...prev,

          entreeId:
            entreeId || "",

          dateAchat:
            new Date()
              .toISOString()
              .split("T")[0],
        }));
      }

    } catch (err) {
      console.error(
        "Erreur chargement achat :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les données."
      );

    } finally {
      setLoadingData(false);
    }
  }
  // CHANGEMENT
  function handleChange(e) {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }
  // ENREGISTREMENT
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");


    // ENTREE


    if (!form.entreeId) {
      setError(
        "Veuillez sélectionner une entrée."
      );
      return;
    }


    // DATE


    if (!form.dateAchat) {
      setError(
        "La date d'achat est obligatoire."
      );
      return;
    }


    // SOMME


    if (
      form.sommePayer === "" ||
      form.sommePayer === null ||
      form.sommePayer === undefined ||
      Number.isNaN(
        Number(form.sommePayer)
      ) ||
      Number(form.sommePayer) <= 0
    ) {
      setError(
        "Veuillez saisir une somme valide supérieure à zéro."
      );
      return;
    }

    setLoading(true);


    // PAYLOAD


    const payload = {
      dateAchat:
        form.dateAchat,

      sommePayer:
        Number(form.sommePayer),

      entree: {
        id: Number(form.entreeId),
      },
    };

    console.log(
      "=== ACHAT PAYLOAD ==="
    );

    console.log(payload);

    try {


      // MODIFICATION


      if (isEdit) {

        await client.put(
          `/achats/${id}`,
          payload
        );

      }


      // CREATION


      else {

        await client.post(
          "/achats",
          payload
        );

      }


      // RETOUR LISTE


      navigate(
        "/patrimoine/achats"
      );

    } catch (err) {

      console.error(
        "Erreur enregistrement achat :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          err.message ||
          "Impossible d'enregistrer l'achat."
      );

    } finally {
      setLoading(false);
    }
  }
  // FORMAT MONTANT
  function formatMontant(value) {
    return `${Number(
      value || 0
    ).toLocaleString("fr-FR")} Ar`;
  }
  // CHARGEMENT
  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-400">
        Chargement...
      </div>
    );
  }
  // AUTORISATION
  if (
    !hasRole(
      "ADMINISTRATEUR",
      "MODIFICATEUR"
    )
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">

        <div className="bg-red-50 text-red-600 rounded-lg p-4">
          Vous n'avez pas l'autorisation de modifier les achats.
        </div>

      </div>
    );
  }
  // AFFICHAGE
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        {isEdit
          ? "Modifier l'achat"
          : "Nouvel achat"}
      </h1>

      {/*ERREUR*/}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/*FORMULAIRE*/}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-6 space-y-5"
      >

        {/*ENTREE*/}

        <div>

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Entrée *
          </label>

          <select
            name="entreeId"
            value={form.entreeId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none bg-white"
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

        </div>

        {/*DATE*/}

        <div>

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Date d'achat *
          </label>

          <input
            type="date"
            name="dateAchat"
            value={form.dateAchat}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />

        </div>

        {/*SOMME*/}

        <div>

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Somme payée (Ar) *
          </label>

          <input
            type="number"
            name="sommePayer"
            value={form.sommePayer}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            placeholder="Ex : 150000000"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
          />

          {form.sommePayer !== "" && (
            <p className="mt-1 text-xs text-gray-500">
              {formatMontant(
                form.sommePayer
              )}
            </p>
          )}

        </div>

        {/*RESUME*/}

        <div className="rounded-lg bg-haigana-bg/50 p-4">

          <p className="text-sm text-gray-500">
            Montant de l'achat
          </p>

          <p className="text-xl font-bold text-haigana-dark mt-1">
            {formatMontant(
              form.sommePayer
            )}
          </p>

        </div>

        {/*BOUTONS*/}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/patrimoine/achats"
              )
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
                : "Créer l'achat"}

          </button>

        </div>

      </form>

    </div>
  );
}
