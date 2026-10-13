package mg.drbf.haigana.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoaCreateRequest {

    private String codeSoa;

    private Long regionId;

    // MINISTÈRE — SAISIE MANUELLE

    private String nomMinistere;

    private String districtMinistere;

    // VÉHICULES

    private List<VehiculeCreateRequest> vehicules;
}