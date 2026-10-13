package mg.drbf.haigana.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import mg.drbf.haigana.dto.RecensementLogementRequest;
import mg.drbf.haigana.dto.RecensementLogementResponse;
import mg.drbf.haigana.entity.Logement;
import mg.drbf.haigana.entity.RecensementLogement;
import mg.drbf.haigana.entity.RecensementLogementLigne;
import mg.drbf.haigana.entity.SoaCode;
import mg.drbf.haigana.entity.StatusRecensementLogement;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.LogementRepository;
import mg.drbf.haigana.repository.RecensementLogementRepository;
import mg.drbf.haigana.repository.SoaCodeRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import jakarta.persistence.EntityManager;


@RestController
@RequestMapping("/api/recensements-logements")
@RequiredArgsConstructor
public class RecensementLogementController {

    private final RecensementLogementRepository recensementRepository;
    private final LogementRepository logementRepository;
    private final SoaCodeRepository soaCodeRepository;
    private final EntityManager entityManager;
    
    // PREPARER LE RECENSEMENT

    @PostMapping("/preparer")
    @Transactional
    public RecensementLogementResponse preparer(
            @RequestBody RecensementLogementRequest request
    ) {

        // ========================================================
        // VALIDATION DE LA REQUETE
        // ========================================================

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données du recensement sont obligatoires."
            );
        }

        if (request.getSoaId() == null) {
            throw new IllegalArgumentException(
                    "Le Code SOA est obligatoire."
            );
        }

        if (request.getAnnee() == null) {
            throw new IllegalArgumentException(
                    "L'année est obligatoire."
            );
        }

        // ========================================================
        // VERIFIER LE SOA
        // ========================================================

        SoaCode soa =
                soaCodeRepository
                        .findById(request.getSoaId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Code SOA introuvable : "
                                                + request.getSoaId()
                                )
                        );

        // ========================================================
        // CHERCHER LE RECENSEMENT COURANT
        // ========================================================

        RecensementLogement recensement =
                recensementRepository
                        .findBySoa_IdAndAnnee(
                                request.getSoaId(),
                                request.getAnnee()
                        )
                        .orElse(null);

        // ========================================================
        // CAS 1 :
        // LE RECENSEMENT EXISTE DEJA
        // ========================================================

        if (recensement != null) {

            // ----------------------------------------------------
            // Mettre à jour les informations générales
            // ----------------------------------------------------

            mettreAJourInformations(
                    recensement,
                    request
            );

            // ----------------------------------------------------
            // Comparer le recensement avec la BDD
            // ----------------------------------------------------

            comparerRecensementAvecBDD(
                    recensement,
                    request.getSoaId(),
                    request.getAnnee()
            );

            recensement =
                    recensementRepository
                            .save(recensement);

            return toResponse(recensement);
        }

        // ========================================================
        // CAS 2 :
        // CREER UN NOUVEAU RECENSEMENT
        // ========================================================

        recensement =
                RecensementLogement
                        .builder()
                        .soa(soa)
                        .annee(request.getAnnee())
                        .dateRecensement(
                                LocalDate.of(
                                        request.getAnnee(),
                                        12,
                                        31
                                )
                        )
                        .valide(false)
                        .logements(
                                new ArrayList<>()
                        )
                        .build();

        // ========================================================
        // INFORMATIONS GENERALES
        // ========================================================

        mettreAJourInformations(
                recensement,
                request
        );

        // ========================================================
        // CHERCHER LE DERNIER RECENSEMENT PRECEDENT
        // ========================================================

        RecensementLogement precedent =
                recensementRepository
                        .findTopBySoa_IdAndAnneeLessThanOrderByAnneeDesc(
                                request.getSoaId(),
                                request.getAnnee()
                        )
                        .orElse(null);

        // ========================================================
        // SI UN RECENSEMENT PRECEDENT EXISTE :
        // COPIER SES LIGNES
        // ========================================================

        if (precedent != null) {

            for (
                    RecensementLogementLigne ancienneLigne :
                    precedent.getLogements()
            ) {

                RecensementLogementLigne nouvelleLigne =
                        copierLignePourNouveauRecensement(
                                ancienneLigne,
                                recensement
                        );

                recensement
                        .getLogements()
                        .add(nouvelleLigne);
            }
        }

        // ========================================================
        // SAUVEGARDER LE NOUVEAU RECENSEMENT
        // ========================================================

        recensement =
                recensementRepository
                        .save(recensement);

        // ========================================================
        // COMPARER LE RECENSEMENT AVEC LA BDD
        // ========================================================

        comparerRecensementAvecBDD(
                recensement,
                request.getSoaId(),
                request.getAnnee()
        );

        // ========================================================
        // SAUVEGARDE FINALE
        // ========================================================

        recensement =
                recensementRepository
                        .save(recensement);

        return toResponse(recensement);
    }

    // MOTEUR DE COMPARISON PAR CLÉ PRIMAIRE ABSOLUE (LOGIQUE INDESTRUCTIBLE)

    private void comparerRecensementAvecBDD(
            RecensementLogement recensement,
            Long soaId,
            Integer annee
    ) {
        List<RecensementLogementLigne> lignesRecensement = recensement.getLogements();
        if (lignesRecensement == null) {
            lignesRecensement = new ArrayList<>();
            recensement.setLogements(lignesRecensement);
        }

        // 1. Charger l'état actuel et réel de la base de données
        List<Logement> logementsBDD = logementRepository.findByCodeSoa_IdOrderByNumeroAscIdAsc(soaId);

        // Filtrer les logements valides existant pour cette année
        List<Logement> logementsValides = logementsBDD.stream()
                .filter(logement -> existePendantAnnee(logement, annee))
                .toList();

        // Indexation de la base actuelle par sa clé primaire absolue (ID de création unique)
        Map<Long, Logement> baseActuelleParIdUnitaire = logementsValides.stream()
                .filter(l -> l.getId() != null)
                .collect(Collectors.toMap(Logement::getId, l -> l, (a, b) -> a));

        // Index des clés de création déjà traitées pour isoler les nouvelles fiches insérées
        Set<Long> clesCreationTraitees = lignesRecensement.stream()
                .map(RecensementLogementLigne::getLogementIdOrigine)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // =====================================================================
        // ÉTAPE 1 : BALAYAGE DES LIGNES VIA LA CLÉ DE CRÉATION UNIQUE
        // =====================================================================
        for (RecensementLogementLigne ligne : lignesRecensement) {
            Long cleCreation = ligne.getLogementIdOrigine();

            // S'il n'y a pas de clé d'ancrage, on essaie de récupérer l'ID du lien s'il existe
            if (cleCreation == null && ligne.getLogement() != null) {
                cleCreation = ligne.getLogement().getId();
                ligne.setLogementIdOrigine(cleCreation); // Sauvegarde de rattrapage
            }

            // Tentative de recherche directe en BDD par la clé primaire absolue
            Logement logementBDD = (cleCreation != null) ? baseActuelleParIdUnitaire.get(cleCreation) : null;

            // CAS ABSENT : La clé de création n'existe plus en BDD -> Le logement a été supprimé
            if (logementBDD == null) {
                ligne.setStatut(StatusRecensementLogement.ABSENT);
                ligne.setChampsModifies(new ArrayList<>());
                // Coupe le lien physique rompu
                continue;
            }

            // LE LOGEMENT EXISTE : ON ALIGNE LE POINTEUR ET ON COMPARE LE RESTE DES CHAMPS
            ligne.setLogement(logementBDD);

            List<String> champsModifies = new ArrayList<>();
            comparerChamp("nomBatiment", ligne.getNomBatiment(), logementBDD.getNomBatiment(), champsModifies);
            comparerChamp("nature", ligne.getNature(), logementBDD.getNature(), champsModifies);
            comparerChamp("entiteUtilisatrice", ligne.getEntiteUtilisatrice(), logementBDD.getEntiteUtilisatrice(), champsModifies);
            comparerChamp("occupant", ligne.getOccupant(), logementBDD.getOccupant(), champsModifies);
            comparerChamp("etatBatisse", ligne.getEtatBatisse(), logementBDD.getEtatBatisse(), champsModifies);
            comparerChamp("localite", ligne.getLocalite(), logementBDD.getLocalite(), champsModifies);
            comparerChamp("adressePointRepere", ligne.getAdressePointRepere(), logementBDD.getAdressePointRepere(), champsModifies);
            comparerChamp("etatGeneral", ligne.getEtatGeneral(), logementBDD.getEtatGeneral(), champsModifies);

            if (champsModifies.isEmpty()) {
                ligne.setStatut(StatusRecensementLogement.IDENTIQUE);
            } else {
                ligne.setStatut(StatusRecensementLogement.MODIFIE);
            }
            ligne.setChampsModifies(champsModifies);
        }

        // =====================================================================
        // ÉTAPE 2 : DÉTECTION DES NOUVEAUX LOGEMENTS CRÉÉS (MÊME NOM/NATURE OU PAS)
        // =====================================================================
        for (Logement logementBDD : logementsValides) {
            if (logementBDD.getId() == null) {
                continue;
            }

            // Si la clé d'inventaire absolue n'a aucune ligne dans le recensement, c'est un NOUVEAU
            if (!clesCreationTraitees.contains(logementBDD.getId())) {
                RecensementLogementLigne nouveau = creerLigneDepuisLogement(
                        logementBDD,
                        recensement,
                        StatusRecensementLogement.NOUVEAU
                );
                recensement.getLogements().add(nouveau);
            }
        }
    }


    
    // METTRE A JOUR LES INFORMATIONS GENERALES

    private void mettreAJourInformations(
            RecensementLogement recensement,
            RecensementLogementRequest request
    ) {
        // Si le ministère dans la requête est absent, on extrait celui du SOA parent
        if (request.getMinistere() == null || request.getMinistere().isBlank()) {
            if (recensement.getSoa() != null && recensement.getSoa().getMinistere() != null) {
                recensement.setMinistere(recensement.getSoa().getMinistere().getNomMinistere());
            } else {
                recensement.setMinistere("");
            }
        } else {
            recensement.setMinistere(request.getMinistere().trim());
        }

        // Même logique pour la direction / service (district)
        if (request.getDirectionService() == null || request.getDirectionService().isBlank()) {
            if (recensement.getSoa() != null && recensement.getSoa().getMinistere() != null) {
                recensement.setDirectionService(recensement.getSoa().getMinistere().getDistrictMinistere());
            } else {
                recensement.setDirectionService("MAHAJANGA I");
            }
        } else {
            recensement.setDirectionService(request.getDirectionService().trim());
        }
        
        if (request.getObjetTitreFoncier() != null) {
            recensement.setObjetTitreFoncier(request.getObjetTitreFoncier().trim());
        } else {
            recensement.setObjetTitreFoncier("LA RESIDENCE », Titre n°1122-BR sise à La Corniche Mahajanga Ville, Commune Mahajanga I");
        }

        recensement.setNiveau(request.getNiveau());
        recensement.setObjet(request.getObjet());
        recensement.setNom(request.getNom());
        recensement.setPrenom(request.getPrenom());
        recensement.setFonction(request.getFonction());
        recensement.setTelephone(request.getTelephone());
        recensement.setEmail(request.getEmail());
        recensement.setDateRecensement(LocalDate.of(request.getAnnee(), 12, 31));
    }

    // CREER UNE LIGNE A PARTIR DE LA BDD
    

    private RecensementLogementLigne creerLigneDepuisLogement(
            Logement logement,
            RecensementLogement recensement,
            StatusRecensementLogement statut
    ) {

        return RecensementLogementLigne
                .builder()

                .recensement(
                        recensement
                )

                .logement(
                        logement
                )
                
                .logementIdOrigine(logement.getId())

                .numero(
                        logement.getNumero()
                )

                .nomBatiment(
                        logement.getNomBatiment()
                )

                .nature(
                        logement.getNature()
                )

                .entiteUtilisatrice(
                        logement.getEntiteUtilisatrice()
                )

                .occupant(
                        logement.getOccupant()
                )

                .etatBatisse(
                        logement.getEtatBatisse()
                )

                .localite(
                        logement.getLocalite()
                )

                .adressePointRepere(
                        logement.getAdressePointRepere()
                )

                .etatGeneral(
                        logement.getEtatGeneral()
                )

                .statut(
                        statut
                )

                .champsModifies(
                        new ArrayList<>()
                )

                .build();
    }


    
    // COPIER UNE LIGNE D'UN ANCIEN RECENSEMENT
    

    private RecensementLogementLigne
    copierLignePourNouveauRecensement(
            RecensementLogementLigne ancienne,
            RecensementLogement nouveauRecensement
    ) {

        return RecensementLogementLigne
                .builder()

                .recensement(
                        nouveauRecensement
                )

                .logement(
                        ancienne.getLogement()
                )

                .numero(
                        ancienne.getNumero()
                )

                .nomBatiment(
                        ancienne.getNomBatiment()
                )

                .nature(
                        ancienne.getNature()
                )

                .entiteUtilisatrice(
                        ancienne.getEntiteUtilisatrice()
                )

                .occupant(
                        ancienne.getOccupant()
                )

                .etatBatisse(
                        ancienne.getEtatBatisse()
                )

                .localite(
                        ancienne.getLocalite()
                )

                .adressePointRepere(
                        ancienne.getAdressePointRepere()
                )

                .etatGeneral(
                        ancienne.getEtatGeneral()
                )

                .statut(
                        ancienne.getStatut()
                )

                .champsModifies(
                        new ArrayList<>()
                )

                .build();
    }


    
    // COMPARER UN CHAMP
    

    private void comparerChamp(
            String nomChamp,
            Object ancienneValeur,
            Object nouvelleValeur,
            List<String> champsModifies
    ) {

        if (!Objects.equals(
                normaliserValeur(ancienneValeur),
                normaliserValeur(nouvelleValeur)
        )) {

            champsModifies.add(
                    nomChamp
            );
        }
    }


    
    // NORMALISER UNE VALEUR
    

    private String normaliserValeur(
            Object valeur
    ) {

        if (valeur == null) {
            return "";
        }

        return valeur
                .toString()
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }


    
    // VERIFIER SI LE LOGEMENT EXISTAIT CETTE ANNEE
    

    private boolean existePendantAnnee(
            Logement logement,
            Integer annee
    ) {

        if (logement == null) {
            return false;
        }

        // --------------------------------------------------------
        // ANNEE DE CREATION
        // --------------------------------------------------------

        Integer anneeInitiale =
                logement.getAnneeInitiale();

        if (
                anneeInitiale != null
                        &&
                anneeInitiale > annee
        ) {

            return false;
        }

        // --------------------------------------------------------
        // CONDAMNATION
        // --------------------------------------------------------

        LocalDate condamnation =
                logement.getDateAvantCondamnation();

        if (condamnation == null) {
            return true;
        }

        return annee <
                condamnation.getYear();
    }


    
    // DETAIL
    

    @GetMapping("/{id}")
    @Transactional
    public RecensementLogementResponse findById(
            @PathVariable Long id
    ) {

        RecensementLogement recensement =
                recensementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recensement introuvable : "
                                                + id
                                )
                        );

        return toResponse(recensement);
    }

    // RECHERCHE PAR SOA + ANNEE

    @GetMapping("/soa/{soaId}/annee/{annee}")
    @Transactional
    public RecensementLogementResponse getParSoaEtAnnee(
            @PathVariable Long soaId,
            @PathVariable Integer annee
    ) {

        RecensementLogement recensement =
                recensementRepository
                        .findBySoa_IdAndAnnee(
                                soaId,
                                annee
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Aucun recensement trouvé pour le SOA "
                                                + soaId
                                                + " et l'année "
                                                + annee
                                )
                        );

        return toResponse(recensement);
    }

    // SUPPRESSION DU RECENSEMENT IMMOBILIER ET PURGE DES LIGNES COMPATIBLES
    @DeleteMapping("/{id}")
    @Transactional
    public void supprimerRecensementLogement(
            @PathVariable Long id
    ) {
        RecensementLogement recensement = recensementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recensement immobilier introuvable avec l'ID : " + id));

        // Étape 1 : Nettoyage obligatoire des lignes du tableau (Contrainte de clé étrangère enfant)
        entityManager.createNativeQuery("DELETE FROM recensement_logement_ligne WHERE recensement_id = :recId")
                .setParameter("recId", id)
                .executeUpdate();

        // Étape 2 : Forcer la synchronisation du contexte de persistance
        entityManager.flush();

        // Étape 3 : Destruction définitive de la fiche d'en-tête maîtresse
        recensementRepository.delete(recensement);
        recensementRepository.flush();
    }
    
     /**
     * SYNCHRONISER ET VALIDER UNE LIGNE MODIFIEE DU RECENSEMENT
     * PUT /api/recensements-logements/lignes/{ligneId}
     */
    @PutMapping("/lignes/{ligneId}")
    @Transactional
    public RecensementLogementResponse.Ligne synchroniserLigne(
            @PathVariable Long ligneId,
            @RequestBody RecensementLogementResponse.Ligne request
    ) {
        // 1. Chargement de la fiche technique maîtresse (Logement) en BDD
        Logement logement = logementRepository.findById(request.getLogementId())
                .orElseThrow(() -> new ResourceNotFoundException("Bâtiment de référence introuvable : " + request.getLogementId()));

        // 2. Écrasement et mise à jour de la table de référence avec les nouvelles valeurs
        logement.setNomBatiment(request.getNomBatiment());
        logement.setNature(request.getNature());
        logement.setEntiteUtilisatrice(request.getEntiteUtilisatrice());
        logement.setOccupant(request.getOccupant());
        logement.setEtatBatisse(request.getEtatBatisse());
        logement.setLocalite(request.getLocalite());
        logement.setAdressePointRepere(request.getAdressePointRepere());
        logement.setEtatGeneral(request.getEtatGeneral());
        logementRepository.save(logement);

        // 3. Extraction de l'année et du Recensement Parent via les liaisons Hibernate de l'entité Logement
        List<RecensementLogement> recensementsDuSoa = recensementRepository.findAll();
        RecensementLogementLigne ligneCible = null;
        RecensementLogement recensementParent = null;

        // Parcours du graphe pour identifier la ligne historique précise
        for (RecensementLogement rec : recensementsDuSoa) {
            for (RecensementLogementLigne l : rec.getLogements()) {
                if (Objects.equals(l.getId(), ligneId)) {
                    ligneCible = l;
                    recensementParent = rec;
                    break;
                }
            }
            if (ligneCible != null) break;
        }

        if (ligneCible == null) {
            throw new ResourceNotFoundException("Ligne historique introuvable pour l'id : " + ligneId);
        }

        // 4. Alignement immédiat de la ligne historique pour effacer l'écart analytique
        ligneCible.setNomBatiment(request.getNomBatiment());
        ligneCible.setNature(request.getNature());
        ligneCible.setEntiteUtilisatrice(request.getEntiteUtilisatrice());
        ligneCible.setOccupant(request.getOccupant());
        ligneCible.setEtatBatisse(request.getEtatBatisse());
        ligneCible.setLocalite(request.getLocalite());
        ligneCible.setAdressePointRepere(request.getAdressePointRepere());
        ligneCible.setEtatGeneral(request.getEtatGeneral());
        
        // Le statut bascule à IDENTIQUE et la liste des surbrillances orange est vidée
        ligneCible.setStatut(StatusRecensementLogement.IDENTIQUE);
        ligneCible.getChampsModifies().clear();

        // 5. Sauvegarde finale du graphe d'entités réaligné
        recensementRepository.save(recensementParent);

        return RecensementLogementResponse.Ligne.builder()
                .id(ligneCible.getId())
                .logementId(logement.getId())
                .numero(ligneCible.getNumero())
                .nomBatiment(ligneCible.getNomBatiment())
                .nature(ligneCible.getNature())
                .entiteUtilisatrice(ligneCible.getEntiteUtilisatrice())
                .occupant(ligneCible.getOccupant())
                .etatBatisse(ligneCible.getEtatBatisse())
                .localite(ligneCible.getLocalite())
                .adressePointRepere(ligneCible.getAdressePointRepere())
                .etatGeneral(ligneCible.getEtatGeneral())
                .statut(StatusRecensementLogement.IDENTIQUE)
                .champsModifies(new ArrayList<>())
                .build();
    }
    
    @PutMapping("/{id}/quitus")
    @Transactional
    public RecensementLogementResponse accorderQuitus(
            @PathVariable Long id
    ) {
        RecensementLogement recensement = recensementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recensement immobilier introuvable avec l'ID : " + id));

        // 1. Passage forcé de l'état de validation à true
        recensement.setValide(true);
        recensementRepository.save(recensement);
        recensementRepository.flush();

        // 2. Récupération d'une instance fraîche ré-hydratée depuis la BDD
        RecensementLogement recensementValide = recensementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Erreur de rafraîchissement du recensement : " + id));

        // 3. Renvoi sécurisé converti en DTO
        return toResponse(recensementValide);
    }
    
    // RESPONSE
    
    private RecensementLogementResponse toResponse(
            RecensementLogement recensement
    ) {

        List<RecensementLogementResponse.Ligne> lignes =
                recensement
                        .getLogements()
                        .stream()
                        .map(ligne ->
                                RecensementLogementResponse
                                        .Ligne
                                        .builder()

                                        .id(
                                                ligne.getId()
                                        )

                                        .logementId(
                                                ligne.getLogement()
                                                        != null
                                                        ? ligne
                                                            .getLogement()
                                                            .getId()
                                                        : null
                                        )

                                        .numero(
                                                ligne.getNumero()
                                        )

                                        .nomBatiment(
                                                ligne.getNomBatiment()
                                        )

                                        .nature(
                                                ligne.getNature()
                                        )

                                        .entiteUtilisatrice(
                                                ligne.getEntiteUtilisatrice()
                                        )

                                        .occupant(
                                                ligne.getOccupant()
                                        )

                                        .etatBatisse(
                                                ligne.getEtatBatisse()
                                        )

                                        .localite(
                                                ligne.getLocalite()
                                        )

                                        .adressePointRepere(
                                                ligne.getAdressePointRepere()
                                        )

                                        .etatGeneral(
                                                ligne.getEtatGeneral()
                                        )

                                        .statut(
                                                ligne.getStatut()
                                        )

                                        .champsModifies(
                                                ligne.getChampsModifies()
                                        )

                                        .build()
                        )
                        .toList();

        return RecensementLogementResponse
                .builder()

                .id(
                        recensement.getId()
                )

                .soaId(
                        recensement.getSoa() != null
                                ? recensement
                                    .getSoa()
                                    .getId()
                                : null
                )

                .codeSoa(
                        recensement.getSoa() != null
                                ? recensement
                                    .getSoa()
                                    .getCodeSoa()
                                : null
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

                .objet(
                        recensement.getObjet()
                )

                .nom(
                        recensement.getNom()
                )

                .prenom(
                        recensement.getPrenom()
                )

                .fonction(
                        recensement.getFonction()
                )

                .telephone(
                        recensement.getTelephone()
                )

                .email(
                        recensement.getEmail()
                )

                .dateRecensement(
                        recensement.getDateRecensement()
                )

                .valide(
                        recensement.getValide()
                )

                .logements(
                        lignes
                )
                
                .objetTitreFoncier(recensement.getObjetTitreFoncier())

                .build();
    }
}