package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.ProcesVerbal;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.ProcesVerbalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proces-verbaux")
@RequiredArgsConstructor
public class ProcesVerbalController {

    private final ProcesVerbalRepository repository;

    @GetMapping
    public List<ProcesVerbal> findByConstatation(@RequestParam Long constatationId) {
        return repository.findByConstatation_Id(constatationId);
    }

    @PostMapping
    public ProcesVerbal create(@RequestBody ProcesVerbal item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public ProcesVerbal update(@PathVariable Long id, @RequestBody ProcesVerbal item) {
        item.setId(id);
        return repository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
