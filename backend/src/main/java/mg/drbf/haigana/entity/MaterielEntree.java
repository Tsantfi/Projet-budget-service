package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "materiel_entree")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MaterielEntree {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    /**
     * Année de l'entrée.
     */
    @Column(nullable = false)
    private Integer annee;

    /**
     * Date réelle de l'entrée.
     */
    @Column(name = "date_entree", nullable = false)
    private LocalDate dateEntree;

    /**
     * Quantité entrée.
     */
    @Column(nullable = false)
    private Integer quantite;

    /**
     * Prix unitaire au moment de l'entrée.
     */
    @Column(
        name = "prix_unitaire",
        precision = 15,
        scale = 2
    )
    private BigDecimal prixUnitaire;

    @Column(length = 500)
    private String observation;
}