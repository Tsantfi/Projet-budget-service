import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function VehiculeSoa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const [codeSoa, setCodeSoa] = useState("");
  const [selectedSoa, setSelectedSoa] = useState(null);

  const [vehicules, setVehicules] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [searchVehicule, setSearchVehicule] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // FORMATAGE

  function formatValeur(valeur) {
    if (valeur === null || valeur === undefined || valeur === "") {
      return "—";
    }

    return `${Number(valeur).toLocaleString("fr-FR")} Ar`;
  }


  // CHARGER UN SOA

  async function chargerSoa(code) {
    const codeRecherche = code?.trim();

    if (!codeRecherche) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      setSelectedSoa(null);
      setVehicules([]);
      setSelectedVehicle(null);
      setSearchVehicule("");

      // -------------------------------------------------------
      // SOA
      // -------------------------------------------------------

      const { data: soa } = await client.get(
        `/soa/code/${encodeURIComponent(codeRecherche)}`
      );

      setSelectedSoa(soa);

      setCodeSoa(
        soa.codeSoa ||
        soa.code ||
        codeRecherche
      );


      // -------------------------------------------------------
      // VEHICULES DU SOA
      // -------------------------------------------------------

      const { data: vehiculesData } = await client.get(
        `/vehicules?soaId=${soa.id}`
      );

      setVehicules(vehiculesData || []);

    } catch (err) {
      console.error("Erreur chargement SOA :", err);

      setSelectedSoa(null);
      setVehicules([]);
      setSelectedVehicle(null);

      if (err.response?.status === 404) {
        setError("Code SOA introuvable.");
      } else {
        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les informations du Code SOA."
        );
      }

    } finally {
      setLoading(false);
    }
  }


  // RECHERCHE SOA

  async function handleSearchSoa() {
    const code = codeSoa.trim();

    if (!code) {
      setError("Veuillez saisir un code SOA.");

      setSelectedSoa(null);
      setVehicules([]);
      setSelectedVehicle(null);

      return;
    }

    await chargerSoa(code);
  }


  // RETOUR DEPUIS UNE AUTRE PAGE

  useEffect(() => {
    const retour = location.state?.retourSoa;

    if (!retour?.codeSoa) {
      return;
    }

    chargerSoa(retour.codeSoa);

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  }, [location.state]);


  // FILTRAGE DES VEHICULES

  const filteredVehicules = useMemo(() => {
    const recherche = searchVehicule
      .trim()
      .toLowerCase();

    if (!recherche) {
      return vehicules;
    }

    return vehicules.filter((vehicule) => {

      const immatricule =
        vehicule.immatricule
          ?.toLowerCase() || "";

      const carburant =
        vehicule.carburant?.nomCarburant
          ?.toLowerCase() ||
        vehicule.carburant?.libelle
          ?.toLowerCase() ||
        vehicule.carburant?.carburant
          ?.toLowerCase() ||
        "";

      const type =
        vehicule.typeVehicule?.typeDuVehicule
          ?.toLowerCase() ||
        vehicule.type?.typeDuVehicule
          ?.toLowerCase() ||
        "";

      return (
        immatricule.includes(recherche) ||
        carburant.includes(recherche) ||
        type.includes(recherche)
      );
    });

  }, [vehicules, searchVehicule]);


  // VALEUR TOTALE

  const totalValeur = useMemo(() => {
    return filteredVehicules.reduce(
      (total, vehicule) => {
        return (
          total +
          (Number(vehicule.prixVehicule) || 0)
        );
      },
      0
    );
  }, [filteredVehicules]);


  // CONSULTATION

  function handleConsult(vehicule) {
    navigate(
      `/patrimoine/vehicule/${vehicule.id}/consultation`
    );
  }


  // SORTIE

  function handleSortie() {

    if (!selectedVehicle) {
      setError("Veuillez sélectionner un véhicule.");
      return;
    }

    navigate(
      `/patrimoine/vehicule/${selectedVehicle.id}/sortie`
    );
  }

  //Fonction
  function handleTotalité() {
    navigate('/patrimoine/identification-soa');
  }


  // PRISE EN CHARGE

  function handlePriseEnCharge() {

    if (!selectedSoa?.id) {
      setError("Veuillez sélectionner un Code SOA.");
      return;
    }

    navigate(
      `/patrimoine/vehicule/nouveau?soaId=${selectedSoa.id}`
    );
  }


  // SORTIE DE QUITUS

  function handleSortieQuitus() {
    if (!selectedSoa) {
      setError("Veuillez sélectionner un Code SOA.");
      return;
    }

    navigate("/quitus/sortie", {
      state: {
        soaId: selectedSoa.id,

        ministere:
          selectedSoa.ministere?.nomMinistere ||
          selectedSoa.ministere?.nomMinist ||
          ""
      }
    });
  }

  // SELECTION VEHICULE

  function handleSelectVehicle(vehicule) {

    if (selectedVehicle?.id === vehicule.id) {
      setSelectedVehicle(null);
      return;
    }

    setSelectedVehicle(vehicule);
    setError("");
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-10">


      {/*TITRE*/}

      <div className="mb-8 flex flex-wrap gap-1 justify-between">

        <div>
          <h1 className="
          text-2xl
          md:text-3xl
          font-bold
          text-haigana-dark
        ">
            Véhicules
          </h1>

          <p className="text-gray-500 mt-2">
            Consultation et gestion des véhicules par Code SOA
          </p>

        </div>

        <div>

            <button
              type="button"
              onClick={handleTotalité}
              className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-green-600
                  text-white
                  font-semibold
                  hover:bg-green-700
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
            >
              Totalité
            </button>
        </div>

      </div>


      {/*RECHERCHE SOA*/}

      <div className="
        bg-white
        rounded-2xl
        shadow-card
        p-6
        mb-8
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          gap-3
        ">

          <div className="flex-1">

            <label
              htmlFor="codeSoa"
              className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2
              "
            >
              Code SOA
            </label>

            <input
              id="codeSoa"
              type="text"
              value={codeSoa}
              onChange={(e) => {
                setCodeSoa(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSoa();
                }
              }}
              placeholder="Entrer le code"
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-300
                outline-none
                transition
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
              "
            />

          </div>


          <div className="
            flex
            items-end
          ">

            <button
              type="button"
              onClick={handleSearchSoa}
              disabled={loading}
              className="
                w-full
                md:w-auto
                px-6
                py-3
                rounded-xl
                bg-haigana-blue
                text-white
                font-semibold
                hover:brightness-95
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {loading ? (
                <span className="
                  flex
                  items-center
                  justify-center
                  gap-2
                ">

                  <span className="
                    w-4
                    h-4
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    animate-spin"
                  />

                  Chargement...

                </span>
              ) : (
                "Rechercher"
              )}

            </button>
            {hasRole("ADMINISTRATEUR") && (
            <button
              type="button"
              onClick={() => navigate("/patrimoine/vehicules-import")}
              className="w-full md:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition whitespace-nowrap"
            >
              Importer Excel
            </button>
            )}

          </div>

        </div>


        {/* ERREUR */}

        {error && (
          <div className="
            mt-4
            px-4
            py-3
            rounded-xl
            bg-red-50
            border
            border-red-200
            text-red-700
            text-sm
          ">
            {error}
          </div>
        )}

      </div>


      {/*INFORMATIONS SOA*/}

      {selectedSoa && (

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          mb-8
          overflow-hidden
        ">

          <div className="
            p-6
            border-b
            border-gray-100
          ">

            <div className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                  mb-1
                ">
                  Code SOA
                </p>

                <h2 className="
                  text-xl
                  font-bold
                  text-haigana-dark
                ">
                  {selectedSoa.codeSoa ||
                    selectedSoa.code ||
                    codeSoa}
                </h2>

              </div>


              <div className="text-left md:text-right">

                <h2 className="
                  text-lg
                  md:text-xl
                  font-bold
                  text-haigana-dark
                ">
                  {selectedSoa.ministere?.nomMinistere ||
                    selectedSoa.ministere?.nomMinist ||
                    "Ministère non défini"}
                </h2>

              </div>

            </div>

          </div>


          {/*RECHERCHE VEHICULE
          ================================================== */}

          <div className="
            p-6
            border-b
            border-gray-100
          ">

            <label
              htmlFor="searchVehicule"
              className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2
              "
            >
              Rechercher un véhicule
            </label>

            <input
              id="searchVehicule"
              type="text"
              value={searchVehicule}
              onChange={(e) =>
                setSearchVehicule(e.target.value)
              }
              placeholder="Immatriculation, type ou carburant..."
              className="
                w-full
                px-4
                py-3
                rounded-xl
                border
                border-gray-300
                outline-none
                transition
                focus:border-haigana-blue
                focus:ring-2
                focus:ring-haigana-blue/20
              "
            />

          </div>


          {/* TABLEAU */}

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="
                bg-gray-50
                border-b
                border-gray-200
              ">

                <tr>

                  <th className="
                    px-4
                    py-4
                    text-left
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Sélection
                  </th>

                  <th className="
                    px-4
                    py-4
                    text-left
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Immatriculation
                  </th>

                  <th className="
                    px-4
                    py-4
                    text-left
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Type
                  </th>

                  <th className="
                    px-4
                    py-4
                    text-left
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Carburant
                  </th>

                  <th className="
                    px-4
                    py-4
                    text-right
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Valeur
                  </th>

                  <th className="
                    px-4
                    py-4
                    text-center
                    text-xs
                    font-bold
                    text-gray-500
                    uppercase
                  ">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredVehicules.length > 0 ? (

                  filteredVehicules.map((vehicule) => {

                    const selected =
                      selectedVehicle?.id === vehicule.id;

                    const type =
                      vehicule.typeVehicule?.typeDuVehicule ||
                      vehicule.type?.typeDuVehicule ||
                      "—";

                    const carburant =
                      vehicule.carburant?.nomCarburant ||
                      vehicule.carburant?.libelle ||
                      vehicule.carburant?.carburant ||
                      "—";


                    return (

                      <tr
                        key={vehicule.id}
                        onClick={() =>
                          handleSelectVehicle(vehicule)
                        }
                        className={`
                          cursor-pointer
                          transition
                          ${selected
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                          }
                        `}
                      >

                        {/* SELECTION */}

                        <td className="px-4 py-4">

                          <input
                            type="radio"
                            name="vehiculeSelection"
                            checked={selected}
                            onChange={() =>
                              handleSelectVehicle(vehicule)
                            }
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                            className="
                              w-4
                              h-4
                              accent-haigana-blue
                            "
                          />

                        </td>


                        {/* IMMATRICULATION */}

                        <td className="
                          px-4
                          py-4
                          font-semibold
                          text-haigana-dark
                        ">
                          {vehicule.immatricule || "—"}
                        </td>

                        {/* TYPE */}

                        <td className="
                          px-4
                          py-4
                          text-gray-700
                        ">
                          {type}
                        </td>


                        {/* CARBURANT */}

                        <td className="
                          px-4
                          py-4
                          text-gray-700
                        ">
                          {carburant}
                        </td>


                        {/* VALEUR */}

                        <td className="
                          px-4
                          py-4
                          text-right
                          font-semibold
                          text-gray-800
                        ">
                          {formatValeur(
                            vehicule.prixVehicule
                          )}
                        </td>


                        {/* ACTION */}

                        <td className="
                          px-4
                          py-4
                          text-center
                        ">

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConsult(vehicule);
                            }}
                            className="
                              px-4
                              py-2
                              rounded-lg
                              border
                              border-gray-300
                              text-gray-700
                              text-sm
                              font-semibold
                              hover:bg-gray-100
                              transition
                            "
                          >
                            Consulter
                          </button>

                        </td>

                      </tr>

                    );
                  })

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      className="
                        px-6
                        py-12
                        text-center
                        text-gray-500
                      "
                    >
                      Aucun véhicule trouvé pour ce Code SOA.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/*RESUME
          ================================================== */}

          <div className="
            p-6
            bg-gray-50
            border-t
            border-gray-100
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
          ">

            <div className="flex gap-8">

              <div>

                <p className="
                  text-xs
                  text-gray-500
                  uppercase
                  font-semibold
                ">
                  Véhicules
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-haigana-dark
                ">
                  {filteredVehicules.length}
                </p>

              </div>


              <div>

                <p className="
                  text-xs
                  text-gray-500
                  uppercase
                  font-semibold
                ">
                  Valeur totale
                </p>

                <p className="
                  text-xl
                  font-bold
                  text-haigana-dark
                ">
                  {formatValeur(totalValeur)}
                </p>

              </div>

            </div>

          </div>

          {/*BOUTONS ADMIN */}

          <div className="
            p-4
            border-t
            border-gray-100
            flex
            flex-wrap
            justify-end
            items-center
            gap-3
          ">

            {/* SORTIE */}

            {hasRole("ADMINISTRATEUR") && (

              <button
                type="button"
                onClick={handleSortie}
                disabled={!selectedVehicle}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-red-600
                  text-white
                  font-semibold
                  hover:bg-red-700
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                Supprimer
              </button>

            )}


            {/* ===============================================
                PRISE EN CHARGE
            ================================================ */}

            {hasRole(
              "ADMINISTRATEUR"
            ) && (

                <button
                  type="button"
                  onClick={handlePriseEnCharge}
                  className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-haigana-gold
                  text-haigana-dark
                  font-semibold
                  hover:brightness-95
                  transition-all
                "
                >
                  Ajouter
                </button>

              )}


            {/* ===============================================
                SORTIE DE QUITUS
            ================================================ */}

            {hasRole(
              "ADMINISTRATEUR"
            ) && (

                <button
                  type="button"
                  onClick={handleSortieQuitus}
                  disabled={!selectedSoa}
                  className="
                  px-5
                  py-2.5
                  rounded-lg
                  bg-haigana-blue
                  text-white
                  font-semibold
                  hover:brightness-95
                  transition-all
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
                >
                  Valider
                </button>

              )}

          </div>

        </div>

      )}

    </div>
  );
}