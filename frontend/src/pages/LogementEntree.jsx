import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";



const EMPTY_FORM = {
  numero: "",
  nomBatiment: "",
  nature: "",
  entiteUtilisatrice: "",
  occupant: "",
  etatBatisse: "",
  localite: "",
  adressePointRepere: "",
  dateEntree: "",
  type: "ACHAT",
  pieceJustificativeUrl: "",
  ordreEntree: "",
  facture: "",
  pvEvaluation: "",
  nomPersonneSortie: "",
  cinPersonneSortie: "",
  serviceSortie: "",
  nomPersonneEntree: "",
  cinPersonneEntree: "",
  serviceEntree: "",
};

const LABELS = {
  numero: "Numéro",
  nomBatiment: "Nom du bâtiment",
  nature: "Nature",
  entiteUtilisatrice: "Entité utilisatrice",
  occupant: "Occupant",
  etatBatisse: "État de la bâtisse",
  localite: "Localité",
  adressePointRepere: "Adresse et point de repère",
  dateEntree: "Date d'entrée",
};

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
  max
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
        focus:outline-none focus:ring-2 focus:ring-haigana-blue/20
        focus:border-haigana-blue transition"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        rows={3}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white
                   focus:outline-none focus:ring-2 focus:ring-haigana-blue/20
                   focus:border-haigana-blue transition resize-none"
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 bg-haigana-bg/60 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-haigana-dark">
          {title}
        </h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

