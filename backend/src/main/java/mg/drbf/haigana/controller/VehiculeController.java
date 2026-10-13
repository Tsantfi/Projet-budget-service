package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.AffectationVehiculeRequest;
import mg.drbf.haigana.dto.CondamnationRequest;
import mg.drbf.haigana.dto.VehiculeRequest;
import mg.drbf.haigana.dto.VehiculeResponse;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import mg.drbf.haigana.dto.CondamnationSortieRequest;
import mg.drbf.haigana.dto.VehiculeImportExcelRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
public class VehiculeController {

    private final VehiculeRepository vehiculeRepository;
    private final SoaCodeRepository soaCodeRepository;
    private final EtatRepository etatRepository;
    private final GenreRepository genreRepository;
    private final MarqueRepository marqueRepository;
    private final TypeVehiculeRepository typeVehiculeRepository;
    private final CarburantRepository carburantRepository;
    private final DetenteurRepository detenteurRepository;
    private final ChauffeurRepository chauffeurRepository;

    // HISTORIQUE
    private final EntreeRepository entreeRepository;
    private final SortieRepository sortieRepository;
    private final AffectationRepository affectationRepository;
    private final CondamnationRepository condamnationRepository;
    private final AchatRepository achatRepository;
    private final AffectationEntreeRepository affectationEntreeRepository;
    private final DonRepository donRepository;

    // CONTROLES
    private final ControleRepository controleRepository;
    private final ConstatationRepository constatationRepository;
    private final ProcesVerbalRepository procesVerbalRepository;
    private final BonCommandeRepository bonCommandeRepository;

    // ENTRETIEN / SUIVI / DEPLACEMENT
    private final SuiviRepository suiviRepository;
    private final EntretienRepository entretienRepository;
    private final ReparationRepository reparationRepository;
    private final ConduiteChauffeurRepository conduiteChauffeurRepository;
    private final ControleDeplacementRepository controleDeplacementRepository;
    private final MinistereRepository ministereRepository;

    
    @PersistenceContext
    private EntityManager entityManager;

    // ENTITY -> DTO

    private VehiculeResponse toResponse(Vehicule v) {

        return VehiculeResponse.builder()
                .id(v.getId())
                .immatricule(v.getImmatricule())
                .prixVehicule(v.getPrixVehicule())
                .dateCirculation(v.getDateCirculation())
                .categorie(v.getCategorie())
                .carteGriseDisponible(v.getCarteGriseDisponible())
                .localiteTexte(v.getLocaliteTexte())
                .localiteLatitude(v.getLocaliteLatitude())
                .localiteLongitude(v.getLocaliteLongitude())
                .lieuParcoursDepart(v.getLieuParcoursDepart())
                .lieuParcoursArrivee(v.getLieuParcoursArrivee())
                .lieuAffectationActuel(v.getLieuAffectationActuel())
                .valide(v.isValide())
                .pieceJustificativeUrl(v.getPieceJustificativeUrl())

                .etat(
                        v.getEtat() == null
                                ? null
                                : VehiculeResponse.EtatResponse.builder()
                                        .id(v.getEtat().getId())
                                        .etatVehicule(
                                                v.getEtat().getEtatVehicule()
                                        )
                                        .build()
                )

                .genre(
                        v.getGenre() == null
                                ? null
                                : VehiculeResponse.GenreResponse.builder()
                                        .id(v.getGenre().getId())
                                        .genreVehicule(
                                                v.getGenre().getGenreVehicule()
                                        )
                                        .build()
                )

                .marque(
                        v.getMarque() == null
                                ? null
                                : VehiculeResponse.MarqueResponse.builder()
                                        .id(v.getMarque().getId())
                                        .marqueVehicule(
                                                v.getMarque().getMarqueVehicule()
                                        )
                                        .build()
                )

                .type(
                        v.getType() == null
                                ? null
                                : VehiculeResponse.TypeVehiculeResponse.builder()
                                        .id(v.getType().getId())
                                        .typeDuVehicule(
                                                v.getType().getTypeDuVehicule()
                                        )
                                        .build()
                )

                .carburant(
                        v.getCarburant() == null
                                ? null
                                : VehiculeResponse.CarburantResponse.builder()
                                        .id(v.getCarburant().getId())
                                        .libelle(
                                                v.getCarburant().getLibelle()
                                        )
                                        .build()
                )

                .detenteur(
                        v.getDetenteur() == null
                                ? null
                                : VehiculeResponse.DetenteurResponse.builder()
                                        .id(v.getDetenteur().getId())
                                        .nomDetenteur(
                                                v.getDetenteur().getNomDetenteur()
                                        )
                                        .prenomDetenteur(
                                                v.getDetenteur().getPrenomDetenteur()
                                        )
                                        .immatriculeDetenteur(
                                                v.getDetenteur()
                                                        .getImmatriculeDetenteur()
                                        )
                                        .cinDetenteur(
                                                v.getDetenteur().getCinDetenteur()
                                        )
                                        .districtDetenteur(
                                                v.getDetenteur()
                                                        .getDistrictDetenteur()
                                        )
                                        .build()
                )

                .chauffeur(
                        v.getChauffeur() == null
                                ? null
                                : VehiculeResponse.ChauffeurResponse.builder()
                                        .id(v.getChauffeur().getId())
                                        .nomChauffeur(
                                                v.getChauffeur().getNomChauffeur()
                                        )
                                        .immatriculeChauffeur(
                                                v.getChauffeur()
                                                        .getImmatriculeChauffeur()
                                        )
                                        .cinChauffeur(
                                                v.getChauffeur().getCinChauffeur()
                                        )
                                        .build()
                )

                .codeSoa(
                        v.getCodeSoa() == null
                                ? null
                                : VehiculeResponse.SoaResponse.builder()
                                        .id(v.getCodeSoa().getId())
                                        .codeSoa(
                                                v.getCodeSoa().getCodeSoa()
                                        )
                                        .build()
                )
                .ministere(
                        v.getMinistere() == null
                                ? null
                                : VehiculeResponse.MinistereResponse.builder()
                                        .id(v.getMinistere().getId())
                                        .nomMinistere(
                                                v.getMinistere().getNomMinistere()
                                        )
                                        .districtMinistere(
                                                v.getMinistere().getDistrictMinistere()
                                        )
                                        .build()
                )

                .build();
    }
    
