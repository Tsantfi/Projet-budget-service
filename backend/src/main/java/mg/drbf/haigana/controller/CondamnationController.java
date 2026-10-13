package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.CondamnationResponse;
import mg.drbf.haigana.entity.Condamnation;
import mg.drbf.haigana.repository.CondamnationRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import mg.drbf.haigana.dto.CondamnationRequest;

import java.util.List;

@RestController
@RequestMapping("/api/condamnations")
@RequiredArgsConstructor
public class CondamnationController {

    private final CondamnationRepository condamnationRepository;

    // LISTE DES CONDAMNATIONS

    @GetMapping
    @Transactional(readOnly = true)
    public List<CondamnationResponse> findAll() {

        return condamnationRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // CONDAMNATION PAR ID

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public CondamnationResponse findById(
            @PathVariable Long id) {

        Condamnation condamnation =
                        condamnationRepository.findByIdWithSortie(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Condamnation introuvable : " + id
                                )
                        );

        return toResponse(condamnation);
    }

    // ENTITY -> DTO

    private CondamnationResponse toResponse(
            Condamnation condamnation) {

        String referenceSortie = null;

        if (condamnation.getSortie() != null) {
            referenceSortie =
                    condamnation
                            .getSortie()
                            .getReference();
        }

        return CondamnationResponse.builder()

                .id(
                        condamnation.getId()
                )
                .piece(condamnation.getPiece())

                .immatriculeVehicule(
                        condamnation
                                .getImmatriculeVehicule()
                )

                .dateCondamnation(
                        condamnation
                                .getDateCondamnation()
                )

                .lieuCondamnation(
                        condamnation
                                .getLieuCondamnation()
                )

                .description(
                        condamnation
                                .getDescription()
                )

                .referenceSortie(
                        referenceSortie
                )
                

                .build();
    }
    
    @PutMapping("/{id}")
    @Transactional
    public CondamnationResponse update(
            @PathVariable Long id,
            @RequestBody CondamnationRequest request) {

        Condamnation condamnation =
                condamnationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Condamnation introuvable : " + id
                                )
                        );

        if (request.getImmatriculeVehicule() != null
                && !request.getImmatriculeVehicule().trim().isEmpty()) {

            condamnation.setImmatriculeVehicule(
                    request.getImmatriculeVehicule().trim()
            );
        }

        condamnation.setDateCondamnation(
                request.getDateCondamnation()
        );

        if (request.getLieuCondamnation() != null) {
            condamnation.setLieuCondamnation(
                    request.getLieuCondamnation().trim()
            );
        } else {
            condamnation.setLieuCondamnation(null);
        }

        if (request.getDescription() != null) {
            condamnation.setDescription(
                    request.getDescription().trim()
            );
        } else {
            condamnation.setDescription(null);
        }
        
        // 5. MISE À JOUR DE LA PIÈCE (LIGNE AJOUTÉE)
        if (request.getPiece() != null) {
            condamnation.setPiece(
                    request.getPiece().trim()
            );
        } else {
            condamnation.setPiece(null);
        }

        Condamnation updated =
                condamnationRepository.save(condamnation);

        return toResponse(updated);
    }
    
    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable Long id) {
        Condamnation condamnation = condamnationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condamnation introuvable avec l'ID : " + id));

        // Rupture propre de la relation avec la table Sortie avant suppression
        if (condamnation.getSortie() != null) {
            condamnation.setSortie(null);
            condamnationRepository.saveAndFlush(condamnation);
        }

        condamnationRepository.delete(condamnation);
        condamnationRepository.flush();
    }
}
