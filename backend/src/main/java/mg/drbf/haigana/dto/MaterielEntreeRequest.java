package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class MaterielEntreeRequest {

    private Long soaId;

    private Long nomenclatureId;

    private String designation;

    private String especeUnite;

    private BigDecimal prixUnitaire;

    private Integer quantite;

    private LocalDate dateEntree;

    private Integer annee;

    private String observation;
}
