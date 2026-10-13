package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecensementMaterielCreateRequest {

    private Long soaId;

    private Integer annee;

    private String fonctionnaireRecenseurNom;

    private String fonctionnaireRecenseurQualite;

    private String comptableNom;

    private String comptableQualite;
}
