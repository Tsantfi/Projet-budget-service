import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Accueil from "./pages/Accueil";
import Patrimoine from "./pages/Patrimoine";
import PatrimoineMateriel from "./pages/PatrimoineMateriel";
import PatrimoineLogement from "./pages/PatrimoineLogement";
import VehiculeSoa from "./pages/VehiculeSoa";
import VehiculePriseEnCharge from "./pages/VehiculePriseEnCharge";
import VehiculeConsultation from "./pages/VehiculeConsultation";
import VehiculeSituation from "./pages/VehiculeSituation";
import VehiculeControle from "./pages/VehiculeControle";
import VehiculeDeplacement from "./pages/VehiculeDeplacement";
import VehiculeBonCommande from "./pages/VehiculeBonCommande";
import Statistique from "./pages/Statistique";
import APropos from "./pages/APropos";
import Profil from "./pages/Profil";

import DetenteurAdmin from "./pages/DetenteurAdmin";
import SoaAdmin from "./pages/SoaAdmin";

import VehiculeProcesVerbal from "./pages/VehiculeProcesVerbal";
import VehiculeConstatation from "./pages/VehiculeConstatation";
import VehiculeModifier from "./pages/VehiculeModifier";

import Chauffeur from "./pages/Chauffeur";
import Deplacement from "./pages/Deplacement";
import Ministere from "./pages/Ministere";

import Livret from "./pages/Livret";
import LivretForm from "./pages/LivretForm";
import LivretConsultation from "./pages/LivretConsultation";

import EntreeForm from "./pages/EntreeForm";
import EntreeAdmin from "./pages/EntreeAdmin";
import Achat from "./pages/Achat";
import AchatForm from "./pages/AchatForm";
import AchatConsultation from "./pages/AchatConsultation";

import Don from "./pages/Don";
import DonForm from "./pages/DonForm";

import Affectation from "./pages/Affectation";
import AffectationForm from "./pages/AffectationForm";
import AffectationConsultation from "./pages/AffectationConsultation";

import EtatAdmin from "./pages/EtatAdmin";
import GenreAdmin from "./pages/GenreAdmin";
import TypeVehiculeAdmin from "./pages/TypeVehiculeAdmin";

import ReparationAdmin from "./pages/ReparationAdmin";
import EntretienAdmin from "./pages/EntretienAdmin";
import SuiviAdmin from "./pages/SuiviAdmin";

import DeplacementAdmin from "./pages/DeplacementAdmin";
import ControleAdmin from "./pages/ControleAdmin";

import Detenteur from "./pages/Detenteur";
import Gestion from "./pages/Gestion";

import SortieAdmin from "./pages/SortieAdmin";
import SortieConsultation from "./pages/SortieConsultation";

import KilometrageVehicule from "./pages/KilometrageVehicule";
import Region from "./pages/Region";
import CondamnationAdmin from "./pages/CondamnationAdmin";

import ArgentpubliqueAdmin from "./pages/ArgentpubliqueAdmin";
import VehiculeSortie from "./pages/VehiculeSortie";

