package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntreeResponse {

    private Long id;

    private String reference;

    private LocalDate dateEntree;

    private String type;

    // ==========================================
    // PIECES DE LA PRISE EN CHARGE
    // ==========================================

    private String ordreEntree;

    private String facture;

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
    // VEHICULE
    // ==========================================

    private Long vehiculeId;

    private String immatricule;

    private String codeSoa;

    // ==========================================
    // PIECE JUSTIFICATIVE GENERALE
    // ==========================================

    private String pieceJustificativeUrl;

    // ==========================================
    // ACHAT
    // ==========================================

    private LocalDate dateAchat;

    private Double sommePayer;

    // ==========================================
    // DON
    // ==========================================

    private LocalDate dateDon;

    private Double sommeRenverser;

    // ==========================================
    // AFFECTATION
    // ==========================================

    private String descriptionAffectation;

    private String lieuAffectation;

    private LocalDate dateDepart;

    private LocalDate dateFin;
}