package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
name = "recensement_vehicule",
uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_recensement_vehicule_origine",
                columnNames = {
                        "recensement_id",
                        "vehicule_id_origine"
                }
        )
}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecensementVehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codeSoa;

    private String immatriculation;

    private String marque;

    private String type;

    private String genre;

    private String sourceEnergie;

    private String categorie;

    private Integer anneeMiseCirculation;

    private String etatGeneral;

    private Boolean carteGriseDisponible;

    private String detenteurEffectif;

    /**
     * Véhicule encore présent dans le SOA.
     */
    @Builder.Default
    private Boolean actif = true;

    /**
     * Statut de comparaison.
     *
     * IDENTIQUE
     * MODIFIE
     * NOUVEAU
     * ABSENT
     */
    private String statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "recensement_id",
            nullable = false
    )
    private Recensement recensement;

    /**
     * Référence vers le véhicule actuel.
     *
     * Peut être null lorsque le véhicule n'existe plus
     * dans la base actuelle.
     */
    @Column(name = "vehicule_id_origine")
    private Long vehiculeIdOrigine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    private Vehicule vehicule;

    @Builder.Default
    @Transient
    private List<String> champsModifies =
            new ArrayList<>();
}