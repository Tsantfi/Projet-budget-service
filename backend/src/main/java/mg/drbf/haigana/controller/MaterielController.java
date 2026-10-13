package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.MaterielEntreeRequest;
import mg.drbf.haigana.dto.MaterielInventaireResponse;
import mg.drbf.haigana.dto.MaterielInventaireUpdateRequest;
import mg.drbf.haigana.dto.MaterielSortieRequest;
import mg.drbf.haigana.entity.Nomenclature;
import mg.drbf.haigana.repository.NomenclatureRepository;
import mg.drbf.haigana.service.MaterielService;
import mg.drbf.haigana.service.NomenclatureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import mg.drbf.haigana.dto.MaterielUpdateRequest;
import mg.drbf.haigana.entity.Materiel;
import mg.drbf.haigana.dto.MaterielResponse;

import java.util.List;

@RestController
@RequestMapping("/api/materiels")
@RequiredArgsConstructor
public class MaterielController {

    private final MaterielService materielService;
    private final NomenclatureRepository nomenclatureRepository;
    private final NomenclatureService nomenclatureService;

    /**
     * ============================================================
     * NOMENCLATURES
     * ============================================================
     */

    @GetMapping("/nomenclatures")
    public ResponseEntity<List<Nomenclature>> getNomenclatures() {

        return ResponseEntity.ok(
                nomenclatureRepository.findByActifTrueOrderByNumeroAsc()
        );
    }

    /**
     * ============================================================
     * INVENTAIRE D'UN SOA POUR UNE ANNEE
     * ============================================================
     */
    @GetMapping("/soa/{soaId}/annee/{annee}")
    public ResponseEntity<List<MaterielInventaireResponse>> getInventaire(
            @PathVariable Long soaId,
            @PathVariable Integer annee
    ) {
        List<MaterielInventaireResponse> inventaire = materielService.chargerInventaire(soaId, annee);
        
        // REIGNEMENT CHRONOLOGIQUE : Tri strict pour l'alignement séquentiel 1 à N
        if (inventaire != null) {
            inventaire.sort((a, b) -> {
                int compNomen = String.valueOf(a.getNomenclatureNumero() != null ? a.getNomenclatureNumero() : "")
                        .compareTo(String.valueOf(b.getNomenclatureNumero() != null ? b.getNomenclatureNumero() : ""));
                if (compNomen != 0) return compNomen;
                
                int compDesig = String.valueOf(a.getDesignation() != null ? a.getDesignation() : "")
                        .compareTo(String.valueOf(b.getDesignation() != null ? b.getDesignation() : ""));
                if (compDesig != 0) return compDesig;
                
                return Long.compare(a.getId() != null ? a.getId() : 0, b.getId() != null ? b.getId() : 0);
            });
        }

        return ResponseEntity.ok(inventaire);
    }

