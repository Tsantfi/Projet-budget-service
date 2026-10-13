package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.RecensementMaterielCreateRequest;
import mg.drbf.haigana.dto.RecensementMaterielLigneUpdateRequest;
import mg.drbf.haigana.dto.RecensementMaterielResponse;
import mg.drbf.haigana.dto.RecensementMaterielComparaisonResponse;
import mg.drbf.haigana.entity.Materiel;
import mg.drbf.haigana.entity.MaterielEntree;
import mg.drbf.haigana.entity.MaterielInventaireAnnuel;
import mg.drbf.haigana.entity.MaterielSortie;
import mg.drbf.haigana.entity.RecensementMateriel;
import mg.drbf.haigana.entity.RecensementMaterielLigne;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.repository.MaterielEntreeRepository;
import mg.drbf.haigana.repository.MaterielInventaireAnnuelRepository;
import mg.drbf.haigana.repository.MaterielSortieRepository;
import mg.drbf.haigana.repository.MaterielRepository;
import mg.drbf.haigana.repository.RecensementMaterielLigneRepository;
import mg.drbf.haigana.repository.RecensementMaterielRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class RecensementMaterielService {

    private final RecensementMaterielRepository recensementRepository;
    private final RecensementMaterielLigneRepository ligneRepository;

    private final MaterielEntreeRepository materielEntreeRepository;
    private final MaterielSortieRepository materielSortieRepository;
    private final MaterielInventaireAnnuelRepository inventaireRepository;
    private final MaterielRepository materielRepository;

    private final SoaCodeRepository soaCodeRepository;

    @Transactional
    public RecensementMaterielResponse creerRecensement(
            RecensementMaterielCreateRequest request
    ) {

        validerCreation(request);

        int anneeCourante = LocalDate.now().getYear();

        /*
         * On conserve la règle :
         * le recensement doit concerner une année clôturée.
         */
        if (request.getAnnee() >= anneeCourante) {
            throw new IllegalArgumentException(
                    "Le recensement doit concerner une année clôturée."
            );
        }

        /*
         * Un seul recensement par SOA et par année.
         */
        if (recensementRepository.existsBySoa_IdAndAnnee(
                request.getSoaId(),
                request.getAnnee()
        )) {
            throw new IllegalArgumentException(
                    "Un recensement existe déjà pour ce SOA et cette année."
            );
        }

        /*
         * Vérification du SOA.
         */
        SoaCode soa =
                soaCodeRepository.findById(request.getSoaId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "SOA introuvable."
                                )
                        );

        /*
         * ============================================================
         * CRÉATION DE L'ENTÊTE DU RECENSEMENT
         * ============================================================
         */
        RecensementMateriel recensement =
                RecensementMateriel.builder()
                        .soa(soa)
                        .annee(request.getAnnee())
                        .fonctionnaireRecenseurNom(
                                request.getFonctionnaireRecenseurNom().trim()
                        )
                        .fonctionnaireRecenseurQualite(
                                request.getFonctionnaireRecenseurQualite().trim()
                        )
                        .comptableNom(
                                request.getComptableNom().trim()
                        )
                        .comptableQualite(
                                request.getComptableQualite().trim()
                        )
                        .dateRecensement(
                                LocalDate.of(
                                        request.getAnnee(),
                                        12,
                                        31
                                )
                        )
                        .valide(false)
                        .build();

        recensement =
                recensementRepository.save(recensement);

        /*
         * ============================================================
         * TOUS LES MATÉRIELS DU SOA
         * ============================================================
         *
         * IMPORTANT :
         * On ne dépend plus de l'existence de l'inventaire annuel.
         */
        List<Materiel> materiels =
                materielRepository
                        .findByCodeSoa_IdOrderByIdAsc(
                                request.getSoaId()
                        );

        for (Materiel materiel : materiels) {

            if (materiel == null) {
                continue;
            }

            /*
             * Un matériel inactif ne doit pas apparaître.
             */
            if (!Boolean.TRUE.equals(materiel.getActif())) {
                continue;
            }

            /*
             * Un matériel créé après l'année du recensement
             * ne doit pas apparaître.
             *
             * Exemple :
             * matériel créé en 2025
             * recensement 2024
             * => exclu
             */
            Integer anneeInitiale =
                    materiel.getAnneeInitiale();

            if (anneeInitiale != null
                    && anneeInitiale > request.getAnnee()) {
                continue;
            }

            /*
             *   * INVENTAIRE ANNUEL
             *   *
             * Il peut exister ou non.
             * Son absence n'empêche plus la création.
             */
            MaterielInventaireAnnuel inventaire =
                    inventaireRepository
                            .findByMateriel_IdAndAnnee(
                                    materiel.getId(),
                                    request.getAnnee()
                            )
                            .orElse(null);

            /*
             *   * EXISTANT D'ÉCRITURE
             *   *
             * Calcul indépendant de l'inventaire annuel.
             */
            int existantEcriture =
                calculerExistantEcriture(
                        materiel,
                        request.getAnnee()
                );

            /*
             *   * PRIX UNITAIRE
             *   *
             * Priorité :
             * 1. prix de l'inventaire annuel s'il existe
             * 2. prix actuel du matériel
             * 3. zéro
             */
            BigDecimal prixUnitaire = BigDecimal.ZERO;

            if (inventaire != null
                    && inventaire.getPrixUnitaire() != null
                    && inventaire.getPrixUnitaire()
                            .compareTo(BigDecimal.ZERO) > 0) {

                prixUnitaire =
                        inventaire.getPrixUnitaire();

            } else if (
                    materiel.getPrixUnitaire() != null
                            && materiel.getPrixUnitaire()
                            .compareTo(BigDecimal.ZERO) > 0
            ) {

                prixUnitaire =
                        materiel.getPrixUnitaire();
            }

            /*
             *   * CRÉATION DE LA LIGNE DE RECENSEMENT
             *   */
            RecensementMaterielLigne ligne =
                    RecensementMaterielLigne.builder()
                            .recensement(recensement)
                            .materiel(materiel)

                            /*
                             * SNAPSHOT NOMENCLATURE
                             */
                            .nomenclatureNumero(
                                    materiel.getNomenclature() != null
                                            ? materiel.getNomenclature()
                                                    .getNumero()
                                            : null
                            )
                            .nomenclatureDesignation(
                                    materiel.getNomenclature() != null
                                            ? materiel.getNomenclature()
                                                    .getDesignation()
                                            : null
                            )

                            /*
                             * UNITÉ
                             */
                            .especeUnite(
                                    materiel.getEspeceUnite()
                            )

                            /*
                             * PRIX
                             */
                            .prixUnitaire(
                                    prixUnitaire
                            )

                            /*
                             * EXISTANT COMPTABLE
                             */
                            .existantEcriture(
                                    existantEcriture
                            )

                            /*
                             * Au départ :
                             * constaté = existant
                             */
                            .constateRecensement(
                                    existantEcriture
                            )

                            /*
                             * Aucun écart au départ.
                             */
                            .excedent(0)
                            .deficit(0)

                            .valeurExcedentArticle(
                                    BigDecimal.ZERO
                            )

                            .valeurDeficitArticle(
                                    BigDecimal.ZERO
                            )

                            /*
                             * Valeur initiale
                             */
                            .valeurArticle(
                                    prixUnitaire.multiply(
                                            BigDecimal.valueOf(
                                                    existantEcriture
                                            )
                                    )
                            )

                            /*
                             * Observation de l'inventaire
                             * seulement s'il existe.
                             */
                            .observation(
                                    inventaire != null
                                            ? inventaire.getObservation()
                                            : null
                            )

                            .build();

            ligneRepository.save(ligne);
        }

        /*
         * Retour avec toutes les lignes créées.
         */
        return chargerRecensement(
                recensement.getId()
        );
    }

    // MODIFIER L'EN-TETE D'UN RECENSEMENT

    @Transactional
    public RecensementMaterielResponse modifierRecensement(
            Long id,
            RecensementMaterielCreateRequest request
    ) {

        validerCreation(request);

        int anneeCourante = LocalDate.now().getYear();

        if (request.getAnnee() >= anneeCourante) {
            throw new IllegalArgumentException(
                    "Le recensement doit concerner une année clôturée."
            );
        }

        RecensementMateriel recensement =
                recensementRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement matériel introuvable."
                                )
                        );


        if (!request.getSoaId().equals(
                recensement.getSoa().getId()
        )) {
            throw new IllegalArgumentException(
                    "Le SOA du recensement ne peut pas être modifié."
            );
        }

        if (!request.getAnnee().equals(
                recensement.getAnnee()
        )) {
            throw new IllegalArgumentException(
                    "L'année du recensement ne peut pas être modifiée."
            );
        }

        recensement.setFonctionnaireRecenseurNom(
                request.getFonctionnaireRecenseurNom().trim()
        );

        recensement.setFonctionnaireRecenseurQualite(
                request.getFonctionnaireRecenseurQualite().trim()
        );

        recensement.setComptableNom(
                request.getComptableNom().trim()
        );

        recensement.setComptableQualite(
                request.getComptableQualite().trim()
        );

        recensementRepository.save(recensement);

        /*
         * Très important :
         * après modification de l'en-tête, on resynchronise aussi
         * les lignes si le recensement n'est pas encore validé.
         *
         * Cela reproduit le comportement du recensement véhicule.
         */
        synchroniserAvecInventaire(recensement);

        return chargerRecensement(id);
    }

    // CHARGER UN RECENSEMENT

    @Transactional
    public RecensementMaterielResponse chargerRecensement(
            Long id
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement matériel introuvable : "
                                                + id
                                )
                        );

        List<RecensementMaterielLigne> lignes =
                ligneRepository
                        .findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
                                id
                        );

        return construireResponse(
                recensement,
                lignes
        );
    }

    // RECHERCHER PAR SOA + ANNEE

    @Transactional
    public RecensementMaterielResponse rechercherParSoaEtAnnee(
            Long soaId,
            Integer annee
    ) {

        RecensementMateriel recensement =
                recensementRepository
                        .findBySoa_IdAndAnnee(
                                soaId,
                                annee
                        )
                        .orElse(null);

        if (recensement == null) {
            return null;
        }

        /*
         * Même logique que pour le véhicule :
         * tant que ce n'est pas validé, on compare avec
         * l'état actuel de l'inventaire N.
         */
         synchroniserAvecInventaire(recensement);

        List<RecensementMaterielLigne> lignes =
                ligneRepository
                        .findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
                                recensement.getId()
                        );

        return construireResponse(
                recensement,
                lignes
        );
    }

    // SYNCHRONISATION AVEC L'INVENTAIRE ANNUEL

    /**
     * Synchronise un recensement non validé avec l'inventaire
     * correspondant à son année.
     *
     * Logique :
     *
     * 1. Nouveau matériel dans l'inventaire :
     *    -> création d'une nouvelle ligne.
     *
     * 2. Matériel existant mais modifié :
     *    -> nomenclature, désignation, espèce, prix et
     *       existant sont actualisés.
     *
     * 3. Matériel désactivé/supprimé :
     *    -> la ligne historique reste présente et
     *       le constat passe à 0.
     *
     * 4. Constat déjà saisi :
     *    -> conservé pour les matériels toujours actifs.
     *
     * 5. Recensement validé :
     *    -> aucune synchronisation.
     */
    @Transactional
    private void synchroniserAvecInventaire(
            RecensementMateriel recensement
    ) {

        Long soaId =
                recensement.getSoa() != null
                        ? recensement.getSoa().getId()
                        : null;

        Integer annee =
                recensement.getAnnee();

        if (soaId == null || annee == null) {
            throw new IllegalStateException(
                    "Le SOA et l'année du recensement sont obligatoires."
            );
        }

        /*
         * --------------------------------------------------------
         * INVENTAIRE ACTUEL DE L'ANNEE N
         * --------------------------------------------------------
         */
        List<MaterielInventaireAnnuel> inventaires =
                inventaireRepository
                        .findByMateriel_CodeSoa_IdAndAnnee(
                                soaId,
                                annee
                        );

        /*
         * --------------------------------------------------------
         * LIGNES ACTUELLES DU RECENSEMENT
         * --------------------------------------------------------
         */
        List<RecensementMaterielLigne> lignesExistantes =
                ligneRepository
                        .findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
                                recensement.getId()
                        );

        Map<Long, RecensementMaterielLigne> lignesParMateriel =
                new HashMap<>();

        for (RecensementMaterielLigne ligne : lignesExistantes) {

            if (ligne.getMateriel() != null
                    && ligne.getMateriel().getId() != null) {

                lignesParMateriel.put(
                        ligne.getMateriel().getId(),
                        ligne
                );
            }
        }

        /*
         * Ensemble des matériels actifs présents actuellement
         * dans l'inventaire N.
         */
        Set<Long> materielsActifs =
                new HashSet<>();

        /*
         * --------------------------------------------------------
         * 1. NOUVEAUX / MODIFIES
         * --------------------------------------------------------
         */
        for (MaterielInventaireAnnuel inventaire : inventaires) {

            Materiel materiel =
                    inventaire.getMateriel();

            if (materiel == null
                    || materiel.getId() == null) {
                continue;
            }

            Integer anneeInitiale =
                    materiel.getAnneeInitiale();

            if (anneeInitiale != null
                    && anneeInitiale > annee) {
                continue;
            }

            /*
             * Prix provenant de l'inventaire N.
             */
            BigDecimal prixUnitaire =
                    inventaire.getPrixUnitaire() != null
                            ? inventaire.getPrixUnitaire()
                            : materiel.getPrixUnitaire() != null
                                    ? materiel.getPrixUnitaire()
                                    : BigDecimal.ZERO;

            /*
             * Calcul de l'existant à partir des écritures
             * jusqu'à l'année N.
             */
            int existantEcriture =
                    calculerExistantEcriture(
                            materiel,
                            annee
                    );

            /*
             * ----------------------------------------------------
             * MATÉRIEL ACTIF
             * ----------------------------------------------------
             */
            if (Boolean.TRUE.equals(materiel.getActif())) {

                materielsActifs.add(
                        materiel.getId()
                );

                RecensementMaterielLigne ligne =
                        lignesParMateriel.get(
                                materiel.getId()
                        );

                /*
                 * NOUVEAU matériel
                 */
                if (ligne == null) {

                    ligne =
                            RecensementMaterielLigne.builder()
                                    .recensement(recensement)
                                    .materiel(materiel)
                                    .nomenclatureNumero(
                                            materiel.getNomenclature()
                                                    .getNumero()
                                    )
                                    .nomenclatureDesignation(
                                            materiel.getNomenclature()
                                                    .getDesignation()
                                    )
                                    .especeUnite(
                                            materiel.getEspeceUnite()
                                    )
                                    .prixUnitaire(
                                            prixUnitaire
                                    )
                                    .existantEcriture(
                                            existantEcriture
                                    )

                                    /*
                                     * Nouveau :
                                     * existant = constaté
                                     */
                                    .constateRecensement(
                                            existantEcriture
                                    )

                                    .excedent(0)
                                    .deficit(0)
                                    .valeurExcedentArticle(
                                            BigDecimal.ZERO
                                    )
                                    .valeurDeficitArticle(
                                            BigDecimal.ZERO
                                    )
                                    .valeurArticle(
                                            prixUnitaire.multiply(
                                                    BigDecimal.valueOf(
                                                            existantEcriture
                                                    )
                                            )
                                    )
                                    .observation(
                                            inventaire.getObservation()
                                    )
                                    .build();

                    ligneRepository.save(ligne);

                } else {

                    /*
                     * ------------------------------------------------
                     * MATERIEL MODIFIE
                     * ------------------------------------------------
                     *
                     * On actualise toutes les données provenant
                     * de l'inventaire.
                     *
                     * On NE touche PAS au constat déjà saisi.
                     */
                    ligne.setMateriel(materiel);

                    ligne.setNomenclatureNumero(
                            materiel.getNomenclature()
                                    .getNumero()
                    );

                    ligne.setNomenclatureDesignation(
                            materiel.getNomenclature()
                                    .getDesignation()
                    );

                    ligne.setEspeceUnite(
                            materiel.getEspeceUnite()
                    );

                    ligne.setPrixUnitaire(
                            prixUnitaire
                    );

                    ligne.setExistantEcriture(
                            existantEcriture
                    );

                    /*
                     * On conserve :
                     * ligne.getConstateRecensement()
                     */

                    recalculerLigne(ligne);

                    ligneRepository.save(ligne);
                }

            }
        }

        /*
         * --------------------------------------------------------
         * 2. MATERIELS SUPPRIMES / DESACTIVES
         * --------------------------------------------------------
         *
         * Ils peuvent déjà avoir une ligne de recensement.
         *
         * Pour reproduire le comportement ABSENT des véhicules :
         * constat = 0.
         *
         * On conserve la ligne afin que la différence apparaisse
         * dans le déficit si l'existant écritures est > 0.
         */
        for (RecensementMaterielLigne ligne : lignesExistantes) {

            if (ligne.getMateriel() == null
                    || ligne.getMateriel().getId() == null) {
                continue;
            }

            Long materielId =
                    ligne.getMateriel().getId();

            if (materielsActifs.contains(materielId)) {
                continue;
            }

            Materiel materiel =
                    ligne.getMateriel();

            Integer anneeInitiale =
                    materiel.getAnneeInitiale();

            /*
             * Le matériel n'existait pas encore cette année.
             */
            if (anneeInitiale != null
                    && anneeInitiale > annee) {
                continue;
            }

            /*
             * Le matériel est supprimé/désactivé.
             */
            int existantEcriture =
                    calculerExistantEcriture(
                            materiel,
                            annee
                    );

            BigDecimal prixUnitaire =
                    trouverPrixPourAnnee(
                            materiel,
                            annee
                    );

            ligne.setExistantEcriture(
                    existantEcriture
            );

            ligne.setPrixUnitaire(
                    prixUnitaire
            );

            /*
             * Comme ABSENT pour les véhicules :
             * constat = 0.
             */
            ligne.setConstateRecensement(0);

            /*
             * On conserve la nomenclature historique
             * autant que possible, mais on actualise les
             * informations encore disponibles.
             */
            if (materiel.getNomenclature() != null) {

                ligne.setNomenclatureNumero(
                        materiel.getNomenclature()
                                .getNumero()
                );

                ligne.setNomenclatureDesignation(
                        materiel.getNomenclature()
                                .getDesignation()
                );
            }

            ligne.setEspeceUnite(
                    materiel.getEspeceUnite()
            );

            recalculerLigne(ligne);

            ligneRepository.save(ligne);
        }
    }
    
    //COMPARAISON DES ELEMENTS DANS L'INVENTAIRE
    
    @Transactional(readOnly = true)
    public RecensementMaterielComparaisonResponse comparerAvecInventaire(
            Long recensementId
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(recensementId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement matériel introuvable."
                                )
                        );

        Long soaId =
                recensement.getSoa().getId();

        Integer annee =
                recensement.getAnnee();

        List<MaterielInventaireAnnuel> inventaires =
                inventaireRepository
                        .findByMateriel_CodeSoa_IdAndAnnee(
                                soaId,
                                annee
                        );

        List<RecensementMaterielLigne> lignes =
                ligneRepository
                        .findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
                                recensementId
                        );

        Map<Long, RecensementMaterielLigne> lignesParMateriel =
                new HashMap<>();

        for (RecensementMaterielLigne ligne : lignes) {

            if (ligne.getMateriel() != null
                    && ligne.getMateriel().getId() != null) {

                lignesParMateriel.put(
                        ligne.getMateriel().getId(),
                        ligne
                );
            }
        }

        List<RecensementMaterielComparaisonResponse.NouveauMateriel>
                nouveaux = new ArrayList<>();

        List<RecensementMaterielComparaisonResponse.ModificationMateriel>
                modifies = new ArrayList<>();

        List<RecensementMaterielComparaisonResponse.AbsentMateriel>
                absents = new ArrayList<>();

        Set<Long> materielsActuels =
                new HashSet<>();

        // INVENTAIRE ACTUEL

        for (MaterielInventaireAnnuel inventaire : inventaires) {

            Materiel materiel =
                    inventaire.getMateriel();

            if (materiel == null
                    || materiel.getId() == null) {
                continue;
            }

            if (!Boolean.TRUE.equals(materiel.getActif())) {
                continue;
            }

            materielsActuels.add(
                    materiel.getId()
            );

            int existant =
                    calculerExistantEcriture(
                            materiel,
                            annee
                    );

            BigDecimal prix =
                    inventaire.getPrixUnitaire() != null
                            ? inventaire.getPrixUnitaire()
                            : materiel.getPrixUnitaire() != null
                                    ? materiel.getPrixUnitaire()
                                    : BigDecimal.ZERO;

            RecensementMaterielLigne ligne =
                    lignesParMateriel.get(
                            materiel.getId()
                    );

            // --------------------------------------------------------
            // NOUVEAU
            // --------------------------------------------------------

            if (ligne == null) {

                nouveaux.add(
                        RecensementMaterielComparaisonResponse
                                .NouveauMateriel
                                .builder()
                                .materielId(
                                        materiel.getId()
                                )
                                .nomenclatureNumero(
                                        materiel.getNomenclature()
                                                .getNumero()
                                )
                                .nomenclatureDesignation(
                                        materiel.getNomenclature()
                                                .getDesignation()
                                )
                                .designation(
                                        materiel.getDesignation()
                                )
                                .especeUnite(
                                        materiel.getEspeceUnite()
                                )
                                .prixUnitaire(
                                        prix
                                )
                                .existantEcriture(
                                        existant
                                )
                                .observation(
                                        inventaire.getObservation()
                                )
                                .build()
                );

                continue;
            }

            // --------------------------------------------------------
            // MODIFICATION
            // --------------------------------------------------------

            boolean modifie = false;

            if (!Objects.equals(
                    ligne.getNomenclatureNumero(),
                    materiel.getNomenclature().getNumero()
            )) {
                modifie = true;
            }

            if (!Objects.equals(
                    ligne.getNomenclatureDesignation(),
                    materiel.getNomenclature().getDesignation()
            )) {
                modifie = true;
            }

            if (!Objects.equals(
                    ligne.getEspeceUnite(),
                    materiel.getEspeceUnite()
            )) {
                modifie = true;
            }

            if (ligne.getPrixUnitaire() == null
                    || ligne.getPrixUnitaire().compareTo(prix) != 0) {

                modifie = true;
            }

            if (!Objects.equals(
                    ligne.getExistantEcriture(),
                    existant
            )) {
                modifie = true;
            }

            if (modifie) {

                modifies.add(
                        RecensementMaterielComparaisonResponse
                                .ModificationMateriel
                                .builder()
                                .ligneId(
                                        ligne.getId()
                                )
                                .materielId(
                                        materiel.getId()
                                )

                                .ancien(
                                        RecensementMaterielComparaisonResponse
                                                .AncienValeur
                                                .builder()
                                                .nomenclatureNumero(
                                                        ligne.getNomenclatureNumero()
                                                )
                                                .nomenclatureDesignation(
                                                        ligne.getNomenclatureDesignation()
                                                )
                                                .especeUnite(
                                                        ligne.getEspeceUnite()
                                                )
                                                .prixUnitaire(
                                                        ligne.getPrixUnitaire()
                                                )
                                                .existantEcriture(
                                                        ligne.getExistantEcriture()
                                                )
                                                .build()
                                )

                                .nouveau(
                                        RecensementMaterielComparaisonResponse
                                                .NouveauValeur
                                                .builder()
                                                .nomenclatureNumero(
                                                        materiel.getNomenclature()
                                                                .getNumero()
                                                )
                                                .nomenclatureDesignation(
                                                        materiel.getNomenclature()
                                                                .getDesignation()
                                                )
                                                .designation(
                                                        materiel.getDesignation()
                                                )
                                                .especeUnite(
                                                        materiel.getEspeceUnite()
                                                )
                                                .prixUnitaire(
                                                        prix
                                                )
                                                .existantEcriture(
                                                        existant
                                                )
                                                .build()
                                )
                                .build()
                );
            }
        }

        // ABSENTS

        for (RecensementMaterielLigne ligne : lignes) {

            if (ligne.getMateriel() == null
                    || ligne.getMateriel().getId() == null) {
                continue;
            }

            Long materielId =
                    ligne.getMateriel().getId();

            if (materielsActuels.contains(materielId)) {
                continue;
            }

            Materiel materiel =
                    ligne.getMateriel();

            absents.add(
                    RecensementMaterielComparaisonResponse
                            .AbsentMateriel
                            .builder()
                            .ligneId(
                                    ligne.getId()
                            )
                            .materielId(
                                    materielId
                            )
                            .nomenclatureNumero(
                                    ligne.getNomenclatureNumero()
                            )
                            .nomenclatureDesignation(
                                    ligne.getNomenclatureDesignation()
                            )
                            .especeUnite(
                                    ligne.getEspeceUnite()
                            )
                            .prixUnitaire(
                                    ligne.getPrixUnitaire()
                            )
                            .existantEcriture(
                                    ligne.getExistantEcriture()
                            )
                            .build()
            );
        }

        return RecensementMaterielComparaisonResponse
                .builder()
                .recensementId(recensementId)
                .annee(annee)
                .nouveaux(nouveaux)
                .modifies(modifies)
                .absents(absents)
                .build();
    }
    
    @Transactional
    public RecensementMaterielResponse appliquerModification(
            Long recensementId,
            Long ligneId
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(recensementId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement introuvable."
                                )
                        );

        RecensementMaterielLigne ligne =
                ligneRepository.findById(ligneId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ligne introuvable."
                                )
                        );

        Materiel materiel =
                ligne.getMateriel();

        MaterielInventaireAnnuel inventaire =
                inventaireRepository
                        .findByMateriel_IdAndAnnee(
                                materiel.getId(),
                                recensement.getAnnee()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Inventaire annuel introuvable."
                                )
                        );

        int existant =
                calculerExistantEcriture(
                        materiel,
                        recensement.getAnnee()
                );

        BigDecimal prix =
                inventaire.getPrixUnitaire() != null
                        ? inventaire.getPrixUnitaire()
                        : materiel.getPrixUnitaire();

        /*
         * Mise à jour des données de référence.
         *
         * On conserve :
         * - constateRecensement
         * - observation
         */
        ligne.setNomenclatureNumero(
                materiel.getNomenclature().getNumero()
        );

        ligne.setNomenclatureDesignation(
                materiel.getNomenclature().getDesignation()
        );

        ligne.setEspeceUnite(
                materiel.getEspeceUnite()
        );

        ligne.setPrixUnitaire(prix);

        ligne.setExistantEcriture(existant);

        recalculerLigne(ligne);

        ligneRepository.save(ligne);

        return chargerRecensement(recensementId);
    }

    // MODIFIER UNE LIGNE

    public RecensementMaterielResponse modifierLigne(
            Long recensementId,
            Long ligneId,
            RecensementMaterielLigneUpdateRequest request
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(
                        recensementId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Recensement matériel introuvable."
                        )
                );

        RecensementMaterielLigne ligne =
                ligneRepository.findById(
                        ligneId
                ).orElseThrow(() ->
                        new IllegalArgumentException(
                                "Ligne de recensement introuvable."
                        )
                );

        if (ligne.getRecensement() == null
                || !recensementId.equals(
                        ligne.getRecensement().getId()
                )) {

            throw new IllegalArgumentException(
                    "Cette ligne n'appartient pas à ce recensement."
            );
        }

        if (request == null
                || request.getConstateRecensement() == null) {

            throw new IllegalArgumentException(
                    "La quantité constatée est obligatoire."
            );
        }

        if (request.getConstateRecensement() < 0) {

            throw new IllegalArgumentException(
                    "La quantité constatée ne peut pas être négative."
            );
        }

        ligne.setConstateRecensement(
                request.getConstateRecensement()
        );

        ligne.setObservation(
                request.getObservation() != null
                        ? request.getObservation().trim()
                        : null
        );

        recalculerLigne(ligne);

        ligneRepository.save(ligne);

        List<RecensementMaterielLigne> lignes =
                ligneRepository
                        .findByRecensement_IdOrderByNomenclatureNumeroAscIdAsc(
                                recensementId
                        );

        return construireResponse(
                recensement,
                lignes
        );
    }
    
    //FONCTION AJOUT AU SNAPSHOT
    
    @Transactional
    public RecensementMaterielResponse ajouterNouveauMateriel(
            Long recensementId,
            Long materielId
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(recensementId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement introuvable."
                                )
                        );


        if (ligneRepository.existsByRecensement_IdAndMateriel_Id(
                recensementId,
                materielId
        )) {
            throw new IllegalArgumentException(
                    "Ce matériel est déjà présent dans le recensement."
            );
        }

        MaterielInventaireAnnuel inventaire =
                inventaireRepository
                        .findByMateriel_IdAndAnnee(
                                materielId,
                                recensement.getAnnee()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ce matériel n'existe pas dans l'inventaire de l'année."
                                )
                        );

        Materiel materiel =
                inventaire.getMateriel();

        int existant =
                calculerExistantEcriture(
                        materiel,
                        recensement.getAnnee()
                );

        BigDecimal prix =
                inventaire.getPrixUnitaire() != null
                        ? inventaire.getPrixUnitaire()
                        : materiel.getPrixUnitaire();

        RecensementMaterielLigne ligne =
                RecensementMaterielLigne.builder()
                        .recensement(recensement)
                        .materiel(materiel)
                        .nomenclatureNumero(
                                materiel.getNomenclature().getNumero()
                        )
                        .nomenclatureDesignation(
                                materiel.getNomenclature().getDesignation()
                        )
                        .especeUnite(
                                materiel.getEspeceUnite()
                        )
                        .prixUnitaire(prix)
                        .existantEcriture(existant)

                        /*
                         * Nouveau matériel :
                         * au départ le constat est égal aux écritures.
                         */
                        .constateRecensement(existant)

                        .excedent(0)
                        .deficit(0)
                        .valeurExcedentArticle(BigDecimal.ZERO)
                        .valeurDeficitArticle(BigDecimal.ZERO)
                        .valeurArticle(
                                prix.multiply(
                                        BigDecimal.valueOf(existant)
                                )
                        )
                        .observation(
                                inventaire.getObservation()
                        )
                        .build();

        ligneRepository.save(ligne);

        return chargerRecensement(recensementId);
    }

    // CALCUL D'UNE LIGNE

    private void recalculerLigne(
            RecensementMaterielLigne ligne
    ) {

        int existant =
                ligne.getExistantEcriture() != null
                        ? ligne.getExistantEcriture()
                        : 0;

        int constate =
                ligne.getConstateRecensement() != null
                        ? ligne.getConstateRecensement()
                        : 0;

        BigDecimal prix =
                ligne.getPrixUnitaire() != null
                        ? ligne.getPrixUnitaire()
                        : BigDecimal.ZERO;

        int excedent = 0;
        int deficit = 0;

        if (constate > existant) {

            excedent =
                    constate - existant;

        } else if (constate < existant) {

            deficit =
                    existant - constate;
        }

        BigDecimal valeurExcedent =
                prix.multiply(
                        BigDecimal.valueOf(excedent)
                );

        BigDecimal valeurDeficit =
                prix.multiply(
                        BigDecimal.valueOf(deficit)
                );

        BigDecimal valeurArticle =
                prix.multiply(
                        BigDecimal.valueOf(constate)
                );

        ligne.setExcedent(excedent);

        ligne.setDeficit(deficit);

        ligne.setValeurExcedentArticle(
                valeurExcedent
        );

        ligne.setValeurDeficitArticle(
                valeurDeficit
        );

        ligne.setValeurArticle(
                valeurArticle
        );
    }

    // EXISTANT D'APRES LES ECRITURES

    private int calculerExistantEcriture(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null || annee == null) {
            return 0;
        }

        int stock =
                materiel.getQuantiteInitiale() != null
                        ? materiel.getQuantiteInitiale()
                        : 0;

        Integer anneeInitiale =
                materiel.getAnneeInitiale();

        /*
         * Le matériel n'existait pas encore.
         */
        if (anneeInitiale != null
                && annee < anneeInitiale) {

            return 0;
        }

        /*
         * --------------------------------------------------------
         * ENTREES
         * --------------------------------------------------------
         */
        List<MaterielEntree> entrees =
                materielEntreeRepository
                        .findByMateriel_IdOrderByDateEntreeAsc(
                                materiel.getId()
                        );

        for (MaterielEntree entree : entrees) {

            if (entree.getAnnee() != null
                    && entree.getAnnee() <= annee) {

                stock +=
                        entree.getQuantite() != null
                                ? entree.getQuantite()
                                : 0;
            }
        }

        /*
         * --------------------------------------------------------
         * SORTIES
         * --------------------------------------------------------
         */
        List<MaterielSortie> sorties =
                materielSortieRepository
                        .findByMateriel_IdOrderByDateSortieAsc(
                                materiel.getId()
                        );

        for (MaterielSortie sortie : sorties) {

            if (sortie.getAnnee() != null
                    && sortie.getAnnee() <= annee) {

                stock -=
                        sortie.getQuantite() != null
                                ? sortie.getQuantite()
                                : 0;
            }
        }

        if (stock < 0) {

            throw new IllegalStateException(
                    "Le stock du matériel devient négatif pour l'année "
                            + annee
                            + " : "
                            + materiel.getDesignation()
            );
        }

        return stock;
    }

    // PRIX DE L'ANNEE

    private BigDecimal trouverPrixPourAnnee(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null) {
            return BigDecimal.ZERO;
        }

        var inventaire =
                inventaireRepository
                        .findByMateriel_IdAndAnnee(
                                materiel.getId(),
                                annee
                        );

        if (inventaire.isPresent()
                && inventaire.get().getPrixUnitaire() != null) {

            return inventaire.get().getPrixUnitaire();
        }

        return materiel.getPrixUnitaire() != null
                ? materiel.getPrixUnitaire()
                : BigDecimal.ZERO;
    }

    // CONSTRUCTION DE LA REPONSE

    private RecensementMaterielResponse construireResponse(
            RecensementMateriel recensement,
            List<RecensementMaterielLigne> lignes
    ) {

        List<RecensementMaterielResponse.Ligne> lignesResponse =
                new ArrayList<>();

        int nombreArticles = 0;
        int nombreArticlesExcedent = 0;
        int nombreArticlesDeficit = 0;

        BigDecimal totalValeurExistante =
                BigDecimal.ZERO;

        BigDecimal totalValeurExcedent =
                BigDecimal.ZERO;

        BigDecimal totalValeurDeficit =
                BigDecimal.ZERO;

        for (RecensementMaterielLigne ligne : lignes) {

            /*
             * Calcul en mémoire pour toujours retourner
             * les valeurs correctes.
             */
            int existant =
                    ligne.getExistantEcriture() != null
                            ? ligne.getExistantEcriture()
                            : 0;

            int constate =
                    ligne.getConstateRecensement() != null
                            ? ligne.getConstateRecensement()
                            : 0;

            BigDecimal prix =
                    ligne.getPrixUnitaire() != null
                            ? ligne.getPrixUnitaire()
                            : BigDecimal.ZERO;

            int excedent = 0;
            int deficit = 0;

            if (constate > existant) {

                excedent =
                        constate - existant;

            } else if (constate < existant) {

                deficit =
                        existant - constate;
            }

            BigDecimal valeurExcedent =
                    prix.multiply(
                            BigDecimal.valueOf(excedent)
                    );

            BigDecimal valeurDeficit =
                    prix.multiply(
                            BigDecimal.valueOf(deficit)
                    );

            BigDecimal valeurArticle =
                    prix.multiply(
                            BigDecimal.valueOf(constate)
                    );

            if (ligne.getId() != null) {
                nombreArticles++;
            }

            if (excedent > 0) {
                nombreArticlesExcedent++;
            }

            if (deficit > 0) {
                nombreArticlesDeficit++;
            }

            totalValeurExistante =
                    totalValeurExistante.add(
                            valeurArticle
                    );

            totalValeurExcedent =
                    totalValeurExcedent.add(
                            valeurExcedent
                    );

            totalValeurDeficit =
                    totalValeurDeficit.add(
                            valeurDeficit
                    );

            lignesResponse.add(
                    RecensementMaterielResponse.Ligne
                            .builder()
                            .id(ligne.getId())
                            .materielId(
                                    ligne.getMateriel() != null
                                            ? ligne.getMateriel().getId()
                                            : null
                            )
                            .nomenclatureNumero(
                                    ligne.getNomenclatureNumero()
                            )
                            .nomenclatureDesignation(
                                    ligne.getNomenclatureDesignation()
                            )
                            .especeUnite(
                                    ligne.getEspeceUnite()
                            )
                            .prixUnitaire(
                                    prix
                            )
                            .existantEcriture(
                                    existant
                            )
                            .constateRecensement(
                                    constate
                            )
                            .excedent(
                                    excedent
                            )
                            .deficit(
                                    deficit
                            )
                            .valeurExcedentArticle(
                                    valeurExcedent
                            )
                            .valeurDeficitArticle(
                                    valeurDeficit
                            )
                            .valeurArticle(
                                    valeurArticle
                            )
                            .observation(
                                    ligne.getObservation()
                            )
                            .build()
            );
        }

        return RecensementMaterielResponse
                .builder()
                .id(
                        recensement.getId()
                )
                .soaId(
                        recensement.getSoa() != null
                                ? recensement.getSoa().getId()
                                : null
                )
                .codeSoa(
                        recensement.getSoa() != null
                                ? recensement.getSoa().getCodeSoa()
                                : null
                )
                .annee(
                        recensement.getAnnee()
                )
                .fonctionnaireRecenseurNom(
                        recensement
                                .getFonctionnaireRecenseurNom()
                )
                .fonctionnaireRecenseurQualite(
                        recensement
                                .getFonctionnaireRecenseurQualite()
                )
                .comptableNom(
                        recensement.getComptableNom()
                )
                .comptableQualite(
                        recensement.getComptableQualite()
                )
                .dateRecensement(
                        recensement.getDateRecensement()
                )

                .lignes(
                        lignesResponse
                )
                .nombreArticles(
                        nombreArticles
                )
                .nombreArticlesExcedent(
                        nombreArticlesExcedent
                )
                .nombreArticlesDeficit(
                        nombreArticlesDeficit
                )
                .totalValeurExistante(
                        totalValeurExistante
                )
                .totalValeurExcedent(
                        totalValeurExcedent
                )
                .totalValeurDeficit(
                        totalValeurDeficit
                )
                .build();
    }

    // VALIDATION DE LA CREATION

    private void validerCreation(
            RecensementMaterielCreateRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "La demande est obligatoire."
            );
        }

        if (request.getSoaId() == null) {

            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }

        if (request.getAnnee() == null) {

            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }

        if (request.getFonctionnaireRecenseurNom() == null
                || request
                .getFonctionnaireRecenseurNom()
                .isBlank()) {

            throw new IllegalArgumentException(
                    "Le nom du fonctionnaire recenseur est obligatoire."
            );
        }

        if (request.getFonctionnaireRecenseurQualite() == null
                || request
                .getFonctionnaireRecenseurQualite()
                .isBlank()) {

            throw new IllegalArgumentException(
                    "La qualité du fonctionnaire recenseur est obligatoire."
            );
        }

        if (request.getComptableNom() == null
                || request
                .getComptableNom()
                .isBlank()) {

            throw new IllegalArgumentException(
                    "Le nom du comptable est obligatoire."
            );
        }

        if (request.getComptableQualite() == null
                || request
                .getComptableQualite()
                .isBlank()) {

            throw new IllegalArgumentException(
                    "La qualité du comptable est obligatoire."
            );
        }
    }

    @Transactional
    public RecensementMaterielResponse supprimerLigneRecensement(
            Long recensementId,
            Long ligneId
    ) {

        RecensementMateriel recensement =
                recensementRepository.findById(recensementId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Recensement matériel introuvable."
                                )
                        );

        RecensementMaterielLigne ligne =
                ligneRepository.findById(ligneId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Ligne de recensement introuvable."
                                )
                        );

        if (ligne.getRecensement() == null
                || !recensementId.equals(
                        ligne.getRecensement().getId()
                )) {

            throw new IllegalArgumentException(
                    "Cette ligne n'appartient pas à ce recensement."
            );
        }

        Materiel materiel = ligne.getMateriel();

        if (materiel == null || materiel.getId() == null) {
            throw new IllegalArgumentException(
                    "Le matériel associé à cette ligne est introuvable."
            );
        }

        /*
         * Même règle que comparerAvecInventaire():
         *
         * Un matériel actif présent dans l'inventaire N
         * n'est PAS absent.
         *
         * Un matériel désactivé est considéré comme absent.
         */
        boolean materielAbsent =
                !Boolean.TRUE.equals(materiel.getActif());

        /*
         * Si le matériel est encore actif, on vérifie
         * qu'il possède bien un inventaire annuel N.
         */
        if (Boolean.TRUE.equals(materiel.getActif())) {

            boolean presentDansInventaire =
                    inventaireRepository
                            .findByMateriel_IdAndAnnee(
                                    materiel.getId(),
                                    recensement.getAnnee()
                            )
                            .isPresent();

            materielAbsent = !presentDansInventaire;
        }

        if (!materielAbsent) {
            throw new IllegalArgumentException(
                    "Ce matériel n'est pas absent de l'inventaire "
                            + recensement.getAnnee()
                            + "."
            );
        }

        /*
         * Suppression UNIQUEMENT de la ligne
         * du recensement.
         *
         * Le matériel réel n'est pas supprimé.
         */
        ligneRepository.delete(ligne);
        ligneRepository.flush();

        return chargerRecensement(recensementId);
        }
    
    // SUPPRESSION COMPLETE DU RECENSEMENT
    @Transactional
    public void supprimerRecensement(Long id) {
        // 1. Vérification de l'existence du recensement
        RecensementMateriel recensement = recensementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Impossible de supprimer : Recensement matériel introuvable avec l'ID : " + id
                ));

        // 2. Optionnel : Sécurité métier si vous souhaitez empêcher la suppression d'un recensement validé
        if (Boolean.TRUE.equals(recensement.getValide())) {
            throw new IllegalStateException(
                    "Un recensement validé et officiel ne peut pas être supprimé."
            );
        }

        // 3. Suppression de toutes les lignes associées en premier pour éviter les violations de clés étrangères
        ligneRepository.deleteByRecensement_Id(id);

        // 4. Suppression définitive de l'en-tête du recensement
        recensementRepository.delete(recensement);
    }

}