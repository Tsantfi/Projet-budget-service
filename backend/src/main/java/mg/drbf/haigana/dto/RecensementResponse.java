package mg.drbf.haigana.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecensementResponse {

    private Long id;

    private Long soaId;

    private Integer annee;

    private String ministere;

    private String niveau;

    private String directionService;
    
    private String directionServiceRecensement;

    private String nomPrenomResponsable;

    private String fonctionResponsable;

    private String telephoneResponsable;

    private String emailResponsable;

    private Integer nombreVehicules;

    private Integer nombreNouveaux;

    private Integer nombreModifies;

    private Integer nombreAbsents;
    
    private Boolean valide;
    
    private String objet;
    
    private String detenteurEffectif;

    private List<RecensementVehiculeResponse> vehicules;
}
