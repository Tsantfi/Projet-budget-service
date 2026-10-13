import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function VehiculeConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();

  // VEHICULE

  const [vehicule, setVehicule] = useState(null);

  // LISTES DE REFERENCE

  const [carburants, setCarburants] = useState([]);
  const [etats, setEtats] = useState([]);
  const [detenteurs, setDetenteurs] = useState([]);
  const [chauffeurs, setChauffeurs] = useState([]);
  const [codesSoa, setCodesSoa] = useState([]);

  // FORMULAIRE

  const [form, setForm] = useState({
    immatricule: "",
    prixVehicule: "",
    dateCirculation: "",

    // SAISIE MANUELLE
    genre: "",
    marque: "",
    type: "",

    // REFERENCES
    carburantId: "",
    etatId: "",
    detenteurId: "",
    chauffeurId: "",
    soaId: "",

    // LOCALISATION
    localiteTexte: "",
    localiteLatitude: "",
    localiteLongitude: "",

    // TRAJET
    lieuParcoursDepart: "",
    lieuParcoursArrivee: "",

    // JUSTIFICATIF
    pieceJustificativeUrl: "",
  });

  // ETATS

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // CHARGEMENT DU VEHICULE

  useEffect(() => {
    async function loadVehicule() {
      try {
        setLoading(true);
        setError("");

        const response = await client.get(
          `/vehicules/${id}`
        );

        const data = response.data;

        console.log(
          "=== VEHICULE A MODIFIER ==="
        );

        console.log(data);

        setVehicule(data);

        // REMPLISSAGE DU FORMULAIRE

        setForm({
          immatricule:
            data.immatricule || "",

          prixVehicule:
            data.prixVehicule ?? "",

          dateCirculation:
            data.dateCirculation || "",

          // GENRE / MARQUE / TYPE

          genre:
            data.genre?.genreVehicule || "",

          marque:
            data.marque?.marqueVehicule || "",

          type:
            data.type?.typeDuVehicule || "",

          // REFERENCES

          carburantId:
            data.carburant?.id ?? "",

          etatId:
            data.etat?.id ?? "",

          detenteurId:
            data.detenteur?.id ?? "",

          chauffeurId:
            data.chauffeur?.id ?? "",

          soaId:
            data.codeSoa?.id ?? "",

          // LOCALISATION

          localiteTexte:
            data.localiteTexte || "",

          localiteLatitude:
            data.localiteLatitude ?? "",

          localiteLongitude:
            data.localiteLongitude ?? "",

          // TRAJET

          lieuParcoursDepart:
            data.lieuParcoursDepart || "",

          lieuParcoursArrivee:
            data.lieuParcoursArrivee || "",

          // JUSTIFICATIF

          pieceJustificativeUrl:
            data.pieceJustificativeUrl || "",
        });
      } catch (err) {
        console.error(
          "=== ERREUR CHARGEMENT VEHICULE ==="
        );

        console.error(
          "Status :",
          err.response?.status
        );

        console.error(
          "Data :",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Impossible de charger le véhicule."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVehicule();
    }
  }, [id]);

  // CHARGEMENT DES REFERENCES

  useEffect(() => {
    async function loadReferences() {
      try {
        const [
          carburantsRes,
          etatsRes,
          detenteursRes,
          chauffeursRes,
          codesSoaRes,
        ] = await Promise.all([
          client.get("/reference/carburants"),
          client.get("/reference/etats"),
          client.get("/detenteurs"),
          client.get("/chauffeurs"),
          client.get("/soa"),
        ]);

        // CARBURANTS

        setCarburants(
          Array.isArray(carburantsRes.data)
            ? carburantsRes.data
            : []
        );

        // ETATS

        setEtats(
          Array.isArray(etatsRes.data)
            ? etatsRes.data
            : []
        );

        // DETENTEURS

        setDetenteurs(
          Array.isArray(detenteursRes.data)
            ? detenteursRes.data
            : []
        );

        // CHAUFFEURS

        setChauffeurs(
          Array.isArray(chauffeursRes.data)
            ? chauffeursRes.data
            : []
        );

        // CODES SOA

        setCodesSoa(
          Array.isArray(codesSoaRes.data)
            ? codesSoaRes.data
            : []
        );
      } catch (err) {
        console.error(
          "=== ERREUR CHARGEMENT REFERENCES ==="
        );

        console.error(
          "Status :",
          err.response?.status
        );

        console.error(
          "Data :",
          err.response?.data
        );
      }
    }

    loadReferences();
  }, []);

  // CHANGEMENT CHAMP

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // VERIFICATION

  function validateForm() {
    if (!form.immatricule.trim()) {
      return "L'immatriculation est obligatoire.";
    }

    if (!form.genre.trim()) {
      return "Le genre est obligatoire.";
    }

    if (!form.marque.trim()) {
      return "La marque est obligatoire.";
    }

    if (!form.type.trim()) {
      return "Le type de véhicule est obligatoire.";
    }

    if (!form.carburantId) {
      return "Veuillez sélectionner le carburant.";
    }

    if (!form.etatId) {
      return "Veuillez sélectionner l'état du véhicule.";
    }

    if (!form.soaId) {
      return "Veuillez sélectionner le code SOA.";
    }

    return null;
  }

  // MODIFICATION VEHICULE

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    
    // VALIDATION
    

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // PAYLOAD

      const payload = {
        // INFORMATIONS GENERALES

        immatricule:
          form.immatricule
            .replace(/\s+/g, "")
            .trim()
            .toUpperCase(),

        prixVehicule:
          form.prixVehicule !== ""
            ? Number(form.prixVehicule)
            : null,

        dateCirculation:
          form.dateCirculation || null,

        // GENRE MANUEL

        genre:
          form.genre.trim() || null,

        // MARQUE MANUELLE

        marque:
          form.marque.trim() || null,

        // TYPE MANUEL

        type:
          form.type.trim() || null,

        // CARBURANT

        carburantId:
          form.carburantId
            ? Number(form.carburantId)
            : null,

        // ETAT

        etatId:
          form.etatId
            ? Number(form.etatId)
            : null,

        // DETENTEUR

        detenteurId:
          form.detenteurId
            ? Number(form.detenteurId)
            : null,

        // CHAUFFEUR

        chauffeurId:
          form.chauffeurId
            ? Number(form.chauffeurId)
            : null,
        
        // CODE SOA

        soaId:
          form.soaId
            ? Number(form.soaId)
            : null,

        // LOCALISATION

        localiteTexte:
          form.localiteTexte.trim() || null,

        localiteLatitude:
          form.localiteLatitude !== ""
            ? Number(form.localiteLatitude)
            : null,

        localiteLongitude:
          form.localiteLongitude !== ""
            ? Number(form.localiteLongitude)
            : null,

        // TRAJET

        lieuParcoursDepart:
          form.lieuParcoursDepart.trim() || null,

        lieuParcoursArrivee:
          form.lieuParcoursArrivee.trim() || null,

        // JUSTIFICATIF

        pieceJustificativeUrl:
          form.pieceJustificativeUrl.trim() ||
          null,
      };

      // DEBUG

      console.log(
        "======================================"
      );

      console.log(
        "=== VEHICULE ENVOYE AU BACKEND ==="
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "======================================"
      );

      // PUT

      const response =
        await client.put(
          `/vehicules/${id}`,
          payload
        );

      console.log(
        "=== VEHICULE MODIFIE ==="
      );

      console.log(
        response.data
      );

      // SUCCES

      setSuccess(
        "Le véhicule a été modifié avec succès."
      );

      // REDIRECTION

      setTimeout(() => {
        navigate(
          "/patrimoine/vehicule"
        );
      }, 1000);

    } catch (err) {
      console.error(
        "======================================"
      );

      console.error(
        "=== ERREUR MODIFICATION VEHICULE ==="
      );

      console.error(
        "Status :",
        err.response?.status
      );

      console.error(
        "Data :",
        err.response?.data
      );

      console.error(
        "Erreur :",
        err
      );

      console.error(
        "======================================"
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Impossible de modifier le véhicule."
      );
    } finally {
      setSaving(false);
    }
  }

  // CHARGEMENT

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          p-10
          text-center
        ">

          <div className="animate-pulse">

            <div className="
              h-6
              bg-gray-200
              rounded
              w-1/3
              mx-auto
              mb-4
            " />

            <div className="
              h-4
              bg-gray-200
              rounded
              w-1/2
              mx-auto
            " />

          </div>

          <p className="text-gray-400 mt-5">
            Chargement du véhicule...
          </p>

        </div>

      </div>
    );
  }

  // VEHICULE INTROUVABLE

  if (!vehicule) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">

        <div className="
          bg-red-50
          border
          border-red-200
          text-red-600
          rounded-xl
          p-5
        ">
          {error ||
            "Véhicule introuvable."}
        </div>

        <div className="mt-5">

          <Link
            to="/patrimoine/vehicule"
            className="
              inline-flex
              px-5
              py-2.5
              rounded-lg
              bg-haigana-dark
              text-white
              font-semibold
              hover:opacity-90
              transition
            "
          >
            Retour
          </Link>

        </div>

      </div>
    );
  }

  // RENDER

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      
      {/* EN-TETE */}
      

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        mb-6
      ">

        <div>

          <h1 className="
            text-2xl
            font-bold
            text-haigana-dark
          ">
            Modifier le véhicule
          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Modification des informations du véhicule
          </p>

        </div>

        <div className="flex items-center gap-3">

          <span className="
            px-3
            py-2
            rounded-lg
            bg-gray-100
            text-haigana-dark
            font-semibold
            text-sm
          ">
            {vehicule.immatricule || "-"}
          </span>

        </div>

      </div>

      
      {/* ERREUR */}
      

      {error && (
        <div className="
          mb-6
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-5
          py-4
          text-red-700
        ">

          <p className="font-semibold">
            Erreur
          </p>

          <p className="text-sm mt-1">
            {error}
          </p>

        </div>
      )}

      
      {/* SUCCES */}
      

      {success && (
        <div className="
          mb-6
          rounded-xl
          border
          border-green-200
          bg-green-50
          px-5
          py-4
          text-green-700
        ">

          <p className="font-semibold">
            Modification réussie
          </p>

          <p className="text-sm mt-1">
            {success}
          </p>

        </div>
      )}

      
      {/* FORMULAIRE */}
      

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        
        {/* INFORMATIONS GENERALES */}
        

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b
            border-gray-100
          ">

            <h2 className="
              text-lg
              font-semibold
              text-haigana-dark
            ">
              Informations générales
            </h2>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-5
            p-5
          ">

            
            {/* IMMATRICULATION */}
            

            <FormField
              label="Immatriculation"
              required
            >

              <input
                type="text"
                name="immatricule"
                value={form.immatricule}
                onChange={handleChange}
                className="input-haigana"
                placeholder="Ex : 1234 TAA"
              />

            </FormField>

            
            {/* DATE */}
            

            <FormField
              label="Date de circulation"
            >

              <input
                type="date"
                name="dateCirculation"
                value={form.dateCirculation}
                onChange={handleChange}
                className="input-haigana"
              />

            </FormField>

            
            {/* PRIX */}
            

            <FormField
              label="Valeur du véhicule"
            >

              <div className="relative">

                <input
                  type="number"
                  name="prixVehicule"
                  value={form.prixVehicule}
                  onChange={handleChange}
                  min="0"
                  className="
                    input-haigana
                    pr-12
                  "
                  placeholder="0"
                />

                <span className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  text-sm
                  font-semibold
                ">
                  Ar
                </span>

              </div>

            </FormField>

            
            {/* GENRE */}
            

            <FormField
              label="Genre"
              required
            >

              <input
                type="text"
                name="genre"
                value={form.genre}
                onChange={handleChange}
                className="input-haigana"
                placeholder="Ex : CTTE"
              />

            </FormField>

            
            {/* MARQUE */}
            

            <FormField
              label="Marque"
              required
            >

              <input
                type="text"
                name="marque"
                value={form.marque}
                onChange={handleChange}
                className="input-haigana"
                placeholder="Ex : Toyota"
              />

            </FormField>

            
            {/* TYPE */}
            

            <FormField
              label="Type de véhicule"
              required
            >

              <input
                type="text"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="input-haigana"
                placeholder="Ex : Véhicule particulier"
              />

            </FormField>

            
            {/* CARBURANT */}
            

            <FormField
              label="Carburant"
              required
            >

              <SelectField
                name="carburantId"
                value={form.carburantId}
                onChange={handleChange}
                options={carburants}
                getLabel={(item) =>
                  item.libelle ||
                  item.nomCarburant ||
                  item.carburant ||
                  "-"
                }
              />

            </FormField>

            
            {/* ETAT */}
            

            <FormField
              label="État"
              required
            >

              <SelectField
                name="etatId"
                value={form.etatId}
                onChange={handleChange}
                options={etats}
                getLabel={(item) =>
                  item.etatVehicule ||
                  item.libelle ||
                  item.nom ||
                  "-"
                }
              />

            </FormField>

            
            {/* CODE SOA */}
            

            <FormField
              label="Code SOA"
              required
            >

              <SelectField
                name="soaId"
                value={form.soaId}
                onChange={handleChange}
                options={codesSoa}
                getLabel={(item) =>
                  item.codeSoa ||
                  item.code ||
                  item.libelle ||
                  "-"
                }
              />

            </FormField>

          </div>

        </div>

        
        {/* DETENTEUR ET CHAUFFEUR */}
        

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b
            border-gray-100
          ">

            <h2 className="
              text-lg
              font-semibold
              text-haigana-dark
            ">
              Détenteur et chauffeur
            </h2>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
            p-5
          ">

            
            {/* DETENTEUR */}
            

            <FormField
              label="Détenteur"
            >

              <SelectField
                name="detenteurId"
                value={form.detenteurId}
                onChange={handleChange}
                options={detenteurs}
                emptyLabel="Aucun détenteur"
                getLabel={(item) =>
                  `${item.nomDetenteur || ""} ${
                    item.prenomDetenteur || ""
                  }`.trim() ||
                  item.nom ||
                  "-"
                }
              />

            </FormField>

            
            {/* CHAUFFEUR */}
            

            <FormField
              label="Chauffeur"
            >

              <SelectField
                name="chauffeurId"
                value={form.chauffeurId}
                onChange={handleChange}
                options={chauffeurs}
                emptyLabel="Aucun chauffeur"
                getLabel={(item) =>
                  `${item.nomChauffeur || ""} ${
                    item.prenomChauffeur || ""
                  }`.trim() ||
                  item.nom ||
                  "-"
                }
              />

            </FormField>

          </div>

        </div>

        
        {/* LOCALISATION */}
        

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b
            border-gray-100
          ">

            <h2 className="
              text-lg
              font-semibold
              text-haigana-dark
            ">
              Localisation
            </h2>

            <p className="
              text-sm
              text-gray-500
              mt-1
            ">
              Position actuelle du véhicule
            </p>

          </div>

          <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
            p-5
          ">

            
            {/* LOCALITE */}
            

            <FormField
              label="Localité"
            >

              <input
                type="text"
                name="localiteTexte"
                value={form.localiteTexte}
                onChange={handleChange}
                className="input-haigana"
                placeholder="Ex : Mahajanga"
              />

            </FormField>

            
            {/* LATITUDE */}
            

            <FormField
              label="Latitude"
            >

              <input
                type="number"
                step="any"
                name="localiteLatitude"
                value={form.localiteLatitude}
                onChange={handleChange}
                className="input-haigana"
                placeholder="-15.7167"
              />

            </FormField>

            
            {/* LONGITUDE */}
            

            <FormField
              label="Longitude"
            >

              <input
                type="number"
                step="any"
                name="localiteLongitude"
                value={form.localiteLongitude}
                onChange={handleChange}
                className="input-haigana"
                placeholder="46.3167"
              />

            </FormField>

          </div>

        </div>

        
        {/* JUSTIFICATIF */}
        

        <div className="
          bg-white
          rounded-2xl
          shadow-card
          overflow-hidden
        ">

          <div className="
            px-5
            py-4
            border-b
            border-gray-100
          ">

            <h2 className="
              text-lg
              font-semibold
              text-haigana-dark
            ">
              Justificatif
            </h2>

          </div>

          <div className="p-5">

            <FormField
              label="Lien de la pièce justificative"
            >

              <input
                type="text"
                name="pieceJustificativeUrl"
                value={
                  form.pieceJustificativeUrl
                }
                onChange={handleChange}
                className="input-haigana"
                placeholder="https://..."
              />

            </FormField>

          </div>

        </div>

        
        {/* AFFECTATION ACTUELLE */}
        

        {vehicule.lieuAffectationActuel && (
          <div className="
            rounded-xl
            border
            border-haigana-gold/40
            bg-haigana-gold/10
            px-5
            py-4
          ">

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-gray-500
            ">
              Affectation actuelle
            </p>

            <p className="
              font-semibold
              text-haigana-dark
              mt-1
            ">
              {vehicule.lieuAffectationActuel}
            </p>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              L'affectation actuelle n'est pas
              modifiée depuis cette page.
            </p>

          </div>
        )}

        
        {/* BOUTONS */}
        

        <div className="
          flex
          flex-col-reverse
          sm:flex-row
          justify-end
          gap-3
          pt-2
        ">

          {/* ANNULER */}

          <Link
            to="/patrimoine/vehicule"
            className="
              inline-flex
              items-center
              justify-center
              px-6
              py-2.5
              rounded-lg
              border
              border-gray-200
              text-gray-600
              font-semibold
              hover:bg-gray-100
              transition-colors
            "
          >
            Annuler
          </Link>

          {/* ENREGISTRER */}

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              px-7
              py-2.5
              rounded-lg
              bg-haigana-blue
              text-white
              font-semibold
              hover:opacity-90
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition
            "
          >

            {saving ? (
              <>
                <span className="
                  mr-2
                  h-4
                  w-4
                  rounded-full
                  border-2
                  border-white/40
                  border-t-white
                  animate-spin"
                />

                Enregistrement...
              </>
            ) : (
              "Enregistrer les modifications"
            )}

          </button>

        </div>

      </form>

    </div>
  );
}

// COMPOSANT FORM FIELD

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="
        block
        text-sm
        font-semibold
        text-haigana-dark
        mb-2
      ">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

// SELECT

function SelectField({
  name,
  value,
  onChange,
  disabled = false,
  options = [],
  getLabel,
  emptyLabel = "Sélectionner...",
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="
        w-full
        px-4
        py-2.5
        rounded-lg
        border
        border-gray-200
        bg-white
        text-haigana-dark
        outline-none
        focus:border-haigana-blue
        focus:ring-2
        focus:ring-haigana-blue/20
        disabled:bg-gray-100
        disabled:text-gray-500
        disabled:cursor-not-allowed
        transition
      "
    >

      <option value="">
        {emptyLabel}
      </option>

      {options.map((item) => (
        <option
          key={item.id}
          value={item.id}
        >
          {getLabel
            ? getLabel(item)
            : item.libelle ||
              item.nom ||
              item.name ||
              `ID ${item.id}`}
        </option>
      ))}

    </select>
  );
}