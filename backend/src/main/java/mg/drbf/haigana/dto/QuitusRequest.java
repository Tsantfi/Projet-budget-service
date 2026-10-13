package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuitusRequest {

    private Integer annee;
    private String ministere;
    private String districtMinistere;
    private String directionService;
    private Long soaId;
}
