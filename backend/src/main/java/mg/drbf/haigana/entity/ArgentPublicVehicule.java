package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "argent_public_vehicule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArgentPublicVehicule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Montant total alloué aux véhicules.
     */
    @Column(name = "montant_total", nullable = false)
    @Builder.Default
    private Double montantTotal = 0.0;

    /**
     * Montant déjà utilisé pour les paiements
     * des bons de commande des véhicules.
     */
    @Column(name = "montant_utilise", nullable = false)
    @Builder.Default
    private Double montantUtilise = 0.0;

    /**
     * Solde actuellement disponible.
     *
     * montantDisponible = montantTotal - montantUtilise
     */
    @Column(name = "montant_disponible", nullable = false)
    @Builder.Default
    private Double montantDisponible = 0.0;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}