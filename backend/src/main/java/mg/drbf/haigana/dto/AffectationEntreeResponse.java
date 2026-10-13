package mg.drbf.haigana.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class AffectationEntreeResponse {

    private Long id;
    private String description;
    private String lieuAffectation;
    private LocalDate dateDepart;
    private LocalDate dateFin;

    // VEHICULE

    private Long vehiculeId;
    private String immatricule;
    private Double prixVehicule;
    private LocalDate dateCirculation;

    private String etat;
    private String genre;
    private String marque;
    private String type;
    private String carburant;

    private String lieuAffectationActuel;

    // ENTREE

    private Long entreeId;
    private String reference;
    private LocalDate dateEntree;
    private String typeEntree;
    private String descriptionEntree;
}