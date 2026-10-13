package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "nomenclature",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_nomenclature_numero",
            columnNames = "numero"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Nomenclature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Numéro de nomenclature : 3, 5, 10, etc.
     */
    @Column(nullable = false)
    private Integer numero;

    /**
     * Désignation de la nomenclature.
     */
    @Column(nullable = false, length = 150)
    private String designation;

    @Builder.Default
    @Column(nullable = false)
    private Boolean actif = true;
}