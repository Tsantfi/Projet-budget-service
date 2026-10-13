package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marque")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Marque {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marqueVehicule;
}
