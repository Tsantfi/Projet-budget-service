package mg.drbf.haigana.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.RecensementRequest;
import mg.drbf.haigana.dto.RecensementResponse;
import mg.drbf.haigana.dto.RecensementVehiculeResponse;
import mg.drbf.haigana.dto.RecensementVehiculeRequest;
import mg.drbf.haigana.entity.Condamnation;
import mg.drbf.haigana.entity.Detenteur;
import mg.drbf.haigana.entity.Entree;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.entity.Recensement;
import mg.drbf.haigana.entity.RecensementVehicule;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.CondamnationRepository;
import mg.drbf.haigana.repository.EntreeRepository;
import mg.drbf.haigana.repository.RecensementRepository;
import mg.drbf.haigana.repository.RecensementVehiculeRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.function.Function;

@RestController
@RequestMapping("/api/recensements")
@RequiredArgsConstructor
public class RecensementController {

    private final RecensementRepository recensementRepository;
    private final RecensementVehiculeRepository recensementVehiculeRepository;
    private final CondamnationRepository condamnationRepository;
    private final EntreeRepository entreeRepository;
    private final VehiculeRepository vehiculeRepository;
    private final SoaCodeRepository soaCodeRepository;


    // PRÉPARER LE RECENSEMENT

    @PostMapping("/preparer")
    @Transactional
    public RecensementResponse preparer(
            @RequestBody RecensementRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du recensement sont obligatoires."
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

        if (request.getAnnee() < 2000 ||
                request.getAnnee() > 2100) {

            throw new IllegalArgumentException(
                    "L'année du recensement est invalide."
            );
        }

        SoaCode soa =
                soaCodeRepository
                        .findById(request.getSoaId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + request.getSoaId()
                                )
                        );


        // RECENSEMENT EXISTANT

        Optional<Recensement> existant =
                recensementRepository
                        .findByAnneeAndSoa_Id(
                                request.getAnnee(),
                                request.getSoaId()
                        );

        if (existant.isPresent()) {

            Recensement recensementExistant =
                    existant.get();

            /*
             * IMPORTANT :
             *
             * Même si le recensement existe déjà,
             * on recalcule son contenu.
             *
             * Les snapshots existants ne sont PAS remplacés.
             */
            List<RecensementVehicule> snapshotsActualises =
                    actualiserComparaison(
                            recensementExistant,
                            request.getAnnee(),
                            request.getSoaId()
                    );

            System.out.println(
                    "Chargement du recensement existant ID: "
                            + recensementExistant.getId()
                            + " — Nombre de véhicules: "
                            + snapshotsActualises.size()
            );

            return construireResponse(
                    recensementExistant,
                    snapshotsActualises
            );
        }


        // CRÉATION DU RECENSEMENT

        Recensement recensement =
                Recensement.builder()
                        .annee(request.getAnnee())
                        .ministere(request.getMinistere())
                        .niveau(request.getNiveau())
                        .directionService(
                                request.getDirectionService()
                        )
                        .directionServiceRecensement(
                                request.getDirectionServiceRecensement()
                        )
                        .objet(request.getObjet())
                        .nomPrenomResponsable(
                                request.getNomPrenomResponsable()
                        )
                        .fonctionResponsable(
                                request.getFonctionResponsable()
                        )
                        .telephoneResponsable(
                                request.getTelephoneResponsable()
                        )
                        .emailResponsable(
                                request.getEmailResponsable()
                        )
                        .detenteurEffectif(
                                request.getDetenteurEffectif()
                        )
                        .soa(soa)
                        .valide(false)
                        .build();


        recensement =
                recensementRepository.saveAndFlush(
                        recensement
                );


        // INITIALISATION À PARTIR DE LA BDD VEHICULE

        List<RecensementVehicule> resultatInitial =
                actualiserComparaison(
                        recensement,
                        request.getAnnee(),
                        request.getSoaId()
                );


