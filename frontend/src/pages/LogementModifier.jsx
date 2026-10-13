import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  min
}) {
  return (
    <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
    </label>

    <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        min={min}
        className="w-full px-4 py-3 rounded-xl
        border border-gray-200 bg-white
        focus:outline-none focus:ring-2
        focus:ring-haigana-blue/20
        focus:border-haigana-blue transition"
/>
    </div>
  );
}

export default function LogementModifier() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const codeSoa =
    searchParams.get("codeSoa") || "";

  const annee =
    searchParams.get("annee") || "";

  const { hasRole } = useAuth();

  const canModify = hasRole(
    "ADMINISTRATEUR",
    "MODIFICATEUR"
  );

  const [form, setForm] = useState({
    numero: "",
    nomBatiment: "",
    nature: "",
    entiteUtilisatrice: "",
    occupant: "",
    etatBatisse: "",
    localite: "",
    adressePointRepere: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!canModify) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const response =
          await client.get(
            `/logements/${id}`
          );

        const logement =
          response.data;

        setForm({
          numero:
            logement.numero ?? "",
          nomBatiment:
            logement.nomBatiment || "",
          nature:
            logement.nature || "",
          entiteUtilisatrice:
            logement.entiteUtilisatrice || "",
          occupant:
            logement.occupant || "",
          etatBatisse:
            logement.etatBatisse || "",
          localite:
            logement.localite || "",
          adressePointRepere:
            logement.adressePointRepere || "",
        });
      } catch (err) {
        console.error(
          "Erreur chargement logement :",
          err
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Impossible de charger le logement."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, canModify]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validate() {
  if (
    form.numero !== "" &&
    Number(form.numero) < 1
  ) {
    return "Le numéro doit être supérieur ou égal à 1.";
  }

  const fields = [
    ["nomBatiment", "Nom du bâtiment"],
    ["nature", "Nature"],
    ["entiteUtilisatrice", "Entité utilisatrice"],
    ["etatBatisse", "État de la bâtisse"],
    ["localite", "Localité"],
    ["adressePointRepere", "Adresse et point de repère"],
  ];

  for (const [field, label] of fields) {
    if (!String(form[field] ?? "").trim()) {
      return `Le champ "${label}" est obligatoire.`;
    }
  }

  return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canModify) {
      setError(
        "Vous n'avez pas l'autorisation de modifier ce logement."
      );
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        numero:
          form.numero === ""
            ? null
            : Number(form.numero),

        nomBatiment:
          form.nomBatiment.trim(),

        nature:
          form.nature.trim(),

        entiteUtilisatrice:
          form.entiteUtilisatrice.trim(),

        occupant:
          form.occupant.trim() || null,

        etatBatisse:
          form.etatBatisse.trim(),

        localite:
          form.localite.trim(),

        adressePointRepere:
          form.adressePointRepere.trim(),
      };

      await client.put(
        `/logements/${id}`,
        payload
      );

      setSuccess(
        "Logement modifié avec succès."
      );

      setTimeout(() => {
        navigate(
          `/patrimoine/logement/${id}/consultation`
        );
      }, 700);
    } catch (err) {
      console.error(
        "Erreur modification logement :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de modifier le logement."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!canModify) {
    return (
      <div className="min-h-screen bg-haigana-bg p-6">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-2xl shadow-card p-10 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl mb-5">
              !
            </div>

            <h1 className="text-2xl font-bold text-haigana-dark">
              Accès refusé
            </h1>

            <p className="text-gray-500 mt-2">
              Votre profil ne permet pas de modifier
              un logement.
            </p>

            <Link
              to="/patrimoine/logement"
              className="inline-block mt-6 px-5 py-3
                        rounded-xl bg-haigana-dark
                        text-white font-medium
                        hover:bg-haigana-blue transition"
            >
              Retour aux logements
            </Link>

          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-haigana-bg p-6">

        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-card p-10 text-center text-gray-500">
          Chargement du logement...
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-haigana-bg p-6">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="bg-gradient-to-br from-haigana-dark to-haigana-blue rounded-3xl p-7 text-white shadow-lg">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-white/70 text-sm">
                PATRIMOINE / LOGEMENT
              </p>

              <h1 className="text-3xl font-bold">
                Modifier un logement
              </h1>

              <p className="text-white/80 mt-2">
                Mise à jour de la fiche patrimoniale.
              </p>
            </div>

            <Link
            to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
              codeSoa
            )}&annee=${annee}`}
              className="px-5 py-3 rounded-xl
              bg-white/10 hover:bg-white/20
              transition font-medium"
            >
              ← Retour
            </Link>

          </div>
        </div>

        {/* FORMULAIRE */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-card p-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Field
              label="Numéro"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              type="number"
              min="1"
            />

            <Field
              label="Nom du bâtiment"
              name="nomBatiment"
              value={form.nomBatiment}
              onChange={handleChange}
            />

            <Field
              label="Nature"
              name="nature"
              value={form.nature}
              onChange={handleChange}
            />

            <Field
              label="Entité utilisatrice"
              name="entiteUtilisatrice"
              value={form.entiteUtilisatrice}
              onChange={handleChange}
            />

            <Field
              label="Occupant"
              name="occupant"
              value={form.occupant}
              onChange={handleChange}
            />

            <Field
              label="État de la bâtisse"
              name="etatBatisse"
              value={form.etatBatisse}
              onChange={handleChange}
            />

            <Field
              label="Localité"
              name="localite"
              value={form.localite}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse et point de repère
              </label>

              <textarea
                name="adressePointRepere"
                value={
                  form.adressePointRepere
                }
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl
                border border-gray-200
                focus:outline-none
                focus:ring-2
                focus:ring-haigana-blue/20
                focus:border-haigana-blue
                resize-none"
              />
            </div>

          </div>

          {/* MESSAGES */}
          {error && (
            <div className="mt-6 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 px-5 py-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap justify-end gap-3">

            <Link
              to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
                codeSoa
              )}&annee=${annee}`}
              className="px-6 py-3 rounded-xl
                        border border-gray-200
                        text-gray-700 font-medium
                        hover:bg-gray-50 transition"
            >
              Annuler
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl
                        bg-haigana-dark text-white
                        font-medium hover:bg-haigana-blue
                        transition disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
