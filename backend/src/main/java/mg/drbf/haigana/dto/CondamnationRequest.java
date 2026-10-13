package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CondamnationRequest {
    private String immatriculeVehicule;
    private LocalDate dateCondamnation;
    private String lieuCondamnation;
    private String description;
    private String piece;
}