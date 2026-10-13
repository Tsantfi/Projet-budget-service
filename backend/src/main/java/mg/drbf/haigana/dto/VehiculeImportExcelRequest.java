package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehiculeImportExcelRequest {

    private String immatricule;

    private Double prixVehicule;

    private LocalDate dateCirculation;

    private String categorie;

    private Boolean carteGriseDisponible;

    private String genre;

    private String marque;

    private String type;

    private Long etatId;

    private Long carburantId;

    private Long soaId;

    private Long ministereId;

    // DETENTEUR

    private String nomDetenteur;

    private String prenomDetenteur;

    private String immatriculeDetenteur;

    private String cinDetenteur;

    private String districtDetenteur;

    // CHAUFFEUR

    private String nomChauffeur;

    private String immatriculeChauffeur;

    private String cinChauffeur;

    // LOCALISATION

    private String localiteTexte;

    private Double localiteLatitude;

    private Double localiteLongitude;

    private String lieuParcoursDepart;

    private String lieuParcoursArrivee;

    private String pieceJustificativeUrl;
}

