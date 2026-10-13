package mg.drbf.haigana.controller;

import mg.drbf.haigana.entity.Chauffeur;
import mg.drbf.haigana.entity.ConduiteChauffeur;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.repository.ChauffeurRepository;
import mg.drbf.haigana.repository.ConduiteChauffeurRepository;
import mg.drbf.haigana.repository.VehiculeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conduite-chauffeur")
@RequiredArgsConstructor
public class ConduiteChauffeurController {

    private final ConduiteChauffeurRepository conduiteChauffeurRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final VehiculeRepository vehiculeRepository;


  
    // LISTE DE TOUTES LES ATTRIBUTIONS
    // GET /api/conduite-chauffeur
  

    @GetMapping
    public ResponseEntity<?> getAll() {

        try {

            List<ConduiteChauffeur> conduites =
                    conduiteChauffeurRepository.findAllComplete();

            return ResponseEntity.ok(conduites);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors du chargement des attributions.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // ATTRIBUTIONS D'UN CHAUFFEUR
    // GET /api/conduite-chauffeur/chauffeur/1
  

    @GetMapping("/chauffeur/{chauffeurId}")
    public ResponseEntity<?> getByChauffeur(
            @PathVariable Long chauffeurId
    ) {

        try {

            if (!chauffeurRepository.existsById(chauffeurId)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Chauffeur introuvable."
                        ));
            }

            List<ConduiteChauffeur> conduites =
                    conduiteChauffeurRepository
                            .findByChauffeurId(chauffeurId);

            return ResponseEntity.ok(conduites);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors du chargement des véhicules du chauffeur.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // ATTRIBUTIONS D'UN VEHICULE
    // GET /api/conduite-chauffeur/vehicule/1
  

    @GetMapping("/vehicule/{vehiculeId}")
    public ResponseEntity<?> getByVehicule(
            @PathVariable Long vehiculeId
    ) {

        try {

            if (!vehiculeRepository.existsById(vehiculeId)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Véhicule introuvable."
                        ));
            }

            List<ConduiteChauffeur> conduites =
                    conduiteChauffeurRepository
                            .findByVehiculeId(vehiculeId);

            return ResponseEntity.ok(conduites);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors du chargement des attributions du véhicule.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // UNE ATTRIBUTION
    // GET /api/conduite-chauffeur/1
  

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id
    ) {

        try {

            ConduiteChauffeur conduite =
                    conduiteChauffeurRepository
                            .findById(id)
                            .orElse(null);

            if (conduite == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Attribution introuvable."
                        ));
            }

            return ResponseEntity.ok(conduite);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors du chargement de l'attribution.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // AJOUTER UNE ATTRIBUTION
    //
    // POST /api/conduite-chauffeur
    //
    // {
    //   "chauffeurId": 1,
    //   "vehiculeId": 2,
    //   "dateConduite": "2026-08-24"
    // }
  

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> payload
    ) {

        try {

            Long chauffeurId =
                    Long.valueOf(
                            payload.get("chauffeurId").toString()
                    );

            Long vehiculeId =
                    Long.valueOf(
                            payload.get("vehiculeId").toString()
                    );

            LocalDate dateConduite =
                    payload.get("dateConduite") != null
                            ? LocalDate.parse(
                                    payload.get("dateConduite").toString()
                            )
                            : LocalDate.now();


            Chauffeur chauffeur =
                    chauffeurRepository
                            .findById(chauffeurId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Chauffeur introuvable."
                                    )
                            );


            Vehicule vehicule =
                    vehiculeRepository
                            .findById(vehiculeId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Véhicule introuvable."
                                    )
                            );


            // Empêcher deux fois la même attribution
            if (conduiteChauffeurRepository
                    .existsByChauffeur_IdAndVehicule_Id(
                            chauffeurId,
                            vehiculeId
                    )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "message",
                                "Ce véhicule est déjà attribué à ce chauffeur."
                        ));
            }


            ConduiteChauffeur conduite =
                    ConduiteChauffeur.builder()
                            .chauffeur(chauffeur)
                            .vehicule(vehicule)
                            .dateConduite(dateConduite)
                            .build();


            ConduiteChauffeur saved =
                    conduiteChauffeurRepository.save(conduite);


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            conduiteChauffeurRepository
                                    .findCompleteById(saved.getId())
                                    .orElse(saved)
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors de la création de l'attribution.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // MODIFIER UNE ATTRIBUTION
  

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {

        try {

            ConduiteChauffeur conduite =
                    conduiteChauffeurRepository
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attribution introuvable."
                                    )
                            );


            Long chauffeurId =
                    Long.valueOf(
                            payload.get("chauffeurId").toString()
                    );

            Long vehiculeId =
                    Long.valueOf(
                            payload.get("vehiculeId").toString()
                    );


            LocalDate dateConduite =
                    payload.get("dateConduite") != null
                            ? LocalDate.parse(
                                    payload.get("dateConduite").toString()
                            )
                            : conduite.getDateConduite();


            Chauffeur chauffeur =
                    chauffeurRepository
                            .findById(chauffeurId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Chauffeur introuvable."
                                    )
                            );


            Vehicule vehicule =
                    vehiculeRepository
                            .findById(vehiculeId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Véhicule introuvable."
                                    )
                            );


            // Vérifier les doublons sauf l'attribution actuelle
            if (conduiteChauffeurRepository
                    .existsByChauffeur_IdAndVehicule_IdAndIdNot(
                            chauffeurId,
                            vehiculeId,
                            id
                    )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "message",
                                "Ce véhicule est déjà attribué à ce chauffeur."
                        ));
            }


            conduite.setChauffeur(chauffeur);
            conduite.setVehicule(vehicule);
            conduite.setDateConduite(dateConduite);


            ConduiteChauffeur updated =
                    conduiteChauffeurRepository.save(conduite);


            return ResponseEntity.ok(
                    conduiteChauffeurRepository
                            .findCompleteById(updated.getId())
                            .orElse(updated)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors de la modification de l'attribution.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }


  
    // SUPPRIMER UNE ATTRIBUTION
    //
    // DELETE /api/conduite-chauffeur/1
  

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id
    ) {

        try {

            if (!conduiteChauffeurRepository.existsById(id)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "message",
                                "Attribution introuvable."
                        ));
            }

            conduiteChauffeurRepository.deleteById(id);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Attribution supprimée avec succès."
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Erreur lors de la suppression de l'attribution.",
                            "error",
                            e.getMessage() == null
                                    ? "Erreur inconnue"
                                    : e.getMessage()
                    ));
        }
    }
}