package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DeplacementRequest {

    private Long vehiculeId;

    private LocalDate dateDeplacement;

    private String lieuDepart;

    private String lieuArrivee;

    private LocalDate dateFinParcours;

    private Double tableKilometrique;

    private String ordreSortie;
}