        return construireResponse(
                recensement,
                resultatInitial
        );
    }
    
    @PutMapping("/{id}/valider")
    @Transactional
    public RecensementResponse validerRecensement(
            @PathVariable Long id
    ) {
        Recensement recensement = recensementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Recensement introuvable : " + id
                        )
                );

        // Déjà validé : on retourne simplement son état actuel
        if (Boolean.TRUE.equals(recensement.getValide())) {

            List<RecensementVehicule> snapshots =
                    recensementVehiculeRepository
                            .findByRecensement_Id(id);

            return construireResponse(recensement, snapshots);
        }

        // Validation du recensement
        recensement.setValide(true);

        recensementRepository.save(recensement);
        recensementRepository.flush();

        // Recharger les véhicules du recensement
        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository
                        .findByRecensement_Id(id);

        return construireResponse(recensement, snapshots);
    }

    // MOTEUR DE RECENSEMENT
    // date de prise en charge <= année recensement
    // ET
    // année recensement < année condamnation

    private List<RecensementVehicule> actualiserComparaison(
            Recensement recensement,
            int annee,
            Long soaId
    ) {

        if (recensement == null) {
            return new ArrayList<>();
        }

        // 1. SNAPSHOTS EXISTANTS

        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensement.getId()
                        );

        if (snapshots == null) {
            snapshots = new ArrayList<>();
        }


        // 2. VÉHICULES ACTUELS

        List<Vehicule> vehiculesActuels =
                vehiculeRepository.findByCodeSoa_Id(soaId);

        if (vehiculesActuels == null) {
            vehiculesActuels = new ArrayList<>();
        }


        // 3. INDEX DES VÉHICULES ACTUELS

        Map<Long, Vehicule> vehiculeParId =
                vehiculesActuels.stream()
                        .filter(Objects::nonNull)
                        .filter(v -> v.getId() != null)
                        .collect(Collectors.toMap(
                                Vehicule::getId,
                                Function.identity(),
                                (a, b) -> a
                        ));

        Map<String, Vehicule> vehiculeParImmatriculation =
                vehiculesActuels.stream()
                        .filter(Objects::nonNull)
                        .filter(v ->
                                v.getImmatricule() != null
                        )
                        .collect(Collectors.toMap(
                                v -> normaliserImmatriculation(
                                        v.getImmatricule()
                                ),
                                Function.identity(),
                                (a, b) -> a
                        ));


        // 4. TRAITER LES SNAPSHOTS EXISTANTS

        Iterator<RecensementVehicule> iterator =
                snapshots.iterator();

        while (iterator.hasNext()) {

            RecensementVehicule snapshot =
                    iterator.next();

            if (snapshot == null) {
                iterator.remove();
                continue;
            }

            String immatriculation =
                    normaliserImmatriculation(
                            snapshot.getImmatriculation()
                    );

            Vehicule vehiculeActuel = null;


            // ====================================================
            // 4.1 PRIORITÉ À vehiculeIdOrigine
            // ====================================================

            if (snapshot.getVehiculeIdOrigine() != null) {

                vehiculeActuel =
                        vehiculeParId.get(
                                snapshot.getVehiculeIdOrigine()
                        );
            }


            // ====================================================
            // 4.2 ANCIENNES DONNÉES : vehicule_id
            // ====================================================

            if (vehiculeActuel == null
                    && snapshot.getVehicule() != null
                    && snapshot.getVehicule().getId() != null) {

                vehiculeActuel =
                        vehiculeParId.get(
                                snapshot.getVehicule().getId()
                        );
            }


            // ====================================================
            // 4.3 DERNIER RECOURS : IMMATRICULATION
            // ====================================================

            if (vehiculeActuel == null
                    && immatriculation != null) {

                vehiculeActuel =
                        vehiculeParImmatriculation.get(
                                immatriculation
                        );
            }


            // ====================================================
            // 4.4 COMPLÉTER vehiculeIdOrigine
            //     POUR LES ANCIENNES DONNÉES
            // ====================================================
            
            Map<Long, RecensementVehicule> snapshotParVehiculeIdOrigine =
            snapshots.stream()
                .filter(Objects::nonNull)
                .filter(rv ->
                        rv.getVehicule() != null
                                && rv.getVehicule().getId() != null
                )
                .collect(Collectors.toMap(
                        rv -> rv.getVehicule().getId(),
                        Function.identity(),
                        (a, b) -> a
                ));

            if (vehiculeActuel != null
                    && snapshot.getVehiculeIdOrigine() == null
                    && vehiculeActuel.getId() != null) {

                snapshot.setVehiculeIdOrigine(
                        vehiculeActuel.getId()
                );
                snapshotParVehiculeIdOrigine.put(
                        vehiculeActuel.getId(),
                        snapshot
                );
                        }
            
            

            // ====================================================
            // 4.5 LE VÉHICULE EXISTE ENCORE
            // ====================================================
            if (vehiculeActuel != null) {

                Integer anneeCirculation =
                        trouverAnneeCirculation(
                                vehiculeActuel
                        );


                // ------------------------------------------------
                // LE VÉHICULE N'EXISTAIT PAS ENCORE CETTE ANNÉE
                // ------------------------------------------------

                if (anneeCirculation != null
                        && annee < anneeCirculation) {

                    /*
                     * Exemple :
                     *
                     * dateCirculation = 2024
                     * recensement = 2023
                     *
                     * Le véhicule ne doit pas apparaître.
                     */
                    recensementVehiculeRepository.delete(
                            snapshot
                    );

                    iterator.remove();

                    continue;
                }


                // ------------------------------------------------
                // COMPARAISON AVEC LE VÉHICULE ACTUEL
                // ------------------------------------------------

                List<String> champsModifies =
                        trouverChampsModifies(
                                snapshot,
                                vehiculeActuel
                        );


                if (champsModifies.isEmpty()) {

                    /*
                     * L'année de circulation est l'année
                     * de naissance du véhicule dans le recensement.
                     *
                     * Exemple :
                     *
                     * 2024 → NOUVEAU
                     * 2025 → IDENTIQUE
                     * 2026 → IDENTIQUE
                     */

                    if (anneeCirculation != null
                            && annee == anneeCirculation
                            && "NOUVEAU".equalsIgnoreCase(
                                    snapshot.getStatut()
                            )) {

                        snapshot.setStatut("NOUVEAU");

                    } else {

                        snapshot.setStatut("IDENTIQUE");
                    }

                    snapshot.setActif(true);

                    snapshot.setChampsModifies(
                            new ArrayList<>()
                    );

                } else {

                    snapshot.setStatut("MODIFIE");

                    snapshot.setActif(true);

                    snapshot.setChampsModifies(
                            champsModifies
                    );
                }

                continue;
            }


            // ====================================================
            // 4.6 LE VÉHICULE N'EXISTE PLUS
            // ====================================================

            Optional<Condamnation> condamnationOpt =
                    condamnationRepository
                            .findFirstByImmatriculeVehiculeOrderByDateCondamnationAsc(
                                    immatriculation
                            );

            if (condamnationOpt.isPresent()) {

                Condamnation condamnation =
                        condamnationOpt.get();

                LocalDate dateCondamnation =
                        condamnation.getDateCondamnation();

                if (dateCondamnation != null
                        && annee >=
                        dateCondamnation.getYear()) {

                    snapshot.setStatut("ABSENT");
                    snapshot.setActif(false);
                    snapshot.setChampsModifies(
                            new ArrayList<>()
                    );
                }
            }
        }


        // 5. RECONSTRUIRE LES INDEX DES SNAPSHOTS

        Map<Long, RecensementVehicule>
                snapshotParVehiculeIdOrigine =
                snapshots.stream()
                        .filter(Objects::nonNull)
                        .filter(rv ->
                                rv.getVehiculeIdOrigine() != null
                        )
                        .collect(Collectors.toMap(
                                RecensementVehicule
                                        ::getVehiculeIdOrigine,
                                Function.identity(),
                                (a, b) -> a
                        ));

        Map<String, RecensementVehicule>
                snapshotParImmatriculation =
                snapshots.stream()
                        .filter(Objects::nonNull)
                        .filter(rv ->
                                rv.getImmatriculation() != null
                        )
                        .collect(Collectors.toMap(
                                rv ->
                                        normaliserImmatriculation(
                                                rv.getImmatriculation()
                                        ),
                                Function.identity(),
                                (a, b) -> a
                        ));

    // ========================================================
    // 6. CRÉER LES SNAPSHOTS MANQUANTS
    // ========================================================

    for (Vehicule vehicule : vehiculesActuels) {

        if (vehicule == null
                || vehicule.getId() == null) {
            continue;
        }

        Long vehiculeId =
                vehicule.getId();

        String immatriculation =
                normaliserImmatriculation(
                        vehicule.getImmatricule()
                );


        // ====================================================
        // 6.1 DÉJÀ PRÉSENT DANS LE RECENSEMENT
        // ====================================================

        if (snapshotParVehiculeIdOrigine
                .containsKey(vehiculeId)) {

            continue;
        }    

        // ====================================================
        // 6.2 COMPATIBILITÉ AVEC ANCIENNES DONNÉES
        // ====================================================

        if (immatriculation != null
                && snapshotParImmatriculation
                        .containsKey(immatriculation)) {

            continue;
        }


        // ====================================================
        // 6.3 ANNÉE DE CIRCULATION
        // ====================================================

        Integer anneeCirculation =
                trouverAnneeCirculation(
                        vehicule
                );

        /*
         * Sans date de circulation, impossible de déterminer
         * l'année de naissance du véhicule.
         */
        if (anneeCirculation == null) {
            continue;
        }


        // ====================================================
        // 6.4 LE VÉHICULE N'EXISTAIT PAS ENCORE
        // ====================================================

        if (annee < anneeCirculation) {
            continue;
        }


        // ====================================================
        // 6.5 CHERCHER SI LE VÉHICULE A DÉJÀ ÉTÉ "NOUVEAU"
        // ====================================================

        List<RecensementVehicule> historiqueNouveau =
                recensementVehiculeRepository
                        .findHistoriqueNouveau(
                                vehiculeId
                        );

        boolean dejaNouveauDansHistorique =
                historiqueNouveau != null
                        && !historiqueNouveau.isEmpty();


        // ====================================================
        // 6.6 CRÉER LE SNAPSHOT
        // ====================================================

        RecensementVehicule nouveau =
                construireSnapshotDepuisVehicule(
                        recensement,
                        vehicule
                );


        /*
         * Première année de circulation :
         *
         * 2024 → NOUVEAU
         *
         * Années suivantes :
         *
         * 2025 → IDENTIQUE
         * 2026 → IDENTIQUE
         */
        if (!dejaNouveauDansHistorique
                && annee == anneeCirculation) {

            nouveau.setStatut("NOUVEAU");

        } else {

            nouveau.setStatut("IDENTIQUE");
        }


        nouveau.setActif(true);

        nouveau.setChampsModifies(
                new ArrayList<>()
        );

        nouveau.setVehiculeIdOrigine(
                vehiculeId
        );


        // ====================================================
        // 6.7 SAUVEGARDER
        // ====================================================

        RecensementVehicule sauvegarde =
                recensementVehiculeRepository.save(
                        nouveau
                );

        snapshots.add(sauvegarde);

        snapshotParVehiculeIdOrigine.put(
                vehiculeId,
                sauvegarde
        );

        if (immatriculation != null) {

            snapshotParImmatriculation.put(
                    immatriculation,
                    sauvegarde
            );
        }
    }


        // 7. SAUVEGARDE FINALE

        return recensementVehiculeRepository.saveAll(
                snapshots
        );
    }
    
    private Integer trouverAnneeCirculation(Vehicule vehicule) {

    if (vehicule == null
            || vehicule.getDateCirculation() == null) {
        return null;
    }

    return vehicule.getDateCirculation().getYear();
    }
    
    private RecensementVehicule construireSnapshotDepuisVehicule(
            Recensement recensement,
            Vehicule vehicule
    ) {

        String codeSoa = null;

        if (vehicule.getCodeSoa() != null) {
            codeSoa =
                    vehicule.getCodeSoa().getCodeSoa();
        }

        String marque =
                vehicule.getMarque() == null
                        ? null
                        : vehicule.getMarque()
                                .getMarqueVehicule();

        String type =
                vehicule.getType() == null
                        ? null
                        : vehicule.getType()
                                .getTypeDuVehicule();

        String genre =
                vehicule.getGenre() == null
                        ? null
                        : vehicule.getGenre()
                                .getGenreVehicule();

        String sourceEnergie =
                vehicule.getCarburant() == null
                        ? null
                        : vehicule.getCarburant()
                                .getLibelle();

        String etatGeneral =
                vehicule.getEtat() == null
                        ? null
                        : vehicule.getEtat()
                                .getEtatVehicule();

        Integer anneeMiseCirculation =
                vehicule.getDateCirculation() == null
                        ? null
                        : vehicule.getDateCirculation()
                                .getYear();

        String detenteurEffectif =
                construireDetenteur(
                        vehicule
                );

        return RecensementVehicule.builder()
                .codeSoa(codeSoa)
                .immatriculation(
                        normaliserImmatriculation(
                                vehicule.getImmatricule()
                        )
                )
                .marque(marque)
                .type(type)
                .genre(genre)
                .sourceEnergie(sourceEnergie)
                .categorie(
                        vehicule.getCategorie()
                )
                .anneeMiseCirculation(
                        anneeMiseCirculation
                )
                .etatGeneral(etatGeneral)
                .carteGriseDisponible(
                        vehicule.getCarteGriseDisponible()
                )
                .detenteurEffectif(
                        detenteurEffectif
                )
                .actif(true)
                .statut(null)
                .recensement(recensement)

                // IDENTIFIANT HISTORIQUE
                .vehiculeIdOrigine(
                        vehicule.getId()
                )

                .vehicule(vehicule)
                .build();
    }
    
    private Integer trouverAnneeCondamnation(
        Vehicule vehicule
    ) {

        if (vehicule == null ||
                vehicule.getImmatricule() == null) {

            return null;
        }

        Optional<Condamnation> condamnation =
                condamnationRepository
                        .findByImmatriculeVehicule(
                                vehicule.getImmatricule()
                        );

        if (condamnation.isEmpty() ||
                condamnation.get().getDateCondamnation() == null) {

            return null;
        }

        return condamnation
                .get()
                .getDateCondamnation()
                .getYear();
    }

    // DATE DE PRISE EN CHARGE

    private LocalDate trouverDatePriseEnCharge(
            Vehicule vehicule
    ) {

        if (vehicule == null ||
                vehicule.getId() == null) {

            return null;
        }

        List<Entree> entrees =
                entreeRepository
                        .findByVehicule_IdOrderByDateEntreeAsc(
                                vehicule.getId()
                        );

        if (entrees == null ||
                entrees.isEmpty()) {

            return null;
        }

        return entrees.stream()
                .map(Entree::getDateEntree)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);
    }


    // COMPARAISON SNAPSHOT ↔ BDD

    private List<String> trouverChampsModifies(
            RecensementVehicule ancien,
            Vehicule actuel
    ) {

        List<String> champsModifies =
                new ArrayList<>();


        // IMMATRICULATION

        if (!memeValeur(
                ancien.getImmatriculation(),
                actuel.getImmatricule()
        )) {

            champsModifies.add(
                    "immatriculation"
            );
        }


        // MARQUE

        String marqueActuelle =
                actuel.getMarque() == null
                        ? null
                        : actuel.getMarque()
                                .getMarqueVehicule();

        if (!memeValeur(
                ancien.getMarque(),
                marqueActuelle
        )) {

            champsModifies.add(
                    "marque"
            );
        }


        // TYPE

        String typeActuel =
                actuel.getType() == null
                        ? null
                        : actuel.getType()
                                .getTypeDuVehicule();

        if (!memeValeur(
                ancien.getType(),
                typeActuel
        )) {

            champsModifies.add(
                    "type"
            );
        }


        // GENRE

        String genreActuel =
                actuel.getGenre() == null
                        ? null
                        : actuel.getGenre()
                                .getGenreVehicule();

        if (!memeValeur(
                ancien.getGenre(),
                genreActuel
        )) {

            champsModifies.add(
                    "genre"
            );
        }


        // SOURCE ÉNERGIE

        String sourceEnergieActuelle =
                actuel.getCarburant() == null
                        ? null
                        : actuel.getCarburant()
                                .getLibelle();

        if (!memeValeur(
                ancien.getSourceEnergie(),
                sourceEnergieActuelle
        )) {

            champsModifies.add(
                    "sourceEnergie"
            );
        }


        // CATÉGORIE

        if (!memeValeur(
                ancien.getCategorie(),
                actuel.getCategorie()
        )) {

            champsModifies.add(
                    "categorie"
            );
        }


        // ANNÉE MISE EN CIRCULATION

        Integer anneeActuelle =
                actuel.getDateCirculation() == null
                        ? null
                        : actuel.getDateCirculation()
                                .getYear();

        if (!Objects.equals(
                ancien.getAnneeMiseCirculation(),
                anneeActuelle
        )) {

            champsModifies.add(
                    "anneeMiseCirculation"
            );
        }


        // ÉTAT GÉNÉRAL

        String etatActuel =
                actuel.getEtat() == null
                        ? null
                        : actuel.getEtat()
                                .getEtatVehicule();

        if (!memeValeur(
                ancien.getEtatGeneral(),
                etatActuel
        )) {

            champsModifies.add(
                    "etatGeneral"
            );
        }


        // CARTE GRISE

        if (!Objects.equals(
                ancien.getCarteGriseDisponible(),
                actuel.getCarteGriseDisponible()
        )) {

            champsModifies.add(
                    "carteGriseDisponible"
            );
        }


        // DÉTENTEUR

        String detenteurActuel =
                construireDetenteur(
                        actuel
                );

        if (!memeValeur(
                ancien.getDetenteurEffectif(),
                detenteurActuel
        )) {

            champsModifies.add(
                    "detenteurEffectif"
            );
        }


        return champsModifies;
    }


    // COMPARAISON DE VALEURS

    private boolean memeValeur(
            Object ancienne,
            Object nouvelle
    ) {

        String ancienneValeur =
                ancienne == null
                        ? ""
                        : ancienne.toString()
                                .trim()
                                .toLowerCase();

        String nouvelleValeur =
                nouvelle == null
                        ? ""
                        : nouvelle.toString()
                                .trim()
                                .toLowerCase();

        return ancienneValeur.equals(
                nouvelleValeur
        );
    }


    // CRÉER UN SNAPSHOT

    private RecensementVehicule creerSnapshot(
            Vehicule vehicule,
            Recensement recensement,
            String statut
    ) {

        return RecensementVehicule.builder()

                .codeSoa(
                        vehicule.getCodeSoa() == null
                                ? null
                                : vehicule.getCodeSoa()
                                        .getCodeSoa()
                )

                .immatriculation(
                        normaliser(
                                vehicule.getImmatricule()
                        )
                )

                .marque(
                        vehicule.getMarque() == null
                                ? null
                                : vehicule.getMarque()
                                        .getMarqueVehicule()
                )

                .type(
                        vehicule.getType() == null
                                ? null
                                : vehicule.getType()
                                        .getTypeDuVehicule()
                )

                .genre(
                        vehicule.getGenre() == null
                                ? null
                                : vehicule.getGenre()
                                        .getGenreVehicule()
                )

                .sourceEnergie(
                        vehicule.getCarburant() == null
                                ? null
                                : vehicule.getCarburant()
                                        .getLibelle()
                )

                .categorie(
                        vehicule.getCategorie()
                )

                .anneeMiseCirculation(
                        vehicule.getDateCirculation() == null
                                ? null
                                : vehicule
                                        .getDateCirculation()
                                        .getYear()
                )

                .etatGeneral(
                        vehicule.getEtat() == null
                                ? null
                                : vehicule.getEtat()
                                        .getEtatVehicule()
                )

                .carteGriseDisponible(
                        vehicule.getCarteGriseDisponible()
                )

                .detenteurEffectif(
                        construireDetenteur(
                                vehicule
                        )
                )

                .actif(
                        !"ABSENT".equalsIgnoreCase(
                                statut
                        )
                )

                .statut(statut)

                .recensement(
                        recensement
                )

                .vehicule(
                        "ABSENT".equalsIgnoreCase(statut)
                                ? null
                                : vehicule
                )

                .build();
    }


    // COPIE D'UN ANCIEN SNAPSHOT

    private RecensementVehicule creerSnapshotDepuisAncien(
            RecensementVehicule ancien,
            Recensement recensement,
            String statut
    ) {

        return RecensementVehicule.builder()

                .codeSoa(
                        ancien.getCodeSoa()
                )

                .immatriculation(
                        normaliser(
                                ancien.getImmatriculation()
                        )
                )

                .marque(
                        ancien.getMarque()
                )

                .type(
                        ancien.getType()
                )

                .genre(
                        ancien.getGenre()
                )

                .sourceEnergie(
                        ancien.getSourceEnergie()
                )

                .categorie(
                        ancien.getCategorie()
                )

                .anneeMiseCirculation(
                        ancien.getAnneeMiseCirculation()
                )

                .etatGeneral(
                        ancien.getEtatGeneral()
                )

                .carteGriseDisponible(
                        ancien.getCarteGriseDisponible()
                )

                .detenteurEffectif(
                        ancien.getDetenteurEffectif()
                )

                .actif(true)

                .statut(statut)

                .recensement(
                        recensement
                )

                .vehicule(null)

                .build();
    }


    // CRÉER SNAPSHOT ABSENT

    private RecensementVehicule creerSnapshotAbsent(
            RecensementVehicule ancien,
            Recensement recensement
    ) {

        RecensementVehicule absent =
                creerSnapshotDepuisAncien(
                        ancien,
                        recensement,
                        "ABSENT"
                );

        absent.setActif(false);
        absent.setVehicule(null);
        absent.setChampsModifies(
                new ArrayList<>()
        );

        return absent;
    }


    // METTRE SNAPSHOT ABSENT

    private void mettreSnapshotAbsent(
            RecensementVehicule snapshot,
            RecensementVehicule ancien
    ) {

        snapshot.setCodeSoa(
                ancien.getCodeSoa()
        );

        snapshot.setImmatriculation(
                normaliser(
                        ancien.getImmatriculation()
                )
        );

        snapshot.setMarque(
                ancien.getMarque()
        );

        snapshot.setType(
                ancien.getType()
        );

        snapshot.setGenre(
                ancien.getGenre()
        );

        snapshot.setSourceEnergie(
                ancien.getSourceEnergie()
        );

        snapshot.setCategorie(
                ancien.getCategorie()
        );

        snapshot.setAnneeMiseCirculation(
                ancien.getAnneeMiseCirculation()
        );

        snapshot.setEtatGeneral(
                ancien.getEtatGeneral()
        );

        snapshot.setCarteGriseDisponible(
                ancien.getCarteGriseDisponible()
        );

        snapshot.setDetenteurEffectif(
                ancien.getDetenteurEffectif()
        );

        snapshot.setActif(false);

        snapshot.setStatut(
                "ABSENT"
        );

        snapshot.setVehicule(null);

        snapshot.setChampsModifies(
                new ArrayList<>()
        );
    }


    // AJOUTER MANUELLEMENT UN VÉHICULE

    @PostMapping("/{recensementId}/vehicules")
    @Transactional
    public RecensementResponse ajouterVehicule(
            @PathVariable Long recensementId,
            @RequestBody RecensementVehiculeResponse request
    ) {

        Recensement recensement =
                recensementRepository
                        .findById(recensementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + recensementId
                                )
                        );


        if (request == null ||
                request.getImmatriculation() == null ||
                request.getImmatriculation().isBlank()) {

            throw new IllegalArgumentException(
                    "L'immatriculation du véhicule est obligatoire."
            );
        }


        String immatriculation =
                normaliser(
                        request.getImmatriculation()
                );


        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensementId
                        );


        boolean existeDeja =
                snapshots.stream()
                        .anyMatch(
                                v -> immatriculation.equals(
                                        normaliser(
                                                v.getImmatriculation()
                                        )
                                )
                        );


        if (existeDeja) {

            throw new IllegalStateException(
                    "Ce véhicule a déjà été ajouté à ce recensement."
            );
        }


        Vehicule vehiculeParc = null;


        if (request.getVehiculeId() != null) {

            vehiculeParc =
                    vehiculeRepository
                            .findById(
                                    request.getVehiculeId()
                            )
                            .orElse(null);
        }


        RecensementVehicule nouveauSnapshot;


        if (vehiculeParc != null) {

            nouveauSnapshot =
                    creerSnapshot(
                            vehiculeParc,
                            recensement,
                            "IDENTIQUE"
                    );

        } else {

            nouveauSnapshot =
                    RecensementVehicule.builder()

                            .codeSoa(
                                    request.getCodeSoa()
                            )

                            .immatriculation(
                                    immatriculation
                            )

                            .marque(
                                    request.getMarque()
                            )

                            .type(
                                    request.getType()
                            )

                            .genre(
                                    request.getGenre()
                            )

                            .sourceEnergie(
                                    request.getSourceEnergie()
                            )

                            .categorie(
                                    request.getCategorie()
                            )

                            .anneeMiseCirculation(
                                    request.getAnneeMiseCirculation()
                            )

                            .etatGeneral(
                                    request.getEtatGeneral()
                            )

                            .carteGriseDisponible(
                                    request.getCarteGriseDisponible()
                            )

                            .detenteurEffectif(
                                    request.getDetenteurEffectif()
                            )

                            .actif(true)

                            .statut(
                                    "IDENTIQUE"
                            )

                            .recensement(
                                    recensement
                            )

                            .vehicule(null)

                            .build();
        }


        nouveauSnapshot.setChampsModifies(
                new ArrayList<>()
        );


        recensementVehiculeRepository.saveAndFlush(
                nouveauSnapshot
        );


        List<RecensementVehicule> snapshotsActualises =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensementId
                        );


        return construireResponse(
                recensement,
                snapshotsActualises
        );
    }

    // MODIFIER MANUELLEMENT UN SNAPSHOT

    @PutMapping("/{recensementId}/vehicules/{snapshotId}")
    @Transactional
    public RecensementResponse modifierVehicule(
            @PathVariable Long recensementId,
            @PathVariable Long snapshotId,
            @RequestBody RecensementVehiculeRequest request
    ) {

        // 1. RÉCUPÉRER LE RECENSEMENT

        Recensement recensement =
                recensementRepository
                        .findById(recensementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + recensementId
                                )
                        );


        // 2. RÉCUPÉRER LE SNAPSHOT

        RecensementVehicule snapshot =
                recensementVehiculeRepository
                        .findById(snapshotId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule du recensement introuvable : "
                                                + snapshotId
                                )
                        );


        // 3. VÉRIFIER L'APPARTENANCE

        if (snapshot.getRecensement() == null
                || !Objects.equals(
                        snapshot.getRecensement().getId(),
                        recensement.getId()
                )) {

            throw new IllegalArgumentException(
                    "Ce véhicule n'appartient pas à ce recensement."
            );
        }


        // 4. RÉCUPÉRER LE VÉHICULE DE RÉFÉRENCE

        Vehicule vehiculeReference =
                snapshot.getVehicule();

        if (vehiculeReference != null
                && vehiculeReference.getId() != null) {

            vehiculeReference =
                    vehiculeRepository
                            .findById(
                                    vehiculeReference.getId()
                            )
                            .orElse(null);
        }
        
        if (vehiculeReference != null
                && snapshot.getVehiculeIdOrigine() == null) {

            snapshot.setVehiculeIdOrigine(
                    vehiculeReference.getId()
            );
        }


        // 5. MODIFIER LE SNAPSHOT

        if (request.getCodeSoa() != null) {

            snapshot.setCodeSoa(
                    normaliserTexte(
                            request.getCodeSoa()
                    )
            );
        }

        if (request.getImmatriculation() != null) {

            snapshot.setImmatriculation(
                    normaliserImmatriculation(
                            request.getImmatriculation()
                    )
            );
        }

        snapshot.setMarque(
                normaliserTexte(
                        request.getMarque()
                )
        );

        snapshot.setType(
                normaliserTexte(
                        request.getType()
                )
        );

        snapshot.setGenre(
                normaliserTexte(
                        request.getGenre()
                )
        );

        snapshot.setSourceEnergie(
                normaliserTexte(
                        request.getSourceEnergie()
                )
        );

        snapshot.setCategorie(
                normaliserTexte(
                        request.getCategorie()
                )
        );

        snapshot.setAnneeMiseCirculation(
                request.getAnneeMiseCirculation()
        );

        snapshot.setEtatGeneral(
                normaliserTexte(
                        request.getEtatGeneral()
                )
        );

        snapshot.setCarteGriseDisponible(
                request.getCarteGriseDisponible()
        );

        snapshot.setDetenteurEffectif(
                normaliserTexte(
                        request.getDetenteurEffectif()
                )
        );

        if (request.getActif() != null) {

            snapshot.setActif(
                    request.getActif()
            );
        }


        // 6. RECALCULER LES MODIFICATIONS

        if (vehiculeReference != null) {

            List<String> champsModifies =
                    trouverChampsModifies(
                            snapshot,
                            vehiculeReference
                    );

            snapshot.setChampsModifies(
                    champsModifies
            );


            if (champsModifies.isEmpty()) {

                /*
                 * Toutes les valeurs du recensement correspondent
                 * maintenant au véhicule de référence.
                 */
                snapshot.setStatut(
                        "IDENTIQUE"
                );

            } else {

                /*
                 * Une ou plusieurs valeurs diffèrent encore.
                 */
                snapshot.setStatut(
                        "MODIFIE"
                );
            }

        } else {

            /*
             * Le véhicule de référence n'existe plus.
             *
             * On ne peut pas comparer.
             *
             * On conserve le statut existant.
             */
            snapshot.setChampsModifies(
                    snapshot.getChampsModifies() == null
                            ? new ArrayList<>()
                            : snapshot.getChampsModifies()
            );
        }

        // 7. SAUVEGARDE

        recensementVehiculeRepository.saveAndFlush(
                snapshot
        );


        // 8. RECHARGER LE RECENSEMENT

        List<RecensementVehicule> snapshotsActualises =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensementId
                        );


        // 9. RECALCULER LES CHAMPS MODIFIÉS POUR LA RÉPONSE

        for (RecensementVehicule rv : snapshotsActualises) {

            if (rv == null) {
                continue;
            }

            Vehicule reference =
                    rv.getVehicule();

            if (reference != null
                    && reference.getId() != null) {

                reference =
                        vehiculeRepository
                                .findById(
                                        reference.getId()
                                )
                                .orElse(null);
            }

            if (reference != null) {

                List<String> modifications =
                        trouverChampsModifies(
                                rv,
                                reference
                        );

                rv.setChampsModifies(
                        modifications
                );

                if (modifications.isEmpty()) {

                    if (!"NOUVEAU".equalsIgnoreCase(
                            rv.getStatut()
                    )) {
                        rv.setStatut(
                                "IDENTIQUE"
                        );
                    }

                } else {

                    rv.setStatut(
                            "MODIFIE"
                    );
                }
            }
        }


        // 10. RÉPONSE

        return construireResponse(
                recensement,
                snapshotsActualises
        );
    }


    // SUPPRIMER UN VÉHICULE DU SNAPSHOT ANNUEL

    @DeleteMapping(
            "/{recensementId}/vehicules/{recensementVehiculeId}"
    )
    @Transactional
    public RecensementResponse supprimerVehicule(
            @PathVariable Long recensementId,
            @PathVariable Long recensementVehiculeId
    ) {

        Recensement recensement =
                recensementRepository
                        .findById(recensementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + recensementId
                                )
                        );


        RecensementVehicule snapshot =
                recensementVehiculeRepository
                        .findById(
                                recensementVehiculeId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule du recensement introuvable : "
                                                + recensementVehiculeId
                                )
                        );


        if (snapshot.getRecensement() == null ||
                !Objects.equals(
                        snapshot.getRecensement().getId(),
                        recensementId
                )) {

            throw new IllegalArgumentException(
                    "Ce véhicule n'appartient pas à ce recensement."
            );
        }


        recensementVehiculeRepository.delete(
                snapshot
        );

        recensement.getVehicules().remove(
                snapshot
        );


        return construireResponse(
                recensement,
                recensement.getVehicules()
        );
    }


    // DÉTENTEUR

    private String construireDetenteur(
            Vehicule vehicule
    ) {

        if (vehicule == null ||
                vehicule.getDetenteur() == null) {

            return null;
        }


        Detenteur d =
                vehicule.getDetenteur();


        StringBuilder resultat =
                new StringBuilder();


        if (d.getNomDetenteur() != null &&
                !d.getNomDetenteur().isBlank()) {

            resultat.append(
                    d.getNomDetenteur()
            );
        }


        if (d.getPrenomDetenteur() != null &&
                !d.getPrenomDetenteur().isBlank()) {

            if (!resultat.isEmpty()) {
                resultat.append(" ");
            }

            resultat.append(
                    d.getPrenomDetenteur()
            );
        }


        return resultat.isEmpty()
                ? null
                : resultat.toString();
    }


    // GET ANNÉES

    @GetMapping("/annees")
    @Transactional
    public List<Integer> getAnnees() {

        return recensementRepository
                .findAll()
                .stream()
                .map(Recensement::getAnnee)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(
                        Comparator.reverseOrder()
                )
                .toList();
    }


    // GET RECENSEMENTS PAR ANNÉE

    @GetMapping("/annee/{annee}")
    @Transactional
    public List<RecensementResponse> getParAnnee(
            @PathVariable Integer annee
    ) {

        List<Recensement> recensements =
                recensementRepository
                        .findByAnneeOrderByIdAsc(
                                annee
                        );


        return recensements
                .stream()
                .map(recensement -> {

                    List<RecensementVehicule> snapshots =
                            recensementVehiculeRepository
                                    .findByRecensement_Id(
                                            recensement.getId()
                                    );

                    return construireResponse(
                            recensement,
                            snapshots
                    );

                })
                .toList();
    }


    // GET RECENSEMENT PAR ANNÉE + SOA

    @GetMapping(
            "/annee/{annee}/soa/{soaId}"
    )
    @Transactional
    public RecensementResponse getParAnneeEtSoa(
            @PathVariable Integer annee,
            @PathVariable Long soaId
    ) {

        Recensement recensement =
                recensementRepository
                        .findByAnneeAndSoa_Id(
                                annee,
                                soaId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucun recensement trouvé pour l'année "
                                                + annee
                                                + " et le SOA "
                                                + soaId
                                )
                        );


        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensement.getId()
                        );


        return construireResponse(
                recensement,
                snapshots
        );
    }


    // COMPARAISON EN TEMPS RÉEL

    @PostMapping(
            "/{recensementId}/comparaison"
    )
    @Transactional
    public RecensementResponse comparerParcAutomobile(
            @PathVariable Long recensementId,
            @RequestParam Integer annee,
            @RequestParam Long soaId
    ) {

        Recensement recensement =
                recensementRepository
                        .findById(recensementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + recensementId
                                )
                        );


        if (!Objects.equals(
                recensement.getAnnee(),
                annee
        )) {

            throw new IllegalArgumentException(
                    "L'année demandée ("
                            + annee
                            + ") ne correspond pas à l'année du recensement ("
                            + recensement.getAnnee()
                            + ")."
            );
        }


        if (recensement.getSoa() == null ||
                !Objects.equals(
                        recensement.getSoa().getId(),
                        soaId
                )) {

            throw new IllegalArgumentException(
                    "Le SOA demandé ("
                            + soaId
                            + ") ne correspond pas au SOA du recensement."
            );
        }


        List<RecensementVehicule> vueCalculee =
                actualiserComparaison(
                        recensement,
                        annee,
                        soaId
                );


        return construireResponse(
                recensement,
                vueCalculee
        );
    }


    // INFORMATIONS ADMINISTRATIVES

    @PutMapping(
            value = "/{id}/infos",
            consumes = "application/json"
    )
    @Transactional
    public RecensementResponse mettreAJourInfos(
            @PathVariable Long id,
            @RequestBody RecensementRequest request
    ) {

        Recensement recensement =
                recensementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + id
                                )
                        );


        recensement.setMinistere(
                request.getMinistere()
        );

        recensement.setNiveau(
                request.getNiveau()
        );

        recensement.setDirectionService(
                request.getDirectionService()
        );

        recensement.setDirectionServiceRecensement(
                request.getDirectionServiceRecensement()
        );

        recensement.setObjet(
                request.getObjet()
        );

        recensement.setNomPrenomResponsable(
                request.getNomPrenomResponsable()
        );

        recensement.setFonctionResponsable(
                request.getFonctionResponsable()
        );

        recensement.setTelephoneResponsable(
                request.getTelephoneResponsable()
        );

        recensement.setEmailResponsable(
                request.getEmailResponsable()
        );

        recensement.setDetenteurEffectif(
                request.getDetenteurEffectif()
        );


        recensementRepository.saveAndFlush(
                recensement
        );


        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository
                        .findByRecensement_Id(
                                recensement.getId()
                        );


        return construireResponse(
                recensement,
                snapshots
        );
    }


    // SORTIR DÉFINITIVEMENT UN VÉHICULE DU PARC

    @PutMapping(
            "/{recensementId}/vehicules/{recensementVehiculeId}/sortir-parc"
    )
    @Transactional
    public RecensementResponse sortirVehiculeDuParc(
            @PathVariable Long recensementId,
            @PathVariable Long recensementVehiculeId
    ) {

        Recensement recensement =
                recensementRepository
                        .findById(recensementId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + recensementId
                                )
                        );


        RecensementVehicule snapshot =
                recensementVehiculeRepository
                        .findById(
                                recensementVehiculeId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Véhicule du recensement introuvable."
                                )
                        );


        if (snapshot.getRecensement() == null ||
                !Objects.equals(
                        snapshot.getRecensement().getId(),
                        recensementId
                )) {

            throw new IllegalArgumentException(
                    "Ce véhicule n'appartient pas à ce recensement."
            );
        }


        if (snapshot.getVehicule() != null) {

            vehiculeRepository.delete(
                    snapshot.getVehicule()
            );
        }


        recensementVehiculeRepository.delete(
                snapshot
        );

        recensement.getVehicules().remove(
                snapshot
        );


        return construireResponse(
                recensement,
                recensement.getVehicules()
        );
    }
    
    
    //SUPPRESSION DU RECENSEMENT
    
    @DeleteMapping("/{id}")
    @Transactional
    public void supprimerRecensement(
            @PathVariable Long id
    ) {
        Recensement recensement = recensementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Recensement introuvable : " + id
                        )
                );

        // Récupérer les véhicules liés à ce recensement
        List<RecensementVehicule> snapshots =
                recensementVehiculeRepository.findByRecensement_Id(id);

        // Supprimer les snapshots du recensement
        if (!snapshots.isEmpty()) {
            recensementVehiculeRepository.deleteAll(snapshots);
            recensementVehiculeRepository.flush();
        }

        // Puis supprimer le recensement lui-même
        recensementRepository.delete(recensement);
        recensementRepository.flush();
    }


    // CONSTRUIRE LA RÉPONSE

    private RecensementResponse construireResponse(
            Recensement recensement,
            List<RecensementVehicule> snapshotsPersonnalises
    ) {

        if (recensement == null) {
            return null;
        }


        if (snapshotsPersonnalises == null) {
            snapshotsPersonnalises =
                    new ArrayList<>();
        }


        List<RecensementVehiculeResponse> vehicules =
                snapshotsPersonnalises
                        .stream()
                        .filter(Objects::nonNull)
                        .map(v ->
                                RecensementVehiculeResponse
                                        .builder()

                                        .id(
                                                v.getId()
                                        )

                                        .vehiculeId(
                                                v.getVehicule() == null
                                                        ? null
                                                        : v.getVehicule()
                                                                .getId()
                                        )

                                        .codeSoa(
                                                v.getCodeSoa()
                                        )

                                        .immatriculation(
                                                v.getImmatriculation() != null
                                                        ? v.getImmatriculation()
                                                        : ""
                                        )

                                        .marque(
                                                v.getMarque()
                                        )

                                        .type(
                                                v.getType()
                                        )

                                        .genre(
                                                v.getGenre()
                                        )

                                        .sourceEnergie(
                                                v.getSourceEnergie()
                                        )

                                        .categorie(
                                                v.getCategorie()
                                        )

                                        .anneeMiseCirculation(
                                                v.getAnneeMiseCirculation()
                                        )

                                        .etatGeneral(
                                                v.getEtatGeneral()
                                        )

                                        .carteGriseDisponible(
                                                v.getCarteGriseDisponible()
                                        )

                                        .detenteurEffectif(
                                                v.getDetenteurEffectif()
                                        )

                                        .actif(
                                                v.getActif()
                                        )

                                        .statut(
                                                v.getStatut() != null
                                                        ? v.getStatut()
                                                        : "IDENTIQUE"
                                        )

                                        .champsModifies(
                                                v.getChampsModifies() == null
                                                        ? new ArrayList<>()
                                                        : v.getChampsModifies()
                                        )

                                        .build()
                        )
                        .toList();


        int nouveaux =
                (int) vehicules
                        .stream()
                        .filter(v ->
                                "NOUVEAU".equalsIgnoreCase(
                                        v.getStatut()
                                )
                        )
                        .count();


        int modifies =
                (int) vehicules
                        .stream()
                        .filter(v ->
                                "MODIFIE".equalsIgnoreCase(
                                        v.getStatut()
                                )
                        )
                        .count();


        int absents =
                (int) vehicules
                        .stream()
                        .filter(v ->
                                "ABSENT".equalsIgnoreCase(
                                        v.getStatut()
                                )
                        )
                        .count();


        return RecensementResponse
                .builder()

                .id(
                        recensement.getId()
                )

                .soaId(
                        recensement.getSoa() == null
                                ? null
                                : recensement
                                        .getSoa()
                                        .getId()
                )

                .annee(
                        recensement.getAnnee()
                )

                .ministere(
                        recensement.getMinistere()
                )

                .niveau(
                        recensement.getNiveau()
                )

                .directionService(
                        recensement.getDirectionService()
                )

                .directionServiceRecensement(
                        recensement
                                .getDirectionServiceRecensement()
                )

                .nomPrenomResponsable(
                        recensement
                                .getNomPrenomResponsable()
                )

                .fonctionResponsable(
                        recensement
                                .getFonctionResponsable()
                )

                .telephoneResponsable(
                        recensement
                                .getTelephoneResponsable()
                )

                .emailResponsable(
                        recensement
                                .getEmailResponsable()
                )

                .objet(
                        recensement.getObjet()
                )

                .detenteurEffectif(
                        recensement
                                .getDetenteurEffectif()
                )

                .valide(
                        recensement.getValide()
                )

                .nombreVehicules(
                        vehicules.size()
                )

                .nombreNouveaux(
                        nouveaux
                )

                .nombreModifies(
                        modifies
                )

                .nombreAbsents(
                        absents
                )

                .vehicules(
                        vehicules
                )

                .build();
    }


    // NORMALISER IMMATRICULATION

    private String normaliser(
            String valeur
    ) {

        if (valeur == null) {
            return "";
        }

        return valeur
                .trim()
                .replaceAll("\\s+", "")
                .toUpperCase();
    }
    
    private String normaliserTexte(String valeur) {
    if (valeur == null) {
        return null;
    }

    String resultat = valeur.trim();

    return resultat.isEmpty() ? null : resultat;
    }

    private String normaliserImmatriculation(String immatriculation) {
        if (immatriculation == null) {
            return null;
        }

        return immatriculation
                .trim()
                .replaceAll("\\s+", "")
                .toUpperCase();
    }


    // MAP PAR IMMATRICULATION

    private Map<String, RecensementVehicule>
    construireMapParImmatriculation(
            List<RecensementVehicule> vehicules
    ) {

        Map<String, RecensementVehicule> map =
                new HashMap<>();

        if (vehicules == null) {
            return map;
        }

        for (RecensementVehicule v :
                vehicules) {

            if (v == null ||
                    v.getImmatriculation() == null ||
                    v.getImmatriculation().isBlank()) {

                continue;
            }

            String immat =
                    normaliser(
                            v.getImmatriculation()
                    );

            map.putIfAbsent(
                    immat,
                    v
            );
        }

        return map;
    }


    // MAP PAR ID VÉHICULE

    private Map<Long, RecensementVehicule>
    construireMapParVehiculeId(
            List<RecensementVehicule> liste
    ) {

        Map<Long, RecensementVehicule> map =
                new HashMap<>();

        if (liste == null) {
            return map;
        }

        for (RecensementVehicule v :
                liste) {

            if (v == null ||
                    v.getVehicule() == null ||
                    v.getVehicule().getId() == null) {

                continue;
            }

            map.putIfAbsent(
                    v.getVehicule().getId(),
                    v
            );
        }

        return map;
    }
}