package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.SoaCreateRequest;
import mg.drbf.haigana.dto.SoaResponse;
import mg.drbf.haigana.dto.VehiculeCreateRequest;
import mg.drbf.haigana.dto.VehiculeResponse;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.*;
import mg.drbf.haigana.service.VehiculeDeletionService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/soa")
@RequiredArgsConstructor

public class SoaController {
    
    @PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private final SoaCodeRepository soaCodeRepository;
    private final RegionRepository regionRepository;
    private final MinistereRepository ministereRepository;

    private final VehiculeRepository vehiculeRepository;
    private final EtatRepository etatRepository;
    private final GenreRepository genreRepository;
    private final MarqueRepository marqueRepository;
    private final TypeVehiculeRepository typeVehiculeRepository;
    private final CarburantRepository carburantRepository;
    private final DetenteurRepository detenteurRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final EntreeRepository entreeRepository;

    private final VehiculeDeletionService vehiculeDeletionService;

    private final BonCommandeRepository bonCommandeRepository;
    private final ObservationRepository observationRepository;
    private final BonCommandePieceRepository bonCommandePieceRepository;


    
    // LISTE DES SOA
    

    @GetMapping
    @Transactional(readOnly = true)
    public List<SoaResponse> findAll(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(
                    required = false,
                    defaultValue = "dateModification"
            ) String sort,
            @RequestParam(
                    required = false,
                    defaultValue = "desc"
            ) String direction
    ) {

        List<SoaCode> soaList;

        if (search != null && !search.trim().isEmpty()) {

            soaList = soaCodeRepository.search(
                    search.trim()
            );

        } else {

            soaList = soaCodeRepository.findAllComplete();
        }


        // =====================================================
        // TRI
        // =====================================================

        Comparator<SoaCode> comparator;

        switch (sort) {

            case "codeSoa":

                comparator =
                        Comparator.comparing(
                                SoaCode::getCodeSoa,
                                Comparator.nullsLast(
                                        String.CASE_INSENSITIVE_ORDER
                                )
                        );

                break;


            case "region":

                comparator =
                        Comparator.comparing(
                                s ->
                                        s.getRegion() == null
                                                ? null
                                                : s.getRegion()
                                                        .getNomRegion(),
                                Comparator.nullsLast(
                                        String.CASE_INSENSITIVE_ORDER
                                )
                        );

                break;


            case "ministere":

                comparator =
                        Comparator.comparing(
                                s ->
                                        s.getMinistere() == null
                                                ? null
                                                : s.getMinistere()
                                                        .getNomMinistere(),
                                Comparator.nullsLast(
                                        String.CASE_INSENSITIVE_ORDER
                                )
                        );

                break;


            case "dateModification":

                comparator =
                        Comparator.comparing(
                                SoaCode::getDateModification,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        );

                break;


            case "id":

                comparator =
                        Comparator.comparing(
                                SoaCode::getId,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        );

                break;


            default:

                comparator =
                        Comparator.comparing(
                                SoaCode::getDateModification,
                                Comparator.nullsLast(
                                        Comparator.naturalOrder()
                                )
                        );
        }


        if ("desc".equalsIgnoreCase(direction)) {

            comparator = comparator.reversed();
        }

        soaList.sort(comparator);


        return soaList
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // RECHERCHE PAR CODE SOA

    @GetMapping("/code/{codeSoa}")
    @Transactional(readOnly = true)
    public SoaResponse findByCode(
            @PathVariable String codeSoa
    ) {

        SoaCode soaCode =
                soaCodeRepository
                        .findByCodeSoa(codeSoa)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + codeSoa
                                )
                        );

