import React, { useEffect, useState, useMemo } from "react";
import client from "../api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STATUT_CONFIG = {
  IDENTIQUE: { label: "Identique", className: "bg-green-50 text-green-700 border-green-200" },
  MODIFIE: { label: "Modifié", className: "bg-orange-50 text-orange-700 border-orange-200" },
  NOUVEAU: { label: "Nouveau", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ABSENT: { label: "Absent", className: "bg-red-50 text-red-700 border-red-200" },
};

export default function RecensementGestionGlobal() {
  const { hasRole } = useAuth();

  // Critères de ciblage initiaux
  const [annee, setAnnee] = useState("2026");
  const [codeSoa, setCodeSoa] = useState("");


  // Instance principale du recensement chargé
  const [recensement, setRecensement] = useState(null);
  const [vehicules, setVehicules] = useState([]);

  // États d'attente et messages contextuels
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États pour la recherche locale et le filtrage du tableau
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("TOUS");

  // États de tri
  const [sortField, setSortField] = useState("immatriculation");
  const [sortDirection, setSortDirection] = useState("asc");

  // Réinitialisation d'erreur au changement de critère principal
  const handleCritereChange = (type, value) => {
    if (type === "annee") setAnnee(value);
    if (type === "codeSoa") setCodeSoa(value);
    setError("");
    setSuccess("");
  };

  // SUPPRESSION CHIRURGICALE D'UN SEUL VÉHICULE DANS LE RECENSEMENT

  const handleSupprimerVehiculeLigne = async (vehiculeSnapshot) => {
    if (!recensement?.id || !vehiculeSnapshot?.id) return;

    const confirmation = window.confirm(
      `Voulez-vous vraiment retirer définitivement le véhicule "${vehiculeSnapshot.immatriculation || "Inconnu"}" de ce recensement annuel ?`
    );

    if (!confirmation) return;

    try {
      setError("");
      setSuccess("");

      // Appel de l'endpoint DELETE de RecensementController.java
      const response = await client.delete(`/recensements/${recensement.id}/vehicules/${vehiculeSnapshot.id}`);

      // Mise à jour de l'état local avec la nouvelle liste renvoyée par le serveur
      const donnéesActualisées = response.data;
      setRecensement(donnéesActualisées);
      setVehicules(donnéesActualisées.vehicules || []);
      setSuccess(`Le véhicule ${vehiculeSnapshot.immatriculation} a été retiré avec succès.`);

    } catch (err) {
      console.error("Erreur lors de la suppression de la ligne :", err);
      setError(err.response?.data?.message || "Impossible de retirer ce véhicule du recensement.");
    }
  };


    // 1. RECHERCHER ET CHARGER LE RECENSEMENT COMPLET
  const handleRechercher = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setRecensement(null);
    setVehicules([]);

    if (!annee) return setError("Veuillez saisir une année.");
    if (!codeSoa.trim()) return setError("Veuillez renseigner le code SOA.");

    try {
      setLoading(true);

      // A. Localiser d'abord le SOA pour récupérer son ID interne
      const resSoa = await client.get(`/soa/code/${encodeURIComponent(codeSoa.trim())}`);
      const soaId = resSoa.data?.id;

      if (!soaId) {
        throw new Error("L'identifiant unique du code SOA est introuvable.");
      }

      // B. Interroger l'endpoint GET de votre RecensementController.java
      const resRecensement = await client.get(`/recensements/annee/${annee}/soa/${soaId}`);

      setRecensement(resRecensement.data);
      setVehicules(resRecensement.data?.vehicules || []);
      setSuccess(`Recensement de l'année ${annee} chargé avec succès.`);

    } catch (err) {
      console.error("Erreur de recherche :", err);
      if (err.response?.status === 404) {
        setError(`Aucun recensement n'existe pour le SOA "${codeSoa}" sur l'année ${annee}.`);
      } else {
        setError(err.response?.data?.message || err.message || "Erreur de liaison avec l'API.");
      }
    } finally {
      setLoading(false);
    }
  };

    // 1. FILTRAGE PAR RECHERCHE ET STATUT
  const filteredVehicules = useMemo(() => {
    const term = search.trim().toLowerCase();
    return vehicules.filter((v) => {
      const matchSearch = !term ||
        v.immatriculation?.toLowerCase().includes(term) ||
        v.marque?.toLowerCase().includes(term) ||
        v.type?.toLowerCase().includes(term) ||
        v.genre?.toLowerCase().includes(term) ||
        v.detenteurEffectif?.toLowerCase().includes(term);

      const matchStatut = filterStatut === "TOUS" || v.statut === filterStatut;
      return matchSearch && matchStatut;
    });
  }, [vehicules, search, filterStatut]);

  // 2. TRI PAR COLONNE
  const sortedVehicules = useMemo(() => {
    const result = [...filteredVehicules];
    result.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      const comp = String(valA).localeCompare(String(valB), "fr", { numeric: true });
      return sortDirection === "asc" ? comp : -comp;
    });
    return result;
  }, [filteredVehicules, sortField, sortDirection]);

  const changerTri = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderFleche = (field) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-haigana-blue ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  // 3. ACTION DE SUPPRESSION COMPLÈTE DU RECENSEMENT DE L'ANNÉE ET SES VÉHICULES

  const handleSupprimerRecensementComplet = async () => {
    if (!recensement?.id) return;

    const confirmation = window.confirm(
      `ACTION IRRÉVERSIBLE ⚠\n\nVoulez-vous vraiment supprimer l'INTÉGRALITÉ du recensement de l'année ${recensement.annee} pour le SOA "${recensement.codeSoa}" ?\n\nCela effacera définitivement le rapport ainsi que les ${vehicules.length} fiches de snapshots de véhicules liées.`
    );

    if (!confirmation) return;

    try {
      setSubmitting(true);
      setError("");

      // Appel de l'endpoint DELETE configuré pour effacer l'entité Recensement
      await client.delete(`/recensements/${recensement.id}`);

      setSuccess(`Le recensement complet de l'année ${recensement.annee} a été supprimé avec succès.`);
      setRecensement(null);
      setVehicules([]);
      setCodeSoa("");

    } catch (err) {
      console.error("Erreur suppression globale :", err);
      setError(err.response?.data?.message || "Impossible de supprimer le recensement annuel.");
    } finally {
      setSubmitting(false);
    }
  };

    return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
          <Link
            to="/gestion"
            className="hover:text-haigana-blue transition-colors"
          >
            Gestion
          </Link>

          <span>/</span>

          <span className="text-haigana-dark font-medium">
            Recensement
          </span>

        </div>
        {/* TITRE DE LA PAGE */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-haigana-dark">Gestion Administrative des Recensements</h1>
          <p className="text-sm text-gray-500 mt-1">Recherche, consultation et purge complète des historiques annuels par code SOA.</p>
        </div>

        {/* BARRE DE SELECTION PRINCIPALE */}
        <form onSubmit={handleRechercher} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Année de Recensement *</label>
            <input
              type="number"
              required
              value={annee}
              onChange={(e) => handleCritereChange("annee", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-haigana-blue/20"
            />
          </div>
          <div className="w-full md:flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Code SOA Recherché *</label>
            <input
              type="text"
              required
              value={codeSoa}
              onChange={(e) => handleCritereChange("codeSoa", e.target.value)}
              placeholder="Entrer le code"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-haigana-blue/20 uppercase"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-haigana-dark text-white font-semibold hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </form>

                {/* NOTIFICATIONS */}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-sm">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium text-sm">{success}</div>}

        {/* AJUSTEMENT : ESPACEMENT ET GUIDE VISUEL LORSQUE LE TABLEAU EST ABSENT */}
        {!recensement && !loading && (
          <div className="py-24 my-6 bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">

                <circle
                  cx="11"
                  cy="11"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="m16 16 5 5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-700">Aucun recensement affiché</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm px-4">
              Veuillez saisir une année et un code SOA ci-dessus puis cliquez sur le bouton <strong>Rechercher</strong> pour charger le tableau des véhicules.
            </p>
          </div>
        )}

        {/* AFFICHAGE DU COMPOSANT UNIQUEMENT SI UN RECENSEMENT EST CHARGÉ */}
        {recensement && (
          <div className="space-y-6 mt-6">

            {/* EN-TÊTE D'AFFICHAGE RECHERCHE AVANCEE LOCALE */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer par immatriculation, marque, type..."
                className="w-full sm:max-w-md px-4 py-2 bg-gray-50 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-haigana-blue/20"
              />
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-gray-50 rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-haigana-blue/20 text-gray-700"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="IDENTIQUE">Identiques</option>
                <option value="MODIFIE">Modifiés</option>
                <option value="NOUVEAU">Nouveaux</option>
                <option value="ABSENT">Absents</option>
              </select>
            </div>

                        {/* LE TABLEAU DE SNAPSHOTS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 cursor-pointer select-none" onClick={() => changerTri("immatriculation")}>Immatriculation {renderFleche("immatriculation")}</th>
                      <th className="px-6 py-4 cursor-pointer select-none" onClick={() => changerTri("marque")}>Marque {renderFleche("marque")}</th>
                      <th className="px-6 py-4 cursor-pointer select-none" onClick={() => changerTri("type")}>Type {renderFleche("type")}</th>
                      <th className="px-6 py-4">Genre</th>
                      <th className="px-6 py-4">Énergie</th>
                      <th className="px-6 py-4">État mécanique</th>
                      <th className="px-6 py-4 text-center">Statut</th>
                      {hasRole("ADMINISTRATEUR") && <th className="px-6 py-4 text-right">Action</th>} {/* Colonne conditionnelle */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                    {sortedVehicules.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-haigana-dark">{v.immatriculation || "—"}</td>
                        <td className="px-6 py-4">{v.marque || "—"}</td>
                        <td className="px-6 py-4 text-gray-500">{v.type || "—"}</td>
                        <td className="px-6 py-4">{v.genre || "—"}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{v.sourceEnergie || "—"}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{v.etatGeneral || "—"}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-bold ${STATUT_CONFIG[v.statut]?.className || ""}`}>
                            {STATUT_CONFIG[v.statut]?.label || v.statut}
                          </span>
                        </td>
                        
                        {/*  BOUTON SUPPRIMER PAR LIGNE POUR L'ADMINISTRATEUR */}
                        {hasRole("ADMINISTRATEUR") && (
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSupprimerVehiculeLigne(v)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Retirer ce véhicule du recensement"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION FINALE DE PURGE COMPLÈTE EN BAS À DROITE */}
            {hasRole("ADMINISTRATEUR") && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSupprimerRecensementComplet}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md hover:bg-red-700 transition disabled:opacity-40"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                  </svg>

                  {submitting
                    ? "Suppression complète..."
                    : "Supprimer le Recensement de l'année"}
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
