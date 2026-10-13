import React, { useEffect, useState } from "react";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { Link } from "react-router-dom";

const emptyForm = { nomDetenteur: "", prenomDetenteur: "", cinDetenteur: "", immatriculeDetenteur: "", serviceId: "" };

export default function DetenteurAdmin() {
  const [detenteurs, setDetenteurs] = useState([]);
  const [soaList, setSoaList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function loadDetenteurs() {
    client.get("/detenteurs").then((r) => setDetenteurs(r.data));
  }

  useEffect(() => {
    loadDetenteurs();
    client.get("/soa").then((r) => setSoaList(r.data));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await client.post("/detenteurs", {
        nomDetenteur: form.nomDetenteur,
        prenomDetenteur: form.prenomDetenteur,
        cinDetenteur: form.cinDetenteur,
        immatriculeDetenteur: form.immatriculeDetenteur,
        service: form.serviceId ? { id: Number(form.serviceId) } : null,
      });
      setForm(emptyForm);
      loadDetenteurs();
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'ajout du detenteur.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = detenteurs.filter(
    (d) =>
      d.nomDetenteur?.toLowerCase().includes(search.toLowerCase()) ||
      d.cinDetenteur?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all bg-white";
  const labelClass = "block text-sm font-medium text-haigana-dark mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      <h1 className="text-2xl font-bold text-haigana-dark mb-6">Gestion des detenteurs</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-8 space-y-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nom</label>
            <input required value={form.nomDetenteur} onChange={(e) => set("nomDetenteur", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prenom</label>
            <input required value={form.prenomDetenteur} onChange={(e) => set("prenomDetenteur", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>CIN</label>
            <input required value={form.cinDetenteur} onChange={(e) => set("cinDetenteur", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Matricule</label>
            <input required value={form.immatriculeDetenteur} onChange={(e) => set("immatriculeDetenteur", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Service (Code SOA)</label>
            <select required value={form.serviceId} onChange={(e) => set("serviceId", e.target.value)} className={inputClass}>
              <option value="">Choisir...</option>
              {soaList.map((s) => (
                <option key={s.id} value={s.id}>{s.codeSoa}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors disabled:opacity-60">
            {submitting ? "Ajout..." : "Ajouter le detenteur"}
          </button>
        </div>
      </form>

      <SearchSortBar search={search} onSearchChange={setSearch} placeholder="Rechercher par nom ou CIN..." />

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-haigana-dark text-white">
            <tr>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3">Prenom</th>
              <th className="text-left px-4 py-3">CIN</th>
              <th className="text-left px-4 py-3">Matricule</th>
              <th className="text-left px-4 py-3">Service</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors">
                <td className="px-4 py-3 font-medium text-haigana-dark">{d.nomDetenteur}</td>
                <td className="px-4 py-3">{d.prenomDetenteur}</td>
                <td className="px-4 py-3">{d.cinDetenteur}</td>
                <td className="px-4 py-3">{d.immatriculeDetenteur}</td>
                <td className="px-4 py-3">{d.service?.codeSoa || "-"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun detenteur enregistre.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}