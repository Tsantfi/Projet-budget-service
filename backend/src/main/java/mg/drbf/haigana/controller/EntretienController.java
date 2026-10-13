package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Entretien;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.EntretienRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entretiens")
@RequiredArgsConstructor
public class EntretienController {

    private final EntretienRepository repository;

    @GetMapping
    public List<Entretien> findByVehicule(@RequestParam Long vehiculeId) {
        return repository.findByVehicule_Id(vehiculeId);
    }

    @GetMapping("/{id}")
    public Entretien findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entretien introuvable : " + id));
    }

    @PostMapping
    public Entretien create(@RequestBody Entretien item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Entretien update(@PathVariable Long id, @RequestBody Entretien item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
