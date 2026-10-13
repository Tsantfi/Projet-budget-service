package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.MaterielEntreeRequest;
import mg.drbf.haigana.dto.MaterielInventaireResponse;
import mg.drbf.haigana.dto.MaterielSortieRequest;
import mg.drbf.haigana.entity.Materiel;
import mg.drbf.haigana.entity.MaterielEntree;
import mg.drbf.haigana.entity.MaterielInventaireAnnuel;
import mg.drbf.haigana.entity.MaterielSortie;
import mg.drbf.haigana.entity.Nomenclature;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.repository.MaterielEntreeRepository;
import mg.drbf.haigana.repository.MaterielInventaireAnnuelRepository;
import mg.drbf.haigana.repository.MaterielRepository;
import mg.drbf.haigana.repository.MaterielSortieRepository;
import mg.drbf.haigana.repository.NomenclatureRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;
import org.springframework.stereotype.Service;
import mg.drbf.haigana.dto.MaterielInventaireUpdateRequest;
import org.springframework.transaction.annotation.Transactional;
import mg.drbf.haigana.dto.MaterielUpdateRequest;
import mg.drbf.haigana.dto.MaterielResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterielService {

    private final MaterielRepository materielRepository;
    private final MaterielEntreeRepository materielEntreeRepository;
    private final MaterielSortieRepository materielSortieRepository;
    private final MaterielInventaireAnnuelRepository inventaireRepository;
    private final NomenclatureRepository nomenclatureRepository;
    private final SoaCodeRepository soaCodeRepository;
    
    @Transactional(readOnly = true)
    public MaterielResponse getMateriel(Long id) {

        Materiel materiel =
                materielRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Matériel introuvable : " + id
                                )
                        );

        return construireMaterielResponse(materiel);
    }
    
    private MaterielResponse construireMaterielResponse(
        Materiel materiel
    ) {

        MaterielResponse.CodeSoaResponse soaResponse = null;

        if (materiel.getCodeSoa() != null) {
            soaResponse =
                    MaterielResponse.CodeSoaResponse.builder()
                            .id(materiel.getCodeSoa().getId())
                            .codeSoa(
                                    materiel.getCodeSoa().getCodeSoa()
                            )
                            .build();
        }

        MaterielResponse.NomenclatureResponse nomenclatureResponse =
                null;

        if (materiel.getNomenclature() != null) {
            nomenclatureResponse =
                    MaterielResponse.NomenclatureResponse.builder()
                            .id(
                                    materiel.getNomenclature().getId()
                            )
                            .numero(
                                    materiel.getNomenclature().getNumero()
                            )
                            .designation(
                                    materiel.getNomenclature().getDesignation()
                            )
                            .actif(
                                    materiel.getNomenclature().getActif()
                            )
                            .build();
        }

        return MaterielResponse.builder()
                .id(materiel.getId())
                .codeSoa(soaResponse)
                .nomenclature(nomenclatureResponse)
                .designation(materiel.getDesignation())
                .especeUnite(materiel.getEspeceUnite())
                .prixUnitaire(materiel.getPrixUnitaire())
                .quantiteInitiale(materiel.getQuantiteInitiale())
                .anneeInitiale(materiel.getAnneeInitiale())
                .actif(materiel.getActif())
                .build();
    }
    
    public Materiel modifierMateriel(
        Long id,
        MaterielUpdateRequest request
    ) {

        Materiel materiel =
                materielRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Matériel introuvable : " + id
                                )
                        );

        if (request.getNomenclatureId() == null) {
            throw new IllegalArgumentException(
                    "La nomenclature est obligatoire."
            );
        }

        if (request.getDesignation() == null
                || request.getDesignation().isBlank()) {

            throw new IllegalArgumentException(
                    "La désignation est obligatoire."
            );
        }

        if (request.getEspeceUnite() == null
                || request.getEspeceUnite().isBlank()) {

            throw new IllegalArgumentException(
                    "L'espèce des unités est obligatoire."
            );
        }

        if (request.getPrixUnitaire() == null
                || request.getPrixUnitaire()
                    .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Le prix unitaire est invalide."
            );
        }

        Nomenclature nomenclature =
                nomenclatureRepository.findById(
                        request.getNomenclatureId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Nomenclature introuvable."
                        )
                );

        materiel.setNomenclature(nomenclature);

        materiel.setDesignation(
                request.getDesignation().trim()
        );

        materiel.setEspeceUnite(
                request.getEspeceUnite().trim()
        );

        materiel.setPrixUnitaire(
                request.getPrixUnitaire()
        );

        return materielRepository.save(materiel);
    }
    
    private int calculerResteFinAnnee(
        MaterielInventaireAnnuel inventaire
    ) {
        Long materielId = inventaire.getMateriel().getId();
        Integer annee = inventaire.getAnnee();

        int existant = inventaire.getExistantDebutAnnee() != null
                ? inventaire.getExistantDebutAnnee()
                : 0;

        int totalEntrees =
                materielEntreeRepository
                        .findByMateriel_IdAndAnneeOrderByDateEntreeAsc(
                                materielId,
                                annee
                        )
                        .stream()
                        .mapToInt(MaterielEntree::getQuantite)
                        .sum();

        int totalSorties =
                materielSortieRepository
                        .findByMateriel_IdAndAnneeOrderByDateSortieAsc(
                                materielId,
                                annee
                        )
                        .stream()
                        .mapToInt(MaterielSortie::getQuantite)
                        .sum();

        return existant + totalEntrees - totalSorties;
    }

    /**
     * Crée un nouveau matériel à partir d'une entrée.
     */
    public MaterielInventaireResponse creerMaterielAvecEntree(
            MaterielEntreeRequest request
    ) {

        validerEntreeRequest(request);

        SoaCode soa = soaCodeRepository.findById(request.getSoaId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Code SOA introuvable : " + request.getSoaId()
                        )
                );

        Nomenclature nomenclature =
                nomenclatureRepository.findById(request.getNomenclatureId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Nomenclature introuvable : "
                                                + request.getNomenclatureId()
                                )
                        );

        LocalDate dateEntree = request.getDateEntree();

        Integer annee = request.getAnnee();

        if (dateEntree.getYear() != annee) {
            throw new IllegalArgumentException(
                    "L'année de l'entrée ne correspond pas à la date d'entrée."
            );
        }

        /*
         * Le nouveau matériel commence dans cette année.
         * Il n'a donc rien comme existant au 1er janvier.
         */
        Materiel materiel = Materiel.builder()
                .codeSoa(soa)
                .nomenclature(nomenclature)
                .designation(request.getDesignation().trim())
                .especeUnite(request.getEspeceUnite().trim())
                .prixUnitaire(request.getPrixUnitaire())
                .quantiteInitiale(0)
                .anneeInitiale(annee)
                .actif(true)
                .build();

        materiel = materielRepository.save(materiel);

        /*
         * Enregistrement du mouvement d'entrée.
         */
        MaterielEntree entree = MaterielEntree.builder()
                .materiel(materiel)
                .annee(annee)
                .dateEntree(dateEntree)
                .quantite(request.getQuantite())
                .prixUnitaire(request.getPrixUnitaire())
                .observation(request.getObservation())
                .build();

        materielEntreeRepository.save(entree);

        /*
         * Création de l'inventaire annuel.
         */
        MaterielInventaireAnnuel inventaire =
                obtenirOuCreerInventaire(materiel, annee);
        
        inventaire.setObservation(
        request.getObservation() != null
                ? request.getObservation().trim()
                : null
        );

        recalculerInventaire(inventaire);

        return construireResponse(inventaire);
    }

    /**
     * Ajoute une entrée à un matériel déjà existant.
     */
    public MaterielInventaireResponse ajouterEntree(
            Long materielId,
            MaterielEntreeRequest request
    ) {

        if (request.getQuantite() == null || request.getQuantite() <= 0) {
            throw new IllegalArgumentException(
                    "La quantité entrée doit être supérieure à zéro."
            );
        }

        if (request.getDateEntree() == null) {
            throw new IllegalArgumentException(
                    "La date d'entrée est obligatoire."
            );
        }

        Materiel materiel = materielRepository.findById(materielId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Matériel introuvable : " + materielId
                        )
                );

        Integer annee = request.getAnnee();

        if (request.getDateEntree().getYear() != annee) {
            throw new IllegalArgumentException(
                    "L'année de l'entrée ne correspond pas à la date."
            );
        }

        MaterielEntree entree = MaterielEntree.builder()
                .materiel(materiel)
                .annee(annee)
                .dateEntree(request.getDateEntree())
                .quantite(request.getQuantite())
                .prixUnitaire(
                        request.getPrixUnitaire() != null
                                ? request.getPrixUnitaire()
                                : materiel.getPrixUnitaire()
                )
                .observation(request.getObservation())
                .build();

        materielEntreeRepository.save(entree);

        MaterielInventaireAnnuel inventaire =
                obtenirOuCreerInventaire(materiel, annee);

        recalculerInventaire(inventaire);

        return construireResponse(inventaire);
    }

    /**
     * Effectue une sortie.
     */
    public MaterielInventaireResponse ajouterSortie(
            MaterielSortieRequest request
    ) {

        validerSortieRequest(request);

        Materiel materiel = materielRepository.findById(
                request.getMaterielId()
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "Matériel introuvable : "
                                + request.getMaterielId()
                )
        );

        Integer annee = request.getAnnee();

        MaterielInventaireAnnuel inventaire =
                obtenirOuCreerInventaire(materiel, annee);

        recalculerInventaire(inventaire);

        Integer stockDisponible =
                calculerResteFinAnnee(inventaire);

        if (request.getQuantite() > stockDisponible) {
            throw new IllegalArgumentException(
                    "Quantité insuffisante. Stock disponible : "
                            + stockDisponible
            );
        }

        MaterielSortie sortie = MaterielSortie.builder()
                .materiel(materiel)
                .annee(annee)
                .dateSortie(request.getDateSortie())
                .quantite(request.getQuantite())
                .observation(request.getObservation())
                .build();

        materielSortieRepository.save(sortie);

        recalculerInventaire(inventaire);

        return construireResponse(inventaire);
    }

    /**
     * Charge l'inventaire d'un SOA pour une année.
     */
    @Transactional
    public List<MaterielInventaireResponse> chargerInventaire(
            Long soaId,
            Integer annee
    ) {
        
        int anneeCourante = LocalDate.now().getYear();

        if (annee >= anneeCourante) {
            throw new IllegalArgumentException(
                    "L'inventaire de l'année " + annee
                            + " n'est pas encore clôturé."
            );
        }
        
        List<Materiel> materiels =
                materielRepository.findByCodeSoa_IdAndActifTrueOrderByIdAsc(
                        soaId
                );

        List<MaterielInventaireResponse> resultat =
                new ArrayList<>();

        for (Materiel materiel : materiels) {

            Integer anneeInitiale =
                    materiel.getAnneeInitiale();

            /*
             * Le matériel n'existe pas encore
             * pour cette année.
             */
            if (anneeInitiale != null
                    && annee < anneeInitiale) {
                continue;
            }

            MaterielInventaireAnnuel inventaire =
                    obtenirOuCreerInventaire(
                            materiel,
                            annee
                    );

            recalculerInventaire(inventaire);

            resultat.add(
                    construireResponse(inventaire)
            );
        }

        return resultat;
        }

    /**
     * Création ou récupération de l'inventaire annuel.
     */
    private MaterielInventaireAnnuel obtenirOuCreerInventaire(
        Materiel materiel,
        Integer annee
    ) {

        return inventaireRepository
                .findByMateriel_IdAndAnnee(
                        materiel.getId(),
                        annee
                )
                .orElseGet(() -> {

                    Integer existantDebut =
                            calculerExistantDebutAnnee(
                                    materiel,
                                    annee
                            );

                    BigDecimal prixUnitaire =
                            materiel.getPrixUnitaire() != null
                                    ? materiel.getPrixUnitaire()
                                    : BigDecimal.ZERO;

                    MaterielInventaireAnnuel inventaire =
                            MaterielInventaireAnnuel.builder()
                                    .materiel(materiel)
                                    .annee(annee)
                                    .existantDebutAnnee(existantDebut)
                                    .prixUnitaire(prixUnitaire)
                                    .decompte(BigDecimal.ZERO)
                                    .observation(null)
                                    .build();

                    return inventaireRepository.save(
                            inventaire
                    );
                });
        }

    /**
     * Calcule l'existant au 1er janvier de l'année.
     */
    private Integer calculerExistantDebutAnnee(
            Materiel materiel,
            Integer annee
    ) {

        Integer anneeInitiale =
                materiel.getAnneeInitiale();

        if (anneeInitiale == null) {
            return 0;
        }

        /*
         * Le matériel n'existait pas encore.
         */
        if (annee < anneeInitiale) {
            return 0;
        }

        /*
         * Quantité de départ du matériel.
         */
        int stock = materiel.getQuantiteInitiale() != null
                ? materiel.getQuantiteInitiale()
                : 0;

        /*
         * Pour une année postérieure,
         * on additionne les entrées précédentes
         * et on retire les sorties précédentes.
         */
        if (annee > anneeInitiale) {

            List<MaterielEntree> entrees =
                    materielEntreeRepository
                            .findByMateriel_IdOrderByDateEntreeAsc(
                                    materiel.getId()
                            );

            for (MaterielEntree entree : entrees) {
                if (entree.getAnnee() < annee) {
                    stock += entree.getQuantite();
                }
            }

            List<MaterielSortie> sorties =
                    materielSortieRepository
                            .findByMateriel_IdOrderByDateSortieAsc(
                                    materiel.getId()
                            );

            for (MaterielSortie sortie : sorties) {
                if (sortie.getAnnee() < annee) {
                    stock -= sortie.getQuantite();
                }
            }
        }

        return Math.max(stock, 0);
    }

    /**
     * Recalcule les données annuelles.
     */
    private int recalculerInventaire(
        MaterielInventaireAnnuel inventaire
    ) {
        Materiel materiel =
                inventaire.getMateriel();

        Long materielId =
                materiel.getId();

        Integer annee =
                inventaire.getAnnee();

        /*
         * L'existant de N est calculé à partir
         * de tout ce qui s'est passé avant N.
         */
        int existant =
                calculerExistantDebutAnnee(
                        materiel,
                        annee
                );

        /*
         * Entrées uniquement de l'année N.
         */
        int totalEntrees =
                materielEntreeRepository
                        .findByMateriel_IdAndAnneeOrderByDateEntreeAsc(
                                materielId,
                                annee
                        )
                        .stream()
                        .mapToInt(MaterielEntree::getQuantite)
                        .sum();

        /*
         * Sorties uniquement de l'année N.
         */
        int totalSorties =
                materielSortieRepository
                        .findByMateriel_IdAndAnneeOrderByDateSortieAsc(
                                materielId,
                                annee
                        )
                        .stream()
                        .mapToInt(MaterielSortie::getQuantite)
                        .sum();

        /*
         * Mise à jour de l'existant annuel.
         */
        inventaire.setExistantDebutAnnee(
                existant
        );

        /*
         * Calcul du stock final.
         */
        int reste =
                existant
                        + totalEntrees
                        - totalSorties;

        if (reste < 0) {
            throw new IllegalStateException(
                    "Le stock du matériel devient négatif."
            );
        }

        inventaireRepository.save(inventaire);

        return reste;
        }

    /**
     * Construit la réponse destinée au frontend.
     */
    private MaterielInventaireResponse construireResponse(
            MaterielInventaireAnnuel inventaire
    ) {

        Materiel materiel =
                inventaire.getMateriel();

        Integer annee =
                inventaire.getAnnee();

        List<MaterielEntree> entrees =
                materielEntreeRepository
                        .findByMateriel_IdAndAnneeOrderByDateEntreeAsc(
                                materiel.getId(),
                                annee
                        );

        List<MaterielSortie> sorties =
                materielSortieRepository
                        .findByMateriel_IdAndAnneeOrderByDateSortieAsc(
                                materiel.getId(),
                                annee
                        );

        int totalEntrees = entrees.stream()
                .mapToInt(MaterielEntree::getQuantite)
                .sum();

        int totalSorties = sorties.stream()
                .mapToInt(MaterielSortie::getQuantite)
                .sum();

        int existant =
                inventaire.getExistantDebutAnnee() != null
                        ? inventaire.getExistantDebutAnnee()
                        : 0;

        int reste =
                existant
                        + totalEntrees
                        - totalSorties;
        BigDecimal prixUnitaire =
        inventaire.getPrixUnitaire() != null
                ? inventaire.getPrixUnitaire()
                : materiel.getPrixUnitaire() != null
                    ? materiel.getPrixUnitaire()
                    : BigDecimal.ZERO;

        BigDecimal decompte =
                prixUnitaire.multiply(
                        BigDecimal.valueOf(reste)
                );

        return MaterielInventaireResponse.builder()
                .id(inventaire.getId())
                .materielId(materiel.getId())

                .soaId(
                        materiel.getCodeSoa() != null
                                ? materiel.getCodeSoa().getId()
                                : null
                )

                .codeSoa(
                        materiel.getCodeSoa() != null
                                ? materiel.getCodeSoa().getCodeSoa()
                                : null
                )

                .nomenclatureId(
                        materiel.getNomenclature() != null
                                ? materiel.getNomenclature().getId()
                                : null
                )

                .nomenclatureNumero(
                        materiel.getNomenclature() != null
                                ? materiel.getNomenclature().getNumero()
                                : null
                )

                .nomenclatureDesignation(
                        materiel.getNomenclature() != null
                                ? materiel.getNomenclature().getDesignation()
                                : null
                )

                .designation(
                        materiel.getDesignation()
                )

                .especeUnite(
                        materiel.getEspeceUnite()
                )

                .prixUnitaire(prixUnitaire)

                .annee(annee)

                .existantDebutAnnee(existant)

                .entreesAnnee(totalEntrees)

                .sortiesAnnee(totalSorties)

                .resteFinAnnee(reste)

                .decompte(decompte)

                .observation(
                        inventaire.getObservation()
                )

                .build();
    }

    private void validerEntreeRequest(
            MaterielEntreeRequest request
    ) {

        if (request.getSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le code SOA est obligatoire."
            );
        }

        if (request.getNomenclatureId() == null) {
            throw new IllegalArgumentException(
                    "La nomenclature est obligatoire."
            );
        }

        if (request.getDesignation() == null
                || request.getDesignation().isBlank()) {

            throw new IllegalArgumentException(
                    "La désignation est obligatoire."
            );
        }

        if (request.getEspeceUnite() == null
                || request.getEspeceUnite().isBlank()) {

            throw new IllegalArgumentException(
                    "L'espèce des unités est obligatoire."
            );
        }

        if (request.getPrixUnitaire() == null
                || request.getPrixUnitaire()
                .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Le prix unitaire est invalide."
            );
        }

        if (request.getQuantite() == null
                || request.getQuantite() <= 0) {

            throw new IllegalArgumentException(
                    "La quantité doit être supérieure à zéro."
            );
        }

        if (request.getDateEntree() == null) {
            throw new IllegalArgumentException(
                    "La date d'entrée est obligatoire."
            );
        }

        if (request.getAnnee() == null) {
            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }
    }

    private void validerSortieRequest(
            MaterielSortieRequest request
    ) {

        if (request.getMaterielId() == null) {
            throw new IllegalArgumentException(
                    "Le matériel est obligatoire."
            );
        }

        if (request.getQuantite() == null
                || request.getQuantite() <= 0) {

            throw new IllegalArgumentException(
                    "La quantité à sortir doit être supérieure à zéro."
            );
        }

        if (request.getDateSortie() == null) {
            throw new IllegalArgumentException(
                    "La date de sortie est obligatoire."
            );
        }

        if (request.getAnnee() == null) {
            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }

        if (request.getDateSortie().getYear()
                != request.getAnnee()) {

            throw new IllegalArgumentException(
                    "L'année de la sortie ne correspond pas à la date."
            );
        }
    }
    
    //Modification des inventaires
        // =========================================================================
    // FIX INDUSTRIEL : DOUBLE MISE A JOUR SYNCHRONE MATÉRIEL + INVENTAIRE ANNUEL
    // =========================================================================
    @Transactional
    public MaterielInventaireResponse modifierInventaireComplet(
            Long inventaireId,
            MaterielEntreeRequest request
    ) {
        // 1. Récupérer l'inventaire annuel d'exercice
        MaterielInventaireAnnuel inventaire = inventaireRepository.findById(inventaireId)
                .orElseThrow(() -> new IllegalArgumentException("Inventaire annuel introuvable : " + inventaireId));

        // 2. Récupérer le matériel racine rattaché
        Materiel materiel = inventaire.getMateriel();
        if (materiel == null) {
            throw new IllegalArgumentException("Matériel racine introuvable pour cet inventaire.");
        }

        // 3. Alignement des données de référence issues du fichier Excel
        if (request.getDesignation() != null && !request.getDesignation().isBlank()) {
            materiel.setDesignation(request.getDesignation().trim());
        }
        if (request.getEspeceUnite() != null && !request.getEspeceUnite().isBlank()) {
            materiel.setEspeceUnite(request.getEspeceUnite().trim());
        }
        if (request.getPrixUnitaire() != null) {
            materiel.setPrixUnitaire(request.getPrixUnitaire());
            inventaire.setPrixUnitaire(request.getPrixUnitaire()); // Aligne le prix sur l'exercice
        }

        // Sauvegarde du matériel d'origine
        materielRepository.save(materiel);

        // 4. Alignement de la remarque d'inventaire
        inventaire.setObservation(request.getObservation() != null ? request.getObservation().trim() : null);
        
        // 5. Forcer le re-calcul comptable officiel des entrées/sorties et restes
        recalculerInventaire(inventaire);
        inventaireRepository.save(inventaire);

        return construireResponse(inventaire);
    }
    
    public long compterMaterielsActifsParSoa(Long soaId) {
        if (soaId == null) {
            return 0L;
        }
        // Utilise STRICTEMENT la méthode définie dans votre MaterielRepository
        return materielRepository.countByCodeSoa_IdAndActifTrue(soaId);
    }
    
    /**
    * Supprime physiquement une ligne d'inventaire annuel spécifique.
    */
    @Transactional
    public void supprimerInventaireAnnuel(Long inventaireId) {
        MaterielInventaireAnnuel inventaire = inventaireRepository.findById(inventaireId)
                .orElseThrow(() -> new IllegalArgumentException("Ligne d'inventaire introuvable avec l'ID : " + inventaireId));
        
        inventaireRepository.delete(inventaire);
        inventaireRepository.flush();
    }


    
    public void supprimerMateriel(Long id) {

    Materiel materiel =
            materielRepository.findById(id)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Matériel introuvable : " + id
                            )
                    );

    materiel.setActif(false);

    materielRepository.save(materiel);
    }
    
    @Transactional(readOnly = true)
    public long countBySoaId(Long soaId) {
        return materielRepository.countByCodeSoa_IdAndActifTrue(soaId);
    }
}
