package mg.drbf.haigana.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChauffeurResponse {
    private Long id;
    private String nomChauffeur;
    private String immatriculeChauffeur;
    private String cinChauffeur;
}
