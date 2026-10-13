package mg.drbf.haigana.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SoaResponse {

    private Long id;

    private String codeSoa;

    private LocalDateTime dateModification;

    private RegionResponse region;

    private MinistereResponse ministere;

    private List<VehiculeResponse> vehicules;

    // REGION

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegionResponse {

        private Long id;
        private String nomRegion;
    }

    // MINISTERE

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MinistereResponse {

        private Long id;
        private String nomMinistere;
        private String districtMinistere;
    }
}
