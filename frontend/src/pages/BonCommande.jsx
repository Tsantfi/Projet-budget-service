import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";
import { useAuth } from "../context/AuthContext";

export default function BonCommande() {

  const navigate = useNavigate();
  const { user } = useAuth();

  // SOA

  const [soaList, setSoaList] = useState([]);
  const [selectedSoa, setSelectedSoa] = useState(null);
  const [codeSoa, setCodeSoa] = useState("");

  // BONS

  const [bons, setBons] = useState([]);

  // ARGENT PUBLIC VÉHICULE

  const [argentPublic, setArgentPublic] = useState(null);

  // RECHERCHE / TRI

  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");

  // ÉTATS

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  // RÔLES

  const role =
    user?.role ||
    user?.roles?.[0] ||
    "";

  const isAdmin =
    role === "ADMINISTRATEUR" ||
    role === "ROLE_ADMINISTRATEUR";

  const isModificateur =
    role === "MODIFICATEUR" ||
    role === "ROLE_MODIFICATEUR";

  const canModify =
    isAdmin ||
    isModificateur;

  // FORMAT MONTANT

  const formatMontant = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "0 Ar";
    }

    return `${Number(value).toLocaleString("fr-FR")} Ar`;
  };

  // MESSAGE ERREUR

  const getErrorMessage = (err, defaultMessage) => {

    const data = err?.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.detail) {
      return data.detail;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.title) {
      return data.title;
    }

    return defaultMessage;
  };

  // CHARGER L'ARGENT PUBLIC


  const loadArgentPublic = async () => {
    try {
      const response = await client.get(
        "/argent-public-vehicule"
      );

      const data = response.data;

      console.log(
        "ARGENT PUBLIC REÇU PAR LE FRONTEND :",
        data
      );

      if (Array.isArray(data)) {
        if (data.length > 0) {
          const fonds = data[0];

          const montantTotal =
            Number(fonds.montantTotal) || 0;

          const montantUtilise =
            Number(fonds.montantUtilise) || 0;

          const montantDisponible =
            montantTotal - montantUtilise;

          setArgentPublic({
            ...fonds,
            montantTotal,
            montantUtilise,
            montantDisponible
          });
        } else {
          setArgentPublic(null);
        }
      } else if (data) {
        const montantTotal =
          Number(data.montantTotal) || 0;

        const montantUtilise =
          Number(data.montantUtilise) || 0;

        const montantDisponible =
          montantTotal - montantUtilise;

        setArgentPublic({
          ...data,
          montantTotal,
          montantUtilise,
          montantDisponible
        });
      } else {
        setArgentPublic(null);
      }

    } catch (err) {
      console.error(
        "Erreur chargement argent public :",
        err
      );

      setArgentPublic(null);
    }
  };

  // CHARGER LES BONS

  const loadBons = async (soaId) => {

    if (!soaId) {
      setBons([]);
      return;
    }

    try {

      const response = await client.get(
        `/bons-commande/tous?soaId=${soaId}`
      );

      setBons(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Impossible de charger les bons de commande."
        )
      );

      setBons([]);
    }
  };

  // CHARGEMENT INITIAL

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);
        setError("");

        const [soaResponse] = await Promise.all([
          client.get("/soa"),
          loadArgentPublic()
        ]);

        const soas =
          Array.isArray(soaResponse.data)
            ? soaResponse.data
            : [];

        setSoaList(soas);

        if (soas.length > 0) {

          setSelectedSoa(soas[0]);
          setCodeSoa(
            soas[0].codeSoa || ""
          );
        }

      } catch (err) {

        console.error(err);

        setError(
          getErrorMessage(
            err,
            "Impossible de charger les données."
          )
        );

      } finally {

        setLoading(false);
      }
    };

    loadData();

  }, []);

  // CHARGEMENT DES BONS LORSQUE LE SOA CHANGE

  useEffect(() => {

    if (selectedSoa?.id) {
      loadBons(selectedSoa.id);
    }

  }, [selectedSoa]);

  // RECHERCHE SOA

  const handleSearchSoa = async () => {

    const valeur = codeSoa.trim();

    if (!valeur) {
      return;
    }

    try {

      setError("");

      const response = await client.get(
        `/soa/code/${encodeURIComponent(valeur)}`
      );

      const soa = response.data;

      if (!soa) {

        setError(
          `Code SOA "${valeur}" introuvable.`
        );

        return;
      }

      setSelectedSoa(soa);

      await loadBons(soa.id);

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Code SOA introuvable."
        )
      );
    }
  };

  // CHANGEMENT SOA

  const handleChangeSoa = (e) => {

    const id = Number(e.target.value);

    const soa =
      soaList.find(
        (item) => item.id === id
      );

    if (!soa) {
      return;
    }

    setSelectedSoa(soa);

    setCodeSoa(
      soa.codeSoa || ""
    );

    setError("");
  };

  // FILTRAGE / TRI

  const bonsFiltres = useMemo(() => {

    let result = [...bons];

    const valeur =
      search.trim().toLowerCase();

    if (valeur) {

      result = result.filter((bon) => {

        const description =
          bon.description?.toLowerCase() || "";

        const date =
          bon.dateBon?.toString() || "";

        const annee =
          bon.annee?.toString() || "";

        const prix =
          bon.prixTotal?.toString() || "";

        const statut =
          bon.statut?.toLowerCase() || "";

        return (
          description.includes(valeur) ||
          date.includes(valeur) ||
          annee.includes(valeur) ||
          prix.includes(valeur) ||
          statut.includes(valeur)
        );
      });
    }

    if (sortValue) {

      result.sort((a, b) => {

        switch (sortValue) {

          case "dateAsc":
            return (
              new Date(a.dateBon || 0) -
              new Date(b.dateBon || 0)
            );

          case "dateDesc":
            return (
              new Date(b.dateBon || 0) -
              new Date(a.dateBon || 0)
            );

          case "prixAsc":
            return (
              (Number(a.prixTotal) || 0) -
              (Number(b.prixTotal) || 0)
            );

          case "prixDesc":
            return (
              (Number(b.prixTotal) || 0) -
              (Number(a.prixTotal) || 0)
            );

          case "anneeAsc":
            return (
              (Number(a.annee) || 0) -
              (Number(b.annee) || 0)
            );

          case "anneeDesc":
            return (
              (Number(b.annee) || 0) -
              (Number(a.annee) || 0)
            );

          default:
            return 0;
        }
      });
    }

    return result;

  }, [bons, search, sortValue]);

  // TOTAL DES BONS AFFICHÉS

  const totalMontant = useMemo(() => {

    return bonsFiltres.reduce(
      (total, bon) =>
        total +
        (Number(bon.prixTotal) || 0),
      0
    );

  }, [bonsFiltres]);

  // SUPPRESSION

  const handleDelete = async (id) => {

    if (!canModify) {
      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce bon de commande ?"
      );

    if (!confirmation) {
      return;
    }

    try {

      setError("");

      await client.delete(
        `/bons-commande/${id}`
      );

      await loadBons(
        selectedSoa?.id
      );

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Impossible de supprimer le bon de commande."
        )
      );
    }
  };

  // PAIEMENT

  const handlePayer = async (bon) => {

    if (!isAdmin) {
      return;
    }

    if (bon.statut === "PAYE") {

      setError(
        "Ce bon de commande est déjà payé."
      );

      return;
    }

    const montantBon =
      Number(bon.prixTotal) || 0;

    const disponible =
      Number(
        argentPublic?.montantDisponible
      ) || 0;

    if (disponible < montantBon) {

      setError(
        `Argent disponible insuffisant. ` +
        `Disponible : ${formatMontant(disponible)}. ` +
        `Montant du bon : ${formatMontant(montantBon)}.`
      );

      return;
    }

    const confirmation =
      window.confirm(
        `Voulez-vous payer ce bon de commande de ${formatMontant(montantBon)} ?`
      );

    if (!confirmation) {
      return;
    }

    try {

      setPayingId(bon.id);
      setError("");

      await client.put(
        `/bons-commande/${bon.id}/payer`
      );

      // Actualisation des bons
      await loadBons(
        selectedSoa?.id
      );

      // Actualisation du fonds
      await loadArgentPublic();

    } catch (err) {

      console.error(err);

      setError(
        getErrorMessage(
          err,
          "Impossible de payer le bon de commande."
        )
      );

    } finally {

      setPayingId(null);
    }
  };

  // NOUVEAU BON

  const handleNouveauBon = () => {

    if (!selectedSoa?.id) {

      setError(
        "Veuillez sélectionner un Code SOA."
      );

      return;
    }

    navigate(
      `/gestion/bons-commande/nouveau?soaId=${selectedSoa.id}`
    );
  };

  // AFFICHAGE

  return (

    <div className="
      max-w-7xl
      mx-auto
      px-4
      py-10
      space-y-8
    ">

      {/*HEADER*/}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
      ">

        <div>

          <div className="
            flex
            items-center
            gap-2
            text-sm
            text-slate-400
            mb-5
          ">

            <Link
              to="/gestion"
              className="
                hover:text-haigana-blue
                transition-colors
              "
            >
              Gestion
            </Link>

            <span>/</span>

            <span className="
              text-haigana-dark
              font-medium
            ">
              Bons de commande
            </span>

          </div>

          <h1 className="
            text-3xl
            font-bold
            text-haigana-dark
          ">
            Bons de commande
          </h1>

          <p className="
            text-gray-500
            mt-1
          ">
            Gestion des bons de commande des véhicules
          </p>

        </div>

        {canModify && (

          <button
            type="button"
            onClick={handleNouveauBon}
            className="
              inline-flex
              items-center
              justify-center
              px-5
              py-3
              rounded-xl
              bg-haigana-dark
              text-white
              font-semibold
              shadow-card
              hover:opacity-90
              transition
            "
          >
            + Nouveau bon de commande
          </button>

        )}

      </div>

      {/*ARGENT PUBLIC*/}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
      ">

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          p-6
        ">

          <p className="
            text-sm
            font-medium
            text-gray-500
          ">
            Fonds total véhicules
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-haigana-dark
          ">
            {formatMontant(
              argentPublic?.montantTotal
            )}
          </p>

        </div>

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          p-6
        ">

          <p className="
            text-sm
            font-medium
            text-gray-500
          ">
            Montant utilisé
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-haigana-dark
          ">
            {formatMontant(
              argentPublic?.montantUtilise
            )}
          </p>

        </div>

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          p-6
          border
          border-haigana-blue/20
        ">

          <p className="
            text-sm
            font-medium
            text-gray-500
          ">
            Argent disponible pour les véhicules
          </p>

          <p className="
            mt-2
            text-2xl
            font-bold
            text-haigana-blue
          ">
            {formatMontant(
              argentPublic?.montantDisponible
            )}
          </p>

        </div>

      </div>

      {/*SOA*/}

      <div className="
        bg-white
        rounded-2xl
        shadow-card
        p-6
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-[1fr_auto]
          gap-4
          items-end
        ">

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            ">
              Code SOA
            </label>

            <select
              value={selectedSoa?.id || ""}
              onChange={handleChangeSoa}
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                px-4
                py-3
                bg-white
                text-gray-700
                focus:outline-none
                focus:ring-2
                focus:ring-haigana-blue/30
                focus:border-haigana-blue
              "
            >

              <option value="">
                Sélectionner un Code SOA
              </option>

              {soaList.map((soa) => (

                <option
                  key={soa.id}
                  value={soa.id}
                >
                  {soa.codeSoa}
                </option>

              ))}

            </select>

          </div>

          <button
            type="button"
            onClick={handleSearchSoa}
            className="
              px-5
              py-3
              rounded-xl
              bg-haigana-dark
              text-white
              font-semibold
              hover:opacity-90
              transition
            "
          >
            Rechercher
          </button>

        </div>

        <div className="mt-4">

          <label className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          ">
            Recherche directe du Code SOA
          </label>

          <input
            type="text"
            value={codeSoa}
            onChange={(e) =>
              setCodeSoa(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {
                handleSearchSoa();
              }

            }}
            placeholder="Entrer le code"
            className="
              w-full
              rounded-xl
              border
              border-gray-200
              px-4
              py-3
              text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-haigana-blue/30
              focus:border-haigana-blue
            "
          />

        </div>

        {selectedSoa && (

          <div className="
            mt-4
            rounded-xl
            bg-haigana-bg
            px-4
            py-3
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Code SOA sélectionné
            </p>

            <p className="
              mt-1
              font-bold
              text-haigana-dark
            ">
              {selectedSoa.codeSoa}
            </p>

          </div>

        )}

      </div>

      {/*MESSAGES*/}

      {error && (

        <div className="
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-sm
          text-red-700
        ">
          {error}
        </div>

      )}

      {/*RECHERCHE / TRI*/}

      <SearchSortBar
        search={search}
        onSearchChange={setSearch}
        sortValue={sortValue}
        onSortChange={setSortValue}
        sortOptions={[
          {
            value: "dateDesc",
            label: "Date récente"
          },
          {
            value: "dateAsc",
            label: "Date ancienne"
          },
          {
            value: "prixDesc",
            label: "Montant décroissant"
          },
          {
            value: "prixAsc",
            label: "Montant croissant"
          },
          {
            value: "anneeDesc",
            label: "Année décroissante"
          },
          {
            value: "anneeAsc",
            label: "Année croissante"
          }
        ]}
        placeholder="Rechercher un bon de commande..."
      />

      {/*TABLEAU*/}

      <div className="
        bg-white
        rounded-2xl
        shadow-card
        overflow-hidden
      ">

        <div className="
          px-6
          py-5
          border-b
          border-gray-100
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-3
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
              text-haigana-dark
            ">
              Bons de commande
            </h2>

            <p className="
              text-sm
              text-gray-500
              mt-1
            ">
              {bonsFiltres.length} résultat
              {bonsFiltres.length > 1 ? "s" : ""}
            </p>

          </div>

          <div className="
            text-right
          ">

            <p className="
              text-sm
              text-gray-500
            ">
              Total affiché
            </p>

            <p className="
              text-lg
              font-bold
              text-haigana-dark
            ">
              {formatMontant(totalMontant)}
            </p>

          </div>

        </div>

        {loading ? (

          <div className="
            p-10
            text-center
          ">

            <div className="
              animate-pulse
              text-gray-500
            ">
              Chargement des données...
            </div>

          </div>

        ) : !selectedSoa ? (

          <div className="
            p-10
            text-center
            text-gray-500
          ">
            Sélectionnez un Code SOA.
          </div>

        ) : bonsFiltres.length === 0 ? (

          <div className="
            p-10
            text-center
            text-gray-500
          ">
            Aucun bon de commande trouvé.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="
                  bg-haigana-dark
                  text-white
                ">

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Description
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Date
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Année
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Prix total
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Statut
                  </th>

                  <th className="
                    px-5
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  ">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="
                divide-y
                divide-gray-100
              ">

                {bonsFiltres.map((bon) => (

                  <tr
                    key={bon.id}
                    className="
                      border-t
                      border-gray-100
                      hover:bg-haigana-bg/60
                      transition
                    "
                  >

                    <td className="
                      px-5
                      py-4
                    ">

                      <span className="
                        font-medium
                        text-gray-700
                      ">
                        {bon.description || "-"}
                      </span>

                    </td>

                    <td className="
                      px-5
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {bon.dateBon || "-"}
                    </td>

                    <td className="
                      px-5
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {bon.annee || "-"}
                    </td>

                    <td className="
                      px-5
                      py-4
                    ">

                      <span className="
                        font-semibold
                        text-haigana-dark
                      ">
                        {formatMontant(
                          bon.prixTotal
                        )}
                      </span>

                    </td>

                    <td className="
                      px-5
                      py-4
                    ">

                      {bon.statut === "PAYE" ? (

                        <span className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          bg-green-100
                          text-green-700
                          text-xs
                          font-semibold
                        ">
                          PAYÉ
                        </span>

                      ) : (

                        <span className="
                          inline-flex
                          px-3
                          py-1
                          rounded-full
                          bg-orange-100
                          text-orange-700
                          text-xs
                          font-semibold
                        ">
                          NON PAYÉ
                        </span>

                      )}

                    </td>

                    <td className="
                      px-5
                      py-4
                    ">

                      <div className="
                        flex
                        items-center
                        gap-4
                        flex-wrap
                      ">

                        {canModify &&
                          bon.statut !== "PAYE" && (

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/gestion/bons-commande/${bon.id}/modifier`
                                )
                              }
                              className="
                                text-haigana-blue
                                font-semibold
                                text-sm
                                hover:underline
                              "
                            >
                              Modifier
                            </button>

                          )}

                        {isAdmin &&
                          bon.statut !== "PAYE" && (

                            <button
                              type="button"
                              onClick={() =>
                                handlePayer(bon)
                              }
                              disabled={
                                payingId === bon.id
                              }
                              className="
                                text-green-600
                                font-semibold
                                text-sm
                                hover:underline
                                disabled:opacity-50
                              "
                            >
                              {payingId === bon.id
                                ? "Paiement..."
                                : "Payer"}
                            </button>

                          )}

                        {canModify &&
                          bon.statut !== "PAYE" && (

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(bon.id)
                              }
                              className="
                                text-red-600
                                font-semibold
                                text-sm
                                hover:underline
                              "
                            >
                              Supprimer
                            </button>

                          )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}