import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext"; // ALIGNEMENT DE SÉCURITÉ CONTEXTUEL

export default function GestionSoa() {
  const navigate = useNavigate();
  const { hasRole } = useAuth(); // LIEN UNIQUE SUR VOTRE HOOK DE SÉCURITÉ GLOBAL

  const [listeSoa, setListeSoa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modèle d'état unifié pour le formulaire racine
  const [form, setForm] = useState({ id: null, codeSoa: "", nomRegion: "BOENY", nomMinistere: "", districtMinistere: "MAHAJANGA I" });
  const [isEditing, setIsModifiant] = useState(false);
  
  // États dédiés aux filtres, recherches et tris de la grille responsive
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("codeSoa");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    chargerSoa();
  }, []);

  const chargerSoa = async () => {
    setLoading(true); setError("");
    try {
      const res = await client.get("/soa"); // Route GET originale du SoaController
      setListeSoa(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement SOA :", err);
      setError("Impossible de charger le répertoire des Codes SOA.");
    } finally { setLoading(false); }
  };

  const handleSaisieSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (!form.codeSoa.trim() || !form.nomMinistere.trim()) {
      setError("Le Code SOA et la désignation d'institution sont obligatoires.");
      return;
    }

    const payload = {
      codeSoa: form.codeSoa.trim(),
      regionId: form.nomRegion === "BOENY" ? 1 : null,
      nomMinistere: form.nomMinistere.trim().toUpperCase(),
      districtMinistere: form.districtMinistere.trim() || "MAHAJANGA I",
      vehicules: [] // Envoyé vide : crée le SOA seul sans véhicules en BDD
    };

    try {
      if (isEditing && form.id) {
        // Appelle la méthode backend updateSOA (PUT /api/soa/{id})
        await client.put(`/soa/${form.id}`, payload);
        setSuccess("Code SOA modifié avec succès.");
      } else {
        // Appelle la méthode backend createSOA (POST /api/soa)
        await client.post("/soa", payload);
        setSuccess("Code SOA ajouté avec succès.");
      }
      setForm({ id: null, codeSoa: "", nomRegion: "BOENY", nomMinistere: "", districtMinistere: "MAHAJANGA I" });
      setIsModifiant(false);
      await chargerSoa();
    } catch (err) {
      console.error("Erreur action SOA :", err);
      setError(err.response?.data?.message || "Une erreur est survenue lors du traitement.");
    }
  };

  const handlePurgerSoa = async (id, code) => {
    if (!window.confirm(`ATTENTION ! Supprimer le SOA ${code} détruira définitivement son inventaire immobilier, matériel et automobile. Continuer ?`)) {
      return;
    }

    setError(""); setSuccess("");
    try {
      // Appelle la méthode backend deleteSOA (DELETE /api/soa/{id})
      await client.delete(`/soa/${id}`);
      setSuccess("Code SOA supprimé avec succès.");
      await chargerSoa();
    } catch (err) {
      console.error("Erreur suppression SOA :", err);
      setError(err.response?.data?.message || "Impossible de supprimer ce Code SOA.");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

    const filteredAndSortedSoa = useMemo(() => {
    const terme = searchTerm.toLowerCase().trim();
    
    // 1. Filtrage réactif multicritère
    let res = listeSoa.filter((item) =>
      (item.codeSoa || "").toLowerCase().includes(terme) ||
      (item.ministere?.nomMinistere || "").toLowerCase().includes(terme) ||
      (item.ministere?.districtMinistere || "").toLowerCase().includes(terme)
    );

    // 2. Tri synchrone déterministe par colonne
    return [...res].sort((a, b) => {
      let valA = sortBy === "codeSoa" ? a.codeSoa : sortBy === "ministere" ? a.ministere?.nomMinistere : a.ministere?.districtMinistere;
      let valB = sortBy === "codeSoa" ? b.codeSoa : sortBy === "ministere" ? b.ministere?.nomMinistere : b.ministere?.districtMinistere;

      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [listeSoa, searchTerm, sortBy, sortOrder]);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-6 md:py-10">
      
      {/* FIL D'ARIANE */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-4 md:mb-5">
        <Link to="/gestion" className="hover:text-haigana-blue transition-colors">Gestion</Link>
        <span>/</span>
        <span className="text-haigana-dark font-medium">Codes SOA</span>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-haigana-dark mb-1.5">Gestion des Codes SOA</h1>
      <p className="text-xs md:text-sm text-gray-500 mb-6">Visualisez, filtrez, triez ou modifiez la cartographie ministérielle des services de l'État.</p>

      {/* FORMULAIRE ACCESSIBLE SELON LE RÔLE */}
      {(hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) && (
        <form onSubmit={handleSaisieSubmit} className="bg-white rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-gray-100 shadow-sm">
          <h2 className="text-sm md:text-base font-semibold text-haigana-dark mb-3 md:mb-4">{isEditing ? "Modifier un Code SOA" : "Ajouter un Code SOA"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <label className="block text-xs font-medium text-haigana-dark mb-1">Code SOA *</label>
              <input type="text" required  value={form.codeSoa} onChange={(e) => setForm({ ...form, codeSoa: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-white border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20" placeholder="Ex : 21010300" />
            </div>
            <div className="md:col-span-2 w-full">
              <label className="block text-xs font-medium text-haigana-dark mb-1">Ministère / Institution Affectée *</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" required value={form.nomMinistere} onChange={(e) => setForm({ ...form, nomMinistere: e.target.value })} className="w-full px-3 py-2 rounded-lg border text-xs outline-none bg-white border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20" placeholder="Ex : MINISTERE DE LA SANTE PUBLIQUE" />
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button type="submit" className="px-4 py-2 bg-haigana-dark text-white rounded-lg text-xs font-semibold hover:bg-haigana-blue transition-colors w-full sm:w-auto">{isEditing ? "Modifier" : "Ajouter"}</button>
                  {isEditing && <button type="button" onClick={() => { setForm({ id: null, codeSoa: "", nomRegion: "BOENY", nomMinistere: "", districtMinistere: "MAHAJANGA I" }); setIsModifiant(false); }} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200">Annuler</button>}
                </div>
              </div>
            </div>
          </div>
          {error && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</p>}
        </form>
      )}

      {/* CHAMP DE RECHERCHE DYNAMIQUE */}
      <div className="mb-4">
        <input type="text" placeholder="Rechercher par Code SOA, libellé d'institution, circonscription..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white outline-none focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20" />
      </div>

      {/* CONTENEUR RESPONSIVE : overflow-x-auto + select-none bloquent l'éclatement sur mobile */}
      <div className="w-full overflow-x-auto border rounded-2xl shadow-sm bg-white border-gray-100">
        <table className="w-full text-xs text-left whitespace-nowrap md:whitespace-normal border-collapse">
          <thead className="bg-haigana-dark text-white select-none">
            <tr>
              <th onClick={() => handleSort("codeSoa")} className="px-3 md:px-4 py-3 w-28 md:w-32 cursor-pointer hover:bg-slate-700 transition-colors">Code SOA {sortBy === "codeSoa" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
              <th onClick={() => handleSort("ministere")} className="px-3 md:px-4 py-3 cursor-pointer hover:bg-slate-700 transition-colors">Ministère / Institution de Rattachement {sortBy === "ministere" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
              <th onClick={() => handleSort("district")} className="px-3 md:px-4 py-3 w-32 md:w-36 cursor-pointer hover:bg-slate-700 transition-colors">Circonscription {sortBy === "district" ? (sortOrder === "asc" ? "▲" : "▼") : ""}</th>
              <th className="px-3 md:px-4 py-3 w-36 md:w-44 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedSoa.map((item) => (
              <tr key={item.id} className="hover:bg-haigana-bg/40 transition-colors">
                <td className="px-3 md:px-4 py-3 font-bold text-blue-600 tracking-wide">{item.codeSoa}</td>
                {/* TRONCATURE SMART : S'adapte dynamiquement à la taille de la cellule */}
                <td className="px-3 md:px-4 py-3 font-semibold text-haigana-dark uppercase max-w-xs md:max-w-md truncate">{item.ministere?.nomMinistere || "—"}</td>
                <td className="px-3 md:px-4 py-3 text-gray-500 font-medium truncate max-w-[120px] md:max-w-none">{item.ministere?.districtMinistere || "MAHAJANGA I"}</td>
                <td className="px-3 md:px-4 py-3">
                  <div className="flex justify-center gap-1.5 md:gap-2">
                    {/* ACCÈS ÉDITION : ADMINISTRATEUR et MODIFICATEUR uniquement */}
                    {(hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) ? (
                      <button type="button" onClick={() => { setForm({ id: item.id, codeSoa: item.codeSoa, nomRegion: "BOENY", nomMinistere: item.ministere?.nomMinistere || "", districtMinistere: item.ministere?.districtMinistere || "MAHAJANGA I" }); setIsModifiant(true); setError(""); setSuccess(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-2 md:px-3 py-1 md:py-1.5 bg-amber-500 text-white rounded-lg text-[10px] md:text-xs font-bold hover:bg-amber-600 transition-colors">Modifier</button>
                    ) : (
                      <span className="text-gray-400 italic text-[10px] md:text-[11px] py-1">Lecture seule</span>
                    )}
                    {/* ACCÈS PURGE CASCADE : Réservé EXCLUSIVEMENT à l'ADMINISTRATEUR */}
                    {hasRole("ADMINISTRATEUR") && (
                      <button type="button" onClick={() => handlePurgerSoa(item.id, item.codeSoa)} className="px-2 md:px-3 py-1 md:py-1.5 bg-red-600 text-white rounded-lg text-[10px] md:text-xs font-bold hover:bg-red-700 transition-colors">Supprimer</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSortedSoa.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 italic text-xs">Aucun Code SOA répertorié ou correspondant aux critères.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}