import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import client from "../api/client";

export default function MaterielModification() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [materiel, setMateriel] = useState(null);
  const [nomenclatures, setNomenclatures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nomenclatureId: "",
    designation: "",
    especeUnite: "",
    prixUnitaire: "",
  });

  // CHARGEMENT

  useEffect(() => {
    chargerDonnees();
  }, [id]);

  const chargerDonnees = async () => {

    try {
      setLoading(true);
      setError("");

      const [
        responseMateriel,
        responseNomenclatures,
      ] = await Promise.all([
        client.get(`/materiels/${id}`),
        client.get("/materiels/nomenclatures"),
      ]);

      const data = responseMateriel.data;

      setMateriel(data);

      setNomenclatures(
        responseNomenclatures.data || []
      );

      setForm({
        nomenclatureId:
          data?.nomenclature?.id || "",

        designation:
          data?.designation || "",

        especeUnite:
          data?.especeUnite || "",

        prixUnitaire:
          data?.prixUnitaire ?? "",
      });

    } catch (err) {

      console.error(
        "Erreur chargement matériel :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de charger le matériel."
      );

    } finally {
      setLoading(false);
    }
  };

  // CHANGE

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

    if (!form.nomenclatureId) {
      setError(
        "Veuillez sélectionner une nomenclature."
      );
      return;
    }

    if (!form.designation.trim()) {
      setError(
        "La désignation est obligatoire."
      );
      return;
    }

    if (!form.especeUnite.trim()) {
      setError(
        "L'espèce des unités est obligatoire."
      );
      return;
    }

    if (
      form.prixUnitaire === "" ||
      Number(form.prixUnitaire) < 0
    ) {
      setError(
        "Veuillez saisir un prix unitaire valide."
      );
      return;
    }

    try {

      setSaving(true);

      const payload = {
        nomenclatureId:
          Number(form.nomenclatureId),

        designation:
          form.designation.trim(),

        especeUnite:
          form.especeUnite.trim(),

        prixUnitaire:
          Number(form.prixUnitaire),
      };

      await client.put(
        `/materiels/${id}`,
        payload
      );

      setSuccess(
        "Le matériel a été modifié avec succès."
      );

      setTimeout(() => {
        navigate(-1);
      }, 700);

    } catch (err) {

      console.error(
        "Erreur modification matériel :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de modifier le matériel."
      );

    } finally {
      setSaving(false);
    }
  };

  // CHARGEMENT

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div
          className="
            bg-white
            rounded-2xl
            shadow-card
            p-8
            text-center
            text-gray-400
          "
        >
          Chargement du matériel...
        </div>

      </div>
    );
  }

  if (!materiel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div
          className="
            bg-red-50
            border
            border-red-200
            text-red-700
            rounded-xl
            p-5
          "
        >
          Matériel introuvable.
        </div>

      </div>
    );
  }

  // AFFICHAGE

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* BREADCRUMB */}

      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

        <Link
          to="/patrimoine/materiel"
          className="hover:text-haigana-blue transition-colors"
        >
          Matériel
        </Link>

        <span>/</span>

        <span className="text-haigana-dark font-medium">
          Modification
        </span>

      </div>

      {/* TITRE */}

      <div className="mb-6">

        <h1
          className="
            text-2xl
            md:text-3xl
            font-bold
            text-haigana-dark
          "
        >
          Modifier le matériel
        </h1>

        <p
          className="
            text-sm
            text-gray-500
            mt-1
          "
        >
          Modification des informations générales du matériel.
        </p>

      </div>

      {/* MESSAGES */}

      {error && (
        <div
          className="
            mb-6
            bg-red-50
            border
            border-red-100
            text-red-600
            rounded-xl
            p-4
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="
            mb-6
            bg-green-50
            border
            border-green-100
            text-green-600
            rounded-xl
            p-4
          "
        >
          {success}
        </div>
      )}

      {/* FORMULAIRE */}

      <div
        className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        "
      >

        <div
          className="
            px-5
            py-4
            border-b
            border-gray-100
          "
        >

          <h2
            className="
              text-lg
              font-semibold
              text-haigana-dark
            "
          >
            Informations du matériel
          </h2>

        </div>

        <div
          className="
            p-5
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >

          {/* SOA */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p className="text-xs text-gray-500 mb-1">
              Code SOA
            </p>

            <p
              className="
                font-semibold
                text-haigana-dark
              "
            >
              {materiel?.codeSoa?.codeSoa || "-"}
            </p>

          </div>

          {/* ANNÉE INITIALE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <p className="text-xs text-gray-500 mb-1">
              Année initiale
            </p>

            <p
              className="
                font-semibold
                text-haigana-dark
              "
            >
              {materiel?.anneeInitiale || "-"}
            </p>

          </div>

          {/* NOMENCLATURE */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
              md:col-span-2
            "
          >

            <label className="text-xs text-gray-500 mb-2 block">
              Nomenclature
            </label>

            <select
              name="nomenclatureId"
              value={form.nomenclatureId}
              onChange={handleChange}
              className="
                w-full
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                bg-white
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            >

              <option value="">
                Sélectionner une nomenclature
              </option>

              {nomenclatures.map(
                (nomenclature) => (
                  <option
                    key={nomenclature.id}
                    value={nomenclature.id}
                  >
                    {nomenclature.numero}
                    {" - "}
                    {nomenclature.designation}
                  </option>
                )
              )}

            </select>

          </div>

          {/* DESIGNATION */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
              md:col-span-2
            "
          >

            <label className="text-xs text-gray-500 mb-2 block">
              Désignation
            </label>

            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="
                w-full
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            />

          </div>

          {/* UNITÉ */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <label className="text-xs text-gray-500 mb-2 block">
              Espèce des unités
            </label>

            <input
              type="text"
              name="especeUnite"
              value={form.especeUnite}
              onChange={handleChange}
              className="
                w-full
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            />

          </div>

          {/* PRIX */}

          <div
            className="
              bg-gray-50
              rounded-xl
              p-4
            "
          >

            <label className="text-xs text-gray-500 mb-2 block">
              Prix unitaire
            </label>

            <input
              type="number"
              min="0"
              name="prixUnitaire"
              value={form.prixUnitaire}
              onChange={handleChange}
              className="
                w-full
                px-3
                py-2
                rounded-lg
                border
                border-gray-200
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
              "
            />

          </div>

        </div>

        {/* ACTIONS */}

        <div
          className="
            px-5
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
            onClick={() => navigate(-1)}
            disabled={saving}
            className="
              px-5
              py-2.5
              rounded-lg
              border
              border-gray-200
              text-gray-600
              font-medium
              hover:bg-gray-50
              transition-all
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
              rounded-lg
              bg-haigana-blue
              text-white
              font-semibold
              hover:brightness-95
              transition-all
              disabled:opacity-50
            "
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer"}
          </button>

        </div>

      </div>

    </div>
  );
}