package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SortieResponse {

    private Long id;

    private String reference;
    private LocalDate dateSortie;
    private String type;
    private String lieu;
    private String description;
    private String pieceJustificativeUrl;

    // ORDRE DE SORTIE

    private String nomPersonneSortie;
    private String cinPersonneSortie;
    private String serviceSortie;

    // ORDRE D'ENTREE

    private String nomPersonneEntree;
    private String cinPersonneEntree;
    private String serviceEntree;

    // VEHICULE

    private VehiculeResponse vehicule;

    // CONDAMNATION

    private CondamnationResponse condamnation;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehiculeResponse {

        private Long id;
        private String immatricule;
        private SoaResponse codeSoa;
    }


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
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CondamnationResponse {

        private Long id;
        private String immatriculeVehicule;
        private LocalDate dateCondamnation;
        private String lieuCondamnation;
        private String description;
    }
}
