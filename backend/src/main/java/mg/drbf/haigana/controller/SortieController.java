package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Sortie;
import mg.drbf.haigana.service.SortieService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sorties")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SortieController {

    private final SortieService service;

    // LISTE DES SORTIES

    @GetMapping
    public List<Sortie> findAll(
            @RequestParam(required = false) Long vehiculeId
    ) {
        return service.findAll(vehiculeId);
    }

    // DETAIL D'UNE SORTIE

    @GetMapping("/{id}")
    public Sortie findById(
            @PathVariable Long id
    ) {
        return service.findById(id);
    }

    // CREATION

    @PostMapping
    public Sortie create(
            @RequestBody Sortie sortie
    ) {
        return service.create(sortie);
    }

    // MODIFICATION

    @PutMapping("/{id}")
    public Sortie update(
            @PathVariable Long id,
            @RequestBody Sortie sortie
    ) {
        return service.update(id, sortie);
    }

    // SUPPRESSION

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }
}
