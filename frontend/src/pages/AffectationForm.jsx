import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function AffectationForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [entrees, setEntrees] = useState([]);

  const [form, setForm] = useState({
    description: "",
    lieuAffectation: "",
    dateDepart: "",
    dateFin: "",
    entree: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // CHARGEMENT DES DONNEES
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

  
        // CHARGER LES ENTREES
  

        const entreeResponse =
          await client.get("/entrees");

        const listeEntrees =
          Array.isArray(entreeResponse.data)
            ? entreeResponse.data
            : [];

        setEntrees(listeEntrees);

  
        // MODE MODIFICATION
  

        if (isEdit) {
          const affectationResponse =
            await client.get(
              `/affectations-entree/${id}`
            );

          const affectation =
            affectationResponse.data;

          console.log(
            "Affectation chargée :",
            affectation
          );


          // RETROUVER L'ENTREE

          let entreeSelectionnee = null;

          if (affectation.entreeId) {
            entreeSelectionnee =
              listeEntrees.find(
                (entree) =>
                  Number(entree.id) ===
                  Number(affectation.entreeId)
              ) || null;
          }

          // SI L'ENTREE N'EST PAS TROUVEE DANS /entrees
          // ON CONSTRUIT UNE ENTREE MINIMALE

          if (
            !entreeSelectionnee &&
            affectation.entreeId
          ) {
            entreeSelectionnee = {
              id: affectation.entreeId,
              reference:
                affectation.reference || "",
              vehicule: affectation.vehiculeId
                ? {
                    id: affectation.vehiculeId,
                    immatricule:
                      affectation.immatricule || "",
                  }
                : null,
            };
          }

          setForm({
            description:
              affectation.description || "",

            lieuAffectation:
              affectation.lieuAffectation || "",

            dateDepart:
              affectation.dateDepart || "",

            dateFin:
              affectation.dateFin || "",

            entree:
              entreeSelectionnee,
          });
        }

      } catch (err) {
        console.error(
          "Erreur chargement affectation :",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les données."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isEdit]);
  // CHANGEMENT FORMULAIRE
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  // CHANGEMENT ENTREE
  function handleEntreeChange(e) {
    const entreeId =
      Number(e.target.value);

    const entree =
      entrees.find(
        (item) =>
          Number(item.id) === entreeId
      ) || null;

    setForm((prev) => ({
      ...prev,
      entree,
    }));
  }
  // ENREGISTREMENT
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");


    // VERIFICATION ENTREE


    if (!form.entree?.id) {
      setError(
        "Veuillez sélectionner une entrée."
      );
      return;
    }


    // VERIFICATION LIEU


    if (
      !form.lieuAffectation.trim()
    ) {
      setError(
        "Le lieu d'affectation est obligatoire."
      );
      return;
    }

    try {
      setSaving(true);


      // PAYLOAD


      const payload = {
        description:
          form.description,

        lieuAffectation:
          form.lieuAffectation,

        dateDepart:
          form.dateDepart || null,

        dateFin:
          form.dateFin || null,

        entree: {
          id: form.entree.id,
        },
      };

      console.log(
        "Payload affectation :",
        payload
      );


      // CREATION


      if (!isEdit) {
        await client.post(
          "/affectations-entree",
          payload
        );
      }


      // MODIFICATION


      else {
        await client.put(
          `/affectations-entree/${id}`,
          payload
        );
      }


      // RETOUR LISTE


      navigate(
        "/patrimoine/affectation"
      );

    } catch (err) {
      console.error(
        "Erreur enregistrement affectation :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible d'enregistrer l'affectation."
      );
    } finally {
      setSaving(false);
    }
  }
  // CHARGEMENT
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-card p-8 text-center">

          <p className="text-gray-500">
            Chargement...
          </p>

        </div>

      </div>
    );
  }
  // AFFICHAGE
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">

        {isEdit
          ? "Modifier l'affectation"
          : "Nouvelle affectation"}

      </h1>

      {/*ERREUR*/}

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">

          {error}

        </div>
      )}

      {/*FORMULAIRE*/}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-card p-6"
      >

        {/*   ENTREE / VEHICULE*/}

        <div className="mb-5">

          <label className="block text-sm font-medium text-haigana-dark mb-1">

            Véhicule / Entrée

          </label>

          <select
            value={form.entree?.id || ""}
            onChange={handleEntreeChange}
            disabled={isEdit}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-haigana-blue outline-none disabled:bg-gray-100 disabled:text-gray-500"
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

          {/* -------------------------------------------------
              INFORMATIONS DU VEHICULE EN MODE MODIFICATION
          -------------------------------------------------- */}

          {isEdit &&
            form.entree && (
              <div className="mt-3 rounded-lg bg-haigana-bg/50 p-3">

                <p className="text-xs text-gray-500">
                  Véhicule concerné
                </p>

                <p className="text-sm font-semibold text-haigana-dark mt-1">

                  {form.entree.vehicule?.immatricule ||
                    "Immatriculation inconnue"}

                </p>

                {form.entree.reference && (
                  <p className="text-xs text-gray-500 mt-1">

                    Référence :
                    {" "}
                    {form.entree.reference}

                  </p>
                )}

              </div>
            )}

          {isEdit && (
            <p className="mt-1 text-xs text-gray-400">

              L'entrée ne peut pas être modifiée.

            </p>
          )}

        </div>

        {/*   DESCRIPTION*/}

        <div className="mb-5">

          <label className="block text-sm font-medium text-haigana-dark mb-1">

            Description

          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
            placeholder="Description de l'affectation..."
          />

        </div>

        {/*   LIEU*/}

        <div className="mb-5">

          <label className="block text-sm font-medium text-haigana-dark mb-1">

            Lieu d'affectation

          </label>

          <input
            type="text"
            name="lieuAffectation"
            value={form.lieuAffectation}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
            placeholder="Ex : Direction régionale Boeny"
          />

        </div>

        {/*   DATES*/}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

          {/* DATE DEPART */}

          <div>

            <label className="block text-sm font-medium text-haigana-dark mb-1">

              Date de départ

            </label>

            <input
              type="date"
              name="dateDepart"
              value={form.dateDepart}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
            />

          </div>

          {/* DATE FIN */}

          <div>

            <label className="block text-sm font-medium text-haigana-dark mb-1">

              Date de fin

            </label>

            <input
              type="date"
              name="dateFin"
              value={form.dateFin}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue outline-none"
            />

          </div>

        </div>

        {/*   BOUTONS*/}

        <div className="flex justify-end gap-3">

          {/* ANNULER */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/patrimoine/affectations"
              )
            }
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >

            Annuler

          </button>

          {/* ENREGISTRER */}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all disabled:opacity-50"
          >

            {saving
              ? "Enregistrement..."
              : isEdit
                ? "Enregistrer les modifications"
                : "Créer l'affectation"}

          </button>

        </div>

      </form>

    </div>
  );
}
