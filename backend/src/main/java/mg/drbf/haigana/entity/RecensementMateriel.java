package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "recensement_materiel",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_recensement_materiel_soa_annee",
            columnNames = {
                "soa_id",
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
public class RecensementMateriel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * SOA concerné par le procès-verbal.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "soa_id", nullable = false)
    private SoaCode soa;

    /**
     * Année du recensement.
     */
    @Column(nullable = false)
    private Integer annee;

    /**
     * Fonctionnaire ayant effectué le recensement.
     */
    @Column(
        name = "fonctionnaire_recenseur_nom",
        nullable = false,
        length = 255
    )
    private String fonctionnaireRecenseurNom;

    /**
     * Qualité du fonctionnaire recenseur.
     * Exemple : IM : 321 166
     */
    @Column(
        name = "fonctionnaire_recenseur_qualite",
        nullable = false,
        length = 255
    )
    private String fonctionnaireRecenseurQualite;

    /**
     * Nom du comptable.
     */
    @Column(
        name = "comptable_nom",
        nullable = false,
        length = 255
    )
    private String comptableNom;

    /**
     * Qualité du comptable.
     */
    @Column(
        name = "comptable_qualite",
        nullable = false,
        length = 255
    )
    private String comptableQualite;

    /**
     * Date du recensement.
     */
    @Column(
        name = "date_recensement",
        nullable = false
    )
    private LocalDate dateRecensement;
    
    @Builder.Default
    @Column(
        name = "valide",
        nullable = false
    )
    private Boolean valide = false;
    
}
