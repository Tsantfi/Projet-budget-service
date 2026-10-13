package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Constatation;
import mg.drbf.haigana.entity.Controle;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.ConstatationRepository;
import mg.drbf.haigana.repository.ControleRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constatations")
@RequiredArgsConstructor
public class ConstatationController {

    private final ConstatationRepository repository;
    private final ControleRepository controleRepository;

    // LISTE DES CONSTATATIONS D'UN CONTROLE

    @GetMapping
    public List<Constatation> findByControle(
            @RequestParam Long controleId
    ) {

        if (controleId == null || controleId <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant du contrôle invalide."
            );
        }

        return repository.findByControle_Id(controleId);
    }


    // RECHERCHE D'UNE CONSTATATION
    

    @GetMapping("/{id}")
    public Constatation findById(
            @PathVariable Long id
    ) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant de la constatation invalide."
            );
        }

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Constatation introuvable : " + id
                        )
                );
    }


    // // CREATION D'UNE CONSTATATION
    

    @PostMapping
    @Transactional
    public Constatation create(
            @RequestBody ConstatationRequest request
    ) {

        System.out.println(
                "========== AJOUT CONSTATATION =========="
        );

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données de la constatation sont obligatoires."
            );
        }

        if (request.controleId() == null) {
            throw new IllegalArgumentException(
                    "Le contrôle est obligatoire."
            );
        }

        // -----------------------------------------------------
        // CONTROLE EXISTANT
        // -----------------------------------------------------

        Controle controle =
                controleRepository
                        .findById(request.controleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contrôle introuvable : "
                                                + request.controleId()
                                )
                        );

        // -----------------------------------------------------
        // CREATION DE LA CONSTATATION
        // -----------------------------------------------------

        Constatation constatation =
                Constatation.builder()
                        .controle(controle)
                        .descriptionConstat(
                                request.descriptionConstat()
                        )
                        .dateConstat(
                                request.dateConstat()
                        )
                        .dateDepart(
                                request.dateDepart()
                        )
                        .dateArrivee(
                                request.dateArrivee()
                        )
                        .degat(
                                request.degat()
                        )
                        .raisonDeplacement(
                                request.raisonDeplacement()
                        )
                        .build();

        Constatation saved =
                repository.save(constatation);

        System.out.println(
                "Constatation créée avec ID = "
                        + saved.getId()
                        + " pour le contrôle = "
                        + controle.getId()
        );

        return saved;
    }


    // // MODIFICATION
    

    @PutMapping("/{id}")
    @Transactional
    public Constatation update(
            @PathVariable Long id,
            @RequestBody ConstatationRequest request
    ) {

        System.out.println(
                "========== MODIFICATION CONSTATATION =========="
        );

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "Identifiant de la constatation invalide."
            );
        }

        if (request == null) {
            throw new IllegalArgumentException(
                    "Les données de la constatation sont obligatoires."
            );
        }

        // -----------------------------------------------------
        // CONSTATATION EXISTANTE
        // -----------------------------------------------------

        Constatation existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Constatation introuvable : "
                                                + id
                                )
                        );

        // -----------------------------------------------------
        // CONTROLE
        // -----------------------------------------------------

        if (request.controleId() != null) {

            Controle controle =
                    controleRepository
                            .findById(
                                    request.controleId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Contrôle introuvable : "
                                                    + request.controleId()
                                    )
                            );

            existing.setControle(controle);
        }

        // -----------------------------------------------------
        // MODIFICATION
        // -----------------------------------------------------

        existing.setDescriptionConstat(
                request.descriptionConstat()
        );

        existing.setDateConstat(
                request.dateConstat()
        );

        existing.setDateDepart(
                request.dateDepart()
        );

        existing.setDateArrivee(
                request.dateArrivee()
        );

        existing.setDegat(
                request.degat()
        );

        existing.setRaisonDeplacement(
                request.raisonDeplacement()
        );

        return repository.save(existing);
    }


    // SUPPRESSION

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(
            @PathVariable Long id
    ) {

        System.out.println(
                "========== SUPPRESSION CONSTATATION =========="
        );

        Constatation constatation =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Constatation introuvable : "
                                                + id
                                )
                        );

        repository.delete(constatation);

        System.out.println(
                "Constatation supprimée : "
                        + id
        );
    }

    // DTO

    public record ConstatationRequest(
            Long controleId,
            String descriptionConstat,
            java.time.LocalDate dateConstat,
            java.time.LocalDate dateDepart,
            java.time.LocalDate dateArrivee,
            String degat,
            String raisonDeplacement

    ) {
    }
}
