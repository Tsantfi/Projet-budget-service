package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementResponse {

    private Long id;

    private Integer numero;

    private String nomBatiment;

    private String nature;

    private String entiteUtilisatrice;

    private String occupant;

    private String etatBatisse;

    private String localite;

    private String adressePointRepere;

    private String etatGeneral;

    private Integer anneeInitiale;

    private LocalDate dateAvantCondamnation;

    private Boolean actif;

    private SoaResponse soa;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SoaResponse {

        private Long id;
        private String codeSoa;
    }
}
