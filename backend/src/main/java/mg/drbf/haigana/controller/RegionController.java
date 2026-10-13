package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Region;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.RegionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reference/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionRepository regionRepository;

  
    // LISTE
  

    @GetMapping
    public List<Region> findAll(
            @RequestParam(required = false) String recherche
    ) {

        if (recherche != null && !recherche.isBlank()) {
            return regionRepository
                    .findByNomRegionContainingIgnoreCase(
                            recherche.trim()
                    );
        }

        return regionRepository.findAll();
    }

  
    // DETAIL
  

    @GetMapping("/{id}")
    public Region findById(@PathVariable Long id) {

        return regionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Région introuvable : " + id
                        )
                );
    }

  
    // CREATION
  

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Region create(@RequestBody Region region) {

        if (region.getNomRegion() == null
                || region.getNomRegion().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nom de la région est obligatoire."
            );
        }

        String nom = region.getNomRegion().trim();

        if (regionRepository.existsByNomRegionIgnoreCase(nom)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette région existe déjà."
            );
        }

        region.setNomRegion(nom);

        return regionRepository.save(region);
    }

  
    // MODIFICATION
  

    @PutMapping("/{id}")
    public Region update(
            @PathVariable Long id,
            @RequestBody Region region
    ) {

        Region existing = regionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Région introuvable : " + id
                        )
                );

        if (region.getNomRegion() == null
                || region.getNomRegion().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nom de la région est obligatoire."
            );
        }

        String nom = region.getNomRegion().trim();

        if (!existing.getNomRegion().equalsIgnoreCase(nom)
                && regionRepository.existsByNomRegionIgnoreCase(nom)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cette région existe déjà."
            );
        }

        existing.setNomRegion(nom);

        return regionRepository.save(existing);
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {

        Region region = regionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Région introuvable : " + id
                        )
                );

        regionRepository.delete(region);
    }
}