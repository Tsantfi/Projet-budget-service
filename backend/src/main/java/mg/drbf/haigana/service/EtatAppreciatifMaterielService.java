package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.EtatAppreciatifMaterielResponse;
import mg.drbf.haigana.entity.Materiel;
import mg.drbf.haigana.entity.MaterielEntree;
import mg.drbf.haigana.entity.MaterielInventaireAnnuel;
import mg.drbf.haigana.entity.MaterielSortie;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.repository.MaterielEntreeRepository;
import mg.drbf.haigana.repository.MaterielInventaireAnnuelRepository;
import mg.drbf.haigana.repository.MaterielRepository;
import mg.drbf.haigana.repository.MaterielSortieRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EtatAppreciatifMaterielService {

    private final SoaCodeRepository soaCodeRepository;
    private final MaterielRepository materielRepository;
    private final MaterielEntreeRepository entreeRepository;
    private final MaterielSortieRepository sortieRepository;
    private final MaterielInventaireAnnuelRepository inventaireRepository;

    public EtatAppreciatifMaterielResponse charger(
            Long soaId,
            Integer annee
    ) {

        // 1. VALIDATION

        if (soaId == null) {
            throw new IllegalArgumentException(
                    "L'identifiant du SOA est obligatoire."
            );
        }

        if (annee == null) {
            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }

        if (annee <= 0) {
            throw new IllegalArgumentException(
                    "L'année est invalide."
            );
        }

        SoaCode soa =
                soaCodeRepository.findById(soaId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "SOA introuvable : " + soaId
                                )
                        );

        // 2. INVENTAIRE ANNUEL N

        /*
         * IMPORTANT :
         *
         * L'état appréciatif de N doit être basé UNIQUEMENT
         * sur l'inventaire annuel N.
         *
         * On ne mélange pas les matériels de N-1 avec ceux de N
         * pour construire l'état affiché.
         */
        List<MaterielInventaireAnnuel> inventairesAnnuels =
                inventaireRepository
                        .findByMateriel_CodeSoa_IdAndAnnee(
                                soaId,
                                annee
                        );

        // ------------------------------------------------------------
        // MATÉRIELS RÉELLEMENT DANS L'INVENTAIRE N
        // ------------------------------------------------------------

        List<MaterielInventaireAnnuel> inventairesEtat =
                inventairesAnnuels.stream()
                        .filter(Objects::nonNull)
                        .filter(inv -> inv.getMateriel() != null)
                        .filter(inv ->
                                Boolean.TRUE.equals(
                                        inv.getMateriel().getActif()
                                )
                        )
                        .filter(inv ->
                                existePendantAnnee(
                                        inv.getMateriel(),
                                        annee
                                )
                        )
                        .toList();

        // ------------------------------------------------------------
        // MAP INVENTAIRE N PAR MATÉRIEL
        // ------------------------------------------------------------

        Map<Long, MaterielInventaireAnnuel>
                inventaireParMateriel =
                inventairesEtat.stream()
                        .collect(
                                Collectors.toMap(
                                        inv ->
                                                inv.getMateriel().getId(),
                                        inv -> inv,
                                        (a, b) -> a,
                                        LinkedHashMap::new
                                )
                        );

        // ------------------------------------------------------------
        // MATÉRIELS DE N UNIQUEMENT
        // ------------------------------------------------------------

        List<Materiel> materielsInventaire =
                inventairesEtat.stream()
                        .map(
                                MaterielInventaireAnnuel
                                        ::getMateriel
                        )
                        .filter(Objects::nonNull)
                        .filter(m -> m.getId() != null)
                        .distinct()
                        .toList();

        // ------------------------------------------------------------
        // IDS MATÉRIELS DE L'INVENTAIRE N
        // ------------------------------------------------------------

        Set<Long> materielIdsInventaire =
                materielsInventaire.stream()
                        .map(Materiel::getId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        // ------------------------------------------------------------
        // NOMENCLATURES DE L'INVENTAIRE N UNIQUEMENT
        // ------------------------------------------------------------

        /*
         * CORRECTION N°1 :
         *
         * Cette liste ne doit contenir QUE les nomenclatures
         * réellement présentes dans l'inventaire annuel N.
         *
         * Même si une nomenclature existe dans N-1,
         * elle ne sera PAS affichée dans N si elle n'existe
         * pas dans l'inventaire N.
         */
        Set<Integer> nomenclaturesInventaire =
                materielsInventaire.stream()
                        .filter(Objects::nonNull)
                        .map(Materiel::getNomenclature)
                        .filter(Objects::nonNull)
                        .map(n -> n.getNumero())
                        .filter(Objects::nonNull)
                        .collect(
                                Collectors.toCollection(
                                        TreeSet::new
                                )
                        );

        // 3. ENTRÉES DE L'ANNÉE N

        List<MaterielEntree> entrees =
                entreeRepository
                        .findByMateriel_CodeSoa_IdAndAnneeOrderByDateEntreeAsc(
                                soaId,
                                annee
                        );

        // 4. SORTIES DE L'ANNÉE N

        List<MaterielSortie> sorties =
                sortieRepository
                        .findByMateriel_CodeSoa_IdAndAnneeOrderByDateSortieAsc(
                                soaId,
                                annee
                        );
        // 4.1 MOUVEMENTS RETENUS

        /*
         * Les mouvements de N sont retenus uniquement pour les
         * matériels réellement présents dans l'inventaire N.
         */
        List<MaterielEntree> entreesEtat =
                entrees.stream()
                        .filter(e -> e.getMateriel() != null)
                        .filter(e ->
                                materielIdsInventaire.contains(
                                        e.getMateriel().getId()
                                )
                        )
                        .toList();

        List<MaterielSortie> sortiesEtat =
                sorties.stream()
                        .filter(s -> s.getMateriel() != null)
                        .filter(s ->
                                materielIdsInventaire.contains(
                                        s.getMateriel().getId()
                                )
                        )
                        .toList();

        // 5. PRIX PAR MATÉRIEL

        Map<Long, BigDecimal> prixParMateriel =
                new HashMap<>();

        for (Materiel materiel : materielsInventaire) {

            BigDecimal prix =
                    trouverPrixPourAnnee(
                            materiel,
                            annee
                    );

            prixParMateriel.put(
                    materiel.getId(),
                    prix
            );
        }

        // 6. MONTANTS DES ENTRÉES

        Map<Long, BigDecimal> entreesParMateriel =
                new HashMap<>();

        for (MaterielEntree entree : entreesEtat) {

            Materiel materiel =
                    entree.getMateriel();

            if (materiel == null ||
                    materiel.getId() == null) {
                continue;
            }

            BigDecimal prix =
                    prixParMateriel.getOrDefault(
                            materiel.getId(),
                            trouverPrixPourAnnee(
                                    materiel,
                                    annee
                            )
                    );

            int quantite =
                    Optional.ofNullable(
                            entree.getQuantite()
                    ).orElse(0);

            BigDecimal montant =
                    BigDecimal.valueOf(quantite)
                            .multiply(prix);

            entreesParMateriel.merge(
                    materiel.getId(),
                    montant,
                    BigDecimal::add
            );
        }

        // 7. MONTANTS DES SORTIES

        Map<Long, BigDecimal> sortiesParMateriel =
                new HashMap<>();

        for (MaterielSortie sortie : sortiesEtat) {

            Materiel materiel =
                    sortie.getMateriel();

            if (materiel == null ||
                    materiel.getId() == null) {
                continue;
            }

            BigDecimal prix =
                    prixParMateriel.getOrDefault(
                            materiel.getId(),
                            trouverPrixPourAnnee(
                                    materiel,
                                    annee
                            )
                    );

            int quantite =
                    Optional.ofNullable(
                            sortie.getQuantite()
                    ).orElse(0);

            BigDecimal montant =
                    BigDecimal.valueOf(quantite)
                            .multiply(prix);

            sortiesParMateriel.merge(
                    materiel.getId(),
                    montant,
                    BigDecimal::add
            );
        }

        // 8. JOURNAL DES OPÉRATIONS

        List<EtatAppreciatifMaterielResponse.Operation>
                operations =
                new ArrayList<>();

        // ------------------------------------------------------------
        // 8.1 ENTRÉES
        // ------------------------------------------------------------

        for (MaterielEntree entree : entreesEtat) {

            Materiel materiel =
                    entree.getMateriel();

            if (materiel == null ||
                    materiel.getNomenclature() == null) {
                continue;
            }

            Integer numeroNomenclature =
                    materiel.getNomenclature()
                            .getNumero();

            /*
             * Sécurité :
             * la nomenclature doit exister dans l'inventaire N.
             */
            if (numeroNomenclature == null ||
                    !nomenclaturesInventaire.contains(
                            numeroNomenclature
                    )) {
                continue;
            }

            BigDecimal prix =
                    prixParMateriel.getOrDefault(
                            materiel.getId(),
                            trouverPrixPourAnnee(
                                    materiel,
                                    annee
                            )
                    );

            int quantite =
                    Optional.ofNullable(
                            entree.getQuantite()
                    ).orElse(0);

            BigDecimal montant =
                    BigDecimal.valueOf(quantite)
                            .multiply(prix);

            EtatAppreciatifMaterielResponse
                    .MouvementNomenclature mouvement =
                    EtatAppreciatifMaterielResponse
                            .MouvementNomenclature
                            .builder()
                            .numeroNomenclature(
                                    numeroNomenclature
                            )
                            .charge(montant)
                            .decharge(BigDecimal.ZERO)
                            .build();

            operations.add(
                    EtatAppreciatifMaterielResponse
                            .Operation
                            .builder()
                            .date(
                                    entree.getDateEntree()
                            )
                            .designationOperation(
                                    "Ordre d'entrée"
                            )
                            .mouvements(
                                    List.of(mouvement)
                            )
                            .build()
            );
        }

        // ------------------------------------------------------------
        // 8.2 SORTIES
        // ------------------------------------------------------------

        for (MaterielSortie sortie : sortiesEtat) {

            Materiel materiel =
                    sortie.getMateriel();

            if (materiel == null ||
                    materiel.getNomenclature() == null) {
                continue;
            }

            Integer numeroNomenclature =
                    materiel.getNomenclature()
                            .getNumero();

            if (numeroNomenclature == null ||
                    !nomenclaturesInventaire.contains(
                            numeroNomenclature
                    )) {
                continue;
            }

            BigDecimal prix =
                    prixParMateriel.getOrDefault(
                            materiel.getId(),
                            trouverPrixPourAnnee(
                                    materiel,
                                    annee
                            )
                    );

            int quantite =
                    Optional.ofNullable(
                            sortie.getQuantite()
                    ).orElse(0);

            BigDecimal montant =
                    BigDecimal.valueOf(quantite)
                            .multiply(prix);

            EtatAppreciatifMaterielResponse
                    .MouvementNomenclature mouvement =
                    EtatAppreciatifMaterielResponse
                            .MouvementNomenclature
                            .builder()
                            .numeroNomenclature(
                                    numeroNomenclature
                            )
                            .charge(BigDecimal.ZERO)
                            .decharge(montant)
                            .build();

            operations.add(
                    EtatAppreciatifMaterielResponse
                            .Operation
                            .builder()
                            .date(
                                    sortie.getDateSortie()
                            )
                            .designationOperation(
                                    "Ordre de sortie"
                            )
                            .mouvements(
                                    List.of(mouvement)
                            )
                            .build()
            );
        }

        // 9. TRI DES OPÉRATIONS

        operations.sort(
                Comparator.comparing(
                        EtatAppreciatifMaterielResponse
                                .Operation::getDate,
                        Comparator.nullsLast(
                                Comparator.naturalOrder()
                        )
                )
        );

        // 10. RÉCAPITULATION

        Map<Integer,
                EtatAppreciatifMaterielResponse.Recapitulation>
                recapMap =
                new TreeMap<>();

        /*
         * IMPORTANT :
         *
         * On boucle uniquement sur les matériels de l'inventaire N.
         *
         * Donc une nomenclature absente de l'inventaire N
         * ne pourra jamais apparaître dans le récapitulatif N.
         */
        for (Materiel materiel : materielsInventaire) {

            if (materiel == null ||
                    materiel.getId() == null ||
                    materiel.getNomenclature() == null) {
                continue;
            }

            MaterielInventaireAnnuel inventaire =
                    inventaireParMateriel.get(
                            materiel.getId()
                    );

            if (inventaire == null) {
                continue;
            }

            Integer numero =
                    materiel.getNomenclature()
                            .getNumero();

            if (numero == null ||
                    !nomenclaturesInventaire.contains(
                            numero
                    )) {
                continue;
            }

            //  // ENTRÉES DE L'ANNÉE
            // ========================================================

            BigDecimal entreesMateriel =
                    entreesParMateriel.getOrDefault(
                            materiel.getId(),
                            BigDecimal.ZERO
                    );

            //  // SORTIES DE L'ANNÉE
            // ========================================================

            BigDecimal sortiesMateriel =
                    sortiesParMateriel.getOrDefault(
                            materiel.getId(),
                            BigDecimal.ZERO
                    );

            //  // EXISTANT AU 01/01/N
            // ========================================================

            /*
             * CORRECTION N°2
             *
             * On ne prend plus directement :
             *
             * inventaire N-1 -> decompte
             *
             * À la place :
             *
             * Reste fin N-1
             *        ↓
             * Existant début N
             *
             * Cela garantit la continuité entre les états appréciatifs.
             */
            BigDecimal existantMateriel =
                    calculerExistantDebutAnnee(
                            materiel,
                            annee
                    );

            //  // CRÉATION / RÉCUPÉRATION DU RECAP
            // ========================================================

            EtatAppreciatifMaterielResponse.Recapitulation recap =
                    recapMap.computeIfAbsent(
                            numero,
                            n ->
                                    EtatAppreciatifMaterielResponse
                                            .Recapitulation
                                            .builder()
                                            .numeroNomenclature(n)
                                            .existantDebutAnnee(
                                                    BigDecimal.ZERO
                                            )
                                            .entreesAnnee(
                                                    BigDecimal.ZERO
                                            )
                                            .totalExistantEntrees(
                                                    BigDecimal.ZERO
                                            )
                                            .sortiesAnnee(
                                                    BigDecimal.ZERO
                                            )
                                            .resteFinAnnee(
                                                    BigDecimal.ZERO
                                            )
                                            .build()
                    );

            //  // REGROUPEMENT
            // ========================================================

            recap.setExistantDebutAnnee(
                    recap.getExistantDebutAnnee()
                            .add(existantMateriel)
            );

            recap.setEntreesAnnee(
                    recap.getEntreesAnnee()
                            .add(entreesMateriel)
            );

            recap.setSortiesAnnee(
                    recap.getSortiesAnnee()
                            .add(sortiesMateriel)
            );
        }

        // 11. TOTAL ET RESTE

        BigDecimal sommeEntrees =
                BigDecimal.ZERO;

        BigDecimal sommeSorties =
                BigDecimal.ZERO;

        BigDecimal sommeResteGenerale =
                BigDecimal.ZERO;

        for (EtatAppreciatifMaterielResponse.Recapitulation recap
                : recapMap.values()) {

            BigDecimal existant =
                    Optional.ofNullable(
                            recap.getExistantDebutAnnee()
                    ).orElse(BigDecimal.ZERO);

            BigDecimal entreesValeur =
                    Optional.ofNullable(
                            recap.getEntreesAnnee()
                    ).orElse(BigDecimal.ZERO);

            BigDecimal sortiesValeur =
                    Optional.ofNullable(
                            recap.getSortiesAnnee()
                    ).orElse(BigDecimal.ZERO);

            // --------------------------------------------------------
            // EXISTANT + ENTRÉES
            // --------------------------------------------------------

            BigDecimal total =
                    existant.add(entreesValeur);

            // --------------------------------------------------------
            // TOTAL - SORTIES
            // --------------------------------------------------------

            BigDecimal reste =
                    total.subtract(sortiesValeur);

            // --------------------------------------------------------
            // ÉVITER UN RESTE NÉGATIF
            // --------------------------------------------------------

            if (reste.compareTo(
                    BigDecimal.ZERO
            ) < 0) {

                reste =
                        BigDecimal.ZERO;
            }

            recap.setTotalExistantEntrees(
                    total
            );

            recap.setResteFinAnnee(
                    reste
            );

            sommeEntrees =
                    sommeEntrees.add(
                            entreesValeur
                    );

            sommeSorties =
                    sommeSorties.add(
                            sortiesValeur
                    );

            sommeResteGenerale =
                    sommeResteGenerale.add(
                            reste
                    );
        }

        // 12. NOMENCLATURES DE N UNIQUEMENT

        List<Integer> numerosNomenclature =
                nomenclaturesInventaire.stream()
                        .sorted()
                        .toList();

        // 13. RÉPONSE

        return EtatAppreciatifMaterielResponse
                .builder()
                .soaId(
                        soa.getId()
                )
                .codeSoa(
                        soa.getCodeSoa()
                )
                .annee(
                        annee
                )
                .nomenclatures(
                        numerosNomenclature
                )
                .operations(
                        operations
                )
                .recapitulatif(
                        new ArrayList<>(
                                recapMap.values()
                        )
                )
                .sommeEntrees(
                        sommeEntrees
                )
                .sommeSorties(
                        sommeSorties
                )
                .sommeResteGenerale(
                        sommeResteGenerale
                )
                .build();
    }

    // EXISTE-T-IL PENDANT L'ANNÉE ?

    private boolean existePendantAnnee(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null ||
                annee == null) {
            return false;
        }

        Integer anneeInitiale =
                materiel.getAnneeInitiale();

        /*
         * Exemple :
         *
         * matériel créé en 2025
         * état 2024 -> absent
         */
        if (anneeInitiale != null
                && anneeInitiale > annee) {

            return false;
        }

        return true;
    }

    // EXISTANT AU 01/01/N

    private BigDecimal calculerExistantDebutAnnee(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null ||
                materiel.getId() == null ||
                annee == null) {

            return BigDecimal.ZERO;
        }

        Integer anneeInitiale =
                materiel.getAnneeInitiale();

        /*
         * Un matériel créé en N n'existait pas
         * au 01/01/N.
         */
        if (anneeInitiale != null
                && anneeInitiale >= annee) {

            return BigDecimal.ZERO;
        }

        /*
         * Pour N :
         *
         * Existant début N =
         * Reste fin N-1
         */
        if (annee <= 1) {
            return BigDecimal.ZERO;
        }

        return calculerResteFinAnnee(
                materiel,
                annee - 1
        );
    }

    // RESTE FIN D'UNE ANNÉE

    private BigDecimal calculerResteFinAnnee(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null ||
                materiel.getId() == null ||
                annee == null ||
                annee <= 0) {

            return BigDecimal.ZERO;
        }

        Integer anneeInitiale =
                materiel.getAnneeInitiale();

        /*
         * Le matériel n'existait pas encore.
         */
        if (anneeInitiale != null
                && anneeInitiale > annee) {

            return BigDecimal.ZERO;
        }

        // EXISTANT AU 01/01 DE L'ANNÉE

        BigDecimal existant =
                calculerExistantDebutAnnee(
                        materiel,
                        annee
                );

        // PRIX DE L'ANNÉE

        BigDecimal prix =
                trouverPrixPourAnnee(
                        materiel,
                        annee
                );

        // ENTRÉES DE L'ANNÉE

        List<MaterielEntree> entrees =
                entreeRepository
                        .findByMateriel_CodeSoa_IdAndAnneeOrderByDateEntreeAsc(
                                getSoaIdDuMateriel(materiel),
                                annee
                        );

        BigDecimal valeurEntrees =
                BigDecimal.ZERO;

        for (MaterielEntree entree : entrees) {

            if (entree.getMateriel() == null ||
                    !materiel.getId().equals(
                            entree.getMateriel().getId()
                    )) {
                continue;
            }

            int quantite =
                    Optional.ofNullable(
                            entree.getQuantite()
                    ).orElse(0);

            valeurEntrees =
                    valeurEntrees.add(
                            BigDecimal.valueOf(quantite)
                                    .multiply(prix)
                    );
        }

        // SORTIES DE L'ANNÉE

        List<MaterielSortie> sorties =
                sortieRepository
                        .findByMateriel_CodeSoa_IdAndAnneeOrderByDateSortieAsc(
                                getSoaIdDuMateriel(materiel),
                                annee
                        );

        BigDecimal valeurSorties =
                BigDecimal.ZERO;

        for (MaterielSortie sortie : sorties) {

            if (sortie.getMateriel() == null ||
                    !materiel.getId().equals(
                            sortie.getMateriel().getId()
                    )) {
                continue;
            }

            int quantite =
                    Optional.ofNullable(
                            sortie.getQuantite()
                    ).orElse(0);

            valeurSorties =
                    valeurSorties.add(
                            BigDecimal.valueOf(quantite)
                                    .multiply(prix)
                    );
        }

        // CALCUL DU RESTE

        BigDecimal reste =
                existant
                        .add(valeurEntrees)
                        .subtract(valeurSorties);

        if (reste.compareTo(
                BigDecimal.ZERO
        ) < 0) {

            reste =
                    BigDecimal.ZERO;
        }

        return reste;
    }

    // RÉCUPÉRER LE SOA DU MATÉRIEL

    private Long getSoaIdDuMateriel(
            Materiel materiel
    ) {

        if (materiel == null ||
                materiel.getCodeSoa() == null) {

            return null;
        }

        return materiel.getCodeSoa().getId();
    }

    // PRIX POUR UNE ANNÉE

    private BigDecimal trouverPrixPourAnnee(
            Materiel materiel,
            Integer annee
    ) {

        if (materiel == null ||
                annee == null) {

            return BigDecimal.ZERO;
        }

        // ------------------------------------------------------------
        // 1. PRIX DE L'INVENTAIRE DE L'ANNÉE
        // ------------------------------------------------------------

        Optional<MaterielInventaireAnnuel> inventaire =
                inventaireRepository
                        .findByMateriel_IdAndAnnee(
                                materiel.getId(),
                                annee
                        );

        if (inventaire.isPresent()) {

            BigDecimal prixInventaire =
                    inventaire.get()
                            .getPrixUnitaire();

            if (prixInventaire != null
                    && prixInventaire.compareTo(
                            BigDecimal.ZERO
                    ) > 0) {

                return prixInventaire;
            }
        }

        // 2. PRIX DU MATÉRIEL

        if (materiel.getPrixUnitaire() != null
                && materiel.getPrixUnitaire().compareTo(
                        BigDecimal.ZERO
                ) > 0) {

            return materiel.getPrixUnitaire();
        }

        return BigDecimal.ZERO;
    }
}