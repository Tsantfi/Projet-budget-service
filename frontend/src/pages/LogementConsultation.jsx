import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import client from "../api/client";

function Info({ label, value }) {
  return (
    <div className="bg-haigana-bg/50 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>

      <p className="font-medium text-haigana-dark break-words">
        {value === null ||
        value === undefined ||
        String(value).trim() === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("fr-FR");
}

export default function LogementConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const codeSoaParam = searchParams.get("codeSoa") || "";
  const anneeParam = searchParams.get("annee") || "";

  const [logement, setLogement] =
    useState(null);

  const codeSoa = codeSoaParam || logement?.soa?.codeSoa || logement?.codeSoa?.codeSoa || "";
  const annee = anneeParam || logement?.anneeInitiale || "";

  const [entree, setEntree] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

        try {
        const response =
          await client.get(
            `/logements/${id}`
          );

        const logementData = response.data;
        setLogement(logementData);

        // FIX SÉCURISÉ : Extraction depuis l'ID technique du logement reçu
        const realSoaId = logementData.soa?.id || logementData.codeSoa?.id;

        try {
          const entreeResponse =
            await client.get(
              `/patrimoine/logement/entree?soaId=${realSoaId}&annee=${annee}`
            );

          setEntree(entreeResponse.data);
        } catch (entryError) {
          if (
            entryError.response?.status !== 404
          ) {
            console.error(
              "Erreur chargement entrée :",
              entryError
            );
          }
        }

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
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-haigana-bg p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-card p-10 text-center text-gray-500">
          Chargement du logement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-haigana-bg p-6">
        <div className="max-w-6xl mx-auto space-y-5">

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5">
            {error}
          </div>

          <Link
            to={`/patrimoine/logement?codeSoa=${encodeURIComponent(
                codeSoa
              )}&annee=${annee}`}
            className="inline-block px-5 py-3 rounded-xl
            bg-haigana-dark text-white
            hover:bg-haigana-blue transition"
          >
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  if (!logement) {
    return null;
  }

  const nomSoa =
    logement.soa?.codeSoa ||
    logement.codeSoa?.codeSoa ||
    "—";

  return (
    <div className="min-h-screen bg-haigana-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="bg-gradient-to-br from-haigana-dark to-haigana-blue rounded-3xl p-7 text-white shadow-lg">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-white/70 text-sm">
                PATRIMOINE / LOGEMENT
              </p>

              <h1 className="text-3xl font-bold">
                Consultation du logement
              </h1>

              <p className="text-white/80 mt-2">
                Code SOA : {nomSoa}
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

        <div className="bg-white rounded-2xl shadow-card p-6">

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

            <div>
              <h2 className="text-xl font-semibold text-haigana-dark">
                Informations du bâtiment
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Fiche complète du patrimoine immobilier.
              </p>
            </div>

            {logement.actif ? (
              <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                Actif
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                Inactif
              </span>
            )}

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <Info
              label="Code SOA"
              value={nomSoa}
            />

            <Info
              label="Numéro"
              value={logement.numero}
            />

            <Info
              label="Nom du bâtiment"
              value={logement.nomBatiment}
            />

            <Info
              label="Nature"
              value={logement.nature}
            />

            <Info
              label="Entité utilisatrice"
              value={logement.entiteUtilisatrice}
            />

            <Info
              label="Occupant"
              value={logement.occupant}
            />

            <Info
              label="État de la bâtisse"
              value={logement.etatBatisse}
            />

            <Info
              label="Localité"
              value={logement.localite}
            />

            <Info
              label="État général"
              value={logement.etatGeneral}
            />

            <Info
              label="Année initiale"
              value={logement.anneeInitiale}
            />

            <Info
              label="Date avant condamnation"
              value={formatDate(
                logement.dateAvantCondamnation
              )}
            />

          </div>

          <div className="mt-5">
            <Info
              label="Adresse et point de repère"
              value={
                logement.adressePointRepere
              }
            />
          </div>
        </div>

        {/* ENTREE */}
        {entree && (
          <div className="bg-white rounded-2xl shadow-card p-6">

            <h2 className="text-xl font-semibold text-haigana-dark mb-5">
              Prise en charge
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <Info
                label="Type"
                value={entree.type}
              />

              <Info
                label="Référence"
                value={entree.reference}
              />

              <Info
                label="Date d'entrée"
                value={formatDate(
                  entree.dateEntree
                )}
              />

              <Info
                label="Ordre d'entrée"
                value={entree.ordreEntree}
              />

              <Info
                label="Facture"
                value={entree.facture}
              />

              <Info
                label="PV d'évaluation"
                value={
                  entree.pvEvaluation
                }
              />

              <Info
                label="Personne sortie"
                value={
                  entree.nomPersonneSortie
                }
              />

              <Info
                label="CIN sortie"
                value={
                  entree.cinPersonneSortie
                }
              />

              <Info
                label="Service sortie"
                value={
                  entree.serviceSortie
                }
              />

              <Info
                label="Personne entrée"
                value={
                  entree.nomPersonneEntree
                }
              />

              <Info
                label="CIN entrée"
                value={
                  entree.cinPersonneEntree
                }
              />

              <Info
                label="Service entrée"
                value={
                  entree.serviceEntree
                }
              />

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
