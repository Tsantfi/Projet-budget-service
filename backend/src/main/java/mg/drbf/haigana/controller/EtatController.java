package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Etat;
import mg.drbf.haigana.repository.EtatRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference/etats")
@RequiredArgsConstructor
public class EtatController {

    private final EtatRepository repository;

    @GetMapping
    public List<Etat> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Etat findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Etat introuvable : " + id));
    }

    @PostMapping
    public Etat create(@RequestBody Etat item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Etat update(@PathVariable Long id, @RequestBody Etat item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
