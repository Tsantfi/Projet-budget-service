package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.DeplacementRequest;
import mg.drbf.haigana.entity.Deplacement;
import mg.drbf.haigana.entity.TypeSortie;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.DeplacementRepository;
import mg.drbf.haigana.repository.VehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/deplacements")
@RequiredArgsConstructor
public class DeplacementController {

    private final DeplacementRepository repository;
    private final VehiculeRepository vehiculeRepository;


    // LISTE DES DEPLACEMENTS D'UN VEHICULE

    @GetMapping
    public List<Deplacement> findByVehicule(
            @RequestParam Long vehiculeId
    ) {

        return repository
                .findByVehicule_IdOrderByDateDeplacementDesc(
                        vehiculeId
                );
    }


    // LISTE DES DEPLACEMENTS D'UN VEHICULE POUR UNE ANNEE

    @GetMapping("/annee")
    public List<Deplacement> findByVehiculeAndAnnee(
            @RequestParam Long vehiculeId,
            @RequestParam int annee
    ) {

        LocalDate dateDebut =
                LocalDate.of(annee, 1, 1);

        LocalDate dateFin =
                dateDebut.plusYears(1);

        return repository
                .findByVehicule_IdAndDateDeplacementBetweenOrderByDateDeplacementAsc(
                        vehiculeId,
                        dateDebut,
                        dateFin.minusDays(1)
                );
    }


    // DETAIL D'UN DEPLACEMENT

    @GetMapping("/{id}")
    public Deplacement findById(
            @PathVariable Long id
    ) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Déplacement introuvable : " + id
                        )
                );
    }


    // KILOMETRAGE MENSUEL

    @GetMapping("/kilometrage-mensuel")
    public Double getKilometrageMensuel(
            @RequestParam Long vehiculeId,
            @RequestParam int annee,
            @RequestParam int mois
    ) {

        LocalDate dateDebut =
                LocalDate.of(
                        annee,
                        mois,
                        1
                );

        LocalDate dateFin =
                dateDebut.plusMonths(1);

        Double kilometrage =
                repository.calculerKilometrageMensuel(
                        vehiculeId,
                        dateDebut,
                        dateFin
                );

        return kilometrage != null
                ? kilometrage
                : 0.0;
    }


    // KILOMETRAGE ANNUEL

    @GetMapping("/kilometrage-annuel")
    public Double getKilometrageAnnuel(
            @RequestParam Long vehiculeId,
            @RequestParam int annee
    ) {

        LocalDate dateDebut =
                LocalDate.of(
                        annee,
                        1,
                        1
                );

        LocalDate dateFin =
                dateDebut.plusYears(1);

        Double kilometrage =
                repository.calculerKilometrageAnnuel(
                        vehiculeId,
                        dateDebut,
                        dateFin
                );

        return kilometrage != null
                ? kilometrage
                : 0.0;
    }


    // CREATION

    @PostMapping
    public Deplacement create(
            @RequestBody DeplacementRequest request
    ) {

        System.out.println("====================================");
        System.out.println("CREATION DEPLACEMENT");
        System.out.println(
                "vehiculeId reçu = "
                        + request.getVehiculeId()
        );
        System.out.println(
                "date = "
                        + request.getDateDeplacement()
        );
        System.out.println(
                "ordreSortie = "
                        + request.getOrdreSortie()
        );
        System.out.println("====================================");


        // VERIFICATION VEHICULE

        if (request.getVehiculeId() == null) {

            System.out.println(
                    "ERREUR : vehiculeId = NULL"
            );

            throw new IllegalArgumentException(
                    "L'identifiant du véhicule est obligatoire."
            );
        }


        // RECHERCHE VEHICULE

        Vehicule vehicule =
                vehiculeRepository.findById(
                        request.getVehiculeId()
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Véhicule introuvable avec l'id : "
                                        + request.getVehiculeId()
                        )
                );


        System.out.println(
                "Véhicule trouvé = "
                        + vehicule.getImmatricule()
        );


        // CREATION DEPLACEMENT

        Deplacement item =
                new Deplacement();

        item.setVehicule(vehicule);

        item.setDateDeplacement(
                request.getDateDeplacement()
        );

        item.setLieuDepart(
                request.getLieuDepart()
        );

        item.setLieuArrivee(
                request.getLieuArrivee()
        );

        item.setDateFinParcours(
                request.getDateFinParcours()
        );

        item.setTableKilometrique(
                request.getTableKilometrique()
        );


        // ORDRE DE SORTIE

        if (request.getOrdreSortie() != null
                && !request.getOrdreSortie().isBlank()) {

            try {

                item.setOrdreSortie(
                        TypeSortie.valueOf(
                                request.getOrdreSortie()
                        )
                );

            } catch (IllegalArgumentException e) {

                throw new IllegalArgumentException(
                        "Type de sortie invalide : "
                                + request.getOrdreSortie()
                );
            }

        } else {

            item.setOrdreSortie(null);
        }


        // SAUVEGARDE

        Deplacement saved =
                repository.save(item);


        System.out.println(
                "Déplacement créé avec ID = "
                        + saved.getId()
        );

        System.out.println("====================================");


        return saved;
    }


    // MODIFICATION

    @PutMapping("/{id}")
    public Deplacement update(
            @PathVariable Long id,
            @RequestBody DeplacementRequest request
    ) {

        System.out.println("====================================");
        System.out.println("MODIFICATION DEPLACEMENT");
        System.out.println(
                "ID déplacement = " + id
        );
        System.out.println(
                "vehiculeId reçu = "
                        + request.getVehiculeId()
        );
        System.out.println("====================================");


        // RECHERCHE DEPLACEMENT

        Deplacement existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Déplacement introuvable : "
                                                + id
                                )
                        );


        // VEHICULE

        if (request.getVehiculeId() != null) {

            Vehicule vehicule =
                    vehiculeRepository.findById(
                            request.getVehiculeId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Véhicule introuvable avec l'id : "
                                            + request.getVehiculeId()
                            )
                    );

            existing.setVehicule(
                    vehicule
            );
        }


        // AUTRES CHAMPS

        existing.setDateDeplacement(
                request.getDateDeplacement()
        );

        existing.setLieuDepart(
                request.getLieuDepart()
        );

        existing.setLieuArrivee(
                request.getLieuArrivee()
        );

        existing.setDateFinParcours(
                request.getDateFinParcours()
        );

        existing.setTableKilometrique(
                request.getTableKilometrique()
        );


        // ORDRE DE SORTIE

        if (request.getOrdreSortie() != null
                && !request.getOrdreSortie().isBlank()) {

            try {

                existing.setOrdreSortie(
                        TypeSortie.valueOf(
                                request.getOrdreSortie()
                        )
                );

            } catch (IllegalArgumentException e) {

                throw new IllegalArgumentException(
                        "Type de sortie invalide : "
                                + request.getOrdreSortie()
                );
            }

        } else {

            existing.setOrdreSortie(null);
        }

        // SAUVEGARDE

        return repository.save(
                existing
        );
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {

        Deplacement item =
                repository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Déplacement introuvable : "
                                                + id
                                )
                        );

        repository.delete(item);
    }
}