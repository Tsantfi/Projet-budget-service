package mg.drbf.haigana.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class VehiculeRequest {

    private String immatricule;

    private Double prixVehicule;

    private LocalDate dateCirculation;

    private String localiteTexte;

    private Double localiteLatitude;

    private Double localiteLongitude;
    
    private String lieuAffectationActuel; 

    private String lieuParcoursDepart;

    private String lieuParcoursArrivee;

    private Long ministereId;

    // SAISIE MANUELLE

    private String genre;

    private String marque;

    private String type;
    
     
    // DETENTEUR - SAISIE MANUELLE

    private String nomDetenteur;

    private String prenomDetenteur;

    private String immatriculeDetenteur;

    private String cinDetenteur;

    private String districtDetenteur;

    // CHAUFFEUR - SAISIE MANUELLE

    private String nomChauffeur;

    private String immatriculeChauffeur;

    private String cinChauffeur;

    // RELATIONS

    private Long etatId;

    private Long carburantId;

    private Long detenteurId;

    private Long chauffeurId;

    private Long soaId;
    
    private String pieceJustificativeUrl;
    
    private String categorie;

    private Boolean carteGriseDisponible;
    
    public Long getCodeSoaId() {
        return soaId;
    }
}