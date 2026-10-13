package mg.drbf.haigana.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reparation")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder
public class Reparation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private LocalDate dateReparation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    // Sécurise la sérialisation JSON pour le véhicule obligatoire
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mecanicien_id")
    // Sécurise la sérialisation JSON si le mécanicien est présent
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Mecanicien mecanicien;

    @Column(name = "piece_justificative_url")
    private String pieceJustificativeUrl;
}
