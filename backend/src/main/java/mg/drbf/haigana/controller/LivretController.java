package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.entity.BonCommande;
import mg.drbf.haigana.entity.Livret;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.BonCommandeRepository;
import mg.drbf.haigana.repository.LivretRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/livrets")
@RequiredArgsConstructor
public class LivretController {

    private final LivretRepository livretRepository;
    private final BonCommandeRepository bonCommandeRepository;

    @Value("${haigana.annee-en-cours}")
    private Integer anneeEnCours;
    @GetMapping("/annee-en-cours")
    public Integer getAnneeEnCours() {
        return anneeEnCours;
    }

    // LISTE DES LIVRETS

    @GetMapping
    public List<Livret> findAll() {
        return livretRepository.findAll();
    }
    // LIVRET PAR ID

    @GetMapping("/{id}")
    public Livret findById(@PathVariable Long id) {

        return livretRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Livret introuvable : " + id
                        ));
    }
    // LIVRET PAR ANNEE

    @GetMapping("/annee/{annee}")
    public Livret findByAnnee(@PathVariable Integer annee) {

        return livretRepository.findByAnnee(annee)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aucun livret pour l'année " + annee
                        ));
    }
    // BONS DU LIVRET

    @GetMapping("/{id}/bons")
    public List<BonCommande> bonsDuLivret(
            @PathVariable Long id
    ) {

        if (!livretRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Livret introuvable : " + id
            );
        }

        return bonCommandeRepository.findByLivret_Id(id);
    }
    // CREER UN LIVRET

    @PostMapping
    public Livret create(@RequestBody Livret livret) {

        if (livret.getAnnee() == null) {
            throw new IllegalArgumentException(
                    "L'année du livret est obligatoire."
            );
        }

        // Une seule année = un seul livret
        if (livretRepository.findByAnnee(livret.getAnnee()).isPresent()) {
            throw new IllegalStateException(
                    "Un livret existe déjà pour l'année "
                            + livret.getAnnee()
            );
        }

        // Un livret ne peut pas être créé pour une année future
        if (livret.getAnnee() > anneeEnCours) {
            throw new IllegalStateException(
                    "Impossible de créer un livret pour l'année "
                            + livret.getAnnee()
                            + ". L'année en cours est "
                            + anneeEnCours
            );
        }

        // Date automatique si elle n'est pas fournie
        if (livret.getDateEcriture() == null) {
            livret.setDateEcriture(LocalDate.now());
        }

        return livretRepository.save(livret);
    }
    // MODIFIER UN LIVRET

    @PutMapping("/{id}")
    public Livret update(
            @PathVariable Long id,
            @RequestBody Livret donnees
    ) {

    Livret livret = livretRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Livret introuvable : " + id
                    ));

    if (donnees.getAnnee() == null) {
        throw new IllegalArgumentException(
                "L'année du livret est obligatoire."
        );
    }

    // L'année du livret existant ne peut pas être modifiée
    if (!donnees.getAnnee().equals(livret.getAnnee())) {
        throw new IllegalStateException(
                "L'année d'un livret existant ne peut pas être modifiée."
        );
    }

    livret.setDateEcriture(
            donnees.getDateEcriture()
    );

    return livretRepository.save(livret);
    }
    // SUPPRIMER UN LIVRET

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable Long id) {

        Livret livret = livretRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Livret introuvable : " + id
                        ));

        // Un livret contenant des bons ne doit pas être supprimé
        List<BonCommande> bons =
                bonCommandeRepository.findByLivret_Id(id);

        if (!bons.isEmpty()) {
            throw new IllegalStateException(
                    "Impossible de supprimer ce livret : "
                            + "il contient "
                            + bons.size()
                            + " bon(s) de commande."
            );
        }

        livretRepository.delete(livret);
    }
}