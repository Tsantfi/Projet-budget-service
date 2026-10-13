package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementEntreeResponse {

    private Long id;

    private LogementResponse logement;

    private String reference;
    private LocalDate dateEntree;
    private String type;

    private String ordreEntree;
    private String facture;
    private String pvEvaluation;

    private String nomPersonneSortie;
    private String cinPersonneSortie;
    private String serviceSortie;

    private String nomPersonneEntree;
    private String cinPersonneEntree;
    private String serviceEntree;

    private String pieceJustificativeUrl;
}
