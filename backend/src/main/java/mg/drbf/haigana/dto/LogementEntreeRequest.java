package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogementEntreeRequest {

    // SOA

    private Long soaId;

    // LOGEMENT

    private Long logementId;

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

    // ENTREE

    private String reference;

    private LocalDate dateEntree;

    private String type;

    private String pieceJustificativeUrl;

    // ACHAT

    private String ordreEntree;
    private String facture;

    // DON

    private String pvEvaluation;

    // AFFECTATION

    private String nomPersonneSortie;
    private String cinPersonneSortie;
    private String serviceSortie;

    private String nomPersonneEntree;
    private String cinPersonneEntree;
    private String serviceEntree;
}