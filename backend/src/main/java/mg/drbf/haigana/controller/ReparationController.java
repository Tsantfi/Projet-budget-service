package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Reparation;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.ReparationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reparations")
@RequiredArgsConstructor
public class ReparationController {

    private final ReparationRepository repository;

    @GetMapping
    public List<Reparation> findByVehicule(@RequestParam Long vehiculeId) {
        return repository.findByVehicule_Id(vehiculeId);
    }

    @GetMapping("/{id}")
    public Reparation findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reparation introuvable : " + id));
    }

    @PostMapping
    public Reparation create(@RequestBody Reparation item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Reparation update(@PathVariable Long id, @RequestBody Reparation item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
