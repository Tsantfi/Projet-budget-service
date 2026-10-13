package mg.drbf.haigana.controller;
import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.AchatResponse;
import mg.drbf.haigana.entity.Achat;
import mg.drbf.haigana.entity.Entree;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.AchatRepository;
import mg.drbf.haigana.repository.EntreeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achats")
@RequiredArgsConstructor
public class AchatController {

    private final AchatRepository achatRepository;
    private final EntreeRepository entreeRepository;


    // LISTE DES ACHATS


    @GetMapping
    public List<AchatResponse> findAll() {

        return achatRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // ACHATS D'UNE ENTREE


    @GetMapping("/entree")
    public List<AchatResponse> findByEntree(
            @RequestParam Long entreeId
    ) {

        return achatRepository
                .findByEntree_Id(entreeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // DETAIL


    @GetMapping("/{id}")
    public AchatResponse findById(
            @PathVariable Long id
    ) {

        Achat achat = achatRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Achat introuvable : " + id
                        )
                );

        return toResponse(achat);
    }


    // CREATION


    @PostMapping
    public AchatResponse create(
            @RequestBody Achat achat
    ) {

        if (achat.getEntree() == null ||
                achat.getEntree().getId() == null) {

            throw new IllegalArgumentException(
                    "L'entrée est obligatoire."
            );
        }

        Long entreeId =
                achat.getEntree().getId();

        Entree entree =
                entreeRepository.findById(entreeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entrée introuvable : "
                                                + entreeId
                                )
                        );

        List<Achat> achatsExistants =
                achatRepository.findByEntree_Id(entreeId);

        if (!achatsExistants.isEmpty()) {

            throw new IllegalStateException(
                    "Cette entrée possède déjà un achat."
            );
        }

        if (achat.getSommePayer() == null ||
                achat.getSommePayer() <= 0) {

            throw new IllegalArgumentException(
                    "Le montant de l'achat est obligatoire."
            );
        }

        achat.setEntree(entree);

        if (achat.getDateAchat() == null) {

            achat.setDateAchat(
                    entree.getDateEntree()
            );
        }

        Achat saved =
                achatRepository.save(achat);

        return toResponse(saved);
    }


    // MODIFICATION


    @PutMapping("/{id}")
    public AchatResponse update(
            @PathVariable Long id,
            @RequestBody Achat donnees
    ) {

        Achat achat =
                achatRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Achat introuvable : "
                                                + id
                                )
                        );

        if (donnees.getDateAchat() != null) {

            achat.setDateAchat(
                    donnees.getDateAchat()
            );
        }

        if (donnees.getSommePayer() == null ||
                donnees.getSommePayer() <= 0) {

            throw new IllegalArgumentException(
                    "Le montant de l'achat est obligatoire."
            );
        }

        achat.setSommePayer(
                donnees.getSommePayer()
        );

        if (donnees.getEntree() != null &&
                donnees.getEntree().getId() != null) {

            Long entreeId =
                    donnees.getEntree().getId();

            Entree entree =
                    entreeRepository.findById(entreeId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Entrée introuvable : "
                                                    + entreeId
                                    )
                            );

            List<Achat> achats =
                    achatRepository.findByEntree_Id(
                            entreeId
                    );

            boolean dejaUtilisee =
                    achats.stream()
                            .anyMatch(a ->
                                    a.getId() != null &&
                                    !a.getId().equals(id)
                            );

            if (dejaUtilisee) {

                throw new IllegalStateException(
                        "Cette entrée possède déjà un achat."
                );
            }

            achat.setEntree(entree);
        }

        Achat saved =
                achatRepository.save(achat);

        return toResponse(saved);
    }


    // SUPPRESSION


    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {

        Achat achat =
                achatRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Achat introuvable : " + id
                                )
                        );

        achatRepository.delete(achat);
    }


    // CONVERSION ACHAT -> RESPONSE


    private AchatResponse toResponse(
            Achat achat
    ) {

        AchatResponse response =
                AchatResponse.builder()
                        .id(achat.getId())
                        .dateAchat(achat.getDateAchat())
                        .sommePayer(achat.getSommePayer())
                        .build();

  
        // ENTREE
  

        Entree entree =
                achat.getEntree();

        if (entree != null) {

            response.setEntreeId(
                    entree.getId()
            );

            response.setReference(
                    entree.getReference()
            );

      
            // VEHICULE
      

            Vehicule vehicule =
                    entree.getVehicule();

            if (vehicule != null) {

                response.setVehiculeId(
                        vehicule.getId()
                );

                response.setImmatricule(
                        vehicule.getImmatricule()
                );

          
                // CODE SOA
          

                if (vehicule.getCodeSoa() != null) {

                    response.setCodeSoa(
                            vehicule
                                    .getCodeSoa()
                                    .getCodeSoa()
                    );
                }
            }
        }

        return response;
    }
}