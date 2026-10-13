package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Mecanicien;
import mg.drbf.haigana.repository.MecanicienRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mecaniciens")
@RequiredArgsConstructor
public class MecanicienController {

    private final MecanicienRepository repository;

    @GetMapping
    public List<Mecanicien> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Mecanicien findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Mecanicien introuvable : " + id));
    }

    @PostMapping
    public Mecanicien create(@RequestBody Mecanicien item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Mecanicien update(@PathVariable Long id, @RequestBody Mecanicien item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
