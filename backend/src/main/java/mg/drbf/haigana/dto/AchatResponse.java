package mg.drbf.haigana.dto;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchatResponse {

    private Long id;
    private LocalDate dateAchat;
    private Double sommePayer;
    // ENTREE


    private Long entreeId;
    private String reference;

    // VEHICULE

    private Long vehiculeId;
    private String immatricule;
    // CODE SOA

    private String codeSoa;
}