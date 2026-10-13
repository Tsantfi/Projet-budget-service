package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SortieService {

    private final SortieRepository sortieRepository;
    private final VehiculeRepository vehiculeRepository;

    private final AffectationRepository affectationRepository;
    private final CondamnationRepository condamnationRepository;


    // LISTE

    @Transactional(readOnly = true)
    public List<Sortie> findAll(Long vehiculeId) {

        if (vehiculeId != null) {
            return sortieRepository.findByVehicule_Id(vehiculeId);
        }

        return sortieRepository.findAll();
    }


    // DETAIL

    @Transactional(readOnly = true)
    public Sortie findById(Long id) {

        return sortieRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sortie introuvable : " + id
                        )
                );
    }


    // // CREATION
    

    @Transactional
    public Sortie create(Sortie sortie) {

        // // VERIFICATION SORTIE
        // =====================================================

        if (sortie == null) {

            throw new IllegalArgumentException(
                    "Les données de la sortie sont obligatoires."
            );
        }


        // // VERIFICATION VEHICULE
        // =====================================================

        if (sortie.getVehicule() == null ||
                sortie.getVehicule().getId() == null) {

            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        Long vehiculeId =
                sortie.getVehicule().getId();


        Vehicule vehicule =
                vehiculeRepository.findById(vehiculeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule introuvable : "
                                                + vehiculeId
                                )
                        );


        // // DATE
        // =====================================================

        if (sortie.getDateSortie() == null) {

            sortie.setDateSortie(
                    LocalDate.now()
            );
        }


        // // TYPE
        // =====================================================

        if (sortie.getType() == null) {

            throw new IllegalArgumentException(
                    "Le type de sortie est obligatoire."
            );
        }


        // // PERSONNE ORDRE DE SORTIE
        // =====================================================

        verifierOrdreSortie(sortie);


        // // PERSONNE ORDRE D'ENTREE
        // =====================================================

        verifierOrdreEntree(sortie);


        // // NETTOYAGE
        // =====================================================

        nettoyerSortie(sortie);


        // // AFFECTATION
        // =====================================================

        if (sortie.getType() ==
                TypeSortie.AFFECTATION) {

            if (sortie.getLieu() == null ||
                    sortie.getLieu().trim().isEmpty()) {

                throw new IllegalArgumentException(
                        "Le lieu d'affectation est obligatoire."
                );
            }

            vehicule.setLieuAffectationActuel(
                    sortie.getLieu().trim()
            );

            vehiculeRepository.save(vehicule);
        }


        // CONDAMNATION

        if (sortie.getType() ==
                TypeSortie.CONDAMNATION) {

            vehicule.setLieuAffectationActuel(null);

            vehiculeRepository.save(vehicule);
        }


        // // VEHICULE
        // =====================================================

        sortie.setVehicule(vehicule);


        // // ENREGISTREMENT
        // =====================================================

        return sortieRepository.save(sortie);
    }


    // // MODIFICATION
    

    @Transactional
    public Sortie update(
            Long id,
            Sortie donnees
    ) {

        // // VERIFICATION DONNEES
        // =====================================================

        if (donnees == null) {

            throw new IllegalArgumentException(
                    "Les données de modification sont obligatoires."
            );
        }


        // // SORTIE EXISTANTE
        // =====================================================

        Sortie existing =
                sortieRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sortie introuvable : "
                                                + id
                                )
                        );


        //TYPE EXISTANT

        TypeSortie typeExistant =
                existing.getType();


        if (donnees.getType() != null &&
                donnees.getType() != typeExistant) {

            throw new IllegalStateException(
                    "Le type de sortie ne peut pas être modifié."
            );
        }


        // REFERENCE

        existing.setReference(
                nettoyer(donnees.getReference())
        );


        // DATE

        if (donnees.getDateSortie() != null) {

            existing.setDateSortie(
                    donnees.getDateSortie()
            );

        } else if (existing.getDateSortie() == null) {

            existing.setDateSortie(
                    LocalDate.now()
            );
        }


        // // TYPE
        // =====================================================

        /*
         * Toujours conserver le type original.
         */

        existing.setType(typeExistant);


        // // // PERSONNE ORDRE DE SORTIE
        // // =====================================================

        verifierOrdreSortie(donnees);


        existing.setNomPersonneSortie(
                nettoyer(
                        donnees.getNomPersonneSortie()
                )
        );

        existing.setCinPersonneSortie(
                nettoyer(
                        donnees.getCinPersonneSortie()
                )
        );

        existing.setServiceSortie(
                nettoyer(
                        donnees.getServiceSortie()
                )
        );


        // // // PERSONNE ORDRE D'ENTREE
        // // =====================================================

        verifierOrdreEntree(donnees);


        existing.setNomPersonneEntree(
                nettoyer(
                        donnees.getNomPersonneEntree()
                )
        );

        existing.setCinPersonneEntree(
                nettoyer(
                        donnees.getCinPersonneEntree()
                )
        );

        existing.setServiceEntree(
                nettoyer(
                        donnees.getServiceEntree()
                )
        );


        // // DESCRIPTION
        // =====================================================

        existing.setDescription(
                nettoyer(
                        donnees.getDescription()
                )
        );


        // // LIEU
        // =====================================================

        String nouveauLieu =
                nettoyer(
                        donnees.getLieu()
                );

        existing.setLieu(nouveauLieu);


        // // PIECE JUSTIFICATIVE
        // =====================================================

        existing.setPieceJustificativeUrl(
                nettoyer(
                        donnees.getPieceJustificativeUrl()
                )
        );


        // // AFFECTATION
        // =====================================================

        if (typeExistant ==
                TypeSortie.AFFECTATION) {

            // -------------------------------------------------
            // VEHICULE OBLIGATOIRE POUR UNE AFFECTATION
            // -------------------------------------------------

            if (existing.getVehicule() == null) {

                throw new IllegalStateException(
                        "Le véhicule associé à cette affectation est introuvable."
                );
            }


            Vehicule vehicule =
                    existing.getVehicule();


            // -------------------------------------------------
            // LIEU OBLIGATOIRE
            // -------------------------------------------------

            if (nouveauLieu == null ||
                    nouveauLieu.isEmpty()) {

                throw new IllegalArgumentException(
                        "Le lieu d'affectation est obligatoire."
                );
            }


            // -------------------------------------------------
            // MISE A JOUR DU VEHICULE
            // -------------------------------------------------

            vehicule.setLieuAffectationActuel(
                    nouveauLieu
            );

            vehiculeRepository.save(vehicule);
        }


        // // CONDAMNATION
        // =====================================================

        if (typeExistant ==
                TypeSortie.CONDAMNATION) {

            // -------------------------------------------------
            // RECUPERATION DE L'HISTORIQUE
            // -------------------------------------------------

            List<Condamnation> condamnations =
                    condamnationRepository
                            .findBySortie_Id(id);


            // -------------------------------------------------
            // MISE A JOUR DE L'HISTORIQUE
            // -------------------------------------------------

            for (Condamnation condamnation :
                    condamnations) {

                /*
                 * NE JAMAIS MODIFIER :
                 *
                 * condamnation.getImmatriculeVehicule()
                 *
                 * Cette valeur correspond à l'immatriculation
                 * historique du véhicule condamné.
                 */

                // -------------------------------------------------
                // DATE
                // -------------------------------------------------

                if (donnees.getDateSortie() != null) {

                    condamnation.setDateCondamnation(
                            donnees.getDateSortie()
                    );
                }


                // -------------------------------------------------
                // LIEU
                // -------------------------------------------------

                if (nouveauLieu != null) {

                    condamnation.setLieuCondamnation(
                            nouveauLieu
                    );
                }


                // -------------------------------------------------
                // DESCRIPTION
                // -------------------------------------------------

                if (donnees.getDescription() != null) {

                    condamnation.setDescription(
                            nettoyer(
                                    donnees.getDescription()
                            )
                    );
                }


                // -------------------------------------------------
                // SAUVEGARDE
                // -------------------------------------------------

                condamnationRepository.save(
                        condamnation
                );
            }


            /*
             * IMPORTANT :
             *
             * On ne cherche pas le véhicule pour afficher
             * l'immatriculation de la condamnation.
             *
             * Elle provient de :
             *
             * Condamnation.immatriculeVehicule
             */
        }


        // // SAUVEGARDE SORTIE
        // =====================================================

        return sortieRepository.save(existing);
    }


    // // SUPPRESSION
    

    @Transactional
    public void delete(Long id) {

        // // VERIFICATION SORTIE
        // =====================================================

        Sortie sortie =
                sortieRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Sortie introuvable : " + id
                                )
                        );


        // // SUPPRESSION AFFECTATIONS
        // =====================================================

        affectationRepository.deleteBySortie_Id(id);


        // // SUPPRESSION CONDAMNATIONS
        // =====================================================

        List<Condamnation> condamnations =
                condamnationRepository
                        .findBySortie_Id(id);


        if (!condamnations.isEmpty()) {

            condamnationRepository.deleteAll(
                    condamnations
            );
        }


        // // SUPPRESSION SORTIE
        // =====================================================

        sortieRepository.delete(sortie);
    }


    // // VERIFICATION ORDRE SORTIE
    

    private void verifierOrdreSortie(
            Sortie sortie
    ) {

        if (sortie.getNomPersonneSortie() == null ||
                sortie.getNomPersonneSortie()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Le nom de la personne de l'ordre de sortie est obligatoire."
            );
        }


        if (sortie.getCinPersonneSortie() == null ||
                sortie.getCinPersonneSortie()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "La CIN de la personne de l'ordre de sortie est obligatoire."
            );
        }


        if (sortie.getServiceSortie() == null ||
                sortie.getServiceSortie()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Le service de l'ordre de sortie est obligatoire."
            );
        }
    }


    // // VERIFICATION ORDRE ENTREE
    

    private void verifierOrdreEntree(
            Sortie sortie
    ) {

        if (sortie.getNomPersonneEntree() == null ||
                sortie.getNomPersonneEntree()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Le nom de la personne de l'ordre d'entrée est obligatoire."
            );
        }


        if (sortie.getCinPersonneEntree() == null ||
                sortie.getCinPersonneEntree()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "La CIN de la personne de l'ordre d'entrée est obligatoire."
            );
        }


        if (sortie.getServiceEntree() == null ||
                sortie.getServiceEntree()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Le service de l'ordre d'entrée est obligatoire."
            );
        }
    }


    // // NETTOYAGE

    private void nettoyerSortie(
            Sortie sortie
    ) {

        sortie.setReference(
                nettoyer(
                        sortie.getReference()
                )
        );


        sortie.setNomPersonneSortie(
                nettoyer(
                        sortie.getNomPersonneSortie()
                )
        );


        sortie.setCinPersonneSortie(
                nettoyer(
                        sortie.getCinPersonneSortie()
                )
        );


        sortie.setServiceSortie(
                nettoyer(
                        sortie.getServiceSortie()
                )
        );


        sortie.setNomPersonneEntree(
                nettoyer(
                        sortie.getNomPersonneEntree()
                )
        );


        sortie.setCinPersonneEntree(
                nettoyer(
                        sortie.getCinPersonneEntree()
                )
        );


        sortie.setServiceEntree(
                nettoyer(
                        sortie.getServiceEntree()
                )
        );


        sortie.setDescription(
                nettoyer(
                        sortie.getDescription()
                )
        );


        sortie.setLieu(
                nettoyer(
                        sortie.getLieu()
                )
        );


        sortie.setPieceJustificativeUrl(
                nettoyer(
                        sortie.getPieceJustificativeUrl()
                )
        );
    }


    // NETTOYER UNE CHAINE

    private String nettoyer(
            String valeur
    ) {

        if (valeur == null) {
            return null;
        }


        String resultat =
                valeur.trim();


        return resultat.isEmpty()
                ? null
                : resultat;
    }
}