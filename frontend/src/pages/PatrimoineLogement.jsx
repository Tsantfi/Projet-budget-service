import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate, useSearchParams} from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Logement() {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const codeSoaUrl =
    searchParams.get("codeSoa") || "";

  const anneeUrl =
    searchParams.get("annee") || "";

  const { hasRole } = useAuth();

  // RECHERCHE

  const [codeSoa, setCodeSoa] =
    useState(codeSoaUrl);

  const [annee, setAnnee] =
    useState(anneeUrl || String(new Date().getFullYear()));

  // DONNEES

  const [soa, setSoa] = useState(null);

  const [logements, setLogements] =
    useState([]);

  // ETAT

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [rechercheEffectuee, setRechercheEffectuee] =useState(false);

  // CONDAMNATION

  const [
    logementCondamnation,
    setLogementCondamnation
  ] = useState(null);

  const [
    dateAvantCondamnation,
    setDateAvantCondamnation
  ] = useState("");

  const [
    condamnationLoading,
    setCondamnationLoading
  ] = useState(false);

  // RECHERCHER

  async function rechercher(
  codeSoaRecherche = codeSoa,
  anneeRecherche = annee
  ) {
    const code = codeSoaRecherche.trim();

  setRechercheEffectuee(false);

  if (!code) {
    setSoa(null);
    setLogements([]);
    setError("Veuillez saisir un Code SOA.");
    return;
  }

  if (!anneeRecherche) {
    setSoa(null);
    setLogements([]);
    setError("Veuillez saisir une année.");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setSuccess("");

    const resSoa = await client.get(
      `/soa/code/${encodeURIComponent(code)}`
    );

    const soaData = resSoa.data;

    if (!soaData?.id) {
      throw new Error("Code SOA introuvable.");
    }

    const resLogements = await client.get(
      `/logements?soaId=${soaData.id}&annee=${Number(anneeRecherche)}`
    );

    setSoa(soaData);

    setLogements(
      Array.isArray(resLogements.data)
        ? resLogements.data
        : []
    );

    setRechercheEffectuee(true);

  } catch (err) {
    console.error(
      "Erreur chargement logements :",
      err
    );

    setSoa(null);
    setLogements([]);

    setError(
      err.response?.data?.message ||
      err.response?.data?.detail ||
      err.message ||
      "Impossible de charger les logements."
    );

  } finally {
    setLoading(false);
  }
}

  // CHARGEMENT AUTOMATIQUE DEPUIS L'URL

  useEffect(() => {
  if (codeSoaUrl && anneeUrl) {
    setCodeSoa(codeSoaUrl);
    setAnnee(anneeUrl);

    rechercher(
      codeSoaUrl,
      anneeUrl
    );
  }
  }, [codeSoaUrl, anneeUrl]);

  // FILTRE

  const logementsFiltres =
    useMemo(() => {

      const terme =
        search
          .trim()
          .toLowerCase();

      if (!terme) {
        return logements;
      }

      return logements.filter(
        (logement) =>
          String(
            logement.numero ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.nomBatiment ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.nature ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.entiteUtilisatrice ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.occupant ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.etatBatisse ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.localite ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.adressePointRepere ?? ""
          )
            .toLowerCase()
            .includes(terme) ||

          String(
            logement.etatGeneral ?? ""
          )
            .toLowerCase()
            .includes(terme)
      );

    }, [logements, search]);

  // VOIR

  function voirLogement(logement) {

    if (!logement?.id) {
      return;
    }

    navigate(
      `/patrimoine/logement/${logement.id}/consultation?codeSoa=${encodeURIComponent(
    soa.codeSoa
  )}&annee=${annee}`

  );
  }

  // MODIFIER

  function modifierLogement(logement) {

    if (!hasRole(
      "ADMINISTRATEUR",
      "MODIFICATEUR"
    )) {
      return;
    }

    navigate(
  `/patrimoine/logement/${logement.id}/modifier?codeSoa=${encodeURIComponent(
    soa.codeSoa
  )}&annee=${annee}`
  )
}

  // CONDAMNER

  function ouvrirCondamnation(logement) {

    if (!hasRole("ADMINISTRATEUR")) {
      return;
    }

    setError("");
    setSuccess("");

    setDateAvantCondamnation("");

    setLogementCondamnation(
      logement
    );
  }

  async function confirmerCondamnation() {

    if (
      !logementCondamnation?.id
    ) {
      return;
    }

    if (!dateAvantCondamnation) {

      setError(
        "Veuillez saisir la date avant condamnation."
      );

      return;
    }

    try {

      setCondamnationLoading(true);
      setError("");

      await client.post(
        `/logements/${logementCondamnation.id}/condamnation`,
        {
          dateAvantCondamnation:
            dateAvantCondamnation,
        }
      );

      setLogementCondamnation(null);

      setSuccess(
        "Le logement a été condamné avec succès."
      );

      await rechercher();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Impossible de condamner le logement."
      );

    } finally {

      setCondamnationLoading(false);

    }
  }

  return (

    <div className="max-w-7xl mx-auto px-4 py-10">

      
      {/* TITRE */}
      

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Logements
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gestion des logements et bâtiments administratifs
          </p>

        </div>

      </div>

      
      {/* RECHERCHE SOA */}
      

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>

            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Code SOA
            </label>

            <input
              type="text"
              value={codeSoa}
              onChange={(e) =>
                setCodeSoa(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  rechercher();
                }

              }}
              placeholder="Saisir le Code SOA"
              className="
                w-full
                px-4
                py-2.5
                rounded-lg
                border
                border-gray-200
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
                outline-none
                transition-all
              "
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-haigana-dark mb-1">
              Année
            </label>

            <input
              type="number"
              min="2000"
              max="2100"
              value={annee}
              onChange={(e) =>
                setAnnee(e.target.value)
              }
              className="
                w-full
                px-4
                py-2.5
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

          <div className="flex items-end gap-4">

            <button
              type="button"
              onClick={() => rechercher()}
              disabled={loading}
              className="
                w-full
                px-5
                py-2.5
                rounded-lg
                bg-haigana-dark
                text-white
                font-semibold
                hover:bg-haigana-blue
                transition-colors
                disabled:opacity-50
              "
            >

              {loading
                ? "Recherche..."
                : "Rechercher"
              }

            </button>

            {/* BOUTON 2 : IMPORTER EXCEL PLACÉ PRÈS DE LA RECHERCHE (CORRIGÉ TAILLE) */}
          <div className="w-full md:w-auto">
            {/* À COLLER DIRECTEMENT À LA SUITE DU BOUTON RECENSEMENT : */}
            {hasRole("ADMINISTRATEUR") && (
              <button
                type="button"
                onClick={() => navigate(`/patrimoine/logements/import?annee=${annee}`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors text-sm flex items-center justify-center gap-2 shadow-sm whitespace-nowrap h-[42px]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
                <span>Importer Excel</span>
              </button>
            )}
          </div>

          </div>

        </div>

      </div>

      
      {/* MESSAGES */}
      

      {error && (

        <div className="
          mb-5
          text-sm
          text-red-600
          bg-red-50
          border
          border-red-100
          rounded-lg
          px-4
          py-3
        ">
          {error}
        </div>

      )}

      {success && (

        <div className="
          mb-5
          text-sm
          text-green-700
          bg-green-50
          border
          border-green-100
          rounded-lg
          px-4
          py-3
        ">
          {success}
        </div>

      )}

      {/* SOA */}

      {rechercheEffectuee && soa && (

        <div className="
          bg-white
          rounded-2xl
          border
          border-gray-100
          shadow-sm
          p-5
          mb-6
        ">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">
                Code SOA
              </p>

              <p className="text-lg font-bold text-haigana-dark">
                {soa.codeSoa}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">
                Ministère
              </p>

              <p className="text-sm font-semibold text-gray-700">
                {soa.ministere?.nomMinistere || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-bold">
                Année
              </p>

              <p className="text-sm font-semibold text-gray-700">
                {annee}
              </p>
            </div>

          </div>

        </div>

      )}

      {/* ACTIONS GLOBALES */}
      {rechercheEffectuee && soa &&  (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-haigana-dark">Gestion</h2>
              <p className="text-xs text-gray-500 mt-1">Actions pour le Code SOA sélectionné</p>
            </div>

            {/* w-full étire le conteneur en mobile, sm:w-auto le fige sur bureau */}
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
              {/* BUTTON 1 : ENTREE */}

              {(hasRole("ADMINISTRATEUR") &&
              <button
                type="button"
                onClick={() => navigate(`/patrimoine/logement/entree?soaId=${soa.id}&codeSoa=${encodeURIComponent(soa.codeSoa)}&annee=${annee}`)}
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors text-sm h-[42px] flex items-center justify-center"
              >
                Entrée
              </button>
              )}

              {/* BUTTON 2 : RECENSEMENT */}
              {((hasRole("ADMINISTRATEUR") || hasRole("MODIFICATEUR")) &&
              (<button
                type="button"
                onClick={() => navigate(`/patrimoine/logement/recensement?soaId=${soa.id}&codeSoa=${encodeURIComponent(soa.codeSoa)}&annee=${annee}`)}
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg border border-haigana-blue text-haigana-blue font-semibold hover:bg-haigana-blue hover:text-white transition-colors text-sm h-[42px] flex items-center justify-center"
              >
                Recensement
              </button>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* TABLEAU BATIMENT */}
      {rechercheEffectuee && soa && (
      <div className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        shadow-sm
        overflow-hidden
      ">

        <div className="p-5 border-b border-gray-100">

          <div className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          ">

            <div>

              <h2 className="text-base font-bold text-haigana-dark">
                BATIMENT
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                {logementsFiltres.length} ligne(s)
              </p>

            </div>

            <div className="w-full md:w-80">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher..."
                className="
                  w-full
                  px-4
                  py-2.5
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

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-haigana-bg">

              <tr>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  N°
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Nom du bâtiment
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Nature
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Entité
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Occupant
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  État de la bâtisse
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Localité
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  Adresse / point de repère
                </th>

                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                  État général
                </th>

                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading && (

                <tr>

                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Chargement...
                  </td>

                </tr>

              )}

              {!loading &&
                logementsFiltres.length === 0 && (

                  <tr>

                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      Aucun bâtiment trouvé.
                    </td>

                  </tr>

                )}

              {!loading &&
                logementsFiltres.map(
                  (logement) => (

                    <tr
                      key={logement.id}
                      className="
                        border-t
                        border-gray-100
                        hover:bg-haigana-bg/60
                        transition-colors
                      "
                    >

                      <td className="px-4 py-3">
                        {logement.numero ?? "—"}
                      </td>

                      <td className="px-4 py-3 font-medium text-haigana-dark">
                        {logement.nomBatiment || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.nature || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.entiteUtilisatrice || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.occupant || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.etatBatisse || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.localite || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.adressePointRepere || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {logement.etatGeneral || "—"}
                      </td>

                      <td className="px-4 py-3">

                        <div className="
                          flex
                          justify-end
                          items-center
                          gap-3
                          whitespace-nowrap
                        ">

                          {/* VOIR */}

                          <button
                            type="button"
                            onClick={() =>
                              voirLogement(logement)
                            }
                            className="
                              text-haigana-blue
                              hover:text-haigana-dark
                              font-medium
                            "
                          >
                            Voir
                          </button>

                          {/* MODIFIER */}

                          {hasRole(
                            "ADMINISTRATEUR",
                            "MODIFICATEUR"
                          ) && (

                            <button
                              type="button"
                              onClick={() =>
                                modifierLogement(
                                  logement
                                )
                              }
                              className="
                                text-haigana-blue
                                hover:text-haigana-dark
                                font-medium
                              "
                            >
                              Modifier
                            </button>

                          )}

                          {/* CONDAMNER */}

                          {hasRole(
                            "ADMINISTRATEUR"
                          ) && (

                            <button
                              type="button"
                              onClick={() =>
                                ouvrirCondamnation(
                                  logement
                                )
                              }
                              className="
                                text-red-600
                                hover:text-red-800
                                font-medium
                              "
                            >
                              Condamner
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

            </tbody>

          </table>

        </div>

      </div>
      )}

      {/* MODAL CONDAMNATION */}

      {logementCondamnation && (

        <div className="
          fixed
          inset-0
          z-50
          bg-black/40
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-xl
          ">

            <div className="p-6 border-b border-gray-100">

              <h3 className="text-lg font-bold text-haigana-dark">
                Condamner le logement
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {logementCondamnation.nomBatiment}
              </p>

            </div>

            <div className="p-6">

              <label className="block text-sm font-medium text-haigana-dark mb-1">
                Date avant condamnation *
              </label>

              <input
                type="date"
                value={dateAvantCondamnation}
                onChange={(e) =>
                  setDateAvantCondamnation(
                    e.target.value
                  )
                }
                className="
                  w-full
                  px-4
                  py-2.5
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

            <div className="
              p-6
              border-t
              border-gray-100
              flex
              justify-end
              gap-3
            ">

              <button
                type="button"
                onClick={() => {
                  setLogementCondamnation(null);
                  setDateAvantCondamnation("");
                }}
                disabled={condamnationLoading}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  border
                  border-gray-200
                  text-gray-600
                  font-medium
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmerCondamnation}
                disabled={condamnationLoading}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  disabled:opacity-50
                "
              >
                {condamnationLoading
                  ? "Condamnation..."
                  : "Condamner"
                }
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}