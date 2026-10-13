package mg.drbf.haigana.controller;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.BonCommandeRepository;
import mg.drbf.haigana.repository.ConstatationRepository;
import mg.drbf.haigana.repository.ControleDeplacementRepository;
import mg.drbf.haigana.repository.ControleRepository;
import mg.drbf.haigana.repository.DeplacementRepository;
import mg.drbf.haigana.repository.ProcesVerbalRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/controles")
@RequiredArgsConstructor
public class ControleController {

    private final ControleRepository controleRepository;
    private final VehiculeRepository vehiculeRepository;
    private final DeplacementRepository deplacementRepository;

    private final ConstatationRepository constatationRepository;
    private final ProcesVerbalRepository procesVerbalRepository;
    private final BonCommandeRepository bonCommandeRepository;

    private final ControleDeplacementRepository controleDeplacementRepository;

    private final EntityManager entityManager;


    
    // LISTE DES CONTROLES D'UN VEHICULE
    

    @GetMapping
    public List<Controle> findByVehicule(
            @RequestParam Long vehiculeId) {

        if (vehiculeId == null || vehiculeId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du véhicule invalide."
            );
        }

        return controleRepository
                .findByVehicule_IdOrderByDateControleDesc(
                        vehiculeId
                );
    }


    
    // RECHERCHE D'UN CONTROLE
    

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public Controle findById(
            @PathVariable Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        return controleRepository
                .findWithDeplacementsById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contrôle introuvable : " + id
                        )
                );
    }


    
    // STATUT GLOBAL D'UN DEPLACEMENT
    

    @GetMapping("/deplacement/{deplacementId}/statut")
    public StatutControle getStatutDeplacement(
            @PathVariable Long deplacementId) {

        if (deplacementId == null || deplacementId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du déplacement invalide."
            );
        }

        List<ControleDeplacement> relations =
                controleDeplacementRepository
                        .findByDeplacement_Id(
                                deplacementId
                        );

        boolean controle =
                relations.stream()
                        .anyMatch(relation ->
                                relation.getStatut()
                                        == StatutControle.CONTROLE
                        );

        return controle
                ? StatutControle.CONTROLE
                : StatutControle.NON_CONTROLE;
    }


    
    // CREATION D'UN CONTROLE
    

    @PostMapping
    @Transactional
    public Controle create(
            @RequestBody ControleRequest request) {

        System.out.println(
                "========== AJOUT CONTROLE =========="
        );

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du contrôle sont obligatoires."
            );
        }

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (request.vehiculeId() == null) {
            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        if (request.dateControle() == null) {
            throw new IllegalArgumentException(
                    "La date du contrôle est obligatoire."
            );
        }

        // -----------------------------------------------------
        // VEHICULE
        // -----------------------------------------------------

        Vehicule vehicule =
                vehiculeRepository
                        .findById(request.vehiculeId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule introuvable : "
                                                + request.vehiculeId()
                                )
                        );

        // -----------------------------------------------------
        // CREATION CONTROLE
        // -----------------------------------------------------

        Controle controle =
                Controle.builder()
                        .vehicule(vehicule)
                        .description(
                                request.description()
                        )
                        .dateControle(
                                request.dateControle()
                        )
                        .pieceJustificativeUrl(
                                request.pieceJustificativeUrl()
                        )
                        .build();

        Controle saved =
                controleRepository.save(controle);

        controleRepository.flush();

        System.out.println(
                "Contrôle créé avec ID = "
                        + saved.getId()
        );

        // -----------------------------------------------------
        // DEPLACEMENTS
        // -----------------------------------------------------

        if (request.deplacements() != null
                && !request.deplacements().isEmpty()) {

            for (
                    DeplacementControleRequest
                            deplacementRequest
                    : request.deplacements()
            ) {

                if (deplacementRequest == null) {
                    continue;
                }

                ajouterDeplacementAuControle(
                        saved,
                        deplacementRequest
                );
            }
        }

        controleDeplacementRepository.flush();

        return saved;
    }


    
    // MODIFICATION D'UN CONTROLE
    

    @PutMapping("/{id}")
    @Transactional
    public Controle update(
            @PathVariable Long id,
            @RequestBody ControleRequest request) {

        System.out.println(
                "========== MODIFICATION CONTROLE =========="
        );

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du contrôle sont obligatoires."
            );
        }

        if (request.vehiculeId() == null) {
            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        if (request.dateControle() == null) {
            throw new IllegalArgumentException(
                    "La date du contrôle est obligatoire."
            );
        }

        // -----------------------------------------------------
        // CONTROLE EXISTANT
        // -----------------------------------------------------

        Controle existing =
                controleRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contrôle introuvable : "
                                                + id
                                )
                        );

        // -----------------------------------------------------
        // VEHICULE
        // -----------------------------------------------------

        Vehicule vehicule =
                vehiculeRepository
                        .findById(request.vehiculeId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule introuvable : "
                                                + request.vehiculeId()
                                )
                        );

        // -----------------------------------------------------
        // MODIFICATION
        // -----------------------------------------------------

        existing.setVehicule(vehicule);

        existing.setDescription(
                request.description()
        );

        existing.setDateControle(
                request.dateControle()
        );

        existing.setPieceJustificativeUrl(
                request.pieceJustificativeUrl()
        );

        Controle saved =
                controleRepository.save(existing);

        // -----------------------------------------------------
        // DEPLACEMENTS
        // -----------------------------------------------------

        if (request.deplacements() != null) {

            for (
                    DeplacementControleRequest
                            deplacementRequest
                    : request.deplacements()
            ) {

                if (deplacementRequest == null) {
                    continue;
                }

                ajouterOuModifierDeplacement(
                        saved,
                        deplacementRequest
                );
            }
        }

        controleDeplacementRepository.flush();

        return saved;
    }


    
    // AJOUTER UN DEPLACEMENT AU CONTROLE
    

    @PostMapping("/{controleId}/deplacements")
    @Transactional
    public ControleDeplacement ajouterDeplacement(
            @PathVariable Long controleId,
            @RequestBody DeplacementControleRequest request) {

        if (controleId == null || controleId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du déplacement sont obligatoires."
            );
        }

        Controle controle =
                controleRepository
                        .findById(controleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contrôle introuvable : "
                                                + controleId
                                )
                        );

        return ajouterDeplacementAuControle(
                controle,
                request
        );
    }


    
    // MODIFIER LE STATUT D'UN DEPLACEMENT
    

    @PutMapping("/{controleId}/deplacements/{deplacementId}")
    @Transactional
    public ControleDeplacement modifierStatut(
            @PathVariable Long controleId,
            @PathVariable Long deplacementId,
            @RequestBody StatutRequest request) {

        if (controleId == null || controleId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        if (deplacementId == null || deplacementId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du déplacement invalide."
            );
        }

        if (request == null || request.statut() == null) {
            throw new IllegalArgumentException(
                    "Le statut est obligatoire."
            );
        }

        ControleDeplacement relation =
                controleDeplacementRepository
                        .findByControle_IdAndDeplacement_Id(
                                controleId,
                                deplacementId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Ce déplacement n'est pas "
                                                + "associé à ce contrôle."
                                )
                        );

        relation.setStatut(
                request.statut()
        );

        return controleDeplacementRepository
                .save(relation);
    }


    
    // LISTE DES DEPLACEMENTS D'UN CONTROLE
    

    @GetMapping("/{controleId}/deplacements")
    public List<ControleDeplacement>
    getDeplacements(
            @PathVariable Long controleId) {

        verifierControle(controleId);

        return controleDeplacementRepository
                .findByControle_Id(controleId);
    }


    
    // DEPLACEMENTS NON CONTROLES
    

    @GetMapping(
            "/{controleId}/deplacements/non-controles"
    )
    public List<ControleDeplacement>
    getDeplacementsNonControles(
            @PathVariable Long controleId) {

        verifierControle(controleId);

        return controleDeplacementRepository
                .findByControle_IdAndStatut(
                        controleId,
                        StatutControle.NON_CONTROLE
                );
    }


    
    // DEPLACEMENTS CONTROLES
    

    @GetMapping("/{controleId}/deplacements/controles")
    public List<ControleDeplacement>
    getDeplacementsControles(
            @PathVariable Long controleId) {

        verifierControle(controleId);

        return controleDeplacementRepository
                .findByControle_IdAndStatut(
                        controleId,
                        StatutControle.CONTROLE
                );
    }


    
    // SUPPRIMER UN DEPLACEMENT DU CONTROLE
    

    @DeleteMapping("/{controleId}/deplacements/{deplacementId}")
    @Transactional
    public void supprimerDeplacement(
            @PathVariable Long controleId,
            @PathVariable Long deplacementId) {

        if (controleId == null || controleId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        if (deplacementId == null || deplacementId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du déplacement invalide."
            );
        }

        ControleDeplacement relation =
                controleDeplacementRepository
                        .findByControle_IdAndDeplacement_Id(
                                controleId,
                                deplacementId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Association contrôle/"
                                                + "déplacement "
                                                + "introuvable."
                                )
                        );

        controleDeplacementRepository.delete(
                relation
        );

        controleDeplacementRepository.flush();
    }


    
    // SUPPRESSION D'UN CONTROLE
    

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable Long id) {

        System.out.println(
                "========== SUPPRESSION CONTROLE =========="
        );

        // =====================================================
        // 1. Vérifier que le contrôle existe
        // =====================================================

        controleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contrôle introuvable : " + id
                        )
                );

        // =====================================================
        // 2. Récupérer les constatations du contrôle
        // =====================================================

        List<Constatation> constatations =
                constatationRepository.findByControle_Id(id);

        System.out.println(
                "Constatations trouvées : "
                        + constatations.size()
        );

        // =====================================================
        // 3. Parcourir les constatations
        // =====================================================

        for (Constatation constatation : constatations) {

            System.out.println(
                    "Constatation ID = "
                            + constatation.getId()
            );

            // -------------------------------------------------
            // 3.1 Récupérer les PV de la constatation
            // -------------------------------------------------

            List<ProcesVerbal> procesVerbaux =
                    procesVerbalRepository
                            .findByConstatation_Id(
                                    constatation.getId()
                            );

            System.out.println(
                    "PV trouvés : "
                            + procesVerbaux.size()
            );

            // -------------------------------------------------
            // 3.2 Traiter les PV
            // -------------------------------------------------

            for (ProcesVerbal pv : procesVerbaux) {

                System.out.println(
                        "PV ID = "
                                + pv.getId()
                );

                // ---------------------------------------------
                // Récupérer les bons de commande
                // ---------------------------------------------

                List<BonCommande> bons =
                        bonCommandeRepository
                                .findByProcesVerbal_Id(
                                        pv.getId()
                                );

                System.out.println(
                        "Bons de commande trouvés : "
                                + bons.size()
                );

                // ---------------------------------------------
                // Détacher les bons du PV
                // ---------------------------------------------

                for (BonCommande bon : bons) {

                    bon.setProcesVerbal(null);

                    bonCommandeRepository.save(bon);
                }

                // ---------------------------------------------
                // Supprimer le PV
                // ---------------------------------------------

                procesVerbalRepository.delete(pv);
            }
        }

        // =====================================================
        // 4. Exécuter les suppressions des PV
        // =====================================================

        entityManager.flush();

        System.out.println(
                "PV supprimés."
        );

        // =====================================================
        // 5. Vider le contexte Hibernate
        // =====================================================

        entityManager.clear();

        // =====================================================
        // 6. Supprimer les constatations
        // =====================================================

        int nombreConstatationsSupprimees =
                constatationRepository
                        .deleteAllByControleId(id);

        System.out.println(
                "Constatations supprimées : "
                        + nombreConstatationsSupprimees
        );

        // =====================================================
        // 7. Forcer le DELETE SQL des constatations
        // =====================================================

        entityManager.flush();

        entityManager.clear();

        // =====================================================
        // 8. Supprimer les associations
        //    Controle <-> Deplacement
        // =====================================================

        controleDeplacementRepository
                .deleteByControle_Id(id);

        entityManager.flush();

        entityManager.clear();

        System.out.println(
                "Associations contrôle/déplacement supprimées."
        );

        // =====================================================
        // 9. Vérification finale des constatations
        // =====================================================

        long restantes =
                constatationRepository
                        .countByControle_Id(id);

        System.out.println(
                "Constatations restantes pour le contrôle "
                        + id
                        + " : "
                        + restantes
        );

        if (restantes > 0) {

            throw new IllegalStateException(
                    "Impossible de supprimer le contrôle "
                            + id
                            + " : "
                            + restantes
                            + " constatation(s) existe(nt) encore."
            );
        }

        // =====================================================
        // 10. Recharger le contrôle
        // =====================================================

        Controle controle =
                controleRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contrôle introuvable après nettoyage : "
                                                + id
                                )
                        );

        // =====================================================
        // 11. Supprimer définitivement le contrôle
        // =====================================================

        controleRepository.delete(controle);

        entityManager.flush();

        System.out.println(
                "Contrôle supprimé avec succès : "
                        + id
        );

        System.out.println(
                "========== FIN SUPPRESSION CONTROLE =========="
        );
    }


    
    // METHODE INTERNE :
    // AJOUTER UN DEPLACEMENT
    

    private ControleDeplacement
    ajouterDeplacementAuControle(
            Controle controle,
            DeplacementControleRequest request) {

        if (controle == null
                || controle.getId() == null) {

            throw new IllegalArgumentException(
                    "Le contrôle est obligatoire."
            );
        }

        if (request == null
                || request.deplacementId() == null) {

            throw new IllegalArgumentException(
                    "Le déplacement est obligatoire."
            );
        }

        // -----------------------------------------------------
        // DEPLACEMENT
        // -----------------------------------------------------

        Deplacement deplacement =
                deplacementRepository
                        .findById(
                                request.deplacementId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Déplacement introuvable : "
                                                + request.deplacementId()
                                )
                        );

        // -----------------------------------------------------
        // VEHICULE
        // -----------------------------------------------------

        if (deplacement.getVehicule() == null
                || deplacement.getVehicule().getId() == null) {

            throw new IllegalArgumentException(
                    "Le déplacement n'est associé à aucun véhicule."
            );
        }

        if (controle.getVehicule() == null
                || controle.getVehicule().getId() == null) {

            throw new IllegalArgumentException(
                    "Le contrôle n'est associé à aucun véhicule."
            );
        }

        if (!deplacement.getVehicule()
                .getId()
                .equals(
                        controle.getVehicule().getId()
                )) {

            throw new IllegalArgumentException(
                    "Le déplacement n'appartient pas "
                            + "au véhicule contrôlé."
            );
        }

        // -----------------------------------------------------
        // VERIFIER ASSOCIATION AVEC CE CONTROLE
        // -----------------------------------------------------

        ControleDeplacement relationExistante =
                controleDeplacementRepository
                        .findByControle_IdAndDeplacement_Id(
                                controle.getId(),
                                deplacement.getId()
                        )
                        .orElse(null);

        if (relationExistante != null) {

            if (request.statut() != null) {

                relationExistante.setStatut(
                        request.statut()
                );

                return controleDeplacementRepository
                        .save(relationExistante);
            }

            return relationExistante;
        }

        // -----------------------------------------------------
        // VERIFIER SI LE DEPLACEMENT EST DEJA CONTROLE
        // PAR UN AUTRE CONTROLE
        // -----------------------------------------------------

        List<ControleDeplacement> relations =
                controleDeplacementRepository
                        .findByDeplacement_Id(
                                deplacement.getId()
                        );

        for (ControleDeplacement relation : relations) {

            if (relation.getStatut()
                    != StatutControle.CONTROLE) {

                continue;
            }

            Controle autreControle =
                    relation.getControle();

            if (autreControle == null
                    || autreControle.getId() == null) {

                continue;
            }

            // -------------------------------------------------
            // LE MEME CONTROLE EST AUTORISE
            // -------------------------------------------------

            if (autreControle.getId()
                    .equals(controle.getId())) {

                continue;
            }

            throw new IllegalArgumentException(
                    "Ce déplacement est déjà contrôlé "
                            + "par le contrôle "
                            + autreControle.getId()
                            + "."
            );
        }

        // -----------------------------------------------------
        // STATUT
        // -----------------------------------------------------

        StatutControle statut =
                request.statut() != null
                        ? request.statut()
                        : StatutControle.CONTROLE;

        // -----------------------------------------------------
        // CREATION
        // -----------------------------------------------------

        ControleDeplacement relation =
                ControleDeplacement.builder()
                        .controle(controle)
                        .deplacement(deplacement)
                        .statut(statut)
                        .build();

        ControleDeplacement saved =
                controleDeplacementRepository
                        .save(relation);

        // -----------------------------------------------------
        // SYNCHRONISER CONTROLE.DEPLACEMENTS
        // -----------------------------------------------------

        if (controle.getDeplacements() != null
                && !controle.getDeplacements()
                        .contains(saved)) {

            controle.getDeplacements().add(saved);
        }

        return saved;
    }


    
    // METHODE INTERNE :
    // AJOUTER OU MODIFIER
    

    private void ajouterOuModifierDeplacement(
            Controle controle,
            DeplacementControleRequest request) {

        if (controle == null
                || controle.getId() == null) {

            throw new IllegalArgumentException(
                    "Le contrôle est obligatoire."
            );
        }

        if (request == null
                || request.deplacementId() == null) {

            throw new IllegalArgumentException(
                    "Le déplacement est obligatoire."
            );
        }

        // -----------------------------------------------------
        // DEPLACEMENT
        // -----------------------------------------------------

        Deplacement deplacement =
                deplacementRepository
                        .findById(
                                request.deplacementId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Déplacement introuvable : "
                                                + request.deplacementId()
                                )
                        );

        // -----------------------------------------------------
        // VEHICULE
        // -----------------------------------------------------

        if (deplacement.getVehicule() == null
                || deplacement.getVehicule().getId() == null) {

            throw new IllegalArgumentException(
                    "Le déplacement n'est associé à aucun véhicule."
            );
        }

        if (controle.getVehicule() == null
                || controle.getVehicule().getId() == null) {

            throw new IllegalArgumentException(
                    "Le contrôle n'est associé à aucun véhicule."
            );
        }

        if (!deplacement.getVehicule()
                .getId()
                .equals(
                        controle.getVehicule().getId()
                )) {

            throw new IllegalArgumentException(
                    "Le déplacement n'appartient pas "
                            + "au véhicule contrôlé."
            );
        }

        // -----------------------------------------------------
        // ASSOCIATION EXISTANTE
        // -----------------------------------------------------

        ControleDeplacement relation =
                controleDeplacementRepository
                        .findByControle_IdAndDeplacement_Id(
                                controle.getId(),
                                deplacement.getId()
                        )
                        .orElse(null);

        if (relation != null) {

            if (request.statut() != null) {

                relation.setStatut(
                        request.statut()
                );

                controleDeplacementRepository
                        .save(relation);
            }

            return;
        }

        // -----------------------------------------------------
        // NOUVELLE ASSOCIATION
        // -----------------------------------------------------

        ajouterDeplacementAuControle(
                controle,
                request
        );
    }


    
    // VERIFIER CONTROLE
    

    private void verifierControle(Long controleId) {

        if (controleId == null || controleId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        if (!controleRepository.existsById(controleId)) {
            throw new ResourceNotFoundException(
                    "Contrôle introuvable : "
                            + controleId
            );
        }
    }


    
    // DTO CONTROLE
    

    public record ControleRequest(

            Long vehiculeId,

            String description,

            LocalDate dateControle,

            String pieceJustificativeUrl,

            List<DeplacementControleRequest>
                    deplacements

    ) {
    }

    // DTO DEPLACEMENT CONTROLE

    public record DeplacementControleRequest(

            Long deplacementId,

            StatutControle statut

    ) {
    }

    // DTO STATUT

    public record StatutRequest(

            StatutControle statut

    ) {
    }
}