package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.RecensementMaterielCreateRequest;
import mg.drbf.haigana.dto.RecensementMaterielLigneUpdateRequest;
import mg.drbf.haigana.dto.RecensementMaterielResponse;
import mg.drbf.haigana.dto.RecensementMaterielComparaisonResponse;
import mg.drbf.haigana.service.RecensementMaterielService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/recensements-materiel")
@RequiredArgsConstructor
public class RecensementMaterielController {

    private final RecensementMaterielService recensementMaterielService;

    // CREER

    @PostMapping
    public ResponseEntity<RecensementMaterielResponse> creer(
            @RequestBody RecensementMaterielCreateRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        recensementMaterielService
                                .creerRecensement(request)
                );
    }
    
    // PAR ID

    @GetMapping("/{id}")
    public ResponseEntity<RecensementMaterielResponse> charger(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                recensementMaterielService
                        .chargerRecensement(id)
        );
    }

    // PAR SOA + ANNEE

    @GetMapping("/soa/{soaId}/annee/{annee}")
    public ResponseEntity<?> rechercherParSoaEtAnnee(
            @PathVariable Long soaId,
            @PathVariable Integer annee
    ) {

        RecensementMaterielResponse response =
                recensementMaterielService
                        .rechercherParSoaEtAnnee(
                                soaId,
                                annee
                        );

        if (response == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    "Aucun recensement matériel n'existe pour ce SOA et cette année."
                            )
                    );
        }

        return ResponseEntity.ok(response);
    }

    // MODIFIER UNE LIGNE

    @PutMapping("/{recensementId}/lignes/{ligneId}")
    public ResponseEntity<RecensementMaterielResponse>
    modifierLigne(
            @PathVariable Long recensementId,
            @PathVariable Long ligneId,
            @RequestBody RecensementMaterielLigneUpdateRequest request
    ) {

        return ResponseEntity.ok(
                recensementMaterielService
                        .modifierLigne(
                                recensementId,
                                ligneId,
                                request
                        )
        );
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RecensementMaterielResponse> modifierRecensement(
            @PathVariable Long id,
            @RequestBody RecensementMaterielCreateRequest request
    ) {

        return ResponseEntity.ok(
                recensementMaterielService.modifierRecensement(
                        id,
                        request
                )
        );
    }
    
    //ELEMENT CONSTITUTIF DE LA COMPARAISON
    
    @GetMapping("/{id}/comparaison")
    public ResponseEntity<RecensementMaterielComparaisonResponse>
    comparer(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                recensementMaterielService.comparerAvecInventaire(id)
        );
    }
    
    @PostMapping("/{recensementId}/nouveaux/{materielId}")
    public ResponseEntity<RecensementMaterielResponse>
    ajouterNouveau(
            @PathVariable Long recensementId,
            @PathVariable Long materielId
    ) {

        return ResponseEntity.ok(
                recensementMaterielService.ajouterNouveauMateriel(
                        recensementId,
                        materielId
                )
        );
    }

        //SUPPRESSION DE LA LIGNE RECENSEMENT
        @DeleteMapping("/{recensementId}/lignes/{ligneId}")
        public ResponseEntity<RecensementMaterielResponse>
        supprimerLigne(
                @PathVariable Long recensementId,
                @PathVariable Long ligneId
        ) {

        return ResponseEntity.ok(
                recensementMaterielService
                        .supprimerLigneRecensement(
                                recensementId,
                                ligneId
                        )
        );
    }
        
    // SUPPRESSION COMPLETE DU RECENSEMENT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerRecensement(
            @PathVariable Long id
    ) {
        recensementMaterielService.supprimerRecensement(id);
        return ResponseEntity.noContent().build();
    }
}
