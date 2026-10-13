package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Chef;
import mg.drbf.haigana.repository.ChefRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chefs")
@RequiredArgsConstructor
public class ChefController {

    private final ChefRepository repository;

    @GetMapping
    public List<Chef> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Chef findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Chef introuvable : " + id));
    }

    @PostMapping
    public Chef create(@RequestBody Chef item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Chef update(@PathVariable Long id, @RequestBody Chef item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
