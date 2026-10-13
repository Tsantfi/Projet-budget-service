package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Carburant;
import mg.drbf.haigana.repository.CarburantRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference/carburants")
@RequiredArgsConstructor
public class CarburantController {

    private final CarburantRepository repository;

    @GetMapping
    public List<Carburant> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Carburant findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Carburant introuvable : " + id));
    }

    @PostMapping
    public Carburant create(@RequestBody Carburant item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Carburant update(@PathVariable Long id, @RequestBody Carburant item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
