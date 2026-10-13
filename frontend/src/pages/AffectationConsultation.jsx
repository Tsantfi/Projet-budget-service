import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function AffectationConsultation() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [affectation, setAffectation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadAffectation() {

      try {

        setLoading(true);
        setError("");

        const { data } =
          await client.get(
            `/affectations-entree/${id}`
          );

        console.log(
          "AFFECTATION DETAIL :",
          data
        );

        setAffectation(data);

      } catch (err) {

        console.error(
          "Erreur chargement affectation :",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger l'affectation."
        );

      } finally {

        setLoading(false);

      }
    }

    loadAffectation();

  }, [id]);


  function formatDate(date) {

    if (!date) {
      return "-";
    }

    try {

      return new Date(date)
        .toLocaleDateString("fr-FR");

    } catch {

      return "-";

    }
  }


  if (loading) {

    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-card p-6">

          <p className="text-gray-500">
            Chargement de l'affectation...
          </p>

        </div>

      </div>
    );
  }


  if (error) {

    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/patrimoine/affectations"
            )
          }
          className="mt-5 px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
        >
          Retour
        </button>

      </div>
    );
  }


  if (!affectation) {
    return null;
  }


  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/*EN-TÊTE*/}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Consultation de l'affectation
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Détails de l'affectation du véhicule
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/patrimoine/affectations"
            )
          }
          className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-haigana-dark font-semibold hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>

      </div>


      {/*INFORMATIONS AFFECTATION*/}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-5">
          Informations de l'affectation
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Info
            label="Description"
            value={affectation.description}
          />

          <Info
            label="Lieu d'affectation"
            value={affectation.lieuAffectation}
          />

          <Info
            label="Date de départ"
            value={formatDate(
              affectation.dateDepart
            )}
          />

          <Info
            label="Date de fin"
            value={formatDate(
              affectation.dateFin
            )}
          />

        </div>

      </div>


      {/*VEHICULE*/}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-5">
          Véhicule concerné
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* IMMATRICULATION */}

          <Info
            label="Immatriculation"
            value={affectation.immatricule}
          />


          {/* PRIX */}

          <Info
            label="Prix du véhicule"
            value={
              affectation.prixVehicule != null
                ? `${Number(
                    affectation.prixVehicule
                  ).toLocaleString("fr-FR")} Ar`
                : "-"
            }
          />


          {/* DATE CIRCULATION */}

          <Info
            label="Date de circulation"
            value={formatDate(
              affectation.dateCirculation
            )}
          />


          {/* ETAT */}

          <Info
            label="État"
            value={affectation.etat}
          />


          {/* GENRE */}

          <Info
            label="Genre"
            value={affectation.genre}
          />


          {/* MARQUE */}

          <Info
            label="Marque"
            value={affectation.marque}
          />


          {/* TYPE */}

          <Info
            label="Type"
            value={affectation.type}
          />


          {/* CARBURANT */}

          <Info
            label="Carburant"
            value={affectation.carburant}
          />


          {/* LIEU ACTUEL */}

          <Info
            label="Lieu d'affectation actuel"
            value={
              affectation.lieuAffectationActuel
            }
          />

        </div>

      </div>


      {/*ENTREE*/}

      <div className="bg-white rounded-2xl shadow-card p-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-5">
          Ordre d'entrée
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Info
            label="Référence"
            value={affectation.reference}
          />

          <Info
            label="Type d'entrée"
            value={affectation.typeEntree}
          />

          <Info
            label="Date d'entrée"
            value={formatDate(
              affectation.dateEntree
            )}
          />

        </div>

      </div>

    </div>
  );
}


/*COMPOSANT INFO*/

function Info({ label, value }) {

  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">

      <p className="text-xs font-medium text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-sm font-semibold text-haigana-dark">
        {value !== null &&
         value !== undefined &&
         value !== ""
          ? value
          : "-"}
      </p>

    </div>
  );
}