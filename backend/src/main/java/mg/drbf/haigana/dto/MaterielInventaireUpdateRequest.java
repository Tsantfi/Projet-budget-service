package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class MaterielInventaireUpdateRequest {
    private BigDecimal decompte;
    private String observation;
}
