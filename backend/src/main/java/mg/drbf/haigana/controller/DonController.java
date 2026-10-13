package mg.drbf.haigana.controller;

import lombok.RequiredArgsConstructor;
import mg.drbf.haigana.dto.DonResponse;
import mg.drbf.haigana.entity.Don;
import mg.drbf.haigana.entity.Entree;
import mg.drbf.haigana.entity.Vehicule;
import mg.drbf.haigana.exception.ResourceNotFoundException;
import mg.drbf.haigana.repository.DonRepository;
import mg.drbf.haigana.repository.EntreeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dons")
@RequiredArgsConstructor
public class DonController {

    private final DonRepository donRepository;
    private final EntreeRepository entreeRepository;


    // LISTE DES DONS


    @GetMapping
    public List<DonResponse> findAll() {

        return donRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // DONS D'UNE ENTREE


    @GetMapping("/entree/{entreeId}")
    public List<DonResponse> findByEntree(
            @PathVariable Long entreeId
    ) {

        return donRepository
                .findByEntree_Id(entreeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // DETAIL


    @GetMapping("/{id}")
    public DonResponse findById(
            @PathVariable Long id
    ) {

        Don don = donRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Don introuvable : " + id
                        )
                );

        return toResponse(don);
    }


    // CREATION


    @PostMapping
    public DonResponse create(
            @RequestBody Don don
    ) {

  
        // VERIFICATION ENTREE
  

        if (don.getEntree() == null ||
                don.getEntree().getId() == null) {

            throw new IllegalArgumentException(
                    "L'entrée est obligatoire."
            );
        }

        Long entreeId =
                don.getEntree().getId();

  
        // VERIFIER QUE L'ENTREE EXISTE
  

        Entree entree =
                entreeRepository.findById(entreeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Entrée introuvable : "
                                                + entreeId
                                )
                        );

  
        // VERIFIER SI UN DON EXISTE DEJA
  

        List<Don> donsExistants =
                donRepository.findByEntree_Id(entreeId);

        if (!donsExistants.isEmpty()) {

            throw new IllegalStateException(
                    "Cette entrée possède déjà un don."
            );
        }

  
        // VERIFICATION SOMME
  

        if (don.getSommeRenverser() == null ||
                don.getSommeRenverser() <= 0) {

            throw new IllegalArgumentException(
                    "La somme du don est obligatoire."
            );
        }

  
        // ASSOCIATION ENTREE
  

        don.setEntree(entree);

  
        // DATE PAR DEFAUT
  

        if (don.getDateDon() == null) {

            don.setDateDon(
                    entree.getDateEntree()
            );
        }

  
        // ENREGISTREMENT
  

        Don saved =
                donRepository.save(don);

        return toResponse(saved);
    }


    // MODIFICATION


    @PutMapping("/{id}")
    public DonResponse update(
            @PathVariable Long id,
            @RequestBody Don donnees
    ) {

  
        // RECUPERER LE DON
  

        Don don =
                donRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Don introuvable : "
                                                + id
                                )
                        );

  
        // DATE
  

        if (donnees.getDateDon() != null) {

            don.setDateDon(
                    donnees.getDateDon()
            );
        }

  
        // SOMME
  

        if (donnees.getSommeRenverser() == null ||
                donnees.getSommeRenverser() <= 0) {

            throw new IllegalArgumentException(
                    "La somme du don est obligatoire."
            );
        }

        don.setSommeRenverser(
                donnees.getSommeRenverser()
        );

  
        // MODIFICATION EVENTUELLE DE L'ENTREE
  

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

      
            // VERIFIER SI L'ENTREE EST DEJA UTILISEE
      

            List<Don> dons =
                    donRepository.findByEntree_Id(
                            entreeId
                    );

            boolean dejaUtilisee =
                    dons.stream()
                            .anyMatch(d ->
                                    d.getId() != null &&
                                    !d.getId().equals(id)
                            );

            if (dejaUtilisee) {

                throw new IllegalStateException(
                        "Cette entrée possède déjà un don."
                );
            }

            don.setEntree(entree);
        }

  
        // ENREGISTREMENT
  

        Don saved =
                donRepository.save(don);

        return toResponse(saved);
    }


    // SUPPRESSION


    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {

        Don don =
                donRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Don introuvable : "
                                                + id
                                )
                        );

        donRepository.delete(don);
    }


    // CONVERSION DON -> RESPONSE


    private DonResponse toResponse(
            Don don
    ) {

        DonResponse response =
                DonResponse.builder()

                        .id(
                                don.getId()
                        )

                        .dateDon(
                                don.getDateDon()
                        )

                        .sommeRenverser(
                                don.getSommeRenverser()
                        )

                        .build();

  
        // ENTREE
  

        Entree entree =
                don.getEntree();

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