package mg.drbf.haigana.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuitusResponse {

    private String directionRegionale;

    private String anneeRecensement;

    private String nombreVehiculesTexte;

    private String dateFaitA;

    private String ministere;

    private String directionService;
    
    private Integer nombreVehicules;
}

