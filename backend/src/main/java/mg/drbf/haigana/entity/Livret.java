package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "livret")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Livret {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Annee du livret (N). L'annee suivante ce livret devient N-1 (lecture seule).
    @Column(nullable = false, unique = true)
    private Integer annee;

    private LocalDate dateEcriture;
}
