package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.repository.CondamnationRepository;
import mg.drbf.haigana.service.StatistiqueService;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import java.util.Map;

@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
public class StatistiqueController {
    

    private final StatistiqueService service;
    private final CondamnationRepository condamnationRepository;
    // TOTAL VEHICULES

    @GetMapping("/total-vehicules")
    public long totalVehicules() {
        return service.getTotalVehicules();
    }
    // VALEUR TOTALE

    

    @GetMapping("/valeur-totale")
    public double valeurTotale() {
        return service.getValeurTotale();
    }
    // ETAT

    @GetMapping("/par-etat")
    public Map<String, Long> parEtat() {
        return service.getParEtat();
    }

    // GENRE

    @GetMapping("/par-genre")
    public Map<String, Long> parGenre() {
        return service.getParGenre();
    }

    // MARQUE

    @GetMapping("/par-marque")
    public Map<String, Long> parMarque() {
        return service.getParMarque();
    }

    // ENTRETIENS FAITS / NON FAITS


    @GetMapping("/entretiens")
    public Map<String, Long> entretiens() {
        return service.getEntretiens();
    }

    // ORDRES D'ENTREE

    @GetMapping("/ordres-entree")
    public Map<String, Long> ordresEntree() {
        return service.getOrdresEntree();
    }

    // ORDRES DE SORTIE

    @GetMapping("/ordres-sortie")
    public Map<String, Long> ordresSortie() {
        return service.getOrdresSortie();
    }

    // SUIVI

    @GetMapping("/suivi")
    public Map<String, Long> suivi() {
        return service.getSuivi();
    }

    // CONTROLE

    @GetMapping("/controle")
    public Map<String, Long> controle() {
        return service.getControle();
    }

    // ENTRETIENS PAR MARQUE

    @GetMapping("/entretiens-par-marque")
    public Map<String, Long> entretiensParMarque() {
        return service.getEntretiensParMarque();
    }

    // TOTAL CONDAMNATIONS

    @GetMapping("/total-condamnations")
    public long totalCondamnations() {

        return condamnationRepository.count();
    }
    
    // CONDAMNATIONS PAR ANNEE

    @GetMapping("/condamnations-par-annee")
    public Map<Integer, Long> condamnationsParAnnee() {
        return condamnationRepository
                .countCondamnationsParAnnee()
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> ((Number) row[1]).longValue(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }
    
    // CONDAMNATIONS PAR LIEU

    @GetMapping("/condamnations-par-lieu")
    public Map<String, Long> condamnationsParLieu() {

        return condamnationRepository
                .countCondamnationsParLieu()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).longValue(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    // BONS DE COMMANDE

    @GetMapping("/bons-commande")
    public Map<String, Long> bonsCommande() {
        return service.getBonsCommande();
    }
}