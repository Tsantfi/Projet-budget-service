package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Marque;
import mg.drbf.haigana.repository.MarqueRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference/marques")
@RequiredArgsConstructor
public class MarqueController {

    private final MarqueRepository repository;

    @GetMapping
    public List<Marque> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Marque findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Marque introuvable : " + id));
    }

    @PostMapping
    public Marque create(@RequestBody Marque item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Marque update(@PathVariable Long id, @RequestBody Marque item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
