package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Detenteur;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.DetenteurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import mg.drbf.haigana.repository.VehiculeRepository;
import mg.drbf.haigana.entity.Vehicule;

import java.util.List;

@RestController
@RequestMapping("/api/detenteurs")
@RequiredArgsConstructor
public class DetenteurController {

    private final DetenteurRepository detenteurRepository;
    private final VehiculeRepository vehiculeRepository;

    // LISTE / RECHERCHE


    @GetMapping
    public List<Detenteur> findAll(
            @RequestParam(required = false) String recherche
    ) {

        if (recherche != null && !recherche.isBlank()) {

            String valeur = recherche.trim();

            return detenteurRepository
                    .findByNomOrPrenomComplete(valeur);
        }

        return detenteurRepository.findAllComplete();
    }
    // RECHERCHE PAR CIN
    
    @GetMapping("/{id}/vehicules")
    public List<Vehicule> getVehiculesDuDetenteur(
            @PathVariable Long id
    ) {

        detenteurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Detenteur introuvable : " + id
                        )
                );

        return vehiculeRepository.findByDetenteur_Id(id);
    }

    @GetMapping("/cin/{cin}")
    public List<Detenteur> findByCin(@PathVariable String cin) {

        return detenteurRepository.findByCinComplete(cin);
    }

    // DETAIL

    @GetMapping("/{id}")
    public Detenteur findById(@PathVariable Long id) {

        return detenteurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Detenteur introuvable : " + id
                        )
                );
    }
    // CREATION

    @PostMapping
    public Detenteur create(@RequestBody Detenteur detenteur) {

        if (detenteur.getCinDetenteur() != null
                && !detenteur.getCinDetenteur().isBlank()
                && detenteurRepository.existsByCinDetenteur(
                        detenteur.getCinDetenteur()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un détenteur avec ce CIN existe déjà."
            );
        }

        if (detenteur.getImmatriculeDetenteur() != null
                && !detenteur.getImmatriculeDetenteur().isBlank()
                && detenteurRepository.existsByImmatriculeDetenteur(
                        detenteur.getImmatriculeDetenteur()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette immatricule de détenteur existe déjà."
            );
        }

        return detenteurRepository.save(detenteur);
    }
    // MODIFICATION

    @PutMapping("/{id}")
    public Detenteur update(
            @PathVariable Long id,
            @RequestBody Detenteur detenteur
    ) {

        Detenteur existing = detenteurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Detenteur introuvable : " + id
                        )
                );

        /*
         * On conserve l'ID existant.
         */
        existing.setNomDetenteur(detenteur.getNomDetenteur());
        existing.setPrenomDetenteur(detenteur.getPrenomDetenteur());
        existing.setCinDetenteur(detenteur.getCinDetenteur());
        existing.setImmatriculeDetenteur(
                detenteur.getImmatriculeDetenteur()
        );
        existing.setDistrictDetenteur(
                detenteur.getDistrictDetenteur()
        );
        existing.setService(detenteur.getService());

        return detenteurRepository.save(existing);
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        Detenteur detenteur = detenteurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Detenteur introuvable : " + id
                        )
                );

        // Vérifier si le détenteur est encore associé à un véhicule
        List<Vehicule> vehicules = vehiculeRepository.findByDetenteur_Id(id);

        if (!vehicules.isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossible de supprimer ce détenteur : " +
                    "il est encore associé à " +
                    vehicules.size() +
                    " véhicule(s)."
            );
        }

        // Aucun véhicule associé → suppression autorisée
        detenteurRepository.delete(detenteur);
}   
}