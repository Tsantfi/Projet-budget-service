package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "materiel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Materiel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Code SOA auquel appartient le matériel.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "soa_id", nullable = false)
    private SoaCode codeSoa;

    /**
     * Nomenclature obligatoire.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nomenclature_id", nullable = false)
    private Nomenclature nomenclature;

    /**
     * Désignation précise du matériel.
     */
    @Column(nullable = false, length = 255)
    private String designation;

    /**
     * Espèce des unités.
     * Exemple : N, boîte, lot, paire...
     */
    @Column(name = "espece_unite", nullable = false, length = 50)
    private String especeUnite;

    /**
     * Prix unitaire du matériel.
     */
    @Column(
        name = "prix_unitaire",
        nullable = false,
        precision = 15,
        scale = 2
    )
    private BigDecimal prixUnitaire;

    /**
     * Quantité initiale connue.
     */
    @Builder.Default
    @Column(name = "quantite_initiale", nullable = false)
    private Integer quantiteInitiale = 0;

    /**
     * Année de début de gestion du matériel.
     */
    @Column(name = "annee_initiale")
    private Integer anneeInitiale;
    
    @Column(
    name = "decompte",
    precision = 18,
    scale = 2
    )
    private BigDecimal decompte;

    /**
     * Matériel actif ou non.
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean actif = true;
}