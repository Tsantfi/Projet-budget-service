package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Genre;
import mg.drbf.haigana.repository.GenreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreRepository repository;

    @GetMapping
    public List<Genre> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Genre findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Genre introuvable : " + id));
    }

    @PostMapping
    public Genre create(@RequestBody Genre item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Genre update(@PathVariable Long id, @RequestBody Genre item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
