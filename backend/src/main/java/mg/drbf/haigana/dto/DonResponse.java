package mg.drbf.haigana.dto;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonResponse {

    private Long id;
    private LocalDate dateDon;
    private Double sommeRenverser;

    // Entrée
    private Long entreeId;
    private String reference;

    // Véhicule
    private Long vehiculeId;
    private String immatricule;

    // Code SOA
    private String codeSoa;
}
