import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import client from "../api/client";
import SearchSortBar from "../components/SearchSortBar";

/*FORMULAIRE VIDE*/

const emptyForm = {
  vehiculeId: "",
  reference: "",
  dateSortie: "",
  type: "",
  lieu: "",
  description: "",
  pieceJustificativeUrl: "",

  // ORDRE DE SORTIE
  nomPersonneSortie: "",
  cinPersonneSortie: "",
  serviceSortie: "",

  // ORDRE D'ENTREE
  nomPersonneEntree: "",
  cinPersonneEntree: "",
  serviceEntree: "",
};

/*COMPOSANT*/

export default function SortieAdmin() {
  const navigate = useNavigate();

  /*ETATS*/

  const [sorties, setSorties] = useState([]);
  const [vehicules, setVehicules] = useState([]);

  // HISTORIQUE CONDAMNATIONS
  const [condamnations, setCondamnations] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [searchCondamnation, setSearchCondamnation] =
    useState("");

  const [sortField, setSortField] = useState("dateSortie");
  const [sortDirection, setSortDirection] = useState("desc");

  const [
    sortFieldCondamnation,
    setSortFieldCondamnation,
  ] = useState("dateCondamnation");

  const [
    sortDirectionCondamnation,
    setSortDirectionCondamnation,
  ] = useState("desc");

  const [selectedSortie, setSelectedSortie] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingCondamnations, setLoadingCondamnations] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState("");

  /*RECUPERATION DU ROLE*/

  useEffect(() => {
    loadUserRole();
  }, []);

  function loadUserRole() {
    try {
      let storedRole =
        localStorage.getItem("haigana_role");

      if (!storedRole) {
        storedRole =
          localStorage.getItem("role");
      }

      if (!storedRole) {
        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          try {
            const user =
              JSON.parse(storedUser);

            storedRole =
              user?.role ||
              user?.roles?.[0] ||
              "";
          } catch {
            // JSON invalide
          }
        }
      }

      if (storedRole) {
        storedRole = String(storedRole)
          .replace("ROLE_", "")
          .toUpperCase();
      }

      setRole(
        storedRole || "CONSULTANT"
      );

      console.log(
        "ROLE UTILISATEUR :",
        storedRole
      );
    } catch (err) {
      console.error(
        "Erreur récupération rôle :",
        err
      );

      setRole("CONSULTANT");
    }
  }

  /*ROLE DEPUIS JWT*/

  function getUserRole() {
    try {
      const token =
        localStorage.getItem(
          "haigana_token"
        );

      if (!token) {
        return null;
      }

      const parts =
        token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      const authorities =
        payload.authorities ||
        payload.roles ||
        payload.role ||
        [];

      if (Array.isArray(authorities)) {
        const authority =
          authorities.find((item) =>
            String(item)
              .toUpperCase()
              .includes("ADMINISTRATEUR")
          );

        if (authority) {
          return "ADMINISTRATEUR";
        }

        const modifier =
          authorities.find((item) =>
            String(item)
              .toUpperCase()
              .includes("MODIFICATEUR")
          );

        if (modifier) {
          return "MODIFICATEUR";
        }

        const consultant =
          authorities.find((item) =>
            String(item)
              .toUpperCase()
              .includes("CONSULTANT")
          );

        if (consultant) {
          return "CONSULTANT";
        }
      }

      if (
        typeof authorities ===
        "string"
      ) {
        const role =
          authorities.toUpperCase();

        if (
          role.includes(
            "ADMINISTRATEUR"
          )
        ) {
          return "ADMINISTRATEUR";
        }

        if (
          role.includes(
            "MODIFICATEUR"
          )
        ) {
          return "MODIFICATEUR";
        }

        if (
          role.includes(
            "CONSULTANT"
          )
        ) {
          return "CONSULTANT";
        }
      }

      return null;
    } catch (err) {
      console.error(
        "Erreur récupération rôle JWT :",
        err
      );

      return null;
    }
  }

  const userRole =
    getUserRole();

  /*DROITS*/

  const isAdministrateur =
    userRole === "ADMINISTRATEUR";

  const isModificateur =
    userRole === "MODIFICATEUR";

  const isConsultant =
    userRole === "CONSULTANT";

  const canCreate =
    isAdministrateur ||
    isModificateur;

  const canEdit =
    isAdministrateur ||
    isModificateur;

  const canDelete =
    isAdministrateur;

  const canConsult =
    isAdministrateur ||
    isModificateur ||
    isConsultant;

  /*CHARGEMENT SORTIES + VEHICULES*/

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        sortiesResponse,
        vehiculesResponse,
      ] = await Promise.all([
        client.get("/sorties"),
        client.get("/vehicules"),
      ]);

      setSorties(
        Array.isArray(
          sortiesResponse.data
        )
          ? sortiesResponse.data
          : []
      );

      setVehicules(
        Array.isArray(
          vehiculesResponse.data
        )
          ? vehiculesResponse.data
          : []
      );
    } catch (err) {
      console.error(
        "Erreur chargement sorties :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Impossible de charger les sorties."
      );
    } finally {
      setLoading(false);
    }
  }

  /*CHARGEMENT HISTORIQUE CONDAMNATIONS*/

  async function loadCondamnations() {
    try {
      setLoadingCondamnations(true);

      const response =
        await client.get(
          "/condamnations"
        );

      setCondamnations(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Erreur chargement historique condamnations :",
        err
      );

      /*
       * On ne bloque pas toute la page si
       * l'historique n'est pas disponible.
       */

      setCondamnations([]);
    } finally {
      setLoadingCondamnations(false);
    }
  }

  /*CHARGEMENT INITIAL*/

  useEffect(() => {
    loadData();
    loadCondamnations();
  }, []);

  /*MODIFICATION FORMULAIRE*/

  function set(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*CREATION*/

  function openCreate() {
    if (!canCreate) {
      setError(
        "Vous n'avez pas l'autorisation de créer une sortie."
      );

      return;
    }

    setSelectedSortie(null);

    setForm({
      ...emptyForm,
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  }

  /*MODIFICATION*/

  function openEdit(sortie) {
    if (!canEdit) {
      setError(
        "Vous n'avez pas l'autorisation de modifier une sortie."
      );

      return;
    }

    setSelectedSortie(sortie);

    setForm({
      vehiculeId:
        sortie.vehicule?.id
          ? String(
              sortie.vehicule.id
            )
          : "",

      reference:
        sortie.reference || "",

      dateSortie:
        sortie.dateSortie || "",

      type:
        sortie.type || "",

      lieu:
        sortie.lieu || "",

      description:
        sortie.description || "",

      pieceJustificativeUrl:
        sortie.pieceJustificativeUrl ||
        "",

      /*6 CHAMPS*/

      nomPersonneSortie:
        sortie.nomPersonneSortie ||
        "",

      cinPersonneSortie:
        sortie.cinPersonneSortie ||
        "",

      serviceSortie:
        sortie.serviceSortie ||
        "",

      nomPersonneEntree:
        sortie.nomPersonneEntree ||
        "",

      cinPersonneEntree:
        sortie.cinPersonneEntree ||
        "",

      serviceEntree:
        sortie.serviceEntree ||
        "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  }

  /*FERMER FORMULAIRE*/

  function closeForm() {
    setSelectedSortie(null);

    setShowForm(false);

    setForm({
      ...emptyForm,
    });
  }

  /*ENREGISTREMENT*/

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    /* =====================================================
       DROITS
    ===================================================== */

    if (
      !canCreate &&
      !selectedSortie
    ) {
      setError(
        "Vous n'avez pas l'autorisation de créer une sortie."
      );

      return;
    }

    if (
      !canEdit &&
      selectedSortie
    ) {
      setError(
        "Vous n'avez pas l'autorisation de modifier une sortie."
      );

      return;
    }

    /*VEHICULE*/

    if (!form.vehiculeId) {
      setError(
        "Le véhicule est obligatoire."
      );

      return;
    }

    /*TYPE*/

    if (!form.type) {
      setError(
        "Le type de sortie est obligatoire."
      );

      return;
    }

    /*CHAMPS OBLIGATOIRES*/

    if (
      !form.nomPersonneSortie.trim()
    ) {
      setError(
        "Le nom de la personne qui reçoit le véhicule est obligatoire."
      );

      return;
    }

    if (
      !form.cinPersonneSortie.trim()
    ) {
      setError(
        "La CIN de la personne qui reçoit le véhicule est obligatoire."
      );

      return;
    }

    if (
      !form.serviceSortie.trim()
    ) {
      setError(
        "Le service qui reçoit le véhicule est obligatoire."
      );

      return;
    }

    if (
      !form.nomPersonneEntree.trim()
    ) {
      setError(
        "Le nom de la personne qui remet le véhicule est obligatoire."
      );

      return;
    }

    if (
      !form.cinPersonneEntree.trim()
    ) {
      setError(
        "La CIN de la personne qui remet le véhicule est obligatoire."
      );

      return;
    }

    if (
      !form.serviceEntree.trim()
    ) {
      setError(
        "Le service qui remet le véhicule est obligatoire."
      );

      return;
    }

    /*PAYLOAD*/

    const payload = {
      reference:
        form.reference.trim() ||
        null,

      dateSortie:
        form.dateSortie ||
        null,

      type:
        form.type,

      /*6 CHAMPS*/

      nomPersonneSortie:
        form.nomPersonneSortie.trim(),

      cinPersonneSortie:
        form.cinPersonneSortie.trim(),

      serviceSortie:
        form.serviceSortie.trim(),

      nomPersonneEntree:
        form.nomPersonneEntree.trim(),

      cinPersonneEntree:
        form.cinPersonneEntree.trim(),

      serviceEntree:
        form.serviceEntree.trim(),

      /*COMPLEMENT*/

      lieu:
        form.lieu.trim() ||
        null,

      description:
        form.description.trim() ||
        null,

      pieceJustificativeUrl:
        form.pieceJustificativeUrl.trim() ||
        null,

      /*VEHICULE*/

      vehicule: {
        id: Number(
          form.vehiculeId
        ),
      },
    };

    try {
      setSaving(true);

      console.log(
        "PAYLOAD SORTIE :",
        payload
      );

      /*MODIFICATION*/

      if (selectedSortie) {
        await client.put(
          `/sorties/${selectedSortie.id}`,
          payload
        );

        setSuccess(
          "La sortie a été modifiée avec succès."
        );
      }

      /*CREATION*/

      else {
        await client.post(
          "/sorties",
          payload
        );

        setSuccess(
          "La sortie a été enregistrée avec succès."
        );
      }

      closeForm();

      await loadData();
    } catch (err) {
      console.error(
        "Erreur enregistrement sortie :",
        err
      );

      console.error(
        "Réponse serveur :",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  /*SUPPRESSION SORTIE*/

  async function handleDelete(id) {
    if (!canDelete) {
      setError(
        "Vous n'avez pas l'autorisation de supprimer une sortie."
      );

      return;
    }

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer cette sortie ?\n\nCette action est irréversible."
      );

    if (!confirmation) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await client.delete(
        `/sorties/${id}`
      );

      setSuccess(
        "La sortie a été supprimée avec succès."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Erreur suppression sortie :",
        err
      );

      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Erreur lors de la suppression."
      );
    }
  }

  /*FILTRAGE SORTIES*/

  const filtered = useMemo(() => {
    const recherche =
      search
        .toLowerCase()
        .trim();

    const result =
      sorties.filter(
        (sortie) => {
          const immatricule =
            sortie.vehicule
              ?.immatricule
              ?.toLowerCase() ||
            "";

          const codeSoa =
            sortie.vehicule
              ?.codeSoa
              ?.codeSoa
              ?.toLowerCase() ||
            "";

          const type =
            sortie.type
              ?.toLowerCase() ||
            "";

          const reference =
            sortie.reference
              ?.toLowerCase() ||
            "";

          const nomSortie =
            sortie.nomPersonneSortie
              ?.toLowerCase() ||
            "";

          const cinSortie =
            sortie.cinPersonneSortie
              ?.toLowerCase() ||
            "";

          const serviceSortie =
            sortie.serviceSortie
              ?.toLowerCase() ||
            "";

          const nomEntree =
            sortie.nomPersonneEntree
              ?.toLowerCase() ||
            "";

          const cinEntree =
            sortie.cinPersonneEntree
              ?.toLowerCase() ||
            "";

          const serviceEntree =
            sortie.serviceEntree
              ?.toLowerCase() ||
            "";

          const lieu =
            sortie.lieu
              ?.toLowerCase() ||
            "";

          return (
            !recherche ||

            immatricule.includes(
              recherche
            ) ||

            codeSoa.includes(
              recherche
            ) ||

            type.includes(
              recherche
            ) ||

            reference.includes(
              recherche
            ) ||

            nomSortie.includes(
              recherche
            ) ||

            cinSortie.includes(
              recherche
            ) ||

            serviceSortie.includes(
              recherche
            ) ||

            nomEntree.includes(
              recherche
            ) ||

            cinEntree.includes(
              recherche
            ) ||

            serviceEntree.includes(
              recherche
            ) ||

            lieu.includes(
              recherche
            )
          );
        }
      );

    result.sort((a, b) => {
      let valueA;
      let valueB;

      switch (sortField) {
        case "immatricule":
          valueA =
            a.vehicule
              ?.immatricule ||
            "";

          valueB =
            b.vehicule
              ?.immatricule ||
            "";
          break;

        case "codeSoa":
          valueA =
            a.vehicule
              ?.codeSoa
              ?.codeSoa ||
            "";

          valueB =
            b.vehicule
              ?.codeSoa
              ?.codeSoa ||
            "";
          break;

        case "reference":
          valueA =
            a.reference ||
            "";

          valueB =
            b.reference ||
            "";
          break;

        case "type":
          valueA =
            a.type ||
            "";

          valueB =
            b.type ||
            "";
          break;

        case "dateSortie":
        default:
          valueA =
            a.dateSortie
              ? new Date(
                  a.dateSortie
                ).getTime()
              : 0;

          valueB =
            b.dateSortie
              ? new Date(
                  b.dateSortie
                ).getTime()
              : 0;
          break;
      }

      if (
        sortField !==
        "dateSortie"
      ) {
        valueA =
          String(valueA)
            .toLowerCase();

        valueB =
          String(valueB)
            .toLowerCase();
      }

      if (valueA < valueB) {
        return sortDirection ===
          "asc"
          ? -1
          : 1;
      }

      if (valueA > valueB) {
        return sortDirection ===
          "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return result;
  }, [
    sorties,
    search,
    sortField,
    sortDirection,
  ]);

  const filteredCondamnations =
    useMemo(() => {
      const recherche =
        searchCondamnation
          .toLowerCase()
          .trim();

      const result =
        condamnations.filter(
          (condamnation) => {
            const immatricule =
              condamnation
                .immatriculeVehicule
                ?.toLowerCase() ||
              "";

            const lieu =
              condamnation
                .lieuCondamnation
                ?.toLowerCase() ||
              "";

            const description =
              condamnation
                .description
                ?.toLowerCase() ||
              "";

            const date =
              condamnation
                .dateCondamnation
                ?.toLowerCase() ||
              "";

            return (
              !recherche ||
              immatricule.includes(
                recherche
              ) ||
              lieu.includes(
                recherche
              ) ||
              description.includes(
                recherche
              ) ||
              date.includes(
                recherche
              )
            );
          }
        );

      result.sort((a, b) => {
        let valueA;
        let valueB;

        switch (
          sortFieldCondamnation
        ) {
          case "immatricule":
            valueA =
              a.immatriculeVehicule ||
              "";

            valueB =
              b.immatriculeVehicule ||
              "";
            break;

          case "lieu":
            valueA =
              a.lieuCondamnation ||
              "";

            valueB =
              b.lieuCondamnation ||
              "";
            break;

          case "dateCondamnation":
          default:
            valueA =
              a.dateCondamnation
                ? new Date(
                    a.dateCondamnation
                  ).getTime()
                : 0;

            valueB =
              b.dateCondamnation
                ? new Date(
                    b.dateCondamnation
                  ).getTime()
                : 0;
            break;
        }

        if (
          sortFieldCondamnation !==
          "dateCondamnation"
        ) {
          valueA =
            String(valueA)
              .toLowerCase();

          valueB =
            String(valueB)
              .toLowerCase();
        }

        if (
          valueA < valueB
        ) {
          return sortDirectionCondamnation ===
            "asc"
            ? -1
            : 1;
        }

        if (
          valueA > valueB
        ) {
          return sortDirectionCondamnation ===
            "asc"
            ? 1
            : -1;
        }

        return 0;
      });

      return result;
    }, [
      condamnations,
      searchCondamnation,
      sortFieldCondamnation,
      sortDirectionCondamnation,
    ]);

  /*TRI SORTIES*/

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  /*TRI CONDAMNATIONS*/

  function handleSortCondamnation(
    field
  ) {
    if (
      sortFieldCondamnation ===
      field
    ) {
      setSortDirectionCondamnation(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc"
      );
    } else {
      setSortFieldCondamnation(
        field
      );

      setSortDirectionCondamnation(
        "asc"
      );
    }
  }

  /*STYLES*/

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 " +
    "focus:border-haigana-blue focus:ring-2 " +
    "focus:ring-haigana-blue/20 outline-none " +
    "transition-all bg-white";

  const labelClass =
    "block text-sm font-medium text-haigana-dark mb-1";

  /*AFFICHAGE*/

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* EN-TETE*/}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">

        <div>

          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">

            <Link
              to="/gestion"
              className="hover:text-haigana-blue transition-colors"
            >
              Gestion
            </Link>

            <span>/</span>

            <span className="text-haigana-dark font-medium">
              Sortie
            </span>

          </div>

          <h1 className="text-2xl font-bold text-haigana-dark">
            Gestion des sorties
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Gérez les sorties et prises en charge
            des véhicules.
          </p>

        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition-colors"
          >
            + Nouvelle sortie
          </button>
        )}

      </div>

      {/* MESSAGES*/}

      {error && (
        <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          {success}
        </div>
      )}

      {/* SORTIES*/}

      <div className="mt-8">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-haigana-dark">
            Sorties des véhicules
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Liste des sorties et prises en charge.
          </p>

        </div>

        <SearchSortBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Rechercher par immatriculation, SOA, référence, type ou service..."
        />

        <div className="flex flex-wrap items-center gap-3 mt-4 mb-5">

          <span className="text-sm font-medium text-gray-600">
            Trier par :
          </span>

          <select
            value={sortField}
            onChange={(e) => {
              setSortField(
                e.target.value
              );

              setSortDirection(
                "asc"
              );
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none"
          >

            <option value="dateSortie">
              Date de sortie
            </option>

            <option value="immatricule">
              Immatriculation
            </option>

            <option value="codeSoa">
              Code SOA
            </option>

            <option value="reference">
              Référence
            </option>

            <option value="type">
              Type
            </option>

          </select>

          <button
            type="button"
            onClick={() =>
              setSortDirection(
                (current) =>
                  current === "asc"
                    ? "desc"
                    : "asc"
              )
            }
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-haigana-dark hover:bg-gray-50 transition-colors"
          >
            {sortDirection ===
            "asc"
              ? "↑ Croissant"
              : "↓ Décroissant"}
          </button>

          <span className="text-sm text-gray-400">
            {filtered.length} sortie
            {filtered.length > 1
              ? "s"
              : ""}
          </span>

        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">

          {loading ? (
            <div className="px-6 py-10 text-center text-gray-400">
              Chargement des sorties...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-haigana-dark text-white">

                  <tr>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "immatricule"
                        )
                      }
                    >
                      Véhicule
                      {sortField ===
                        "immatricule" &&
                        (sortDirection ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "codeSoa"
                        )
                      }
                    >
                      Code SOA
                      {sortField ===
                        "codeSoa" &&
                        (sortDirection ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "dateSortie"
                        )
                      }
                    >
                      Date de sortie
                      {sortField ===
                        "dateSortie" &&
                        (sortDirection ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSort(
                          "type"
                        )
                      }
                    >
                      Type
                      {sortField ===
                        "type" &&
                        (sortDirection ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th className="text-center px-4 py-3">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map(
                    (sortie) => (
                      <tr
                        key={
                          sortie.id
                        }
                        className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                      >

                        <td className="px-4 py-3 font-medium text-haigana-dark">
                          {sortie.vehicule
                            ?.immatricule ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {sortie.vehicule
                            ?.codeSoa
                            ?.codeSoa ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {sortie.dateSortie
                            ? new Date(
                                sortie.dateSortie
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "-"}
                        </td>

                        <td className="px-4 py-3">

                          <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                            {sortie.type ||
                              "-"}
                          </span>

                        </td>

                        <td className="px-4 py-3">

                          <div className="flex justify-center gap-2">

                            {canConsult && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/patrimoine/sorties/${sortie.id}/consultation`
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-haigana-dark text-white text-xs font-semibold hover:bg-haigana-blue transition-colors"
                              >
                                Consulter
                              </button>
                            )}

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    sortie
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-haigana-blue text-white text-xs font-semibold hover:opacity-90"
                              >
                                Modifier
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    sortie.id
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                              >
                                Supprimer
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                  {filtered.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-400"
                      >
                        Aucune sortie enregistrée.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* HISTORIQUE CONDAMNATIONS*/}

      <div className="mt-12">

        <div className="mb-5">

          <h2 className="text-xl font-bold text-haigana-dark">
            Historique des condamnations
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Historique des véhicules condamnés,
            même après leur suppression de la liste
            des véhicules.
          </p>

        </div>

        <div className="mb-5">

          <SearchSortBar
            search={
              searchCondamnation
            }
            onSearchChange={
              setSearchCondamnation
            }
            placeholder="Rechercher par immatriculation, lieu ou description..."
          />

          <div className="flex flex-wrap items-center gap-3 mt-4">

            <span className="text-sm font-medium text-gray-600">
              Trier par :
            </span>

            <select
              value={
                sortFieldCondamnation
              }
              onChange={(e) => {
                setSortFieldCondamnation(
                  e.target.value
                );

                setSortDirectionCondamnation(
                  "asc"
                );
              }}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none"
            >

              <option value="dateCondamnation">
                Date de condamnation
              </option>

              <option value="immatricule">
                Immatriculation
              </option>

              <option value="lieu">
                Lieu
              </option>

            </select>

            <button
              type="button"
              onClick={() =>
                setSortDirectionCondamnation(
                  (current) =>
                    current ===
                    "asc"
                      ? "desc"
                      : "asc"
                )
              }
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-haigana-dark hover:bg-gray-50 transition-colors"
            >
              {sortDirectionCondamnation ===
              "asc"
                ? "↑ Croissant"
                : "↓ Décroissant"}
            </button>

            <span className="text-sm text-gray-400">
              {
                filteredCondamnations.length
              } condamnation
              {filteredCondamnations.length >
              1
                ? "s"
                : ""}
            </span>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">

          {loadingCondamnations ? (
            <div className="px-6 py-10 text-center text-gray-400">
              Chargement de l'historique...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-haigana-dark text-white">

                  <tr>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSortCondamnation(
                          "immatricule"
                        )
                      }
                    >
                      Immatriculation

                      {sortFieldCondamnation ===
                        "immatricule" &&
                        (sortDirectionCondamnation ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSortCondamnation(
                          "dateCondamnation"
                        )
                      }
                    >
                      Date de condamnation

                      {sortFieldCondamnation ===
                        "dateCondamnation" &&
                        (sortDirectionCondamnation ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th
                      className="text-left px-4 py-3 cursor-pointer"
                      onClick={() =>
                        handleSortCondamnation(
                          "lieu"
                        )
                      }
                    >
                      Lieu de condamnation

                      {sortFieldCondamnation ===
                        "lieu" &&
                        (sortDirectionCondamnation ===
                        "asc"
                          ? " ↑"
                          : " ↓")}
                    </th>

                    <th className="text-left px-4 py-3">
                      Description
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCondamnations.map(
                    (condamnation) => (
                      <tr
                        key={
                          condamnation.id
                        }
                        className="border-t border-gray-100 hover:bg-haigana-bg/60 transition-colors"
                      >

                        <td className="px-4 py-3 font-semibold text-haigana-dark">

                          {condamnation
                            .immatriculeVehicule ||
                            "-"}

                        </td>

                        <td className="px-4 py-3">

                          {condamnation
                            .dateCondamnation
                            ? new Date(
                                condamnation.dateCondamnation
                              ).toLocaleDateString(
                                "fr-FR"
                              )
                            : "-"}

                        </td>

                        <td className="px-4 py-3">

                          {condamnation
                            .lieuCondamnation ||
                            "-"}

                        </td>

                        <td className="px-4 py-3">

                          {condamnation
                            .description ||
                            "-"}

                        </td>

                      </tr>
                    )
                  )}

                  {filteredCondamnations.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-10 text-center text-gray-400"
                      >
                        Aucun véhicule condamné
                        dans l'historique.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* MODAL FORMULAIRE*/}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>

                <h2 className="text-lg font-semibold text-haigana-dark">

                  {selectedSortie
                    ? "Modifier la sortie"
                    : "Nouvelle sortie"}

                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Renseignez les informations
                  de la sortie.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
            >

              {/*         VEHICULE*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Véhicule *
                </label>

                <select
                  required
                  value={
                    form.vehiculeId
                  }
                  onChange={(e) =>
                    set(
                      "vehiculeId",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                >

                  <option value="">
                    Choisir un véhicule...
                  </option>

                  {vehicules.map(
                    (vehicule) => (
                      <option
                        key={
                          vehicule.id
                        }
                        value={
                          vehicule.id
                        }
                      >

                        {
                          vehicule.immatricule
                        }

                        {vehicule
                          .codeSoa
                          ?.codeSoa
                          ? ` — ${vehicule.codeSoa.codeSoa}`
                          : ""}

                      </option>
                    )
                  )}

                </select>

              </div>

              {/*         REFERENCE*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Référence
                </label>

                <input
                  type="text"
                  value={
                    form.reference
                  }
                  onChange={(e) =>
                    set(
                      "reference",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Référence de la sortie"
                />

              </div>

              {/*         DATE*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Date de sortie
                </label>

                <input
                  type="date"
                  value={
                    form.dateSortie
                  }
                  onChange={(e) =>
                    set(
                      "dateSortie",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                />

              </div>

              {/*         TYPE*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Type de sortie *
                </label>

                <select
                  required
                  value={
                    form.type
                  }
                  onChange={(e) =>
                    set(
                      "type",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  readonly
                >

                  <option value="">
                    Choisir...
                  </option>

                  <option value="AFFECTATION">
                    Affectation
                  </option>

                  <option value="CONDAMNATION">
                    Condamnation
                  </option>

                </select>

              </div>

              {/*         3 CHAMPS ORDRE DE SORTIE*/}

              <div className="border border-gray-200 rounded-xl p-5">

                <div className="mb-4">

                  <h3 className="font-semibold text-haigana-dark">
                    Personne qui fait l'ordre de sortie
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Personne ou service qui reçoit
                    le véhicule.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Nom *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.nomPersonneSortie
                      }
                      onChange={(e) =>
                        set(
                          "nomPersonneSortie",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Nom de la personne"
                    />

                  </div>

                  <div>

                    <label
                      className={
                        labelClass
                      }
                    >
                      CIN *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.cinPersonneSortie
                      }
                      onChange={(e) =>
                        set(
                          "cinPersonneSortie",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="CIN"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label
                      className={
                        labelClass
                      }
                    >
                      Service *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.serviceSortie
                      }
                      onChange={(e) =>
                        set(
                          "serviceSortie",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Service"
                    />

                  </div>

                </div>

              </div>

              {/*         3 CHAMPS ORDRE D'ENTREE*/}

              <div className="border border-gray-200 rounded-xl p-5">

                <div className="mb-4">

                  <h3 className="font-semibold text-haigana-dark">
                    Personne qui fait l'ordre d'entrée
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Personne ou service qui remet
                    le véhicule.
                  </p>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <label
                      className={
                        labelClass
                      }
                    >
                      Nom *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.nomPersonneEntree
                      }
                      onChange={(e) =>
                        set(
                          "nomPersonneEntree",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Nom de la personne"
                    />

                  </div>

                  <div>

                    <label
                      className={
                        labelClass
                      }
                    >
                      CIN *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.cinPersonneEntree
                      }
                      onChange={(e) =>
                        set(
                          "cinPersonneEntree",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="CIN"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <label
                      className={
                        labelClass
                      }
                    >
                      Service *
                    </label>

                    <input
                      type="text"
                      required
                      value={
                        form.serviceEntree
                      }
                      onChange={(e) =>
                        set(
                          "serviceEntree",
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="Service"
                    />

                  </div>

                </div>

              </div>

              {/*         LIEU*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Lieu
                </label>

                <input
                  type="text"
                  value={
                    form.lieu
                  }
                  onChange={(e) =>
                    set(
                      "lieu",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Lieu"
                />

              </div>

              {/* DESCRIPTION*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Description
                </label>

                <textarea
                  rows={3}
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    set(
                      "description",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Description de la sortie"
                />

              </div>

              {/*         PIECE JUSTIFICATIVE*/}

              <div>

                <label
                  className={
                    labelClass
                  }
                >
                  Pièce justificative
                </label>

                <input
                  type="text"
                  value={
                    form.pieceJustificativeUrl
                  }
                  onChange={(e) =>
                    set(
                      "pieceJustificativeUrl",
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="URL de la pièce justificative"
                />

              </div>

              {/*         BOUTONS*/}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="px-5 py-2.5 rounded-lg bg-haigana-dark text-white font-semibold hover:bg-haigana-blue transition disabled:opacity-60"
                >

                  {saving
                    ? "Enregistrement..."
                    : selectedSortie
                    ? "Enregistrer"
                    : "Créer la sortie"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}