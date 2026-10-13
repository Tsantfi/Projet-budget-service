package mg.drbf.haigana.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class CondamnationResponse {
    private Long id;
    private String piece;
    private String immatriculeVehicule;
    private LocalDate dateCondamnation;
    private String lieuCondamnation;
    private String description;
    private String referenceSortie;
}