import Recensement from "./pages/Recensement";
import SortieQuitus from "./pages/SortieQuitus";
import QuitusDocument from "./pages/QuitusDocument";
import RecensementDocument from "./pages/RecensementDocument";
import IdentificationSoa from "./pages/IdentificationSoa";
import RecensementAdmin from "./pages/RecesementAdmin";
import NomenclatureGestion from "./pages/NomenclatureGestion";
import MaterielModification from "./pages/MaterielModification";
import RecensementMateriel from "./pages/RecensementMateriel";
import RecensementMaterielDocument from "./pages/RecensementMaterielDocument";
import EtatAppreciatifMateriel from "./pages/EtatAppreciatifMateriel";
import QuitusMaterielDocument from "./pages/QuitusMaterielDocument";
import ImportVehiculeExcel from "./pages/ImportVehiculeExcel";
import RecensementComparer from "./pages/RecensementComparer";
import ImportMaterielExcel from "./pages/ImportMaterielExcel";
import RecensementMaterielComparer from "./pages/RecensementMaterielComparer";
import Logement from "./pages/PatrimoineLogement";
import LogementEntree from "./pages/LogementEntree";
import RecensementLogement from "./pages/RecensementLogement";
import LogementConsultation from "./pages/LogementConsultation";
import LogementModifier from "./pages/LogementModifier";
import ImportLogementExcel from "./pages/ImportLogementExcel";
import LogementComparer from "./pages/LogementComparer";
import QuitusLogementDocument from "./pages/QuitusLogementDocument";
import LogementRecensementDocument from "./pages/LogementRecensementDocument";
import GestionSoa from "./pages/GestionSoa";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/accueil" element={<Accueil />} />
        <Route path="/patrimoine" element={<Patrimoine />} />
        <Route path="/patrimoine/materiel" element={<PatrimoineMateriel />} />
        <Route path="/patrimoine/logement" element={<PatrimoineLogement />} />
        <Route path="/patrimoine/vehicule" element={<VehiculeSoa />} />
        <Route path="/patrimoine/vehicule/nouveau" element={<VehiculePriseEnCharge />} />
        <Route path="/patrimoine/vehicule/livret" element={<Livret />} />
        <Route path="/patrimoine/vehicule/:id/consultation" element={<VehiculeConsultation />} />
        <Route path="/patrimoine/vehicule/:id/situation" element={<VehiculeSituation />} />
        <Route path="/patrimoine/vehicule/:id/controle" element={<VehiculeControle />} />
        <Route path="/patrimoine/vehicule/:id/deplacement" element={<VehiculeDeplacement />} />
        <Route path="/patrimoine/vehicule/:id/kilometrage" element={<KilometrageVehicule />} />
        <Route path="/patrimoine/vehicule/bon-commande" element={<VehiculeBonCommande />} />
        <Route path="/patrimoine/vehicule/detenteurs" element={<DetenteurAdmin />} />
        <Route path="/patrimoine/vehicule/codes-soa" element={<SoaAdmin />} />
        <Route path="/patrimoine/detenteur" element={<Detenteur />} />
        <Route path="/patrimoine/vehicule/:id/controle/:controleId/constatations" element={<VehiculeConstatation />} />
        <Route path="/patrimoine/vehicule/:id/constatation/:constatationId/pv" element={<VehiculeProcesVerbal />} />

        <Route path="/patrimoine/livret" element={<Livret />} />
        <Route path="/patrimoine/livret/nouveau" element={<LivretForm />} />
        <Route path="/patrimoine/livret/:id/modifier" element={<LivretForm />} />
        <Route path="/patrimoine/livret/:id" element={<LivretConsultation />} />
        <Route path="/patrimoine/livret/:id/consultation" element={<LivretConsultation />} />


        <Route path="/patrimoine/vehicule/:id/deplacement" element={<Deplacement />} />
        <Route path="/patrimoine/ministeres" element={<Ministere />} />
        <Route path="/gestion/chauffeurs" element={<Chauffeur />} />
        <Route path="/patrimoine/vehicule/:id/modifier" element={<VehiculeModifier />} />

        <Route path="/patrimoine/entree/nouveau" element={<EntreeForm />} />
        <Route path="/patrimoine/entree/:id/modifier" element={<EntreeForm />} />

        <Route path="/patrimoine/achats" element={<Achat />} />
        <Route path="/patrimoine/achat/nouveau" element={<AchatForm />} />
        <Route path="/patrimoine/achat/:id/modifier" element={<AchatForm />} />
        <Route path="/patrimoine/achat/:id/consultation" element={<AchatConsultation />} />

        <Route path="/patrimoine/dons" element={<Don />} />
        <Route path="/patrimoine/don/nouveau" element={<DonForm />} />
        <Route path="/patrimoine/don/:id/modifier" element={<DonForm />} />
        <Route path="/patrimoine/affectations" element={<Affectation />} />
        <Route path="/patrimoine/affectations/nouveau" element={<AffectationForm />} />
        <Route path="/patrimoine/affectations/:id/modifier" element={<AffectationForm />} />
        <Route path="/patrimoine/affectations/:id/consultation" element={<AffectationConsultation />} />

        <Route path="/gestion/etats" element={<EtatAdmin />} />
        <Route path="/gestion/genres" element={<GenreAdmin />} />
        <Route path="/gestion/types-vehicules" element={<TypeVehiculeAdmin />} />
        <Route path="/gestion/reparations" element={<ReparationAdmin />} />
        <Route path="/gestion/entretiens" element={<EntretienAdmin />} />
        <Route path="/patrimoine/entrees" element={<EntreeAdmin />} />
        <Route path="/gestion/vehicules/controles" element={<ControleAdmin />} />
        <Route path="/gestion/deplacements" element={<DeplacementAdmin />} />
        <Route path="/gestion/suivis" element={<SuiviAdmin />} />
        <Route path="/patrimoine/sorties" element={<SortieAdmin />} />
        <Route path="/patrimoine/sorties/:id/consultation" element={<SortieConsultation />} />
        <Route path="/patrimoine/regions" element={<Region />} />

        <Route path="/patrimoine/condamnations" element={<CondamnationAdmin />} />
        <Route path="/patrimoine/argent-public" element={<ArgentpubliqueAdmin />} />
        <Route path="/patrimoine/vehicule/:vehiculeId/sortie" element={<VehiculeSortie />} />

        <Route path="/patrimoine/identification-soa" element={<IdentificationSoa />} />
        <Route path="/gestion/verification-recensement" element={<RecensementAdmin />} />
        <Route path="/gestion/nomenclatures" element={<NomenclatureGestion />} />

        <Route path="/quitus/sortie" element={<SortieQuitus />} />
        <Route path="/quitus/recensement" element={<Recensement />} />
        <Route path="/quitus/document" element={<QuitusDocument />} />
        <Route path="/quitus/recensement-document" element={<RecensementDocument />} />
        <Route path="/patrimoine/materiel/:id/modifier" element={<MaterielModification />} />
        <Route path="/patrimoine/materiel/recensement" element={<RecensementMateriel />} />

        <Route path="/patrimoine/materiel/recensement/:id/document" element={<RecensementMaterielDocument />} />
        <Route path="/patrimoine/materiel/etat-appreciatif" element={<EtatAppreciatifMateriel />} />

        <Route path="/patrimoine/logement" element={<Logement />} />
        <Route path="/patrimoine/logement/entree" element={<LogementEntree />} />
        <Route path="/patrimoine/logement/recensement" element={<RecensementLogement />} />
        <Route path="/patrimoine/logement/:id/consultation" element={<LogementConsultation />} />
        <Route path="/patrimoine/logement/:id/modifier" element={<LogementModifier />} />

        <Route path="/gestion" element={<Gestion />} />
        <Route path="/statistique" element={<Statistique />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/quitus/materiel-document" element={<QuitusMaterielDocument />} />
        <Route path="/patrimoine/vehicules-import" element={<ImportVehiculeExcel />} />
        <Route path="/patrimoine/recensement-comparer" element={<RecensementComparer />} />
        <Route path="/patrimoine/materiels/import" element={<ImportMaterielExcel />} />
        <Route path="/patrimoine/materiel-comparer" element={<RecensementMaterielComparer />} />
        <Route path="/patrimoine/logements/import" element={<ImportLogementExcel />} />
        <Route path="/patrimoine/logement-comparer" element={<LogementComparer />} />
        <Route path="/quitus/logement-document" element={<QuitusLogementDocument/>}/>
        <Route path="/logement-recensement-document" element={<LogementRecensementDocument/>}/>
        <Route path="/patrimoine/admin/gestion-soa" element={<GestionSoa/>}/>

      </Route>

      <Route path="/" element={<Navigate to="/accueil" replace />} />
      <Route path="*" element={<Navigate to="/accueil" replace />} />
    </Routes>
  );
}
