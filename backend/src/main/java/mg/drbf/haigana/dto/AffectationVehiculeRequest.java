package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class AffectationVehiculeRequest {

    private String lieuAffectation;
    private String description;
    private LocalDate dateAffectation;
}