    /**
     * ============================================================
     * CREER UN NOUVEAU MATERIEL AVEC UNE ENTREE
     * ============================================================
     *
     * POST /api/materiels/entrees
     *
     * Utilisé lorsque l'utilisateur clique sur le bouton
     * "Entrée" et crée un nouveau matériel.
     */
    @PostMapping("/entrees")
    public ResponseEntity<MaterielInventaireResponse> creerMaterielAvecEntree(
            @RequestBody MaterielEntreeRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        materielService.creerMaterielAvecEntree(
                                request
                        )
                );
    }

    /**
     * ============================================================
     * AJOUTER UNE ENTREE A UN MATERIEL EXISTANT
     * ============================================================
     *
     * POST /api/materiels/{materielId}/entrees
     */
    @PostMapping("/{materielId}/entrees")
    public ResponseEntity<MaterielInventaireResponse> ajouterEntree(
            @PathVariable Long materielId,
            @RequestBody MaterielEntreeRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        materielService.ajouterEntree(
                                materielId,
                                request
                        )
                );
    }

    /**
     * ============================================================
     * SORTIE D'UN MATERIEL
     * ============================================================
     *
     * POST /api/materiels/sorties
     *
     * Le frontend envoie simplement :
     * - materielId
     * - quantite
     * - dateSortie
     * - annee
     * - observation éventuelle
     */
    @PostMapping("/sorties")
    public ResponseEntity<MaterielInventaireResponse> ajouterSortie(
            @RequestBody MaterielSortieRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        materielService.ajouterSortie(
                                request
                        )
                );
    }

        /**
     * ============================================================
     * MODIFIER L'INVENTAIRE COMPLET DE MANIÈRE SYNCHRONE
     * ============================================================
     *
     * PUT /api/materiels/inventaires/{inventaireId}
     */
    @PutMapping("/inventaires/{inventaireId}")
    public ResponseEntity<MaterielInventaireResponse> modifierInventaire(
            @PathVariable Long inventaireId,
            @RequestBody MaterielEntreeRequest request
    ) {
        return ResponseEntity.ok(
                materielService.modifierInventaireComplet(
                        inventaireId,
                        request
                )
        );
    }

    /**
     * ============================================================
     * AJOUTER EN MASSE UN MATÉRIEL DIRECTEMENT DEPUIS LA COMPARAISON
     * ============================================================
     *
     * POST /api/materiels/inventaires
     */
    @PostMapping("/inventaires")
    public ResponseEntity<MaterielInventaireResponse> ajouterMaterielDepuisComparaison(
            @RequestBody MaterielEntreeRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        materielService.creerMaterielAvecEntree(
                                request
                        )
                );
    }

    /**
     * ============================================================
     * SUPPRIMER UNITAIREMENT UNE LIGNE D'INVENTAIRE ANNUEL
     * ============================================================
     *
     * DELETE /api/materiels/inventaires/{inventaireId}
     */
    @DeleteMapping("/inventaires/{inventaireId}")
    public ResponseEntity<Void> supprimerInventaireAnnuel(
            @PathVariable Long inventaireId
    ) {
        // Routine de suppression de la ligne d'inventaire
        materielService.supprimerInventaireAnnuel(inventaireId);
        
        return ResponseEntity.noContent().build();
    }
    
        /**
     * ============================================================
     * TOUTES LES NOMENCLATURES
     * ============================================================
     */
    @GetMapping("/nomenclatures/admin")
    public ResponseEntity<List<Nomenclature>> getToutesLesNomenclatures() {

        return ResponseEntity.ok(
                nomenclatureService.trouverToutes()
        );
    }
    
    @GetMapping("/count/soa/{soaId}")
    public ResponseEntity<Long> getCompteurMaterielsParSoa(
            @PathVariable Long soaId
    ) {
        // Routine réseau connectée à la méthode de support du service
        long totalActifs = materielService.compterMaterielsActifsParSoa(soaId);
        
        return ResponseEntity.ok(totalActifs);
    }
    
    
    @PostMapping("/nomenclatures")
    public ResponseEntity<Nomenclature> creerNomenclature(
            @RequestBody Nomenclature request
    ) {

        Nomenclature nomenclature =
                nomenclatureService.creer(
                        request.getNumero(),
                        request.getDesignation()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nomenclature);
    }
    
    @DeleteMapping("/nomenclatures/{id}")
    public ResponseEntity<Nomenclature> supprimerNomenclature(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                nomenclatureService.desactiver(id)
        );
    }
    
    @PutMapping("/nomenclatures/{id}/activer")
    public ResponseEntity<Nomenclature> activerNomenclature(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                nomenclatureService.activer(id)
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MaterielResponse> getMateriel(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                materielService.getMateriel(id)
        );
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Materiel> modifierMateriel(
            @PathVariable Long id,
            @RequestBody MaterielUpdateRequest request
    ) {
        return ResponseEntity.ok(
                materielService.modifierMateriel(
                        id,
                        request
                )
        );
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerMateriel(
            @PathVariable Long id
    ) {
        materielService.supprimerMateriel(id);

        return ResponseEntity.noContent().build();
    }
    
}
