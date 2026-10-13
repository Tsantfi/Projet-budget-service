package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MaterielUpdateRequest {

    private Long nomenclatureId;

    private String designation;

    private String especeUnite;

    private BigDecimal prixUnitaire;
}
