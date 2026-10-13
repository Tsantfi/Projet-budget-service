package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Chauffeur;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.ChauffeurRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/chauffeurs")
@RequiredArgsConstructor
public class ChauffeurController {

    private final ChauffeurRepository repository;

    // LISTE / RECHERCHE

    @GetMapping
    public List<Chauffeur> findAll(
            @RequestParam(required = false) String recherche
    ) {

        if (recherche == null || recherche.isBlank()) {
            return repository.findAll();
        }

        String valeur = recherche.trim();

        List<Chauffeur> resultats =
                repository.findByNomChauffeurContainingIgnoreCase(valeur);

        if (!resultats.isEmpty()) {
            return resultats;
        }

        resultats =
                repository.findByCinChauffeurContainingIgnoreCase(valeur);

        if (!resultats.isEmpty()) {
            return resultats;
        }

        return repository.findByImmatriculeChauffeurContainingIgnoreCase(valeur);
    }
    // DETAIL

    @GetMapping("/{id}")
    public Chauffeur findById(@PathVariable Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chauffeur introuvable : " + id
                        )
                );
    }
    // CREATION

    @PostMapping
    public Chauffeur create(@RequestBody Chauffeur chauffeur) {

        if (chauffeur.getImmatriculeChauffeur() != null
                && !chauffeur.getImmatriculeChauffeur().isBlank()
                && repository.existsByImmatriculeChauffeur(
                        chauffeur.getImmatriculeChauffeur()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette immatricule de chauffeur existe déjà."
            );
        }

        return repository.save(chauffeur);
    }

    // MODIFICATION

    @PutMapping("/{id}")
    public Chauffeur update(
            @PathVariable Long id,
            @RequestBody Chauffeur chauffeur
    ) {

        Chauffeur existing = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chauffeur introuvable : " + id
                        )
                );

        existing.setNomChauffeur(
                chauffeur.getNomChauffeur()
        );

        existing.setCinChauffeur(
                chauffeur.getCinChauffeur()
        );

        existing.setImmatriculeChauffeur(
                chauffeur.getImmatriculeChauffeur()
        );

        return repository.save(existing);
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        Chauffeur chauffeur = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Chauffeur introuvable : " + id
                        )
                );

        repository.delete(chauffeur);
    }
}