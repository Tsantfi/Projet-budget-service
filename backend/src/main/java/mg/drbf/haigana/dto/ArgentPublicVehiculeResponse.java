package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArgentPublicVehiculeResponse {

    private Long id;
    private Double montantTotal;
    private Double montantDisponible;
    private Double montantUtilise;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
