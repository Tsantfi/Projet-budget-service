package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.ArgentPublicVehiculeRequest;
import mg.drbf.haigana.dto.ArgentPublicVehiculeResponse;
import mg.drbf.haigana.entity.ArgentPublicVehicule;
import mg.drbf.haigana.repository.ArgentPublicVehiculeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/argent-public-vehicule")
@RequiredArgsConstructor
public class ArgentPublicVehiculeController {

    private final ArgentPublicVehiculeRepository repository;

    // GET — ADMINISTRATEUR + CONSULTANT

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'CONSULTANT')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<ArgentPublicVehiculeResponse>> findAll() {

        List<ArgentPublicVehiculeResponse> result =
                repository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(result);
    }

    // GET BY ID — ADMINISTRATEUR + CONSULTANT

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'CONSULTANT')")
    @Transactional(readOnly = true)
    public ResponseEntity<ArgentPublicVehiculeResponse> findById(
            @PathVariable Long id) {

        return repository.findById(id)
                .map(argent -> ResponseEntity.ok(toResponse(argent)))
                .orElse(ResponseEntity.notFound().build());
    }

    // POST — ADMINISTRATEUR UNIQUEMENT

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<?> create(
            @RequestBody ArgentPublicVehiculeRequest request) {

        if (request.getMontantTotal() == null) {
            return ResponseEntity.badRequest()
                    .body("Le montant total est obligatoire.");
        }

        if (request.getMontantTotal() < 0) {
            return ResponseEntity.badRequest()
                    .body("Le montant total ne peut pas être négatif.");
        }

        Double montantUtilise =
                request.getMontantUtilise() == null
                        ? 0.0
                        : request.getMontantUtilise();

        if (montantUtilise < 0) {
            return ResponseEntity.badRequest()
                    .body("Le montant utilisé ne peut pas être négatif.");
        }

        if (montantUtilise > request.getMontantTotal()) {
            return ResponseEntity.badRequest()
                    .body(
                            "Le montant utilisé ne peut pas être supérieur "
                                    + "au montant total."
                    );
        }

        double montantDisponible =
                request.getMontantTotal() - montantUtilise;

        ArgentPublicVehicule argent =
                ArgentPublicVehicule.builder()
                        .montantTotal(
                                request.getMontantTotal()
                        )
                        .montantUtilise(
                                montantUtilise
                        )
                        .montantDisponible(
                                montantDisponible
                        )
                        .dateCreation(
                                LocalDateTime.now()
                        )
                        .build();

        ArgentPublicVehicule saved =
                repository.save(argent);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(saved));
    }

    // PUT — ADMINISTRATEUR UNIQUEMENT

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody ArgentPublicVehiculeRequest request) {

        ArgentPublicVehicule argent =
                repository.findById(id)
                        .orElse(null);

        if (argent == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.getMontantTotal() == null) {
            return ResponseEntity.badRequest()
                    .body("Le montant total est obligatoire.");
        }

        if (request.getMontantTotal() < 0) {
            return ResponseEntity.badRequest()
                    .body("Le montant total ne peut pas être négatif.");
        }

        Double montantUtilise =
                request.getMontantUtilise() == null
                        ? 0.0
                        : request.getMontantUtilise();

        if (montantUtilise < 0) {
            return ResponseEntity.badRequest()
                    .body("Le montant utilisé ne peut pas être négatif.");
        }

        if (montantUtilise > request.getMontantTotal()) {
            return ResponseEntity.badRequest()
                    .body(
                            "Le montant utilisé ne peut pas être supérieur "
                                    + "au montant total."
                    );
        }

        double montantDisponible =
                request.getMontantTotal() - montantUtilise;

        argent.setMontantTotal(
                request.getMontantTotal()
        );

        argent.setMontantUtilise(
                montantUtilise
        );

        argent.setMontantDisponible(
                montantDisponible
        );

        argent.setDateModification(
                LocalDateTime.now()
        );

        ArgentPublicVehicule updated =
                repository.save(argent);

        return ResponseEntity.ok(
                toResponse(updated)
        );
    }

    // DELETE — ADMINISTRATEUR UNIQUEMENT

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // CONVERSION ENTITY → RESPONSE

    private ArgentPublicVehiculeResponse toResponse(
            ArgentPublicVehicule argent) {

        return ArgentPublicVehiculeResponse.builder()
                .id(argent.getId())
                .montantTotal(
                        argent.getMontantTotal()
                )
                .montantDisponible(
                        argent.getMontantDisponible()
                )
                .montantUtilise(
                        argent.getMontantUtilise()
                )
                .dateCreation(
                        argent.getDateCreation()
                )
                .dateModification(
                        argent.getDateModification()
                )
                .build();
    }
}