    private Ministere trouverMinistere(Long id) {

    if (id == null) {
        return null;
    }

    return ministereRepository
            .findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Ministère introuvable : " + id
                    )
            );
    }
    
    // CRÉATION DIRECTE DEPUIS UN FICHIER EXCEL

    @PostMapping("/import-excel")
    @Transactional
    public Vehicule createDepuisExcel(
            @RequestBody VehiculeImportExcelRequest request) {

        // IMMATRICULATION

        String immatricule =
                normaliserImmatriculation(
                        request.getImmatricule()
                );

        if (immatricule == null ||
                immatricule.isBlank()) {

            throw new IllegalArgumentException(
                    "L'immatriculation est obligatoire."
            );
        }

        // VÉRIFICATION DOUBLON

        if (vehiculeRepository
                .findByImmatricule(immatricule)
                .isPresent()) {

            throw new IllegalStateException(
                    "Ce véhicule existe déjà : "
                            + immatricule
            );
        }

        // SOA

        if (request.getSoaId() == null) {

            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }

        SoaCode soaCode =
                soaCodeRepository
                        .findById(
                                request.getSoaId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + request.getSoaId()
                                )
                        );

        // CRÉATION VEHICULE

        Vehicule vehicule =
                new Vehicule();

        vehicule.setImmatricule(
                immatricule
        );

        vehicule.setPrixVehicule(
                request.getPrixVehicule() != null
                        ? request.getPrixVehicule()
                        : 0.0
        );

        vehicule.setDateCirculation(
                request.getDateCirculation() != null
                        ? request.getDateCirculation()
                        : LocalDate.now()
        );

        vehicule.setCategorie(
                request.getCategorie() != null
                        ? request.getCategorie()
                        : "SERVICE"
        );

        vehicule.setCarteGriseDisponible(
                request.getCarteGriseDisponible() != null
                        ? request.getCarteGriseDisponible()
                        : true
        );

        // RÉFÉRENCES

        vehicule.setGenre(
                trouverOuCreerGenre(
                        request.getGenre()
                )
        );

        vehicule.setMarque(
                trouverOuCreerMarque(
                        request.getMarque()
                )
        );

        vehicule.setType(
                trouverOuCreerType(
                        request.getType()
                )
        );

        vehicule.setEtat(
                trouverEtat(
                        request.getEtatId()
                )
        );

        vehicule.setCarburant(
                trouverCarburant(
                        request.getCarburantId()
                )
        );

        // SOA

        vehicule.setCodeSoa(
                soaCode
        );

        // MINISTÈRE

        if (request.getMinistereId() != null) {

            vehicule.setMinistere(
                    trouverMinistere(
                            request.getMinistereId()
                    )
            );

        } else if (soaCode.getMinistere() != null) {

            /*
             * Le ministère du véhicule est automatiquement récupéré
             * depuis le SOA.
             */
            vehicule.setMinistere(
                    soaCode.getMinistere()
            );
        }

        // DÉTENTEUR

        /*
         * Le fichier Excel contient les informations du détenteur.
         * On utilise donc la méthode de création automatique.
         */

        if (request.getNomDetenteur() != null
                && !request.getNomDetenteur()
                        .trim()
                        .isEmpty()) {

            VehiculeRequest vehiculeRequest =
                    new VehiculeRequest();

            vehiculeRequest.setNomDetenteur(
                    request.getNomDetenteur()
            );

            vehiculeRequest.setPrenomDetenteur(
                    request.getPrenomDetenteur() != null
                            ? request.getPrenomDetenteur()
                            : "Non spécifié"
            );

            vehiculeRequest.setImmatriculeDetenteur(
                    request.getImmatriculeDetenteur() != null
                            ? request.getImmatriculeDetenteur()
                            : "DET-" + immatricule
            );

            vehiculeRequest.setCinDetenteur(
                    request.getCinDetenteur() != null
                            ? request.getCinDetenteur()
                            : "000000000000"
            );

            vehiculeRequest.setDistrictDetenteur(
                    request.getDistrictDetenteur() != null
                            ? request.getDistrictDetenteur()
                            : soaCode.getMinistere() != null
                                ? soaCode.getMinistere()
                                    .getDistrictMinistere()
                                : "MAHAJANGA I"
            );

            vehicule.setDetenteur(
                    trouverOuCreerDetenteur(
                            vehiculeRequest
                    )
            );
        }

        // CHAUFFEUR

        /*
         * Le chauffeur n'est pas obligatoire dans Excel.
         * On le laisse donc null lorsqu'il n'est pas fourni.
         */
        if (request.getNomChauffeur() != null
                && !request.getNomChauffeur()
                        .trim()
                        .isEmpty()) {

            VehiculeRequest vehiculeRequest =
                    new VehiculeRequest();

            vehiculeRequest.setNomChauffeur(
                    request.getNomChauffeur()
            );

            vehiculeRequest.setImmatriculeChauffeur(
                    request.getImmatriculeChauffeur() != null
                            ? request.getImmatriculeChauffeur()
                            : "CHF-" + immatricule
            );

            vehiculeRequest.setCinChauffeur(
                    request.getCinChauffeur() != null
                            ? request.getCinChauffeur()
                            : "000000000000"
            );

            vehicule.setChauffeur(
                    trouverOuCreerChauffeur(
                            vehiculeRequest
                    )
            );
        }

        // LOCALISATION

        vehicule.setLocaliteTexte(
                request.getLocaliteTexte()
        );

        vehicule.setLocaliteLatitude(
                request.getLocaliteLatitude()
        );

        vehicule.setLocaliteLongitude(
                request.getLocaliteLongitude()
        );

        vehicule.setLieuParcoursDepart(
                request.getLieuParcoursDepart()
        );

        vehicule.setLieuParcoursArrivee(
                request.getLieuParcoursArrivee()
        );

        vehicule.setPieceJustificativeUrl(
                request.getPieceJustificativeUrl()
        );

        // ENREGISTREMENT

        Vehicule saved =
                vehiculeRepository.save(
                        vehicule
                );

        // ENTRÉE AUTOMATIQUE

        entreeRepository.save(
                Entree.builder()
                        .vehicule(saved)
                        .dateEntree(LocalDate.now())
                        .build()
        );

        return saved;
    }


    // NORMALISATION IMMATRICULATION

    private String normaliserImmatriculation(String immatricule) {

        if (immatricule == null) {
            return null;
        }

        return immatricule
                .trim()
                .replaceAll("\\s+", "")
                .toUpperCase();
    }


    // LISTE VEHICULES

    @GetMapping
    @Transactional(readOnly = true)
    public List<VehiculeResponse> findAll(
            @RequestParam(required = false) Long soaId) {

        List<Vehicule> vehicules =
                soaId != null
                        ? vehiculeRepository.findByCodeSoa_Id(soaId)
                        : vehiculeRepository.findAll();

        return vehicules.stream()
                .map(this::toResponse)
                .toList();
    }


    // VEHICULE PAR ID

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public VehiculeResponse findById(@PathVariable Long id) {

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        return toResponse(vehicule);
    }


    // VEHICULES DISPONIBLES

    @GetMapping("/disponibles")
    @Transactional(readOnly = true)
    public List<VehiculeResponse> findDisponibles() {

        return vehiculeRepository.findVehiculesDisponibles()
                .stream()
                .map(this::toResponse)
                .toList();
    }
    // SORTIE + CONDAMNATION + SUPPRESSION VEHICULE

    @PostMapping("/{id}/sortie")
    @Transactional
    public void sortieVehicule(
            @PathVariable Long id,
            @RequestBody CondamnationSortieRequest request) {

        // VERIFICATION REQUETE

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données de sortie sont obligatoires."
            );
        }

        if (request.getMotif() == null
                || request.getMotif().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Le motif est obligatoire."
            );
        }

        if (request.getPiece() == null
                || request.getPiece().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "La pièce est obligatoire."
            );
        }


        // VEHICULE

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );


        // DONNEES

        String motif =
                request.getMotif().trim();

        String piece =
                request.getPiece().trim();

        LocalDate date =
                request.getDate() != null
                        ? request.getDate()
                        : LocalDate.now();

        String immatricule =
                normaliserImmatriculation(
                        vehicule.getImmatricule()
                );


        // CREATION DE LA SORTIE

        Sortie sortie =
                sortieRepository.saveAndFlush(
                        Sortie.builder()
                                .dateSortie(date)
                                .type(TypeSortie.CONDAMNATION)
                                .vehicule(vehicule)
                                .description(motif)
                                .pieceJustificativeUrl(piece)
                                .build()
                );


        // CREATION DE L'HISTORIQUE CONDAMNATION
        
        String lieuCondamnation = request.getLieuCondamnation() != null && !request.getLieuCondamnation().trim().isEmpty()
                ? request.getLieuCondamnation().trim()
                : (vehicule.getLocaliteTexte() != null ? vehicule.getLocaliteTexte().trim() : "Non spécifié");

        condamnationRepository.saveAndFlush(
                Condamnation.builder()
                        .description(motif)
                        .dateCondamnation(date)
                        .piece(piece)
                        .immatriculeVehicule(immatricule)
                        .lieuCondamnation(lieuCondamnation)
                        .sortie(sortie)
                        .build()
        );

        // SUPPRESSION COMPLETE DU VEHICULE

        supprimerVehiculeCompletement(
                vehicule,
                immatricule
        );
    }

    // CREATION

    @PostMapping
    @Transactional
    public Vehicule create(@RequestBody VehiculeRequest request) {

        String immatricule =
                normaliserImmatriculation(request.getImmatricule());

        if (immatricule == null || immatricule.isBlank()) {
            throw new IllegalArgumentException(
                    "L'immatriculation est obligatoire."
            );
        }

        if (vehiculeRepository.findByImmatricule(immatricule).isPresent()) {
            throw new IllegalStateException(
                    "Ce véhicule existe déjà."
            );
        }

        // CODE SOA OBLIGATOIRE

        if (request.getSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }

        SoaCode soaCode =
                soaCodeRepository.findById(request.getSoaId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + request.getSoaId()
                                )
                        );

        Vehicule vehicule = new Vehicule();

        vehicule.setImmatricule(immatricule);
        vehicule.setPrixVehicule(request.getPrixVehicule());
        vehicule.setDateCirculation(request.getDateCirculation());
        
        vehicule.setCategorie(request.getCategorie());
        vehicule.setCarteGriseDisponible(request.getCarteGriseDisponible());


        // RÉFÉRENCES SAISIES MANUELLEMENT

        vehicule.setGenre(
                trouverOuCreerGenre(request.getGenre())
        );

        vehicule.setMarque(
                trouverOuCreerMarque(request.getMarque())
        );

        vehicule.setType(
                trouverOuCreerType(request.getType())
        );

        // RÉFÉRENCES PAR ID

        vehicule.setCarburant(
                trouverCarburant(request.getCarburantId())
        );

        vehicule.setEtat(
                trouverEtat(request.getEtatId())
        );

        // DETENTEUR SAISI MANUELLEMENT

        vehicule.setDetenteur(
                trouverOuCreerDetenteur(request)
        );

        // CHAUFFEUR SAISI MANUELLEMENT

        vehicule.setChauffeur(
                trouverOuCreerChauffeur(request)
        );

        // CODE SOA

        vehicule.setCodeSoa(soaCode);

        // MINISTÈRE
        // Le ministère est récupéré automatiquement depuis
        // le Code SOA. Il n'est donc plus envoyé par le frontend.

        if (soaCode.getMinistere() != null) {
            vehicule.setMinistere(soaCode.getMinistere());
        }

        // LOCALISATION

        vehicule.setLocaliteTexte(
                request.getLocaliteTexte()
        );
        
        if (request.getLocaliteTexte() != null && !request.getLocaliteTexte().trim().isEmpty()) {
            vehicule.setLieuAffectationActuel(request.getLocaliteTexte().trim());
        } else {
            vehicule.setLieuAffectationActuel("Non spécifié");
        }

        vehicule.setLocaliteLatitude(
                request.getLocaliteLatitude()
        );

        vehicule.setLocaliteLongitude(
                request.getLocaliteLongitude()
        );

        // TRAJET

        vehicule.setLieuParcoursDepart(
                request.getLieuParcoursDepart()
        );

        vehicule.setLieuParcoursArrivee(
                request.getLieuParcoursArrivee()
        );
        
        // PIÈCE JUSTIFICATIVE

        vehicule.setPieceJustificativeUrl(
                request.getPieceJustificativeUrl()
        );

        // ENREGISTREMENT DU VÉHICULE

        Vehicule saved =
                vehiculeRepository.save(vehicule);

        return saved;
    }

    // MODIFICATION

    @PutMapping("/{id}")
    @Transactional
    public Vehicule update(
            @PathVariable Long id,
            @RequestBody VehiculeRequest request) {

        Vehicule existing =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        String immatricule =
                normaliserImmatriculation(
                        request.getImmatricule()
                );

        if (immatricule == null || immatricule.isBlank()) {
            throw new IllegalArgumentException(
                    "L'immatriculation est obligatoire."
            );
        }

        vehiculeRepository.findByImmatricule(immatricule)
                .ifPresent(v -> {
                    if (!v.getId().equals(id)) {
                        throw new IllegalStateException(
                                "Ce véhicule existe déjà."
                        );
                    }
                });

        existing.setImmatricule(immatricule);
        existing.setPrixVehicule(request.getPrixVehicule());
        existing.setDateCirculation(request.getDateCirculation());
        
        existing.setCategorie(request.getCategorie());

        existing.setCarteGriseDisponible(
                request.getCarteGriseDisponible()
        );

        existing.setGenre(
                trouverOuCreerGenre(request.getGenre())
        );

        existing.setMarque(
                trouverOuCreerMarque(request.getMarque())
        );

        existing.setType(
                trouverOuCreerType(request.getType())
        );

        existing.setCarburant(
                trouverCarburant(request.getCarburantId())
        );

        existing.setEtat(
                trouverEtat(request.getEtatId())
        );

        existing.setDetenteur(
                trouverOuCreerDetenteur(request)
        );

        existing.setChauffeur(
                trouverOuCreerChauffeur(request)
        );

        if (request.getCodeSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }

        existing.setCodeSoa(
                soaCodeRepository.findById(request.getCodeSoaId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + request.getCodeSoaId()
                                )
                        )
        );

        existing.setLocaliteTexte(
                request.getLocaliteTexte()
        );

        existing.setLocaliteLatitude(
                request.getLocaliteLatitude()
        );

        existing.setLocaliteLongitude(
                request.getLocaliteLongitude()
        );

        existing.setLieuParcoursDepart(
                request.getLieuParcoursDepart()
        );

        existing.setLieuParcoursArrivee(
                request.getLieuParcoursArrivee()
        );

        existing.setPieceJustificativeUrl(
                request.getPieceJustificativeUrl()
        );
        
        return vehiculeRepository.save(existing);
    }


    // VALIDATION

    @PutMapping("/{id}/valider")
    @Transactional
    public Vehicule valider(@PathVariable Long id) {

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        vehicule.setValide(true);

        return vehiculeRepository.save(vehicule);
    }


    // AFFECTATION

    @PutMapping("/{id}/affecter")
    @Transactional
    public Vehicule affecter(
            @PathVariable Long id,
            @RequestBody AffectationVehiculeRequest request) {

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        if (request == null
                || request.getLieuAffectation() == null
                || request.getLieuAffectation().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Le lieu d'affectation est obligatoire."
            );
        }

        String lieu =
                request.getLieuAffectation().trim();

        LocalDate date =
                request.getDateAffectation() != null
                        ? request.getDateAffectation()
                        : LocalDate.now();

        Sortie sortie =
                sortieRepository.save(
                        Sortie.builder()
                                .dateSortie(date)
                                .type(TypeSortie.AFFECTATION)
                                .vehicule(vehicule)
                                .build()
                );

        affectationRepository.save(
                Affectation.builder()
                        .description(request.getDescription())
                        .dateAffectation(date)
                        .lieuAffectation(lieu)
                        .sortie(sortie)
                        .build()
        );

        vehicule.setLieuAffectationActuel(lieu);
        return vehiculeRepository.save(vehicule);
    }


    // CONDAMNER VEHICULE

    @DeleteMapping("/{id}/condamner")
    @Transactional
    public void condamner(
            @PathVariable Long id,
            @RequestBody CondamnationRequest request) {

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        if (request == null
                || request.getLieuCondamnation() == null
                || request.getLieuCondamnation().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Le lieu de condamnation est obligatoire."
            );
        }

        LocalDate date =
                request.getDateCondamnation() != null
                        ? request.getDateCondamnation()
                        : LocalDate.now();

        String lieu =
                request.getLieuCondamnation().trim();

        String description =
                request.getDescription() != null
                        && !request.getDescription().trim().isEmpty()
                        ? request.getDescription().trim()
                        : "Véhicule condamné";

        String immatricule =
                normaliserImmatriculation(
                        vehicule.getImmatricule()
                );

        // Création de la sortie
        Sortie sortie =
                sortieRepository.saveAndFlush(
                        Sortie.builder()
                                .dateSortie(date)
                                .type(TypeSortie.CONDAMNATION)
                                .vehicule(vehicule)
                                .build()
                );

        // Création de la condamnation
        condamnationRepository.saveAndFlush(
                Condamnation.builder()
                        .description(description)
                        .dateCondamnation(date)
                        .lieuCondamnation(lieu)
                        .immatriculeVehicule(immatricule)
                        .sortie(sortie)
                        .build()
        );

        // Suppression du véhicule
        supprimerVehiculeCompletement(
                vehicule,
                immatricule
        );
    }

    // ANNULER CONDAMNATION

    @DeleteMapping("/{id}/annuler-condamnation")
    @Transactional
    public Vehicule annulerCondamnation(
            @PathVariable Long id) {

        return vehiculeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vehicule introuvable : " + id
                        )
                );
    }


    // SUPPRESSION DEFINITIVE

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable Long id) {

        Vehicule vehicule =
                vehiculeRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vehicule introuvable : " + id
                                )
                        );

        String immatricule =
                normaliserImmatriculation(
                        vehicule.getImmatricule()
                );

        supprimerVehiculeCompletement(
                vehicule,
                immatricule
        );
    }


    // SUPPRESSION COMPLETE

    private void supprimerVehiculeCompletement(
            Vehicule vehicule,
            String immatricule) {

        Long vehiculeId = vehicule.getId();

        System.out.println("========================================");
        System.out.println("SUPPRESSION VEHICULE ID = " + vehiculeId);
        System.out.println("========================================");
        
        entityManager.createNativeQuery("""
            UPDATE recensement_vehicule 
            SET vehicule_id = NULL 
            WHERE vehicule_id = :vehiculeId
            """)
        .setParameter("vehiculeId", vehiculeId)
        .executeUpdate();

        supprimerControles(vehiculeId);
      
        entityManager.flush();
        entityManager.clear();

        supprimerSuivis(vehiculeId);

        supprimerEntretiens(vehiculeId);

        supprimerReparations(vehiculeId);

        supprimerConduites(vehiculeId);

        supprimerSorties( vehiculeId,immatricule);

        supprimerEntrees(vehiculeId);

        supprimerDeplacements(vehiculeId);

        entityManager.flush();

        Number deplacementsRestants =
                (Number) entityManager.createNativeQuery("""
                    SELECT COUNT(*)
                    FROM deplacement
                    WHERE vehicule_id = :vehiculeId
                    """)
                .setParameter(
                        "vehiculeId",
                        vehiculeId
                )
                .getSingleResult();

        long nombreDeplacements =
                deplacementsRestants.longValue();

        System.out.println(
                "DEPLACEMENTS RESTANTS AVANT VEHICULE = "
                        + nombreDeplacements
        );

        if (nombreDeplacements > 0) {

            throw new IllegalStateException(
                    "SUPPRESSION BLOQUEE : "
                            + nombreDeplacements
                            + " déplacement(s) existent encore "
                            + "pour le véhicule "
                            + vehiculeId
            );
        }


        entityManager.clear();

        System.out.println(
                "SUPPRESSION SQL DU VEHICULE = "
                        + vehiculeId
        );

        int resultat =
                entityManager.createNativeQuery("""
                    DELETE FROM vehicule
                    WHERE id = :vehiculeId
                    """)
                .setParameter(
                        "vehiculeId",
                        vehiculeId
                )
                .executeUpdate();


        System.out.println(
                "VEHICULES SUPPRIMES = "
                        + resultat
        );


        // 13. VERIFICATION

        if (resultat == 0) {

            throw new IllegalStateException(
                    "Le véhicule "
                            + vehiculeId
                            + " n'a pas été supprimé."
            );
        }


        System.out.println(
                "========================================"
        );

        System.out.println(
                "VEHICULE "
                        + vehiculeId
                        + " SUPPRIME AVEC SUCCES"
        );

        System.out.println(
                "========================================"
        );
    }

    // CONTROLES

    private void supprimerControles(Long vehiculeId) {

        List<Controle> controles =
        controleRepository
                .findForDeletion(
                        vehiculeId
                );

        for (Controle controle : controles) {

            Long controleId =
                    controle.getId();

            List<Constatation> constatations =
                    constatationRepository
                            .findByControle_Id(
                                    controleId
                            );

            for (Constatation constatation :
                    constatations) {

                Long constatationId =
                        constatation.getId();

                List<ProcesVerbal> procesVerbaux =
                        procesVerbalRepository
                                .findByConstatation_Id(
                                        constatationId
                                );

                for (ProcesVerbal pv :
                        procesVerbaux) {

                    // Les bons de commande sont conservés.
                    List<BonCommande> bons =
                            bonCommandeRepository
                                    .findByProcesVerbal_Id(
                                            pv.getId()
                                    );

                    for (BonCommande bon :
                            bons) {

                        bon.setProcesVerbal(null);

                        bonCommandeRepository.save(bon);
                    }

                    bonCommandeRepository.flush();

                    procesVerbalRepository.delete(pv);
                }

                procesVerbalRepository.flush();

                constatationRepository.delete(
                        constatation
                );
            }

            constatationRepository.flush();

            // IMPORTANT :
            // suppression des liens avant suppression du contrôle
            controleDeplacementRepository
                    .deleteByControle_Id(
                            controleId
                    );

            controleDeplacementRepository.flush();
            controleRepository.delete(controle);
        }

        controleRepository.flush();
    }


    // SUIVIS

    private void supprimerSuivis(Long vehiculeId) {

        List<Suivi> suivis =
                suiviRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        if (!suivis.isEmpty()) {

            suiviRepository.deleteAll(suivis);
            suiviRepository.flush();
        }
    }


    // ENTRETIENS

    private void supprimerEntretiens(Long vehiculeId) {

        List<Entretien> entretiens =
                entretienRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        if (!entretiens.isEmpty()) {

            entretienRepository.deleteAll(
                    entretiens
            );

            entretienRepository.flush();
        }
    }


    // REPARATIONS

    private void supprimerReparations(Long vehiculeId) {

        List<Reparation> reparations =
                reparationRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        if (!reparations.isEmpty()) {

            reparationRepository.deleteAll(
                    reparations
            );

            reparationRepository.flush();
        }
    }

    //DEPLACEMENT

    private void supprimerDeplacements(Long vehiculeId) {

        System.out.println(
                "========== DEBUT SUPPRESSION DEPLACEMENTS =========="
        );

        System.out.println(
                "Vehicule ID = " + vehiculeId
        );

        int liensSupprimes =
                entityManager.createNativeQuery("""
                    DELETE FROM controle_deplacement
                    WHERE deplacement_id IN (
                        SELECT id
                        FROM deplacement
                        WHERE vehicule_id = :vehiculeId
                    )
                    """)
                .setParameter(
                        "vehiculeId",
                        vehiculeId
                )
                .executeUpdate();

        System.out.println(
                "Liens controle_deplacement supprimés = "
                        + liensSupprimes
        );

        int deplacementsSupprimes =
                entityManager.createNativeQuery("""
                    DELETE FROM deplacement
                    WHERE vehicule_id = :vehiculeId
                    """)
                .setParameter(
                        "vehiculeId",
                        vehiculeId
                )
                .executeUpdate();

        System.out.println(
                "Déplacements supprimés = "
                        + deplacementsSupprimes
        );

        Number resultat =
                (Number) entityManager.createNativeQuery("""
                    SELECT COUNT(*)
                    FROM deplacement
                    WHERE vehicule_id = :vehiculeId
                    """)
                .setParameter(
                        "vehiculeId",
                        vehiculeId
                )
                .getSingleResult();

        long restants =
                resultat.longValue();

        System.out.println(
                "Déplacements RESTANTS = "
                        + restants
        );

        if (restants > 0) {

            throw new IllegalStateException(
                    "Impossible de supprimer les déplacements : "
                            + restants
                            + " déplacement(s) restent pour le véhicule "
                            + vehiculeId
            );
        }
    }

    // CONDUITES CHAUFFEUR

    private void supprimerConduites(Long vehiculeId) {

        List<ConduiteChauffeur> conduites =
                conduiteChauffeurRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        if (!conduites.isEmpty()) {

            conduiteChauffeurRepository
                    .deleteAll(conduites);

            conduiteChauffeurRepository.flush();
        }
    }


    // SORTIES

    private void supprimerSorties(
            Long vehiculeId,
            String immatricule) {

        List<Sortie> sorties =
                sortieRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        for (Sortie sortie : sorties) {

            Long sortieId =
                    sortie.getId();


            // ----------------------------------------------------
            // AFFECTATIONS
            // ----------------------------------------------------

            List<Affectation> affectations =
                    affectationRepository
                            .findBySortie_Id(
                                    sortieId
                            );

            if (!affectations.isEmpty()) {

                affectationRepository.deleteAll(
                        affectations
                );

                affectationRepository.flush();
            }


            // ----------------------------------------------------
            // CONDAMNATIONS
            // ----------------------------------------------------

            List<Condamnation> condamnations =
                    condamnationRepository
                            .findBySortie_Id(
                                    sortieId
                            );

            for (Condamnation condamnation :
                    condamnations) {

                if (condamnation
                        .getImmatriculeVehicule() == null
                        || condamnation
                                .getImmatriculeVehicule()
                                .isBlank()) {

                    condamnation.setImmatriculeVehicule(
                            immatricule
                    );
                }

                /*
                 * La condamnation est conservée.
                 * On enlève seulement son lien avec Sortie.
                 */
                condamnation.setSortie(null);

                condamnationRepository.save(
                        condamnation
                );
            }

            condamnationRepository.flush();


            // ----------------------------------------------------
            // SORTIE
            // ----------------------------------------------------

            sortieRepository.delete(sortie);

            sortieRepository.flush();
        }
    }


    // ENTREES

    private void supprimerEntrees(Long vehiculeId) {

        List<Entree> entrees =
                entreeRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        for (Entree entree : entrees) {

            Long entreeId =
                    entree.getId();


            // ----------------------------------------------------
            // ACHATS
            // ----------------------------------------------------

            List<Achat> achats =
                    achatRepository
                            .findByEntree_Id(
                                    entreeId
                            );

            if (!achats.isEmpty()) {

                achatRepository.deleteAll(achats);

                achatRepository.flush();
            }

            // AFFECTATIONS ENTREE

            List<AffectationEntree>
                    affectationsEntree =
                    affectationEntreeRepository
                            .findByEntree_Id(
                                    entreeId
                            );

            if (!affectationsEntree.isEmpty()) {

                affectationEntreeRepository
                        .deleteAll(
                                affectationsEntree
                        );

                affectationEntreeRepository.flush();
            }


            // ----------------------------------------------------
            // DONS
            // ----------------------------------------------------

            List<Don> dons =
                    donRepository
                            .findByEntree_Id(
                                    entreeId
                            );

            if (!dons.isEmpty()) {

                donRepository.deleteAll(dons);

                donRepository.flush();
            }


            entreeRepository.delete(entree);

            entreeRepository.flush();
        }
    }


    private Carburant trouverCarburant(Long id) {

        if (id == null) {
            return null;
        }

        return carburantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Carburant introuvable : " + id
                        )
                );
    }


    private Etat trouverEtat(Long id) {

        if (id == null) {
            return null;
        }

        return etatRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "État introuvable : " + id
                        )
                );
    }

    private Genre trouverOuCreerGenre(String valeur) {

        if (valeur == null || valeur.trim().isEmpty()) {
            return null;
        }

        String nom = valeur.trim();

        return genreRepository
                .findByGenreVehiculeIgnoreCase(nom)
                .orElseGet(() ->
                        genreRepository.save(
                                Genre.builder()
                                        .genreVehicule(nom)
                                        .build()
                        )
                );
    }


    private Marque trouverOuCreerMarque(String valeur) {

        if (valeur == null || valeur.trim().isEmpty()) {
            return null;
        }

        String nom = valeur.trim();

        return marqueRepository
                .findByMarqueVehiculeIgnoreCase(nom)
                .orElseGet(() ->
                        marqueRepository.save(
                                Marque.builder()
                                        .marqueVehicule(nom)
                                        .build()
                        )
                );
    }

    // TYPE

    private TypeVehicule trouverOuCreerType(String valeur) {

        if (valeur == null || valeur.trim().isEmpty()) {
            return null;
        }

        String nom = valeur.trim();

        return typeVehiculeRepository
                .findByTypeDuVehiculeIgnoreCase(nom)
                .orElseGet(() ->
                        typeVehiculeRepository.save(
                                TypeVehicule.builder()
                                        .typeDuVehicule(nom)
                                        .build()
                        )
                );
    }
        private Detenteur trouverOuCreerDetenteur(
        VehiculeRequest request) {

        String nomDet = request.getNomDetenteur();
        if (nomDet == null || nomDet.trim().isEmpty() || nomDet.equalsIgnoreCase("null")) {
            nomDet = "NON SPECIFIE";
        }

        String rawImmatricule = request.getImmatriculeDetenteur();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty() || rawImmatricule.equalsIgnoreCase("null")) {
            rawImmatricule = "DET-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        String immatricule = rawImmatricule
                .replaceAll("\\s+", "")
                .trim()
                .toUpperCase();

        Detenteur detenteur = detenteurRepository
                .findByImmatriculeDetenteur(immatricule)
                .orElseGet(Detenteur::new);

        detenteur.setNomDetenteur(nomDet.trim());
        detenteur.setPrenomDetenteur(request.getPrenomDetenteur() != null ? request.getPrenomDetenteur().trim() : "Non spécifié");
        detenteur.setImmatriculeDetenteur(immatricule);
        detenteur.setCinDetenteur(request.getCinDetenteur() != null ? request.getCinDetenteur().trim() : "000000000000");
        detenteur.setDistrictDetenteur(request.getDistrictDetenteur() != null ? request.getDistrictDetenteur().trim() : "BOENY");

        return detenteurRepository.save(detenteur);
    }

    
        private Chauffeur trouverOuCreerChauffeur(
        VehiculeRequest request) {

        String nomChauf = request.getNomChauffeur();
        if (nomChauf == null || nomChauf.trim().isEmpty() || nomChauf.equalsIgnoreCase("null")) {
            nomChauf = "Non spécifié";
        }

        String rawImmatricule = request.getImmatriculeChauffeur();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty() || rawImmatricule.equalsIgnoreCase("null")) {
            rawImmatricule = "CHF-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        String immatricule = rawImmatricule
                .replaceAll("\\s+", "")
                .trim()
                .toUpperCase();

        Chauffeur chauffeur = chauffeurRepository
                .findByImmatriculeChauffeur(immatricule)
                .orElseGet(Chauffeur::new);

        chauffeur.setNomChauffeur(nomChauf.trim());
        chauffeur.setImmatriculeChauffeur(immatricule);
        chauffeur.setCinChauffeur(request.getCinChauffeur() != null ? request.getCinChauffeur().trim() : "000000000000");

        return chauffeurRepository.save(chauffeur);
    }
}