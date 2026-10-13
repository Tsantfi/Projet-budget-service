package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Piece;
import mg.drbf.haigana.repository.PieceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pieces")
@RequiredArgsConstructor
public class PieceController {

    private final PieceRepository repository;

    @GetMapping
    public List<Piece> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Piece findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new mg.drbf.haigana.exception.ResourceNotFoundException("Piece introuvable : " + id));
    }

    @PostMapping
    public Piece create(@RequestBody Piece item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public Piece update(@PathVariable Long id, @RequestBody Piece item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
