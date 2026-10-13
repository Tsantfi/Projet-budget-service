package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.AffectationEntreeResponse;
import mg.drbf.haigana.entity.AffectationEntree;
import mg.drbf.haigana.entity.Entree;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.AffectationEntreeRepository;
import mg.drbf.haigana.repository.EntreeRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations-entree")
@RequiredArgsConstructor
public class AffectationEntreeController {

    private final AffectationEntreeRepository repository;
    private final EntreeRepository entreeRepository;



    // LISTE


    @GetMapping
    @Transactional(readOnly = true)
    public List<AffectationEntreeResponse> findAll(
            @RequestParam(required = false) Long entreeId
    ) {

        List<AffectationEntree> affectations;

        if (entreeId != null) {
            affectations =
                    repository.findByEntree_Id(entreeId);
        } else {
            affectations =
                    repository.findAll();
        }

        return affectations.stream()
                .map(this::toResponse)
                .toList();
    }



    // DETAIL


    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public AffectationEntreeResponse findById(
            @PathVariable Long id
    ) {

        AffectationEntree affectation =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Affectation introuvable : " + id
                                )
                        );

        return toResponse(affectation);
    }



    // CREATION


    @PostMapping
    @Transactional
    public AffectationEntree create(
            @RequestBody AffectationEntree item
    ) {

        if (item.getEntree() == null ||
                item.getEntree().getId() == null) {

            throw new IllegalArgumentException(
                    "L'entrée est obligatoire."
            );
        }

        Long entreeId =
                item.getEntree().getId();

        Entree entree =
                entreeRepository.findById(entreeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entrée introuvable : "
                                                + entreeId
                                )
                        );

        // Une entrée ne peut avoir qu'une seule affectation
        if (!repository.findByEntree_Id(entreeId).isEmpty()) {

            throw new IllegalStateException(
                    "Cette entrée possède déjà une affectation."
            );
        }

        item.setEntree(entree);

        return repository.save(item);
    }



    // MODIFICATION


    @PutMapping("/{id}")
    @Transactional
    public AffectationEntree update(
            @PathVariable Long id,
            @RequestBody AffectationEntree donnees
    ) {

        AffectationEntree existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Affectation introuvable : "
                                                + id
                                )
                        );

        existing.setDescription(
                donnees.getDescription()
        );

        existing.setLieuAffectation(
                donnees.getLieuAffectation()
        );

        existing.setDateDepart(
                donnees.getDateDepart()
        );

        existing.setDateFin(
                donnees.getDateFin()
        );

        // L'entrée n'est pas modifiée.

        return repository.save(existing);
    }



    // SUPPRESSION


    @DeleteMapping("/{id}")
    @Transactional
    public void delete(
            @PathVariable Long id
    ) {

        AffectationEntree affectation =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Affectation introuvable : "
                                                + id
                                )
                        );

        repository.delete(affectation);
    }



    // CONVERSION ENTITY -> DTO


    private AffectationEntreeResponse toResponse(
            AffectationEntree affectation
    ) {

        Entree entree =
                affectation.getEntree();

        Vehicule vehicule =
                entree != null
                        ? entree.getVehicule()
                        : null;

        return AffectationEntreeResponse.builder()

                // =========================
                // AFFECTATION
                // =========================

                .id(affectation.getId())

                .description(
                        affectation.getDescription()
                )

                .lieuAffectation(
                        affectation.getLieuAffectation()
                )

                .dateDepart(
                        affectation.getDateDepart()
                )

                .dateFin(
                        affectation.getDateFin()
                )

                // =========================
                // VEHICULE
                // =========================

                .vehiculeId(
                        vehicule != null
                                ? vehicule.getId()
                                : null
                )

                .immatricule(
                        vehicule != null
                                ? vehicule.getImmatricule()
                                : null
                )

                .prixVehicule(
                        vehicule != null
                                ? vehicule.getPrixVehicule()
                                : null
                )

                .dateCirculation(
                        vehicule != null
                                ? vehicule.getDateCirculation()
                                : null
                )

                .etat(
                        vehicule != null &&
                        vehicule.getEtat() != null
                                ? vehicule.getEtat()
                                      .getEtatVehicule()
                                : null
                )

                .genre(
                        vehicule != null &&
                        vehicule.getGenre() != null
                                ? vehicule.getGenre()
                                      .getGenreVehicule()
                                : null
                )

                .marque(
                        vehicule != null &&
                        vehicule.getMarque() != null
                                ? vehicule.getMarque()
                                      .getMarqueVehicule()
                                : null
                )

                .type(
                        vehicule != null &&
                        vehicule.getType() != null
                                ? vehicule.getType()
                                      .getTypeDuVehicule()
                                : null
                )

                .carburant(
                        vehicule != null &&
                        vehicule.getCarburant() != null
                                ? vehicule.getCarburant()
                                      .getLibelle()
                                : null
                )

                .lieuAffectationActuel(
                        vehicule != null
                                ? vehicule
                                    .getLieuAffectationActuel()
                                : null
                )

                // =========================
                // ENTREE
                // =========================

                .entreeId(
                        entree != null
                                ? entree.getId()
                                : null
                )

                .reference(
                        entree != null
                                ? entree.getReference()
                                : null
                )

                .dateEntree(
                        entree != null
                                ? entree.getDateEntree()
                                : null
                )

                .typeEntree(
                        entree != null &&
                        entree.getType() != null
                                ? entree.getType().name()
                                : null
                )

                .descriptionEntree(
                        entree != null
                                ? entree.getReference()
                                : null
                )

                .build();
    }
}