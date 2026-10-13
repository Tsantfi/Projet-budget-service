package mg.drbf.haigana.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import mg.drbf.haigana.dto.LogementResponse;
import mg.drbf.haigana.entity.Logement;
import mg.drbf.haigana.repository.LogementRepository;
import mg.drbf.haigana.exception.ResourceNotFoundException;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logements")
@RequiredArgsConstructor
public class LogementController {

    private final LogementRepository logementRepository;

    
    // LISTE SOA + ANNEE
    

    @GetMapping
    @Transactional
    public List<LogementResponse> findAll(
            @RequestParam Long soaId,
            @RequestParam Integer annee
    ) {

        return logementRepository
                .findByCodeSoa_IdOrderByNumeroAscIdAsc(
                        soaId
                )
                .stream()

                .filter(logement ->
                        existePendantAnnee(
                                logement,
                                annee
                        )
                )

                .map(this::toResponse)

                .toList();
    }

    
    // DETAIL
    

    @GetMapping("/{id}")
    @Transactional
    public LogementResponse findById(
            @PathVariable Long id
    ) {

        Logement logement =
                logementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Logement introuvable : "
                                                + id
                                )
                        );

        return toResponse(logement);
    }

    
    // MODIFIER
    

    @PutMapping("/{id}")
    @Transactional
    public LogementResponse modifier(
            @PathVariable Long id,
            @RequestBody LogementResponse request
    ) {

        Logement logement =
                logementRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Logement introuvable : "
                                                + id
                                )
                        );

        logement.setNumero(
                request.getNumero()
        );

        logement.setNomBatiment(
                request.getNomBatiment()
        );

        logement.setNature(
                request.getNature()
        );

        logement.setEntiteUtilisatrice(
                request.getEntiteUtilisatrice()
        );

        logement.setOccupant(
                request.getOccupant()
        );

        logement.setEtatBatisse(
                request.getEtatBatisse()
        );

        logement.setLocalite(
                request.getLocalite()
        );

        logement.setAdressePointRepere(
                request.getAdressePointRepere()
        );

        logement.setEtatGeneral(
                request.getEtatGeneral()
        );

        logement =
                logementRepository
                        .save(logement);

        return toResponse(logement);
    }
    
    // ============================================================
    // CREER / ENREGISTRER UN NOUVEAU LOGEMENT
    // ============================================================
    @PostMapping
    @Transactional
    public LogementResponse creerLogement(@RequestBody LogementResponse request) {
        if (request.getSoa() == null || request.getSoa().getId() == null) {
            throw new IllegalArgumentException("L'identifiant technique du Code SOA est obligatoire.");
        }

        // Récupération de l'entité parente SoaCode via proxy
        mg.drbf.haigana.entity.SoaCode soaCode = new mg.drbf.haigana.entity.SoaCode();
        soaCode.setId(request.getSoa().getId());

        // FIX CHRONOLOGIQUE : Si l'année initiale n'est pas fournie, on prend l'année courante
        Integer anneeCalculer = request.getAnneeInitiale() != null ? request.getAnneeInitiale() : LocalDate.now().getYear();

        Logement logement = Logement.builder()
                .codeSoa(soaCode)
                .numero(request.getNumero())
                .nomBatiment(request.getNomBatiment())
                .nature(request.getNature())
                .entiteUtilisatrice(request.getEntiteUtilisatrice())
                .occupant(request.getOccupant())
                .etatBatisse(request.getEtatBatisse())
                .localite(request.getLocalite())
                .adressePointRepere(request.getAdressePointRepere())
                .etatGeneral(request.getEtatGeneral() != null ? request.getEtatGeneral() : "En service")
                .anneeInitiale(anneeCalculer) // Ancrage temporel garanti
                .actif(true)
                .build();

        logement = logementRepository.save(logement);
        return toResponse(logement);
    }
    
    // CONDAMNATION

    @PostMapping("/{id}/condamnation")
    @Transactional
    public LogementResponse condamner(
            @PathVariable Long id,
            @RequestBody CondamnationRequest request
    ) {
        Logement logement = logementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Logement introuvable avec l'ID : " + id));

        // Étape 1 : Nettoyage via la méthode native déclarée dans votre LogementRepository
        logementRepository.deleteRecensementLignesByLogementId(id);
        logementRepository.flush(); // Force la purge immédiate des lignes enfants du recensement

        // Étape 2 : Suppression définitive et totale de l'entité maîtresse
        logementRepository.delete(logement);
        logementRepository.flush(); // Applique la destruction physique dans la base de données

        // Étape 3 : Renvoi du DTO de confirmation épuré pour notifier React
        return LogementResponse.builder()
                .id(id)
                .nomBatiment("Supprimé")
                .actif(false)
                .build();
    }

    
    // EXISTE PENDANT L'ANNEE
    

    private boolean existePendantAnnee(
            Logement logement,
            Integer annee
    ) {

        if (logement == null) {
            return false;
        }

        Integer anneeInitiale =
                logement.getAnneeInitiale();

        if (
                anneeInitiale != null &&
                anneeInitiale > annee
        ) {
            return false;
        }

        LocalDate condamnation =
                logement.getDateAvantCondamnation();

        if (condamnation == null) {
            return true;
        }

        return annee <
                condamnation.getYear();
    }

    
    // RESPONSE
    

    private LogementResponse toResponse(
            Logement logement
    ) {

        LogementResponse.SoaResponse soa =
                null;

        if (
                logement.getCodeSoa() != null
        ) {

            soa =
                    LogementResponse.SoaResponse
                            .builder()
                            .id(
                                    logement
                                            .getCodeSoa()
                                            .getId()
                            )
                            .codeSoa(
                                    logement
                                            .getCodeSoa()
                                            .getCodeSoa()
                            )
                            .build();
        }

        return LogementResponse
                .builder()

                .id(
                        logement.getId()
                )

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
                        logement
                                .getEntiteUtilisatrice()
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

                .anneeInitiale(
                        logement.getAnneeInitiale()
                )

                .dateAvantCondamnation(
                        logement.getDateAvantCondamnation()
                )

                .actif(
                        logement.getActif()
                )

                .soa(soa)

                .build();
    }
    
    // COMPTER LES LOGEMENTS ACTIFS D'UN SOA

    @GetMapping("/count/soa/{soaId}")
    public long countBySoa(@PathVariable Long soaId) {
        return logementRepository.countByCodeSoa_IdAndActifTrue(soaId);
    }

    // DTO CONDAMNATION

    @lombok.Getter
    @lombok.Setter
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CondamnationRequest {

        private LocalDate dateAvantCondamnation;
    }
}