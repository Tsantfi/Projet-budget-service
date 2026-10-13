package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "materiel_inventaire_annuel",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_materiel_inventaire_annee",
            columnNames = {
                "materiel_id",
                "annee"
            }
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MaterielInventaireAnnuel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "materiel_id", nullable = false)
    private Materiel materiel;

    @Column(nullable = false)
    private Integer annee;

    @Builder.Default
    @Column(name = "existant_debut_annee", nullable = false)
    private Integer existantDebutAnnee = 0;

    /**
     * Prix unitaire applicable à cette année.
     * Il est conservé pour ne pas modifier les anciens inventaires
     * lorsqu'on change le prix actuel du matériel.
     */
    @Column(
        name = "prix_unitaire",
        precision = 15,
        scale = 2
    )
    private BigDecimal prixUnitaire;

    @Column(
        name = "decompte",
        precision = 18,
        scale = 2
    )
    private BigDecimal decompte;

    @Column(length = 1000)
    private String observation;
}