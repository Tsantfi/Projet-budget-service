package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Suivi;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.SuiviRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/suivis")
@RequiredArgsConstructor
public class SuiviController {

    private final SuiviRepository repository;
    private final VehiculeRepository vehiculeRepository;


    // RECHERCHE DES SUIVIS D'UN VEHICULE


    @GetMapping
    public List<Suivi> findByVehicule(
            @RequestParam Long vehiculeId) {

        if (vehiculeId == null || vehiculeId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du véhicule invalide."
            );
        }

        return repository.findByVehicule_Id(vehiculeId);
    }


    // RECHERCHE PAR ID


    @GetMapping("/{id}")
    public Suivi findById(@PathVariable Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Suivi introuvable : " + id
                        )
                );
    }


    // AJOUT


    @PostMapping
    public Suivi create(
            @RequestBody SuiviRequest request) {

        System.out.println(
                "========== AJOUT SUIVI =========="
        );

        System.out.println(
                "vehiculeId reçu = " +
                request.vehiculeId()
        );

        if (request.vehiculeId() == null) {
            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        Vehicule vehicule =
                vehiculeRepository.findById(
                        request.vehiculeId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Véhicule introuvable : " +
                                request.vehiculeId()
                        )
                );

        Suivi suivi = new Suivi();

        suivi.setVehicule(vehicule);
        suivi.setDescription(request.description());
        suivi.setDateSuivi(request.dateSuivi());
        suivi.setPieceJustificativeUrl(
                request.pieceJustificativeUrl()
        );

        return repository.save(suivi);
    }


    // MODIFICATION


    @PutMapping("/{id}")
    public Suivi update(
            @PathVariable Long id,
            @RequestBody SuiviRequest request) {

        System.out.println(
                "========== MODIFICATION SUIVI =========="
        );

        System.out.println(
                "ID suivi = " + id
        );

        System.out.println(
                "vehiculeId reçu = " +
                request.vehiculeId()
        );

        Suivi existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Suivi introuvable : " + id
                                )
                        );

        if (request.vehiculeId() == null) {
            throw new IllegalArgumentException(
                    "Le véhicule est obligatoire."
            );
        }

        Vehicule vehicule =
                vehiculeRepository.findById(
                        request.vehiculeId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Véhicule introuvable : " +
                                request.vehiculeId()
                        )
                );

        existing.setVehicule(vehicule);

        existing.setDescription(
                request.description()
        );

        existing.setDateSuivi(
                request.dateSuivi()
        );

        existing.setPieceJustificativeUrl(
                request.pieceJustificativeUrl()
        );

        return repository.save(existing);
    }


    // SUPPRESSION


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Suivi introuvable : " + id
            );
        }

        repository.deleteById(id);
    }


    // DTO


    public record SuiviRequest(
            Long vehiculeId,
            String description,
            LocalDate dateSuivi,
            String pieceJustificativeUrl
    ) {
    }
}