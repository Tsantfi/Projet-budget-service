package mg.drbf.haigana.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArgentPublicVehiculeRequest {
    private Double montantTotal;
    private Double montantUtilise;
}
