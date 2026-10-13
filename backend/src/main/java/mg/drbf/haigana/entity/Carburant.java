package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "carburant")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Carburant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;
}
