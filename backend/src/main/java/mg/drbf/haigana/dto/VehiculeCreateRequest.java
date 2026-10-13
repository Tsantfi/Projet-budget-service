package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeCreateRequest {

    private String immatricule;

    private Double prixVehicule;

    private LocalDate dateCirculation;

    private String localiteTexte;
    private Double localiteLatitude;
    private Double localiteLongitude;

    private String lieuParcoursDepart;
    private String lieuParcoursArrivee;

    private String lieuAffectationActuel;

    private Long etatId;

    // RÉFÉRENCES SAISIES MANUELLEMENT

    private String genre;
    private String marque;
    private String type;

    private Long carburantId;

    // ==============================
    // DÉTENTEUR
    // ==============================

    private String nomDetenteur;
    private String prenomDetenteur;
    private String immatriculeDetenteur;
    private String cinDetenteur;
    private String districtDetenteur;

    // ==============================
    // CHAUFFEUR
    // ==============================

    private String nomChauffeur;
    private String immatriculeChauffeur;
    private String cinChauffeur;

    // ==============================
    // RELATIONS PAR ID
    // ==============================

    private Long detenteurId;
    private Long chauffeurId;
    private Long ministereId;

    // ==============================
    // PIÈCE JUSTIFICATIVE
    // ==============================
    private String pieceJustificativeUrl;
    
    //Nouveau champ

    private String categorie;
    private Boolean carteGriseDisponible;
}