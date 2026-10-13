import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AchatConsultation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { hasRole } = useAuth();

  const [achat, setAchat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // CHARGEMENT DE L'ACHAT
  useEffect(() => {
    loadAchat();
  }, [id]);

  async function loadAchat() {
    setLoading(true);
    setError("");

    try {
      const { data } = await client.get(
        `/achats/${id}`
      );

      console.log("Achat chargé :", data);

      setAchat(data);

    } catch (err) {
      console.error(
        "Erreur chargement achat :",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les informations de l'achat."
      );
    } finally {
      setLoading(false);
    }
  }
  // FORMAT DATE
  function formatDate(date) {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString(
        "fr-FR"
      );
    } catch {
      return "-";
    }
  }
  // FORMAT MONTANT
  function formatMontant(montant) {
    if (
      montant === null ||
      montant === undefined ||
      montant === ""
    ) {
      return "0 Ar";
    }

    return `${Number(
      montant
    ).toLocaleString("fr-FR")} Ar`;
  }
  // CHARGEMENT
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow-card p-10 text-center">

          <p className="text-gray-400">
            Chargement de l'achat...
          </p>

        </div>

      </div>
    );
  }
  // ERREUR
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-red-50 text-red-600 rounded-xl p-5">

          <p className="font-medium mb-1">
            Erreur
          </p>

          <p className="text-sm">
            {error}
          </p>

        </div>

        <div className="mt-5">

          <button
            type="button"
            onClick={() =>
              navigate("/patrimoine/achats")
            }
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Retour aux achats
          </button>

        </div>

      </div>
    );
  }
  // ACHAT INTROUVABLE
  if (!achat) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-gray-50 text-gray-500 rounded-xl p-5">

          Achat introuvable.

        </div>

        <div className="mt-5">

          <button
            type="button"
            onClick={() =>
              navigate("/patrimoine/achats")
            }
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Retour aux achats
          </button>

        </div>

      </div>
    );
  }
  // AFFICHAGE
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/*EN-TÊTE
          ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Consultation de l'achat
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Détails de l'achat du véhicule
          </p>

        </div>

        <div className="text-sm text-gray-500">
          Achat #{achat.id}
        </div>

      </div>

      {/*CARTE PRINCIPALE
          ===================================================== */}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">

        {/* ---------------------------------------------------
            TITRE
            --------------------------------------------------- */}

        <div className="px-6 py-4 bg-haigana-dark text-white">

          <h2 className="font-semibold">
            Informations de l'achat
          </h2>

        </div>

        {/* ---------------------------------------------------
            CONTENU
            --------------------------------------------------- */}

        <div className="p-6 space-y-6">

          {/*  INFORMATIONS ENTREE*/}

          <div>

            <h3 className="text-sm font-semibold text-haigana-dark uppercase tracking-wide mb-4">
              Entrée
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* REFERENCE */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Référence
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {achat.reference || "-"}
                </p>

              </div>

              {/* ID ENTREE */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Identifiant de l'entrée
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {achat.entreeId
                    ? `Entrée #${achat.entreeId}`
                    : "-"}
                </p>

              </div>

            </div>

          </div>

          {/*  INFORMATIONS VEHICULE*/}

          <div>

            <h3 className="text-sm font-semibold text-haigana-dark uppercase tracking-wide mb-4">
              Véhicule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* IMMATRICULATION */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Immatriculation
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {achat.immatricule || "-"}
                </p>

              </div>

              {/* ID VEHICULE */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Identifiant du véhicule
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {achat.vehiculeId
                    ? `Véhicule #${achat.vehiculeId}`
                    : "-"}
                </p>

              </div>

              {/* CODE SOA */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Code SOA
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {achat.codeSoa || "-"}
                </p>

              </div>

            </div>

          </div>

          {/*  INFORMATIONS ACHAT*/}

          <div>

            <h3 className="text-sm font-semibold text-haigana-dark uppercase tracking-wide mb-4">
              Informations financières
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* DATE */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Date d'achat
                </p>

                <p className="text-base font-semibold text-haigana-dark">
                  {formatDate(
                    achat.dateAchat
                  )}
                </p>

              </div>

              {/* SOMME */}

              <div className="rounded-xl bg-haigana-bg/40 p-4">

                <p className="text-xs text-gray-500 mb-1">
                  Somme payée
                </p>

                <p className="text-xl font-bold text-haigana-dark">
                  {formatMontant(
                    achat.sommePayer
                  )}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/*   ACTIONS
            =================================================== */}

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">

          {/* RETOUR */}

          <button
            type="button"
            onClick={() =>
              navigate("/patrimoine/achats")
            }
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>

          {/* MODIFIER */}

          {hasRole(
            "ADMINISTRATEUR",
            "MODIFICATEUR"
          ) && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/patrimoine/achat/${achat.id}/modifier`
                )
              }
              className="px-5 py-2.5 rounded-lg bg-haigana-gold text-haigana-dark font-semibold hover:brightness-95 transition-all"
            >
              Modifier
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
