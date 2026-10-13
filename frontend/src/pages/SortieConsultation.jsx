import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function SortieConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sortie, setSortie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // CHARGEMENT
  useEffect(() => {
    async function loadSortie() {
      try {
        setLoading(true);
        setError("");

        const { data } = await client.get(`/sorties/${id}`);

        console.log("SORTIE CONSULTATION :", data);
        console.log("VEHICULE :", data?.vehicule);

        setSortie(data);
      } catch (err) {
        console.error("Erreur chargement sortie :", err);
        

        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger la sortie."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSortie();
  }, [id]);
  // FORMAT DATE
  function formatDate(date) {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString("fr-FR");
    } catch {
      return "-";
    }
  }
  // FORMAT PRIX
  function formatPrix(prix) {
    if (prix === null || prix === undefined || prix === "") {
      return "-";
    }

    const nombre = Number(prix);

    if (Number.isNaN(nombre)) {
      return "-";
    }

    return `${nombre.toLocaleString("fr-FR")} Ar`;
  }
  // CHARGEMENT
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <p className="text-gray-500">
            Chargement de la sortie...
          </p>
        </div>
      </div>
    );
  }
  // ERREUR
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/patrimoine/sorties")}
          className="mt-5 px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
        >
          Retour
        </button>

      </div>
    );
  }

  if (!sortie) {
    return null;
  }
  // VEHICULE
  const vehicule = sortie.vehicule;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/*EN-TETE*/}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-haigana-dark">
            Consultation de la sortie
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Détails de la sortie du véhicule
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/patrimoine/sorties")}
          className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-haigana-dark font-semibold hover:bg-gray-50 transition-colors"
        >
          Retour
        </button>

      </div>

      {/*INFORMATIONS SORTIE*/}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-5">
          Informations de la sortie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Info
            label="Référence"
            value={sortie.reference}
          />

          <Info
            label="Date de sortie"
            value={formatDate(sortie.dateSortie)}
          />

          <Info
            label="Type de sortie"
            value={sortie.type}
          />

          <Info
            label="Lieu"
            value={sortie.lieu}
          />

          <Info
            label="Description"
            value={sortie.description}
          />

          <Info
            label="Pièce justificative"
            value={sortie.pieceJustificativeUrl}
          />

        </div>

      </div>

      {/*PERSONNE QUI FAIT L'ORDRE DE SORTIE
          = REÇOIT LE VEHICULE*/}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-2">
          Personne qui fait l'ordre de sortie
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Informations relatives à la personne ou au service
          qui reçoit le véhicule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Info
            label="Nom"
            value={sortie.nomPersonneSortie}
          />

          <Info
            label="CIN"
            value={sortie.cinPersonneSortie}
          />

          <Info
            label="Service"
            value={sortie.serviceSortie}
          />

        </div>

      </div>

      {/*PERSONNE QUI FAIT L'ORDRE D'ENTREE
          = REMET LE VEHICULE*/}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-2">
          Personne qui fait l'ordre d'entrée
        </h2>

        <p className="text-sm text-gray-500 mb-5">
          Informations relatives à la personne ou au service
          qui remet le véhicule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Info
            label="Nom"
            value={sortie.nomPersonneEntree}
          />

          <Info
            label="CIN"
            value={sortie.cinPersonneEntree}
          />

          <Info
            label="Service"
            value={sortie.serviceEntree}
          />

        </div>

      </div>

      {/*VEHICULE*/}

      <div className="bg-white rounded-2xl shadow-card p-6">

        <h2 className="text-lg font-semibold text-haigana-dark mb-5">
          Véhicule concerné
        </h2>

        {!vehicule ? (

          <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-xl px-4 py-3">
            Aucun véhicule associé à cette sortie.
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* IMMATRICULATION */}

            <Info
              label="Immatriculation"
              value={vehicule.immatricule}
            />

            {/* CODE SOA */}

            <Info
              label="Code SOA"
              value={vehicule.codeSoa?.codeSoa}
            />

            {/* PRIX */}

            <Info
              label="Prix du véhicule"
              value={formatPrix(vehicule.prixVehicule)}
            />

            {/* DATE CIRCULATION */}

            <Info
              label="Date de circulation"
              value={formatDate(
                vehicule.dateCirculation
              )}
            />

            {/* ETAT */}

            <Info
              label="État"
              value={vehicule.etat?.etatVehicule}
            />

            {/* GENRE */}

            <Info
              label="Genre"
              value={vehicule.genre?.genreVehicule}
            />

            {/* MARQUE */}

            <Info
              label="Marque"
              value={vehicule.marque?.marqueVehicule}
            />

            {/* TYPE */}

            <Info
              label="Type"
              value={vehicule.type?.typeDuVehicule}
            />

            {/* CARBURANT */}

            <Info
              label="Carburant"
              value={vehicule.carburant?.libelle}
            />

            {/* LIEU */}

            <Info
              label="Lieu d'affectation actuel"
              value={vehicule.lieuAffectationActuel}
            />

          </div>

        )}

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

      <p className="text-sm font-semibold text-haigana-dark break-words">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "-"}
      </p>

    </div>
  );
}