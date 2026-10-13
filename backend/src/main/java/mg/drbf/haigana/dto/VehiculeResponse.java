package mg.drbf.haigana.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehiculeResponse {

    private Long id;

    private String immatricule;

    private Double prixVehicule;

    private LocalDate dateCirculation;
    
    private String categorie;
    private Boolean carteGriseDisponible;

    private String localiteTexte;

    private Double localiteLatitude;

    private Double localiteLongitude;

    private String lieuParcoursDepart;

    private String lieuParcoursArrivee;

    private Double kilometrageMensuel;
    private String lieuAffectationActuel;

    private boolean valide;
    private String pieceJustificativeUrl;
    /*CONDAMNATION*/
    private boolean condamne;
    private LocalDate dateCondamnation;


    /*REFERENCES*/

    private EtatResponse etat;
    private GenreResponse genre;
    private MarqueResponse marque;
    private TypeVehiculeResponse type;
    private CarburantResponse carburant;
    private DetenteurResponse detenteur;
    private ChauffeurResponse chauffeur;
    private SoaResponse codeSoa;
    private MinistereResponse ministere;


    // ETAT

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EtatResponse {

        private Long id;

        private String etatVehicule;
    }


    // GENRE

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenreResponse {

        private Long id;

        private String genreVehicule;
    }


    // MARQUE

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MarqueResponse {

        private Long id;

        private String marqueVehicule;
    }


    // TYPE

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TypeVehiculeResponse {

        private Long id;

        private String typeDuVehicule;
    }


    // CARBURANT

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CarburantResponse {

        private Long id;

        private String libelle;
    }


    // DETENTEUR

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetenteurResponse {

        private Long id;

        private String nomDetenteur;

        private String prenomDetenteur;

        private String immatriculeDetenteur;

        private String cinDetenteur;

        private String districtDetenteur;
    }


    // CHAUFFEUR

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChauffeurResponse {

        private Long id;

        private String nomChauffeur;

        private String immatriculeChauffeur;

        private String cinChauffeur;
    }


    // SOA

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoaResponse {

        private Long id;

        private String codeSoa;
    }
    
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MinistereResponse {

        private Long id;
        private String nomMinistere;
        private String districtMinistere;
    }
    
}