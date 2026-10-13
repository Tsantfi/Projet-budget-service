package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntreeRequest {

    // ==========================================
    // INFORMATIONS GENERALES
    // ==========================================

    private String reference;

    private LocalDate dateEntree;

    /**
     * ACHAT / DON / AFFECTATION
     */
    private String type;

    private String description;

    private Long vehiculeId;

    // ==========================================
    // PIECE JUSTIFICATIVE GENERALE
    // ==========================================

    private String pieceJustificativeUrl;

    // ==========================================
    // PIECES DE LA PRISE EN CHARGE
    // ==========================================

    // ACHAT / DON
    private String ordreEntree;

    // ACHAT / DON
    private String facture;

    // DON
    private String pvEvaluation;

    // ==========================================
    // PERSONNE ORDRE DE SORTIE
    // ==========================================

    private String nomPersonneSortie;

    private String cinPersonneSortie;

    private String serviceSortie;

    // ==========================================
    // PERSONNE ORDRE D'ENTREE
    // ==========================================

    private String nomPersonneEntree;

    private String cinPersonneEntree;

    private String serviceEntree;

    // ==========================================
    // ACHAT
    // ==========================================

    private LocalDate dateAchat;

    private Double sommePayer;

    // DON

    private LocalDate dateDon;

    private Double sommeRenverser;

    // AFFECTATION

    private String descriptionAffectation;

    private String lieuAffectation;

    private LocalDate dateDepart;

    private LocalDate dateFin;
}