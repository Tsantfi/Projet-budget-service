package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "bon_commande")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BonCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private Double prixTotal;

    private LocalDate dateBon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proces_verbal_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ProcesVerbal procesVerbal;

    /*
     * Le Code SOA sert uniquement à rattacher
     * administrativement le bon de commande
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soa_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private SoaCode codeSoa;

    /*
     * Année du bon.
     */
    private Integer annee;

    /*
     * Statut du paiement.
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutPaiement statut = StatutPaiement.NON_PAYE;

    /*
     * Livret auquel appartient le bon.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livret_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livret livret;

    /*
     * Source financière utilisée pour le paiement.
     *
     * Cette source est exclusivement destinée aux véhicules.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "argent_public_vehicule_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ArgentPublicVehicule argentPublicVehicule;
}