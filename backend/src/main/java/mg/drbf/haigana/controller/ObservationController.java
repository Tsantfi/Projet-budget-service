package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.Observation;
import mg.drbf.haigana.repository.ObservationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationRepository repository;

    @GetMapping
    public List<Observation> findByBonCommande(@RequestParam Long bonCommandeId) {
        return repository.findByBonCommande_Id(bonCommandeId);
    }

    @PostMapping
    public Observation create(@RequestBody Observation item) {
        return repository.save(item);
    }
}