        return toResponse(soaCode);
    }


    
    // DÉTAIL D'UN SOA
    

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public SoaResponse findById(
            @PathVariable Long id
    ) {

        SoaCode soaCode =
                soaCodeRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + id
                                )
                        );

        return toResponse(soaCode);
    }


    
    // CRÉATION SOA + VÉHICULES
    

    @PostMapping
    @Transactional
    public SoaResponse create(
            @RequestBody SoaCreateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Les données du Code SOA sont obligatoires."
            );
        }


        // -----------------------------------------------------
        // VALIDATION CODE SOA
        // -----------------------------------------------------

        if (request.getCodeSoa() == null ||
                request.getCodeSoa().isBlank()) {

            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }


        String codeSoa =
                request.getCodeSoa().trim();


        if (soaCodeRepository
                .findByCodeSoa(codeSoa)
                .isPresent()) {

            throw new IllegalStateException(
                    "Ce code SOA existe déjà."
            );
        }


        // -----------------------------------------------------
        // RÉGION
        // -----------------------------------------------------

        Region region = null;

        if (request.getRegionId() != null) {

            region =
                    regionRepository
                            .findById(request.getRegionId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Région introuvable : "
                                                    + request.getRegionId()
                                    )
                            );
        }

        // MINISTÈRE — SAISIE MANUELLE

        Ministere ministere =
        trouverOuCreerMinistere(
                request.getNomMinistere(),
                request.getDistrictMinistere()
        );

        // -----------------------------------------------------
        // CRÉATION SOA
        // -----------------------------------------------------

        SoaCode soa =
                SoaCode.builder()
                        .codeSoa(codeSoa)
                        .region(region)
                        .ministere(ministere)
                        .dateModification(
                                LocalDateTime.now()
                        )
                        .build();


        soa = soaCodeRepository.save(soa);


        // -----------------------------------------------------
        // CRÉATION DES VÉHICULES
        // -----------------------------------------------------

        if (request.getVehicules() != null) {

            for (VehiculeCreateRequest data :
                    request.getVehicules()) {

                Vehicule vehicule =
                        createVehicule(
                                data,
                                soa
                        );


                Vehicule saved =
                        vehiculeRepository.save(vehicule);


                // Entrée automatique

                Entree entree =
                        Entree.builder()
                                .vehicule(saved)
                                .dateEntree(LocalDate.now())
                                .build();


                entreeRepository.save(entree);
            }
        }


        return toResponse(soa);
    }


    
    // MODIFICATION SOA + VÉHICULES
    

    @PutMapping("/{id}")
    @Transactional
    public SoaResponse update(
            @PathVariable Long id,
            @RequestBody SoaCreateRequest request
    ) {

        // -----------------------------------------------------
        // RÉCUPÉRATION SOA
        // -----------------------------------------------------

        SoaCode soa =
                soaCodeRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + id
                                )
                        );


        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (request == null ||
                request.getCodeSoa() == null ||
                request.getCodeSoa().isBlank()) {

            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }


        String nouveauCode =
                request.getCodeSoa().trim();


        // -----------------------------------------------------
        // VÉRIFICATION CODE SOA
        // -----------------------------------------------------

        soaCodeRepository
                .findByCodeSoa(nouveauCode)
                .ifPresent(existing -> {

                    if (!existing.getId().equals(id)) {

                        throw new IllegalStateException(
                                "Ce code SOA existe déjà."
                        );
                    }
                });


        // -----------------------------------------------------
        // RÉGION
        // -----------------------------------------------------

        Region region = null;

        if (request.getRegionId() != null) {

            region =
                    regionRepository
                            .findById(request.getRegionId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Région introuvable : "
                                                    + request.getRegionId()
                                    )
                            );
        }

        // MINISTÈRE — SAISIE MANUELLE

        Ministere ministere =
            trouverOuCreerMinistere(
                    request.getNomMinistere(),
                    request.getDistrictMinistere()
            );

        // -----------------------------------------------------
        // MISE À JOUR SOA
        // -----------------------------------------------------

        soa.setCodeSoa(nouveauCode);
        soa.setRegion(region);
        soa.setMinistere(ministere);
        soa.setDateModification(
                LocalDateTime.now()
        );

        soa = soaCodeRepository.save(soa);

        // VÉHICULES

        if (request.getVehicules() != null) {

            for (VehiculeCreateRequest data :
                    request.getVehicules()) {

                if (data.getImmatricule() == null ||
                        data.getImmatricule().isBlank()) {

                    throw new IllegalArgumentException(
                            "L'immatriculation du véhicule "
                                    + "est obligatoire."
                    );
                }


                Vehicule vehicule =
                        vehiculeRepository
                                .findByImmatricule(
                                        data.getImmatricule()
                                                .trim()
                                )
                                .orElse(null);


                // -------------------------------------------------
                // VÉHICULE EXISTANT
                // -------------------------------------------------

                if (vehicule != null) {

                    if (vehicule.getCodeSoa() == null ||
                            !vehicule.getCodeSoa()
                                    .getId()
                                    .equals(id)) {

                        throw new IllegalStateException(
                                "Le véhicule "
                                        + data.getImmatricule()
                                        + " appartient déjà "
                                        + "à un autre SOA."
                        );
                    }


                    updateVehicule(
                            vehicule,
                            data,
                            soa
                    );


                    vehiculeRepository.save(vehicule);
                }


                // -------------------------------------------------
                // NOUVEAU VÉHICULE
                // -------------------------------------------------

                else {

                    vehicule =
                            createVehicule(
                                    data,
                                    soa
                            );


                    Vehicule saved =
                            vehiculeRepository.save(vehicule);


                    Entree entree =
                            Entree.builder()
                                    .vehicule(saved)
                                    .dateEntree(LocalDate.now())
                                    .build();


                    entreeRepository.save(entree);
                }
            }
        }


        return toResponse(soa);
    }

    
    // CRÉATION VÉHICULE (CORRIGÉ ET SÉCURISÉ)
    
    private Vehicule createVehicule(
        VehiculeCreateRequest data,
        SoaCode soa
    ) {
        if (data == null) {
            throw new IllegalArgumentException(
                    "Les données du véhicule sont obligatoires."
            );
        }

        String rawImmatricule = data.getImmatricule();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty() || rawImmatricule.equalsIgnoreCase("null")) {
            rawImmatricule = "SANS-IMMAT-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        String immatricule = rawImmatricule
                .trim()
                .replaceAll("\\s+", "")
                .toUpperCase();

        Vehicule vehicule = Vehicule.builder()
                .immatricule(immatricule)
                .prixVehicule(data.getPrixVehicule() != null ? data.getPrixVehicule() : 0.0)
                .dateCirculation(data.getDateCirculation() != null ? data.getDateCirculation() : LocalDate.now())
                .localiteTexte(data.getLocaliteTexte())
                .localiteLatitude(data.getLocaliteLatitude())
                .localiteLongitude(data.getLocaliteLongitude())
                .lieuParcoursDepart(data.getLieuParcoursDepart())
                .lieuParcoursArrivee(data.getLieuParcoursArrivee())
                .lieuAffectationActuel(data.getLieuAffectationActuel() != null ? data.getLieuAffectationActuel() : "Non spécifié")
                .pieceJustificativeUrl(data.getPieceJustificativeUrl())
                .categorie(data.getCategorie() != null ? data.getCategorie() : "SERVICE")
                .carteGriseDisponible(data.getCarteGriseDisponible() != null ? data.getCarteGriseDisponible() : true)
                .codeSoa(soa)
                .ministere(soa.getMinistere())
                .build();

        applyReferences(vehicule, data);
        
        // FIX : Passage direct de l'objet 'data' sans conversion erronée
        vehicule.setDetenteur(trouverOuCreerDetenteur(data));
        vehicule.setChauffeur(trouverOuCreerChauffeur(data));

        return vehicule;
    }
    
    // MODIFICATION VÉHICULE (SÉCURISÉE)
    
    private void updateVehicule(
            Vehicule vehicule,
            VehiculeCreateRequest data,
            SoaCode soa
    ) {
        String rawImmatricule = data.getImmatricule();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty() || rawImmatricule.equalsIgnoreCase("null")) {
            rawImmatricule = vehicule.getImmatricule() != null ? vehicule.getImmatricule() : "SANS-IMMAT-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        }

        vehicule.setImmatricule(rawImmatricule.trim().replaceAll("\\s+", "").toUpperCase());
        vehicule.setPrixVehicule(data.getPrixVehicule() != null ? data.getPrixVehicule() : 0.0);
        vehicule.setDateCirculation(data.getDateCirculation() != null ? data.getDateCirculation() : LocalDate.now());
        vehicule.setCategorie(data.getCategorie() != null ? data.getCategorie() : "SERVICE");
        vehicule.setCarteGriseDisponible(data.getCarteGriseDisponible() != null ? data.getCarteGriseDisponible() : true);
        vehicule.setLocaliteTexte(data.getLocaliteTexte());
        vehicule.setLocaliteLatitude(data.getLocaliteLatitude());
        vehicule.setLocaliteLongitude(data.getLocaliteLongitude());
        vehicule.setLieuParcoursDepart(data.getLieuParcoursDepart());
        vehicule.setLieuParcoursArrivee(data.getLieuParcoursArrivee());
        vehicule.setLieuAffectationActuel(data.getLieuAffectationActuel() != null ? data.getLieuAffectationActuel() : "Non spécifié");
        vehicule.setPieceJustificativeUrl(data.getPieceJustificativeUrl());
        vehicule.setCodeSoa(soa);
        vehicule.setMinistere(soa.getMinistere());

        applyReferences(vehicule, data);

        // FIX : Passage direct de l'objet 'data' sans conversion erronée
        if (data.getNomDetenteur() != null && !data.getNomDetenteur().isBlank()) {
            vehicule.setDetenteur(trouverOuCreerDetenteur(data));
        }
        if (data.getNomChauffeur() != null && !data.getNomChauffeur().isBlank()) {
            vehicule.setChauffeur(trouverOuCreerChauffeur(data));
        }
    }

    // RELATIONS DE RÉFÉRENCE

        private void applyReferences(
            Vehicule vehicule,
            VehiculeCreateRequest data
    ) {
        // ETAT
        if (data.getEtatId() != null) {
            vehicule.setEtat(
                    etatRepository.findById(data.getEtatId())
                            .orElseThrow(() -> new ResourceNotFoundException("Etat introuvable : " + data.getEtatId()))
            );
        } else {
            vehicule.setEtat(null);
        }

        // SAISIES MANUELLES EN LIGNE (Genre / Marque / Type)
        vehicule.setGenre(trouverOuCreerGenre(data.getGenre()));
        vehicule.setMarque(trouverOuCreerMarque(data.getMarque()));
        vehicule.setType(trouverOuCreerType(data.getType()));

        // CARBURANT
        if (data.getCarburantId() != null) {
            vehicule.setCarburant(
                    carburantRepository.findById(data.getCarburantId())
                            .orElseThrow(() -> new ResourceNotFoundException("Carburant introuvable : " + data.getCarburantId()))
            );
        } else {
            vehicule.setCarburant(null);
        }

        // DETENTEUR PAR ID (On ne met à null que si aucun ID n'est fourni ET qu'il n'y a pas de saisie manuelle)
        if (data.getDetenteurId() != null) {
            vehicule.setDetenteur(
                    detenteurRepository.findById(data.getDetenteurId())
                            .orElseThrow(() -> new ResourceNotFoundException("Détenteur introuvable : " + data.getDetenteurId()))
            );
        } else if (data.getNomDetenteur() == null || data.getNomDetenteur().isBlank()) {
            vehicule.setDetenteur(null);
        }

        // CHAUFFEUR PAR ID (On ne met à null que si aucun ID n'est fourni ET qu'il n'y a pas de saisie manuelle)
        if (data.getChauffeurId() != null) {
            vehicule.setChauffeur(
                    chauffeurRepository.findById(data.getChauffeurId())
                            .orElseThrow(() -> new ResourceNotFoundException("Chauffeur introuvable : " + data.getChauffeurId()))
            );
        } else if (data.getNomChauffeur() == null || data.getNomChauffeur().isBlank()) {
            vehicule.setChauffeur(null);
        }
    }

    // GENRE — TROUVER OU CRÉER

    private Genre trouverOuCreerGenre(
            String valeur
    ) {

        if (valeur == null ||
                valeur.trim().isEmpty()) {

            return null;
        }


        String nom =
                valeur.trim();


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


    
    // MARQUE — TROUVER OU CRÉER
    

    private Marque trouverOuCreerMarque(
            String valeur
    ) {

        if (valeur == null ||
                valeur.trim().isEmpty()) {

            return null;
        }


        String nom =
                valeur.trim();


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


    
    // TYPE — TROUVER OU CRÉER
    

    private TypeVehicule trouverOuCreerType(
            String valeur
    ) {

        if (valeur == null ||
                valeur.trim().isEmpty()) {

            return null;
        }


        String nom =
                valeur.trim();


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

    // SUPPRESSION DU CODE SOA ET NETTOYAGE CASCADE COMPLET (IMMOBILIER/VEHICULES)

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(
            @PathVariable Long id
    ) {
        SoaCode soa = soaCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Code SOA introuvable : " + id));

        // -----------------------------------------------------
        // 0. A. FIX LOGEMENT : PURGE COMPLÈTE DU MODULE IMMOBILIER
        // -----------------------------------------------------
        // Étape 1 : Purge des captures de recensements des bâtiments de ce SOA
        entityManager.createNativeQuery("""
            DELETE FROM recensement_logement_ligne 
            WHERE logement_id IN (SELECT id FROM logement WHERE code_soa_id = :soaId)
            """)
            .setParameter("soaId", id)
            .executeUpdate();

        // Étape 2 : Suppression définitive de toutes les fiches de bâtiments du SOA
        entityManager.createNativeQuery("DELETE FROM logement WHERE code_soa_id = :soaId")
            .setParameter("soaId", id)
            .executeUpdate();

        // -----------------------------------------------------
        // 0. B. FIX MATÉRIEL : PURGE DU MODULE MOBILIER ET LOGISTIQUE
        // -----------------------------------------------------
        // Étape A : Purge des mouvements de sorties liés aux matériels de ce SOA
        entityManager.createNativeQuery("""
            DELETE FROM materiel_sortie 
            WHERE materiel_id IN (SELECT id FROM materiel WHERE soa_id = :soaId)
            """)
            .setParameter("soaId", id)
            .executeUpdate();

        // Étape B : Purge des mouvements d'entrées liés aux matériels de ce SOA
        entityManager.createNativeQuery("""
            DELETE FROM materiel_entree 
            WHERE materiel_id IN (SELECT id FROM materiel WHERE soa_id = :soaId)
            """)
            .setParameter("soaId", id)
            .executeUpdate();

        // Étape C : Purge des clichés comptables d'inventaires annuels liés à ce SOA
        entityManager.createNativeQuery("""
            DELETE FROM materiel_inventaire_annuel 
            WHERE materiel_id IN (SELECT id FROM materiel WHERE soa_id = :soaId)
            """)
            .setParameter("soaId", id)
            .executeUpdate();

        // Étape D : Suppression définitive de toutes les fiches de matériels du SOA
        entityManager.createNativeQuery("DELETE FROM materiel WHERE soa_id = :soaId")
            .setParameter("soaId", id)
            .executeUpdate();

        // -----------------------------------------------------
        // 1. PURGE DU MODULE AUTOMOBILE
        // -----------------------------------------------------
        entityManager.createNativeQuery("DELETE FROM recensement_vehicule WHERE vehicule_id IN (SELECT id FROM vehicule WHERE soa_id = :soaId)")
            .setParameter("soaId", id).executeUpdate();

        entityManager.createNativeQuery("DELETE FROM recensement WHERE soa_id = :soaId")
            .setParameter("soaId", id).executeUpdate();

        // Synchronisation forcée de la session EntityManager
        entityManager.flush();

        // Suppression complète de la flotte de véhicules via le service dédié
        List<Vehicule> vehicules = vehiculeRepository.findByCodeSoa_Id(id);
        for (Vehicule vehicule : vehicules) {
            String immatricule = vehicule.getImmatricule() == null ? null : vehicule.getImmatricule().trim().replaceAll("\\s+", "").toUpperCase();
            vehiculeDeletionService.supprimerVehiculeCompletement(vehicule, immatricule);
        }

        // -----------------------------------------------------
        // 2. BONS DE COMMANDE
        // -----------------------------------------------------
        List<BonCommande> bons = bonCommandeRepository.findByCodeSoa_Id(id);
        for (BonCommande bon : bons) {
            Long bonCommandeId = bon.getId();
            List<Observation> observations = observationRepository.findByBonCommande_Id(bonCommandeId);
            observationRepository.deleteAll(observations);
            observationRepository.flush();

            List<BonCommandePiece> pieces = bonCommandePieceRepository.findByBonCommande_Id(bonCommandeId);
            bonCommandePieceRepository.deleteAll(pieces);
            bonCommandePieceRepository.flush();
        }

        bonCommandeRepository.deleteAll(bons);
        bonCommandeRepository.flush();

        // -----------------------------------------------------
        // 3. DISSOCIATION DES DÉVENTEURS
        // -----------------------------------------------------
        List<Detenteur> detenteurs = detenteurRepository.findByService_Id(id);
        for (Detenteur detenteur : detenteurs) {
            detenteur.setService(null);
        }
        detenteurRepository.saveAllAndFlush(detenteurs);

        // -----------------------------------------------------
        // 4. SUPPRESSION FINALE DE L'ENTITÉ CODE SOA
        // -----------------------------------------------------
        soaCodeRepository.delete(soa);
        soaCodeRepository.flush();
    }
    
    // ENTITY -> RESPONSE SOA
    

    // CONVERSION SECURISEE (ANTI-ERREUR 500 SÉRIALISATION)
    
    private SoaResponse toResponse(SoaCode soa) {
        SoaResponse.RegionResponse region = null;
        if (soa.getRegion() != null) {
            try {
                region = SoaResponse.RegionResponse.builder()
                        .id(soa.getRegion().getId())
                        .nomRegion(soa.getRegion().getNomRegion())
                        .build();
            } catch (Exception e) { }
        }

        SoaResponse.MinistereResponse ministere = null;
        if (soa.getMinistere() != null) {
            try {
                ministere = SoaResponse.MinistereResponse.builder()
                        .id(soa.getMinistere().getId())
                        .nomMinistere(soa.getMinistere().getNomMinistere())
                        .districtMinistere(soa.getMinistere().getDistrictMinistere() != null ? soa.getMinistere().getDistrictMinistere() : "MAHAJANGA I")
                        .build();
            } catch (Exception e) { }
        }

        List<VehiculeResponse> vehicules = java.util.Collections.emptyList();
        if (soa.getId() != null) {
            try {
                vehicules = vehiculeRepository.findCompleteByCodeSoaId(soa.getId())
                        .stream()
                        .map(this::toVehiculeResponse)
                        .toList();
            } catch (Exception e) { }
        }

        return SoaResponse.builder()
                .id(soa.getId())
                .codeSoa(soa.getCodeSoa())
                .dateModification(soa.getDateModification())
                .region(region)
                .ministere(ministere)
                .vehicules(vehicules)
                .build();
    }


    
    // ENTITY -> RESPONSE VÉHICULE
    

    private VehiculeResponse toVehiculeResponse(
            Vehicule v
    ) {

        return VehiculeResponse
                .builder()

                .id(
                        v.getId()
                )

                .immatricule(
                        v.getImmatricule()
                )

                .prixVehicule(
                        v.getPrixVehicule()
                )

                .dateCirculation(
                        v.getDateCirculation()
                )
                .categorie(
                        v.getCategorie()
                )

                .carteGriseDisponible(
                        v.getCarteGriseDisponible()
                )

                .localiteTexte(
                        v.getLocaliteTexte()
                )

                .localiteLatitude(
                        v.getLocaliteLatitude()
                )

                .localiteLongitude(
                        v.getLocaliteLongitude()
                )

                .lieuParcoursDepart(
                        v.getLieuParcoursDepart()
                )

                .lieuParcoursArrivee(
                        v.getLieuParcoursArrivee()
                )

                .lieuAffectationActuel(
                        v.getLieuAffectationActuel()
                )

                .valide(
                        v.isValide()
                )

                .pieceJustificativeUrl(
                        v.getPieceJustificativeUrl()
                )


                // -------------------------------------------------
                // ETAT
                // -------------------------------------------------

                .etat(
                        v.getEtat() == null
                                ? null
                                : VehiculeResponse
                                        .EtatResponse
                                        .builder()
                                        .id(
                                                v.getEtat()
                                                        .getId()
                                        )
                                        .etatVehicule(
                                                v.getEtat()
                                                        .getEtatVehicule()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // GENRE
                // -------------------------------------------------

                .genre(
                        v.getGenre() == null
                                ? null
                                : VehiculeResponse
                                        .GenreResponse
                                        .builder()
                                        .id(
                                                v.getGenre()
                                                        .getId()
                                        )
                                        .genreVehicule(
                                                v.getGenre()
                                                        .getGenreVehicule()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // MARQUE
                // -------------------------------------------------

                .marque(
                        v.getMarque() == null
                                ? null
                                : VehiculeResponse
                                        .MarqueResponse
                                        .builder()
                                        .id(
                                                v.getMarque()
                                                        .getId()
                                        )
                                        .marqueVehicule(
                                                v.getMarque()
                                                        .getMarqueVehicule()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // TYPE
                // -------------------------------------------------

                .type(
                        v.getType() == null
                                ? null
                                : VehiculeResponse
                                        .TypeVehiculeResponse
                                        .builder()
                                        .id(
                                                v.getType()
                                                        .getId()
                                        )
                                        .typeDuVehicule(
                                                v.getType()
                                                        .getTypeDuVehicule()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // CARBURANT
                // -------------------------------------------------

                .carburant(
                        v.getCarburant() == null
                                ? null
                                : VehiculeResponse
                                        .CarburantResponse
                                        .builder()
                                        .id(
                                                v.getCarburant()
                                                        .getId()
                                        )
                                        .libelle(
                                                v.getCarburant()
                                                        .getLibelle()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // DETENTEUR
                // -------------------------------------------------

                .detenteur(
                        v.getDetenteur() == null
                                ? null
                                : VehiculeResponse
                                        .DetenteurResponse
                                        .builder()
                                        .id(
                                                v.getDetenteur()
                                                        .getId()
                                        )
                                        .nomDetenteur(
                                                v.getDetenteur()
                                                        .getNomDetenteur()
                                        )
                                        .prenomDetenteur(
                                                v.getDetenteur()
                                                        .getPrenomDetenteur()
                                        )
                                        .immatriculeDetenteur(
                                                v.getDetenteur()
                                                        .getImmatriculeDetenteur()
                                        )
                                        .cinDetenteur(
                                                v.getDetenteur()
                                                        .getCinDetenteur()
                                        )
                                        .districtDetenteur(
                                                v.getDetenteur()
                                                        .getDistrictDetenteur()
                                        )
                                        .build()
                )


                // CHAUFFEUR

                .chauffeur(
                        v.getChauffeur() == null
                                ? null
                                : VehiculeResponse
                                        .ChauffeurResponse
                                        .builder()
                                        .id(
                                                v.getChauffeur()
                                                        .getId()
                                        )
                                        .nomChauffeur(
                                                v.getChauffeur()
                                                        .getNomChauffeur()
                                        )
                                        .immatriculeChauffeur(
                                                v.getChauffeur()
                                                        .getImmatriculeChauffeur()
                                        )
                                        .cinChauffeur(
                                                v.getChauffeur()
                                                        .getCinChauffeur()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // SOA
                // -------------------------------------------------

                .codeSoa(
                        v.getCodeSoa() == null
                                ? null
                                : VehiculeResponse
                                        .SoaResponse
                                        .builder()
                                        .id(
                                                v.getCodeSoa()
                                                        .getId()
                                        )
                                        .codeSoa(
                                                v.getCodeSoa()
                                                        .getCodeSoa()
                                        )
                                        .build()
                )


                // -------------------------------------------------
                // MINISTÈRE
                // -------------------------------------------------

                .ministere(
                        v.getMinistere() == null
                                ? null
                                : VehiculeResponse
                                        .MinistereResponse
                                        .builder()
                                        .id(
                                                v.getMinistere()
                                                        .getId()
                                        )
                                        .nomMinistere(
                                                v.getMinistere()
                                                        .getNomMinistere()
                                        )
                                        .districtMinistere(
                                                v.getMinistere()
                                                        .getDistrictMinistere()
                                        )
                                        .build()
                )

                .build();
    }

    // MINISTÈRE — TROUVER OU CRÉER

    private Ministere trouverOuCreerMinistere(
            String nomMinistere,
            String districtMinistere
    ) {

        if (nomMinistere == null ||
                nomMinistere.trim().isEmpty()) {

            return null;
        }

        String nom = nomMinistere.trim();

        String district =
                districtMinistere == null
                        ? null
                        : districtMinistere.trim();

        if (district == null || district.isEmpty()) {

            throw new IllegalArgumentException(
                    "Le district du ministère est obligatoire."
            );
        }

        return ministereRepository
                .findByNomMinistereIgnoreCaseAndDistrictMinistereIgnoreCase(
                        nom,
                        district
                )
                .orElseGet(() ->
                        ministereRepository.save(
                                Ministere.builder()
                                        .nomMinistere(nom)
                                        .districtMinistere(district)
                                        .build()
                        )
                );
    }
    
        private Detenteur trouverOuCreerDetenteur(
            VehiculeCreateRequest request) {

        if (request.getNomDetenteur() == null
                || request.getNomDetenteur().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Le nom du détenteur est obligatoire."
            );
        }

        // Sécurisation anti-NullPointerException si le champ arrive vide de l'Excel
        String rawImmatricule = request.getImmatriculeDetenteur();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty()) {
            // Génère un matricule unique de secours (ex: DET-A2F8B) pour éviter la violation de clé unique SQL
            rawImmatricule = "DET-" + java.util.UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        }

        String immatricule = rawImmatricule
                .replaceAll("\\s+", "")
                .trim()
                .toUpperCase();

        Detenteur detenteur = detenteurRepository
                .findByImmatriculeDetenteur(immatricule)
                .orElseGet(Detenteur::new);

        detenteur.setNomDetenteur(
                request.getNomDetenteur().trim()
        );

        // Gestion des champs secondaires optionnels
        detenteur.setPrenomDetenteur(
                request.getPrenomDetenteur() != null ? request.getPrenomDetenteur().trim() : "Non spécifié"
        );

        detenteur.setImmatriculeDetenteur(immatricule);

        detenteur.setCinDetenteur(
                request.getCinDetenteur() != null ? request.getCinDetenteur().trim() : "000000000000"
        );

        detenteur.setDistrictDetenteur(
                request.getDistrictDetenteur() != null ? request.getDistrictDetenteur().trim() : "BOENY"
        );

        return detenteurRepository.save(detenteur);
    }
    
            private Chauffeur trouverOuCreerChauffeur(
            VehiculeCreateRequest request) {

        // Si aucun nom de chauffeur n'est fourni, on assigne un profil générique par défaut
        String nomChauffeur = request.getNomChauffeur();
        if (nomChauffeur == null || nomChauffeur.trim().isEmpty()) {
            nomChauffeur = "Non spécifié";
        }

        String rawImmatricule = request.getImmatriculeChauffeur();
        if (rawImmatricule == null || rawImmatricule.trim().isEmpty()) {
            rawImmatricule = "CHF-" + java.util.UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        }

        String immatricule = rawImmatricule
                .replaceAll("\\s+", "")
                .trim()
                .toUpperCase();

        Chauffeur chauffeur = chauffeurRepository
                .findByImmatriculeChauffeur(immatricule)
                .orElseGet(Chauffeur::new);

        chauffeur.setNomChauffeur(nomChauffeur.trim());
        chauffeur.setImmatriculeChauffeur(immatricule);

        chauffeur.setCinChauffeur(
                request.getCinChauffeur() != null ? request.getCinChauffeur().trim() : "000000000000"
        );

        return chauffeurRepository.save(chauffeur);
    }
}