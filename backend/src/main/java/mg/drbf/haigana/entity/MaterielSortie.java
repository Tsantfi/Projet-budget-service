package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "materiel_sortie")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MaterielSortie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    /**
     * Année de la sortie.
     */
    @Column(nullable = false)
    private Integer annee;

    /**
     * Date réelle de la sortie.
     */
    @Column(name = "date_sortie", nullable = false)
    private LocalDate dateSortie;

    /**
     * Quantité sortie.
     */
    @Column(nullable = false)
    private Integer quantite;

    @Column(length = 500)
    private String observation;
}
