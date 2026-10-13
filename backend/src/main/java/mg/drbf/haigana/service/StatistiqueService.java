package mg.drbf.haigana.service;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.*;
import mg.drbf.haigana.repository.*;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatistiqueService {

    private final VehiculeRepository vehiculeRepository;
    private final EntreeRepository entreeRepository;
    private final SortieRepository sortieRepository;
    private final EntretienRepository entretienRepository;
    private final SuiviRepository suiviRepository;
    private final ControleRepository controleRepository;
    private final BonCommandeRepository bonCommandeRepository;
    private final CondamnationRepository condamnationRepository;

    // OUTIL

    private Map<String, Long> countBy(
            Collection<String> values
    ) {
        return values.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        Function.identity(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    // TOTAL VEHICULES

    public long getTotalVehicules() {
        return vehiculeRepository.count();
    }

    // VALEUR TOTALE DU PARC

    public double getValeurTotale() {

        return vehiculeRepository.findAll()
                .stream()
                .map(Vehicule::getPrixVehicule)
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .sum();
    }
    // REPARTITION PAR ETAT

    public Map<String, Long> getParEtat() {

        return countBy(
                vehiculeRepository.findAll()
                        .stream()
                        .map(v ->
                                v.getEtat() != null
                                        ? v.getEtat().getEtatVehicule()
                                        : "Non renseigné"
                        )
                        .toList()
        );
    }
    // REPARTITION PAR GENRE

    public Map<String, Long> getParGenre() {

        return countBy(
                vehiculeRepository.findAll()
                        .stream()
                        .map(v ->
                                v.getGenre() != null
                                        ? v.getGenre().getGenreVehicule()
                                        : "Non renseigné"
                        )
                        .toList()
        );
    }

    // REPARTITION PAR MARQUE

    public Map<String, Long> getParMarque() {

        return countBy(
                vehiculeRepository.findAll()
                        .stream()
                        .map(v ->
                                v.getMarque() != null
                                        ? v.getMarque().getMarqueVehicule()
                                        : "Non renseigné"
                        )
                        .toList()
        );
    }

    // ENTRETIEN : FAIT / PAS FAIT

    public Map<String, Long> getEntretiens() {

        List<Vehicule> vehicules =
                vehiculeRepository.findAll();

        Set<Long> vehiculesEntretenus =
                entretienRepository.findAll()
                        .stream()
                        .filter(e -> e.getVehicule() != null)
                        .map(e -> e.getVehicule().getId())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        long entretienFait =
                vehicules.stream()
                        .filter(v ->
                                vehiculesEntretenus.contains(v.getId())
                        )
                        .count();

        long entretienPasFait =
                vehicules.size() - entretienFait;

        Map<String, Long> resultat =
                new LinkedHashMap<>();

        resultat.put("Entretien fait", entretienFait);
        resultat.put("Entretien non fait", entretienPasFait);

        return resultat;
    }
    // ORDRES D'ENTREE
    //
    // Achat / Don / Affectation
    // HISTOGRAMME VERTICAL COTE FRONTEND

    public Map<String, Long> getOrdresEntree() {

        return countBy(
                entreeRepository.findAll()
                        .stream()
                        .map(e ->
                                e.getType() != null
                                        ? e.getType().name()
                                        : "Non renseigné"
                        )
                        .toList()
        );
    }

    // ORDRES DE SORTIE
    //
    // Affectation / Condamnation / autres types
    // HISTOGRAMME VERTICAL COTE FRONTEND

    public Map<String, Long> getOrdresSortie() {

        return countBy(
                sortieRepository.findAll()
                        .stream()
                        .map(s ->
                                s.getType() != null
                                        ? s.getType().name()
                                        : "Non renseigné"
                        )
                        .toList()
        );
    }

    // VEHICULES SUIVIS / NON SUIVIS
    // CERCLE

    public Map<String, Long> getSuivi() {

        long total =
                vehiculeRepository.count();

        Set<Long> vehiculesSuivis =
                suiviRepository.findAll()
                        .stream()
                        .filter(s -> s.getVehicule() != null)
                        .map(s -> s.getVehicule().getId())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        long suivis =
                vehiculesSuivis.size();

        long nonSuivis =
                Math.max(0, total - suivis);

        Map<String, Long> resultat =
                new LinkedHashMap<>();

        resultat.put("Suivis", suivis);
        resultat.put("Non suivis", nonSuivis);

        return resultat;
    }

    // VEHICULES CONTROLES / NON CONTROLES
    // CERCLE

    public Map<String, Long> getControle() {

        long total =
                vehiculeRepository.count();

        Set<Long> vehiculesControles =
                controleRepository.findAll()
                        .stream()
                        .filter(c -> c.getVehicule() != null)
                        .map(c -> c.getVehicule().getId())
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

        long controles =
                vehiculesControles.size();

        long nonControles =
                Math.max(0, total - controles);

        Map<String, Long> resultat =
                new LinkedHashMap<>();

        resultat.put("Contrôlés", controles);
        resultat.put("Non contrôlés", nonControles);

        return resultat;
    }

    // ENTRETIENS PAR MARQUE
    // HISTOGRAMME VERTICAL

    public Map<String, Long> getEntretiensParMarque() {

        return countBy(
                entretienRepository.findAll()
                        .stream()
                        .map(e -> {

                            if (e.getVehicule() == null) {
                                return "Non renseigné";
                            }

                            if (e.getVehicule().getMarque() == null) {
                                return "Sans marque";
                            }

                            return e.getVehicule()
                                    .getMarque()
                                    .getMarqueVehicule();
                        })
                        .toList()
        );
    }

// BONS DE COMMANDE
// PAYES / NON PAYES

public Map<String, Long> getBonsCommande() {

    long payes =
            bonCommandeRepository.countByStatut(
                    StatutPaiement.PAYE
            );

    long nonPayes =
            bonCommandeRepository.countByStatut(
                    StatutPaiement.NON_PAYE
            );

    Map<String, Long> resultat =
            new LinkedHashMap<>();

    resultat.put("Payés", payes);
    resultat.put("Non payés", nonPayes);

    return resultat;
    }
    
    public long getTotalCondamnes() {
        return condamnationRepository.count();
    }
}
