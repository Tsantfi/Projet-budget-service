package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.EntreeRequest;
import mg.drbf.haigana.dto.EntreeResponse;
import mg.drbf.haigana.service.EntreeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entrees")
@RequiredArgsConstructor
public class EntreeController {

    private final EntreeService service;

    @GetMapping
    public List<EntreeResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EntreeResponse findById(
            @PathVariable Long id
    ) {
        return service.findById(id);
    }

    @GetMapping("/vehicule/{vehiculeId}")
    public EntreeResponse findByVehicule(
            @PathVariable Long vehiculeId
    ) {
        return service.findByVehicule(vehiculeId);
    }

    // ==========================================
    // CREATION COMPLETE
    // ==========================================

    @PostMapping
    public EntreeResponse create(
            @RequestBody EntreeRequest request
    ) {
        return service.createComplete(request);
    }

    // ==========================================
    // PRISE EN CHARGE
    // ==========================================

    @PostMapping("/prise-en-charge")
    public EntreeResponse createPriseEnCharge(
            @RequestBody EntreeRequest request
    ) {
        return service.createPriseEnCharge(request);
    }

    // ==========================================
    // MODIFICATION COMPLETE
    // ==========================================

    @PutMapping("/{id}")
    public EntreeResponse update(
            @PathVariable Long id,
            @RequestBody EntreeRequest request
    ) {
        return service.update(id, request);
    }

    // ==========================================
    // SUPPRESSION
    // ==========================================

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        service.delete(id);
    }
}