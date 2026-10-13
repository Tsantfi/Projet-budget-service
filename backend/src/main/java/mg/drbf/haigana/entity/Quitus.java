package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
    name = "quitus",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_quitus_numero",
            columnNames = "numero_quitus"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quitus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Année du recensement.
     */
    @Column(
        name = "annee_recensement",
        nullable = false
    )
    private Integer anneeRecensement;

    /**
     * Ministère saisi lors de la génération.
     */
    @Column(
        name = "ministere",
        nullable = false,
        length = 255
    )
    private String ministere;

    /**
     * Direction ou service.
     */
    @Column(
        name = "direction_service",
        nullable = false,
        length = 255
    )
    private String directionService;

    /**
     * Nombre réel de véhicules concernés.
     */
    @Column(
        name = "nombre_vehicules",
        nullable = false
    )
    private Integer nombreVehicules;

    /**
     * Date de création du quitus.
     */
    @Column(
        name = "date_creation",
        nullable = false
    )
    private LocalDate dateCreation;

    /**
     * Direction régionale apparaissant
     * sur le document.
     */
    @Column(
        name = "direction_regionale",
        nullable = false,
        length = 255
    )
    private String directionRegionale;
}