export default function LogementEntree() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const canModify = hasRole(
    "ADMINISTRATEUR",
    "MODIFICATEUR"
  );

  const searchParams = new URLSearchParams(
  location.search
  );

  const soaIdInitial = searchParams.get("soaId") || "";
  const anneeRoute = searchParams.get("annee") || "";
  const [soaId] = useState(soaIdInitial);
  const [annee] = useState(anneeRoute);
  const [form, setForm] = useState({
  ...EMPTY_FORM,
  dateEntree: annee
    ? `${annee}-01-01`
    : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const type = form.type;
  const codeSoa = searchParams.get("codeSoa") || "";

  const titleType = useMemo(() => {
    if (type === "ACHAT") return "Prise en charge par achat";
    if (type === "DON") return "Prise en charge par don";
    return "Prise en charge par affectation";
  }, [type]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validate() {
    if (!soaId) {
      return "Le Code SOA n'est pas défini.";
    }

    const requiredCommon = [
      "nomBatiment",
      "nature",
      "entiteUtilisatrice",
      "etatBatisse",
      "localite",
      "adressePointRepere",
      "dateEntree",
      "type",
    ];

    const anneeDateEntree =
      form.dateEntree
        ? Number(form.dateEntree.slice(0, 4))
        : null;

    if (
      annee &&
      anneeDateEntree &&
      anneeDateEntree !== Number(annee)
    ) {
      return `La date d'entrée doit être comprise dans l'année ${annee}.`;
    }

    for (const field of requiredCommon) {
      if (!String(form[field] ?? "").trim()) {
        return `Le champ "${LABELS[field] || field}" est obligatoire.`;
      }
    }

    if (type === "ACHAT") {
      if (!form.ordreEntree.trim()) {
        return "L'ordre d'entrée est obligatoire pour un ACHAT.";
      }

      if (!form.facture.trim()) {
        return "La facture est obligatoire pour un ACHAT.";
      }
    }

    if (type === "DON") {
      if (!form.ordreEntree.trim()) {
        return "L'ordre d'entrée est obligatoire pour un DON.";
      }

      if (!form.facture.trim()) {
        return "La facture est obligatoire pour un DON.";
      }

      if (!form.pvEvaluation.trim()) {
        return "Le PV d'évaluation est obligatoire pour un DON.";
      }
    }

    if (type === "AFFECTATION") {
      const affectationRequired = [
        ["nomPersonneSortie", "Nom de la personne faisant la sortie"],
        ["cinPersonneSortie", "CIN de la personne faisant la sortie"],
        ["serviceSortie", "Service de la personne faisant la sortie"],
        ["nomPersonneEntree", "Nom de la personne faisant l'entrée"],
        ["cinPersonneEntree", "CIN de la personne faisant l'entrée"],
        ["serviceEntree", "Service de la personne faisant l'entrée"],
      ];

      for (const [field, label] of affectationRequired) {
        if (!String(form[field] ?? "").trim()) {
          return `${label} est obligatoire pour une AFFECTATION.`;
        }
      }
    }

    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canModify) {
      setError(
        "Vous n'avez pas l'autorisation d'effectuer une entrée."
      );
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        soaId: Number(soaId),

        numero:
          form.numero === ""
            ? null
            : Number(form.numero),

        nomBatiment: form.nomBatiment.trim(),
        nature: form.nature.trim(),
        entiteUtilisatrice:
          form.entiteUtilisatrice.trim() || null,
        occupant: form.occupant.trim() || null,
        etatBatisse: form.etatBatisse.trim(),
        localite: form.localite.trim(),
        adressePointRepere:
          form.adressePointRepere.trim(),

        dateEntree:
          form.dateEntree || null,

        type: form.type,

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() || null,

        ordreEntree:
          form.ordreEntree.trim() || null,

        facture:
          form.facture.trim() || null,

        pvEvaluation:
          form.pvEvaluation.trim() || null,

        nomPersonneSortie:
          form.nomPersonneSortie.trim() || null,

        cinPersonneSortie:
          form.cinPersonneSortie.trim() || null,

        serviceSortie:
          form.serviceSortie.trim() || null,

        nomPersonneEntree:
          form.nomPersonneEntree.trim() || null,

        cinPersonneEntree:
          form.cinPersonneEntree.trim() || null,

        serviceEntree:
          form.serviceEntree.trim() || null,
      };

      const response = await client.post(
        "/logements/entrees",
        payload
      );

      setSuccess(
        `Logement enregistré avec succès${
          response.data?.logement?.nomBatiment
            ? ` : ${response.data.logement.nomBatiment}`
            : "."
        }`
      );

      setTimeout(() => {
        navigate(
          `/patrimoine/logement?codeSoa=${encodeURIComponent(
            codeSoa
          )}&annee=${annee}`
        );
      }, 700);
    } catch (err) {
      console.error(
        "Erreur entrée logement :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible d'enregistrer l'entrée du logement."
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
              Votre profil ne permet pas d'effectuer une entrée
              de logement.
            </p>

            <Link
              to="/patrimoine/logement"
              className="inline-block mt-6 px-5 py-3 rounded-xl
                         bg-haigana-dark text-white font-medium
                         hover:bg-haigana-blue transition"
            >
              Retour aux logements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-haigana-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="bg-gradient-to-br from-haigana-dark to-haigana-blue rounded-3xl p-7 text-white shadow-lg">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">
                PATRIMOINE
              </p>

              <h1 className="text-3xl font-bold">
                Entrée d'un logement
              </h1>

              <p className="text-white/80 mt-2">
                {titleType}
              </p>
            </div>

            <Link
              to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
                codeSoa
              )}&annee=${annee}`}
              className="px-5 py-3 rounded-xl bg-white/10
              hover:bg-white/20 transition font-medium"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {/* SOA */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code SOA
              </label>

              <input
                value={codeSoa}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année
              </label>

              <input
                value={annee || ""}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de prise en charge
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           bg-white focus:outline-none focus:ring-2
                           focus:ring-haigana-blue/20 focus:border-haigana-blue"
              >
                <option value="ACHAT">ACHAT</option>
                <option value="DON">DON</option>
                <option value="AFFECTATION">AFFECTATION</option>
              </select>
            </div>
          </div>
        </div>

        {/* BATIMENT */}
        <Section title="Informations du bâtiment">

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
            required
          />

          <Field
            label="Nature"
            name="nature"
            value={form.nature}
            onChange={handleChange}
            required
          />

          <Field
            label="Entité utilisatrice"
            name="entiteUtilisatrice"
            value={form.entiteUtilisatrice}
            onChange={handleChange}
            required
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
            required
          />

          <Field
            label="Localité"
            name="localite"
            value={form.localite}
            onChange={handleChange}
            required
          />

          <Field
            label="Date d'entrée"
            name="dateEntree"
            value={form.dateEntree}
            onChange={handleChange}
            type="date"
            min={`${annee}-01-01`}
            max={`${annee}-12-31`}
            required
          />

          <div className="md:col-span-2">
            <TextareaField
              label="Adresse et point de repère"
              name="adressePointRepere"
              value={form.adressePointRepere}
              onChange={handleChange}
              required
            />
          </div>
        </Section>

        {/* PIECES */}
        {(type === "ACHAT" || type === "DON") && (
          <Section title={`Pièces justificatives — ${type}`}>

            <Field
              label="Ordre d'entrée"
              name="ordreEntree"
              value={form.ordreEntree}
              onChange={handleChange}
              required
            />

            <Field
              label="Facture"
              name="facture"
              value={form.facture}
              onChange={handleChange}
              required
            />

            {type === "DON" && (
              <Field
                label="PV d'évaluation"
                name="pvEvaluation"
                value={form.pvEvaluation}
                onChange={handleChange}
                required
              />
            )}

            <Field
              label="Pièce justificative URL"
              name="pieceJustificativeUrl"
              value={form.pieceJustificativeUrl}
              onChange={handleChange}
            />
          </Section>
        )}

        {/* AFFECTATION */}
        {type === "AFFECTATION" && (
          <>
            <Section title="Personne faisant la sortie">

              <Field
                label="Nom"
                name="nomPersonneSortie"
                value={form.nomPersonneSortie}
                onChange={handleChange}
                required
              />

              <Field
                label="CIN"
                name="cinPersonneSortie"
                value={form.cinPersonneSortie}
                onChange={handleChange}
                required
              />

              <div className="md:col-span-2">
                <Field
                  label="Service"
                  name="serviceSortie"
                  value={form.serviceSortie}
                  onChange={handleChange}
                  required
                />
              </div>

            </Section>

            <Section title="Personne faisant l'entrée">

              <Field
                label="Nom"
                name="nomPersonneEntree"
                value={form.nomPersonneEntree}
                onChange={handleChange}
                required
              />

              <Field
                label="CIN"
                name="cinPersonneEntree"
                value={form.cinPersonneEntree}
                onChange={handleChange}
                required
              />

              <div className="md:col-span-2">
                <Field
                  label="Service"
                  name="serviceEntree"
                  value={form.serviceEntree}
                  onChange={handleChange}
                  required
                />
              </div>

            </Section>
          </>
        )}

        {/* MESSAGES */}
        {error && (
          <div className="px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="px-5 py-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        {/* ACTIONS */}
        <div className="bg-white rounded-2xl shadow-card p-6 flex flex-wrap justify-end gap-3">

          <Link
            to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
              codeSoa
            )}&annee=${annee}`}
            className="px-6 py-3 rounded-xl border border-gray-200
            text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Annuler
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-haigana-dark text-white
            font-medium hover:bg-haigana-blue transition
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Enregistrement..." : "Enregistrer l'entrée"}
          </button>
        </div>

      </div>
    </div>
  );
}
