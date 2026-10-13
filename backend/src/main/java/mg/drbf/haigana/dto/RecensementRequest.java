package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecensementRequest {

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
    
    private String objet;
    
    private String detenteurEffectif;
}
