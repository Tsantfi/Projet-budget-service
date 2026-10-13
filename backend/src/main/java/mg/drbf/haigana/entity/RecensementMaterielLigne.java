package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "recensement_materiel_ligne",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_recensement_materiel_ligne",
            columnNames = {
                "recensement_id",
                "materiel_id"
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
public class RecensementMaterielLigne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Procès-verbal auquel appartient cette ligne.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "recensement_id",
        nullable = false
    )
    private RecensementMateriel recensement;

    /**
     * Matériel recensé.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "materiel_id",
        nullable = false
    )
    private Materiel materiel;

    /**
     * Numéro de nomenclature conservé comme snapshot.
     */
    @Column(
        name = "nomenclature_numero",
        nullable = false
    )
    private Integer nomenclatureNumero;

    /**
     * Désignation de la nomenclature conservée
     * pour l'historique.
     */
    @Column(
        name = "nomenclature_designation",
        nullable = false,
        length = 255
    )
    private String nomenclatureDesignation;

    /**
     * Espèce des unités.
     */
    @Column(
        name = "espece_unite",
        nullable = false,
        length = 50
    )
    private String especeUnite;

    /**
     * Prix unitaire au moment du recensement.
     */
    @Column(
        name = "prix_unitaire",
        nullable = false,
        precision = 15,
        scale = 2
    )
    private BigDecimal prixUnitaire;

    /**
     * Existant d'après les écritures.
     *
     * Cette valeur provient de l'inventaire annuel.
     * Elle ne doit jamais être modifiée par le recenseur.
     */
    @Column(
        name = "existant_ecriture",
        nullable = false
    )
    private Integer existantEcriture;

    /**
     * Quantité constatée physiquement par le recenseur.
     *
     * À l'ouverture du recensement :
     * constateRecensement = existantEcriture
     */
    @Column(
        name = "constate_recensement",
        nullable = false
    )
    private Integer constateRecensement;

    /**
     * Excédent en quantité.
     *
     * MAX(constaté - existant, 0)
     */
    @Builder.Default
    @Column(
        name = "excedent",
        nullable = false
    )
    private Integer excedent = 0;

    /**
     * Déficit en quantité.
     *
     * MAX(existant - constaté, 0)
     */
    @Builder.Default
    @Column(
        name = "deficit",
        nullable = false
    )
    private Integer deficit = 0;

    /**
     * Valeur de l'excédent pour cet article.
     *
     * excédent × prix unitaire
     */
    @Builder.Default
    @Column(
        name = "valeur_excedent_article",
        precision = 18,
        scale = 2,
        nullable = false
    )
    private BigDecimal valeurExcedentArticle =
            BigDecimal.ZERO;

    /**
     * Valeur du déficit pour cet article.
     *
     * déficit × prix unitaire
     */
    @Builder.Default
    @Column(
        name = "valeur_deficit_article",
        precision = 18,
        scale = 2,
        nullable = false
    )
    private BigDecimal valeurDeficitArticle =
            BigDecimal.ZERO;

    /**
     * Valeur totale de l'article constaté.
     *
     * constaté × prix unitaire
     */
    @Builder.Default
    @Column(
        name = "valeur_article",
        precision = 18,
        scale = 2,
        nullable = false
    )
    private BigDecimal valeurArticle =
            BigDecimal.ZERO;

    /**
     * Observation du recensement.
     */
    @Column(length = 1000)
    private String observation;
}
