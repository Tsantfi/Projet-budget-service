package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.EtatAppreciatifMaterielResponse;
import mg.drbf.haigana.service.EtatAppreciatifMaterielService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/etat-appreciatif-materiel")
@RequiredArgsConstructor
public class EtatAppreciatifMaterielController {

    private final EtatAppreciatifMaterielService service;

    @GetMapping("/soa/{soaId}/annee/{annee}")
    public ResponseEntity<EtatAppreciatifMaterielResponse> charger(
            @PathVariable Long soaId,
            @PathVariable Integer annee
    ) {

        return ResponseEntity.ok(
                service.charger(
                        soaId,
                        annee
                )
        );
    }
}
