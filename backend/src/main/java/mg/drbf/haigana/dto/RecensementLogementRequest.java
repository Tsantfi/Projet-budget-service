package mg.drbf.haigana.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementLogementRequest {

    private Long soaId;

    private Integer annee;

    private String ministere;
    private String niveau;
    private String directionService;
    private String objet;

    private String nom;
    private String prenom;
    private String fonction;

    private String telephone;
    private String email;
    private String objetTitreFoncier;
}
