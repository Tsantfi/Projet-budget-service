package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.TypeVehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.TypeVehiculeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference/types")
@RequiredArgsConstructor
public class TypeVehiculeController {

    private final TypeVehiculeRepository repository;

    @GetMapping
    public List<TypeVehicule> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public TypeVehicule findById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Type de véhicule introuvable : " + id
                        )
                );
    }

    @PostMapping
    public TypeVehicule create(@RequestBody TypeVehicule item) {
        return repository.save(item);
    }

    @PutMapping("/{id}")
    public TypeVehicule update(
            @PathVariable Long id,
            @RequestBody TypeVehicule item
    ) {
        TypeVehicule existing = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Type de véhicule introuvable : " + id
                        )
                );

        existing.setTypeDuVehicule(item.getTypeDuVehicule());

        return repository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        TypeVehicule existing = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Type de véhicule introuvable : " + id
                        )
                );

        repository.delete(existing);
    }
}