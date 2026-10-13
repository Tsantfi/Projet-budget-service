package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chauffeur")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Chauffeur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomChauffeur;

    @Column(unique = true)
    private String immatriculeChauffeur;

    private String cinChauffeur;
}
