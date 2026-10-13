package mg.drbf.haigana.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "condamnation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Condamnation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private LocalDate dateCondamnation;
    private String lieuCondamnation;
    
    @Column(name = "piece")
    private String piece;

    // HISTORIQUE

    @Column(name = "immatricule_vehicule", nullable = false)
    private String immatriculeVehicule;

    // SORTIE

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(
            name = "sortie_id",
            nullable = true
    )
    private Sortie sortie;
}