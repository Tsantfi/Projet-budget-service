package mg.drbf.haigana.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchatConsultationDTO {

    // ACHAT

    private Long id;
    private LocalDate dateAchat;
    private Double sommePayer;

    // ENTREE

    private Long entreeId;
    private String reference;

    private LocalDate dateEntree;
    private String type;
    private String pieceJustificativeUrl;

    // VEHICULE

    private Long vehiculeId;
    private String immatricule;

    // CODE SOA
    private Long codeSoaId;
    private String codeSoa;

    // ORDRE DE SORTIE

    private String nomPersonneSortie;
    private String cinPersonneSortie;
    private String serviceSortie;

    // ORDRE D'ENTREE

    private String nomPersonneEntree;
    private String cinPersonneEntree;
    private String serviceEntree;
}

