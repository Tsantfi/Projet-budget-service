import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function VehiculeSortie() {

  const navigate = useNavigate();
  const { vehiculeId } = useParams();

  const [vehicule, setVehicule] = useState(null);

  const [motif, setMotif] = useState("");
  const [piece, setPiece] = useState("");
  const [lieu, setLieu] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [loadingVehicule, setLoadingVehicule] = useState(true);
  const [error, setError] = useState("");

  // CHARGER LE VÉHICULE

  useEffect(() => {

    async function chargerVehicule() {

      try {

        setLoadingVehicule(true);
        setError("");

        const { data } = await client.get(
          `/vehicules/${vehiculeId}`
        );

        setVehicule(data);
        setLieu(data.localiteTexte);

      } catch (err) {

        console.error(
          "Erreur chargement véhicule :",
          err
        );

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Impossible de charger le véhicule."
        );

      } finally {

        setLoadingVehicule(false);

      }
    }

    chargerVehicule();

  }, [vehiculeId]);


  // CONDAMNER

  async function handleCondamner(e) {

    e.preventDefault();

    if (!motif.trim()) {
      setError("Le motif est obligatoire.");
      return;
    }

    if (!piece.trim()) {
      setError("La pièce est obligatoire.");
      return;
    }

    if (!lieu.trim()) {
      setError("Le lieu de condamnation est obligatoire.");
      return;
    }

    if (!date) {
      setError("La date est obligatoire.");
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment condamner définitivement le véhicule "${vehicule?.immatricule}" ?\n\nLe véhicule sera supprimé de la base de données.`
    );

    if (!confirmation) {
      return;
    }

    try {

      setLoading(true);
      setError("");

      await client.post(
        `/vehicules/${vehiculeId}/sortie`,
        {
          motif: motif.trim(),
          piece: piece.trim(),
          date: date
        }
      );

      alert(
        "La sortie a été enregistrée et le véhicule a été condamné avec succès."
      );

      const codeSoa =
        vehicule?.codeSoa?.codeSoa ||
        vehicule?.codeSoa?.code ||
        "";

      navigate("/patrimoine/vehicule", {
        state: {
          retourSoa: {
            codeSoa: codeSoa
          }
        }
      });

    } catch (err) {

      console.error(
        "Erreur condamnation :",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Impossible de condamner le véhicule."
      );

    } finally {

      setLoading(false);

    }
  }


  // CHARGEMENT

  if (loadingVehicule) {

    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-500">
          Chargement du véhicule...
        </div>

      </div>
    );
  }


  return (

    <div className="max-w-4xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">
        Sortie du véhicule
      </h1>


      {/*INFORMATIONS VÉHICULE*/}

      {vehicule && (

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">

          <p className="text-sm text-gray-500 mb-1">
            Véhicule
          </p>

          <h2 className="text-xl font-bold text-haigana-dark">
            {vehicule.immatricule || "-"}
          </h2>

          {vehicule.codeSoa?.codeSoa && (

            <p className="text-sm text-gray-500 mt-2">
              Code SOA :{" "}
              <span className="font-medium text-haigana-dark">
                {vehicule.codeSoa.codeSoa}
              </span>
            </p>

          )}

        </div>

      )}


      {/*FORMULAIRE*/}

      <form
        onSubmit={handleCondamner}
        className="bg-white rounded-2xl shadow-card p-6"
      >

        {/* ====================================================
            MOTIF */}

        <div className="mb-5">

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Motif
          </label>

          <textarea
            value={motif}
            onChange={(e) =>
              setMotif(e.target.value)
            }
            rows={4}
            placeholder="Saisir le motif de la sortie..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-1 focus:ring-haigana-blue outline-none resize-none"
          />

        </div>


        {/* ====================================================
            PIÈCE */}

        <div className="mb-5">

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Pièce
          </label>

          <input
            type="text"
            value={piece}
            onChange={(e) =>
              setPiece(e.target.value)
            }
            placeholder="Saisir la pièce justificative..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-1 focus:ring-haigana-blue outline-none"
          />

        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Lieu de condamnation
          </label>
          <input
            type="text"
            value={lieu}
            onChange={(e) => setLieu(e.target.value)}
            placeholder="Saisir le lieu de la condamnation..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-1 focus:ring-haigana-blue outline-none"
          />
        </div>

        {/* DATE */}

        <div className="mb-6">

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-1 focus:ring-haigana-blue outline-none"
          />

        </div>


        {/* ====================================================
            ERREUR */}

        {error && (

          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>

        )}


        {/*BOUTONS*/}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">

          <button
            type="button"
            onClick={() => {
              const codeSoa =
                vehicule?.codeSoa?.codeSoa ||
                vehicule?.codeSoa?.code ||
                "";

              navigate("/patrimoine/vehicule", {
                state: {
                  retourSoa: {
                    codeSoa: codeSoa
                  }
                }
              });
            }}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Annuler
          </button>


          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
          >
            {loading
              ? "Validation..."
              : "Valider"}
          </button>

        </div>

      </form>

    </div>
  );
}