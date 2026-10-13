package mg.drbf.haigana.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehiculeDeletionService {

    private final VehiculeRepository vehiculeRepository;

    // CONTROLES
    private final ControleRepository controleRepository;
    private final ConstatationRepository constatationRepository;
    private final ProcesVerbalRepository procesVerbalRepository;
    private final BonCommandeRepository bonCommandeRepository;
    private final ControleDeplacementRepository controleDeplacementRepository;

    // ENTREES
    private final EntreeRepository entreeRepository;
    private final AchatRepository achatRepository;
    private final AffectationEntreeRepository affectationEntreeRepository;
    private final DonRepository donRepository;

    // SORTIES
    private final SortieRepository sortieRepository;
    private final AffectationRepository affectationRepository;
    private final CondamnationRepository condamnationRepository;

    // AUTRES
    private final SuiviRepository suiviRepository;
    private final EntretienRepository entretienRepository;
    private final ReparationRepository reparationRepository;
    private final ConduiteChauffeurRepository conduiteChauffeurRepository;

    @PersistenceContext
    private EntityManager entityManager;


    // SUPPRESSION COMPLETE DU VEHICULE

    @Transactional
    public void supprimerVehiculeCompletement(
            Vehicule vehicule,
            String immatricule) {

        Long vehiculeId = vehicule.getId();

        System.out.println("========================================");
        System.out.println("SUPPRESSION VEHICULE ID = " + vehiculeId);
        System.out.println("========================================");

        // 1. CONTROLES

        supprimerControles(vehiculeId);

        /*
         * Très important :
         * on force Hibernate à envoyer les suppressions des
         * contrôles avant de continuer.
         */
        entityManager.flush();
        entityManager.clear();


        // 2. SUIVIS

        supprimerSuivis(vehiculeId);


        // 3. ENTRETIENS

        supprimerEntretiens(vehiculeId);


        // 4. REPARATIONS

        supprimerReparations(vehiculeId);


        // 5. CONDUITES CHAUFFEUR

        supprimerConduites(vehiculeId);


        // 6. SORTIES

        supprimerSorties(
                vehiculeId,
                immatricule
        );


        // 7. ENTREES

        supprimerEntrees(vehiculeId);


        // 8. DEPLACEMENTS

        supprimerDeplacements(vehiculeId);


        // VERIFICATION DEPLACEMENTS

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


        // 9. SUPPRESSION DU VEHICULE

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


        if (resultat == 0) {

            throw new IllegalStateException(
                    "Le véhicule "
                            + vehiculeId
                            + " n'a pas été supprimé."
            );
        }
    }


    // CONTROLES

    private void supprimerControles(Long vehiculeId) {

        List<Controle> controles =
                controleRepository
                        .findForDeletion(vehiculeId);

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

                    List<BonCommande> bons =
                            bonCommandeRepository
                                    .findByProcesVerbal_Id(
                                            pv.getId()
                                    );

                    for (BonCommande bon :
                            bons) {

                        /*
                         * Les bons de commande sont conservés.
                         */
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


            /*
             * IMPORTANT :
             * supprimer les liens controle_deplacement
             * avant le contrôle.
             */
            controleDeplacementRepository
                    .deleteByControle_Id(
                            controleId
                    );

            controleDeplacementRepository.flush();

            controleRepository.delete(controle);
        }

        controleRepository.flush();
    }

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


    // DEPLACEMENTS

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


        // --------------------------------------------------------
        // 2. DEPLACEMENTS
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // 3. VERIFICATION
        // --------------------------------------------------------

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

        System.out.println(
                "========== FIN SUPPRESSION DEPLACEMENTS =========="
        );
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
                 * Seul son lien vers Sortie est supprimé.
                 */
                condamnation.setSortie(null);

                condamnationRepository.save(
                        condamnation
                );
            }

            condamnationRepository.flush();

            sortieRepository.delete(sortie);

            sortieRepository.flush();
        }
    }


    private void supprimerEntrees(Long vehiculeId) {

        List<Entree> entrees =
                entreeRepository
                        .findByVehicule_Id(
                                vehiculeId
                        );

        for (Entree entree : entrees) {

            Long entreeId =
                    entree.getId();

            List<Achat> achats =
                    achatRepository
                            .findByEntree_Id(
                                    entreeId
                            );

            if (!achats.isEmpty()) {

                achatRepository.deleteAll(
                        achats
                );

                achatRepository.flush();
            }


            List<AffectationEntree> affectationsEntree =
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
}

