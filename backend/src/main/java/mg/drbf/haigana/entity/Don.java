package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "don")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Don {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate dateDon;
    private Double sommeRenverser;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entree_id", nullable = false, unique = true)
    private Entree entree;
}
