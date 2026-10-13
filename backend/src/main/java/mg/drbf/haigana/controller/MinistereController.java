package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Ministere;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.MinistereRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reference/ministeres")
@RequiredArgsConstructor
public class MinistereController {

    private final MinistereRepository ministereRepository;

    // LISTE

    @GetMapping
    public List<Ministere> findAll(
            @RequestParam(required = false) String recherche
    ) {

        if (recherche != null && !recherche.isBlank()) {
            return ministereRepository
                    .findByNomMinistereContainingIgnoreCase(
                            recherche.trim()
                    );
        }

        return ministereRepository.findAll();
    }
    
    // DETAIL

    @GetMapping("/{id}")
    public Ministere findById(@PathVariable Long id) {

        return ministereRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ministère introuvable : " + id
                        )
                );
    }

    // CREATION

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ministere create(
            @RequestBody Ministere ministere
    ) {

        if (ministere.getNomMinistere() == null
                || ministere.getNomMinistere().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nom du ministère est obligatoire."
            );
        }

        String nom = ministere.getNomMinistere().trim();

        if (ministereRepository.existsByNomMinistereIgnoreCase(nom)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ce ministère existe déjà."
            );
        }

        ministere.setNomMinistere(nom);

        if (ministere.getDistrictMinistere() != null) {
            ministere.setDistrictMinistere(
                    ministere.getDistrictMinistere().trim()
            );
        }

        return ministereRepository.save(ministere);
    }

    // MODIFICATION

    @PutMapping("/{id}")
    public Ministere update(
            @PathVariable Long id,
            @RequestBody Ministere ministere
    ) {

        Ministere existing = ministereRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ministère introuvable : " + id
                        )
                );

        if (ministere.getNomMinistere() == null
                || ministere.getNomMinistere().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nom du ministère est obligatoire."
            );
        }

        String nom = ministere.getNomMinistere().trim();

        if (!existing.getNomMinistere().equalsIgnoreCase(nom)
                && ministereRepository
                    .existsByNomMinistereIgnoreCase(nom)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ce ministère existe déjà."
            );
        }

        existing.setNomMinistere(nom);

        if (ministere.getDistrictMinistere() != null) {
            existing.setDistrictMinistere(
                    ministere.getDistrictMinistere().trim()
            );
        } else {
            existing.setDistrictMinistere(null);
        }

        return ministereRepository.save(existing);
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {

        Ministere ministere = ministereRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Ministère introuvable : " + id
                        )
                );

        ministereRepository.delete(ministere);
    }
}