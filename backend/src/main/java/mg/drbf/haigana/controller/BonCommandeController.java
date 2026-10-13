package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.BonCommande;
import mg.drbf.haigana.entity.Livret;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.entity.StatutPaiement;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.BonCommandeRepository;
import mg.drbf.haigana.repository.LivretRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import mg.drbf.haigana.entity.ArgentPublicVehicule;
import mg.drbf.haigana.repository.ArgentPublicVehiculeRepository;

import java.time.LocalDateTime;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bons-commande")
@RequiredArgsConstructor
public class BonCommandeController {

    private final BonCommandeRepository bonCommandeRepository;
    private final SoaCodeRepository soaCodeRepository;
    private final LivretRepository livretRepository;
    private final ArgentPublicVehiculeRepository argentPublicVehiculeRepository;

    @Value("${haigana.annee-en-cours}")
    private Integer anneeEnCours;

    // LISTE DES BONS NON PAYES D'UN CODE SOA
    // Les bons non payés restent disponibles même lorsqu'ils
    // appartiennent à une année précédente.


    @GetMapping
    public List<BonCommande> findNonPayesBySoa(
            @RequestParam Long soaId) {

        if (soaId == null || soaId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du Code SOA invalide."
            );
        }

        return bonCommandeRepository
                .findByCodeSoa_IdAndStatut(
                        soaId,
                        StatutPaiement.NON_PAYE
                );
    }

    // TOUS LES BONS D'UN CODE SOA

    //
    // Utilisé pour la gestion :
    // ajout / modification / suppression.
    //

    @GetMapping("/tous")
    public List<BonCommande> findAllBySoa(
            @RequestParam Long soaId) {

        if (soaId == null || soaId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du Code SOA invalide."
            );
        }

        return bonCommandeRepository
                .findByCodeSoa_Id(soaId);
    }

    // RECHERCHE D'UN BON PAR ID

    @GetMapping("/{id}")
    public BonCommande findById(
            @PathVariable Long id) {

        return bonCommandeRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bon de commande introuvable : " + id
                        )
                );
    }


    // AJOUT D'UN BON DE COMMANDE
    //
    // L'année est libre.
    //
    // Si aucune année n'est envoyée :
    // -> année en cours.
    //
    @PostMapping
    public BonCommande create(
            @RequestBody BonCommande bon) {

        if (bon == null) {
            throw new IllegalArgumentException(
                    "Les données du bon de commande sont obligatoires."
            );
        }

        // -----------------------------------------------------
        // ANNÉE
        // -----------------------------------------------------

        if (bon.getAnnee() == null) {
            bon.setAnnee(anneeEnCours);
        }

        if (bon.getAnnee() <= 0) {
            throw new IllegalArgumentException(
                    "L'année du bon de commande est invalide."
            );
        }

        // -----------------------------------------------------
        // CODE SOA
        // -----------------------------------------------------

        if (bon.getCodeSoa() == null ||
                bon.getCodeSoa().getId() == null) {

            throw new IllegalArgumentException(
                    "Le Code SOA est obligatoire."
            );
        }

        SoaCode soa = soaCodeRepository
                .findById(bon.getCodeSoa().getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Code SOA introuvable : "
                                        + bon.getCodeSoa().getId()
                        )
                );

        bon.setCodeSoa(soa);

        // -----------------------------------------------------
        // STATUT PAR DÉFAUT
        // -----------------------------------------------------

        if (bon.getStatut() == null) {
            bon.setStatut(
                    StatutPaiement.NON_PAYE
            );
        }

        // -----------------------------------------------------
        // UN BON NOUVEAU NE DOIT PAS ÊTRE ASSOCIÉ
        // À UN LIVRET AVANT SON PAIEMENT
        // -----------------------------------------------------

        bon.setLivret(null);

        return bonCommandeRepository.save(bon);
    }


    // MODIFICATION D'UN BON
    //
    // Un bon déjà payé ne peut plus être modifié.
    //
    // L'année, le Code SOA, le statut et le livret ne sont
    // pas modifiés ici.
    //

    @PutMapping("/{id}")
    public BonCommande update(
            @PathVariable Long id,
            @RequestBody BonCommande donnees) {

        BonCommande bon =
                bonCommandeRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bon de commande introuvable : "
                                                + id
                                )
                        );

        // -----------------------------------------------------
        // BON DÉJÀ PAYÉ
        // -----------------------------------------------------

        if (bon.getStatut() == StatutPaiement.PAYE) {
            throw new IllegalStateException(
                    "Ce bon de commande est déjà payé : "
                            + "modification impossible."
            );
        }

        // -----------------------------------------------------
        // MODIFICATION
        // -----------------------------------------------------

        bon.setDescription(
                donnees.getDescription()
        );

        bon.setPrixTotal(
                donnees.getPrixTotal()
        );

        bon.setDateBon(
                donnees.getDateBon()
        );

        return bonCommandeRepository.save(bon);
    }
    // PAIEMENT D'UN BON DE COMMAND
    //
    // L'argent est toujours déduit du Code SOA.
    //

    @PutMapping("/{id}/payer")
    public BonCommande payer(
            @PathVariable Long id) {

        System.out.println(
                "========== PAIEMENT BON DE COMMANDE =========="
        );

        System.out.println("ID bon = " + id);

        // RECHERCHE DU BON

        BonCommande bon =
                bonCommandeRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bon de commande introuvable : "
                                                + id
                                )
                        );

        // -----------------------------------------------------
        // VÉRIFICATION DU STATUT
        // -----------------------------------------------------

        if (bon.getStatut() == StatutPaiement.PAYE) {
            throw new IllegalStateException(
                    "Ce bon de commande est déjà payé."
            );
        }

        // -----------------------------------------------------
        // ANNÉE
        // -----------------------------------------------------

        if (bon.getAnnee() == null) {
            throw new IllegalStateException(
                    "L'année du bon de commande est obligatoire."
            );
        }

        System.out.println(
                "Année du bon = " + bon.getAnnee()
        );

        // -----------------------------------------------------
        // CODE SOA
        // -----------------------------------------------------
        //
        // Le Code SOA est obligatoire.
        //
        // IMPORTANT :
        // Le Code SOA sert uniquement au rattachement
        // administratif.
        //
        // Il ne contient PAS d'argent public.
        //

        SoaCode soa = bon.getCodeSoa();

        if (soa == null) {
            throw new IllegalStateException(
                    "Le Code SOA du bon de commande est obligatoire."
            );
        }

        System.out.println(
                "Code SOA = " + soa.getCodeSoa()
        );

        // -----------------------------------------------------
        // MONTANT DU BON
        // -----------------------------------------------------

        if (bon.getPrixTotal() == null) {
            throw new IllegalStateException(
                    "Le montant du bon de commande est obligatoire."
            );
        }

        if (bon.getPrixTotal() <= 0) {
            throw new IllegalStateException(
                    "Le montant du bon de commande doit être supérieur à zéro."
            );
        }

        double montantBon = bon.getPrixTotal();

        System.out.println(
                "Montant du bon = " + montantBon
        );

        // ARGENT PUBLIC VÉHICULE
        //
        // IMPORTANT :
        //
        // Le paiement est effectué exclusivement avec
        // l'argent public destiné aux véhicules.
        //
        // Le Code SOA n'est PAS utilisé comme source financière.
        //

        ArgentPublicVehicule argentPublic =
                argentPublicVehiculeRepository
                        .findFirstByOrderByIdAsc()
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Aucun argent public destiné "
                                                + "aux véhicules n'est disponible."
                                )
                        );


        // -----------------------------------------------------
        // DÉDUCTION
        // -----------------------------------------------------

        double montantUtiliseActuel =
                argentPublic.getMontantUtilise() == null
                        ? 0.0
                        : argentPublic.getMontantUtilise();

        double nouveauMontantUtilise =
                montantUtiliseActuel + montantBon;

        double montantTotal =
                argentPublic.getMontantTotal() == null
                        ? 0.0
                        : argentPublic.getMontantTotal();

        if (nouveauMontantUtilise > montantTotal) {
            throw new IllegalStateException(
                    "Argent public véhicule insuffisant "
                            + "pour payer ce bon de commande."
            );
        }

        double nouveauDisponible =
                montantTotal - nouveauMontantUtilise;

        argentPublic.setMontantUtilise(
                nouveauMontantUtilise
        );

        argentPublic.setMontantDisponible(
                nouveauDisponible
        );

        argentPublic.setDateModification(
                LocalDateTime.now()
        );

        argentPublicVehiculeRepository.save(
                argentPublic
        );

        System.out.println(
                "Argent public véhicule après paiement = "
                        + nouveauDisponible
        );

        // -----------------------------------------------------
        // LIVRET
        // -----------------------------------------------------

        Livret livret =
                livretRepository
                        .findByAnnee(bon.getAnnee())
                        .orElseGet(() -> {

                            System.out.println(
                                    "Livret "
                                            + bon.getAnnee()
                                            + " inexistant. "
                                            + "Création automatique."
                            );

                            Livret nouveauLivret =
                                    Livret.builder()
                                            .annee(bon.getAnnee())
                                            .dateEcriture(
                                                    LocalDate.now()
                                            )
                                            .build();

                            return livretRepository.save(
                                    nouveauLivret
                            );
                        });

        // -----------------------------------------------------
        // VALIDATION DU PAIEMENT
        // -----------------------------------------------------

        bon.setStatut(
                StatutPaiement.PAYE
        );

        bon.setLivret(
                livret
        );

        BonCommande bonPaye =
                bonCommandeRepository.save(bon);

        System.out.println(
                "Bon "
                        + bon.getId()
                        + " payé avec succès."
        );

        System.out.println(
                "Montant payé = " + montantBon
        );

        System.out.println(
                "Nouveau solde argent public véhicule = "
                        + nouveauDisponible
        );

        System.out.println(
                "Livret associé = "
                        + livret.getAnnee()
        );

        System.out.println(
                "=============================================="
        );

        return bonPaye;
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {

        BonCommande bon =
                bonCommandeRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bon de commande introuvable : "
                                                + id
                                )
                        );

        // PROTECTION :
        // UN BON PAYÉ NE DOIT PAS ÊTRE SUPPRIMÉ

        if (bon.getStatut() == StatutPaiement.PAYE) {

            throw new IllegalStateException(
                    "Un bon de commande payé ne peut pas "
                            + "être supprimé."
            );
        }

        bonCommandeRepository.delete(bon);
    }
}